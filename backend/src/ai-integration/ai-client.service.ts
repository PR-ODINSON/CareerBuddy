import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { BuiltInAiService } from './built-in-ai.service';

export interface ResumeAnalysisResult {
  parsed_data: {
    contact_info: any;
    summary: string;
    experience: any[];
    education: any[];
    skills: string[];
    achievements: string[];
    keywords: string[];
  };
  ats_score: {
    overall_score: number;
    formatting_score: number;
    content_score: number;
    keyword_score: number;
  };
  feedback: Array<{
    type: string;
    category: string;
    title: string;
    description: string;
    severity: string;
    suggestion?: string;
    line_number?: number;
    section?: string;
  }>;
  overall_score: number;
}

export interface JobMatchResult {
  recommendations: Array<{
    job_id: string;
    match_score: number;
    reasoning: string;
    missing_skills: string[];
    matching_skills: string[];
  }>;
  insights: {
    total_jobs_analyzed: number;
    avg_match_score: number;
    top_missing_skills: string[];
    recommended_learning_path: string[];
  };
}

export interface SkillsGapAnalysis {
  missing_skills: string[];
  matching_skills: string[];
  skill_categories: {
    technical: string[];
    soft: string[];
    tools: string[];
    languages: string[];
  };
  recommendations: Array<{
    skill: string;
    priority: string;
    learning_resources: string[];
  }>;
}

@Injectable()
export class AiClientService {
  private readonly logger = new Logger(AiClientService.name);
  private readonly resumeAnalyzerClient: AxiosInstance;
  private readonly jobMatcherClient: AxiosInstance;

  constructor(
    private configService: ConfigService,
    private builtInAiService: BuiltInAiService
  ) {
    const resumeAnalyzerUrl = this.configService.get<string>(
      'AI_RESUME_ANALYZER_URL',
      'http://localhost:8001'
    );
    const jobMatcherUrl = this.configService.get<string>(
      'AI_JOB_MATCHER_URL',
      'http://localhost:8002'
    );

    this.resumeAnalyzerClient = axios.create({
      baseURL: resumeAnalyzerUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.jobMatcherClient = axios.create({
      baseURL: jobMatcherUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  // ====== RESUME ANALYSIS METHODS ======

  async analyzeResumeFile(fileBuffer: Buffer, fileName: string): Promise<ResumeAnalysisResult> {
    try {
      // Use built-in AI service instead of microservice
      const builtInResult = await this.builtInAiService.analyzeResumeFile(fileBuffer, fileName);
      
      // Convert built-in result to expected format
      const result: ResumeAnalysisResult = {
        parsed_data: {
          contact_info: builtInResult.sections.contact ? { available: true } : {},
          summary: builtInResult.sections.summary ? 'Summary section detected' : '',
          experience: builtInResult.experience_years > 0 ? [`${builtInResult.experience_years} years experience`] : [],
          education: builtInResult.sections.education ? ['Education section detected'] : [],
          skills: builtInResult.skills,
          achievements: [],
          keywords: Object.keys(builtInResult.keyword_density)
        },
        ats_score: {
          overall_score: builtInResult.ats_score,
          formatting_score: builtInResult.sections.contact && builtInResult.sections.summary ? 85 : 60,
          content_score: builtInResult.skills.length > 5 ? 80 : 60,
          keyword_score: Math.min(builtInResult.skills.length * 10, 100)
        },
        feedback: builtInResult.feedback.improvements.map(improvement => ({
          type: 'improvement',
          category: 'content',
          title: improvement,
          description: improvement,
          severity: 'medium'
        })).concat(
          builtInResult.feedback.suggestions.map(suggestion => ({
            type: 'suggestion',
            category: 'optimization',
            title: suggestion,
            description: suggestion,
            severity: 'low'
          }))
        ),
        overall_score: builtInResult.ats_score
      };

      this.logger.log(`Resume analysis completed for file: ${fileName} (Built-in AI)`);
      return result;
    } catch (error) {
      this.logger.error(`Resume analysis failed for file: ${fileName}`, error);
      throw new BadRequestException('Resume analysis failed. Please try again.');
    }
  }

  async analyzeResumeText(content: string): Promise<ResumeAnalysisResult> {
    try {
      // Use built-in AI service instead of microservice
      const builtInResult = await this.builtInAiService.analyzeResumeText(content);
      
      // Convert built-in result to expected format (same as analyzeResumeFile)
      const result: ResumeAnalysisResult = {
        parsed_data: {
          contact_info: builtInResult.sections.contact ? { available: true } : {},
          summary: builtInResult.sections.summary ? 'Summary section detected' : '',
          experience: builtInResult.experience_years > 0 ? [`${builtInResult.experience_years} years experience`] : [],
          education: builtInResult.sections.education ? ['Education section detected'] : [],
          skills: builtInResult.skills,
          achievements: [],
          keywords: Object.keys(builtInResult.keyword_density)
        },
        ats_score: {
          overall_score: builtInResult.ats_score,
          formatting_score: builtInResult.sections.contact && builtInResult.sections.summary ? 85 : 60,
          content_score: builtInResult.skills.length > 5 ? 80 : 60,
          keyword_score: Math.min(builtInResult.skills.length * 10, 100)
        },
        feedback: builtInResult.feedback.improvements.map(improvement => ({
          type: 'improvement',
          category: 'content',
          title: improvement,
          description: improvement,
          severity: 'medium'
        })).concat(
          builtInResult.feedback.suggestions.map(suggestion => ({
            type: 'suggestion',
            category: 'optimization',
            title: suggestion,
            description: suggestion,
            severity: 'low'
          }))
        ),
        overall_score: builtInResult.ats_score
      };

      this.logger.log('Resume text analysis completed (Built-in AI)');
      return result;
    } catch (error) {
      this.logger.error('Resume text analysis failed', error);
      throw new BadRequestException('Resume analysis failed. Please try again.');
    }
  }

  async extractSkills(content: string): Promise<{
    technical_skills: string[];
    soft_skills: string[];
    languages: string[];
    certifications: string[];
    tools: string[];
  }> {
    try {
      const response = await this.resumeAnalyzerClient.post('/extract/skills', {
        content,
      });

      this.logger.log('Skills extraction completed');
      return response.data;
    } catch (error) {
      this.logger.error('Skills extraction failed', error);
      throw new BadRequestException('Skills extraction failed. Please try again.');
    }
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
    try {
      const response = await this.resumeAnalyzerClient.post('/optimize/keywords', {
        resume_content: resumeContent,
        job_description: jobDescription,
      });

      this.logger.log('Resume keyword optimization completed');
      return response.data;
    } catch (error) {
      this.logger.error('Resume keyword optimization failed', error);
      throw new BadRequestException('Resume optimization failed. Please try again.');
    }
  }

  // ====== JOB MATCHING METHODS ======

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
    }>,
    preferences: any = {}
  ): Promise<JobMatchResult> {
    try {
      const response = await this.jobMatcherClient.post('/match/jobs', {
        user_profile: userProfile,
        jobs,
        preferences,
      });

      this.logger.log(`Job matching completed for ${jobs.length} jobs`);
      return response.data;
    } catch (error) {
      this.logger.error('Job matching failed', error);
      throw new BadRequestException('Job matching failed. Please try again.');
    }
  }

  async generateJobRecommendations(
    userProfile: {
      skills: string[];
      experience: any;
      preferences: any;
    },
    jobHistory: any[] = [],
    preferences: any = {},
    limit: number = 10
  ): Promise<JobMatchResult> {
    try {
      const response = await this.jobMatcherClient.post('/recommendations', {
        user_profile: userProfile,
        job_history: jobHistory,
        preferences,
        limit,
      });

      this.logger.log(`Job recommendations generated (limit: ${limit})`);
      return response.data;
    } catch (error) {
      this.logger.error('Job recommendations generation failed', error);
      throw new BadRequestException('Job recommendations failed. Please try again.');
    }
  }

  async analyzeSkillsGap(
    userSkills: string[],
    jobRequirements: string[]
  ): Promise<SkillsGapAnalysis> {
    try {
      const response = await this.jobMatcherClient.post('/analyze/skills-gap', {
        user_skills: userSkills,
        job_requirements: jobRequirements,
      });

      this.logger.log('Skills gap analysis completed');
      return response.data;
    } catch (error) {
      this.logger.error('Skills gap analysis failed', error);
      throw new BadRequestException('Skills gap analysis failed. Please try again.');
    }
  }

  async calculateJobSimilarity(
    job1Description: string,
    job2Description: string
  ): Promise<{ similarity_score: number }> {
    try {
      const response = await this.jobMatcherClient.post('/match/similarity', {
        job1_description: job1Description,
        job2_description: job2Description,
      });

      this.logger.log('Job similarity calculation completed');
      return response.data;
    } catch (error) {
      this.logger.error('Job similarity calculation failed', error);
      throw new BadRequestException('Job similarity calculation failed. Please try again.');
    }
  }

  async predictJobFit(
    userProfile: {
      skills: string[];
      experience: any;
      preferences: any;
    },
    jobDescription: string,
    jobRequirements: string[]
  ): Promise<{
    fit_score: number;
    confidence: number;
    reasoning: string;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }> {
    try {
      const response = await this.jobMatcherClient.post('/predict/job-fit', {
        user_profile: userProfile,
        job_description: jobDescription,
        job_requirements: jobRequirements,
      });

      this.logger.log('Job fit prediction completed');
      return response.data;
    } catch (error) {
      this.logger.error('Job fit prediction failed', error);
      throw new BadRequestException('Job fit prediction failed. Please try again.');
    }
  }

  async getMarketTrends(
    industry?: string,
    location?: string
  ): Promise<{
    trending_skills: Array<{
      skill: string;
      demand_growth: number;
      avg_salary: number;
    }>;
    job_market_health: {
      score: number;
      description: string;
    };
    salary_trends: {
      median: number;
      growth: number;
    };
    top_companies: Array<{
      name: string;
      job_count: number;
    }>;
  }> {
    try {
      const params: any = {};
      if (industry) params.industry = industry;
      if (location) params.location = location;

      const response = await this.jobMatcherClient.get('/insights/market-trends', {
        params,
      });

      this.logger.log('Market trends analysis completed');
      return response.data;
    } catch (error) {
      this.logger.error('Market trends analysis failed', error);
      throw new BadRequestException('Market trends analysis failed. Please try again.');
    }
  }

  // ====== HEALTH CHECK METHODS ======

  async checkResumeAnalyzerHealth(): Promise<boolean> {
    try {
      await this.resumeAnalyzerClient.get('/health');
      return true;
    } catch (error) {
      this.logger.warn('Resume Analyzer service is not healthy', error);
      return false;
    }
  }

  async checkJobMatcherHealth(): Promise<boolean> {
    try {
      await this.jobMatcherClient.get('/health');
      return true;
    } catch (error) {
      this.logger.warn('Job Matcher service is not healthy', error);
      return false;
    }
  }

  async getServicesHealth(): Promise<{
    resumeAnalyzer: boolean;
    jobMatcher: boolean;
    overall: boolean;
  }> {
    const [resumeAnalyzer, jobMatcher] = await Promise.all([
      this.checkResumeAnalyzerHealth(),
      this.checkJobMatcherHealth(),
    ]);

    return {
      resumeAnalyzer,
      jobMatcher,
      overall: resumeAnalyzer && jobMatcher,
    };
  }

  // ====== PRIVATE HELPER METHODS ======

  private setupInterceptors() {
    // Request interceptor for logging
    const requestInterceptor = (config: any) => {
      this.logger.debug(`Making AI service request: ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    };

    // Response interceptor for error handling
    const responseInterceptor = (response: any) => {
      this.logger.debug(`AI service response: ${response.status} ${response.statusText}`);
      return response;
    };

    const errorInterceptor = (error: any) => {
      if (error.response) {
        this.logger.error(
          `AI service error: ${error.response.status} ${error.response.statusText}`,
          error.response.data
        );
      } else if (error.request) {
        this.logger.error('AI service network error', error.message);
      } else {
        this.logger.error('AI service error', error.message);
      }
      return Promise.reject(error);
    };

    this.resumeAnalyzerClient.interceptors.request.use(requestInterceptor);
    this.resumeAnalyzerClient.interceptors.response.use(responseInterceptor, errorInterceptor);

    this.jobMatcherClient.interceptors.request.use(requestInterceptor);
    this.jobMatcherClient.interceptors.response.use(responseInterceptor, errorInterceptor);
  }

  private getMimeType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'application/pdf';
      case 'doc':
        return 'application/msword';
      case 'docx':
        return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      case 'txt':
        return 'text/plain';
      default:
        return 'application/octet-stream';
    }
  }
}