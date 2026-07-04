/**
 * Proofly Sentry Edge Runtime Configuration
 * Applied to Next.js Middleware and edge API routes.
 */
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
