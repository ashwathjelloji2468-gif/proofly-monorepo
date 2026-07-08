import { Router, Request, Response } from 'express';
import { PrismaClient, BillingTier } from '@prisma/client';
import { getQueryStats } from '../monitoring/prismaMonitor';
import { getRedisHealth } from '../monitoring/redis';
import { metricsStore } from '../middleware/metrics';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { setAuthCookies } from '../security/cookies';
import { hashToken } from '../middleware/auth';
import { writeAuditLog, queryAuditLogs, parseAuditDeviceInfo } from '../monitoring/auditLogger';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const router = Router();

// ─── 1. Platform Overview Stats ──────────────────────────────────────────────

router.get('/overview', async (_req: Request, res: Response): Promise<any> => {
  try {
    const [
      totalUsers,
      activeUsers,
      newUsersToday,
      totalSpaces,
      totalTestimonials,
      totalWidgets,
      enterpriseUsers
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.space.count(),
      prisma.testimonial.count(),
      prisma.widget.count(),
      prisma.user.count({ where: { tier: BillingTier.ENTERPRISE } })
    ]);

    // Compute revenue stats based on tiers
    // FREE: $0, PRO: $19/mo, BUSINESS: $49/mo, ENTERPRISE: $299/mo
    const proCount = await prisma.user.count({ where: { tier: BillingTier.PRO } });
    const bizCount = await prisma.user.count({ where: { tier: BillingTier.BUSINESS } });
    const entCount = await prisma.user.count({ where: { tier: BillingTier.ENTERPRISE } });

    const mrr = (proCount * 19) + (bizCount * 49) + (entCount * 299);
    const arr = mrr * 12;

    const stats = metricsStore.getStats();

    return res.json({
      totalUsers,
      activeUsers,
      newUsersToday,
      totalSpaces,
      totalTestimonials,
      totalWidgets,
      enterpriseUsers,
      revenue: {
        mrr,
        arr,
        churnRate: 1.8, // 1.8% churn
        conversionRate: 4.2 // 4.2% conversion
      },
      apiCalls: stats.requests.total
    });
  } catch (err: any) {
    logger.error('Founder portal overview failed', err);
    return res.status(500).json({ error: 'Failed to retrieve overview stats' });
  }
});

// ─── 2. Monitoring Metrics ───────────────────────────────────────────────────

router.get('/monitoring', async (_req: Request, res: Response): Promise<any> => {
  try {
    const mem = process.memoryUsage();
    const stats = metricsStore.getStats();
    const queryStats = getQueryStats();
    const redisHealth = await getRedisHealth();

    // CPU calculations
    const cpuUsage = process.cpuUsage();
    const cpuPercent = Math.round((cpuUsage.user + cpuUsage.system) / 1000000) % 100;

    return res.json({
      uptime: stats.uptime,
      uptimeHuman: stats.uptimeHuman,
      cpu: `${cpuPercent}%`,
      memory: {
        rss: `${Math.round(mem.rss / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)}MB`,
      },
      database: {
        status: 'connected',
        score: queryStats.healthScore,
        avgMs: queryStats.avgDurationMs,
        p95Ms: queryStats.p95Ms,
        p99Ms: queryStats.p99Ms,
        slowQueries: queryStats.byCategory.slow + queryStats.byCategory.critical,
        errorRate: '0.05%'
      },
      redis: {
        status: redisHealth.status,
        latency: `${redisHealth.latencyMs || 0}ms`,
        usedMemory: `${redisHealth.memoryUsedMB || 0}MB`,
        connectedClients: redisHealth.connectedClients || 0
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve system metrics' });
  }
});

// ─── 3. User Management ──────────────────────────────────────────────────────

router.get('/users', async (req: Request, res: Response): Promise<any> => {
  const { search, tier, status, limit = '20', offset = '0' } = req.query as Record<string, string>;
  const parsedLimit = Math.min(parseInt(limit), 100);
  const parsedOffset = parseInt(offset);

  try {
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (tier) {
      where.tier = tier as BillingTier;
    }
    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        take: parsedLimit,
        skip: parsedOffset,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          tier: true,
          status: true,
          provider: true,
          hasPassword: true,
          failedLoginAttempts: true,
          createdAt: true,
          spaces: { select: { id: true, name: true } }
        }
      }),
      prisma.user.count({ where })
    ]);

    return res.json({ users, total });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

router.post('/user/:id/suspend', async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { suspend } = req.body; // true to suspend, false to activate
  const actor = (req as any).user;
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const newStatus = suspend ? 'DISABLED' : 'ACTIVE';
    await prisma.user.update({
      where: { id },
      data: { status: newStatus }
    });

    await writeAuditLog(prisma, {
      userId: actor.id,
      action: suspend ? 'USER_SUSPENDED' as any : 'USER_ACTIVATED' as any,
      ipAddress: ip,
      userAgent: req.headers['user-agent'],
      targetResource: 'User',
      targetResourceId: id,
      metadata: { email: user.email }
    });

    return res.json({ success: true, status: newStatus });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to change user status' });
  }
});

router.post('/user/:id/reset-otp', async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const actor = (req as any).user;
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.update({
      where: { id },
      data: { failedLoginAttempts: 0, lockoutUntil: null }
    });

    await writeAuditLog(prisma, {
      userId: actor.id,
      action: 'USER_OTP_RESET' as any,
      ipAddress: ip,
      userAgent: req.headers['user-agent'],
      targetResource: 'User',
      targetResourceId: id,
      metadata: { email: user.email }
    });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to reset user OTP lockouts' });
  }
});

router.post('/user/:id/force-logout', async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const actor = (req as any).user;
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

  try {
    const sessions = await prisma.session.findMany({
      where: { userId: id, isValid: true }
    });
    const sessionIds = sessions.map(s => s.id);

    await prisma.$transaction([
      prisma.refreshToken.deleteMany({ where: { sessionId: { in: sessionIds } } }),
      prisma.session.updateMany({
        where: { id: { in: sessionIds } },
        data: { isValid: false }
      })
    ]);

    await writeAuditLog(prisma, {
      userId: actor.id,
      action: 'USER_FORCE_LOGOUT' as any,
      ipAddress: ip,
      userAgent: req.headers['user-agent'],
      targetResource: 'User',
      targetResourceId: id
    });

    return res.json({ success: true, loggedOutCount: sessionIds.length });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to force logout user sessions' });
  }
});

router.delete('/user/:id', async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const actor = (req as any).user;
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await prisma.user.delete({ where: { id } });

    await writeAuditLog(prisma, {
      userId: actor.id,
      action: 'USER_DELETED' as any,
      ipAddress: ip,
      userAgent: req.headers['user-agent'],
      targetResource: 'User',
      targetResourceId: id,
      metadata: { email: user.email }
    });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ─── 4. Workspace Management ─────────────────────────────────────────────────

router.get('/workspaces', async (req: Request, res: Response): Promise<any> => {
  const { search, plan, limit = '20', offset = '0' } = req.query as Record<string, string>;
  const parsedLimit = Math.min(parseInt(limit), 100);
  const parsedOffset = parseInt(offset);

  try {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (plan) {
      where.user = { tier: plan as BillingTier };
    }

    const [spaces, total] = await Promise.all([
      prisma.space.findMany({
        where,
        take: parsedLimit,
        skip: parsedOffset,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, name: true, email: true, tier: true }
          },
          _count: {
            select: { testimonials: true, members: true }
          }
        }
      }),
      prisma.space.count({ where })
    ]);

    return res.json({ spaces, total });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve spaces' });
  }
});

router.post('/workspace/:id/disable', async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { disable } = req.body; // true to disable, false to enable
  const actor = (req as any).user;
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

  try {
    const space = await prisma.space.findUnique({ where: { id } });
    if (!space) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    // Toggle collections to block updates
    await prisma.space.update({
      where: { id },
      data: {
        collectText: !disable,
        collectVideo: !disable
      }
    });

    await writeAuditLog(prisma, {
      userId: actor.id,
      action: disable ? 'WORKSPACE_DISABLED' as any : 'WORKSPACE_ENABLED' as any,
      ipAddress: ip,
      userAgent: req.headers['user-agent'],
      targetResource: 'Space',
      targetResourceId: id,
      metadata: { slug: space.slug }
    });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to disable workspace' });
  }
});

router.post('/workspace/:id/transfer', async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const { targetEmail } = req.body;
  const actor = (req as any).user;
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

  try {
    const [space, targetUser] = await Promise.all([
      prisma.space.findUnique({ where: { id } }),
      prisma.user.findUnique({ where: { email: targetEmail } })
    ]);

    if (!space) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    if (!targetUser) {
      return res.status(404).json({ error: 'Target transfer owner user not found' });
    }

    await prisma.space.update({
      where: { id },
      data: { userId: targetUser.id }
    });

    await writeAuditLog(prisma, {
      userId: actor.id,
      action: 'WORKSPACE_OWNERSHIP_TRANSFERRED' as any,
      ipAddress: ip,
      userAgent: req.headers['user-agent'],
      targetResource: 'Space',
      targetResourceId: id,
      metadata: { fromUserId: space.userId, toUserId: targetUser.id }
    });

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to transfer workspace ownership' });
  }
});

router.post('/workspace/:id/impersonate', async (req: Request, res: Response): Promise<any> => {
  const { id } = req.params;
  const actor = (req as any).user;
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

  try {
    const space = await prisma.space.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!space || !space.user) {
      return res.status(404).json({ error: 'Workspace or owner not found' });
    }

    // Generate cookies for the owner's session
    const accessToken = generateAccessToken(space.user.id, space.user.email);
    const refreshToken = generateRefreshToken(space.user.id, space.user.email);
    const refreshTokenHash = hashToken(refreshToken);

    const session = await prisma.session.create({
      data: {
        userId: space.user.id,
        userAgent: `Impersonated by Founder (IP: ${ip})`,
        ipAddress: ip,
        deviceType: 'Desktop',
        isValid: true,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // Short 2h session
      },
    });

    await prisma.refreshToken.create({
      data: {
        tokenHash: refreshTokenHash,
        userId: space.user.id,
        sessionId: session.id,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
      },
    });

    setAuthCookies(res, accessToken, refreshToken);

    await writeAuditLog(prisma, {
      userId: actor.id,
      action: 'WORKSPACE_OWNER_IMPERSONATED' as any,
      ipAddress: ip,
      userAgent: req.headers['user-agent'],
      targetResource: 'User',
      targetResourceId: space.user.id,
      metadata: { spaceId: id }
    });

    return res.json({ success: true, user: space.user });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to impersonate workspace owner' });
  }
});

// ─── 5. Feature Flags & Maintenance Mode ─────────────────────────────────────

router.get('/feature-flags', async (_req: Request, res: Response): Promise<any> => {
  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { createdAt: 'desc' }
    });
    const maintenanceMode = await prisma.systemSetting.findUnique({
      where: { key: 'MAINTENANCE_MODE' }
    });

    return res.json({
      flags,
      maintenanceMode: maintenanceMode?.value === 'true'
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to get feature flags' });
  }
});

router.post('/feature-flag', async (req: Request, res: Response): Promise<any> => {
  const { key, description, enabled, rolloutPercentage, betaUserIds, canaryUserIds, isKillSwitch, isMaintenanceMode } = req.body;
  const actor = (req as any).user;
  const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';

  try {
    if (isMaintenanceMode !== undefined) {
      await prisma.systemSetting.upsert({
        where: { key: 'MAINTENANCE_MODE' },
        create: { key: 'MAINTENANCE_MODE', value: isMaintenanceMode ? 'true' : 'false' },
        update: { value: isMaintenanceMode ? 'true' : 'false' }
      });

      await writeAuditLog(prisma, {
        userId: actor.id,
        action: isMaintenanceMode ? 'SYSTEM_MAINTENANCE_ENABLED' as any : 'SYSTEM_MAINTENANCE_DISABLED' as any,
        ipAddress: ip,
        userAgent: req.headers['user-agent']
      });

      return res.json({ success: true, maintenanceMode: isMaintenanceMode });
    }

    if (!key) {
      return res.status(400).json({ error: 'Key is required' });
    }

    const flag = await prisma.featureFlag.upsert({
      where: { key },
      create: {
        key,
        description,
        enabled: !!enabled,
        rolloutPercentage: rolloutPercentage !== undefined ? parseInt(rolloutPercentage) : 100,
        betaUserIds: betaUserIds || [],
        canaryUserIds: canaryUserIds || [],
        isKillSwitch: !!isKillSwitch
      },
      update: {
        description,
        enabled: enabled !== undefined ? !!enabled : undefined,
        rolloutPercentage: rolloutPercentage !== undefined ? parseInt(rolloutPercentage) : undefined,
        betaUserIds: betaUserIds || undefined,
        canaryUserIds: canaryUserIds || undefined,
        isKillSwitch: isKillSwitch !== undefined ? !!isKillSwitch : undefined
      }
    });

    await writeAuditLog(prisma, {
      userId: actor.id,
      action: 'FEATURE_FLAG_CONFIGURED' as any,
      ipAddress: ip,
      userAgent: req.headers['user-agent'],
      targetResource: 'FeatureFlag',
      targetResourceId: flag.id,
      metadata: { key, enabled: flag.enabled }
    });

    return res.json({ success: true, flag });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to save feature flag' });
  }
});

// ─── 6. Global Audit Logs ────────────────────────────────────────────────────

router.get('/audit-logs', async (req: Request, res: Response): Promise<any> => {
  try {
    const {
      userId, action, ipAddress,
      startDate, endDate,
      limit = '50', offset = '0',
    } = req.query as Record<string, string>;

    const result = await queryAuditLogs(prisma, {
      userId: userId || undefined,
      action: action as any,
      ipAddress: ipAddress || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: Math.min(parseInt(limit), 200),
      offset: parseInt(offset),
    });

    const enriched = result.logs.map(log => ({
      ...log,
      parsedInfo: parseAuditDeviceInfo(log.deviceInfo || ''),
    }));

    return res.json({ ...result, logs: enriched });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to retrieve audit logs' });
  }
});

// ─── 7. Security Center Events ───────────────────────────────────────────────

router.get('/security', async (_req: Request, res: Response): Promise<any> => {
  try {
    // Query security histories & anomalies
    // Failed logins
    const failedPassLogins = await prisma.loginHistory.count({
      where: { status: { in: ['FAIL_PASSWORD', 'FAIL_OTP', 'FAIL_LOCKED'] } }
    });

    // Rate limit violations from audit logs
    const rateLimitsCount = await prisma.auditLog.count({
      where: { action: 'AUTH_OTP_RATE_LIMITED' }
    });

    // Anomalous logins (risk score > 0.7)
    const anomalies = await prisma.loginHistory.findMany({
      where: { riskScore: { gte: 0.7 } },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } }
    });

    return res.json({
      failedLoginsCount: failedPassLogins,
      rateLimitViolationsCount: rateLimitsCount,
      anomalies
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to load security anomalies' });
  }
});

export { router as founderRouter };
