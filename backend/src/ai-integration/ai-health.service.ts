import { Injectable, Logger } from '@nestjs/common';
import { AiClientService } from './ai-client.service';
import { BuiltInAiService } from './built-in-ai.service';

export interface DetailedHealthStatus {
  overall_status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    [serviceName: string]: {
      status: 'healthy' | 'unhealthy';
      response_time?: number;
      last_check: string;
      error?: string;
    };
  };
  built_in_ai: {
    status: 'healthy' | 'unhealthy';
    features_available: string[];
  };
}

@Injectable()
export class AiHealthService {
  private readonly logger = new Logger(AiHealthService.name);

  constructor(
    private readonly aiClientService: AiClientService,
    private readonly builtInAiService: BuiltInAiService,
  ) {}

  async getDetailedHealthStatus(): Promise<DetailedHealthStatus> {
    try {
      // Check external AI services health
      const servicesHealth = await this.aiClientService.getServicesHealth();
      
      // Check built-in AI service
      const builtInStatus = this.checkBuiltInAiHealth();

      // Determine overall status
      const allServicesHealthy = Object.values(servicesHealth).every(healthy => healthy);
      const overallStatus = allServicesHealthy && builtInStatus.status === 'healthy' 
        ? 'healthy' 
        : 'degraded';

      return {
        overall_status: overallStatus,
        services: {
          resume_analyzer: {
            status: servicesHealth.resumeAnalyzer ? 'healthy' : 'unhealthy',
            last_check: new Date().toISOString(),
          },
          job_matcher: {
            status: servicesHealth.jobMatcher ? 'healthy' : 'unhealthy',
            last_check: new Date().toISOString(),
          },
        },
        built_in_ai: builtInStatus,
      };
    } catch (error) {
      this.logger.error('Failed to get detailed health status', error);
      return {
        overall_status: 'unhealthy',
        services: {
          resume_analyzer: {
            status: 'unhealthy',
            last_check: new Date().toISOString(),
            error: 'Health check failed',
          },
          job_matcher: {
            status: 'unhealthy',
            last_check: new Date().toISOString(),
            error: 'Health check failed',
          },
        },
        built_in_ai: {
          status: 'healthy',
          features_available: ['resume_analysis', 'job_matching', 'skill_extraction'],
        },
      };
    }
  }

  private checkBuiltInAiHealth(): { status: 'healthy' | 'unhealthy'; features_available: string[] } {
    // Built-in AI service is always available since it doesn't depend on external services
    return {
      status: 'healthy',
      features_available: ['resume_analysis', 'job_matching', 'skill_extraction'],
    };
  }
}
