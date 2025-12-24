/**
 * User data returned in authentication responses
 */
export class UserDto {
  id: string;
  username: string;
  email?: string;
  createdAt: Date;
}

/**
 * Authentication response DTO
 * Contains JWT tokens and user information
 */
export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: UserDto;
}


