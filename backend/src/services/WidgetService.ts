import { BaseService } from './BaseService';
import { BillingTier, SpaceRole } from '@prisma/client';

export class WidgetService extends BaseService {
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

  async getMyWidgets(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER, SpaceRole.VIEWER]);
    return this.prisma.widget.findMany({
      where: { spaceId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getWidgetById(id: string) {
    const widget = await this.prisma.widget.findUnique({
      where: { id }
    });
    if (!widget) {
      throw new Error('NOT_FOUND: Widget not found.');
    }
    return widget;
  }

  async createWidget(spaceId: string, name: string, layout: string, theme: string, settingsRaw: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);
    const user = this.ensureAuthenticated();

    // Check Free tier limit (max 1 widget)
    if (user.tier === BillingTier.FREE) {
      const widgetCount = await this.prisma.widget.count({
        where: { spaceId }
      });
      if (widgetCount >= 1) {
        throw new Error('LIMIT_REACHED: Your Free plan is limited to 1 widget. Please upgrade to Pro.');
      }
    }

    let settings = {};
    try {
      settings = JSON.parse(settingsRaw);
    } catch (e) {
      throw new Error('INVALID_ARGUMENT: Settings must be a valid JSON string.');
    }

    // Free tier forces branding to be enabled
    if (user.tier === BillingTier.FREE) {
      (settings as any).showProoflyBranding = true;
    }

    return this.prisma.widget.create({
      data: {
        spaceId,
        name,
        layout,
        theme,
        settings: settings as any,
        status: 'ACTIVE'
      }
    });
  }

  async updateWidget(id: string, input: { name?: string; layout?: string; theme?: string; settings?: string; status?: string }) {
    const widget = await this.prisma.widget.findUnique({ where: { id } });
    if (!widget) {
      throw new Error('NOT_FOUND: Widget not found.');
    }
    await this.ensureSpaceAccess(widget.spaceId, ['OWNER', SpaceRole.ADMIN]);
    const user = this.ensureAuthenticated();

    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.layout !== undefined) data.layout = input.layout;
    if (input.theme !== undefined) data.theme = input.theme;
    if (input.status !== undefined) data.status = input.status;

    if (input.settings !== undefined) {
      try {
        let settings = JSON.parse(input.settings);
        if (user.tier === BillingTier.FREE) {
          settings.showProoflyBranding = true;
        }
        data.settings = settings;
      } catch (e) {
        throw new Error('INVALID_ARGUMENT: Settings must be a valid JSON string.');
      }
    }

    return this.prisma.widget.update({
      where: { id },
      data
    });
  }

  async deleteWidget(id: string) {
    const widget = await this.prisma.widget.findUnique({ where: { id } });
    if (!widget) {
      throw new Error('NOT_FOUND: Widget not found.');
    }
    await this.ensureSpaceAccess(widget.spaceId, ['OWNER', SpaceRole.ADMIN]);

    await this.prisma.widget.delete({
      where: { id }
    });

    return true;
  }

  async getWidgetAnalytics(widgetId: string) {
    const widget = await this.prisma.widget.findUnique({ where: { id: widgetId } });
    if (!widget) {
      throw new Error('NOT_FOUND: Widget not found.');
    }
    await this.ensureSpaceAccess(widget.spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER, SpaceRole.VIEWER]);

    // Fetch all events for this widget
    const events = await this.prisma.analyticsEvent.findMany({
      where: { widgetId },
      orderBy: { createdAt: 'asc' }
    });

    let views = 0;
    let clicks = 0;
    let conversions = 0;
    let videoPlays = 0;

    const deviceMap: Record<string, number> = {};
    const browserMap: Record<string, number> = {};
    const countryMap: Record<string, number> = {};
    const trafficMap: Record<string, { views: number; clicks: number }> = {};
    const testimonialClickMap: Record<string, number> = {};

    events.forEach(event => {
      const type = event.eventType;
      const metadata = (event.metadata as any) || {};

      if (type === 'WIDGET_VIEW') views++;
      if (type === 'WIDGET_CLICK') clicks++;
      if (type === 'WIDGET_CONVERSION') conversions++;
      if (type === 'VIDEO_PLAY') videoPlays++;

      // Track browser & device & country
      const device = metadata.device || 'Desktop';
      const browser = metadata.browser || 'Other';
      const country = metadata.country || 'Unknown';

      deviceMap[device] = (deviceMap[device] || 0) + 1;
      browserMap[browser] = (browserMap[browser] || 0) + 1;
      countryMap[country] = (countryMap[country] || 0) + 1;

      // Track traffic by date
      if (event.createdAt) {
        const dateStr = new Date(event.createdAt).toISOString().split('T')[0];
        if (!trafficMap[dateStr]) {
          trafficMap[dateStr] = { views: 0, clicks: 0 };
        }
        if (type === 'WIDGET_VIEW') trafficMap[dateStr].views++;
        if (type === 'WIDGET_CLICK') trafficMap[dateStr].clicks++;
      }

      // Track top testimonial
      if (metadata.testimonialId) {
        testimonialClickMap[metadata.testimonialId] = (testimonialClickMap[metadata.testimonialId] || 0) + 1;
      }
    });

    // Calculate CTR and Conversion Rate
    const ctr = views > 0 ? parseFloat(((clicks / views) * 100).toFixed(2)) : 0.0;
    const conversionRate = views > 0 ? parseFloat(((conversions / views) * 100).toFixed(2)) : 0.0;

    // Convert breakdowns to GraphQL lists
    const devices = Object.entries(deviceMap).map(([device, count]) => ({ device, count }));
    const browsers = Object.entries(browserMap).map(([browser, count]) => ({ browser, count }));
    const countries = Object.entries(countryMap).map(([country, count]) => ({ country, count }));

    // Generate traffic array
    const trafficList = Object.entries(trafficMap).map(([date, data]) => ({
      date,
      views: data.views,
      clicks: data.clicks
    })).slice(-30); // limit to last 30 days

    // Top testimonial determination
    let topTestimonialId = null;
    let maxClicks = 0;
    Object.entries(testimonialClickMap).forEach(([id, count]) => {
      if (count > maxClicks) {
        maxClicks = count;
        topTestimonialId = id;
      }
    });

    return {
      views,
      clicks,
      ctr,
      conversions,
      conversionRate,
      videoPlays,
      devices,
      browsers,
      countries,
      traffic: JSON.stringify(trafficList),
      topTestimonialId
    };
  }
}
