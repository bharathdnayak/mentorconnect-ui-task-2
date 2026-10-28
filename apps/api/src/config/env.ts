import dotenv from 'dotenv';
import path from 'path';

// Load root .env
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres123@localhost:5432/mentorconnect?schema=public',
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'mentorconnect_dev_access_secret_super_secure',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'mentorconnect_dev_refresh_secret_super_secure',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '1h',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
