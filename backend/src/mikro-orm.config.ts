import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

const config: MikroOrmModuleOptions = {
  driver: PostgreSqlDriver,
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  user: process.env.DATABASE_USER || 'treasure_user',
  password: process.env.DATABASE_PASSWORD || 'password',
  dbName: process.env.DATABASE_NAME || 'treasure_hunt',
  entities: ['./dist/**/*.entity.js'],
  entitiesTs: ['./src/**/*.entity.ts'],
  debug: process.env.NODE_ENV !== 'production',
  migrations: {
    path: './dist/migrations',
    pathTs: './src/migrations',
  },
};

export default config;

