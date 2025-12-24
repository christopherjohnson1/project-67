import { IsNotEmpty, IsString } from 'class-validator';

/**
 * Refresh token DTO
 * Used to request new access and refresh tokens
 */
export class RefreshTokenDto {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;
}

