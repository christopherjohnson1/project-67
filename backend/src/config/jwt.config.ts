/**
 * JWT configuration
 * Provides centralized JWT settings for authentication
 */
export const jwtConfig = {
  accessSecret: process.env.JWT_ACCESS_SECRET || 'default-access-secret-change-in-production',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'default-refresh-secret-change-in-production',
  accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
};

/**
 * Validates that required JWT environment variables are set
 */
export function validateJwtConfig(): void {
  const requiredVars = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required JWT environment variables: ${missingVars.join(', ')}`,
    );
  }

  // Validate secret length
  if (process.env.JWT_ACCESS_SECRET && process.env.JWT_ACCESS_SECRET.length < 32) {
    throw new Error('JWT_ACCESS_SECRET must be at least 32 characters long');
  }
  if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
    throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
  }
}

