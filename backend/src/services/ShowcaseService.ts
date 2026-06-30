import { BaseService } from './BaseService';
import { BillingTier, SpaceRole } from '@prisma/client';

export interface UpdateShowcaseInput {
  headline?: string | null;
  subheadline?: string | null;
  ctaText?: string | null;
  ctaUrl?: string | null;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  layout?: string | null;
  theme?: string | null;
  customCss?: string | null;
  showBranding?: boolean | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  status?: string | null;
}

export class ShowcaseService extends BaseService {
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

  async getShowcaseSettings(spaceId: string) {
    let settings = await this.prisma.showcaseSettings.findUnique({
      where: { spaceId }
    });

    if (!settings) {
      // Create defaults
      settings = await this.prisma.showcaseSettings.create({
        data: {
          spaceId,
          headline: 'Wall of Love',
          subheadline: 'Here is what our customer base thinks about us.',
          ctaText: 'Leave a Review',
          ctaUrl: `/collect/${spaceId}`
        }
      });
    }

    return settings;
  }

  async updateShowcaseSettings(spaceId: string, input: UpdateShowcaseInput) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);
    const user = this.ensureAuthenticated();

    // Ensure default settings exist first
    await this.getShowcaseSettings(spaceId);

    const data: any = {};
    if (input.headline !== undefined) data.headline = input.headline;
    if (input.subheadline !== undefined) data.subheadline = input.subheadline;
    if (input.ctaText !== undefined) data.ctaText = input.ctaText;
    if (input.ctaUrl !== undefined) data.ctaUrl = input.ctaUrl;
    if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl;
    if (input.coverImageUrl !== undefined) data.coverImageUrl = input.coverImageUrl;
    if (input.layout !== undefined) data.layout = input.layout;
    if (input.theme !== undefined) data.theme = input.theme;
    if (input.status !== undefined) data.status = input.status;

    if (input.customCss !== undefined) {
      if (user.tier !== BillingTier.FREE) {
        data.customCss = input.customCss;
      }
    }

    if (input.showBranding !== undefined) {
      if (user.tier === BillingTier.FREE) {
        data.showBranding = true; // lock on free tier
      } else {
        data.showBranding = input.showBranding;
      }
    }

    if (input.metaTitle !== undefined) data.metaTitle = input.metaTitle;
    if (input.metaDescription !== undefined) data.metaDescription = input.metaDescription;

    return this.prisma.showcaseSettings.update({
      where: { spaceId },
      data
    });
  }

  async getPublicShowcase(slug: string) {
    const space = await this.prisma.space.findUnique({
      where: { slug }
    });

    if (!space) {
      throw new Error('NOT_FOUND: Showcase space not found.');
    }

    const settings = await this.getShowcaseSettings(space.id);
    if (settings.status !== 'ACTIVE') {
      throw new Error('DISABLED: Showcase is currently disabled by its owner.');
    }

    const testimonials = await this.prisma.testimonial.findMany({
      where: { spaceId: space.id, isApproved: true },
      orderBy: { createdAt: 'desc' }
    });

    return {
      space,
      settings,
      testimonials
    };
  }

  async getTestimonialDetail(id: string) {
    const testimonial = await this.prisma.testimonial.findUnique({
      where: { id }
    });

    if (!testimonial || !testimonial.isApproved) {
      throw new Error('NOT_FOUND: Testimonial not found.');
    }

    return testimonial;
  }

  async trackShowcaseView(spaceId: string, visitorId: string, referrer?: string | null, utmSource?: string | null, utmMedium?: string | null, utmCampaign?: string | null, req?: any) {
    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) return false;

    // Parse device details
    const userAgent = req?.headers?.['user-agent'] || '';
    let device = 'Desktop';
    let browser = 'Other';
    let os = 'Other';

    if (/mobile/i.test(userAgent)) {
      device = 'Mobile';
    } else if (/tablet/i.test(userAgent) || /ipad/i.test(userAgent)) {
      device = 'Tablet';
    }

    if (/chrome|crios/i.test(userAgent) && !/edge|opr|opios/i.test(userAgent)) {
      browser = 'Chrome';
    } else if (/safari/i.test(userAgent) && !/chrome|crios|opr|opios/i.test(userAgent)) {
      browser = 'Safari';
    } else if (/firefox/i.test(userAgent)) {
      browser = 'Firefox';
    }

    if (/windows/i.test(userAgent)) {
      os = 'Windows';
    } else if (/macintosh|mac os x/i.test(userAgent)) {
      os = 'macOS';
    } else if (/android/i.test(userAgent)) {
      os = 'Android';
    } else if (/iphone|ipad|ipod/i.test(userAgent)) {
      os = 'iOS';
    }

    const country = req?.headers?.['cf-ipcountry'] || req?.headers?.['x-appengine-country'] || 'USA';

    await this.prisma.showcaseView.create({
      data: {
        spaceId,
        visitorId,
        ipAddress: req?.ip || null,
        country,
        device,
        browser,
        os,
        referrer: referrer || null,
        utmSource: utmSource || null,
        utmMedium: utmMedium || null,
        utmCampaign: utmCampaign || null
      }
    });

    return true;
  }

  async trackShowcaseShare(spaceId: string, platform: string, testimonialId?: string | null) {
    await this.prisma.showcaseShare.create({
      data: {
        spaceId,
        platform,
        testimonialId: testimonialId || null
      }
    });
    return true;
  }

  async getShowcaseAnalytics(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER, SpaceRole.VIEWER]);

    const views = await this.prisma.showcaseView.findMany({ where: { spaceId } });
    const shares = await this.prisma.showcaseShare.findMany({ where: { spaceId } });

    const totalViews = views.length;
    const uniqueVisitors = new Set(views.map(v => v.visitorId)).size;
    const totalShares = shares.length;

    // CTR calculation (shares / views)
    const ctr = totalViews > 0 ? parseFloat(((totalShares / totalViews) * 100).toFixed(2)) : 0.0;

    // Breakdown maps
    const deviceMap: Record<string, number> = {};
    const browserMap: Record<string, number> = {};
    const countryMap: Record<string, number> = {};
    const trafficMap: Record<string, { views: number; shares: number }> = {};

    views.forEach(v => {
      const dev = v.device || 'Desktop';
      const br = v.browser || 'Other';
      const c = v.country || 'USA';
      deviceMap[dev] = (deviceMap[dev] || 0) + 1;
      browserMap[br] = (browserMap[br] || 0) + 1;
      countryMap[c] = (countryMap[c] || 0) + 1;

      const dateStr = new Date(v.createdAt).toISOString().split('T')[0];
      if (!trafficMap[dateStr]) trafficMap[dateStr] = { views: 0, shares: 0 };
      trafficMap[dateStr].views++;
    });

    shares.forEach(s => {
      const dateStr = new Date(s.createdAt).toISOString().split('T')[0];
      if (!trafficMap[dateStr]) trafficMap[dateStr] = { views: 0, shares: 0 };
      trafficMap[dateStr].shares++;
    });

    const devices = Object.entries(deviceMap).map(([device, count]) => ({ device, count }));
    const browsers = Object.entries(browserMap).map(([browser, count]) => ({ browser, count }));
    const countries = Object.entries(countryMap).map(([country, count]) => ({ country, count }));
    
    const trafficList = Object.entries(trafficMap).map(([date, data]) => ({
      date,
      views: data.views,
      shares: data.shares
    })).sort((a,b) => a.date.localeCompare(b.date)).slice(-30);

    return {
      views: totalViews,
      visitors: uniqueVisitors,
      clicks: totalShares, // shares act as clicks on showcase
      ctr,
      shares: totalShares,
      devices,
      browsers,
      countries,
      traffic: JSON.stringify(trafficList)
    };
  }
}
