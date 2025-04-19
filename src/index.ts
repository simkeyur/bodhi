import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import express from 'express';
import * as functions from 'firebase-functions';

const expressApp = express();

async function bootstrap() {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
  );
  app.enableCors();
  await app.init();
  return app;
}

let nestApp;

bootstrap()
  .then(app => {
    nestApp = app;
    console.log('NestJS app initialized');
  })
  .catch(err => console.error('NestJS app initialization failed', err));

export const api = functions.https.onRequest((request, response) => {
  if (!nestApp) {
    console.log('NestJS app not initialized yet');
    response.status(500).send('NestJS app not initialized yet');
    return;
  }
  nestApp.getHttpAdapter().getInstance()(request, response);
});