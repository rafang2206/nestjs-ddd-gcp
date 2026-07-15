import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter, ResponseFormatInterceptor } from './shared/https';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api/v1';

  app.setGlobalPrefix(globalPrefix, {
    exclude: ['docs', 'docs-json'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseFormatInterceptor());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Geeks Castle Backend Challenge API')
    .setDescription(
      'API para crear usuarios, publicar eventos en Cloud Pub/Sub y actualizar passwords en Firestore.',
    )
    .setVersion('1.0')
    .addTag('users')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, swaggerDocument);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
