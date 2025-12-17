/**
 * Database configuration
 * Provides centralized database connection settings
 */
export const databaseConfig = {
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USER || 'treasure_user',
  password: process.env.DATABASE_PASSWORD || 'password',
  database: process.env.DATABASE_NAME || 'treasure_hunt',
};

/**
 * Validates that required database environment variables are set
 */
export function validateDatabaseConfig(): void {
  const requiredVars = ['DATABASE_HOST', 'DATABASE_NAME', 'DATABASE_USER', 'DATABASE_PASSWORD'];
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required database environment variables: ${missingVars.join(', ')}`,
    );
  }
}

