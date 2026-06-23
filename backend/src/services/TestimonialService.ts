import { BaseService } from './BaseService';
import { TestimonialType, Sentiment, ImportedFrom } from '@prisma/client';
import { AIService } from './AIService';

const aiService = new AIService();

export interface CreateTestimonialInput {
  spaceId: string;
  type: TestimonialType;
  textContent?: string | null;
  videoUrl?: string | null;
  rating?: number | null;
  reviewerName: string;
  reviewerEmail: string;
  reviewerTitle?: string | null;
  reviewerSocial?: string | null;
  reviewerAvatar?: string | null;
}

export interface ImportTestimonialInput {
  spaceId: string;
  importedFrom: ImportedFrom;
  externalLink: string;
  textContent: string;
  rating: number;
  reviewerName: string;
  reviewerEmail: string;
  reviewerTitle?: string | null;
  reviewerSocial?: string | null;
  reviewerAvatar?: string | null;
}

export interface UpdateTestimonialInput {
  isApproved?: boolean | null;
  isArchived?: boolean | null;
  isPinned?: boolean | null;
  sentiment?: Sentiment | null;
}

export class TestimonialService extends BaseService {
  async getTestimonials(spaceId: string, approvedOnly?: boolean) {
    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new Error('SPACE_NOT_FOUND');
    }

    // If fetching all testimonials (including unapproved), verify space ownership
    if (!approvedOnly) {
      const user = this.ensureAuthenticated();
      if (space.userId !== user.id) {
        throw new Error('UNAUTHORIZED: You do not own this space.');
      }
    }

    const whereClause: any = { spaceId };
    if (approvedOnly) {
      whereClause.isApproved = true;
      whereClause.isArchived = false;
    }

    return this.prisma.testimonial.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });
  }

  async getTestimonialById(id: string) {
    const testimonial = await this.prisma.testimonial.findUnique({
      where: { id },
      include: { space: true }
    });
    if (!testimonial) {
      throw new Error('TESTIMONIAL_NOT_FOUND');
    }

    // Verify ownership
    const user = this.ensureAuthenticated();
    if (testimonial.space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own the space this testimonial belongs to.');
    }

    return testimonial;
  }

  async createTestimonial(input: CreateTestimonialInput) {
    const space = await this.prisma.space.findUnique({
      where: { id: input.spaceId },
      include: { webhooks: { where: { isActive: true } } }
    });
    if (!space) {
      throw new Error('SPACE_NOT_FOUND');
    }

    // Run AI Sentiment Analysis on submission if it's a text testimonial
    let sentiment: Sentiment | undefined;
    if (input.type === TestimonialType.TEXT && input.textContent) {
      sentiment = aiService.analyzeSentiment(input.textContent);
    }

    const testimonial = await this.prisma.testimonial.create({
      data: {
        spaceId: input.spaceId,
        type: input.type,
        textContent: input.textContent,
        videoUrl: input.videoUrl,
        rating: input.rating ?? 5,
        reviewerName: input.reviewerName,
        reviewerEmail: input.reviewerEmail,
        reviewerTitle: input.reviewerTitle,
        reviewerSocial: input.reviewerSocial,
        reviewerAvatar: input.reviewerAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(input.reviewerName),
        sentiment: sentiment,
        isApproved: false, // requires manual approval by default
        isArchived: false,
        isPinned: false
      }
    });

    // Check if the Space has a reward incentive configured
    const reward = await this.prisma.reward.findUnique({
      where: { spaceId: input.spaceId, isActive: true }
    });

    // Track submission event in analytics asynchronously
    this.prisma.analyticsEvent.create({
      data: {
        spaceId: space.id,
        eventType: 'TESTIMONIAL_SUBMIT',
        metadata: {
          testimonialId: testimonial.id,
          type: testimonial.type,
          sentiment: testimonial.sentiment
        }
      }
    }).catch(err => console.error('Failed to log analytics event:', err));

    // Dispatch webhook notifications asynchronously
    if (space.webhooks.length > 0) {
      space.webhooks.forEach(webhook => {
        this.triggerWebhook(webhook.url, {
          event: 'testimonial.created',
          space: { id: space.id, name: space.name, slug: space.slug },
          testimonial: {
            id: testimonial.id,
            type: testimonial.type,
            rating: testimonial.rating,
            reviewerName: testimonial.reviewerName,
            reviewerEmail: testimonial.reviewerEmail,
            textContent: testimonial.textContent,
            sentiment: testimonial.sentiment,
            createdAt: testimonial.createdAt
          }
        });
      });
    }

    return {
      testimonial,
      reward
    };
  }

  async importTestimonial(input: ImportTestimonialInput) {
    const user = this.ensureAuthenticated();

    const space = await this.prisma.space.findUnique({ where: { id: input.spaceId } });
    if (!space) {
      throw new Error('SPACE_NOT_FOUND');
    }
    if (space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own this space.');
    }

    // Run AI Sentiment Analysis on the imported review text
    const sentiment = aiService.analyzeSentiment(input.textContent);

    return this.prisma.testimonial.create({
      data: {
        spaceId: input.spaceId,
        type: TestimonialType.TEXT,
        textContent: input.textContent,
        rating: input.rating,
        reviewerName: input.reviewerName,
        reviewerEmail: input.reviewerEmail,
        reviewerTitle: input.reviewerTitle,
        reviewerSocial: input.reviewerSocial,
        reviewerAvatar: input.reviewerAvatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=' + encodeURIComponent(input.reviewerName),
        sentiment: sentiment,
        isApproved: true, // Imported reviews are pre-approved by the space admin
        isArchived: false,
        isPinned: false,
        importedFrom: input.importedFrom,
        externalLink: input.externalLink
      }
    });
  }

  async updateTestimonial(id: string, input: UpdateTestimonialInput) {
    const user = this.ensureAuthenticated();

    const testimonial = await this.prisma.testimonial.findUnique({
      where: { id },
      include: { space: true }
    });
    if (!testimonial) {
      throw new Error('TESTIMONIAL_NOT_FOUND');
    }
    if (testimonial.space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own the space this testimonial belongs to.');
    }

    const data: any = {};
    if (input.isApproved !== undefined) data.isApproved = input.isApproved;
    if (input.isArchived !== undefined) data.isArchived = input.isArchived;
    if (input.isPinned !== undefined) data.isPinned = input.isPinned;
    if (input.sentiment !== undefined) data.sentiment = input.sentiment;

    return this.prisma.testimonial.update({
      where: { id },
      data
    });
  }

  async deleteTestimonial(id: string) {
    const user = this.ensureAuthenticated();

    const testimonial = await this.prisma.testimonial.findUnique({
      where: { id },
      include: { space: true }
    });
    if (!testimonial) {
      throw new Error('TESTIMONIAL_NOT_FOUND');
    }
    if (testimonial.space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own the space this testimonial belongs to.');
    }

    await this.prisma.testimonial.delete({ where: { id } });
    return true;
  }

  private async triggerWebhook(url: string, payload: any) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        console.warn(`Webhook request to ${url} failed with status: ${response.status}`);
      }
    } catch (err) {
      console.warn(`Failed to dispatch webhook to ${url}:`, err instanceof Error ? err.message : err);
    }
  }
}
