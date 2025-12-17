import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

/**
 * Authentication module
 * Handles user authentication, JWT tokens, and authorization
 * TODO: Implement full authentication in next phase
 */
@Module({
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}

