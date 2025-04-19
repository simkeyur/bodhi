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
  app.enableCors(); // Enable CORS for cross-origin requests
  await app.init();
}

bootstrap()
  .then(() => console.log('NestJS app initialized'))
  .catch(err => console.error('NestJS app initialization failed', err));

// A simple test endpoint
expressApp.post('/api/gemini/text', (req, res) => {
  res.json({ message: 'Hello from API!' });
});

// Optional: For debugging, also respond to GET
expressApp.get('/api/gemini/text', (req, res) => {
  res.send('GET: Hello from API!');
});

export const api = functions.https.onRequest(expressApp);