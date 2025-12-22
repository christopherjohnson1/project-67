import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';

/**
 * Health check controller
 * Provides endpoints for container health monitoring
 */
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * Basic health check endpoint
   * Returns 200 if service is healthy
   */
  @Get()
  checkHealth() {
    return this.healthService.getHealth();
  }

  /**
   * Detailed health check with database status
   * Returns comprehensive health information
   */
  @Get('detailed')
  async checkDetailedHealth() {
    return await this.healthService.getDetailedHealth();
  }
}

