import { BaseService } from './BaseService';
import { BillingTier, SpaceRole } from '@prisma/client';

export interface CreateCollectionInput {
  spaceId: string;
  name: string;
  slug: string;
  headline: string;
  subheadline: string;
  logoUrl?: string | null;
  thankYouMessage: string;
  redirectUrl?: string | null;
  customDomain?: string | null;
  themeColor?: string | null;
  questions: {
    label: string;
    type: string;
    options?: string[] | null;
    required?: boolean | null;
    placeholder?: string | null;
    order?: number | null;
  }[];
}

export interface UpdateCollectionInput {
  name?: string | null;
  headline?: string | null;
  subheadline?: string | null;
  logoUrl?: string | null;
  thankYouMessage?: string | null;
  redirectUrl?: string | null;
  customDomain?: string | null;
  themeColor?: string | null;
  questions?: {
    label: string;
    type: string;
    options?: string[] | null;
    required?: boolean | null;
    placeholder?: string | null;
    order?: number | null;
  }[] | null;
  status?: string | null;
}

export class CollectionService extends BaseService {
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

  async getSpaceCollections(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER, SpaceRole.VIEWER]);
    return this.prisma.collection.findMany({
      where: { spaceId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCollectionById(id: string) {
    const col = await this.prisma.collection.findUnique({
      where: { id },
      include: { theme: true, questions: { orderBy: { order: 'asc' } } }
    });
    if (!col) {
      throw new Error('NOT_FOUND: Collection not found.');
    }
    return col;
  }

  async getCollectionBySlug(slug: string) {
    const col = await this.prisma.collection.findUnique({
      where: { slug: slug.toLowerCase().trim() },
      include: { theme: true, questions: { orderBy: { order: 'asc' } } }
    });
    if (!col) {
      throw new Error('NOT_FOUND: Collection page not found.');
    }
    return col;
  }

  async createCollection(input: CreateCollectionInput) {
    await this.ensureSpaceAccess(input.spaceId, ['OWNER', SpaceRole.ADMIN]);
    const user = this.ensureAuthenticated();

    // Check Free tier limit (max 1 Collection)
    if (user.tier === BillingTier.FREE) {
      const colCount = await this.prisma.collection.count({
        where: { spaceId: input.spaceId }
      });
      if (colCount >= 1) {
        throw new Error('LIMIT_REACHED: Your Free plan is limited to 1 collection page. Please upgrade to Pro.');
      }
    }

    const sanitizedSlug = input.slug.toLowerCase().trim();
    const existing = await this.prisma.collection.findUnique({ where: { slug: sanitizedSlug } });
    if (existing) {
      throw new Error(`SLUG_TAKEN: The collection slug "${sanitizedSlug}" is already taken.`);
    }

    // Force brand requirements for Free tier
    const isFree = user.tier === BillingTier.FREE;
    const themeColor = input.themeColor || '#10B981';

    // Create Collection Page
    const col = await this.prisma.collection.create({
      data: {
        spaceId: input.spaceId,
        name: input.name,
        slug: sanitizedSlug,
        headline: input.headline,
        subheadline: input.subheadline,
        logoUrl: input.logoUrl,
        thankYouMessage: input.thankYouMessage,
        redirectUrl: input.redirectUrl,
        customDomain: user.tier === BillingTier.BUSINESS || user.tier === BillingTier.ENTERPRISE ? input.customDomain : null
      }
    });

    // Create CollectionTheme
    await this.prisma.collectionTheme.create({
      data: {
        collectionId: col.id,
        primaryColor: themeColor,
        removeBranding: !isFree ? false : true // forced branding on free
      }
    });

    // Create CollectionQuestions
    if (input.questions && input.questions.length > 0) {
      const questionsData = input.questions.map((q, idx) => ({
        collectionId: col.id,
        label: q.label,
        type: q.type,
        options: q.options || [],
        required: q.required ?? false,
        placeholder: q.placeholder || '',
        order: q.order ?? idx
      }));

      await this.prisma.collectionQuestion.createMany({
        data: questionsData
      });
    }

    return this.prisma.collection.findUnique({
      where: { id: col.id },
      include: { theme: true, questions: { orderBy: { order: 'asc' } } }
    });
  }

  async updateCollection(id: string, input: UpdateCollectionInput) {
    const col = await this.prisma.collection.findUnique({ where: { id } });
    if (!col) {
      throw new Error('NOT_FOUND: Collection not found.');
    }
    await this.ensureSpaceAccess(col.spaceId, ['OWNER', SpaceRole.ADMIN]);
    const user = this.ensureAuthenticated();

    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.headline !== undefined) data.headline = input.headline;
    if (input.subheadline !== undefined) data.subheadline = input.subheadline;
    if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl;
    if (input.thankYouMessage !== undefined) data.thankYouMessage = input.thankYouMessage;
    if (input.redirectUrl !== undefined) data.redirectUrl = input.redirectUrl;
    if (input.status !== undefined) data.status = input.status;

    if (input.customDomain !== undefined) {
      if (user.tier === BillingTier.BUSINESS || user.tier === BillingTier.ENTERPRISE) {
        data.customDomain = input.customDomain;
      }
    }

    // Update Core Collection
    await this.prisma.collection.update({
      where: { id },
      data
    });

    // Update theme Color if provided
    if (input.themeColor !== undefined) {
      await this.prisma.collectionTheme.update({
        where: { collectionId: id },
        data: {
          primaryColor: input.themeColor || '#10B981'
        }
      });
    }

    // Update Questions if provided (delete and recreate for simplicity & performance)
    if (input.questions !== undefined && input.questions !== null) {
      await this.prisma.collectionQuestion.deleteMany({
        where: { collectionId: id }
      });

      const questionsData = input.questions.map((q, idx) => ({
        collectionId: id,
        label: q.label,
        type: q.type,
        options: q.options || [],
        required: q.required ?? false,
        placeholder: q.placeholder || '',
        order: q.order ?? idx
      }));

      await this.prisma.collectionQuestion.createMany({
        data: questionsData
      });
    }

    return this.prisma.collection.findUnique({
      where: { id },
      include: { theme: true, questions: { orderBy: { order: 'asc' } } }
    });
  }

  async deleteCollection(id: string) {
    const col = await this.prisma.collection.findUnique({ where: { id } });
    if (!col) {
      throw new Error('NOT_FOUND: Collection not found.');
    }
    await this.ensureSpaceAccess(col.spaceId, ['OWNER', SpaceRole.ADMIN]);

    await this.prisma.collection.delete({
      where: { id }
    });

    return true;
  }

  async duplicateCollection(id: string) {
    const col = await this.prisma.collection.findUnique({
      where: { id },
      include: { theme: true, questions: true }
    });
    if (!col) {
      throw new Error('NOT_FOUND: Collection not found.');
    }
    await this.ensureSpaceAccess(col.spaceId, ['OWNER', SpaceRole.ADMIN]);
    const user = this.ensureAuthenticated();

    // Check Free tier limit (max 1 Collection)
    if (user.tier === BillingTier.FREE) {
      throw new Error('LIMIT_REACHED: Duplicating collections is a Pro feature.');
    }

    const newSlug = `${col.slug}-dup-${Math.floor(1000 + Math.random() * 9000)}`;

    const newCol = await this.prisma.collection.create({
      data: {
        spaceId: col.spaceId,
        name: `${col.name} (Copy)`,
        slug: newSlug,
        headline: col.headline,
        subheadline: col.subheadline,
        logoUrl: col.logoUrl,
        thankYouMessage: col.thankYouMessage,
        redirectUrl: col.redirectUrl
      }
    });

    if (col.theme) {
      await this.prisma.collectionTheme.create({
        data: {
          collectionId: newCol.id,
          primaryColor: col.theme.primaryColor,
          textColor: col.theme.textColor,
          backgroundColor: col.theme.backgroundColor,
          borderRadius: col.theme.borderRadius,
          shadow: col.theme.shadow,
          spacing: col.theme.spacing,
          fontFamily: col.theme.fontFamily,
          darkMode: col.theme.darkMode,
          customCss: col.theme.customCss,
          removeBranding: col.theme.removeBranding
        }
      });
    }

    if (col.questions && col.questions.length > 0) {
      const questionsData = col.questions.map(q => ({
        collectionId: newCol.id,
        label: q.label,
        type: q.type,
        options: q.options,
        required: q.required,
        placeholder: q.placeholder,
        order: q.order
      }));

      await this.prisma.collectionQuestion.createMany({
        data: questionsData
      });
    }

    return this.prisma.collection.findUnique({
      where: { id: newCol.id },
      include: { theme: true, questions: { orderBy: { order: 'asc' } } }
    });
  }

  async trackCollectionView(collectionId: string, visitorId: string, referrer?: string | null, utmSource?: string | null, utmMedium?: string | null, utmCampaign?: string | null, req?: any) {
    const col = await this.prisma.collection.findUnique({ where: { id: collectionId } });
    if (!col) return false;

    // Parse user agent
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
    } else if (/firefox|fxios/i.test(userAgent)) {
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
    const city = req?.headers?.['cf-ipcity'] || 'Unknown';

    await this.prisma.collectionView.create({
      data: {
        collectionId,
        visitorId,
        ipAddress: req?.ip || null,
        country,
        city,
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

  async startCollectionSubmission(collectionId: string) {
    const sub = await this.prisma.collectionSubmission.create({
      data: {
        collectionId,
        startedAt: new Date()
      }
    });
    return sub.id;
  }

  async logCollectionShare(collectionId: string, platform: string) {
    await this.prisma.collectionShare.create({
      data: {
        collectionId,
        platform
      }
    });
    return true;
  }

  async getCollectionAnalytics(collectionId: string) {
    const col = await this.prisma.collection.findUnique({ where: { id: collectionId } });
    if (!col) {
      throw new Error('NOT_FOUND: Collection not found.');
    }
    await this.ensureSpaceAccess(col.spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER, SpaceRole.VIEWER]);

    // Gather views and submissions
    const views = await this.prisma.collectionView.findMany({ where: { collectionId } });
    const submissions = await this.prisma.collectionSubmission.findMany({ where: { collectionId } });

    const totalViews = views.length;
    const uniqueVisitors = new Set(views.map(v => v.visitorId)).size;
    const starts = submissions.length;
    const completions = submissions.filter(s => s.completedAt !== null).length;
    
    // CTR and completion calculations
    const completionRate = starts > 0 ? parseFloat(((completions / starts) * 100).toFixed(2)) : 0.0;
    
    // Time analysis
    let totalTimeSec = 0;
    let timedCount = 0;
    submissions.forEach(sub => {
      if (sub.completedAt && sub.startedAt) {
        const diffMs = new Date(sub.completedAt).getTime() - new Date(sub.startedAt).getTime();
        totalTimeSec += diffMs / 1000;
        timedCount++;
      }
    });
    const avgTime = timedCount > 0 ? parseFloat((totalTimeSec / timedCount).toFixed(1)) : 0.0;

    // Demographic breakdowns
    const deviceMap: Record<string, number> = {};
    const browserMap: Record<string, number> = {};
    const countryMap: Record<string, number> = {};
    const trafficMap: Record<string, { views: number; submissions: number }> = {};

    views.forEach(v => {
      const dev = v.device || 'Desktop';
      const br = v.browser || 'Other';
      const c = v.country || 'USA';
      deviceMap[dev] = (deviceMap[dev] || 0) + 1;
      browserMap[br] = (browserMap[br] || 0) + 1;
      countryMap[c] = (countryMap[c] || 0) + 1;

      const dateStr = new Date(v.createdAt).toISOString().split('T')[0];
      if (!trafficMap[dateStr]) trafficMap[dateStr] = { views: 0, submissions: 0 };
      trafficMap[dateStr].views++;
    });

    submissions.forEach(s => {
      if (s.completedAt) {
        const dateStr = new Date(s.completedAt).toISOString().split('T')[0];
        if (!trafficMap[dateStr]) trafficMap[dateStr] = { views: 0, submissions: 0 };
        trafficMap[dateStr].submissions++;
      }
    });

    const devices = Object.entries(deviceMap).map(([device, count]) => ({ device, count }));
    const browsers = Object.entries(browserMap).map(([browser, count]) => ({ browser, count }));
    const countries = Object.entries(countryMap).map(([country, count]) => ({ country, count }));
    
    const trafficList = Object.entries(trafficMap).map(([date, data]) => ({
      date,
      views: data.views,
      submissions: data.submissions
    })).sort((a,b) => a.date.localeCompare(b.date)).slice(-30);

    return {
      views: totalViews,
      visitors: uniqueVisitors,
      starts,
      completions,
      completionRate,
      avgTime,
      devices,
      browsers,
      countries,
      traffic: JSON.stringify(trafficList)
    };
  }

  async submitCollectionTestimonial(
    collectionId: string,
    type: string,
    reviewerName: string,
    reviewerEmail: string,
    rating: number,
    consentGiven: boolean,
    customAnswers: string,
    reviewerTitle: string | null = null,
    reviewerSocial: string | null = null,
    reviewerAvatar: string | null = null,
    textContent: string | null = null,
    videoUrl: string | null = null,
    req?: any
  ) {
    const col = await this.prisma.collection.findUnique({
      where: { id: collectionId },
      include: { space: { include: { user: true } } }
    });
    if (!col) {
      throw new Error('NOT_FOUND: Collection not found.');
    }

    if (type === 'TEXT' && !textContent?.trim()) {
      throw new Error('VALIDATION_ERROR: Testimonial text cannot be empty.');
    }

    const space = col.space;
    if (space.user.tier === 'FREE') {
      const count = await this.prisma.testimonial.count({
        where: { space: { userId: space.userId } }
      });
      if (count >= 25) {
        throw new Error('LIMIT_REACHED: Workspace reached testimonial limits.');
      }
    }

    const positiveWords = ['great', 'love', 'amazing', 'perfect', 'awesome', 'good', 'fast', 'best'];
    const textLower = (textContent || '').toLowerCase();
    const isPositive = positiveWords.some(w => textLower.includes(w));
    const sentiment = isPositive ? 'POSITIVE' : 'NEUTRAL';

    const testimonial = await this.prisma.testimonial.create({
      data: {
        spaceId: col.spaceId,
        collectionId: col.id,
        type: type === 'VIDEO' ? 'VIDEO' : 'TEXT',
        textContent: textContent || '',
        videoUrl: videoUrl || null,
        rating: rating || 5,
        reviewerName,
        reviewerEmail,
        reviewerTitle: reviewerTitle || null,
        reviewerSocial: reviewerSocial || null,
        reviewerAvatar: reviewerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(reviewerName)}`,
        sentiment: sentiment as any,
        isApproved: false
      }
    });

    try {
      const parsedAnswers = JSON.parse(customAnswers || '[]');
      this.prisma.analyticsEvent.create({
        data: {
          spaceId: col.spaceId,
          eventType: 'COLLECTION_TESTIMONIAL_SUBMIT',
          metadata: {
            testimonialId: testimonial.id,
            collectionId: col.id,
            customAnswers: parsedAnswers
          }
        }
      }).catch(e => console.error('Failed to log collection submission event:', e));
    } catch (e) {
      console.warn('Could not parse custom answers:', customAnswers);
    }

    const userAgent = req?.headers?.['user-agent'] || '';
    let browser = 'Other';
    if (/chrome/i.test(userAgent)) browser = 'Chrome';
    else if (/safari/i.test(userAgent)) browser = 'Safari';
    else if (/firefox/i.test(userAgent)) browser = 'Firefox';

    const country = req?.headers?.['cf-ipcountry'] || 'USA';

    const startedSub = await this.prisma.collectionSubmission.findFirst({
      where: { collectionId: col.id, completedAt: null },
      orderBy: { startedAt: 'desc' }
    });

    if (startedSub) {
      await this.prisma.collectionSubmission.update({
        where: { id: startedSub.id },
        data: {
          completedAt: new Date(),
          testimonialId: testimonial.id,
          consentGiven: consentGiven,
          consentTimestamp: new Date(),
          ipAddress: req?.ip || null,
          browser,
          country
        }
      });
    } else {
      await this.prisma.collectionSubmission.create({
        data: {
          collectionId: col.id,
          startedAt: new Date(),
          completedAt: new Date(),
          testimonialId: testimonial.id,
          consentGiven: consentGiven,
          consentTimestamp: new Date(),
          ipAddress: req?.ip || null,
          browser,
          country
        }
      });
    }

    return testimonial;
  }
}
