import { Injectable, Logger } from '@nestjs/common';
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');

export interface ResumeAnalysisResult {
  ats_score: number;
  detailed_scores: {
    formatting: number;
    content_quality: number;
    keyword_optimization: number;
    section_completeness: number;
    readability: number;
  };
  feedback: {
    strengths: string[];
    improvements: string[];
    suggestions: string[];
    critical_issues: string[];
  };
  skills: string[];
  experience_years: number;
  sections: {
    contact: boolean;
    summary: boolean;
    experience: boolean;
    education: boolean;
    skills: boolean;
    projects: boolean;
    certifications: boolean;
  };
  keyword_density: { [key: string]: number };
  content_analysis: {
    word_count: number;
    has_quantified_achievements: boolean;
    action_verbs_count: number;
    grammar_issues: string[];
    formatting_issues: string[];
  };
  ats_compatibility: {
    score: number;
    issues: string[];
    recommendations: string[];
  };
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

  // Comprehensive skills database
  private readonly commonSkills = [
    // Programming Languages
    'javascript', 'python', 'java', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
    'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css', 'dart', 'perl',
    
    // Frameworks & Libraries
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
    'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'sass', 'less', 'next.js', 'nuxt.js',
    
    // Databases
    'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'oracle',
    'sqlite', 'dynamodb', 'firebase', 'neo4j', 'influxdb', 'couchdb',
    
    // Cloud & DevOps
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github actions',
    'terraform', 'ansible', 'chef', 'puppet', 'nginx', 'apache', 'ci/cd', 'devops',
    
    // Tools & Technologies
    'git', 'jira', 'confluence', 'slack', 'figma', 'photoshop', 'illustrator', 'sketch',
    'postman', 'swagger', 'rest api', 'graphql', 'microservices', 'agile', 'scrum',
    
    // Soft Skills
    'leadership', 'communication', 'teamwork', 'problem solving', 'project management',
    'time management', 'analytical thinking', 'creativity', 'adaptability', 'critical thinking'
  ];

  // Action verbs for achievement analysis
  private readonly actionVerbs = [
    'achieved', 'accomplished', 'improved', 'increased', 'decreased', 'reduced', 'developed',
    'created', 'designed', 'implemented', 'managed', 'led', 'supervised', 'coordinated',
    'optimized', 'streamlined', 'enhanced', 'delivered', 'executed', 'launched', 'built',
    'established', 'initiated', 'transformed', 'revolutionized', 'spearheaded'
  ];

  // Common formatting issues
  private readonly formattingPatterns = {
    inconsistentDates: /\d{4}.*\d{4}/g,
    emailPattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    phonePattern: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
    bulletPoints: /^[\s]*[•·▪▫◦‣⁃]\s*/gm
  };

  constructor() {
    this.logger.log('Built-in AI service initialized');
  }

  async analyzeResumeFile(fileBuffer: Buffer, fileName: string): Promise<ResumeAnalysisResult> {
    try {
      let text = '';
      let extractionMethod = 'unknown';
      
      if (fileName.toLowerCase().endsWith('.pdf')) {
        try {
          this.logger.log(`Attempting to parse PDF file: ${fileName}`);
          
          // Enhanced PDF parsing with better options
          const pdfData = await pdfParse(fileBuffer, {
            // Normalize whitespace and handle special characters
            normalizeWhitespace: true,
            // Don't stop on first error
            stopAtFirstError: false,
            // Maximum pages to parse (prevent timeout on large files)
            max: 50
          });
          
          text = pdfData.text || '';
          extractionMethod = 'pdf-parse';
          
          // Post-process PDF text to improve quality
          text = this.cleanPdfText(text);
          
          this.logger.log(`Successfully extracted ${text.length} characters from PDF using ${extractionMethod}`);
          
          // If text is too short, it might be an image-based PDF
          if (text.trim().length < 50) {
            this.logger.warn(`PDF contains minimal text (${text.length} chars), might be image-based`);
            text += '\n\nNote: This PDF appears to contain mostly images or has poor text extraction. Consider using a text-based PDF format for better analysis.';
          }
          
        } catch (pdfError) {
          this.logger.warn(`PDF parsing failed for ${fileName}:`, pdfError.message);
          text = this.generateFallbackContent(fileName, fileBuffer, 'PDF', pdfError.message);
          extractionMethod = 'fallback';
        }
        
      } else if (fileName.toLowerCase().endsWith('.docx')) {
        try {
          this.logger.log(`Attempting to parse DOCX file: ${fileName}`);
          const result = await mammoth.extractRawText({ buffer: fileBuffer });
          text = result.value || '';
          extractionMethod = 'mammoth-docx';
          
          if (result.messages && result.messages.length > 0) {
            this.logger.warn(`DOCX parsing warnings:`, result.messages);
          }
          
          this.logger.log(`Successfully extracted ${text.length} characters from DOCX`);
          
        } catch (docxError) {
          this.logger.warn(`DOCX parsing failed for ${fileName}:`, docxError.message);
          text = this.generateFallbackContent(fileName, fileBuffer, 'DOCX', docxError.message);
          extractionMethod = 'fallback';
        }
        
      } else if (fileName.toLowerCase().endsWith('.doc')) {
        // DOC files are more complex, provide guidance
        text = this.generateFallbackContent(fileName, fileBuffer, 'DOC', 'Legacy DOC format not fully supported');
        extractionMethod = 'fallback';
        
      } else {
        // Plain text files
        try {
          text = fileBuffer.toString('utf-8');
          extractionMethod = 'utf-8';
          
          // Validate UTF-8 encoding
          if (text.includes('�')) {
            // Try different encodings
            text = fileBuffer.toString('latin1');
            extractionMethod = 'latin1';
          }
          
        } catch (encodingError) {
          text = this.generateFallbackContent(fileName, fileBuffer, 'TEXT', encodingError.message);
          extractionMethod = 'fallback';
        }
      }

      // Final validation and enhancement
      if (!text || text.trim().length === 0) {
        throw new Error('No text content could be extracted from the file');
      }

      // Add metadata about extraction
      const analysisResult = await this.analyzeResumeText(text);
      
      // Add extraction metadata to the result
      (analysisResult as any).extraction_info = {
        method: extractionMethod,
        original_length: text.length,
        file_type: fileName.split('.').pop()?.toUpperCase(),
        file_size: fileBuffer.length
      };

      return analysisResult;
      
    } catch (error) {
      this.logger.error('Error analyzing resume file:', error);
      throw new Error(`Failed to analyze resume file: ${error.message}`);
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
    
    // Analyze content quality
    const contentAnalysis = this.analyzeContent(text);
    
    // Calculate detailed scores
    const detailedScores = this.calculateDetailedScores(sections, skills, experienceYears, text, contentAnalysis);
    
    // Calculate overall ATS score
    const atsScore = Math.round(
      (detailedScores.formatting + detailedScores.content_quality + 
       detailedScores.keyword_optimization + detailedScores.section_completeness + 
       detailedScores.readability) / 5
    );
    
    // Analyze ATS compatibility
    const atsCompatibility = this.analyzeATSCompatibility(text, sections, contentAnalysis);
    
    // Generate comprehensive feedback
    const feedback = this.generateComprehensiveFeedback(sections, skills, experienceYears, atsScore, contentAnalysis, atsCompatibility);

    return {
      ats_score: atsScore,
      detailed_scores: detailedScores,
      feedback,
      skills,
      experience_years: experienceYears,
      sections,
      keyword_density: keywordDensity,
      content_analysis: contentAnalysis,
      ats_compatibility: atsCompatibility
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
    projects: boolean;
    certifications: boolean;
  } {
    const normalizedText = text.toLowerCase();
    
    return {
      contact: this.detectContactSection(normalizedText),
      summary: this.detectSummarySection(normalizedText),
      experience: this.detectExperienceSection(normalizedText),
      education: this.detectEducationSection(normalizedText),
      skills: this.detectSkillsSection(normalizedText),
      projects: this.detectProjectsSection(normalizedText),
      certifications: this.detectCertificationsSection(normalizedText)
    };
  }

  private detectContactSection(text: string): boolean {
    // Enhanced contact detection
    const contactPatterns = [
      /\b(email|phone|linkedin|github|address|contact)\b/i,
      /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
      /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
      /linkedin\.com\/in\/[a-zA-Z0-9-]+/i,
      /github\.com\/[a-zA-Z0-9-]+/i
    ];
    
    return contactPatterns.some(pattern => pattern.test(text));
  }

  private detectSummarySection(text: string): boolean {
    const summaryPatterns = [
      /\b(summary|objective|profile|about|overview)\b/i,
      /professional\s+(summary|profile)/i,
      /career\s+(objective|summary)/i,
      /personal\s+(statement|profile)/i
    ];
    
    return summaryPatterns.some(pattern => pattern.test(text));
  }

  private detectExperienceSection(text: string): boolean {
    const experiencePatterns = [
      /\b(experience|employment|work history|professional|career)\b/i,
      /work\s+experience/i,
      /professional\s+experience/i,
      /employment\s+history/i,
      /\d{4}\s*[-–—]\s*(\d{4}|present|current)/i, // Date ranges
      /(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+\d{4}/i
    ];
    
    return experiencePatterns.some(pattern => pattern.test(text));
  }

  private detectEducationSection(text: string): boolean {
    const educationPatterns = [
      /\b(education|degree|university|college|school|academic)\b/i,
      /bachelor|master|phd|doctorate|diploma/i,
      /\b(bs|ba|ms|ma|mba|phd)\b/i,
      /graduated|graduation/i,
      /gpa|grade point average/i
    ];
    
    return educationPatterns.some(pattern => pattern.test(text));
  }

  private detectSkillsSection(text: string): boolean {
    const skillsPatterns = [
      /\b(skills|technologies|competencies|expertise|technical skills)\b/i,
      /programming\s+(languages|skills)/i,
      /technical\s+(skills|competencies)/i,
      /core\s+(competencies|skills)/i,
      // Check for common technical skills
      /(javascript|python|java|react|angular|vue|node\.js|sql)/i
    ];
    
    return skillsPatterns.some(pattern => pattern.test(text));
  }

  private detectProjectsSection(text: string): boolean {
    const projectsPatterns = [
      /\b(projects|portfolio|work samples|achievements)\b/i,
      /personal\s+projects/i,
      /side\s+projects/i,
      /open\s+source/i,
      /github\.com/i
    ];
    
    return projectsPatterns.some(pattern => pattern.test(text));
  }

  private detectCertificationsSection(text: string): boolean {
    const certificationPatterns = [
      /\b(certifications|certificates|licenses|credentials)\b/i,
      /professional\s+(certification|license)/i,
      /certified\s+(in|as)/i,
      /(aws|azure|google cloud|cisco|microsoft)\s+(certified|certification)/i
    ];
    
    return certificationPatterns.some(pattern => pattern.test(text));
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

  // New comprehensive analysis methods
  private analyzeContent(text: string) {
    const wordCount = text.split(/\s+/).length;
    
    // Check for quantified achievements (numbers, percentages, etc.)
    const quantifiedPattern = /\d+(\.\d+)?%?|\$\d+|\d+\+?/g;
    const hasQuantifiedAchievements = quantifiedPattern.test(text);
    
    // Count action verbs
    const actionVerbsCount = this.actionVerbs.filter(verb => 
      text.toLowerCase().includes(verb)
    ).length;
    
    // Basic grammar and formatting checks
    const grammarIssues = [];
    const formattingIssues = [];
    
    // Check for common grammar issues
    if (text.includes('  ')) grammarIssues.push('Multiple consecutive spaces found');
    if (!/[A-Z]/.test(text.charAt(0))) grammarIssues.push('Document should start with capital letter');
    
    // Check formatting consistency
    if (!this.formattingPatterns.emailPattern.test(text)) formattingIssues.push('No email address found');
    if (!this.formattingPatterns.phonePattern.test(text)) formattingIssues.push('No phone number found');
    
    return {
      word_count: wordCount,
      has_quantified_achievements: hasQuantifiedAchievements,
      action_verbs_count: actionVerbsCount,
      grammar_issues: grammarIssues,
      formatting_issues: formattingIssues
    };
  }

  private calculateDetailedScores(sections: any, skills: string[], experienceYears: number, text: string, contentAnalysis: any) {
    // Formatting Score (0-100)
    let formattingScore = 70; // Base score
    if (contentAnalysis.grammar_issues.length === 0) formattingScore += 15;
    if (contentAnalysis.formatting_issues.length === 0) formattingScore += 15;
    
    // Content Quality Score (0-100)
    let contentQualityScore = 50; // Base score
    if (contentAnalysis.has_quantified_achievements) contentQualityScore += 20;
    if (contentAnalysis.action_verbs_count >= 5) contentQualityScore += 15;
    if (contentAnalysis.word_count >= 300 && contentAnalysis.word_count <= 800) contentQualityScore += 15;
    
    // Keyword Optimization Score (0-100)
    const keywordOptimizationScore = Math.min(skills.length * 8, 100);
    
    // Section Completeness Score (0-100)
    const sectionCount = Object.values(sections).filter(Boolean).length;
    const sectionCompletenessScore = (sectionCount / 7) * 100;
    
    // Readability Score (0-100)
    let readabilityScore = 70; // Base score
    if (contentAnalysis.word_count >= 200) readabilityScore += 15;
    if (text.split('\n').length >= 10) readabilityScore += 15; // Good structure
    
    return {
      formatting: Math.round(Math.min(formattingScore, 100)),
      content_quality: Math.round(Math.min(contentQualityScore, 100)),
      keyword_optimization: Math.round(keywordOptimizationScore),
      section_completeness: Math.round(sectionCompletenessScore),
      readability: Math.round(Math.min(readabilityScore, 100))
    };
  }

  private analyzeATSCompatibility(text: string, sections: any, contentAnalysis: any) {
    let score = 80; // Base ATS score
    const issues = [];
    const recommendations = [];
    
    // Check for ATS-unfriendly elements
    if (text.includes('|') || text.includes('┃')) {
      score -= 10;
      issues.push('Contains table-like formatting that may not parse well');
      recommendations.push('Use simple bullet points instead of tables or columns');
    }
    
    if (!sections.contact) {
      score -= 15;
      issues.push('Missing contact information');
      recommendations.push('Add complete contact information at the top');
    }
    
    if (!sections.summary) {
      score -= 10;
      issues.push('Missing professional summary');
      recommendations.push('Add a 2-3 line professional summary');
    }
    
    if (contentAnalysis.word_count < 200) {
      score -= 15;
      issues.push('Resume content is too brief');
      recommendations.push('Expand descriptions with more detail and achievements');
    }
    
    if (contentAnalysis.word_count > 1000) {
      score -= 10;
      issues.push('Resume content is too lengthy');
      recommendations.push('Condense content to 1-2 pages maximum');
    }
    
    return {
      score: Math.max(score, 0),
      issues,
      recommendations
    };
  }

  private generateComprehensiveFeedback(
    sections: any,
    skills: string[],
    experienceYears: number,
    atsScore: number,
    contentAnalysis: any,
    atsCompatibility: any
  ) {
    const strengths = [];
    const improvements = [];
    const suggestions = [];
    const criticalIssues = [];

    // Analyze strengths
    if (skills.length >= 10) strengths.push('Excellent technical skill diversity');
    else if (skills.length >= 6) strengths.push('Good technical skill set');
    
    if (experienceYears >= 5) strengths.push('Strong professional experience');
    else if (experienceYears >= 2) strengths.push('Solid professional background');
    
    if (sections.contact && sections.summary && sections.experience) {
      strengths.push('Well-structured resume format');
    }
    
    if (contentAnalysis.has_quantified_achievements) {
      strengths.push('Includes quantified achievements');
    }
    
    if (contentAnalysis.action_verbs_count >= 5) {
      strengths.push('Uses strong action verbs');
    }

    // Critical issues (must fix)
    if (!sections.contact) criticalIssues.push('Missing contact information - add email, phone, and location');
    if (!sections.experience) criticalIssues.push('Missing work experience section');
    if (skills.length < 3) criticalIssues.push('Too few technical skills listed');
    if (atsCompatibility.score < 50) criticalIssues.push('Poor ATS compatibility - major formatting issues detected');

    // Improvements (should fix)
    if (!sections.summary) improvements.push('Add a professional summary or objective statement');
    if (!sections.education) improvements.push('Include education background');
    if (!sections.skills) improvements.push('Add a dedicated skills section');
    if (skills.length < 8) improvements.push('Expand technical skills list');
    if (!contentAnalysis.has_quantified_achievements) {
      improvements.push('Add quantified achievements (numbers, percentages, metrics)');
    }
    if (contentAnalysis.action_verbs_count < 3) {
      improvements.push('Use more action verbs to describe accomplishments');
    }

    // Generate personalized suggestions
    const personalizedSuggestions = this.generatePersonalizedSuggestions(
      sections, 
      skills, 
      experienceYears, 
      atsScore, 
      contentAnalysis
    );
    suggestions.push(...personalizedSuggestions);

    return { strengths, improvements, suggestions, critical_issues: criticalIssues };
  }

  private generatePersonalizedSuggestions(
    sections: any,
    skills: string[],
    experienceYears: number,
    atsScore: number,
    contentAnalysis: any
  ): string[] {
    const suggestions = [];

    // Experience-level specific suggestions
    if (experienceYears === 0) {
      suggestions.push('Highlight academic projects, hackathons, and personal coding projects to demonstrate practical skills');
      suggestions.push('Include relevant coursework, online certifications, and bootcamp experience');
      suggestions.push('Consider adding a portfolio section with links to your best work');
    } else if (experienceYears <= 2) {
      suggestions.push('Emphasize your rapid learning and adaptability in your early career roles');
      suggestions.push('Highlight specific technologies you\'ve mastered and projects you\'ve contributed to');
      suggestions.push('Include any mentorship, training programs, or professional development activities');
    } else if (experienceYears <= 5) {
      suggestions.push('Focus on leadership opportunities and cross-functional collaboration experiences');
      suggestions.push('Quantify your impact on team productivity and project success rates');
      suggestions.push('Consider pursuing senior-level certifications in your technology stack');
    } else if (experienceYears <= 10) {
      suggestions.push('Emphasize your role in architectural decisions and technical strategy');
      suggestions.push('Highlight experience mentoring junior developers and leading technical initiatives');
      suggestions.push('Include examples of process improvements and team scaling you\'ve driven');
    } else {
      suggestions.push('Focus on executive-level achievements and organizational transformation');
      suggestions.push('Highlight your experience in building engineering teams and technical culture');
      suggestions.push('Include examples of strategic technology decisions and their business impact');
    }

    // Skills-based personalized suggestions
    const techSkills = skills.map(s => s.toLowerCase());
    
    if (techSkills.some(skill => ['javascript', 'react', 'vue', 'angular'].some(tech => skill.includes(tech)))) {
      if (experienceYears < 3) {
        suggestions.push('Consider adding modern frontend tools like TypeScript, Next.js, or state management libraries');
      } else {
        suggestions.push('Highlight your experience with performance optimization, accessibility, and modern deployment practices');
      }
    }

    if (techSkills.some(skill => ['python', 'django', 'flask'].some(tech => skill.includes(tech)))) {
      if (skills.length < 8) {
        suggestions.push('Consider adding complementary Python skills like data analysis (pandas), testing (pytest), or cloud deployment');
      } else {
        suggestions.push('Highlight any machine learning, data science, or automation projects using Python');
      }
    }

    if (techSkills.some(skill => ['aws', 'azure', 'gcp', 'cloud'].some(tech => skill.includes(tech)))) {
      suggestions.push('Specify your cloud certification level and include specific services you\'ve implemented (Lambda, EC2, Kubernetes)');
    } else if (experienceYears > 1) {
      suggestions.push('Consider adding cloud platform experience (AWS, Azure, or GCP) as it\'s highly valued in the current market');
    }

    if (techSkills.some(skill => ['java', 'spring', 'kotlin'].some(tech => skill.includes(tech)))) {
      suggestions.push('Highlight enterprise-level Java experience, microservices architecture, or Spring Boot applications');
    }

    // Section-based suggestions
    if (!sections.projects && experienceYears < 5) {
      suggestions.push('Add a projects section showcasing 2-3 significant projects with technologies used and outcomes achieved');
    }

    if (!sections.certifications) {
      if (techSkills.some(skill => ['aws', 'azure', 'cloud'].some(tech => skill.includes(tech)))) {
        suggestions.push('Pursue cloud certifications (AWS Solutions Architect, Azure Developer) to validate your expertise');
      } else if (techSkills.some(skill => ['javascript', 'react', 'frontend'].some(tech => skill.includes(tech)))) {
        suggestions.push('Consider frontend certifications or specialized training in modern frameworks and tools');
      } else {
        suggestions.push('Add industry-relevant certifications or professional development courses you\'ve completed');
      }
    }

    // Content quality suggestions
    if (contentAnalysis.word_count < 300) {
      suggestions.push('Expand your experience descriptions with specific technologies, methodologies, and quantifiable results');
    } else if (contentAnalysis.word_count > 700) {
      suggestions.push('Streamline your content by focusing on the most impactful achievements and removing redundant information');
    }

    if (contentAnalysis.action_verbs_count < 5) {
      suggestions.push('Replace passive descriptions with strong action verbs like "architected," "optimized," "implemented," or "scaled"');
    }

    // ATS optimization suggestions
    if (atsScore < 70) {
      suggestions.push('Incorporate more industry-standard keywords and technical terms relevant to your target roles');
      suggestions.push('Use standard section headings and avoid complex formatting that might confuse ATS systems');
    } else if (atsScore < 85) {
      suggestions.push('Fine-tune your keyword density by naturally incorporating more role-specific terminology');
    }

    // Professional presentation suggestions
    if (!sections.summary) {
      suggestions.push('Add a compelling professional summary that highlights your unique value proposition and career focus');
    }

    // Modern resume trends
    if (experienceYears > 0) {
      suggestions.push('Include links to your professional profiles (LinkedIn, GitHub) to provide additional context for recruiters');
    }

    if (skills.length > 10) {
      suggestions.push('Organize your skills into categories (Programming Languages, Frameworks, Tools) for better readability');
    }

    // Industry-specific suggestions based on skills
    if (techSkills.some(skill => ['react', 'vue', 'angular', 'frontend'].some(tech => skill.includes(tech)))) {
      suggestions.push('Highlight your experience with responsive design, cross-browser compatibility, and modern CSS frameworks');
    }

    if (techSkills.some(skill => ['node', 'express', 'backend', 'api'].some(tech => skill.includes(tech)))) {
      suggestions.push('Emphasize your API design experience, database optimization, and server-side architecture decisions');
    }

    if (techSkills.some(skill => ['docker', 'kubernetes', 'devops'].some(tech => skill.includes(tech)))) {
      suggestions.push('Detail your experience with CI/CD pipelines, infrastructure as code, and deployment automation');
    }

    // Return a curated list of 4-6 most relevant suggestions
    return suggestions.slice(0, Math.min(6, suggestions.length));
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

  // Helper methods for enhanced file processing
  private cleanPdfText(text: string): string {
    if (!text) return '';
    
    // Remove excessive whitespace and normalize line breaks
    let cleaned = text
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]{2,}/g, ' ')
      .trim();
    
    // Fix common PDF extraction issues
    cleaned = cleaned
      // Fix broken words (common in PDF extraction)
      .replace(/([a-z])\s+([a-z])/g, '$1$2')
      // Fix email addresses that might be broken
      .replace(/([a-zA-Z0-9._%+-]+)\s*@\s*([a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '$1@$2')
      // Fix phone numbers
      .replace(/(\d{3})\s*[-.]?\s*(\d{3})\s*[-.]?\s*(\d{4})/g, '$1-$2-$3')
      // Fix URLs
      .replace(/(https?:\/\/)\s*([^\s]+)/g, '$1$2');
    
    return cleaned;
  }

  private generateFallbackContent(fileName: string, fileBuffer: Buffer, fileType: string, errorMessage: string): string {
    const fileSizeMB = (fileBuffer.length / (1024 * 1024)).toFixed(2);
    
    return `Resume Analysis - ${fileName}
File Type: ${fileType}
File Size: ${fileSizeMB} MB
Status: Content extraction failed

Error Details: ${errorMessage}

Recommendations:
• For PDF files: Ensure the PDF contains selectable text (not just images)
• For DOCX files: Try saving as a newer format or convert to PDF
• For DOC files: Convert to DOCX or PDF format
• Consider using a plain text version for best compatibility

Fallback Analysis:
Based on the filename and file properties, this appears to be a resume document.
To get a complete analysis, please provide a text-based version of your resume.`;
  }

  private enhanceContentExtraction(text: string): string {
    // Enhanced content extraction with better section detection
    const lines = text.split('\n');
    const enhancedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines
      if (!line) {
        enhancedLines.push('');
        continue;
      }
      
      // Detect and enhance section headers
      if (this.isSectionHeader(line)) {
        enhancedLines.push(`\n=== ${line.toUpperCase()} ===`);
        continue;
      }
      
      // Detect and enhance contact information
      if (this.isContactInfo(line)) {
        enhancedLines.push(`CONTACT: ${line}`);
        continue;
      }
      
      // Detect and enhance dates
      const dateEnhanced = this.enhanceDateFormats(line);
      enhancedLines.push(dateEnhanced);
    }
    
    return enhancedLines.join('\n');
  }

  private isSectionHeader(line: string): boolean {
    const sectionKeywords = [
      'experience', 'education', 'skills', 'summary', 'objective', 
      'projects', 'certifications', 'achievements', 'awards', 'contact',
      'work history', 'employment', 'qualifications', 'profile'
    ];
    
    const normalizedLine = line.toLowerCase();
    return sectionKeywords.some(keyword => 
      normalizedLine === keyword || 
      (normalizedLine.length <= 20 && normalizedLine.includes(keyword))
    );
  }

  private isContactInfo(line: string): boolean {
    const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
    const phonePattern = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    const linkedinPattern = /linkedin\.com\/in\/[a-zA-Z0-9-]+/i;
    
    return emailPattern.test(line) || phonePattern.test(line) || linkedinPattern.test(line);
  }

  private enhanceDateFormats(line: string): string {
    // Enhance date recognition and formatting
    const datePatterns = [
      /(\d{1,2}\/\d{1,2}\/\d{4})/g,
      /(\d{4}-\d{1,2}-\d{1,2})/g,
      /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}/gi,
      /(\d{4})\s*[-–—]\s*(\d{4}|Present|Current)/gi
    ];
    
    let enhanced = line;
    datePatterns.forEach(pattern => {
      enhanced = enhanced.replace(pattern, (match) => `[DATE: ${match}]`);
    });
    
    return enhanced;
  }
}
