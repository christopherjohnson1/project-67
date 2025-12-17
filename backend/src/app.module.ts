import { Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoreModule } from './core/core.module';
import { SharedModule } from './shared/shared.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { PuzzlesModule } from './modules/puzzles/puzzles.module';
import mikroOrmConfig from '../mikro-orm.config';

/**
 * Root application module
 * Imports all feature modules and configures MikroORM
 */
@Module({
  imports: [
    MikroOrmModule.forRoot(mikroOrmConfig),
    CoreModule,
    SharedModule,
    HealthModule,
    AuthModule,
    PuzzlesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
