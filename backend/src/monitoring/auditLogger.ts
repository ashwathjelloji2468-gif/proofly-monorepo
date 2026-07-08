/**
 * Proofly Persistent Audit Logger
 *
 * Writes every important action to the AuditLog table in Prisma.
 * Includes: auth, workspace, testimonials, widgets, billing, AI, API, admin, security.
 *
 * The AuditLog model already exists in schema.prisma.
 * We extend its usage here with structured context.
 */
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

export type AuditSeverity = 'INFO' | 'WARN' | 'HIGH' | 'CRITICAL';

export type AuditAction =
  // Authentication
  | 'AUTH_LOGIN' | 'AUTH_LOGOUT' | 'AUTH_SIGNUP' | 'AUTH_OAUTH'
  | 'AUTH_PASSWORD_RESET' | 'AUTH_EMAIL_VERIFY' | 'AUTH_SESSION_REVOKE'
  | 'AUTH_MFA_ENABLE' | 'AUTH_MFA_DISABLE' | 'AUTH_FAILED_LOGIN'
  // Workspace
  | 'WORKSPACE_CREATE' | 'WORKSPACE_DELETE' | 'WORKSPACE_RENAME'
  | 'WORKSPACE_MEMBER_ADD' | 'WORKSPACE_MEMBER_REMOVE' | 'WORKSPACE_ROLE_CHANGE'
  | 'WORKSPACE_OWNERSHIP_TRANSFER'
  // Testimonials
  | 'TESTIMONIAL_CREATE' | 'TESTIMONIAL_EDIT' | 'TESTIMONIAL_DELETE'
  | 'TESTIMONIAL_APPROVE' | 'TESTIMONIAL_REJECT'
  | 'TESTIMONIAL_IMPORT' | 'TESTIMONIAL_EXPORT'
  // Widgets
  | 'WIDGET_CREATE' | 'WIDGET_EDIT' | 'WIDGET_DELETE'
  | 'WIDGET_PUBLISH' | 'WIDGET_UNPUBLISH'
  // Billing
  | 'BILLING_CHECKOUT' | 'BILLING_UPGRADE' | 'BILLING_DOWNGRADE'
  | 'BILLING_INVOICE' | 'BILLING_REFUND' | 'BILLING_COUPON'
  | 'BILLING_CANCEL'
  // AI
  | 'AI_REWRITE' | 'AI_TRANSLATE' | 'AI_SOCIAL' | 'AI_LANDING' | 'AI_USAGE'
  // API / Webhooks
  | 'API_KEY_CREATE' | 'API_KEY_DELETE' | 'API_KEY_USE'
  | 'WEBHOOK_CREATE' | 'WEBHOOK_DELETE' | 'WEBHOOK_FIRE' | 'WEBHOOK_FAIL'
  // Admin
  | 'ADMIN_FEATURE_FLAG' | 'ADMIN_ORG_CHANGE' | 'ADMIN_ACCESS'
  // Settings
  | 'SETTINGS_WHITE_LABEL' | 'SETTINGS_SMTP' | 'SETTINGS_DOMAIN' | 'SETTINGS_UPDATE'
  // Security
  | 'SECURITY_RATE_LIMIT' | 'SECURITY_IP_BLOCK' | 'SECURITY_PERMISSION_DENIED'
  | 'SECURITY_BRUTE_FORCE'
  // Passwordless Auth Actions
  | 'AUTH_OTP_REQUESTED' | 'AUTH_OTP_SENT' | 'AUTH_OTP_VERIFIED' | 'AUTH_OTP_EXPIRED'
  | 'AUTH_OTP_FAILED' | 'AUTH_OTP_RATE_LIMITED' | 'AUTH_PASSWORD_ENABLED' | 'AUTH_PASSWORD_DISABLED'
  | 'AUTH_PASSWORD_CHANGED' | 'AUTH_PASSWORD_LOGIN' | 'AUTH_ALL_SESSIONS_REVOKE'
  | 'AUTH_EMAIL_CHANGED' | 'AUTH_VERIFICATION_COMPLETED' | 'AUTH_FAILED' | 'AUTH_BLOCKED'
  | 'AUTH_MAGIC_LOGIN' | 'AUTH_RISK_DETECTED';

export interface AuditContext {
  userId?: string;
  action: AuditAction;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  correlationId?: string;
  workspaceId?: string;
  organizationId?: string;
  targetResource?: string;
  targetResourceId?: string;
  previousValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  severity?: AuditSeverity;
  metadata?: Record<string, unknown>;
}

// Sensitive fields that must never appear in audit logs
const BLOCKED_AUDIT_FIELDS = [
  'password', 'passwordHash', 'token', 'accessToken', 'refreshToken',
  'secret', 'apiKey', 'jwtSecret', 'stripeSecret', 'privateKey', 'cookie',
];

function sanitizeAuditValues(obj: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (!obj) return undefined;
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    if (BLOCKED_AUDIT_FIELDS.some(blocked => key.toLowerCase().includes(blocked.toLowerCase()))) {
      result[key] = '[REDACTED]';
    } else if (val && typeof val === 'object' && !Array.isArray(val)) {
      result[key] = sanitizeAuditValues(val as Record<string, unknown>);
    } else {
      result[key] = val;
    }
  }
  return result;
}

/**
 * Write an audit log entry to the database.
 * Fire-and-forget: errors in audit logging never propagate to callers.
 */
export async function writeAuditLog(
  prisma: PrismaClient,
  ctx: AuditContext
): Promise<void> {
  try {
    const deviceInfo = [
      ctx.action,
      ctx.requestId ? `req:${ctx.requestId}` : '',
      ctx.workspaceId ? `ws:${ctx.workspaceId}` : '',
      ctx.organizationId ? `org:${ctx.organizationId}` : '',
      ctx.targetResource ? `res:${ctx.targetResource}` : '',
      ctx.targetResourceId ? `id:${ctx.targetResourceId}` : '',
      ctx.severity ? `sev:${ctx.severity}` : '',
      ctx.correlationId ? `corr:${ctx.correlationId}` : '',
      ctx.userAgent ? `ua:${ctx.userAgent.slice(0, 100)}` : '',
      ctx.previousValues ? `prev:${JSON.stringify(sanitizeAuditValues(ctx.previousValues)).slice(0, 500)}` : '',
      ctx.newValues ? `new:${JSON.stringify(sanitizeAuditValues(ctx.newValues)).slice(0, 500)}` : '',
      ctx.metadata ? `meta:${JSON.stringify(sanitizeAuditValues(ctx.metadata as Record<string, unknown>)).slice(0, 500)}` : '',
    ].filter(Boolean).join(' | ');

    await prisma.auditLog.create({
      data: {
        userId: ctx.userId,
        action: ctx.action,
        ipAddress: ctx.ipAddress?.slice(0, 45), // IPv6 max length
        deviceInfo: deviceInfo.slice(0, 1000),
      },
    });
  } catch (err) {
    // Never let audit logging crash the app
    logger.warn('Audit log write failed', {
      userId: ctx.userId,
      metadata: { action: ctx.action, error: String(err) },
    });
  }
}

// ─── Audit Log Query Helpers ───────────────────────────────────────────────────

export interface AuditLogFilter {
  userId?: string;
  action?: AuditAction;
  ipAddress?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export async function queryAuditLogs(
  prisma: PrismaClient,
  filter: AuditLogFilter
) {
  const where: Record<string, unknown> = {};

  if (filter.userId) where.userId = filter.userId;
  if (filter.ipAddress) where.ipAddress = filter.ipAddress;
  if (filter.action) where.action = filter.action;
  if (filter.startDate || filter.endDate) {
    where.createdAt = {
      ...(filter.startDate ? { gte: filter.startDate } : {}),
      ...(filter.endDate ? { lte: filter.endDate } : {}),
    };
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: filter.limit ?? 50,
      skip: filter.offset ?? 0,
      include: { user: { select: { id: true, email: true, name: true } } },
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { logs, total, limit: filter.limit ?? 50, offset: filter.offset ?? 0 };
}

/** Parse structured deviceInfo field back to metadata for display. */
export function parseAuditDeviceInfo(deviceInfo: string): Record<string, string> {
  if (!deviceInfo) return {};
  const result: Record<string, string> = {};
  for (const part of deviceInfo.split(' | ')) {
    const colonIdx = part.indexOf(':');
    if (colonIdx > -1) {
      result[part.slice(0, colonIdx)] = part.slice(colonIdx + 1);
    }
  }
  return result;
}
