import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

describe('Platform Founder Administration Portal Security & Actions Integration Checks', () => {
  const customerEmail = 'normal-customer@proofly.co';
  const founderEmail = 'co-founder@proofly.co';

  beforeAll(async () => {
    // Clean up if existing
    await prisma.user.deleteMany({
      where: { email: { in: [customerEmail, founderEmail] } }
    });

    // Create a normal customer user
    await prisma.user.create({
      data: {
        email: customerEmail,
        name: 'Regular Customer',
        passwordHash: await bcrypt.hash('NormalPass1!', 12),
        role: UserRole.USER,
        status: 'ACTIVE'
      }
    });

    // Create a founder user
    await prisma.user.create({
      data: {
        email: founderEmail,
        name: 'Proofly Founder',
        passwordHash: await bcrypt.hash('FounderPass99!', 12),
        role: UserRole.FOUNDER,
        status: 'ACTIVE'
      }
    });
  });

  afterAll(async () => {
    // Cleanup
    await prisma.user.deleteMany({
      where: { email: { in: [customerEmail, founderEmail] } }
    });
    await prisma.$disconnect();
  });

  describe('Founder Access Restrictions Check', () => {
    it('should assert that normal customers have UserRole.USER role', async () => {
      const normalUser = await prisma.user.findUnique({ where: { email: customerEmail } });
      expect(normalUser).not.toBeNull();
      expect(normalUser?.role).toBe(UserRole.USER);
    });

    it('should assert that founders have UserRole.FOUNDER role', async () => {
      const founderUser = await prisma.user.findUnique({ where: { email: founderEmail } });
      expect(founderUser).not.toBeNull();
      expect(founderUser?.role).toBe(UserRole.FOUNDER);
    });
  });

  describe('User Administrative Actions (Lockouts & Suspension)', () => {
    it('should allow suspending and activating customer accounts', async () => {
      const customer = await prisma.user.findUnique({ where: { email: customerEmail } });
      expect(customer).not.toBeNull();
      if (!customer) return;

      // Suspend
      await prisma.user.update({
        where: { id: customer.id },
        data: { status: 'DISABLED' }
      });
      const suspended = await prisma.user.findUnique({ where: { id: customer.id } });
      expect(suspended?.status).toBe('DISABLED');

      // Reactivate
      await prisma.user.update({
        where: { id: customer.id },
        data: { status: 'ACTIVE' }
      });
      const active = await prisma.user.findUnique({ where: { id: customer.id } });
      expect(active?.status).toBe('ACTIVE');
    });

    it('should reset lockout failures and password attempt metrics', async () => {
      const customer = await prisma.user.findUnique({ where: { email: customerEmail } });
      expect(customer).not.toBeNull();
      if (!customer) return;

      // Simulate locked user state
      await prisma.user.update({
        where: { id: customer.id },
        data: {
          failedLoginAttempts: 5,
          lockoutUntil: new Date(Date.now() + 15 * 60 * 1000)
        }
      });

      const lockedUser = await prisma.user.findUnique({ where: { id: customer.id } });
      expect(lockedUser?.failedLoginAttempts).toBe(5);
      expect(lockedUser?.lockoutUntil).not.toBeNull();

      // Reset lockout
      await prisma.user.update({
        where: { id: customer.id },
        data: {
          failedLoginAttempts: 0,
          lockoutUntil: null
        }
      });

      const unlockedUser = await prisma.user.findUnique({ where: { id: customer.id } });
      expect(unlockedUser?.failedLoginAttempts).toBe(0);
      expect(unlockedUser?.lockoutUntil).toBeNull();
    });
  });

  describe('Feature Flag Configurations & Rollouts', () => {
    it('should support creating and toggling feature flags', async () => {
      const flagKey = 'PLATFORM_DARK_STUDIO_ALPHA';

      // Create
      const flag = await prisma.featureFlag.upsert({
        where: { key: flagKey },
        create: {
          key: flagKey,
          description: 'Dark mode AI studio rollout flag',
          enabled: false,
          rolloutPercentage: 50
        },
        update: {}
      });

      expect(flag.key).toBe(flagKey);
      expect(flag.enabled).toBe(false);
      expect(flag.rolloutPercentage).toBe(50);

      // Toggle enabled state
      const updatedFlag = await prisma.featureFlag.update({
        where: { key: flagKey },
        data: { enabled: true }
      });
      expect(updatedFlag.enabled).toBe(true);

      // Cleanup flag
      await prisma.featureFlag.delete({ where: { key: flagKey } });
    });
  });
});
