import { PrismaClient } from '@prisma/client';

declare global {
  // Allow global prisma for development HMR
  var __prismaClient: PrismaClient | undefined;
}

export const prisma = global.__prismaClient || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  global.__prismaClient = prisma;
}

export async function connectDB() {
  try {
    await prisma.$connect();
    console.log('[Database] Connected successfully to PostgreSQL via Prisma.');
  } catch (error) {
    console.error('[Database] Connection failed:', error);
    process.exit(1);
  }
}
