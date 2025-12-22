import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './core/filters/http-exception.filter';
import { appConfig } from './config/app.config';
import { validateJwtConfig } from './config/jwt.config';
import { validateDatabaseConfig } from './config/database.config';

/**
 * Bootstrap the NestJS application
 * Configures CORS, validation, and global filters
 */
async function bootstrap() {
  // Validate configuration before starting application
  // This ensures we fail fast with clear errors rather than using insecure defaults
  validateJwtConfig();
  validateDatabaseConfig();

  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: appConfig.corsOrigins,
    credentials: true,
  });

  // Global prefix for all routes
  app.setGlobalPrefix('api');

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(appConfig.port);
  console.log(`Application is running on: http://localhost:${appConfig.port}`);
  console.log(`Health check: http://localhost:${appConfig.port}/api/health`);
}

bootstrap();
