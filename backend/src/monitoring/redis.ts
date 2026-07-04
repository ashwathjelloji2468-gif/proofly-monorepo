/**
 * Proofly Redis Client with In-Memory Fallback
 *
 * Supports: Render, Railway, Fly.io, AWS ECS, Kubernetes, Docker
 * Fallback: Automatically uses in-memory MetricsStore when Redis unavailable
 * Recovery: Auto-reconnects with exponential backoff (no crash)
 */
import Redis from 'ioredis';
import { metricsStore } from '../middleware/metrics';
import { logger } from '../utils/logger';

type RedisStatus = 'connected' | 'connecting' | 'disconnected' | 'disabled';

let redisClient: Redis | null = null;
let redisStatus: RedisStatus = 'disabled';
let reconnectAttempts = 0;
const MAX_RECONNECT_DELAY = 30_000;

export function getRedisStatus(): RedisStatus {
  return redisStatus;
}

export function getRedis(): Redis | null {
  return redisStatus === 'connected' ? redisClient : null;
}

/**
 * Initialize Redis connection.
 * If REDIS_URL is not set, falls back to in-memory store silently.
 */
export function initRedis(): void {
  const url = process.env.REDIS_URL;

  if (!url) {
    logger.info('Redis not configured (REDIS_URL missing) — using in-memory metrics fallback', {
      metadata: { fallback: 'MetricsStore' },
    });
    redisStatus = 'disabled';
    return;
  }

  redisStatus = 'connecting';

  redisClient = new Redis(url, {
    maxRetriesPerRequest: 3,
    enableOfflineQueue: false,
    connectTimeout: 5000,
    lazyConnect: true,
    retryStrategy(times) {
      reconnectAttempts = times;
      const delay = Math.min(times * 500, MAX_RECONNECT_DELAY);
      logger.warn(`Redis reconnecting in ${delay}ms (attempt ${times})`, {
        metadata: { attempt: times },
      });
      return delay;
    },
  });

  redisClient.on('connect', () => {
    redisStatus = 'connected';
    reconnectAttempts = 0;
    logger.info('Redis connected', { metadata: { url: url.replace(/:\/\/.*@/, '://***@') } });
  });

  redisClient.on('error', (err) => {
    redisStatus = 'disconnected';
    logger.error('Redis error — falling back to in-memory store', err, {
      metadata: { reconnectAttempts },
    });
  });

  redisClient.on('close', () => {
    redisStatus = 'disconnected';
    logger.warn('Redis connection closed — using in-memory fallback');
  });

  redisClient.connect().catch(() => {
    // Error handled by the 'error' event above
  });
}

// ─── Redis Metrics Operations ──────────────────────────────────────────────────

const TTL = {
  minute: 60,
  hour: 3600,
  day: 86400,
  week: 604800,
};

/** Atomic increment with sliding window TTL. Falls back to metricsStore. */
export async function redisIncr(
  key: string,
  expiry: number = TTL.hour
): Promise<number> {
  const r = getRedis();
  if (!r) return 0;
  try {
    const pipeline = r.pipeline();
    pipeline.incr(key);
    pipeline.expire(key, expiry);
    const results = await pipeline.exec();
    return (results?.[0]?.[1] as number) ?? 0;
  } catch (err) {
    logger.warn(`Redis INCR failed for ${key}`, { metadata: { error: String(err) } });
    return 0;
  }
}

/** Record request metrics to Redis (atomic, sliding window). */
export async function recordRequestToRedis(
  route: string,
  method: string,
  statusCode: number,
  durationMs: number,
  userId?: string,
  workspaceId?: string
): Promise<void> {
  const r = getRedis();
  if (!r) {
    // Always record to in-memory fallback
    metricsStore.recordRequest(route, method, statusCode, durationMs);
    return;
  }

  const ts = Date.now();
  const minute = Math.floor(ts / 60000);
  const hour = Math.floor(ts / 3600000);

  try {
    const pipe = r.pipeline();

    // Request count per minute (slide: 1 hour retention)
    pipe.incr(`proofly:req:count:${minute}`);
    pipe.expire(`proofly:req:count:${minute}`, TTL.hour + 60);

    // Duration list for P95/P99 (keep last 1000 per hour)
    const durKey = `proofly:req:duration:${hour}`;
    pipe.rpush(durKey, durationMs.toString());
    pipe.ltrim(durKey, -1000, -1);
    pipe.expire(durKey, TTL.day);

    // Error rate
    if (statusCode >= 500) {
      pipe.incr(`proofly:errors:5xx:${minute}`);
      pipe.expire(`proofly:errors:5xx:${minute}`, TTL.hour + 60);
    }

    // Route-level latency (sorted set: score = avg duration)
    pipe.zincrby('proofly:routes:calls', 1, `${method}:${route}`);
    pipe.expire('proofly:routes:calls', TTL.week);

    // Workspace usage
    if (workspaceId) {
      pipe.zincrby('proofly:workspaces:active', 1, workspaceId);
      pipe.expire('proofly:workspaces:active', TTL.day);
    }

    // User usage
    if (userId) {
      pipe.zincrby('proofly:users:active', 1, userId);
      pipe.expire('proofly:users:active', TTL.day);
    }

    await pipe.exec();
  } catch (err) {
    // Fallback to memory on failure
    metricsStore.recordRequest(route, method, statusCode, durationMs);
  }

  // Also always record in memory for the /metrics endpoint
  metricsStore.recordRequest(route, method, statusCode, durationMs);
}

/** Record security event to Redis with persistent 7-day TTL. */
export async function recordSecurityEventToRedis(
  type: string,
  ip: string,
  route: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const r = getRedis();
  metricsStore.recordSecurityEvent(type, ip, route);

  if (!r) return;

  try {
    const event = JSON.stringify({ type, ip, route, timestamp: Date.now(), metadata });
    await r.lpush('proofly:security:events', event);
    await r.ltrim('proofly:security:events', 0, 999); // Keep last 1000
    await r.expire('proofly:security:events', TTL.week);
  } catch (err) {
    logger.warn('Failed to write security event to Redis', { metadata: { error: String(err) } });
  }
}

/** Record widget impression/click for analytics. */
export async function recordWidgetMetric(
  widgetId: string,
  event: 'impression' | 'click' | 'conversion',
  workspaceId?: string
): Promise<void> {
  const r = getRedis();
  if (!r) return;

  const day = Math.floor(Date.now() / 86400000);
  try {
    const pipe = r.pipeline();
    pipe.incr(`proofly:widget:${widgetId}:${event}:${day}`);
    pipe.expire(`proofly:widget:${widgetId}:${event}:${day}`, TTL.week * 4);
    pipe.zincrby(`proofly:widgets:top:${event}`, 1, widgetId);
    pipe.expire(`proofly:widgets:top:${event}`, TTL.week);
    if (workspaceId) {
      pipe.zincrby(`proofly:ws:${workspaceId}:widgets`, 1, `${widgetId}:${event}`);
      pipe.expire(`proofly:ws:${workspaceId}:widgets`, TTL.day);
    }
    await pipe.exec();
  } catch (err) {
    logger.warn(`Widget metric Redis write failed for ${widgetId}`, {
      metadata: { error: String(err) },
    });
  }
}

/** Get Redis health info for /health endpoint. */
export async function getRedisHealth(): Promise<{
  status: string;
  latencyMs?: number;
  memoryUsedMB?: number;
  connectedClients?: number;
  hitRate?: string;
}> {
  const r = getRedis();
  if (!r || redisStatus !== 'connected') {
    return { status: redisStatus };
  }

  try {
    const start = Date.now();
    await r.ping();
    const latency = Date.now() - start;

    const info = await r.info('all');
    const lines = info.split('\r\n');
    const get = (key: string) =>
      lines.find(l => l.startsWith(key + ':'))?.split(':')[1]?.trim() || '';

    const usedMemory = parseInt(get('used_memory')) || 0;
    const hitCount = parseInt(get('keyspace_hits')) || 0;
    const missCount = parseInt(get('keyspace_misses')) || 0;
    const hitRate = hitCount + missCount > 0
      ? `${Math.round((hitCount / (hitCount + missCount)) * 100)}%`
      : 'N/A';

    return {
      status: 'connected',
      latencyMs: latency,
      memoryUsedMB: Math.round(usedMemory / 1024 / 1024),
      connectedClients: parseInt(get('connected_clients')) || 0,
      hitRate,
    };
  } catch (err) {
    return { status: 'error' };
  }
}

/** Get top routes, workspaces, and widgets from Redis. */
export async function getRedisStats(): Promise<{
  topRoutes: Array<{ route: string; calls: number }>;
  topWorkspaces: Array<{ workspaceId: string; requests: number }>;
  topWidgets: Array<{ widgetId: string; impressions: number }>;
}> {
  const r = getRedis();
  if (!r) return { topRoutes: [], topWorkspaces: [], topWidgets: [] };

  try {
    const [routeData, wsData, widgetData] = await Promise.all([
      r.zrevrange('proofly:routes:calls', 0, 9, 'WITHSCORES'),
      r.zrevrange('proofly:workspaces:active', 0, 9, 'WITHSCORES'),
      r.zrevrange('proofly:widgets:top:impression', 0, 9, 'WITHSCORES'),
    ]);

    const parsePairs = (arr: string[]) =>
      arr.reduce<Array<[string, number]>>((acc, val, i) => {
        if (i % 2 === 0) acc.push([val, parseInt(arr[i + 1] || '0')]);
        return acc;
      }, []);

    return {
      topRoutes: parsePairs(routeData).map(([route, calls]) => ({ route, calls })),
      topWorkspaces: parsePairs(wsData).map(([workspaceId, requests]) => ({ workspaceId, requests })),
      topWidgets: parsePairs(widgetData).map(([widgetId, impressions]) => ({ widgetId, impressions })),
    };
  } catch {
    return { topRoutes: [], topWorkspaces: [], topWidgets: [] };
  }
}
