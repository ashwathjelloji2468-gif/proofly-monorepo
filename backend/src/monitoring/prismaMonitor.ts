/**
 * Proofly Prisma Slow Query Monitor
 *
 * Wraps PrismaClient with $use middleware to instrument every DB query.
 * Categorizes: Fast (<100ms) | Medium (100-300ms) | Slow (300-1000ms) | Critical (>1000ms)
 * Logs N+1 patterns, deadlocks, pool exhaustion, and repeated queries.
 */
import { PrismaClient } from '@prisma/client';
import { dbLogger } from '../utils/logger';
import { captureError } from './sentry';

export interface SlowQueryRecord {
  model: string;
  action: string;
  durationMs: number;
  category: 'fast' | 'medium' | 'slow' | 'critical';
  timestamp: number;
  requestId?: string;
  userId?: string;
}

// Ring buffer: last 500 queries
const queryHistory: SlowQueryRecord[] = [];
const MAX_QUERY_HISTORY = 500;

// Repeated query detection: track (model+action) frequency per minute
const queryFrequency = new Map<string, { count: number; window: number }>();

function categorize(ms: number): SlowQueryRecord['category'] {
  if (ms < 100) return 'fast';
  if (ms < 300) return 'medium';
  if (ms < 1000) return 'slow';
  return 'critical';
}

function detectN1(model: string, action: string): boolean {
  const key = `${model}:${action}`;
  const minute = Math.floor(Date.now() / 60000);
  const rec = queryFrequency.get(key);

  if (!rec || rec.window !== minute) {
    queryFrequency.set(key, { count: 1, window: minute });
    return false;
  }
  rec.count++;
  // N+1 heuristic: same model+action called >20 times per minute
  return rec.count > 20;
}

/**
 * Apply Prisma query monitoring middleware to the provided client.
 * Call this immediately after creating PrismaClient.
 */
export function applyPrismaMonitoring(prisma: PrismaClient): void {
  (prisma as any).$use(async (params: any, next: (p: any) => Promise<any>) => {
    const start = Date.now();
    let result: unknown;
    let queryError: Error | null = null;

    try {
      result = await next(params);
    } catch (err) {
      queryError = err instanceof Error ? err : new Error(String(err));

      const isDeadlock =
        queryError.message.includes('deadlock') ||
        queryError.message.includes('P2034');
      const isTimeout =
        queryError.message.includes('timeout') ||
        queryError.message.includes('P1008');
      const isPoolExhausted =
        queryError.message.includes('pool') ||
        queryError.message.includes('P2024');

      const errorType = isDeadlock
        ? 'DEADLOCK'
        : isTimeout
        ? 'TIMEOUT'
        : isPoolExhausted
        ? 'POOL_EXHAUSTED'
        : 'QUERY_ERROR';

      dbLogger.error(`Database ${errorType}: ${params.model}.${params.action}`, queryError, {
        metadata: { model: params.model, action: params.action, errorType },
      });

      captureError(queryError, {
        tags: { model: params.model, action: params.action, errorType },
      });

      throw queryError;
    }

    const duration = Date.now() - start;
    const category = categorize(duration);

    // Store in ring buffer
    const record: SlowQueryRecord = {
      model: params.model || 'unknown',
      action: params.action || 'unknown',
      durationMs: duration,
      category,
      timestamp: Date.now(),
    };
    queryHistory.push(record);
    if (queryHistory.length > MAX_QUERY_HISTORY) queryHistory.shift();

    // Log slow and critical queries
    if (category === 'critical') {
      dbLogger.error(`CRITICAL query: ${params.model}.${params.action} took ${duration}ms`, undefined, {
        metadata: { model: params.model, action: params.action, duration },
      });
      captureError(new Error(`Critical DB query: ${params.model}.${params.action} (${duration}ms)`), {
        tags: { model: params.model, action: params.action, category: 'critical' },
        extra: { duration },
      });
    } else if (category === 'slow') {
      dbLogger.warn(`Slow query: ${params.model}.${params.action} took ${duration}ms`, {
        metadata: { model: params.model, action: params.action, duration },
      });
    }

    // N+1 detection
    if (detectN1(params.model, params.action)) {
      dbLogger.warn(`Potential N+1 detected: ${params.model}.${params.action} called >20x/min`, {
        metadata: { model: params.model, action: params.action },
      });
    }

    return result;
  });
}

// ─── Query Stats ───────────────────────────────────────────────────────────────

export function getQueryStats() {
  if (queryHistory.length === 0) {
    return {
      totalTracked: 0,
      avgDurationMs: 0,
      p95Ms: 0,
      p99Ms: 0,
      byCategory: { fast: 0, medium: 0, slow: 0, critical: 0 },
      worstQueries: [],
      healthScore: 100,
    };
  }

  const sorted = [...queryHistory].sort((a, b) => a.durationMs - b.durationMs);
  const total = sorted.length;
  const avg = Math.round(sorted.reduce((s, q) => s + q.durationMs, 0) / total);
  const p95 = sorted[Math.floor(total * 0.95)]?.durationMs ?? 0;
  const p99 = sorted[Math.floor(total * 0.99)]?.durationMs ?? 0;

  const byCategory = queryHistory.reduce(
    (acc, q) => { acc[q.category]++; return acc; },
    { fast: 0, medium: 0, slow: 0, critical: 0 }
  );

  // Top 10 worst by model+action
  const modelMap: Record<string, { total: number; count: number; max: number }> = {};
  for (const q of queryHistory) {
    const k = `${q.model}.${q.action}`;
    if (!modelMap[k]) modelMap[k] = { total: 0, count: 0, max: 0 };
    modelMap[k].total += q.durationMs;
    modelMap[k].count++;
    if (q.durationMs > modelMap[k].max) modelMap[k].max = q.durationMs;
  }

  const worstQueries = Object.entries(modelMap)
    .map(([query, { total, count, max }]) => ({
      query,
      avgMs: Math.round(total / count),
      maxMs: max,
      count,
    }))
    .sort((a, b) => b.avgMs - a.avgMs)
    .slice(0, 10);

  // Health score: 100 = all fast, deduct for slow/critical
  const slowPct = ((byCategory.slow + byCategory.critical) / total) * 100;
  const healthScore = Math.max(0, Math.round(100 - slowPct * 2));

  return { totalTracked: total, avgDurationMs: avg, p95Ms: p95, p99Ms: p99, byCategory, worstQueries, healthScore };
}
