import { Injectable } from '@nestjs/common';
import { MikroORM } from '@mikro-orm/core';

/**
 * Health check service
 * Provides health status for the application and its dependencies
 */
@Injectable()
export class HealthService {
  constructor(private readonly orm: MikroORM) {}

  /**
   * Get basic health status
   */
  getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'treasure-hunt-backend',
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  /**
   * Get detailed health status including database check
   */
  async getDetailedHealth() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'treasure-hunt-backend',
      uptime: process.uptime(),
      checks: {
        database: 'unknown',
        memory: 'unknown',
      },
    };

    // Check database connectivity
    try {
      await this.orm.em.getConnection().execute('SELECT 1');
      health.checks.database = 'healthy';
    } catch (error) {
      health.checks.database = 'unhealthy';
      health.status = 'degraded';
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
    health.checks.memory = heapUsedMB < 500 ? 'healthy' : 'warning';

    return health;
  }
}

