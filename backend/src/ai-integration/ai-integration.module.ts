import { Module } from '@nestjs/common';
import { AiClientService } from './ai-client.service';
import { BuiltInAiService } from './built-in-ai.service';
import { AiHealthService } from './ai-health.service';
import { AiProcessManagerService } from './ai-process-manager.service';

@Module({
  providers: [AiClientService, BuiltInAiService, AiHealthService, AiProcessManagerService],
  exports: [AiClientService, BuiltInAiService, AiHealthService, AiProcessManagerService],
})
export class AiIntegrationModule {}
