/**
 * Proofly Audit Log REST API
 * GET /api/v1/admin/audit-logs  — query logs with filters
 * GET /api/v1/admin/audit-logs/export  — export as CSV or JSON
 * DELETE /api/v1/admin/audit-logs/archive  — archive old logs
 */
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { queryAuditLogs, parseAuditDeviceInfo, AuditAction } from '../monitoring/auditLogger';
import { getQueryStats } from '../monitoring/prismaMonitor';
import { getRedisHealth, getRedisStats } from '../monitoring/redis';
import { apiLogger as logger } from '../utils/logger';

const prisma = new PrismaClient();
export const adminRouter = Router();

// ─── Audit Log Query ────────────────────────────────────────────────────────────

adminRouter.get('/audit-logs', async (req: Request, res: Response) => {
  try {
    const {
      userId, action, ipAddress,
      startDate, endDate,
      limit = '50', offset = '0',
    } = req.query as Record<string, string>;

    const result = await queryAuditLogs(prisma, {
      userId: userId || undefined,
      action: action as AuditAction | undefined,
      ipAddress: ipAddress || undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: Math.min(parseInt(limit), 200),
      offset: parseInt(offset),
    });

    // Enrich each log with parsed metadata
    const enriched = result.logs.map(log => ({
      ...log,
      parsedInfo: parseAuditDeviceInfo(log.deviceInfo || ''),
    }));

    res.json({ ...result, logs: enriched });
  } catch (err: any) {
    logger.error('Audit log query failed', err);
    res.status(500).json({ error: 'Failed to query audit logs' });
  }
});

// ─── Audit Log Export ───────────────────────────────────────────────────────────

adminRouter.get('/audit-logs/export', async (req: Request, res: Response) => {
  try {
    const { format = 'json', userId, action, startDate, endDate } = req.query as Record<string, string>;

    const result = await queryAuditLogs(prisma, {
      userId: userId || undefined,
      action: action as AuditAction | undefined,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: 5000, // Max export
    });

    if (format === 'csv') {
      const headers = ['id', 'userId', 'userEmail', 'action', 'ipAddress', 'createdAt', 'deviceInfo'];
      const rows = result.logs.map(log => [
        log.id,
        log.userId,
        log.user?.email || '',
        log.action,
        log.ipAddress || '',
        log.createdAt.toISOString(),
        `"${(log.deviceInfo || '').replace(/"/g, "'")}"`,
      ].join(','));

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-log-${Date.now()}.csv"`);
      res.send([headers.join(','), ...rows].join('\n'));
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="audit-log-${Date.now()}.json"`);
      res.json(result.logs);
    }
  } catch (err: any) {
    logger.error('Audit log export failed', err);
    res.status(500).json({ error: 'Export failed' });
  }
});

// ─── Archive Old Audit Logs ─────────────────────────────────────────────────────

adminRouter.delete('/audit-logs/archive', async (req: Request, res: Response) => {
  try {
    const retentionDays = parseInt((req.query.days as string) || '90');
    const cutoff = new Date(Date.now() - retentionDays * 86400 * 1000);

    const { count } = await prisma.auditLog.deleteMany({
      where: { createdAt: { lt: cutoff } },
    });

    logger.audit('Audit logs archived', {
      metadata: { count, cutoffDate: cutoff.toISOString(), retentionDays },
    });

    res.json({ archived: count, cutoff: cutoff.toISOString() });
  } catch (err: any) {
    logger.error('Audit log archive failed', err);
    res.status(500).json({ error: 'Archive failed' });
  }
});

// ─── DB Query Stats ─────────────────────────────────────────────────────────────

adminRouter.get('/db-stats', async (_req: Request, res: Response) => {
  try {
    const stats = getQueryStats();
    res.json(stats);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get DB stats' });
  }
});

// ─── Redis Stats ────────────────────────────────────────────────────────────────

adminRouter.get('/redis-stats', async (_req: Request, res: Response) => {
  try {
    const [health, stats] = await Promise.all([getRedisHealth(), getRedisStats()]);
    res.json({ health, ...stats });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to get Redis stats' });
  }
});
