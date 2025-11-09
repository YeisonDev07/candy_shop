import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Configurar prefijo global de la API
  const apiPrefix = configService.get('API_PREFIX', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades no definidas en el DTO
      forbidNonWhitelisted: true, // lanza error si vienen propiedades extra
      transform: true, // transforma los tipos automáticamente (ej. string → number)
    }),
  );

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  console.log(
    `🚀 Aplicación corriendo en http://localhost:${port}/${apiPrefix}`,
  );
}
bootstrap();
