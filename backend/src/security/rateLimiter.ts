import { Request, Response, NextFunction } from 'express';

const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(limit: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Handle trust proxy for client IP
    const ip = req.ip || req.headers['x-forwarded-for']?.toString() || 'unknown';
    const now = Date.now();

    const record = ipRequestCounts.get(ip);

    if (!record || record.resetAt < now) {
      ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= limit) {
      return res.status(429).json({
        errors: [{
          message: 'TOO_MANY_REQUESTS: Too many attempts. Please wait before trying again.'
        }]
      });
    }

    record.count += 1;
    next();
  };
}

const operationLimiters = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, actionKey: string, limit: number, windowMs: number) {
  const key = `${ip}:${actionKey}`;
  const now = Date.now();
  const record = operationLimiters.get(key);

  if (!record || record.resetAt < now) {
    operationLimiters.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }

  if (record.count >= limit) {
    throw new Error(`TOO_MANY_REQUESTS: Too many attempts. Please wait before trying again.`);
  }

  record.count += 1;
}
