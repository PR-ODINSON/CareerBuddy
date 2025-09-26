from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from enum import Enum

class SeverityLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class FeedbackCategory(str, Enum):
    FORMATTING = "formatting"
    CONTENT = "content"
    SKILLS = "skills"
    EXPERIENCE = "experience"
    EDUCATION = "education"
    KEYWORDS = "keywords"
    ATS_COMPATIBILITY = "ats_compatibility"

class ResumeAnalysisRequest(BaseModel):
    content: str
    job_description: Optional[str] = None

class ContactInfo(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    portfolio: Optional[str] = None
    location: Optional[str] = None

class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: Optional[str] = None
    graduation_year: Optional[int] = None
    gpa: Optional[float] = None

class Experience(BaseModel):
    company: str
    position: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: List[str] = []
    location: Optional[str] = None

class ParsedResumeData(BaseModel):
    contact_info: ContactInfo
    summary: Optional[str] = None
    education: List[Education] = []
    experience: List[Experience] = []
    skills: List[str] = []
    certifications: List[str] = []
    languages: List[str] = []
    projects: List[Dict[str, Any]] = []
    awards: List[str] = []
    raw_text: str

class ATSScore(BaseModel):
    overall_score: int  # 0-100
    formatting_score: int
    keyword_score: int
    content_score: int
    readability_score: int
    details: Dict[str, Any] = {}

class FeedbackItem(BaseModel):
    category: FeedbackCategory
    severity: SeverityLevel
    title: str
    description: str
    suggestion: str
    line_number: Optional[int] = None
    section: Optional[str] = None
    impact_score: int = 0  # 0-10

class SkillExtraction(BaseModel):
    technical_skills: List[str] = []
    soft_skills: List[str] = []
    languages: List[str] = []
    certifications: List[str] = []
    tools: List[str] = []

class ResumeAnalysisResponse(BaseModel):
    parsed_data: ParsedResumeData
    ats_score: ATSScore
    feedback: List[FeedbackItem]
    overall_score: int
    analysis_timestamp: Optional[str] = None

class KeywordOptimization(BaseModel):
    missing_keywords: List[str]
    keyword_frequency: Dict[str, int]
    suggestions: List[str]
    optimized_sections: Dict[str, str]
