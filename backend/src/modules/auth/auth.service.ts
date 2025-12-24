import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, AuthResponseDto, UserDto } from './dto';
import { jwtConfig } from '../../config/jwt.config';

/**
 * Authentication service
 * Handles authentication logic, password hashing, and JWT generation
 */
@Injectable()
export class AuthService {
  // Hardcoded user credentials for single-user application
  private readonly VALID_EMAIL = 'raqueltelfer@gmail.com';
  private readonly VALID_PASSWORD = 'Welcome@1';
  private readonly USER_ID = '00000000-0000-0000-0000-000000000001';
  private readonly USERNAME = 'Raquel';

  constructor(private readonly jwtService: JwtService) {}

  /**
   * Test method for auth service
   */
  test() {
    return {
      message: 'Auth module is working',
      status: 'ready',
    };
  }

  /**
   * Authenticate user and return JWT tokens
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Validate credentials against hardcoded values
    if (email.toLowerCase() !== this.VALID_EMAIL.toLowerCase()) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (password !== this.VALID_PASSWORD) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Create user object
    const user: UserDto = {
      id: this.USER_ID,
      username: this.USERNAME,
      email: this.VALID_EMAIL,
      createdAt: new Date(),
    };

    // Generate tokens
    const accessToken = await this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  /**
   * Generate JWT access token
   */
  private async generateAccessToken(user: UserDto): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    return this.jwtService.signAsync(payload);
  }

  /**
   * Generate JWT refresh token
   */
  private async generateRefreshToken(user: UserDto): Promise<string> {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };

    const options = {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiresIn,
    };

    return this.jwtService.signAsync(payload, options as any);
  }

  /**
   * Refresh access and refresh tokens
   */
  async refreshTokens(refreshToken: string): Promise<AuthResponseDto> {
    try {
      // Verify the refresh token
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: jwtConfig.refreshSecret,
      });

      // Validate this is the correct user
      if (payload.sub !== this.USER_ID) {
        throw new UnauthorizedException('Invalid token');
      }

      // Create user object
      const user: UserDto = {
        id: this.USER_ID,
        username: this.USERNAME,
        email: this.VALID_EMAIL,
        createdAt: new Date(),
      };

      // Generate new tokens
      const accessToken = await this.generateAccessToken(user);
      const newRefreshToken = await this.generateRefreshToken(user);

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Hash password using bcrypt
   * Utility method for future use
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Compare password with hash
   * Utility method for future use
   */
  async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

