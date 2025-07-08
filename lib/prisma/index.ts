import { PrismaClient } from '../generated/prisma';

// Prevent multiple instances of Prisma Client in development
declare global {
  var prisma: PrismaClient | undefined;
}

// Use existing instance if available to avoid multiple connections
const prismaClient = () => {
  // For production, always create a new client
  if (process.env.NODE_ENV === 'production') {
    return new PrismaClient();
  }

  // For development, reuse the client if it exists
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }

  return global.prisma;
};

export const prisma = prismaClient();
