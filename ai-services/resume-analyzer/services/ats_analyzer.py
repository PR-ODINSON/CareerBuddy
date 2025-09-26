import re
import logging
from typing import Dict, List, Any
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

from models.analysis_models import ATSScore, ParsedResumeData

logger = logging.getLogger(__name__)

class ATSAnalyzer:
    def __init__(self):
        self.ats_keywords = [
            'experience', 'skills', 'education', 'responsibilities', 'achievements',
            'results', 'managed', 'developed', 'implemented', 'created', 'improved',
            'increased', 'decreased', 'led', 'coordinated', 'collaborated'
        ]
        
        self.formatting_issues = {
            'tables': r'<table|<tr|<td',
            'graphics': r'<img|<svg',
            'columns': r'│|┌|┐|└|┘',
            'special_chars': r'[^\w\s\.\,\-\@\(\)\+\%\$\#]',
            'long_lines': 100  # characters per line
        }

    async def initialize(self):
        """Initialize ATS analyzer"""
        logger.info("ATS Analyzer initialized")

    async def analyze_ats_compatibility(self, parsed_data: ParsedResumeData) -> ATSScore:
        """Analyze ATS compatibility of parsed resume data"""
        try:
            # Analyze different aspects
            formatting_score = self._analyze_formatting(parsed_data.raw_text)
            keyword_score = self._analyze_keywords(parsed_data)
            content_score = self._analyze_content_structure(parsed_data)
            readability_score = self._analyze_readability(parsed_data.raw_text)
            
            # Calculate overall score (weighted average)
            overall_score = int(
                formatting_score * 0.25 +
                keyword_score * 0.30 +
                content_score * 0.25 +
                readability_score * 0.20
            )
            
            return ATSScore(
                overall_score=overall_score,
                formatting_score=formatting_score,
                keyword_score=keyword_score,
                content_score=content_score,
                readability_score=readability_score,
                details={
                    'formatting_issues': self._get_formatting_issues(parsed_data.raw_text),
                    'keyword_analysis': self._get_keyword_analysis(parsed_data),
                    'content_analysis': self._get_content_analysis(parsed_data),
                    'readability_metrics': self._get_readability_metrics(parsed_data.raw_text)
                }
            )
            
        except Exception as e:
            logger.error(f"Failed to analyze ATS compatibility: {e}")
            raise

    async def optimize_keywords(self, resume_content: str, job_description: str) -> Dict[str, Any]:
        """Optimize keywords based on job description"""
        try:
            # Extract keywords from job description
            job_keywords = self._extract_job_keywords(job_description)
            
            # Analyze current keyword usage in resume
            resume_keywords = self._extract_resume_keywords(resume_content)
            
            # Find missing keywords
            missing_keywords = [kw for kw in job_keywords if kw.lower() not in resume_content.lower()]
            
            # Calculate keyword frequency
            keyword_frequency = {}
            for keyword in job_keywords:
                count = len(re.findall(r'\b' + re.escape(keyword) + r'\b', resume_content, re.IGNORECASE))
                keyword_frequency[keyword] = count
            
            # Generate optimization suggestions
            suggestions = self._generate_keyword_suggestions(missing_keywords, keyword_frequency)
            
            # Suggest optimized sections
            optimized_sections = self._suggest_section_optimizations(
                resume_content, missing_keywords
            )
            
            return {
                'missing_keywords': missing_keywords,
                'keyword_frequency': keyword_frequency,
                'suggestions': suggestions,
                'optimized_sections': optimized_sections,
                'keyword_match_score': self._calculate_keyword_match_score(
                    resume_keywords, job_keywords
                )
            }
            
        except Exception as e:
            logger.error(f"Failed to optimize keywords: {e}")
            raise

    def _analyze_formatting(self, text: str) -> int:
        """Analyze formatting for ATS compatibility"""
        score = 100
        issues = []
        
        # Check for tables
        if re.search(self.formatting_issues['tables'], text, re.IGNORECASE):
            score -= 20
            issues.append("Contains tables")
        
        # Check for graphics/images
        if re.search(self.formatting_issues['graphics'], text, re.IGNORECASE):
            score -= 15
            issues.append("Contains graphics")
        
        # Check for columns
        if re.search(self.formatting_issues['columns'], text):
            score -= 15
            issues.append("Contains column formatting")
        
        # Check for excessive special characters
        special_char_count = len(re.findall(self.formatting_issues['special_chars'], text))
        if special_char_count > len(text) * 0.05:  # More than 5% special chars
            score -= 10
            issues.append("Too many special characters")
        
        # Check line length
        lines = text.split('\n')
        long_lines = [line for line in lines if len(line) > self.formatting_issues['long_lines']]
        if len(long_lines) > len(lines) * 0.3:  # More than 30% long lines
            score -= 10
            issues.append("Lines too long")
        
        return max(0, score)

    def _analyze_keywords(self, parsed_data: ParsedResumeData) -> int:
        """Analyze keyword usage"""
        text = parsed_data.raw_text.lower()
        keyword_count = 0
        
        # Count ATS-friendly keywords
        for keyword in self.ats_keywords:
            if keyword in text:
                keyword_count += 1
        
        # Calculate score based on keyword presence
        score = min(100, (keyword_count / len(self.ats_keywords)) * 100)
        
        # Bonus for having skills section
        if parsed_data.skills:
            score += 10
        
        # Bonus for quantified achievements
        numbers = re.findall(r'\d+(?:\.\d+)?%?', parsed_data.raw_text)
        if len(numbers) >= 3:
            score += 10
        
        return min(100, int(score))

    def _analyze_content_structure(self, parsed_data: ParsedResumeData) -> int:
        """Analyze content structure"""
        score = 0
        
        # Check for essential sections
        if parsed_data.contact_info.email:
            score += 20
        if parsed_data.contact_info.phone:
            score += 10
        if parsed_data.experience:
            score += 25
        if parsed_data.education:
            score += 20
        if parsed_data.skills:
            score += 25
        
        # Check for good experience descriptions
        for exp in parsed_data.experience:
            if len(exp.description) >= 2:  # At least 2 bullet points
                score += 5
        
        return min(100, score)

    def _analyze_readability(self, text: str) -> int:
        """Analyze text readability"""
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        
        if not words or not sentences:
            return 0
        
        # Calculate basic readability metrics
        avg_words_per_sentence = len(words) / len(sentences)
        avg_chars_per_word = sum(len(word) for word in words) / len(words)
        
        # Score based on readability (simpler is better for ATS)
        score = 100
        
        if avg_words_per_sentence > 25:  # Too complex
            score -= 20
        elif avg_words_per_sentence < 8:  # Too simple
            score -= 10
        
        if avg_chars_per_word > 6:  # Too complex words
            score -= 15
        
        return max(0, score)

    def _get_formatting_issues(self, text: str) -> List[str]:
        """Get detailed formatting issues"""
        issues = []
        
        if re.search(self.formatting_issues['tables'], text, re.IGNORECASE):
            issues.append("Document contains tables that may not parse correctly")
        
        if re.search(self.formatting_issues['graphics'], text, re.IGNORECASE):
            issues.append("Document contains graphics that ATS cannot read")
        
        if re.search(self.formatting_issues['columns'], text):
            issues.append("Multi-column layout may cause parsing issues")
        
        return issues

    def _get_keyword_analysis(self, parsed_data: ParsedResumeData) -> Dict[str, Any]:
        """Get keyword analysis details"""
        text = parsed_data.raw_text.lower()
        
        found_keywords = []
        missing_keywords = []
        
        for keyword in self.ats_keywords:
            if keyword in text:
                found_keywords.append(keyword)
            else:
                missing_keywords.append(keyword)
        
        return {
            'found_keywords': found_keywords,
            'missing_keywords': missing_keywords,
            'keyword_density': len(found_keywords) / len(self.ats_keywords),
            'action_verbs_count': len([kw for kw in found_keywords if kw in [
                'managed', 'developed', 'implemented', 'created', 'improved',
                'increased', 'decreased', 'led', 'coordinated', 'collaborated'
            ]])
        }

    def _get_content_analysis(self, parsed_data: ParsedResumeData) -> Dict[str, Any]:
        """Get content structure analysis"""
        return {
            'has_contact_info': bool(parsed_data.contact_info.email),
            'experience_count': len(parsed_data.experience),
            'education_count': len(parsed_data.education),
            'skills_count': len(parsed_data.skills),
            'has_summary': bool(parsed_data.summary),
            'quantified_achievements': len(re.findall(r'\d+(?:\.\d+)?%?', parsed_data.raw_text))
        }

    def _get_readability_metrics(self, text: str) -> Dict[str, Any]:
        """Get readability metrics"""
        words = text.split()
        sentences = re.split(r'[.!?]+', text)
        
        if not words or not sentences:
            return {}
        
        return {
            'word_count': len(words),
            'sentence_count': len(sentences),
            'avg_words_per_sentence': len(words) / len(sentences),
            'avg_chars_per_word': sum(len(word) for word in words) / len(words),
            'complex_words': len([word for word in words if len(word) > 6])
        }

    def _extract_job_keywords(self, job_description: str) -> List[str]:
        """Extract important keywords from job description"""
        # Common stop words to ignore
        stop_words = {
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
            'before', 'after', 'above', 'below', 'over', 'under', 'again', 'further',
            'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all',
            'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
            'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
            'can', 'will', 'just', 'should', 'now'
        }
        
        # Extract words and phrases
        words = re.findall(r'\b[a-zA-Z]{3,}\b', job_description.lower())
        keywords = [word for word in words if word not in stop_words]
        
        # Get most frequent keywords
        word_freq = Counter(keywords)
        return [word for word, freq in word_freq.most_common(20)]

    def _extract_resume_keywords(self, resume_content: str) -> List[str]:
        """Extract keywords from resume content"""
        words = re.findall(r'\b[a-zA-Z]{3,}\b', resume_content.lower())
        word_freq = Counter(words)
        return [word for word, freq in word_freq.most_common(30)]

    def _calculate_keyword_match_score(self, resume_keywords: List[str], job_keywords: List[str]) -> float:
        """Calculate keyword match score between resume and job description"""
        if not job_keywords:
            return 0.0
        
        matches = len(set(resume_keywords) & set(job_keywords))
        return (matches / len(job_keywords)) * 100

    def _generate_keyword_suggestions(self, missing_keywords: List[str], keyword_frequency: Dict[str, int]) -> List[str]:
        """Generate keyword optimization suggestions"""
        suggestions = []
        
        if missing_keywords:
            suggestions.append(f"Consider adding these missing keywords: {', '.join(missing_keywords[:5])}")
        
        low_freq_keywords = [kw for kw, freq in keyword_frequency.items() if freq < 2]
        if low_freq_keywords:
            suggestions.append(f"Increase frequency of these keywords: {', '.join(low_freq_keywords[:3])}")
        
        if len(missing_keywords) > 10:
            suggestions.append("Consider restructuring your resume to include more relevant keywords")
        
        return suggestions

    def _suggest_section_optimizations(self, resume_content: str, missing_keywords: List[str]) -> Dict[str, str]:
        """Suggest optimizations for specific resume sections"""
        optimizations = {}
        
        if missing_keywords:
            # Suggest skills section optimization
            if 'skills' in resume_content.lower():
                optimizations['Skills'] = f"Add these relevant skills: {', '.join(missing_keywords[:5])}"
            
            # Suggest experience optimization
            if 'experience' in resume_content.lower():
                optimizations['Experience'] = f"Incorporate keywords like '{missing_keywords[0]}' and '{missing_keywords[1] if len(missing_keywords) > 1 else missing_keywords[0]}' into your job descriptions"
        
        return optimizations
