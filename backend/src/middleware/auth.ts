import { Request, Response, NextFunction } from 'express';
import { PrismaClient, User, Session } from '@prisma/client';
import { verifyAccessToken, verifyRefreshToken, generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { setAuthCookies } from '../security/cookies';
import crypto from 'crypto';

const prisma = new PrismaClient();

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export interface AuthenticatedRequest extends Request {
  user?: Omit<User, 'passwordHash'> | null;
  session?: Session | null;
}

export async function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  req.user = null;
  req.session = null;

  const accessToken = req.cookies?.access_token;
  const refreshToken = req.cookies?.refresh_token;

  if (!accessToken && !refreshToken) {
    return next();
  }

  // 1. Try validating the Access Token
  if (accessToken) {
    try {
      const payload = verifyAccessToken(accessToken);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });
      if (user && user.status !== 'DISABLED') {
        const { passwordHash: _, ...userWithoutPassword } = user;
        
        // Also fetch active session if we can match it
        if (refreshToken) {
          const tokenHash = hashToken(refreshToken);
          const dbToken = await prisma.refreshToken.findUnique({
            where: { tokenHash },
            include: { session: true }
          });
          if (dbToken && dbToken.session.isValid && dbToken.session.expiresAt > new Date()) {
            req.user = userWithoutPassword;
            req.session = dbToken.session;
            
            // Update lastActivity on session (async, non-blocking to keep requests fast)
            prisma.session.update({
              where: { id: dbToken.session.id },
              data: { lastActivity: new Date() }
            }).catch(err => console.error('Failed to update session lastActivity:', err));
            
            return next();
          } else {
            // Reject if session is invalid or expired
            req.user = null;
            req.session = null;
            return next();
          }
        }
        
        req.user = userWithoutPassword;
        return next();
      }
    } catch (err: any) {
      // If access token is expired/invalid but we don't have a refresh token, clear and fail
      if (!refreshToken) {
        return next();
      }
    }
  }

  // 2. If Access Token was expired/invalid but Refresh Token is present, try silent refresh
  if (refreshToken) {
    try {
      verifyRefreshToken(refreshToken);
      const tokenHash = hashToken(refreshToken);

      // Check if this refresh token exists and is valid in DB
      const dbToken = await prisma.refreshToken.findUnique({
        where: { tokenHash },
        include: {
          session: {
            include: {
              user: true
            }
          }
        }
      });

      if (
        dbToken && 
        dbToken.session.isValid && 
        dbToken.expiresAt > new Date() && 
        dbToken.session.expiresAt > new Date() && 
        dbToken.session.user.status !== 'DISABLED'
      ) {
        const user = dbToken.session.user;
        const session = dbToken.session;

        // Generate new Access and Refresh tokens (Token Rotation!)
        const newAccessToken = generateAccessToken(user.id, user.email);
        const newRefreshToken = generateRefreshToken(user.id, user.email);
        const newRefreshTokenHash = hashToken(newRefreshToken);

        // Delete old refresh token, save new one
        await prisma.$transaction([
          prisma.refreshToken.delete({ where: { id: dbToken.id } }),
          prisma.refreshToken.create({
            data: {
              tokenHash: newRefreshTokenHash,
              userId: user.id,
              sessionId: session.id,
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
            }
          }),
          // Update session expiry
          prisma.session.update({
            where: { id: session.id },
            data: {
              expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
          })
        ]);

        // Set updated cookies on response
        setAuthCookies(res, newAccessToken, newRefreshToken);

        const { passwordHash: _, ...userWithoutPassword } = user;
        req.user = userWithoutPassword;
        req.session = session;
        return next();
      }
    } catch (err) {
      console.warn('Silent refresh failed:', err);
    }
  }

  next();
}
