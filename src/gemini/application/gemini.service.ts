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

  // New method to refine a prompt.
  async refinePrompt(prompt: string, geminiKey: string): Promise<GenAiResponse> {
    // Create a refined prompt by adding extra instructions for the LLM.
    const refinedInstruction = `Rewrite the user’s idea as a clear, complete prompt a large-language model can act on. Keep intent, add context, specify role, format, constraints. Respond with the prompt only. Idea: "${prompt}".`;
    // You may adjust the instruction as needed.
    const contents = createContent(refinedInstruction);
    const model = this.getModel(geminiKey);
    const { totalTokens } = await model.countTokens({ contents });
    this.logger.log(`Refine tokens: ${JSON.stringify(totalTokens)}`);
    const result = await model.generateContent({ contents });
    const response = await result.response;
    const text = response.text();
    this.logger.log(`Refined prompt: ${JSON.stringify(text)}`);
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
