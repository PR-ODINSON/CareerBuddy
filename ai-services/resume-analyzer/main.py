from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import uvicorn
import os
from dotenv import load_dotenv

from services.resume_parser import ResumeParser
from services.ats_analyzer import ATSAnalyzer
from services.feedback_generator import FeedbackGenerator
from models.analysis_models import (
    ResumeAnalysisRequest,
    ResumeAnalysisResponse,
    ATSScore,
    FeedbackItem,
    SkillExtraction
)

# Load environment variables
load_dotenv()

app = FastAPI(
    title="CareerBuddy Resume Analyzer",
    description="AI-powered resume analysis and feedback service",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
resume_parser = ResumeParser()
ats_analyzer = ATSAnalyzer()
feedback_generator = FeedbackGenerator()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("🚀 Resume Analyzer service starting up...")
    await resume_parser.initialize()
    await ats_analyzer.initialize()
    print("✅ Resume Analyzer service ready!")

@app.get("/")
async def root():
    return {
        "service": "CareerBuddy Resume Analyzer",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "resume-analyzer"}

@app.post("/analyze/file", response_model=ResumeAnalysisResponse)
async def analyze_resume_file(file: UploadFile = File(...)):
    """Analyze uploaded resume file"""
    if not file.filename.lower().endswith(('.pdf', '.docx', '.txt')):
        raise HTTPException(
            status_code=400,
            detail="Only PDF, DOCX, and TXT files are supported"
        )
    
    if file.size > 5 * 1024 * 1024:  # 5MB limit
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 5MB limit"
        )
    
    try:
        # Read file content
        content = await file.read()
        
        # Parse resume
        parsed_data = await resume_parser.parse_resume(content, file.filename)
        
        # Analyze ATS compatibility
        ats_score = await ats_analyzer.analyze_ats_compatibility(parsed_data)
        
        # Generate feedback
        feedback = await feedback_generator.generate_feedback(parsed_data, ats_score)
        
        return ResumeAnalysisResponse(
            parsed_data=parsed_data,
            ats_score=ats_score,
            feedback=feedback,
            overall_score=calculate_overall_score(ats_score, feedback)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/analyze/text", response_model=ResumeAnalysisResponse)
async def analyze_resume_text(request: ResumeAnalysisRequest):
    """Analyze resume from text content"""
    try:
        # Parse resume from text
        parsed_data = await resume_parser.parse_text(request.content)
        
        # Analyze ATS compatibility
        ats_score = await ats_analyzer.analyze_ats_compatibility(parsed_data)
        
        # Generate feedback
        feedback = await feedback_generator.generate_feedback(parsed_data, ats_score)
        
        return ResumeAnalysisResponse(
            parsed_data=parsed_data,
            ats_score=ats_score,
            feedback=feedback,
            overall_score=calculate_overall_score(ats_score, feedback)
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/extract/skills")
async def extract_skills(request: ResumeAnalysisRequest) -> SkillExtraction:
    """Extract skills from resume content"""
    try:
        skills = await resume_parser.extract_skills(request.content)
        return SkillExtraction(
            technical_skills=skills.get('technical', []),
            soft_skills=skills.get('soft', []),
            languages=skills.get('languages', []),
            certifications=skills.get('certifications', []),
            tools=skills.get('tools', [])
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skill extraction failed: {str(e)}")

@app.post("/optimize/keywords")
async def optimize_keywords(
    resume_content: str,
    job_description: str
) -> Dict[str, Any]:
    """Suggest keyword optimizations based on job description"""
    try:
        optimization = await ats_analyzer.optimize_keywords(resume_content, job_description)
        return optimization
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Optimization failed: {str(e)}")

def calculate_overall_score(ats_score: ATSScore, feedback: List[FeedbackItem]) -> int:
    """Calculate overall resume score"""
    base_score = ats_score.overall_score
    
    # Adjust based on feedback severity
    critical_issues = len([f for f in feedback if f.severity == "critical"])
    high_issues = len([f for f in feedback if f.severity == "high"])
    medium_issues = len([f for f in feedback if f.severity == "medium"])
    
    # Deduct points for issues
    deduction = (critical_issues * 15) + (high_issues * 10) + (medium_issues * 5)
    
    return max(0, min(100, base_score - deduction))

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8001))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
