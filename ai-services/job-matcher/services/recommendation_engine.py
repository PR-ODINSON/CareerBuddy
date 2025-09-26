import logging
from typing import List, Dict, Any
from collections import Counter
import random

from models.matching_models import (
    UserProfile,
    JobListing,
    RecommendationResponse,
    JobMatchResponse,
    MatchPreferences,
    CareerPath,
    MarketTrends
)
from .job_matcher import JobMatcher

logger = logging.getLogger(__name__)

class RecommendationEngine:
    def __init__(self):
        self.job_matcher = JobMatcher()
        
        # Mock data for market trends (in production, this would come from real data)
        self.market_data = {
            'trending_skills': [
                'artificial intelligence', 'machine learning', 'cloud computing',
                'cybersecurity', 'data science', 'blockchain', 'devops',
                'react', 'python', 'kubernetes', 'aws', 'azure'
            ],
            'growth_industries': [
                'technology', 'healthcare', 'renewable energy', 'fintech',
                'e-commerce', 'biotechnology', 'robotics', 'digital marketing'
            ],
            'salary_trends': {
                'software_engineer': {'average': 95000, 'growth': 0.08},
                'data_scientist': {'average': 110000, 'growth': 0.12},
                'product_manager': {'average': 115000, 'growth': 0.06},
                'devops_engineer': {'average': 105000, 'growth': 0.15},
                'cybersecurity_analyst': {'average': 98000, 'growth': 0.18}
            }
        }

    async def initialize(self):
        """Initialize the recommendation engine"""
        await self.job_matcher.initialize()
        logger.info("Recommendation Engine initialized successfully")

    async def generate_recommendations(
        self,
        user_profile: UserProfile,
        job_history: List[Dict[str, Any]] = None,
        preferences: MatchPreferences = None,
        limit: int = 10
    ) -> RecommendationResponse:
        """Generate personalized job recommendations"""
        
        if preferences is None:
            preferences = MatchPreferences()
        
        if job_history is None:
            job_history = []
        
        try:
            # Generate mock job listings (in production, fetch from database)
            available_jobs = await self._fetch_relevant_jobs(user_profile)
            
            # Get job matches
            matches = await self.job_matcher.find_matching_jobs(
                user_profile, available_jobs, preferences
            )
            
            # Limit results
            top_matches = matches[:limit]
            
            # Generate insights
            insights = await self._generate_insights(user_profile, top_matches)
            
            # Market analysis
            market_analysis = await self._analyze_market_trends(user_profile)
            
            # Career suggestions
            career_suggestions = await self._generate_career_suggestions(user_profile, job_history)
            
            return RecommendationResponse(
                recommendations=top_matches,
                insights=insights,
                market_analysis=market_analysis,
                career_suggestions=career_suggestions
            )
            
        except Exception as e:
            logger.error(f"Failed to generate recommendations: {e}")
            raise

    async def predict_job_fit(
        self,
        user_profile: UserProfile,
        job_description: str,
        job_requirements: List[str]
    ) -> Dict[str, Any]:
        """Predict how well a user fits a specific job"""
        
        # Create a mock job listing for analysis
        mock_job = JobListing(
            job_id="temp_job",
            title="Target Position",
            company="Target Company",
            description=job_description,
            requirements=job_requirements,
            skills_required=job_requirements,
            experience_level=user_profile.experience_level,
            location="Unknown",
            location_type="remote",
            employment_type="full_time"
        )
        
        # Calculate match
        matches = await self.job_matcher.find_matching_jobs(
            user_profile, [mock_job], MatchPreferences()
        )
        
        if matches:
            match = matches[0]
            
            # Generate detailed analysis
            fit_analysis = {
                'overall_fit_score': match.match_score,
                'fit_percentage': match.match_percentage,
                'recommendation_strength': match.recommendation_strength,
                'matching_skills': match.skills_match.get('matching_skills', []),
                'missing_skills': match.missing_skills,
                'skill_coverage': match.skills_match.get('skill_coverage', 0),
                'match_breakdown': {reason.category: reason.score for reason in match.match_reasons},
                'improvement_suggestions': await self._generate_improvement_suggestions(match)
            }
            
            return fit_analysis
        
        return {
            'overall_fit_score': 0.0,
            'fit_percentage': 0,
            'recommendation_strength': 'poor',
            'error': 'Unable to analyze job fit'
        }

    async def get_market_trends(self, industry: str = None, location: str = None) -> Dict[str, Any]:
        """Get job market trends and insights"""
        
        trends = MarketTrends(
            trending_skills=self.market_data['trending_skills'][:10],
            growth_industries=self.market_data['growth_industries'][:8],
            salary_trends=self.market_data['salary_trends'],
            location_insights=await self._get_location_insights(location),
            future_outlook="The job market continues to favor technology and healthcare sectors, with remote work opportunities increasing."
        )
        
        # Filter by industry if specified
        if industry:
            trends = await self._filter_trends_by_industry(trends, industry)
        
        return trends.dict()

    async def _fetch_relevant_jobs(self, user_profile: UserProfile) -> List[JobListing]:
        """Fetch relevant jobs for the user (mock implementation)"""
        
        # This is a mock implementation. In production, this would query a real job database
        mock_jobs = [
            JobListing(
                job_id="job_1",
                title="Senior Software Engineer",
                company="TechCorp Inc",
                description="We are looking for a senior software engineer with Python and React experience.",
                requirements=["Python", "React", "SQL", "Git"],
                skills_required=["Python", "React", "SQL", "Git"],
                experience_level="senior",
                location="San Francisco, CA",
                location_type="hybrid",
                employment_type="full_time",
                salary_min=120000,
                salary_max=180000,
                industry="technology"
            ),
            JobListing(
                job_id="job_2",
                title="Data Scientist",
                company="DataCorp",
                description="Join our data science team to build ML models and analyze big data.",
                requirements=["Python", "Machine Learning", "SQL", "Statistics"],
                skills_required=["Python", "Machine Learning", "SQL", "Statistics"],
                experience_level="mid",
                location="Remote",
                location_type="remote",
                employment_type="full_time",
                salary_min=100000,
                salary_max=150000,
                industry="technology"
            ),
            JobListing(
                job_id="job_3",
                title="Frontend Developer",
                company="StartupXYZ",
                description="Looking for a frontend developer to build amazing user interfaces.",
                requirements=["JavaScript", "React", "CSS", "HTML"],
                skills_required=["JavaScript", "React", "CSS", "HTML"],
                experience_level="junior",
                location="New York, NY",
                location_type="onsite",
                employment_type="full_time",
                salary_min=80000,
                salary_max=120000,
                industry="technology"
            ),
            JobListing(
                job_id="job_4",
                title="DevOps Engineer",
                company="CloudTech",
                description="Manage our cloud infrastructure and deployment pipelines.",
                requirements=["AWS", "Docker", "Kubernetes", "Python"],
                skills_required=["AWS", "Docker", "Kubernetes", "Python"],
                experience_level="senior",
                location="Austin, TX",
                location_type="hybrid",
                employment_type="full_time",
                salary_min=110000,
                salary_max=160000,
                industry="technology"
            ),
            JobListing(
                job_id="job_5",
                title="Product Manager",
                company="InnovateCorp",
                description="Lead product development and strategy for our mobile applications.",
                requirements=["Product Management", "Agile", "Analytics", "Communication"],
                skills_required=["Product Management", "Agile", "Analytics", "Communication"],
                experience_level="mid",
                location="Seattle, WA",
                location_type="hybrid",
                employment_type="full_time",
                salary_min=105000,
                salary_max=140000,
                industry="technology"
            )
        ]
        
        # Filter jobs based on user's target roles and skills
        relevant_jobs = []
        user_skills_lower = [skill.lower() for skill in user_profile.skills]
        
        for job in mock_jobs:
            relevance_score = 0
            
            # Check skill overlap
            for skill in job.skills_required:
                if skill.lower() in user_skills_lower:
                    relevance_score += 1
            
            # Check target roles
            for target_role in user_profile.target_roles:
                if target_role.lower() in job.title.lower():
                    relevance_score += 2
            
            # Include job if it has some relevance
            if relevance_score > 0:
                relevant_jobs.append(job)
        
        # If no relevant jobs found, return some jobs anyway
        if not relevant_jobs:
            relevant_jobs = mock_jobs[:3]
        
        return relevant_jobs

    async def _generate_insights(self, user_profile: UserProfile, matches: List[JobMatchResponse]) -> Dict[str, Any]:
        """Generate insights about the user's job search"""
        
        if not matches:
            return {
                'message': 'No suitable matches found',
                'suggestions': ['Consider expanding your skill set', 'Review your job preferences']
            }
        
        # Analyze match scores
        avg_score = sum(match.match_score for match in matches) / len(matches)
        high_matches = [match for match in matches if match.match_score >= 0.8]
        
        # Most common missing skills
        all_missing_skills = []
        for match in matches:
            all_missing_skills.extend(match.missing_skills)
        
        common_missing_skills = [skill for skill, count in Counter(all_missing_skills).most_common(5)]
        
        insights = {
            'average_match_score': round(avg_score, 2),
            'high_quality_matches': len(high_matches),
            'total_matches': len(matches),
            'most_common_missing_skills': common_missing_skills,
            'recommendations': []
        }
        
        # Generate recommendations based on insights
        if avg_score < 0.6:
            insights['recommendations'].append("Consider developing skills in high-demand areas")
        
        if common_missing_skills:
            insights['recommendations'].append(f"Focus on learning: {', '.join(common_missing_skills[:3])}")
        
        if len(high_matches) == 0:
            insights['recommendations'].append("Consider expanding your job search criteria")
        
        return insights

    async def _analyze_market_trends(self, user_profile: UserProfile) -> Dict[str, Any]:
        """Analyze market trends relevant to the user"""
        
        # Find trending skills relevant to user
        user_skills_lower = [skill.lower() for skill in user_profile.skills]
        relevant_trending = [
            skill for skill in self.market_data['trending_skills']
            if any(user_skill in skill.lower() or skill.lower() in user_skill 
                   for user_skill in user_skills_lower)
        ]
        
        # Growth opportunities in user's preferred industries
        growth_opportunities = []
        for industry in user_profile.preferred_industries:
            if industry.lower() in [gi.lower() for gi in self.market_data['growth_industries']]:
                growth_opportunities.append(industry)
        
        return {
            'relevant_trending_skills': relevant_trending[:5],
            'growth_opportunities': growth_opportunities,
            'market_outlook': 'positive',
            'salary_growth_potential': 'moderate to high',
            'job_availability': 'good'
        }

    async def _generate_career_suggestions(self, user_profile: UserProfile, job_history: List[Dict[str, Any]]) -> List[str]:
        """Generate career development suggestions"""
        
        suggestions = []
        
        # Based on experience level
        if user_profile.experience_level == "entry":
            suggestions.append("Focus on building a strong foundation in core technologies")
            suggestions.append("Consider seeking mentorship opportunities")
        elif user_profile.experience_level == "mid":
            suggestions.append("Consider specializing in a particular domain or technology")
            suggestions.append("Start taking on leadership responsibilities")
        elif user_profile.experience_level == "senior":
            suggestions.append("Consider transitioning to technical leadership roles")
            suggestions.append("Mentor junior developers to build leadership skills")
        
        # Based on skills
        if "python" in [skill.lower() for skill in user_profile.skills]:
            suggestions.append("Explore machine learning and data science opportunities")
        
        if any("react" in skill.lower() for skill in user_profile.skills):
            suggestions.append("Consider full-stack development or frontend architecture roles")
        
        # Based on target roles
        if "manager" in " ".join(user_profile.target_roles).lower():
            suggestions.append("Develop project management and communication skills")
        
        # Generic suggestions
        suggestions.append("Stay updated with industry trends and emerging technologies")
        suggestions.append("Build a strong professional network through LinkedIn and tech events")
        
        return suggestions[:5]  # Limit to 5 suggestions

    async def _generate_improvement_suggestions(self, match: JobMatchResponse) -> List[str]:
        """Generate suggestions for improving job fit"""
        
        suggestions = []
        
        if match.missing_skills:
            suggestions.append(f"Develop skills in: {', '.join(match.missing_skills[:3])}")
        
        if match.match_score < 0.7:
            suggestions.append("Consider gaining more relevant experience in the target role")
        
        # Analyze match reasons for specific suggestions
        for reason in match.match_reasons:
            if reason.category == "experience" and reason.score < 0.6:
                suggestions.append("Gain more experience at the required level")
            elif reason.category == "location" and reason.score < 0.5:
                suggestions.append("Consider relocating or looking for remote opportunities")
            elif reason.category == "salary" and reason.score < 0.7:
                suggestions.append("Adjust salary expectations or negotiate based on other benefits")
        
        return suggestions

    async def _get_location_insights(self, location: str = None) -> Dict[str, Any]:
        """Get insights about job market in specific locations"""
        
        # Mock location data
        location_data = {
            'san francisco': {'job_growth': 'high', 'cost_of_living': 'very high', 'tech_jobs': 'abundant'},
            'austin': {'job_growth': 'very high', 'cost_of_living': 'moderate', 'tech_jobs': 'growing'},
            'new york': {'job_growth': 'moderate', 'cost_of_living': 'very high', 'tech_jobs': 'abundant'},
            'remote': {'job_growth': 'high', 'cost_of_living': 'variable', 'tech_jobs': 'increasing'}
        }
        
        if location and location.lower() in location_data:
            return location_data[location.lower()]
        
        return {
            'job_growth': 'moderate',
            'cost_of_living': 'moderate',
            'tech_jobs': 'available',
            'note': 'Data not available for specified location'
        }

    async def _filter_trends_by_industry(self, trends: MarketTrends, industry: str) -> MarketTrends:
        """Filter market trends by specific industry"""
        
        # Industry-specific skill mappings
        industry_skills = {
            'technology': ['python', 'javascript', 'react', 'aws', 'machine learning'],
            'healthcare': ['healthcare', 'medical', 'patient care', 'clinical'],
            'finance': ['financial analysis', 'risk management', 'trading', 'fintech'],
            'education': ['teaching', 'curriculum', 'e-learning', 'educational technology']
        }
        
        if industry.lower() in industry_skills:
            relevant_skills = [
                skill for skill in trends.trending_skills
                if any(ind_skill in skill.lower() for ind_skill in industry_skills[industry.lower()])
            ]
            trends.trending_skills = relevant_skills[:10]
        
        return trends
