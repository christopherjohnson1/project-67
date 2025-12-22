/**
 * User model
 * Represents an authenticated user
 */
export interface User {
  id: string;
  username: string;
  email?: string;
  createdAt: Date;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  username: string;
  email?: string;
  password: string;
}

/**
 * Authentication response with tokens
 */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

