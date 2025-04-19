import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';

export const GeminiKey = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  const key = request.headers['x-gemini-key'];
  
  if (!key) {
    throw new UnauthorizedException('Gemini API key is required in x-gemini-key header');
  }
  
  return key;
});