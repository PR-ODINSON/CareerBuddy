import re
import logging
from typing import List, Dict, Any
from models.analysis_models import (
    FeedbackItem,
    FeedbackCategory,
    SeverityLevel,
    ParsedResumeData,
    ATSScore
)

logger = logging.getLogger(__name__)

class FeedbackGenerator:
    def __init__(self):
        self.feedback_rules = {
            'contact_info': {
                'missing_email': {
                    'severity': SeverityLevel.CRITICAL,
                    'title': 'Missing Email Address',
                    'description': 'No email address found in resume',
                    'suggestion': 'Add a professional email address in the contact section'
                },
                'missing_phone': {
                    'severity': SeverityLevel.HIGH,
                    'title': 'Missing Phone Number',
                    'description': 'No phone number found in resume',
                    'suggestion': 'Include a phone number for direct contact'
                },
                'unprofessional_email': {
                    'severity': SeverityLevel.MEDIUM,
                    'title': 'Unprofessional Email',
                    'description': 'Email address may appear unprofessional',
                    'suggestion': 'Use a professional email format: firstname.lastname@email.com'
                }
            },
            'content': {
                'no_summary': {
                    'severity': SeverityLevel.MEDIUM,
                    'title': 'Missing Professional Summary',
                    'description': 'No professional summary or objective found',
                    'suggestion': 'Add a 2-3 sentence professional summary highlighting your key strengths'
                },
                'no_experience': {
                    'severity': SeverityLevel.CRITICAL,
                    'title': 'Missing Work Experience',
                    'description': 'No work experience section found',
                    'suggestion': 'Add your work experience with specific achievements and responsibilities'
                },
                'no_education': {
                    'severity': SeverityLevel.HIGH,
                    'title': 'Missing Education',
                    'description': 'No education information found',
                    'suggestion': 'Include your educational background and relevant coursework'
                },
                'no_skills': {
                    'severity': SeverityLevel.HIGH,
                    'title': 'Missing Skills Section',
                    'description': 'No skills section found',
                    'suggestion': 'Add a dedicated skills section with relevant technical and soft skills'
                },
                'short_experience_descriptions': {
                    'severity': SeverityLevel.MEDIUM,
                    'title': 'Brief Experience Descriptions',
                    'description': 'Experience descriptions are too brief',
                    'suggestion': 'Expand job descriptions with specific achievements and quantifiable results'
                },
                'no_quantified_achievements': {
                    'severity': SeverityLevel.MEDIUM,
                    'title': 'Lack of Quantified Achievements',
                    'description': 'Few or no quantified achievements found',
                    'suggestion': 'Include specific numbers, percentages, or metrics to demonstrate impact'
                }
            },
            'formatting': {
                'inconsistent_formatting': {
                    'severity': SeverityLevel.LOW,
                    'title': 'Inconsistent Formatting',
                    'description': 'Formatting appears inconsistent',
                    'suggestion': 'Ensure consistent font, spacing, and bullet point styles throughout'
                },
                'long_paragraphs': {
                    'severity': SeverityLevel.LOW,
                    'title': 'Long Paragraphs',
                    'description': 'Some paragraphs are too long',
                    'suggestion': 'Break long paragraphs into bullet points for better readability'
                },
                'poor_section_organization': {
                    'severity': SeverityLevel.MEDIUM,
                    'title': 'Poor Section Organization',
                    'description': 'Resume sections are not well organized',
                    'suggestion': 'Organize sections in order: Contact, Summary, Experience, Education, Skills'
                }
            },
            'keywords': {
                'missing_industry_keywords': {
                    'severity': SeverityLevel.MEDIUM,
                    'title': 'Missing Industry Keywords',
                    'description': 'Lacks relevant industry-specific keywords',
                    'suggestion': 'Include keywords from job descriptions in your target field'
                },
                'low_keyword_density': {
                    'severity': SeverityLevel.LOW,
                    'title': 'Low Keyword Density',
                    'description': 'Important keywords appear infrequently',
                    'suggestion': 'Naturally incorporate relevant keywords throughout your resume'
                }
            },
            'ats_compatibility': {
                'poor_ats_score': {
                    'severity': SeverityLevel.HIGH,
                    'title': 'Poor ATS Compatibility',
                    'description': 'Resume may not parse well in ATS systems',
                    'suggestion': 'Use standard headings, avoid tables/graphics, and use common fonts'
                },
                'complex_formatting': {
                    'severity': SeverityLevel.MEDIUM,
                    'title': 'Complex Formatting',
                    'description': 'Complex formatting may cause ATS parsing issues',
                    'suggestion': 'Simplify formatting and avoid multi-column layouts'
                }
            }
        }

    async def generate_feedback(self, parsed_data: ParsedResumeData, ats_score: ATSScore) -> List[FeedbackItem]:
        """Generate comprehensive feedback for the resume"""
        feedback_items = []
        
        try:
            # Check contact information
            feedback_items.extend(self._check_contact_info(parsed_data.contact_info))
            
            # Check content structure
            feedback_items.extend(self._check_content_structure(parsed_data))
            
            # Check formatting issues
            feedback_items.extend(self._check_formatting(parsed_data.raw_text))
            
            # Check ATS compatibility
            feedback_items.extend(self._check_ats_compatibility(ats_score))
            
            # Check keyword usage
            feedback_items.extend(self._check_keywords(parsed_data))
            
            # Check experience quality
            feedback_items.extend(self._check_experience_quality(parsed_data.experience))
            
            # Sort by severity (critical first)
            severity_order = {
                SeverityLevel.CRITICAL: 0,
                SeverityLevel.HIGH: 1,
                SeverityLevel.MEDIUM: 2,
                SeverityLevel.LOW: 3
            }
            
            feedback_items.sort(key=lambda x: severity_order[x.severity])
            
            return feedback_items
            
        except Exception as e:
            logger.error(f"Failed to generate feedback: {e}")
            raise

    def _check_contact_info(self, contact_info) -> List[FeedbackItem]:
        """Check contact information completeness and quality"""
        feedback = []
        
        # Check for missing email
        if not contact_info.email:
            rule = self.feedback_rules['contact_info']['missing_email']
            feedback.append(FeedbackItem(
                category=FeedbackCategory.CONTENT,
                severity=rule['severity'],
                title=rule['title'],
                description=rule['description'],
                suggestion=rule['suggestion'],
                impact_score=9
            ))
        else:
            # Check email professionalism
            unprofessional_patterns = [
                r'.*\d{4,}.*@',  # Too many numbers
                r'.*(sexy|hot|cute|cool|awesome).*@',  # Inappropriate words
                r'.*@(yahoo|hotmail|aol)\.',  # Less professional domains
            ]
            
            for pattern in unprofessional_patterns:
                if re.match(pattern, contact_info.email, re.IGNORECASE):
                    rule = self.feedback_rules['contact_info']['unprofessional_email']
                    feedback.append(FeedbackItem(
                        category=FeedbackCategory.CONTENT,
                        severity=rule['severity'],
                        title=rule['title'],
                        description=rule['description'],
                        suggestion=rule['suggestion'],
                        impact_score=5
                    ))
                    break
        
        # Check for missing phone
        if not contact_info.phone:
            rule = self.feedback_rules['contact_info']['missing_phone']
            feedback.append(FeedbackItem(
                category=FeedbackCategory.CONTENT,
                severity=rule['severity'],
                title=rule['title'],
                description=rule['description'],
                suggestion=rule['suggestion'],
                impact_score=7
            ))
        
        return feedback

    def _check_content_structure(self, parsed_data: ParsedResumeData) -> List[FeedbackItem]:
        """Check overall content structure"""
        feedback = []
        
        # Check for missing summary
        if not parsed_data.summary:
            rule = self.feedback_rules['content']['no_summary']
            feedback.append(FeedbackItem(
                category=FeedbackCategory.CONTENT,
                severity=rule['severity'],
                title=rule['title'],
                description=rule['description'],
                suggestion=rule['suggestion'],
                impact_score=6
            ))
        
        # Check for missing experience
        if not parsed_data.experience:
            rule = self.feedback_rules['content']['no_experience']
            feedback.append(FeedbackItem(
                category=FeedbackCategory.CONTENT,
                severity=rule['severity'],
                title=rule['title'],
                description=rule['description'],
                suggestion=rule['suggestion'],
                impact_score=10
            ))
        
        # Check for missing education
        if not parsed_data.education:
            rule = self.feedback_rules['content']['no_education']
            feedback.append(FeedbackItem(
                category=FeedbackCategory.EDUCATION,
                severity=rule['severity'],
                title=rule['title'],
                description=rule['description'],
                suggestion=rule['suggestion'],
                impact_score=8
            ))
        
        # Check for missing skills
        if not parsed_data.skills:
            rule = self.feedback_rules['content']['no_skills']
            feedback.append(FeedbackItem(
                category=FeedbackCategory.SKILLS,
                severity=rule['severity'],
                title=rule['title'],
                description=rule['description'],
                suggestion=rule['suggestion'],
                impact_score=8
            ))
        
        return feedback

    def _check_formatting(self, raw_text: str) -> List[FeedbackItem]:
        """Check formatting issues"""
        feedback = []
        
        # Check for long paragraphs
        paragraphs = raw_text.split('\n\n')
        long_paragraphs = [p for p in paragraphs if len(p) > 500]
        
        if len(long_paragraphs) > 2:
            rule = self.feedback_rules['formatting']['long_paragraphs']
            feedback.append(FeedbackItem(
                category=FeedbackCategory.FORMATTING,
                severity=rule['severity'],
                title=rule['title'],
                description=rule['description'],
                suggestion=rule['suggestion'],
                impact_score=3
            ))
        
        # Check for inconsistent bullet points
        bullet_patterns = [r'•', r'-', r'\*', r'·']
        bullet_counts = [len(re.findall(pattern, raw_text)) for pattern in bullet_patterns]
        used_bullets = [count for count in bullet_counts if count > 0]
        
        if len(used_bullets) > 2:
            rule = self.feedback_rules['formatting']['inconsistent_formatting']
            feedback.append(FeedbackItem(
                category=FeedbackCategory.FORMATTING,
                severity=rule['severity'],
                title=rule['title'],
                description='Multiple bullet point styles detected',
                suggestion='Use consistent bullet points throughout the resume',
                impact_score=2
            ))
        
        return feedback

    def _check_ats_compatibility(self, ats_score: ATSScore) -> List[FeedbackItem]:
        """Check ATS compatibility issues"""
        feedback = []
        
        if ats_score.overall_score < 70:
            rule = self.feedback_rules['ats_compatibility']['poor_ats_score']
            feedback.append(FeedbackItem(
                category=FeedbackCategory.ATS_COMPATIBILITY,
                severity=rule['severity'],
                title=rule['title'],
                description=f"ATS score: {ats_score.overall_score}/100",
                suggestion=rule['suggestion'],
                impact_score=8
            ))
        
        if ats_score.formatting_score < 80:
            rule = self.feedback_rules['ats_compatibility']['complex_formatting']
            feedback.append(FeedbackItem(
                category=FeedbackCategory.ATS_COMPATIBILITY,
                severity=rule['severity'],
                title=rule['title'],
                description=f"Formatting score: {ats_score.formatting_score}/100",
                suggestion=rule['suggestion'],
                impact_score=6
            ))
        
        return feedback

    def _check_keywords(self, parsed_data: ParsedResumeData) -> List[FeedbackItem]:
        """Check keyword usage"""
        feedback = []
        
        # Check for low keyword density
        text = parsed_data.raw_text.lower()
        important_keywords = [
            'managed', 'developed', 'implemented', 'created', 'improved',
            'increased', 'led', 'achieved', 'delivered', 'optimized'
        ]
        
        found_keywords = [kw for kw in important_keywords if kw in text]
        
        if len(found_keywords) < 3:
            rule = self.feedback_rules['keywords']['missing_industry_keywords']
            feedback.append(FeedbackItem(
                category=FeedbackCategory.KEYWORDS,
                severity=rule['severity'],
                title=rule['title'],
                description=f"Only {len(found_keywords)} action verbs found",
                suggestion='Include more action verbs to describe your achievements',
                impact_score=5
            ))
        
        return feedback

    def _check_experience_quality(self, experience_list) -> List[FeedbackItem]:
        """Check quality of experience descriptions"""
        feedback = []
        
        if not experience_list:
            return feedback
        
        # Check for brief descriptions
        brief_descriptions = 0
        for exp in experience_list:
            if len(exp.description) < 2:
                brief_descriptions += 1
        
        if brief_descriptions > len(experience_list) * 0.5:
            rule = self.feedback_rules['content']['short_experience_descriptions']
            feedback.append(FeedbackItem(
                category=FeedbackCategory.EXPERIENCE,
                severity=rule['severity'],
                title=rule['title'],
                description=f"{brief_descriptions} jobs have insufficient descriptions",
                suggestion=rule['suggestion'],
                impact_score=7
            ))
        
        # Check for quantified achievements
        all_descriptions = []
        for exp in experience_list:
            all_descriptions.extend(exp.description)
        
        numbers_found = 0
        for desc in all_descriptions:
            if re.search(r'\d+(?:\.\d+)?%?', desc):
                numbers_found += 1
        
        if numbers_found < len(all_descriptions) * 0.3:
            rule = self.feedback_rules['content']['no_quantified_achievements']
            feedback.append(FeedbackItem(
                category=FeedbackCategory.EXPERIENCE,
                severity=rule['severity'],
                title=rule['title'],
                description=f"Only {numbers_found} descriptions include metrics",
                suggestion=rule['suggestion'],
                impact_score=6
            ))
        
        return feedback

    def _generate_positive_feedback(self, parsed_data: ParsedResumeData, ats_score: ATSScore) -> List[FeedbackItem]:
        """Generate positive feedback for good practices"""
        positive_feedback = []
        
        # Good ATS score
        if ats_score.overall_score >= 85:
            positive_feedback.append(FeedbackItem(
                category=FeedbackCategory.ATS_COMPATIBILITY,
                severity=SeverityLevel.LOW,
                title="Excellent ATS Compatibility",
                description=f"Great ATS score of {ats_score.overall_score}/100",
                suggestion="Your resume is well-optimized for ATS systems",
                impact_score=0
            ))
        
        # Good contact information
        if parsed_data.contact_info.email and parsed_data.contact_info.phone:
            positive_feedback.append(FeedbackItem(
                category=FeedbackCategory.CONTENT,
                severity=SeverityLevel.LOW,
                title="Complete Contact Information",
                description="All essential contact details are present",
                suggestion="Keep your contact information up to date",
                impact_score=0
            ))
        
        return positive_feedback
