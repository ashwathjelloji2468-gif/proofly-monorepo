import { PrismaClient, User } from '@prisma/client';

export class BaseService {
  protected prisma: PrismaClient;
  protected currentUser: Omit<User, 'passwordHash'> | null;

  constructor(prisma: PrismaClient, currentUser: Omit<User, 'passwordHash'> | null) {
    this.prisma = prisma;
    this.currentUser = currentUser;
  }

  protected ensureAuthenticated() {
    if (!this.currentUser) {
      throw new Error('UNAUTHENTICATED: You must be logged in to perform this action.');
    }
    return this.currentUser;
  }
}
