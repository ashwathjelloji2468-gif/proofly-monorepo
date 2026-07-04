/**
 * Proofly Sentry Server-Side Configuration (Next.js Edge/Node)
 * Applied to API routes, Server Components, and Route Handlers.
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.BUILD_VERSION || process.env.GIT_COMMIT || 'dev',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,

  beforeSend(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
    if (process.env.NODE_ENV === 'development') return null;
    // Strip sensitive server-side headers before transmission
    if (event.request?.headers) {
      const h = event.request.headers as Record<string, string>;
      delete h['authorization'];
      delete h['cookie'];
      delete h['x-api-key'];
    }
    return event;
  },
});
