import { Module, Global } from '@nestjs/common';

/**
 * Core module
 * Provides global filters, guards, and interceptors
 * Available throughout the application
 */
@Global()
@Module({
  providers: [],
  exports: [],
})
export class CoreModule {}

