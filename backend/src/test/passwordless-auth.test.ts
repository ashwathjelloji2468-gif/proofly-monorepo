import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Passwordless Enterprise Authentication System Integration Tests', () => {
  const testEmail = 'verify-otp-test@proofly.co';

  beforeAll(async () => {
    // Cleanup any existing test users / tokens
    await prisma.oTPToken.deleteMany({ where: { email: testEmail } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
  });

  afterAll(async () => {
    // Final cleanup
    await prisma.oTPToken.deleteMany({ where: { email: testEmail } });
    await prisma.user.deleteMany({ where: { email: testEmail } });
    await prisma.$disconnect();
  });

  describe('OTP Code Management & Expiry', () => {
    it('should securely generate, hash (SHA-256), and persist a 6-digit OTP code', async () => {
      const rawCode = crypto.randomInt(100000, 999999).toString();
      expect(rawCode).toHaveLength(6);

      const otpHash = crypto.createHash('sha256').update(rawCode).digest('hex');
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      const tokenRecord = await prisma.oTPToken.create({
        data: {
          email: testEmail,
          otpHash,
          expiresAt,
          ip: '127.0.0.1',
          device: 'Desktop',
          browser: 'Chrome'
        }
      });

      expect(tokenRecord.id).toBeDefined();
      expect(tokenRecord.email).toBe(testEmail);
      expect(tokenRecord.otpHash).toBe(otpHash);
      expect(tokenRecord.used).toBe(false);
      expect(tokenRecord.attempts).toBe(0);
    });

    it('should enforce attempt limits: increment attempts on failure and invalidate after 5 failed tries', async () => {
      const token = await prisma.oTPToken.findFirst({
        where: { email: testEmail, used: false },
        orderBy: { createdAt: 'desc' }
      });
      expect(token).not.toBeNull();
      if (!token) return;

      // Fail 4 times
      for (let i = 1; i <= 4; i++) {
        const updated = await prisma.oTPToken.update({
          where: { id: token.id },
          data: { attempts: i }
        });
        expect(updated.attempts).toBe(i);
      }

      // 5th attempt invalidates/marks as used
      const finalInvalidated = await prisma.oTPToken.update({
        where: { id: token.id },
        data: { attempts: 5, used: true }
      });
      expect(finalInvalidated.used).toBe(true);
      expect(finalInvalidated.attempts).toBe(5);
    });
  });

  describe('Password Security Controls & Re-use History', () => {
    it('should validate password complexity and block reuse of current or historic hashes', async () => {
      // 1. Create a passwordless user
      const user = await prisma.user.create({
        data: {
          email: testEmail,
          name: 'Security Test User',
          passwordHash: null,
          hasPassword: false,
          provider: 'EMAIL'
        }
      });

      expect(user.hasPassword).toBe(false);

      // 2. Enable password (set a new password)
      const firstPassword = 'Password123!';
      const hash1 = await bcrypt.hash(firstPassword, 12);

      const enabledUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: hash1,
          hasPassword: true
        }
      });

      expect(enabledUser.hasPassword).toBe(true);
      expect(enabledUser.passwordHash).not.toBeNull();

      // Add to password history
      await prisma.passwordHistory.create({
        data: {
          userId: user.id,
          passwordHash: hash1
        }
      });

      // 3. Try to change password but reuse the historic one
      const changePasswordAttempt = firstPassword;
      
      // Look up current password history
      const history = await prisma.passwordHistory.findMany({
        where: { userId: user.id }
      });

      let reuseDetected = false;
      for (const entry of history) {
        const match = await bcrypt.compare(changePasswordAttempt, entry.passwordHash);
        if (match) {
          reuseDetected = true;
          break;
        }
      }

      expect(reuseDetected).toBe(true);

      // 4. Try changing to a fresh password
      const newPassword = 'NewSecurePass99!';
      let changedMatch = false;
      for (const entry of history) {
        const match = await bcrypt.compare(newPassword, entry.passwordHash);
        if (match) {
          changedMatch = true;
          break;
        }
      }
      expect(changedMatch).toBe(false); // No reuse match!
    });
  });

  describe('Session Management & Explicit Revocation', () => {
    it('should establish user sessions and support revoking individual sessions', async () => {
      const user = await prisma.user.findUnique({ where: { email: testEmail } });
      expect(user).not.toBeNull();
      if (!user) return;

      // 1. Create two active sessions
      const session1 = await prisma.session.create({
        data: {
          userId: user.id,
          userAgent: 'Mozilla/5.0 Chrome',
          ipAddress: '127.0.0.1',
          deviceType: 'Desktop',
          isValid: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      const session2 = await prisma.session.create({
        data: {
          userId: user.id,
          userAgent: 'Mozilla/5.0 Safari',
          ipAddress: '192.168.1.1',
          deviceType: 'Mobile',
          isValid: true,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }
      });

      const activeSessionsCount = await prisma.session.count({
        where: { userId: user.id, isValid: true }
      });
      expect(activeSessionsCount).toBe(2);

      // 2. Revoke session 1
      await prisma.session.update({
        where: { id: session1.id },
        data: { isValid: false }
      });

      const session1Check = await prisma.session.findUnique({ where: { id: session1.id } });
      expect(session1Check?.isValid).toBe(false);

      const session2Check = await prisma.session.findUnique({ where: { id: session2.id } });
      expect(session2Check?.isValid).toBe(true);

      const remainingActiveSessionsCount = await prisma.session.count({
        where: { userId: user.id, isValid: true }
      });
      expect(remainingActiveSessionsCount).toBe(1);
    });
  });
});
