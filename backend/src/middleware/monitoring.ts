import crypto from 'crypto';
/**
 * Proofly Monitoring Middleware
 * - Generates unique Request IDs (X-Request-ID)
 * - Logs every request with timing, status, user, route
 * - Captures unhandled errors and formats safe responses
 * - Tracks slow queries and large payloads
 * - Detects security anomalies (brute force, large bodies)
 */

import { Request, Response, NextFunction } from 'express';

import { logger, securityLogger, apiLogger } from '../utils/logger';
import { metricsStore } from './metrics';

// Extend Express Request with monitoring fields
declare global {
  namespace Express {
    interface Request {
      requestId: string;
      startTime: number;
      userId?: string;
      workspaceId?: string;
    }
  }
}

// ─── 1. Request ID Injection ───────────────────────────────────────────────────

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const existingId = req.headers['x-request-id'];
  req.requestId = typeof existingId === 'string' ? existingId : crypto.randomUUID();
  req.startTime = Date.now();
  res.setHeader('X-Request-ID', req.requestId);
  next();
}

// ─── 2. Request Logger ─────────────────────────────────────────────────────────

export function requestLoggerMiddleware(req: Request, res: Response, next: NextFunction): void {
  const { method, url, ip } = req;
  const userAgent = req.headers['user-agent'] || '';

  // Skip health/liveness checks from request logs to reduce noise
  if (url === '/live' || url === '/ready') {
    next();
    return;
  }

  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    const { statusCode } = res;

    const level = statusCode >= 500 ? 'ERROR' : statusCode >= 400 ? 'WARN' : 'INFO';

    apiLogger[level.toLowerCase() as 'info' | 'warn' | 'error'](
      `${method} ${url} ${statusCode} ${duration}ms`,
      {
        requestId: req.requestId,
        userId: req.userId,
        route: url,
        method,
        statusCode,
        duration,
        ip: ip || req.socket?.remoteAddress,
        userAgent,
        metadata: { contentLength: res.getHeader('content-length') },
      }
    );

    // Track metrics
    metricsStore.recordRequest(url, method, statusCode, duration);

    // Alert on slow responses
    if (duration > 5000) {
      logger.warn(`Slow response detected: ${method} ${url} took ${duration}ms`, {
        requestId: req.requestId,
        userId: req.userId,
        duration,
        route: url,
      });
    }
  });

  next();
}

// ─── 3. Global Express Error Handler ──────────────────────────────────────────

export function errorHandlerMiddleware(
  err: Error & { status?: number; code?: string; statusCode?: number },
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || err.status || 500;
  const requestId = req.requestId;

  logger.error(`Unhandled Express error: ${err.message}`, err, {
    requestId,
    userId: req.userId,
    route: req.url,
    method: req.method,
    statusCode,
    ip: req.ip,
    metadata: { code: err.code },
  });

  // Track in metrics
  metricsStore.recordError(req.url, err.message, statusCode);

  // Safe response — never expose stack traces
  res.status(statusCode).json({
    error: statusCode >= 500 ? 'Internal server error' : err.message,
    requestId,
    timestamp: new Date().toISOString(),
  });
}

// ─── 4. Security Monitor Middleware ───────────────────────────────────────────

const failedLoginAttempts = new Map<string, { count: number; firstAt: number }>();
const BRUTE_FORCE_WINDOW = 10 * 60 * 1000; // 10 minutes
const BRUTE_FORCE_THRESHOLD = 10;
const LARGE_PAYLOAD_THRESHOLD = 1024 * 1024; // 1MB

export function securityMonitorMiddleware(req: Request, res: Response, next: NextFunction): void {
  const ip = req.ip || req.socket?.remoteAddress || 'unknown';

  // Detect oversized payloads
  const contentLength = parseInt(req.headers['content-length'] || '0');
  if (contentLength > LARGE_PAYLOAD_THRESHOLD) {
    securityLogger.warn(`Large payload detected: ${contentLength} bytes`, {
      requestId: req.requestId,
      ip,
      route: req.url,
      metadata: { contentLength },
    });
  }

  // Track login failures
  if (req.url.includes('/graphql') && req.method === 'POST') {
    res.on('finish', () => {
      if (res.statusCode === 401) {
        const record = failedLoginAttempts.get(ip) || { count: 0, firstAt: Date.now() };

        // Reset window
        if (Date.now() - record.firstAt > BRUTE_FORCE_WINDOW) {
          record.count = 0;
          record.firstAt = Date.now();
        }

        record.count++;
        failedLoginAttempts.set(ip, record);

        if (record.count >= BRUTE_FORCE_THRESHOLD) {
          securityLogger.warn(`Brute force attempt detected from ${ip}`, {
            ip,
            requestId: req.requestId,
            metadata: { attempts: record.count, windowMs: BRUTE_FORCE_WINDOW },
          });
          metricsStore.recordSecurityEvent('BRUTE_FORCE', ip, req.url);
        }
      }
    });
  }

  next();
}

// ─── 5. Unhandled Promise Rejection & Exception Capture ───────────────────────

export function setupProcessErrorHandlers(): void {
  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Promise Rejection', reason instanceof Error ? reason : new Error(String(reason)), {
      metadata: { reason: String(reason) },
    });
  });

  process.on('uncaughtException', (err: Error) => {
    logger.error('Uncaught Exception — shutting down gracefully', err);
    // Give logger time to flush, then exit
    setTimeout(() => process.exit(1), 500);
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received — beginning graceful shutdown');
  });

  process.on('SIGINT', () => {
    logger.info('SIGINT received — beginning graceful shutdown');
  });
}
