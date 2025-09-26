import re
import io
import nltk
import spacy
from typing import Dict, List, Any, Optional
from PyPDF2 import PdfReader
from docx import Document
import logging

from models.analysis_models import (
    ParsedResumeData,
    ContactInfo,
    Education,
    Experience
)

logger = logging.getLogger(__name__)

class ResumeParser:
    def __init__(self):
        self.nlp = None
        self.skills_keywords = {
            'technical': [
                'python', 'javascript', 'java', 'c++', 'c#', 'react', 'angular', 'vue',
                'node.js', 'express', 'django', 'flask', 'spring', 'html', 'css',
                'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'docker', 'kubernetes',
                'aws', 'azure', 'gcp', 'git', 'jenkins', 'tensorflow', 'pytorch',
                'machine learning', 'data science', 'ai', 'blockchain', 'microservices'
            ],
            'soft': [
                'leadership', 'communication', 'teamwork', 'problem solving',
                'critical thinking', 'creativity', 'adaptability', 'time management',
                'project management', 'collaboration', 'analytical', 'detail-oriented'
            ],
            'tools': [
                'excel', 'powerpoint', 'word', 'photoshop', 'illustrator',
                'figma', 'sketch', 'jira', 'confluence', 'slack', 'trello',
                'tableau', 'power bi', 'salesforce', 'hubspot'
            ]
        }

    async def initialize(self):
        """Initialize NLP models and download required data"""
        try:
            # Download required NLTK data
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
            nltk.download('wordnet', quiet=True)
            
            # Load spaCy model
            try:
                self.nlp = spacy.load("en_core_web_sm")
            except OSError:
                logger.warning("spaCy model not found. Please install: python -m spacy download en_core_web_sm")
                self.nlp = None
                
        except Exception as e:
            logger.error(f"Failed to initialize NLP models: {e}")

    async def parse_resume(self, file_content: bytes, filename: str) -> ParsedResumeData:
        """Parse resume from file content"""
        try:
            # Extract text based on file type
            if filename.lower().endswith('.pdf'):
                text = self._extract_pdf_text(file_content)
            elif filename.lower().endswith('.docx'):
                text = self._extract_docx_text(file_content)
            elif filename.lower().endswith('.txt'):
                text = file_content.decode('utf-8')
            else:
                raise ValueError("Unsupported file format")

            return await self.parse_text(text)
            
        except Exception as e:
            logger.error(f"Failed to parse resume: {e}")
            raise

    async def parse_text(self, text: str) -> ParsedResumeData:
        """Parse resume from text content"""
        try:
            # Clean and normalize text
            cleaned_text = self._clean_text(text)
            
            # Extract different sections
            contact_info = self._extract_contact_info(cleaned_text)
            summary = self._extract_summary(cleaned_text)
            education = self._extract_education(cleaned_text)
            experience = self._extract_experience(cleaned_text)
            skills = self._extract_skills_from_text(cleaned_text)
            certifications = self._extract_certifications(cleaned_text)
            languages = self._extract_languages(cleaned_text)
            projects = self._extract_projects(cleaned_text)
            awards = self._extract_awards(cleaned_text)

            return ParsedResumeData(
                contact_info=contact_info,
                summary=summary,
                education=education,
                experience=experience,
                skills=skills,
                certifications=certifications,
                languages=languages,
                projects=projects,
                awards=awards,
                raw_text=text
            )
            
        except Exception as e:
            logger.error(f"Failed to parse text: {e}")
            raise

    async def extract_skills(self, text: str) -> Dict[str, List[str]]:
        """Extract categorized skills from text"""
        skills = {
            'technical': [],
            'soft': [],
            'languages': [],
            'certifications': [],
            'tools': []
        }
        
        text_lower = text.lower()
        
        # Extract technical skills
        for skill in self.skills_keywords['technical']:
            if skill.lower() in text_lower:
                skills['technical'].append(skill)
        
        # Extract soft skills
        for skill in self.skills_keywords['soft']:
            if skill.lower() in text_lower:
                skills['soft'].append(skill)
                
        # Extract tools
        for tool in self.skills_keywords['tools']:
            if tool.lower() in text_lower:
                skills['tools'].append(tool)
        
        # Extract programming languages
        prog_languages = ['python', 'javascript', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift']
        for lang in prog_languages:
            if lang.lower() in text_lower:
                skills['languages'].append(lang)
        
        return skills

    def _extract_pdf_text(self, content: bytes) -> str:
        """Extract text from PDF content"""
        try:
            pdf_file = io.BytesIO(content)
            reader = PdfReader(pdf_file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text
        except Exception as e:
            logger.error(f"Failed to extract PDF text: {e}")
            return ""

    def _extract_docx_text(self, content: bytes) -> str:
        """Extract text from DOCX content"""
        try:
            doc_file = io.BytesIO(content)
            doc = Document(doc_file)
            text = ""
            for paragraph in doc.paragraphs:
                text += paragraph.text + "\n"
            return text
        except Exception as e:
            logger.error(f"Failed to extract DOCX text: {e}")
            return ""

    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\.\,\-\@\(\)\+]', '', text)
        return text.strip()

    def _extract_contact_info(self, text: str) -> ContactInfo:
        """Extract contact information from text"""
        contact = ContactInfo()
        
        # Email pattern
        email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        email_match = re.search(email_pattern, text)
        if email_match:
            contact.email = email_match.group()

        # Phone pattern
        phone_pattern = r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}'
        phone_match = re.search(phone_pattern, text)
        if phone_match:
            contact.phone = phone_match.group()

        # LinkedIn pattern
        linkedin_pattern = r'linkedin\.com/in/[\w-]+'
        linkedin_match = re.search(linkedin_pattern, text, re.IGNORECASE)
        if linkedin_match:
            contact.linkedin = linkedin_match.group()

        # GitHub pattern
        github_pattern = r'github\.com/[\w-]+'
        github_match = re.search(github_pattern, text, re.IGNORECASE)
        if github_match:
            contact.github = github_match.group()

        # Extract name (first few words, excluding common resume words)
        lines = text.split('\n')
        for line in lines[:5]:  # Check first 5 lines
            line = line.strip()
            if line and not any(word in line.lower() for word in ['resume', 'cv', 'email', 'phone', '@']):
                if len(line.split()) <= 4:  # Name shouldn't be too long
                    contact.name = line
                    break

        return contact

    def _extract_summary(self, text: str) -> Optional[str]:
        """Extract professional summary or objective"""
        summary_patterns = [
            r'(?:SUMMARY|PROFILE|OBJECTIVE|ABOUT)\s*:?\s*(.*?)(?=\n[A-Z]|\n\n|\Z)',
            r'(?:Professional Summary|Career Objective)\s*:?\s*(.*?)(?=\n[A-Z]|\n\n|\Z)'
        ]
        
        for pattern in summary_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                summary = match.group(1).strip()
                if len(summary) > 20:  # Ensure it's substantial
                    return summary
        
        return None

    def _extract_education(self, text: str) -> List[Education]:
        """Extract education information"""
        education_list = []
        
        # Common degree patterns
        degree_patterns = [
            r'(Bachelor|Master|PhD|MBA|B\.S\.|M\.S\.|B\.A\.|M\.A\.|B\.Tech|M\.Tech)[\s\.]*([^\n]+)',
            r'(BS|MS|BA|MA|BSc|MSc)[\s\.]*([^\n]+)'
        ]
        
        for pattern in degree_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                degree = match.group(1)
                field = match.group(2).strip()
                
                # Extract year if present
                year_match = re.search(r'(19|20)\d{2}', field)
                year = int(year_match.group()) if year_match else None
                
                # Extract institution name (simplified)
                lines = text.split('\n')
                for i, line in enumerate(lines):
                    if match.group() in line and i > 0:
                        potential_institution = lines[i-1].strip()
                        if len(potential_institution) > 5:
                            education_list.append(Education(
                                institution=potential_institution,
                                degree=degree,
                                field_of_study=field,
                                graduation_year=year
                            ))
                            break
        
        return education_list

    def _extract_experience(self, text: str) -> List[Experience]:
        """Extract work experience"""
        experience_list = []
        
        # Look for experience sections
        exp_sections = re.split(r'\n(?=\b(?:EXPERIENCE|WORK|EMPLOYMENT|CAREER)\b)', text, flags=re.IGNORECASE)
        
        if len(exp_sections) > 1:
            exp_text = exp_sections[1]
            
            # Split by job entries (look for company/title patterns)
            job_entries = re.split(r'\n(?=[A-Z][^a-z]*(?:LLC|Inc|Corp|Company|Ltd|\d{4}))', exp_text)
            
            for entry in job_entries:
                if len(entry.strip()) > 20:  # Substantial content
                    lines = entry.strip().split('\n')
                    if len(lines) >= 2:
                        # First line usually contains company and position
                        first_line = lines[0].strip()
                        
                        # Extract company and position (simplified)
                        company = first_line
                        position = lines[1].strip() if len(lines) > 1 else ""
                        
                        # Extract dates
                        date_pattern = r'((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{1,2})[^\d]*\d{4})'
                        dates = re.findall(date_pattern, entry, re.IGNORECASE)
                        
                        start_date = dates[0] if dates else None
                        end_date = dates[1] if len(dates) > 1 else None
                        
                        # Extract description (remaining lines)
                        description = [line.strip() for line in lines[2:] if line.strip()]
                        
                        experience_list.append(Experience(
                            company=company,
                            position=position,
                            start_date=start_date,
                            end_date=end_date,
                            description=description
                        ))
        
        return experience_list

    def _extract_skills_from_text(self, text: str) -> List[str]:
        """Extract skills from text"""
        skills = []
        text_lower = text.lower()
        
        # Extract from all skill categories
        for category in self.skills_keywords.values():
            for skill in category:
                if skill.lower() in text_lower:
                    skills.append(skill)
        
        # Remove duplicates and return
        return list(set(skills))

    def _extract_certifications(self, text: str) -> List[str]:
        """Extract certifications"""
        cert_patterns = [
            r'(AWS|Azure|Google Cloud|Microsoft|Oracle|Cisco|CompTIA|PMP|Scrum Master)[\s\w]*(?:Certified|Certification)',
            r'(?:Certified|Certification)[\s\w]*(?:AWS|Azure|Google|Microsoft|Oracle|Cisco|CompTIA|PMP|Scrum)'
        ]
        
        certifications = []
        for pattern in cert_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                certifications.append(match.group().strip())
        
        return certifications

    def _extract_languages(self, text: str) -> List[str]:
        """Extract programming and spoken languages"""
        languages = []
        
        # Programming languages
        prog_langs = ['Python', 'JavaScript', 'Java', 'C++', 'C#', 'PHP', 'Ruby', 'Go', 'Swift', 'Kotlin']
        
        # Spoken languages
        spoken_langs = ['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Korean', 'Portuguese']
        
        text_lower = text.lower()
        for lang in prog_langs + spoken_langs:
            if lang.lower() in text_lower:
                languages.append(lang)
        
        return list(set(languages))

    def _extract_projects(self, text: str) -> List[Dict[str, Any]]:
        """Extract project information"""
        projects = []
        
        # Look for project sections
        project_patterns = [
            r'(?:PROJECTS?|PORTFOLIO)\s*:?\s*(.*?)(?=\n[A-Z]|\n\n|\Z)',
        ]
        
        for pattern in project_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                project_text = match.group(1)
                # Split by bullet points or line breaks
                project_items = re.split(r'\n\s*[-•]\s*|\n\n', project_text)
                
                for item in project_items:
                    item = item.strip()
                    if len(item) > 10:
                        projects.append({
                            'name': item.split('\n')[0][:50],  # First line as name
                            'description': item
                        })
        
        return projects

    def _extract_awards(self, text: str) -> List[str]:
        """Extract awards and achievements"""
        awards = []
        
        award_patterns = [
            r'(?:AWARDS?|ACHIEVEMENTS?|HONORS?)\s*:?\s*(.*?)(?=\n[A-Z]|\n\n|\Z)',
        ]
        
        for pattern in award_patterns:
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                award_text = match.group(1)
                award_items = re.split(r'\n\s*[-•]\s*|\n', award_text)
                
                for item in award_items:
                    item = item.strip()
                    if len(item) > 5:
                        awards.append(item)
        
        return awards
