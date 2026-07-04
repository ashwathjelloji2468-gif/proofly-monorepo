/**
 * Proofly Centralized Structured Logger
 * JSON-structured output for production observability.
 * Levels: DEBUG < INFO < WARN < ERROR < AUDIT
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'AUDIT';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  requestId?: string;
  userId?: string;
  workspaceId?: string;
  route?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  message: string;
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  metadata?: Record<string, unknown>;
  environment: string;
  correlationId?: string;
  ip?: string;
  userAgent?: string;
}

const ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = (process.env.LOG_LEVEL || 'INFO') as LogLevel;
const IS_PROD = ENV === 'production';

const LEVEL_ORDER: Record<LogLevel, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  AUDIT: 4,
};

function shouldLog(level: LogLevel): boolean {
  return LEVEL_ORDER[level] >= LEVEL_ORDER[LOG_LEVEL];
}

function buildEntry(
  level: LogLevel,
  service: string,
  message: string,
  context?: Partial<Omit<LogEntry, 'level' | 'service' | 'message' | 'timestamp' | 'environment'>>
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    service,
    message,
    environment: ENV,
    ...context,
  };

  // In production, strip stack traces from non-AUDIT logs for security
  if (IS_PROD && entry.error?.stack && level !== 'AUDIT') {
    delete entry.error.stack;
  }

  return entry;
}

function emit(entry: LogEntry): void {
  if (!shouldLog(entry.level)) return;

  const line = JSON.stringify(entry);

  if (entry.level === 'ERROR' || entry.level === 'AUDIT') {
    process.stderr.write(line + '\n');
  } else {
    process.stdout.write(line + '\n');
  }
}

// ─── Logger factory ────────────────────────────────────────────────────────────

export function createLogger(service: string) {
  return {
    debug: (message: string, ctx?: Partial<LogEntry>) =>
      emit(buildEntry('DEBUG', service, message, ctx)),

    info: (message: string, ctx?: Partial<LogEntry>) =>
      emit(buildEntry('INFO', service, message, ctx)),

    warn: (message: string, ctx?: Partial<LogEntry>) =>
      emit(buildEntry('WARN', service, message, ctx)),

    error: (message: string, err?: Error | unknown, ctx?: Partial<LogEntry>) => {
      const errorInfo = err instanceof Error
        ? { name: err.name, message: err.message, stack: err.stack }
        : err ? { name: 'UnknownError', message: String(err) } : undefined;
      emit(buildEntry('ERROR', service, message, { ...ctx, error: errorInfo }));
    },

    audit: (message: string, ctx?: Partial<LogEntry>) =>
      emit(buildEntry('AUDIT', service, message, ctx)),
  };
}

// ─── Global singleton loggers ──────────────────────────────────────────────────

export const logger = createLogger('proofly-backend');
export const authLogger = createLogger('auth');
export const dbLogger = createLogger('database');
export const stripeLogger = createLogger('stripe');
export const aiLogger = createLogger('ai-suite');
export const webhookLogger = createLogger('webhooks');
export const emailLogger = createLogger('email');
export const cloudinaryLogger = createLogger('cloudinary');
export const oauthLogger = createLogger('oauth');
export const apiLogger = createLogger('public-api');
export const securityLogger = createLogger('security');
