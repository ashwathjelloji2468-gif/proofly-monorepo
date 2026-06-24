import { BaseService } from './BaseService';
import { BillingTier } from '@prisma/client';

export interface CreateSpaceInput {
  name: string;
  slug: string;
  headerTitle: string;
  customMessage: string;
  logoUrl?: string | null;
  collectVideo?: boolean | null;
  collectText?: boolean | null;
  theme?: string | null;
  customDomain?: string | null;
}

export interface UpdateSpaceInput {
  name?: string | null;
  headerTitle?: string | null;
  customMessage?: string | null;
  logoUrl?: string | null;
  collectVideo?: boolean | null;
  collectText?: boolean | null;
  theme?: string | null;
  customDomain?: string | null;
}

export class SpaceService extends BaseService {
  async getMySpaces() {
    const user = this.ensureAuthenticated();
    return this.prisma.space.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getSpaceBySlug(slug: string) {
    const space = await this.prisma.space.findUnique({
      where: { slug: slug.toLowerCase().trim() },
      include: {
        testimonials: {
          where: { isApproved: true, isArchived: false },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    return space;
  }

  async createSpace(input: CreateSpaceInput) {
    const user = this.ensureAuthenticated();

    // Check slug availability
    const sanitizedSlug = input.slug.toLowerCase().trim();
    const existing = await this.prisma.space.findUnique({
      where: { slug: sanitizedSlug }
    });
    if (existing) {
      throw new Error(`SLUG_TAKEN: The space slug "${sanitizedSlug}" is already taken.`);
    }

    // Billing plan restrictions:
    // Free: max 2 spaces
    // Pro: max 5 spaces
    // Business / Enterprise: unlimited
    if (user.tier === BillingTier.FREE || user.tier === BillingTier.PRO) {
      const count = await this.prisma.space.count({
        where: { userId: user.id }
      });
      const limit = user.tier === BillingTier.FREE ? 2 : 5;
      if (count >= limit) {
        throw new Error(`LIMIT_REACHED: Your current plan (${user.tier}) is limited to ${limit} spaces. Please upgrade to a higher tier for more spaces.`);
      }
    }

    return this.prisma.space.create({
      data: {
        name: input.name,
        slug: sanitizedSlug,
        headerTitle: input.headerTitle,
        customMessage: input.customMessage,
        logoUrl: input.logoUrl,
        collectVideo: input.collectVideo ?? true,
        collectText: input.collectText ?? true,
        theme: input.theme ?? 'light',
        customDomain: input.customDomain,
        userId: user.id
      }
    });
  }

  async updateSpace(id: string, input: UpdateSpaceInput) {
    const user = this.ensureAuthenticated();

    const space = await this.prisma.space.findUnique({ where: { id } });
    if (!space) {
      throw new Error('SPACE_NOT_FOUND');
    }
    if (space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own this space.');
    }

    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.headerTitle !== undefined) data.headerTitle = input.headerTitle;
    if (input.customMessage !== undefined) data.customMessage = input.customMessage;
    if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl;
    if (input.collectVideo !== undefined) data.collectVideo = input.collectVideo;
    if (input.collectText !== undefined) data.collectText = input.collectText;
    if (input.theme !== undefined) data.theme = input.theme;
    if (input.customDomain !== undefined) {
      // Custom domains require Business or Enterprise plan
      if (user.tier !== BillingTier.BUSINESS && user.tier !== BillingTier.ENTERPRISE && input.customDomain) {
        throw new Error('BUSINESS_FEATURE: Custom domains are only available on the BUSINESS or ENTERPRISE plans.');
      }
      data.customDomain = input.customDomain;
    }

    return this.prisma.space.update({
      where: { id },
      data
    });
  }

  async deleteSpace(id: string) {
    const user = this.ensureAuthenticated();

    const space = await this.prisma.space.findUnique({ where: { id } });
    if (!space) {
      throw new Error('SPACE_NOT_FOUND');
    }
    if (space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own this space.');
    }

    await this.prisma.space.delete({ where: { id } });
    return true;
  }

  async createWebhook(spaceId: string, url: string) {
    const user = this.ensureAuthenticated();

    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new Error('SPACE_NOT_FOUND');
    }
    if (space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own this space.');
    }

    // Webhooks require at least Pro plan
    if (user.tier === BillingTier.FREE) {
      throw new Error('PRO_FEATURE: Webhooks are only available on PRO, BUSINESS, or ENTERPRISE plans.');
    }

    return this.prisma.webhook.create({
      data: {
        spaceId,
        url,
        isActive: true
      }
    });
  }

  async deleteWebhook(id: string) {
    const user = this.ensureAuthenticated();

    const webhook = await this.prisma.webhook.findUnique({
      where: { id },
      include: { space: true }
    });
    if (!webhook) {
      throw new Error('WEBHOOK_NOT_FOUND');
    }
    if (webhook.space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own the space associated with this webhook.');
    }

    await this.prisma.webhook.delete({ where: { id } });
    return true;
  }
}
