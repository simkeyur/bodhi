import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import * as functions from 'firebase-functions';
import { AppModule } from './app.module';

const expressServer = express();

const createFunction = async (expressInstance: express.Express) => {
  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressInstance),
  );
  app.enableCors();
  return app.init();
};

createFunction(expressServer)
  .then(() => console.log('Nest Ready'))
  .catch(err => console.error('Nest broken', err));

export const api = functions.https.onRequest(expressServer);