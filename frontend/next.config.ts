import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  // Disable the Sentry telemetry popup in development
  experimental: {},
};

export default withSentryConfig(nextConfig, {
  // Sentry organization and project (set via env vars in CI/CD)
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Auth token for source map uploads
  authToken: process.env.SENTRY_AUTH_TOKEN,

  // Upload source maps in production builds only
  silent: true,
  hideSourceMaps: true,

  // Disable automatic instrumentation of Vercel Cron Monitors
  automaticVercelMonitors: false,

  // Tunnel Sentry requests through our own domain (blocks adblocker interference)
  tunnelRoute: "/monitoring/tunnel",

  // Disables server-side source map upload during dev
  disableLogger: true,
});
