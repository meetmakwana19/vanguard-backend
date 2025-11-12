import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import { GeminiClientProvider } from './providers/gemini.client.provider';

@Injectable()
export class AiService {
  constructor(private readonly geminiClientProvider: GeminiClientProvider) {}

  async getStructuredResponse(): Promise<any> {
    return this.geminiClientProvider.generateStructuredResponse(
      'Hello, Gemini!',
    );
  }

  // streaming
  async streamStructuredResponse(res: Response): Promise<void> {
    return await this.geminiClientProvider.streamResponse(
      'Write a 500 word essay about NestJS streaming apis.',
      res,
    );
  }
}
