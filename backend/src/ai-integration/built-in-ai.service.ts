import { Injectable, Logger } from '@nestjs/common';
const pdfParse = require('pdf-parse');

export interface ResumeAnalysisResult {
  ats_score: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    suggestions: string[];
  };
  skills: string[];
  experience_years: number;
  sections: {
    contact: boolean;
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
  };
  keyword_density: { [key: string]: number };
}

export interface JobMatchResult {
  matches: Array<{
    job_id: string;
    match_score: number;
    matching_skills: string[];
    missing_skills: string[];
    reasons: string[];
  }>;
  total_matches: number;
  recommendations: string[];
}

@Injectable()
export class BuiltInAiService {
  private readonly logger = new Logger(BuiltInAiService.name);

  // Common technical skills database
  private readonly commonSkills = [
    // Programming Languages
    'javascript', 'python', 'java', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css',
    
    // Frameworks & Libraries
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
    'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'sass', 'less',
    
    // Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'oracle',
    'sqlite', 'dynamodb', 'firebase',
    
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github actions',
    'terraform', 'ansible', 'chef', 'puppet', 'nginx', 'apache',
    
    // Tools & Technologies
    'git', 'jira', 'confluence', 'slack', 'figma', 'photoshop', 'illustrator', 'sketch',
    'postman', 'swagger', 'rest api', 'graphql', 'microservices', 'agile', 'scrum',
    
    // Soft Skills
    'leadership', 'communication', 'teamwork', 'problem solving', 'project management',
    'time management', 'analytical thinking', 'creativity', 'adaptability'
  ];

  constructor() {
    this.logger.log('Built-in AI service initialized');
  }

  async analyzeResumeFile(fileBuffer: Buffer, fileName: string): Promise<ResumeAnalysisResult> {
    try {
      let text = '';
      
      if (fileName.toLowerCase().endsWith('.pdf')) {
        const pdfData = await pdfParse(fileBuffer);
        text = pdfData.text;
      } else {
        // Assume text file
        text = fileBuffer.toString('utf-8');
      }

      return this.analyzeResumeText(text);
    } catch (error) {
      this.logger.error('Error analyzing resume file:', error);
      throw new Error('Failed to analyze resume file');
    }
  }

  async analyzeResumeText(text: string): Promise<ResumeAnalysisResult> {
    const normalizedText = text.toLowerCase();
    
    // Extract skills
    const skills = this.extractSkills(normalizedText);
    
    // Calculate experience years
    const experienceYears = this.extractExperienceYears(normalizedText);
    
    // Check sections
    const sections = this.checkSections(normalizedText);
    
    // Calculate keyword density
    const keywordDensity = this.calculateKeywordDensity(normalizedText);
    
    // Calculate ATS score
    const atsScore = this.calculateATSScore(sections, skills, experienceYears, text.length);
    
    // Generate feedback
    const feedback = this.generateFeedback(sections, skills, experienceYears, atsScore);

    return {
      ats_score: atsScore,
      feedback,
      skills,
      experience_years: experienceYears,
      sections,
      keyword_density: keywordDensity
    };
  }

  async findMatchingJobs(
    userProfile: {
      skills: string[];
      experience: any;
      preferences: {
        roles: string[];
        industries: string[];
        locations: string[];
        salary_expectation?: number;
      };
    },
    jobs: Array<{
      id: string;
      title: string;
      company: string;
      description: string;
      requirements: string[];
      skills: string[];
      location: string;
      salary_min?: number;
      salary_max?: number;
      experience_level: string;
    }>
  ): Promise<JobMatchResult> {
    const matches = jobs.map(job => {
      const matchScore = this.calculateJobMatchScore(userProfile, job);
      const matchingSkills = this.findMatchingSkills(userProfile.skills, job.skills);
      const missingSkills = this.findMissingSkills(userProfile.skills, job.skills);
      const reasons = this.generateMatchReasons(userProfile, job, matchScore);

      return {
        job_id: job.id,
        match_score: matchScore,
        matching_skills: matchingSkills,
        missing_skills: missingSkills,
        reasons
      };
    });

    // Sort by match score
    matches.sort((a, b) => b.match_score - a.match_score);

    const recommendations = this.generateJobRecommendations(userProfile, matches);

    return {
      matches,
      total_matches: matches.length,
      recommendations
    };
  }

  async optimizeResumeKeywords(
    resumeContent: string,
    jobDescription: string
  ): Promise<{
    suggested_changes: Array<{
      section: string;
      original: string;
      suggested: string;
      reason: string;
    }>;
    keyword_matches: string[];
    missing_keywords: string[];
    ats_score: number;
  }> {
    const resumeSkills = this.extractSkills(resumeContent.toLowerCase());
    const jobSkills = this.extractSkills(jobDescription.toLowerCase());
    
    const keywordMatches = this.findMatchingSkills(resumeSkills, jobSkills);
    const missingKeywords = this.findMissingSkills(resumeSkills, jobSkills);
    
    const suggestedChanges = this.generateKeywordSuggestions(resumeContent, missingKeywords);
    const atsScore = this.calculateKeywordMatchScore(keywordMatches.length, jobSkills.length);

    return {
      suggested_changes: suggestedChanges,
      keyword_matches: keywordMatches,
      missing_keywords: missingKeywords,
      ats_score: atsScore
    };
  }

  // Private helper methods
  private extractSkills(text: string): string[] {
    const foundSkills = [];
    
    for (const skill of this.commonSkills) {
      if (text.includes(skill.toLowerCase())) {
        foundSkills.push(skill);
      }
    }
    
    return [...new Set(foundSkills)]; // Remove duplicates
  }

  private extractExperienceYears(text: string): number {
    const patterns = [
      /(\d+)\+?\s*years?\s*of\s*experience/i,
      /(\d+)\+?\s*years?\s*experience/i,
      /experience\s*:\s*(\d+)\+?\s*years?/i,
      /(\d+)\+?\s*yrs?\s*experience/i
    ];

    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return parseInt(match[1]);
      }
    }

    // Fallback: count job positions
    const jobCount = (text.match(/\b(software engineer|developer|analyst|manager|specialist|coordinator|assistant)\b/gi) || []).length;
    return Math.min(jobCount * 2, 10); // Estimate 2 years per position, max 10
  }

  private checkSections(text: string): {
    contact: boolean;
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
  } {
    return {
      contact: /\b(email|phone|linkedin|github|address)\b/i.test(text),
      summary: /\b(summary|objective|profile|about)\b/i.test(text),
      experience: /\b(experience|employment|work history|professional)\b/i.test(text),
      education: /\b(education|degree|university|college|school)\b/i.test(text),
      skills: /\b(skills|technologies|competencies|expertise)\b/i.test(text)
    };
  }

  private calculateKeywordDensity(text: string): { [key: string]: number } {
    const words = text.split(/\s+/);
    const density: { [key: string]: number } = {};
    
    for (const skill of this.commonSkills) {
      const count = words.filter(word => word.includes(skill.toLowerCase())).length;
      if (count > 0) {
        density[skill] = count / words.length;
      }
    }
    
    return density;
  }

  private calculateATSScore(
    sections: any,
    skills: string[],
    experienceYears: number,
    textLength: number
  ): number {
    let score = 0;
    
    // Section completeness (40 points)
    const sectionCount = Object.values(sections).filter(Boolean).length;
    score += (sectionCount / 5) * 40;
    
    // Skills diversity (30 points)
    score += Math.min(skills.length / 10, 1) * 30;
    
    // Experience (20 points)
    score += Math.min(experienceYears / 5, 1) * 20;
    
    // Content length (10 points)
    const idealLength = 1000; // words
    const lengthScore = Math.min(textLength / idealLength, 1);
    score += lengthScore * 10;
    
    return Math.round(score);
  }

  private generateFeedback(
    sections: any,
    skills: string[],
    experienceYears: number,
    atsScore: number
  ) {
    const strengths = [];
    const improvements = [];
    const suggestions = [];

    // Analyze strengths
    if (skills.length >= 8) strengths.push('Strong technical skill set');
    if (experienceYears >= 3) strengths.push('Good professional experience');
    if (sections.contact && sections.summary) strengths.push('Well-structured format');

    // Analyze improvements
    if (!sections.contact) improvements.push('Add complete contact information');
    if (!sections.summary) improvements.push('Include a professional summary');
    if (skills.length < 5) improvements.push('Add more relevant technical skills');
    if (!sections.education) improvements.push('Include education section');

    // Generate suggestions
    if (atsScore < 70) suggestions.push('Optimize keywords for better ATS compatibility');
    if (skills.length < 10) suggestions.push('Add more industry-specific skills');
    suggestions.push('Use action verbs to describe achievements');
    suggestions.push('Quantify accomplishments with numbers and metrics');

    return { strengths, improvements, suggestions };
  }

  private calculateJobMatchScore(userProfile: any, job: any): number {
    let score = 0;
    
    // Skills match (50%)
    const skillsMatch = this.findMatchingSkills(userProfile.skills, job.skills);
    const skillsScore = (skillsMatch.length / Math.max(job.skills.length, 1)) * 50;
    score += skillsScore;
    
    // Experience level match (30%)
    const userExp = userProfile.experience?.years || 0;
    const jobExpMatch = this.matchExperienceLevel(userExp, job.experience_level);
    score += jobExpMatch * 30;
    
    // Location preference (20%)
    const locationMatch = userProfile.preferences.locations.includes(job.location) ||
                         userProfile.preferences.locations.includes('Remote') ||
                         job.location.toLowerCase().includes('remote');
    if (locationMatch) score += 20;
    
    return Math.round(score);
  }

  private findMatchingSkills(userSkills: string[], jobSkills: string[]): string[] {
    return userSkills.filter(skill => 
      jobSkills.some(jobSkill => 
        jobSkill.toLowerCase().includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(jobSkill.toLowerCase())
      )
    );
  }

  private findMissingSkills(userSkills: string[], jobSkills: string[]): string[] {
    return jobSkills.filter(jobSkill => 
      !userSkills.some(userSkill => 
        userSkill.toLowerCase().includes(jobSkill.toLowerCase()) ||
        jobSkill.toLowerCase().includes(userSkill.toLowerCase())
      )
    );
  }

  private matchExperienceLevel(userYears: number, jobLevel: string): number {
    const level = jobLevel.toLowerCase();
    
    if (level.includes('entry') || level.includes('junior')) {
      return userYears <= 2 ? 1 : 0.7;
    } else if (level.includes('mid') || level.includes('intermediate')) {
      return userYears >= 2 && userYears <= 5 ? 1 : 0.7;
    } else if (level.includes('senior')) {
      return userYears >= 5 ? 1 : 0.5;
    } else if (level.includes('lead') || level.includes('principal')) {
      return userYears >= 7 ? 1 : 0.3;
    }
    
    return 0.8; // Default moderate match
  }

  private generateMatchReasons(userProfile: any, job: any, matchScore: number): string[] {
    const reasons = [];
    
    if (matchScore >= 80) {
      reasons.push('Excellent skill alignment');
    } else if (matchScore >= 60) {
      reasons.push('Good skill match with room for growth');
    } else {
      reasons.push('Some relevant skills, significant learning opportunity');
    }
    
    const matchingSkills = this.findMatchingSkills(userProfile.skills, job.skills);
    if (matchingSkills.length > 0) {
      reasons.push(`Matching skills: ${matchingSkills.slice(0, 3).join(', ')}`);
    }
    
    return reasons;
  }

  private generateJobRecommendations(userProfile: any, matches: any[]): string[] {
    const recommendations = [];
    
    if (matches.length === 0) {
      recommendations.push('Consider expanding your skill set to match more opportunities');
      return recommendations;
    }
    
    const topMatch = matches[0];
    if (topMatch.match_score >= 80) {
      recommendations.push('You have excellent matches! Apply to top-scoring positions first');
    } else if (topMatch.match_score >= 60) {
      recommendations.push('Focus on positions with 60%+ match scores');
    } else {
      recommendations.push('Consider skill development to improve match scores');
    }
    
    // Analyze missing skills across top matches
    const allMissingSkills = matches.slice(0, 5).flatMap(m => m.missing_skills);
    const skillFrequency = {};
    allMissingSkills.forEach(skill => {
      skillFrequency[skill] = (skillFrequency[skill] || 0) + 1;
    });
    
    const topMissingSkills = Object.entries(skillFrequency)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([skill]) => skill);
    
    if (topMissingSkills.length > 0) {
      recommendations.push(`Consider learning: ${topMissingSkills.join(', ')}`);
    }
    
    return recommendations;
  }

  private generateKeywordSuggestions(
    resumeContent: string,
    missingKeywords: string[]
  ): Array<{
    section: string;
    original: string;
    suggested: string;
    reason: string;
  }> {
    const suggestions = [];
    
    // Suggest adding missing keywords to skills section
    if (missingKeywords.length > 0) {
      suggestions.push({
        section: 'Skills',
        original: 'Current skills list',
        suggested: `Add: ${missingKeywords.slice(0, 5).join(', ')}`,
        reason: 'These keywords appear in the job description but not in your resume'
      });
    }
    
    // Suggest improving summary section
    if (!resumeContent.toLowerCase().includes('summary')) {
      suggestions.push({
        section: 'Summary',
        original: 'Missing professional summary',
        suggested: 'Add a 2-3 line professional summary highlighting your key skills',
        reason: 'Professional summary improves ATS scanning and recruiter engagement'
      });
    }
    
    return suggestions;
  }

  private calculateKeywordMatchScore(matchingCount: number, totalJobKeywords: number): number {
    if (totalJobKeywords === 0) return 85; // Default score if no keywords to match
    return Math.round((matchingCount / totalJobKeywords) * 100);
  }
}
