import { PrismaClient, User, Session } from '@prisma/client';
import { Request, Response } from 'express';
import { Services, createServices } from './services';

const prisma = new PrismaClient();

export interface GraphQLContext {
  prisma: PrismaClient;
  currentUser: Omit<User, 'passwordHash'> | null;
  currentSession: Session | null;
  services: Services;
  req: Request;
  res: Response;
}

export interface AuthenticatedRequest extends Request {
  user?: Omit<User, 'passwordHash'> | null;
  session?: Session | null;
}

export async function createContext({ req, res }: { req: AuthenticatedRequest; res: Response }): Promise<GraphQLContext> {
  const currentUser = req.user || null;
  const currentSession = req.session || null;

  const services = createServices(prisma, currentUser);

  return {
    prisma,
    currentUser,
    currentSession,
    services,
    req,
    res
  };
}
export { prisma };
