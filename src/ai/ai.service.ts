import { Injectable } from '@nestjs/common';
import { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { GeminiClientProvider } from './providers/gemini.client.provider';
import { ExecutiveSummaryPromptBuilder } from './utils/executive-summary.prompt';

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
    // Load and parse the JSON file
    const jsonFilePath = path.join(process.cwd(), 'src/data/set.json');
    const jsonData: unknown = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8'));

    const prompt = ExecutiveSummaryPromptBuilder.buildUserAnalyticsPrompt(
      jsonData as any[],
    );

    return await this.geminiClientProvider.streamResponse(prompt, res);
  }
}
