import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  app.enableCors({
    origin: 'http://localhost:3000', // change to frontend URL in production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true // if using cookies or auth
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Manoke API')
    .setDescription('API documentation for Manoke Karaoke')
    .setVersion('1.0')
    .addTag('manoke')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
      name: 'Authorization',
      description: 'Enter a JWT token',
    })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  
  const configService = app.get(ConfigService);
  console.log('ConfigService', configService.get('port'));
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
