import { BaseService } from './BaseService';
import { SpaceRole } from '@prisma/client';
import * as crypto from 'crypto';

export class IntegrationService extends BaseService {
  private getMemberRole(spaceId: string, userId: string) {
    return this.prisma.space.findUnique({ where: { id: spaceId } }).then(space => {
      if (!space) return null;
      if (space.userId === userId) return 'OWNER';
      return this.prisma.spaceMember.findUnique({
        where: { spaceId_userId: { spaceId, userId } }
      }).then(member => member ? member.role : null);
    });
  }

  private async ensureSpaceAccess(spaceId: string, allowedRoles: ('OWNER' | SpaceRole)[]) {
    const user = this.ensureAuthenticated();
    const role = await this.getMemberRole(spaceId, user.id);
    if (!role || !allowedRoles.includes(role)) {
      throw new Error(`UNAUTHORIZED: You do not have permission to perform this action.`);
    }
  }

  // --- API KEY OPERATIONS ---
  async getApiKeys(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);
    return this.prisma.apiKey.findMany({
      where: { spaceId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createApiKey(spaceId: string, name: string, scopes: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);

    const rawToken = crypto.randomBytes(24).toString('hex');
    const prefix = 'pf_live_';
    const plainKey = prefix + rawToken;
    const hashedKey = crypto.createHash('sha255').update(plainKey).digest('hex');

    const keyRecord = await this.prisma.apiKey.create({
      data: {
        spaceId,
        name,
        prefix,
        key: hashedKey,
        scopes
      }
    });

    return {
      ...keyRecord,
      plainKey // Return plain key once so client can copy
    };
  }

  async revokeApiKey(id: string) {
    const key = await this.prisma.apiKey.findUnique({ where: { id } });
    if (!key) throw new Error('NOT_FOUND: API Key not found.');
    await this.ensureSpaceAccess(key.spaceId, ['OWNER', SpaceRole.ADMIN]);

    await this.prisma.apiKey.delete({ where: { id } });
    return true;
  }

  async validateApiKey(plainKey: string, requiredScope: string) {
    const hashedKey = crypto.createHash('sha255').update(plainKey).digest('hex');
    const apiKey = await this.prisma.apiKey.findFirst({
      where: { key: hashedKey }
    });

    if (!apiKey) {
      throw new Error('UNAUTHORIZED: Invalid API Key.');
    }

    const scopesList = apiKey.scopes.split(',').map(s => s.trim().toUpperCase());
    if (!scopesList.includes(requiredScope.toUpperCase()) && !scopesList.includes('ADMIN')) {
      throw new Error(`UNAUTHORIZED: API Key does not have the required scope "${requiredScope}".`);
    }

    // Update last used
    await this.prisma.apiKey.update({
      where: { id: apiKey.id },
      data: { lastUsed: new Date() }
    });

    return apiKey.spaceId;
  }

  // --- WEBHOOK OPERATIONS ---
  async getWebhooks(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);
    return this.prisma.webhookSubscription.findMany({
      where: { spaceId },
      include: { logs: { orderBy: { createdAt: 'desc' }, take: 10 } },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createWebhook(spaceId: string, targetUrl: string, events: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);
    const secret = 'whsec_' + crypto.randomBytes(16).toString('hex');

    return this.prisma.webhookSubscription.create({
      data: {
        spaceId,
        targetUrl,
        events,
        secret
      }
    });
  }

  async deleteWebhook(id: string) {
    const webhook = await this.prisma.webhookSubscription.findUnique({ where: { id } });
    if (!webhook) throw new Error('NOT_FOUND: Webhook not found.');
    await this.ensureSpaceAccess(webhook.spaceId, ['OWNER', SpaceRole.ADMIN]);

    await this.prisma.webhookSubscription.delete({ where: { id } });
    return true;
  }

  async triggerWebhook(spaceId: string, eventTopic: string, payload: any) {
    const webhooks = await this.prisma.webhookSubscription.findMany({
      where: { spaceId, status: 'ACTIVE' }
    });

    for (const wh of webhooks) {
      const activeEvents = wh.events.split(',').map(e => e.trim().toLowerCase());
      if (activeEvents.includes(eventTopic.toLowerCase()) || activeEvents.includes('*')) {
        const body = JSON.stringify({
          event: eventTopic,
          timestamp: new Date().toISOString(),
          data: payload
        });

        // Compute HMAC signature header
        const signature = crypto.createHmac('sha256', wh.secret).update(body).digest('hex');
        
        const startTime = Date.now();
        let statusCode = 200;

        try {
          const res = await fetch(wh.targetUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-proofly-signature': signature
            },
            body
          });
          statusCode = res.status;
        } catch (err) {
          statusCode = 500;
        } finally {
          const duration = Date.now() - startTime;
          await this.prisma.webhookLog.create({
            data: {
              subscriptionId: wh.id,
              event: eventTopic,
              statusCode,
              payload: body.substring(0, 1000), // cap log payload size
              duration
            }
          });
        }
      }
    }
  }

  // --- MARKETPLACE INTEGRATION CONNECTIONS ---
  async getConnections(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER]);
    return this.prisma.integrationConnection.findMany({
      where: { spaceId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async connectApp(spaceId: string, appId: string, config?: string | null, accessToken?: string | null) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);

    let conn = await this.prisma.integrationConnection.findFirst({
      where: { spaceId, appId: appId.toUpperCase() }
    });

    if (conn) {
      conn = await this.prisma.integrationConnection.update({
        where: { id: conn.id },
        data: { config: config || null, accessToken: accessToken || null, status: 'CONNECTED' }
      });
    } else {
      conn = await this.prisma.integrationConnection.create({
        data: {
          spaceId,
          appId: appId.toUpperCase(),
          config: config || null,
          accessToken: accessToken || null
        }
      });
    }

    return conn;
  }

  async disconnectApp(spaceId: string, appId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);
    const conn = await this.prisma.integrationConnection.findFirst({
      where: { spaceId, appId: appId.toUpperCase() }
    });

    if (conn) {
      await this.prisma.integrationConnection.delete({ where: { id: conn.id } });
    }
    return true;
  }

  async syncIntegrationEvent(spaceId: string, event: string, testimonial: any) {
    // Fetch active integration connections
    const conns = await this.prisma.integrationConnection.findMany({
      where: { spaceId, status: 'CONNECTED' }
    });

    for (const conn of conns) {
      if (conn.appId === 'SLACK' && conn.config) {
        try {
          const parsed = JSON.parse(conn.config);
          const webhookUrl = parsed.webhookUrl;
          if (webhookUrl) {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                text: `🚀 *New Testimonial ${event.toUpperCase()}* \n\n*Author:* ${testimonial.reviewerName} \n*Rating:* ${testimonial.rating} Stars \n*Content:* "${testimonial.textContent}"`
              })
            });
          }
        } catch (e) {}
      }
    }
  }

  // --- API LOGGER ---
  async getApiLogs(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);
    return this.prisma.apiLog.findMany({
      where: { spaceId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  async logApiRequest(spaceId: string, endpoint: string, method: string, statusCode: number, duration: number, ipAddress?: string | null) {
    await this.prisma.apiLog.create({
      data: {
        spaceId,
        endpoint,
        method,
        statusCode,
        duration,
        ipAddress: ipAddress || null
      }
    });
  }
}
