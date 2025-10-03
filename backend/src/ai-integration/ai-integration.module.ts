import { Module } from '@nestjs/common';
import { AiClientService } from './ai-client.service';
import { AiHealthService } from './ai-health.service';
import { AiProcessManagerService } from './ai-process-manager.service';

@Module({
  providers: [AiProcessManagerService, AiClientService, AiHealthService],
  exports: [AiProcessManagerService, AiClientService, AiHealthService],
})
export class AiIntegrationModule {}
