from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any
from contextlib import asynccontextmanager
import uvicorn
import os
from dotenv import load_dotenv

from services.job_matcher import JobMatcher
from services.recommendation_engine import RecommendationEngine
from models.matching_models import (
    JobMatchRequest,
    UserProfile,
    JobMatchResponse,
    RecommendationRequest,
    RecommendationResponse
)

# Load environment variables
load_dotenv()

app = FastAPI(
    title="CareerBuddy Job Matcher",
    description="AI-powered job matching and recommendation service",
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
job_matcher = JobMatcher()
recommendation_engine = RecommendationEngine()

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print("Job Matcher service starting up...")
    await job_matcher.initialize()
    await recommendation_engine.initialize()
    print("Job Matcher service ready!")

@app.get("/")
async def root():
    return {
        "service": "CareerBuddy Job Matcher",
        "version": "1.0.0",
        "status": "healthy"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "job-matcher"}

@app.post("/match/jobs", response_model=List[JobMatchResponse])
async def match_jobs(request: JobMatchRequest):
    """Match user profile with available jobs"""
    try:
        matches = await job_matcher.find_matching_jobs(
            user_profile=request.user_profile,
            jobs=request.jobs,
            preferences=request.preferences
        )
        return matches
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job matching failed: {str(e)}")

@app.post("/recommendations", response_model=RecommendationResponse)
async def get_recommendations(request: RecommendationRequest):
    """Get personalized job recommendations"""
    try:
        recommendations = await recommendation_engine.generate_recommendations(
            user_profile=request.user_profile,
            job_history=request.job_history,
            preferences=request.preferences,
            limit=request.limit
        )
        return recommendations
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation generation failed: {str(e)}")

@app.post("/analyze/skills-gap")
async def analyze_skills_gap(
    user_skills: List[str],
    job_requirements: List[str]
) -> Dict[str, Any]:
    """Analyze skills gap between user and job requirements"""
    try:
        analysis = await job_matcher.analyze_skills_gap(user_skills, job_requirements)
        return analysis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Skills gap analysis failed: {str(e)}")

@app.post("/match/similarity")
async def calculate_job_similarity(
    job1_description: str,
    job2_description: str
) -> Dict[str, float]:
    """Calculate similarity between two job descriptions"""
    try:
        similarity = await job_matcher.calculate_job_similarity(job1_description, job2_description)
        return {"similarity_score": similarity}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Similarity calculation failed: {str(e)}")

@app.post("/predict/job-fit")
async def predict_job_fit(
    user_profile: UserProfile,
    job_description: str,
    job_requirements: List[str]
) -> Dict[str, Any]:
    """Predict how well a user fits a specific job"""
    try:
        prediction = await recommendation_engine.predict_job_fit(
            user_profile, job_description, job_requirements
        )
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Job fit prediction failed: {str(e)}")

@app.get("/insights/market-trends")
async def get_market_trends(
    industry: str = None,
    location: str = None
) -> Dict[str, Any]:
    """Get job market trends and insights"""
    try:
        trends = await recommendation_engine.get_market_trends(industry, location)
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Market trends analysis failed: {str(e)}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8002))
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True,
        log_level="info"
    )
