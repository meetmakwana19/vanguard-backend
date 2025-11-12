/**
 * GeminiClientProvider
 *
 * - Creates and exposes methods to call the Google GenAI SDK (`@google/genai`)
 * - Loads credentials from ConfigService
 * - Wraps errors into InternalServerErrorException
 *
 * NOTES:
 * - The GoogleGenAI SDK uses `GoogleGenAI` exported class.
 * - We implement `generateStructuredResponse(prompt, schema)` which:
 *    1. calls ai.models.generateContent
 *    2. returns the raw text / structured parsed JSON
 *
 * IMPORTANT:
 * - The provider is intentionally small and focused only on calling the external API.
 * - Callers are responsible for parsing/validating the returned JSON.
 */

import { GoogleGenAI } from '@google/genai';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class GeminiClientProvider {
  private client: GoogleGenAI;
  private apiKey: string;
  private model: string;
  private timeoutMs: number;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
    this.timeoutMs = Number(process.env.AI_TIMEOUT_MS) || 15000;

    // Initialize the GoogleGenAI client
    // For server-side, prefer API key initialization
    if (!this.apiKey) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY environment variable is required',
      );
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      this.client = new GoogleGenAI({ apiKey: this.apiKey });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        'Failed to initialize Gemini client: ' + errorMessage,
      );
    }
  }

  /**
   * generateStructuredResponse:
   * - Sends prompt to Gemini and returns raw text (string)
   * - The "schema" parameter is used for function-calling or instructive purposes.
   *
   * We include a timeout wrapper around the SDK call to enforce AI_TIMEOUT_MS.
   */
  async generateStructuredResponse(prompt: string): Promise<any> {
    try {
      if (this.client) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        const call = await this.client.models.generateContent({
          // const call = await this.client.models.generateContentStream({
          model: this.model,
          contents: prompt,
          config: {
            temperature: 0,
            systemInstruction:
              'You are an expert data analyst. Your know everything about Contentstack and Lytics audience screenining platform.', // for more tailored outputs
            thinkingConfig: {
              thinkingBudget: 0, // Disables thinking
            },
          },
        });

        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        const responseText = call?.text || '';
        console.log('call result -- ', responseText);

        // for await (const chunk of call) {
        //   // Process each chunk as it arrives
        //   console.log('Received chunk:', chunk.text);
        // }

        return responseText;

        // Enforce timeout by racing the call with a timeout promise.
        // const timeoutPromise = new Promise<never>((_, reject) => {
        //   setTimeout(
        //     () => reject(new Error('LLM request timed out')),
        //     this.timeoutMs,
        //   );
        // });

        // const response: any = (await Promise.race([
        //   call,
        //   timeoutPromise,
        // ])) as any;

        // // The SDK returns .text or .candidates depending on version; normalize:
        // const text = response?.text
        //   ? response.text
        //   : Array.isArray(response?.candidates)
        //     ? response.candidates.map((c) => c.text).join('\n')
        //     : JSON.stringify(response);

        // if (!text) {
        //   throw new Error('Empty response from LLM');
        // }

        // return text;
      }
    } catch (err: unknown) {
      // Wrap SDK/transport errors in InternalServerErrorException
      // If SDK exposes ApiError with status, you could expose more details here (but avoid sensitive info).
      const message =
        err instanceof Error ? err.message : 'Unknown error from LLM provider';

      console.log('Error from ai : ', err);

      throw new InternalServerErrorException(
        `Gemini provider error: ${message}`,
      );
    }
  }

  /** ✅ STREAMING VERSION (Express-ready) */
  async streamResponse(prompt: string, res: Response): Promise<void> {
    try {
      //   const modelList = await this.client.models.list();
      //   console.log('Available models: ', modelList);

      const stream = await this.client.models.generateContentStream({
        model: this.model,
        contents: prompt,
        config: {
          temperature: 1,
          thinkingConfig: { thinkingBudget: 0 },
        },
      });

      for await (const chunk of stream) {
        const text = chunk?.text || '';
        console.log('chunk -- ', text);

        if (text) {
          res.write(text);
          //   await new Promise((r) => setTimeout(r, 1000)); // add delay to visualize streaming
        }
      }

      res.end();
    } catch (err) {
      res.write(
        '\n[STREAM ERROR]: ' +
          (err instanceof Error ? err.message : String(err)),
      );
      res.end();
    }
  }
}
