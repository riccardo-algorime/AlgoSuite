import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import * as cors from 'cors';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: ['error', 'warn', 'log'] });
  const configService = app.get(ConfigService);
  // Configure helmet with more permissive settings for testing
  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  );
  app.use(cors());
  app.setGlobalPrefix('api');
  // Temporarily disable global validation pipe for debugging
  // app.useGlobalPipes(new ValidationPipe({ 
  //   whitelist: true, 
  //   transform: true, 
  //   forbidNonWhitelisted: false, 
  //   disableErrorMessages: false, 
  // }));
  const config = new DocumentBuilder()
    .setTitle('Algosuite API')
    .setDescription('The Algosuite API documentation')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  const port = configService.get<number>('PORT') || 8000;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
}

bootstrap();
