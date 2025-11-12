import { Controller, Get, Query, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('ping')
  async getStructuredResponse(
    @Query('stream') stream: string,
    @Res() res: Response,
  ): Promise<any> {
    const isStreaming = stream === 'true';

    if (isStreaming) {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      res.setHeader('Transfer-Encoding', 'chunked');
      res.flushHeaders();

      return this.aiService.streamStructuredResponse(res);
    }

    // Non-streaming response
    const resp: unknown = await this.aiService.getStructuredResponse();
    return res.send(resp);
  }
}
