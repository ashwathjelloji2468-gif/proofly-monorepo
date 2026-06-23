import { BaseService } from './BaseService';

export class AnalyticsService extends BaseService {
  async trackEvent(spaceId: string, eventType: string, metadataRaw?: string | null) {
    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new Error('SPACE_NOT_FOUND');
    }

    let parsedMetadata = null;
    if (metadataRaw) {
      try {
        parsedMetadata = JSON.parse(metadataRaw);
      } catch (err) {
        parsedMetadata = { raw: metadataRaw };
      }
    }

    await this.prisma.analyticsEvent.create({
      data: {
        spaceId,
        eventType,
        metadata: parsedMetadata || undefined
      }
    });

    return true;
  }

  async getSpaceAnalytics(spaceId: string) {
    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new Error('SPACE_NOT_FOUND');
    }

    // Verify ownership of the space
    const user = this.ensureAuthenticated();
    if (space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own this space.');
    }

    // Group analytics events count by eventType
    const viewsCount = await this.prisma.analyticsEvent.count({
      where: { spaceId, eventType: 'PAGE_VIEW' }
    });

    const testimonialSubmissions = await this.prisma.analyticsEvent.count({
      where: { spaceId, eventType: 'TESTIMONIAL_SUBMIT' }
    });

    const widgetImpressions = await this.prisma.analyticsEvent.count({
      where: { spaceId, eventType: 'WIDGET_LOAD' }
    });

    return {
      viewsCount,
      testimonialSubmissions,
      widgetImpressions
    };
  }
}
