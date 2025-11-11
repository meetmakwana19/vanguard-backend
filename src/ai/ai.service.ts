import { Injectable } from '@nestjs/common';
import { GeminiClientProvider } from './providers/gemini.client.provider';

@Injectable()
export class AiService {
  constructor(private readonly geminiClientProvider: GeminiClientProvider) {}

  async getStructuredResponse(): Promise<any> {
    return this.geminiClientProvider.generateStructuredResponse(
      'Hello, Gemini!',
    );
  }
}
