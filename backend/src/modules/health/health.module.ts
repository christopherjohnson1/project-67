import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';

/**
 * Health module
 * Provides health check endpoints for monitoring
 */
@Module({
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}

