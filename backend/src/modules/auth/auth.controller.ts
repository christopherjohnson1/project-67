import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * Authentication controller
 * Handles login, registration, and token management
 * TODO: Implement endpoints in next phase
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Test endpoint for auth module
   */
  @Get('test')
  test() {
    return this.authService.test();
  }
}

