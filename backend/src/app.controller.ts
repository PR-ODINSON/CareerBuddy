import { Controller, Get, Post, Param } from '@nestjs/common';
import { AppService } from './app.service';
import { AiHealthService } from './ai-integration/ai-health.service';
import { AiProcessManagerService } from './ai-integration/ai-process-manager.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly aiHealthService: AiHealthService,
    private readonly aiProcessManager: AiProcessManagerService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    const [aiHealth, serviceStatus] = await Promise.all([
      this.aiHealthService.getDetailedHealthStatus(),
      this.aiProcessManager.getServiceStatus()
    ]);
    
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'CareerBuddy Backend API',
      version: '1.0.0',
      uptime: process.uptime(),
      aiServices: aiHealth,
      aiProcesses: serviceStatus,
    };
  }

  @Get('health/ai')
  async getAiHealth() {
    return await this.aiHealthService.getDetailedHealthStatus();
  }

  @Get('ai/status')
  async getAiProcessStatus() {
    const [serviceStatus, runningServices] = await Promise.all([
      this.aiProcessManager.getServiceStatus(),
      this.aiProcessManager.getRunningServices()
    ]);

    return {
      services: serviceStatus,
      running: runningServices,
      totalServices: Object.keys(serviceStatus).length,
      healthyServices: runningServices.length
    };
  }

  @Post('ai/restart/:serviceName')
  async restartAiService(@Param('serviceName') serviceName: string) {
    const success = await this.aiProcessManager.restartService(serviceName);
    return {
      success,
      message: success 
        ? `${serviceName} restarted successfully` 
        : `Failed to restart ${serviceName}`,
      timestamp: new Date().toISOString()
    };
  }

  @Post('ai/install-dependencies')
  async installAiDependencies() {
    const success = await this.aiProcessManager.installDependencies();
    return {
      success,
      message: success 
        ? 'AI service dependencies installed successfully' 
        : 'Failed to install AI service dependencies',
      timestamp: new Date().toISOString()
    };
  }
}
