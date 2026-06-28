import { PrismaClient, User, Session } from '@prisma/client';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import crypto from 'crypto';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export class SessionService {
  constructor(private prisma: PrismaClient, private currentUser: Omit<User, 'passwordHash'> | null) {}

  private ensureAuthenticated(): Omit<User, 'passwordHash'> {
    if (!this.currentUser) {
      throw new Error('UNAUTHENTICATED: You must be logged in to perform this action.');
    }
    return this.currentUser;
  }

  async createSession(
    userId: string,
    userAgent: string | null,
    ipAddress: string | null
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new Error('USER_NOT_FOUND: User does not exist.');
    }

    const accessToken = generateAccessToken(user.id, user.email);
    const refreshToken = generateRefreshToken(user.id, user.email);
    const refreshTokenHash = hashToken(refreshToken);

    // Create session in DB: expires in 30 days
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        userAgent,
        ipAddress,
        expiresAt: sessionExpiresAt,
        isValid: true
      }
    });

    // Create Refresh Token in DB
    await this.prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: user.id,
        sessionId: session.id,
        expiresAt: sessionExpiresAt
      }
    });

    // Log login audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'CREATE_SESSION'
      }
    });

    // Set last login time
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date(), failedLoginAttempts: 0 }
    });

    return {
      session,
      accessToken,
      refreshToken
    };
  }

  async getActiveSessions(): Promise<Session[]> {
    const currentUser = this.ensureAuthenticated();
    return this.prisma.session.findMany({
      where: {
        userId: currentUser.id,
        isValid: true,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async revokeSession(sessionId: string): Promise<boolean> {
    const currentUser = this.ensureAuthenticated();
    
    // Ensure the session belongs to the current user
    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, userId: currentUser.id }
    });

    if (!session) {
      throw new Error('NOT_FOUND: Session not found or access denied.');
    }

    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({ where: { sessionId } }),
      this.prisma.session.update({
        where: { id: sessionId },
        data: { isValid: false }
      })
    ]);

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: `REVOKE_SESSION_${sessionId}`
      }
    });

    return true;
  }

  async revokeAllSessions(): Promise<boolean> {
    const currentUser = this.ensureAuthenticated();
    
    const activeSessions = await this.prisma.session.findMany({
      where: { userId: currentUser.id, isValid: true }
    });
    const sessionIds = activeSessions.map(s => s.id);

    await this.prisma.$transaction([
      this.prisma.refreshToken.deleteMany({ where: { sessionId: { in: sessionIds } } }),
      this.prisma.session.updateMany({
        where: { userId: currentUser.id },
        data: { isValid: false }
      })
    ]);

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'REVOKE_ALL_SESSIONS'
      }
    });

    return true;
  }
}
