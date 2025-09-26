from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from enum import Enum

class ExperienceLevel(str, Enum):
    ENTRY = "entry"
    JUNIOR = "junior"
    MID = "mid"
    SENIOR = "senior"
    LEAD = "lead"
    EXECUTIVE = "executive"

class LocationType(str, Enum):
    REMOTE = "remote"
    ONSITE = "onsite"
    HYBRID = "hybrid"

class EmploymentType(str, Enum):
    FULL_TIME = "full_time"
    PART_TIME = "part_time"
    CONTRACT = "contract"
    INTERNSHIP = "internship"
    FREELANCE = "freelance"

class UserProfile(BaseModel):
    user_id: str
    skills: List[str] = []
    experience_level: ExperienceLevel
    target_roles: List[str] = []
    preferred_industries: List[str] = []
    location_preferences: List[str] = []
    salary_expectation: Optional[int] = None
    education: Optional[Dict[str, Any]] = None
    work_experience: List[Dict[str, Any]] = []
    certifications: List[str] = []
    languages: List[str] = []

class JobListing(BaseModel):
    job_id: str
    title: str
    company: str
    description: str
    requirements: List[str] = []
    skills_required: List[str] = []
    experience_level: ExperienceLevel
    location: str
    location_type: LocationType
    employment_type: EmploymentType
    salary_min: Optional[int] = None
    salary_max: Optional[int] = None
    industry: Optional[str] = None
    benefits: List[str] = []

class MatchPreferences(BaseModel):
    weight_skills: float = 0.4
    weight_experience: float = 0.2
    weight_location: float = 0.15
    weight_salary: float = 0.15
    weight_industry: float = 0.1
    min_match_score: float = 0.5

class JobMatchRequest(BaseModel):
    user_profile: UserProfile
    jobs: List[JobListing]
    preferences: Optional[MatchPreferences] = None

class MatchReason(BaseModel):
    category: str
    score: float
    explanation: str

class JobMatchResponse(BaseModel):
    job: JobListing
    match_score: float  # 0.0 to 1.0
    match_percentage: int  # 0 to 100
    match_reasons: List[MatchReason]
    skills_match: Dict[str, Any]
    missing_skills: List[str]
    recommendation_strength: str  # "weak", "moderate", "strong", "excellent"

class RecommendationRequest(BaseModel):
    user_profile: UserProfile
    job_history: List[Dict[str, Any]] = []
    preferences: Optional[MatchPreferences] = None
    limit: int = 10

class RecommendationResponse(BaseModel):
    recommendations: List[JobMatchResponse]
    insights: Dict[str, Any]
    market_analysis: Dict[str, Any]
    career_suggestions: List[str]

class SkillsGapAnalysis(BaseModel):
    matching_skills: List[str]
    missing_skills: List[str]
    skill_categories: Dict[str, List[str]]
    gap_score: float  # 0.0 to 1.0
    suggestions: List[str]

class CareerPath(BaseModel):
    current_role: str
    next_roles: List[str]
    required_skills: List[str]
    estimated_timeline: str
    learning_resources: List[str]

class MarketTrends(BaseModel):
    trending_skills: List[str]
    growth_industries: List[str]
    salary_trends: Dict[str, Any]
    location_insights: Dict[str, Any]
    future_outlook: str
