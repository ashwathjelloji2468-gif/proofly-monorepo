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
