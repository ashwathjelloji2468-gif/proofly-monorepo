/**
 * Proofly Sentry Client-Side Configuration
 * This file configures Sentry for the browser environment.
 * Next.js automatically imports this from next.config.ts via withSentryConfig.
 */
import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

const SENSITIVE_KEYS = [
  'password', 'token', 'secret', 'api_key', 'apiKey',
  'authorization', 'cookie', 'accessToken', 'refreshToken',
];

function redact(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(redact);
  const result: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    result[k] = SENSITIVE_KEYS.some(s => k.toLowerCase().includes(s.toLowerCase()))
      ? '[REDACTED]'
      : redact(v);
  }
  return result;
}

Sentry.init({
  dsn: SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_BUILD_VERSION || process.env.NEXT_PUBLIC_GIT_COMMIT || 'dev',

  // Performance monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.05 : 0,
  replaysOnErrorSampleRate: process.env.NODE_ENV === 'production' ? 0.5 : 0,

  integrations: [
    Sentry.replayIntegration({
      blockAllMedia: false,
      maskAllText: false,
      maskAllInputs: true,
    }),
  ],

  // Filter out common noise
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Non-Error exception captured',
    'Network request failed',
    /^ChunkLoadError/,
    /^Loading chunk/,
  ],

  beforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
    if (process.env.NODE_ENV === 'development') return null;
    if (event.request) {
      event.request = redact(event.request) as typeof event.request;
    }
    return event;
  },
});
