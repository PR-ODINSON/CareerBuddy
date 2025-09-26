import re
import nltk
import spacy
import logging
from typing import List, Dict, Any, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from collections import Counter
import numpy as np

from models.matching_models import (
    UserProfile,
    JobListing,
    JobMatchResponse,
    MatchPreferences,
    MatchReason,
    ExperienceLevel
)

logger = logging.getLogger(__name__)

class JobMatcher:
    def __init__(self):
        self.nlp = None
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        self.experience_levels = {
            ExperienceLevel.ENTRY: 0,
            ExperienceLevel.JUNIOR: 1,
            ExperienceLevel.MID: 2,
            ExperienceLevel.SENIOR: 3,
            ExperienceLevel.LEAD: 4,
            ExperienceLevel.EXECUTIVE: 5
        }

    async def initialize(self):
        """Initialize the job matcher with required models"""
        try:
            # Download required NLTK data
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            
            # Load spaCy model
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                logger.warning("spaCy model not found. Install with: python -m spacy download en_core_web_sm")
                self.nlp = None
                
            logger.info("Job Matcher initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Job Matcher: {e}")

    async def find_matching_jobs(
        self,
        user_profile: UserProfile,
        jobs: List[JobListing],
        preferences: MatchPreferences = None
    ) -> List[JobMatchResponse]:
        """Find and rank matching jobs for a user profile"""
        
        if preferences is None:
            preferences = MatchPreferences()
        
        matches = []
        
        for job in jobs:
            match_score, match_reasons, skills_analysis = await self._calculate_job_match(
                user_profile, job, preferences
            )
            
            if match_score >= preferences.min_match_score:
                recommendation_strength = self._determine_recommendation_strength(match_score)
                
                matches.append(JobMatchResponse(
                    job=job,
                    match_score=match_score,
                    match_percentage=int(match_score * 100),
                    match_reasons=match_reasons,
                    skills_match=skills_analysis['skills_match'],
                    missing_skills=skills_analysis['missing_skills'],
                    recommendation_strength=recommendation_strength
                ))
        
        # Sort by match score (highest first)
        matches.sort(key=lambda x: x.match_score, reverse=True)
        
        return matches

    async def _calculate_job_match(
        self,
        user_profile: UserProfile,
        job: JobListing,
        preferences: MatchPreferences
    ) -> Tuple[float, List[MatchReason], Dict[str, Any]]:
        """Calculate match score between user profile and job"""
        
        match_reasons = []
        
        # 1. Skills matching
        skills_score, skills_analysis = self._calculate_skills_match(
            user_profile.skills, job.skills_required
        )
        match_reasons.append(MatchReason(
            category="skills",
            score=skills_score,
            explanation=f"Skills match: {int(skills_score * 100)}% - {len(skills_analysis['matching_skills'])} matching skills"
        ))
        
        # 2. Experience level matching
        experience_score = self._calculate_experience_match(
            user_profile.experience_level, job.experience_level
        )
        match_reasons.append(MatchReason(
            category="experience",
            score=experience_score,
            explanation=f"Experience level match: {int(experience_score * 100)}%"
        ))
        
        # 3. Location matching
        location_score = self._calculate_location_match(
            user_profile.location_preferences, job.location, job.location_type
        )
        match_reasons.append(MatchReason(
            category="location",
            score=location_score,
            explanation=f"Location preference match: {int(location_score * 100)}%"
        ))
        
        # 4. Salary matching
        salary_score = self._calculate_salary_match(
            user_profile.salary_expectation, job.salary_min, job.salary_max
        )
        match_reasons.append(MatchReason(
            category="salary",
            score=salary_score,
            explanation=f"Salary expectation match: {int(salary_score * 100)}%"
        ))
        
        # 5. Industry matching
        industry_score = self._calculate_industry_match(
            user_profile.preferred_industries, job.industry
        )
        match_reasons.append(MatchReason(
            category="industry",
            score=industry_score,
            explanation=f"Industry preference match: {int(industry_score * 100)}%"
        ))
        
        # Calculate weighted total score
        total_score = (
            skills_score * preferences.weight_skills +
            experience_score * preferences.weight_experience +
            location_score * preferences.weight_location +
            salary_score * preferences.weight_salary +
            industry_score * preferences.weight_industry
        )
        
        return total_score, match_reasons, skills_analysis

    def _calculate_skills_match(self, user_skills: List[str], job_skills: List[str]) -> Tuple[float, Dict[str, Any]]:
        """Calculate skills matching score"""
        if not job_skills:
            return 1.0, {'matching_skills': [], 'missing_skills': [], 'skill_coverage': 1.0}
        
        # Normalize skills (lowercase)
        user_skills_norm = [skill.lower().strip() for skill in user_skills]
        job_skills_norm = [skill.lower().strip() for skill in job_skills]
        
        # Find matching skills
        matching_skills = []
        for job_skill in job_skills_norm:
            for user_skill in user_skills_norm:
                if self._skills_similar(job_skill, user_skill):
                    matching_skills.append(job_skill)
                    break
        
        # Calculate coverage
        skill_coverage = len(matching_skills) / len(job_skills_norm) if job_skills_norm else 0
        
        # Find missing skills
        missing_skills = [skill for skill in job_skills_norm if skill not in [s.lower() for s in matching_skills]]
        
        return skill_coverage, {
            'matching_skills': matching_skills,
            'missing_skills': missing_skills,
            'skill_coverage': skill_coverage
        }

    def _skills_similar(self, skill1: str, skill2: str) -> bool:
        """Check if two skills are similar"""
        # Exact match
        if skill1 == skill2:
            return True
        
        # Substring match
        if skill1 in skill2 or skill2 in skill1:
            return True
        
        # Check for common skill variations
        skill_mappings = {
            'js': 'javascript',
            'nodejs': 'node.js',
            'reactjs': 'react',
            'python': 'python3',
            'ml': 'machine learning',
            'ai': 'artificial intelligence'
        }
        
        skill1_mapped = skill_mappings.get(skill1, skill1)
        skill2_mapped = skill_mappings.get(skill2, skill2)
        
        return skill1_mapped == skill2_mapped or skill1_mapped == skill2 or skill2_mapped == skill1

    def _calculate_experience_match(self, user_level: ExperienceLevel, job_level: ExperienceLevel) -> float:
        """Calculate experience level matching score"""
        user_level_num = self.experience_levels[user_level]
        job_level_num = self.experience_levels[job_level]
        
        # Exact match
        if user_level_num == job_level_num:
            return 1.0
        
        # Calculate penalty based on difference
        diff = abs(user_level_num - job_level_num)
        
        if diff == 1:
            return 0.8  # Close match
        elif diff == 2:
            return 0.6  # Moderate match
        else:
            return 0.3  # Poor match

    def _calculate_location_match(self, user_preferences: List[str], job_location: str, job_location_type) -> float:
        """Calculate location matching score"""
        if not user_preferences:
            return 1.0  # No preference means any location is fine
        
        # Remote work preference
        if 'remote' in [pref.lower() for pref in user_preferences]:
            if job_location_type.value == 'remote':
                return 1.0
            elif job_location_type.value == 'hybrid':
                return 0.8
            else:
                return 0.3
        
        # Check if job location matches any user preference
        for preference in user_preferences:
            if preference.lower() in job_location.lower():
                return 1.0
        
        return 0.2  # Poor location match

    def _calculate_salary_match(self, user_expectation: int, job_min: int, job_max: int) -> float:
        """Calculate salary matching score"""
        if not user_expectation:
            return 1.0  # No expectation means any salary is fine
        
        if not job_min and not job_max:
            return 0.7  # Job doesn't specify salary
        
        # If job has salary range
        if job_min and job_max:
            if job_min <= user_expectation <= job_max:
                return 1.0  # Perfect match
            elif user_expectation < job_min:
                # Job pays more than expected (good!)
                return 1.0
            else:
                # Job pays less than expected
                ratio = job_max / user_expectation
                return max(0.0, ratio)
        
        # If only one salary value is available
        available_salary = job_max or job_min
        if available_salary >= user_expectation:
            return 1.0
        else:
            ratio = available_salary / user_expectation
            return max(0.0, ratio)

    def _calculate_industry_match(self, user_industries: List[str], job_industry: str) -> float:
        """Calculate industry matching score"""
        if not user_industries:
            return 1.0  # No preference means any industry is fine
        
        if not job_industry:
            return 0.7  # Job doesn't specify industry
        
        # Check for exact or partial match
        for user_industry in user_industries:
            if user_industry.lower() in job_industry.lower() or job_industry.lower() in user_industry.lower():
                return 1.0
        
        return 0.2  # Poor industry match

    def _determine_recommendation_strength(self, match_score: float) -> str:
        """Determine recommendation strength based on match score"""
        if match_score >= 0.9:
            return "excellent"
        elif match_score >= 0.8:
            return "strong"
        elif match_score >= 0.6:
            return "moderate"
        else:
            return "weak"

    async def analyze_skills_gap(self, user_skills: List[str], job_requirements: List[str]) -> Dict[str, Any]:
        """Analyze skills gap between user and job requirements"""
        user_skills_norm = [skill.lower().strip() for skill in user_skills]
        job_skills_norm = [skill.lower().strip() for skill in job_requirements]
        
        # Find matching and missing skills
        matching_skills = []
        missing_skills = []
        
        for job_skill in job_skills_norm:
            found = False
            for user_skill in user_skills_norm:
                if self._skills_similar(job_skill, user_skill):
                    matching_skills.append(job_skill)
                    found = True
                    break
            if not found:
                missing_skills.append(job_skill)
        
        # Categorize skills
        skill_categories = self._categorize_skills(missing_skills)
        
        # Calculate gap score
        gap_score = len(matching_skills) / len(job_skills_norm) if job_skills_norm else 1.0
        
        # Generate suggestions
        suggestions = self._generate_skill_suggestions(missing_skills, skill_categories)
        
        return {
            'matching_skills': matching_skills,
            'missing_skills': missing_skills,
            'skill_categories': skill_categories,
            'gap_score': gap_score,
            'suggestions': suggestions
        }

    def _categorize_skills(self, skills: List[str]) -> Dict[str, List[str]]:
        """Categorize skills into different types"""
        categories = {
            'programming': [],
            'frameworks': [],
            'databases': [],
            'cloud': [],
            'soft_skills': [],
            'certifications': [],
            'other': []
        }
        
        for skill in skills:
            skill_lower = skill.lower()
            
            if any(lang in skill_lower for lang in ['python', 'java', 'javascript', 'c++', 'c#', 'php', 'ruby', 'go']):
                categories['programming'].append(skill)
            elif any(fw in skill_lower for fw in ['react', 'angular', 'vue', 'django', 'flask', 'spring', 'express']):
                categories['frameworks'].append(skill)
            elif any(db in skill_lower for db in ['sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'oracle']):
                categories['databases'].append(skill)
            elif any(cloud in skill_lower for cloud in ['aws', 'azure', 'gcp', 'docker', 'kubernetes']):
                categories['cloud'].append(skill)
            elif any(soft in skill_lower for soft in ['leadership', 'communication', 'teamwork', 'management']):
                categories['soft_skills'].append(skill)
            elif any(cert in skill_lower for cert in ['certified', 'certification', 'pmp', 'scrum']):
                categories['certifications'].append(skill)
            else:
                categories['other'].append(skill)
        
        return {k: v for k, v in categories.items() if v}  # Remove empty categories

    def _generate_skill_suggestions(self, missing_skills: List[str], skill_categories: Dict[str, List[str]]) -> List[str]:
        """Generate suggestions for acquiring missing skills"""
        suggestions = []
        
        if 'programming' in skill_categories:
            suggestions.append("Consider taking online courses for programming languages like Codecademy or freeCodeCamp")
        
        if 'frameworks' in skill_categories:
            suggestions.append("Learn popular frameworks through official documentation and tutorials")
        
        if 'cloud' in skill_categories:
            suggestions.append("Get cloud certifications from AWS, Azure, or Google Cloud Platform")
        
        if 'certifications' in skill_categories:
            suggestions.append("Pursue relevant professional certifications in your field")
        
        if len(missing_skills) > 5:
            suggestions.append("Focus on the most important skills first - prioritize based on job frequency")
        
        return suggestions

    async def calculate_job_similarity(self, job1_description: str, job2_description: str) -> float:
        """Calculate similarity between two job descriptions"""
        try:
            # Prepare text for vectorization
            documents = [job1_description, job2_description]
            
            # Create TF-IDF vectors
            tfidf_matrix = self.vectorizer.fit_transform(documents)
            
            # Calculate cosine similarity
            similarity_matrix = cosine_similarity(tfidf_matrix)
            
            return float(similarity_matrix[0][1])
            
        except Exception as e:
            logger.error(f"Failed to calculate job similarity: {e}")
            return 0.0
