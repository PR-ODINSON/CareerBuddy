import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AiClientService } from './ai-client.service';

@Injectable()
export class AiHealthService implements OnModuleInit {
  private readonly logger = new Logger(AiHealthService.name);
  private readonly maxRetries = 30; // 5 minutes with 10 second intervals
  private readonly retryInterval = 10000; // 10 seconds

  constructor(
    private aiClientService: AiClientService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing AI services health checks...');
    
    // Start health checks in background
    this.startHealthChecks();
  }

  private async startHealthChecks() {
    let attempts = 0;
    let allServicesHealthy = false;

    while (!allServicesHealthy && attempts < this.maxRetries) {
      attempts++;
      this.logger.log(`AI Services health check attempt ${attempts}/${this.maxRetries}`);

      try {
        const health = await this.aiClientService.getServicesHealth();
        
        this.logger.log(`Resume Analyzer: ${health.resumeAnalyzer ? '✅ Healthy' : '❌ Unhealthy'}`);
        this.logger.log(`Job Matcher: ${health.jobMatcher ? '✅ Healthy' : '❌ Unhealthy'}`);
        
        if (health.overall) {
          this.logger.log('🎉 All AI services are healthy and ready!');
          allServicesHealthy = true;
          
          // Initialize any required data or configurations
          await this.initializeAiServices();
          return;
        } else {
          this.logger.warn('Some AI services are not ready yet, retrying in 10 seconds...');
        }
      } catch (error) {
        this.logger.error(`Health check failed on attempt ${attempts}:`, error.message);
      }

      if (!allServicesHealthy && attempts < this.maxRetries) {
        await this.sleep(this.retryInterval);
      }
    }

    if (!allServicesHealthy) {
      this.logger.error('❌ Failed to connect to AI services after maximum retries. Backend will continue but AI features may not work properly.');
      this.logTroubleshootingInformation();
    }
  }

  private async initializeAiServices() {
    try {
      this.logger.log('Initializing AI services...');
      
      // Test basic functionality
      await this.testResumeAnalyzer();
      await this.testJobMatcher();
      
      this.logger.log('✅ AI services initialization completed successfully');
    } catch (error) {
      this.logger.error('❌ AI services initialization failed:', error.message);
    }
  }

  private async testResumeAnalyzer() {
    try {
      const testContent = "Test resume content for service validation";
      await this.aiClientService.analyzeResumeText(testContent);
      this.logger.log('Resume Analyzer service test: ✅ PASSED');
    } catch (error) {
      this.logger.warn('Resume Analyzer service test: ⚠️ FAILED', error.message);
    }
  }

  private async testJobMatcher() {
    try {
      const testProfile = {
        skills: ['JavaScript', 'React'],
        experience: { years: 2 },
        preferences: {
          roles: ['Frontend Developer'],
          industries: ['Technology'],
          locations: ['Remote']
        }
      };
      
      const testJobs = [{
        id: 'test-job-1',
        title: 'Frontend Developer',
        company: 'Test Company',
        description: 'Test job description',
        requirements: ['JavaScript', 'React'],
        skills: ['JavaScript', 'React'],
        location: 'Remote',
        experience_level: 'Mid'
      }];

      await this.aiClientService.findMatchingJobs(testProfile, testJobs);
      this.logger.log('Job Matcher service test: ✅ PASSED');
    } catch (error) {
      this.logger.warn('Job Matcher service test: ⚠️ FAILED', error.message);
    }
  }

  async getDetailedHealthStatus(): Promise<{
    resumeAnalyzer: {
      healthy: boolean;
      url: string;
      lastChecked: Date;
    };
    jobMatcher: {
      healthy: boolean;
      url: string;
      lastChecked: Date;
    };
    overall: boolean;
  }> {
    const now = new Date();
    const health = await this.aiClientService.getServicesHealth();
    
    const resumeAnalyzerUrl = this.configService.get<string>(
      'AI_RESUME_ANALYZER_URL',
      'http://localhost:8001'
    );
    const jobMatcherUrl = this.configService.get<string>(
      'AI_JOB_MATCHER_URL',
      'http://localhost:8002'
    );

    return {
      resumeAnalyzer: {
        healthy: health.resumeAnalyzer,
        url: resumeAnalyzerUrl,
        lastChecked: now,
      },
      jobMatcher: {
        healthy: health.jobMatcher,
        url: jobMatcherUrl,
        lastChecked: now,
      },
      overall: health.overall,
    };
  }

  private logTroubleshootingInformation() {
    const resumeAnalyzerUrl = this.configService.get<string>(
      'AI_RESUME_ANALYZER_URL',
      'http://localhost:8001'
    );
    const jobMatcherUrl = this.configService.get<string>(
      'AI_JOB_MATCHER_URL',
      'http://localhost:8002'
    );

    this.logger.error('🔧 TROUBLESHOOTING INFORMATION:');
    this.logger.error(`Resume Analyzer URL: ${resumeAnalyzerUrl}`);
    this.logger.error(`Job Matcher URL: ${jobMatcherUrl}`);
    this.logger.error('');
    this.logger.error('To start AI services manually:');
    this.logger.error('1. cd ai-services');
    this.logger.error('2. docker-compose up -d');
    this.logger.error('');
    this.logger.error('Or start all services with:');
    this.logger.error('docker-compose up -d');
    this.logger.error('');
    this.logger.error('Check service logs with:');
    this.logger.error('docker-compose logs resume-analyzer');
    this.logger.error('docker-compose logs job-matcher');
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
