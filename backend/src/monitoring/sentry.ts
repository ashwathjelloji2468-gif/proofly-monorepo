/**
 * Proofly Sentry Backend Initialization
 * Must be imported BEFORE all other modules in index.ts
 */
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const SENTRY_DSN = process.env.SENTRY_DSN;
const ENV = process.env.NODE_ENV || 'development';
const IS_PROD = ENV === 'production';

export function initSentry(): void {
  if (!SENTRY_DSN) {
    if (IS_PROD) {
      console.warn('[Sentry] SENTRY_DSN not set — error tracking disabled');
    }
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENV,
    release: process.env.BUILD_VERSION || process.env.GIT_COMMIT || 'dev',
    integrations: [
      nodeProfilingIntegration(),
    ],
    // Performance monitoring
    tracesSampleRate: IS_PROD ? 0.2 : 1.0,
    profilesSampleRate: IS_PROD ? 0.1 : 1.0,

    // Never capture secrets
    beforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
      return sanitizeSentryEvent(event) as Sentry.ErrorEvent | null;
    },
    beforeSendTransaction(event) {
      return event;
    },
  });
}

/** Strip sensitive fields from Sentry events before transmission */
function sanitizeSentryEvent(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
  const BLOCKED_KEYS = [
    'password', 'passwordHash', 'token', 'accessToken', 'refreshToken',
    'authorization', 'cookie', 'secret', 'apiKey', 'api_key',
    'stripeSecret', 'smtp_password', 'smtpPassword', 'privateKey',
    'oauthToken', 'jwtSecret',
  ];

  function sanitize(obj: unknown): unknown {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(sanitize);
    const sanitized: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      if (BLOCKED_KEYS.some(k => key.toLowerCase().includes(k.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitize(val);
      }
    }
    return sanitized;
  }

  if (event.request) {
    event.request = sanitize(event.request) as typeof event.request;
  }
  if (event.extra) {
    event.extra = sanitize(event.extra) as typeof event.extra;
  }
  return event;
}

/**
 * Capture an error with full Proofly context.
 * Use this everywhere instead of Sentry.captureException directly.
 */
export function captureError(
  error: Error | unknown,
  context?: {
    userId?: string;
    workspaceId?: string;
    requestId?: string;
    route?: string;
    tags?: Record<string, string>;
    extra?: Record<string, unknown>;
  }
): void {
  if (!SENTRY_DSN) return;

  Sentry.withScope((scope) => {
    if (context?.userId) scope.setUser({ id: context.userId });
    if (context?.workspaceId) scope.setTag('workspaceId', context.workspaceId);
    if (context?.requestId) scope.setTag('requestId', context.requestId);
    if (context?.route) scope.setTag('route', context.route);
    if (context?.tags) {
      for (const [k, v] of Object.entries(context.tags)) scope.setTag(k, v);
    }
    if (context?.extra) {
      for (const [k, v] of Object.entries(context.extra)) scope.setExtra(k, v);
    }
    Sentry.captureException(error);
  });
}

export { Sentry };
