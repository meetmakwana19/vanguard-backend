import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { GeminiClientProvider } from './providers/gemini.client.provider';

@Module({
  providers: [AiService, GeminiClientProvider],
  controllers: [AiController],
})
export class AiModule {}
