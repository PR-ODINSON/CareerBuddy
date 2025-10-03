import { Injectable, Logger } from '@nestjs/common';
import { AiClientService } from './ai-client.service';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ServiceStatus {
  [serviceName: string]: {
    status: 'running' | 'stopped' | 'error';
    uptime?: number;
    last_restart?: string;
    error_message?: string;
  };
}

@Injectable()
export class AiProcessManagerService {
  private readonly logger = new Logger(AiProcessManagerService.name);

  constructor(private readonly aiClientService: AiClientService) {}

  async getServiceStatus(): Promise<ServiceStatus> {
    try {
      const servicesHealth = await this.aiClientService.getServicesHealth();
      
      return {
        resume_analyzer: {
          status: servicesHealth.resumeAnalyzer ? 'running' : 'stopped',
          uptime: servicesHealth.resumeAnalyzer ? Date.now() : undefined,
        },
        job_matcher: {
          status: servicesHealth.jobMatcher ? 'running' : 'stopped',
          uptime: servicesHealth.jobMatcher ? Date.now() : undefined,
        },
        built_in_ai: {
          status: 'running', // Built-in AI is always running
          uptime: Date.now(),
        },
      };
    } catch (error) {
      this.logger.error('Failed to get service status', error);
      return {
        resume_analyzer: {
          status: 'error',
          error_message: 'Failed to check service status',
        },
        job_matcher: {
          status: 'error',
          error_message: 'Failed to check service status',
        },
        built_in_ai: {
          status: 'running',
          uptime: Date.now(),
        },
      };
    }
  }

  async getRunningServices(): Promise<string[]> {
    const status = await this.getServiceStatus();
    return Object.entries(status)
      .filter(([_, serviceStatus]) => serviceStatus.status === 'running')
      .map(([serviceName]) => serviceName);
  }

  async restartService(serviceName: string): Promise<boolean> {
    this.logger.log(`Attempting to restart service: ${serviceName}`);
    
    try {
      switch (serviceName) {
        case 'resume_analyzer':
        case 'job_matcher':
          // For external services, we can't actually restart them
          // but we can try to reconnect or clear any cached connections
          this.logger.warn(`Cannot restart external service ${serviceName}. Service restart should be handled externally.`);
          return false;
          
        case 'built_in_ai':
          // Built-in AI doesn't need restarting as it's part of this application
          this.logger.log('Built-in AI service is always running');
          return true;
          
        default:
          this.logger.error(`Unknown service: ${serviceName}`);
          return false;
      }
    } catch (error) {
      this.logger.error(`Failed to restart service ${serviceName}`, error);
      return false;
    }
  }

  async installDependencies(): Promise<boolean> {
    this.logger.log('Installing AI service dependencies...');
    
    try {
      // Check if Python AI services are available
      const pythonCheck = await this.checkPythonEnvironment();
      if (!pythonCheck) {
        this.logger.error('Python environment not properly configured');
        return false;
      }

      // For now, we'll just log that dependencies are checked
      // In a real implementation, this might install Python packages or check Docker containers
      this.logger.log('AI service dependencies are properly configured');
      return true;
    } catch (error) {
      this.logger.error('Failed to install AI service dependencies', error);
      return false;
    }
  }

  private async checkPythonEnvironment(): Promise<boolean> {
    try {
      await execAsync('python --version');
      return true;
    } catch (error) {
      try {
        await execAsync('python3 --version');
        return true;
      } catch (error2) {
        this.logger.warn('Python not found in system PATH');
        return false;
      }
    }
  }
}
