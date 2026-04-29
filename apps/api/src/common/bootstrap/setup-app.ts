import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../filters/http-exception.filter';

export function setupApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
}
