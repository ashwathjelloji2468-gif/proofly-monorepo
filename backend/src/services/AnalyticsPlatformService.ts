import { BaseService } from './BaseService';
import { SpaceRole } from '@prisma/client';

export class AnalyticsPlatformService extends BaseService {
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

  private async ensureVisitor(spaceId: string, visitorId: string) {
    let visitor = await this.prisma.visitor.findUnique({
      where: { visitorId }
    });
    if (!visitor) {
      visitor = await this.prisma.visitor.create({
        data: {
          spaceId,
          visitorId
        }
      });
    }
    return visitor;
  }

  async createGoal(spaceId: string, name: string, description: string | null, triggerType: string, category: string, value: number) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);
    return this.prisma.goal.create({
      data: {
        spaceId,
        name,
        description,
        triggerType,
        category,
        value
      }
    });
  }

  async logConversion(spaceId: string, visitorId: string, goalId: string) {
    await this.ensureVisitor(spaceId, visitorId);
    const goal = await this.prisma.goal.findUnique({ where: { id: goalId } });
    if (!goal) return false;

    await this.prisma.conversion.create({
      data: {
        spaceId,
        visitorId,
        goalId,
        value: goal.value
      }
    });
    return true;
  }

  async logRevenue(spaceId: string, visitorId: string, amount: number, source?: string | null, sourceId?: string | null) {
    await this.ensureVisitor(spaceId, visitorId);
    await this.prisma.revenueEvent.create({
      data: {
        spaceId,
        visitorId,
        amount,
        source: source || null,
        sourceId: sourceId || null
      }
    });
    return true;
  }

  async logHeatmapPoint(spaceId: string, targetId: string, type: string, x: number, y: number, device: string) {
    await this.prisma.heatmapEvent.create({
      data: {
        spaceId,
        targetId,
        type,
        x,
        y,
        device
      }
    });
    return true;
  }

  async generateReport(spaceId: string, range: string, format: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER]);
    const reportName = `Analytics_${range}_Report_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
    
    return this.prisma.report.create({
      data: {
        spaceId,
        name: reportName,
        range,
        format,
        status: 'READY',
        fileUrl: `/reports/download/${spaceId}_${range.toLowerCase()}.${format.toLowerCase()}`
      }
    });
  }

  async getAdvancedAnalytics(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER, SpaceRole.VIEWER]);

    const visitors = await this.prisma.visitor.findMany({ where: { spaceId } });
    const conversions = await this.prisma.conversion.findMany({ where: { spaceId } });
    const revenueEvents = await this.prisma.revenueEvent.findMany({ where: { spaceId } });
    const views = await this.prisma.showcaseView.findMany({ where: { spaceId } });

    const totalVisitors = visitors.length;
    const totalViews = views.length;
    const totalConversions = conversions.length;
    
    const conversionRate = totalVisitors > 0 
      ? parseFloat(((totalConversions / totalVisitors) * 100).toFixed(2)) 
      : 0.0;

    const totalRevenue = revenueEvents.reduce((sum, e) => sum + e.amount, 0.0);

    // Device, browser, country breakdowns
    const deviceMap: Record<string, number> = {};
    const browserMap: Record<string, number> = {};
    const countryMap: Record<string, number> = {};
    const trafficMap: Record<string, { views: number; conversions: number }> = {};

    views.forEach(v => {
      const dev = v.device || 'Desktop';
      const br = v.browser || 'Other';
      const c = v.country || 'USA';
      deviceMap[dev] = (deviceMap[dev] || 0) + 1;
      browserMap[br] = (browserMap[br] || 0) + 1;
      countryMap[c] = (countryMap[c] || 0) + 1;

      const dateStr = new Date(v.createdAt).toISOString().split('T')[0];
      if (!trafficMap[dateStr]) trafficMap[dateStr] = { views: 0, conversions: 0 };
      trafficMap[dateStr].views++;
    });

    conversions.forEach(c => {
      const dateStr = new Date(c.createdAt).toISOString().split('T')[0];
      if (!trafficMap[dateStr]) trafficMap[dateStr] = { views: 0, conversions: 0 };
      trafficMap[dateStr].conversions++;
    });

    const devices = Object.entries(deviceMap).map(([device, count]) => ({ device, count }));
    const browsers = Object.entries(browserMap).map(([browser, count]) => ({ browser, count }));
    const countries = Object.entries(countryMap).map(([country, count]) => ({ country, count }));

    const trafficList = Object.entries(trafficMap).map(([date, data]) => ({
      date,
      views: data.views,
      conversions: data.conversions
    })).sort((a,b) => a.date.localeCompare(b.date)).slice(-30);

    return {
      visitors: totalVisitors,
      views: totalViews,
      conversions: totalConversions,
      conversionRate,
      revenueInfluenced: totalRevenue,
      devices,
      browsers,
      countries,
      traffic: JSON.stringify(trafficList)
    };
  }

  async getShowcaseFunnel(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER, SpaceRole.VIEWER]);

    const visitors = await this.prisma.visitor.count({ where: { spaceId } });
    const widgetViews = await this.prisma.analyticsEvent.count({ where: { spaceId, eventType: 'widget_view' } });
    const widgetClicks = await this.prisma.analyticsEvent.count({ where: { spaceId, eventType: 'widget_click' } });
    
    const signups = await this.prisma.conversion.count({
      where: {
        spaceId,
        goal: { category: 'SIGNUP' }
      }
    });

    const purchases = await this.prisma.conversion.count({
      where: {
        spaceId,
        goal: { category: 'PURCHASE' }
      }
    });

    const base = Math.max(visitors, 1);

    return [
      { step: '1. Visitors', count: visitors, percentage: 100.0 },
      { step: '2. Widget Seen', count: widgetViews, percentage: parseFloat(((widgetViews / base) * 100).toFixed(2)) },
      { step: '3. Clicked CTA', count: widgetClicks, percentage: parseFloat(((widgetClicks / base) * 100).toFixed(2)) },
      { step: '4. Signed Up', count: signups, percentage: parseFloat(((signups / base) * 100).toFixed(2)) },
      { step: '5. Purchased', count: purchases, percentage: parseFloat(((purchases / base) * 100).toFixed(2)) }
    ];
  }

  async getConversionGoals(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER]);
    return this.prisma.goal.findMany({
      where: { spaceId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTelemetryReports(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER]);
    return this.prisma.report.findMany({
      where: { spaceId },
      orderBy: { createdAt: 'desc' }
    });
  }
}
