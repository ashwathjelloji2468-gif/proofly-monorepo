import { PrismaClient, User } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { Services, createServices } from './services';

const prisma = new PrismaClient();

export interface GraphQLContext {
  prisma: PrismaClient;
  currentUser: Omit<User, 'passwordHash'> | null;
  services: Services;
}

export async function createContext(authHeader?: string): Promise<GraphQLContext> {
  let currentUser: Omit<User, 'passwordHash'> | null = null;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const secret = process.env.JWT_SECRET || 'super-secret-key-change-in-production';
      const decoded = jwt.verify(token, secret) as { id: string; email: string };
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });

      if (user) {
        const { passwordHash, ...userWithoutPassword } = user;
        currentUser = userWithoutPassword;
      }
    } catch (err) {
      // Allow unauthenticated requests, resolvers will check currentUser if they require auth
      console.warn('Invalid or expired token');
    }
  }

  // Create service container passing prisma client and current user
  const services = createServices(prisma, currentUser);

  return {
    prisma,
    currentUser,
    services
  };
}

export { prisma };
