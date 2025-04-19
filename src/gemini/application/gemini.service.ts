import { GenerativeModel, GoogleGenerativeAI } from '@google/generative-ai';
import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { GenAiResponse } from '~gemini/domain/interface/response.interface';
import { createContent } from './helpers/content.helper';
import { env } from '~configs/env.config';
import { AnalyzeImage } from '~gemini/domain/interface/analyze-images.interface';
import { GENERATION_CONFIG, SAFETY_SETTINGS } from '~configs/gemini.config';

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  private getModel(key: string, isVision = false) {
    const genAI = new GoogleGenerativeAI(key);
    return genAI.getGenerativeModel({
      model: isVision ? env.GEMINI.PRO_VISION_MODEL : env.GEMINI.PRO_MODEL,
      generationConfig: GENERATION_CONFIG,
      safetySettings: SAFETY_SETTINGS,
    });
  }

  async generateText(prompt: string, geminiKey: string): Promise<GenAiResponse> {
    const model = this.getModel(geminiKey);
    const contents = createContent(prompt);

    const { totalTokens } = await model.countTokens({ contents });
    this.logger.log(`Tokens: ${JSON.stringify(totalTokens)}`);

    const result = await model.generateContent({ contents });
    const response = await result.response;
    const text = response.text();

    this.logger.log(JSON.stringify(text));
    return { totalTokens, text };
  }

  async generateTextFromMultiModal(
    prompt: string, 
    file: Express.Multer.File, 
    geminiKey: string
  ): Promise<GenAiResponse> {
    try {
      const model = this.getModel(geminiKey, true);
      const contents = createContent(prompt, file);

      const { totalTokens } = await model.countTokens({ contents });
      this.logger.log(`Tokens: ${JSON.stringify(totalTokens)}`);

      const result = await model.generateContent({ contents });
      const response = await result.response;
      const text = response.text();

      this.logger.log(JSON.stringify(text));
      return { totalTokens, text };
    } catch (err) {
      if (err instanceof Error) {
        throw new InternalServerErrorException(err.message, err.stack);
      }
      throw err;
    }
  }

  async analyzeImages({ 
    prompt, 
    firstImage, 
    secondImage, 
    geminiKey 
  }: AnalyzeImage & { geminiKey: string }): Promise<GenAiResponse> {
    try {
      const model = this.getModel(geminiKey, true);
      const contents = createContent(prompt, firstImage, secondImage);

      const { totalTokens } = await model.countTokens({ contents });
      this.logger.log(`Tokens: ${JSON.stringify(totalTokens)}`);

      const result = await model.generateContent({ contents });
      const response = await result.response;
      const text = response.text();

      this.logger.log(JSON.stringify(text));
      return { totalTokens, text };
    } catch (err) {
      if (err instanceof Error) {
        throw new InternalServerErrorException(err.message, err.stack);
      }
      throw err;
    }
  }
}
