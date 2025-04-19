import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiHeader, ApiTags } from '@nestjs/swagger';
import { GeminiService } from '~gemini/application/gemini.service';
import { GenAiResponse } from '~gemini/domain/interface/response.interface';
import { GenerateTextDto } from './dto/generate-text.dto';
import { fileValidatorPipe } from './validation/file-validator.pipe';
import { GeminiKey } from './decorators/gemini-key.decorator';

@ApiTags('Gemini')
@ApiHeader({
  name: 'x-gemini-key',
  description: 'Gemini API Key',
  required: true,
})
@Controller('api/gemini')  // Add the /api prefix here
export class GeminiController {
  constructor(private service: GeminiService) {}

  @ApiBody({
    description: 'Prompt',
    required: true,
    type: GenerateTextDto,
  })
  @Post('text')
  generateText(
    @Body() dto: GenerateTextDto,
    @GeminiKey() geminiKey: string
  ): Promise<GenAiResponse> {
    return this.service.generateText(dto.prompt, geminiKey);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Prompt',
        },
        file: {
          type: 'string',
          format: 'binary',
          description: 'Binary file',
        },
      },
    },
  })
  @Post('text-and-image')
  @UseInterceptors(FileInterceptor('file'))
  async generateTextFromMultiModal(
    @Body() dto: GenerateTextDto,
    @UploadedFile(fileValidatorPipe) file: Express.Multer.File,
    @GeminiKey() geminiKey: string
  ): Promise<GenAiResponse> {
    return this.service.generateTextFromMultiModal(dto.prompt, file, geminiKey);
  }

  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'Prompt',
        },
        first: {
          type: 'string',
          format: 'binary',
          description: 'Binary file',
        },
        second: {
          type: 'string',
          format: 'binary',
          description: 'Binary file',
        },
      },
    },
  })
  @Post('analyse-the-images')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'first', maxCount: 1 },
      { name: 'second', maxCount: 1 },
    ]),
  )
  async analyseImages(
    @Body() dto: GenerateTextDto,
    @UploadedFiles()
    files: {
      first?: Express.Multer.File[];
      second?: Express.Multer.File[];
    },
    @GeminiKey() geminiKey: string
  ): Promise<GenAiResponse> {
    if (!files.first?.length) {
      throw new BadRequestException('The first image is missing');
    }

    if (!files.second?.length) {
      throw new BadRequestException('The second image is missing');
    }
    return this.service.analyzeImages({ 
      prompt: dto.prompt, 
      firstImage: files.first[0], 
      secondImage: files.second[0],
      geminiKey 
    });
  }
}
