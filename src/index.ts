import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express from 'express';
import * as functions from 'firebase-functions';

const server = express();

const createNestApp = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  app.enableCors();
  await app.init();
  return app;
};

export const api = functions.https.onRequest(async (request, response) => {
  const app = await createNestApp(server);
  const expressInstance = app.getHttpAdapter().getInstance();
  return expressInstance(request, response);
});