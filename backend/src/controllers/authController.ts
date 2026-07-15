import { Router, Request, Response } from 'express';
import { PrismaClient, BillingTier } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { setAuthCookies } from '../security/cookies';
import { hashToken } from '../middleware/auth';
import { writeAuditLog } from '../monitoring/auditLogger';
import { EmailService } from '../services/EmailService';
import { logger } from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();
const emailService = new EmailService();

// Anonymous lockouts and progressive delays in memory for non-existent users
const anonLockouts = new Map<string, { attempts: number; lockoutUntil: number }>();

// ─── Helper Functions ─────────────────────────────────────────────────────────

function hashOTP(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

function parseUserAgent(ua: string | undefined): { browser: string; os: string; device: string } {
  if (!ua) {
    return { browser: 'Unknown', os: 'Unknown', device: 'Desktop' };
  }
  let browser = 'Unknown Browser';
  let os = 'Unknown OS';
  let device = 'Desktop';
  const uaLower = ua.toLowerCase();

  if (uaLower.includes('firefox')) {
    browser = 'Firefox';
  } else if (uaLower.includes('chrome') && !uaLower.includes('chromium')) {
    browser = 'Chrome';
  } else if (uaLower.includes('safari') && !uaLower.includes('chrome')) {
    browser = 'Safari';
  } else if (uaLower.includes('edge')) {
    browser = 'Edge';
  } else if (uaLower.includes('opera') || uaLower.includes('opr')) {
    browser = 'Opera';
  }

  if (uaLower.includes('windows')) {
    os = 'Windows';
  } else if (uaLower.includes('macintosh') || uaLower.includes('mac os x')) {
    os = 'macOS';
  } else if (uaLower.includes('linux')) {
    os = 'Linux';
  } else if (uaLower.includes('android')) {
    os = 'Android';
    device = 'Mobile';
  } else if (uaLower.includes('iphone') || uaLower.includes('ipad')) {
    os = 'iOS';
    device = 'Mobile';
  }

  return { browser, os, device };
}

function validatePasswordStrength(password: string) {
  if (password.length < 8) {
    throw new Error('Password must be at least 8 characters long.');
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    throw new Error('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
  }
}

async function checkPasswordReuse(userId: string, currentPasswordHash: string | null, newPasswordRaw: string) {
  if (currentPasswordHash) {
    const match = await bcrypt.compare(newPasswordRaw, currentPasswordHash);
    if (match) {
      throw new Error('You cannot reuse your current password.');
    }
  }

  const history = await prisma.passwordHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' }
  });

  for (const entry of history) {
    const match = await bcrypt.compare(newPasswordRaw, entry.passwordHash);
    if (match) {
      throw new Error('You cannot reuse a recently used password.');
    }
  }
}

async function createUserSession(
  userId: string,
  email: string,
  userAgent: string | null,
  ipAddress: string | null
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = generateAccessToken(userId, email);
  const refreshToken = generateRefreshToken(userId, email);
  const refreshTokenHash = hashToken(refreshToken);

  const session = await prisma.session.create({
    data: {
      userId,
      userAgent,
      ipAddress,
      deviceType: parseUserAgent(userAgent || undefined).device,
      isValid: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      userId,
      sessionId: session.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
}

// ─── REST OTP Endpoints ──────────────────────────────────────────────────────

router.post('/request-otp', async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const sanitizedEmail = email.toLowerCase().trim();
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  const userAgent = req.headers['user-agent'] || undefined;
  const { browser, device } = parseUserAgent(userAgent);

  try {
    // 1. Rate Limiting: 5 requests per hour per email/IP
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentOTPs = await prisma.oTPToken.count({
      where: {
        OR: [
          { email: sanitizedEmail },
          { ip }
        ],
        createdAt: { gte: oneHourAgo }
      }
    });

    if (recentOTPs >= 5) {
      await writeAuditLog(prisma, {
        action: 'AUTH_OTP_RATE_LIMITED',
        ipAddress: ip,
        userAgent,
        metadata: { email: sanitizedEmail, reason: 'OTP requests rate limit exceeded (5/hour)' }
      });
      return res.status(429).json({ error: 'TOO_MANY_REQUESTS: Limit exceeded. Please try again in an hour.' });
    }

    // 2. Lockout Check for existing users
    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (user && user.lockoutUntil && user.lockoutUntil > new Date()) {
      return res.status(423).json({ error: 'ACCOUNT_LOCKED: Account locked for 15 minutes due to too many failed login attempts.' });
    }

    // Lockout check for anon email lockouts
    const anonLock = anonLockouts.get(sanitizedEmail);
    if (anonLock && anonLock.lockoutUntil > Date.now()) {
      return res.status(423).json({ error: 'ACCOUNT_LOCKED: Account locked for 15 minutes due to too many failed login attempts.' });
    }

    // 3. Generate secure code
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 4. Save to DB
    await prisma.oTPToken.create({
      data: {
        userId: user?.id || null,
        email: sanitizedEmail,
        otpHash,
        expiresAt,
        ip,
        device,
        browser
      }
    });

    // 5. Send Email
    await emailService.sendOTPVerificationEmail(sanitizedEmail, otp);

    // 6. Audit & Log
    await writeAuditLog(prisma, {
      userId: user?.id,
      action: 'AUTH_OTP_SENT',
      ipAddress: ip,
      userAgent,
      metadata: { email: sanitizedEmail }
    });

    return res.json({ success: true, message: 'OTP sent successfully' });
  } catch (err: any) {
    logger.error('Failed to request OTP', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

router.post('/resend-otp', async (req: Request, res: Response): Promise<any> => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }
  const sanitizedEmail = email.toLowerCase().trim();
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  const userAgent = req.headers['user-agent'] || undefined;
  const { browser, device } = parseUserAgent(userAgent);

  try {
    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpHash = hashOTP(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.oTPToken.create({
      data: {
        userId: user?.id || null,
        email: sanitizedEmail,
        otpHash,
        expiresAt,
        ip,
        device,
        browser
      }
    });

    await emailService.sendOTPVerificationEmail(sanitizedEmail, otp);

    await writeAuditLog(prisma, {
      userId: user?.id,
      action: 'AUTH_OTP_SENT',
      ipAddress: ip,
      userAgent,
      metadata: { email: sanitizedEmail, resend: true }
    });

    return res.json({ success: true, message: 'OTP resent successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

router.post('/verify-otp', async (req: Request, res: Response): Promise<any> => {
  const { email, otp, signupToken, name, workspaceName } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const sanitizedEmail = email.toLowerCase().trim();
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
  const userAgent = req.headers['user-agent'] || undefined;
  const { browser, os, device } = parseUserAgent(userAgent);

  // Progressive delay logic based on failed attempts in last 15 mins
  try {
    const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000);
    const failedAttempts = await prisma.loginHistory.count({
      where: {
        OR: [
          { user: { email: sanitizedEmail } },
          { ipAddress: ip }
        ],
        status: { in: ['FAIL_PASSWORD', 'FAIL_OTP', 'FAIL_LOCKED'] },
        createdAt: { gte: fifteenMinsAgo }
      }
    });

    if (failedAttempts > 0) {
      const delayMs = Math.min(Math.pow(2, failedAttempts) * 1000, 15000);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  } catch (e) {}

  // ─── A: Handle profile completion flow (Signup) ───
  if (signupToken) {
    if (!name || !workspaceName) {
      return res.status(400).json({ error: 'Full name and default workspace are required' });
    }

    try {
      const secret = process.env.JWT_SECRET || 'fallback-secret';
      const payload = jwt.verify(signupToken, secret) as any;

      if (payload.email !== sanitizedEmail) {
        return res.status(400).json({ error: 'Invalid signup token context' });
      }

      // Check if user already registered in the meantime
      let user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
      if (user) {
        return res.status(400).json({ error: 'User is already registered. Please login.' });
      }

      // Create new user without password
      const randomPassword = crypto.randomBytes(32).toString('hex');
      const passwordHash = await bcrypt.hash(randomPassword, 12);

      user = await prisma.user.create({
        data: {
          email: sanitizedEmail,
          name: name.trim(),
          passwordHash,
          tier: BillingTier.FREE,
          isVerified: true, // OTP verified
          provider: 'EMAIL',
          hasPassword: false,
        }
      });

      // Create Default Workspace
      const workspaceSlug = `${workspaceName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${crypto.randomInt(1000, 9999)}`;
      await prisma.space.create({
        data: {
          userId: user.id,
          name: workspaceName,
          slug: workspaceSlug,
          headerTitle: `Welcome to ${workspaceName}`,
          customMessage: 'Thank you for taking the time to share your feedback with us!',
        }
      });

      // Create session and set cookies
      const { accessToken, refreshToken } = await createUserSession(user.id, sanitizedEmail, userAgent || null, ip);
      setAuthCookies(res, accessToken, refreshToken);

      // Audit and login history
      await writeAuditLog(prisma, {
        userId: user.id,
        action: 'AUTH_SIGNUP',
        ipAddress: ip,
        userAgent,
        metadata: { workspace: workspaceName }
      });

      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress: ip,
          userAgent: userAgent || null,
          browser,
          os,
          device,
          status: 'SUCCESS',
          authMethod: 'OTP',
        }
      });

      const { passwordHash: _, ...userWithoutPassword } = user;
      return res.json({ success: true, user: userWithoutPassword, workspaceCreated: true });
    } catch (err: any) {
      return res.status(400).json({ error: 'Invalid or expired signup token. Please request another code.' });
    }
  }

  // ─── B: Handle standard OTP code verification ───
  if (!otp) {
    return res.status(400).json({ error: 'Verification code is required' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });

    // Lockout verification
    if (user && user.lockoutUntil && user.lockoutUntil > new Date()) {
      return res.status(423).json({ error: 'ACCOUNT_LOCKED: Account is locked. Try again in 15 minutes.' });
    }

    const anonLock = anonLockouts.get(sanitizedEmail);
    if (anonLock && anonLock.lockoutUntil > Date.now()) {
      return res.status(423).json({ error: 'ACCOUNT_LOCKED: Account is locked. Try again in 15 minutes.' });
    }

    // Find active OTP token
    const hashedCode = hashOTP(otp);
    const tokenRecord = await prisma.oTPToken.findFirst({
      where: {
        email: sanitizedEmail,
        used: false,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!tokenRecord) {
      // Invalid or expired OTP
      if (user) {
        const attempts = user.failedLoginAttempts + 1;
        const lockoutUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
        await prisma.user.update({
          where: { id: user.id },
          data: { failedLoginAttempts: attempts, lockoutUntil }
        });

        await prisma.loginHistory.create({
          data: {
            userId: user.id,
            ipAddress: ip,
            userAgent: userAgent || null,
            browser,
            os,
            device,
            status: attempts >= 5 ? 'FAIL_LOCKED' : 'FAIL_OTP',
            authMethod: 'OTP',
          }
        });
      } else {
        // Anon lockout tracking
        const attempts = (anonLock?.attempts || 0) + 1;
        const lockoutUntil = attempts >= 5 ? Date.now() + 15 * 60 * 1000 : 0;
        anonLockouts.set(sanitizedEmail, { attempts, lockoutUntil });
      }

      await writeAuditLog(prisma, {
        userId: user?.id,
        action: 'AUTH_OTP_FAILED',
        ipAddress: ip,
        userAgent,
        metadata: { email: sanitizedEmail }
      });

      return res.status(400).json({ error: 'Invalid or expired verification code.' });
    }

    // Handle token verify attempts
    if (tokenRecord.attempts >= 5) {
      // Invalidate token
      await prisma.oTPToken.update({
        where: { id: tokenRecord.id },
        data: { used: true }
      });
      return res.status(400).json({ error: 'Too many incorrect attempts for this code. Please request a new one.' });
    }

    if (tokenRecord.otpHash !== hashedCode) {
      await prisma.oTPToken.update({
        where: { id: tokenRecord.id },
        data: { attempts: tokenRecord.attempts + 1 }
      });
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    // Successful OTP match! Invalidate token immediately
    await prisma.oTPToken.update({
      where: { id: tokenRecord.id },
      data: { used: true }
    });

    if (user) {
      // Reset lockout & login attempts
      await prisma.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: 0, lockoutUntil: null }
      });

      // Clear anon lockouts if any
      anonLockouts.delete(sanitizedEmail);

      // Create session and set cookies
      const { accessToken, refreshToken } = await createUserSession(user.id, sanitizedEmail, userAgent || null, ip);
      setAuthCookies(res, accessToken, refreshToken);

      await writeAuditLog(prisma, {
        userId: user.id,
        action: 'AUTH_LOGIN',
        ipAddress: ip,
        userAgent,
        metadata: { method: 'OTP' }
      });

      await prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress: ip,
          userAgent: userAgent || null,
          browser,
          os,
          device,
          status: 'SUCCESS',
          authMethod: 'OTP',
        }
      });

      const { passwordHash: _, ...userWithoutPassword } = user;
      return res.json({ success: true, userExists: true, user: userWithoutPassword });
    } else {
      // Create temporary signed signupToken token valid for 15 mins
      const secret = process.env.JWT_SECRET || 'fallback-secret';
      const signupToken = jwt.sign({ email: sanitizedEmail }, secret, { expiresIn: '15m' });

      return res.json({ success: true, userExists: false, signupToken });
    }
  } catch (err: any) {
    logger.error('Failed to verify OTP', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// ─── Authenticated Security Endpoints ────────────────────────────────────────

function requireAuth(req: Request, res: Response, next: any) {
  if (!(req as any).user) {
    res.status(401).json({ error: 'UNAUTHENTICATED: You must be logged in to perform this action.' });
    return;
  }
  next();
}

router.post('/enable-password', requireAuth, async (req: Request, res: Response): Promise<any> => {
  const { password } = req.body;
  const user = (req as any).user;
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    validatePasswordStrength(password);
    await checkPasswordReuse(user.id, user.passwordHash, password);

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        hasPassword: true
      }
    });

    await prisma.passwordHistory.create({
      data: {
        userId: user.id,
        passwordHash
      }
    });

    await writeAuditLog(prisma, {
      userId: user.id,
      action: 'AUTH_PASSWORD_ENABLED',
      ipAddress: ip,
      userAgent: req.headers['user-agent']
    });

    return res.json({ success: true, message: 'Password login enabled successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to enable password' });
  }
});

router.post('/disable-password', requireAuth, async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

  try {
    // Prevent removing all auth methods
    const oauthCount = await prisma.oAuthAccount.count({ where: { userId: user.id } });
    if (oauthCount === 0) {
      return res.status(400).json({ error: 'Cannot disable password login. You must connect Google or GitHub first.' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        hasPassword: false
      }
    });

    await writeAuditLog(prisma, {
      userId: user.id,
      action: 'AUTH_PASSWORD_DISABLED',
      ipAddress: ip,
      userAgent: req.headers['user-agent']
    });

    return res.json({ success: true, message: 'Password login disabled successfully' });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

router.post('/set-password', requireAuth, async (req: Request, res: Response): Promise<any> => {
  const { password } = req.body;
  const user = (req as any).user;
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  try {
    validatePasswordStrength(password);
    await checkPasswordReuse(user.id, user.passwordHash, password);

    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        hasPassword: true
      }
    });

    await prisma.passwordHistory.create({
      data: {
        userId: user.id,
        passwordHash
      }
    });

    await writeAuditLog(prisma, {
      userId: user.id,
      action: 'AUTH_PASSWORD_ENABLED',
      ipAddress: ip,
      userAgent: req.headers['user-agent']
    });

    return res.json({ success: true, message: 'Password established successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to establish password' });
  }
});

router.post('/change-password', requireAuth, async (req: Request, res: Response): Promise<any> => {
  const { oldPassword, newPassword } = req.body;
  const user = (req as any).user;
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ error: 'Current password and new password are required' });
  }

  try {
    const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
    if (!dbUser || !dbUser.passwordHash) {
      return res.status(400).json({ error: 'Account does not have password login enabled' });
    }

    const match = await bcrypt.compare(oldPassword, dbUser.passwordHash);
    if (!match) {
      return res.status(400).json({ error: 'Incorrect current password' });
    }

    validatePasswordStrength(newPassword);
    await checkPasswordReuse(user.id, dbUser.passwordHash, newPassword);

    const newHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash
      }
    });

    await prisma.passwordHistory.create({
      data: {
        userId: user.id,
        passwordHash: newHash
      }
    });

    await writeAuditLog(prisma, {
      userId: user.id,
      action: 'AUTH_PASSWORD_CHANGED',
      ipAddress: ip,
      userAgent: req.headers['user-agent']
    });

    return res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || 'Failed to update password' });
  }
});

router.get('/sessions', requireAuth, async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  const currentSession = (req as any).session;

  try {
    const sessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        isValid: true,
        expiresAt: { gt: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    const enriched = sessions.map(s => ({
      id: s.id,
      userAgent: s.userAgent,
      ipAddress: s.ipAddress,
      deviceType: s.deviceType,
      createdAt: s.createdAt.getTime().toString(),
      lastActivity: s.lastActivity.getTime().toString(),
      isCurrent: currentSession && currentSession.id === s.id
    }));

    return res.json(enriched);
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve active sessions' });
  }
});

router.delete('/session/:id', requireAuth, async (req: Request, res: Response): Promise<any> => {
  const sessionId = req.params.id;
  const user = (req as any).user;
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

  try {
    const session = await prisma.session.findFirst({
      where: { id: sessionId, userId: user.id }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prisma.$transaction([
      prisma.refreshToken.deleteMany({ where: { sessionId } }),
      prisma.session.update({
        where: { id: sessionId },
        data: { isValid: false }
      })
    ]);

    await writeAuditLog(prisma, {
      userId: user.id,
      action: 'AUTH_SESSION_REVOKE',
      ipAddress: ip,
      userAgent: req.headers['user-agent'],
      targetResource: 'Session',
      targetResourceId: sessionId
    });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to revoke session' });
  }
});

router.delete('/sessions', requireAuth, async (req: Request, res: Response): Promise<any> => {
  const user = (req as any).user;
  const currentSession = (req as any).session;
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

  try {
    const otherSessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        isValid: true,
        id: currentSession ? { not: currentSession.id } : undefined
      }
    });

    const otherSessionIds = otherSessions.map(s => s.id);

    await prisma.$transaction([
      prisma.refreshToken.deleteMany({ where: { sessionId: { in: otherSessionIds } } }),
      prisma.session.updateMany({
        where: { id: { in: otherSessionIds } },
        data: { isValid: false }
      })
    ]);

    await writeAuditLog(prisma, {
      userId: user.id,
      action: 'AUTH_ALL_SESSIONS_REVOKE',
      ipAddress: ip,
      userAgent: req.headers['user-agent']
    });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to revoke other sessions' });
  }
});

export { router as authRouter };
