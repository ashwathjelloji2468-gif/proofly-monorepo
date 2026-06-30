import { BaseService } from './BaseService';
import { SpaceRole, BillingTier } from '@prisma/client';

export class AISuiteService extends BaseService {
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

  async getAIUsage(spaceId: string) {
    const user = this.ensureAuthenticated();
    let usage = await this.prisma.aIUsage.findUnique({
      where: { spaceId }
    });

    if (!usage) {
      // Determine credit limit based on billing tier
      let limit = 10;
      if (user.tier === BillingTier.PRO) {
        limit = 200;
      } else if (user.tier === BillingTier.BUSINESS) {
        limit = 1000;
      }

      usage = await this.prisma.aIUsage.create({
        data: {
          spaceId,
          credits: 0,
          limit
        }
      });
    }

    return usage;
  }

  private async consumeCredits(spaceId: string, credits: number) {
    const usage = await this.getAIUsage(spaceId);
    if (usage.credits + credits > usage.limit) {
      throw new Error(`CREDIT_LIMIT_EXCEEDED: You have exhausted your monthly AI credits. Please upgrade your billing plan.`);
    }

    return this.prisma.aIUsage.update({
      where: { spaceId },
      data: {
        credits: { increment: credits }
      }
    });
  }

  async getAIHistory(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER]);
    return this.prisma.aIHistory.findMany({
      where: { spaceId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getAIInsights(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER]);
    let insights = await this.prisma.aIInsight.findMany({
      where: { spaceId },
      orderBy: { createdAt: 'desc' }
    });

    if (insights.length === 0) {
      // Seed default insight
      const seed = await this.prisma.aIInsight.create({
        data: {
          spaceId,
          insightsText: 'Customers frequently praise the fast setup and intuitive dashboard styling.',
          personaMatch: 'Perfect fit for SaaS Founders and Product Managers.',
          missingTags: 'Add tags for "Pricing" or "Security" to cover enterprise concerns.'
        }
      });
      insights = [seed];
    }

    return insights;
  }

  async aiRewrite(testimonialId: string, tone: string, _options?: string | null) {
    const testimonial = await this.prisma.testimonial.findUnique({ where: { id: testimonialId } });
    if (!testimonial) throw new Error('NOT_FOUND: Testimonial not found.');
    await this.ensureSpaceAccess(testimonial.spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER]);

    await this.consumeCredits(testimonial.spaceId, 1);
    
    // Simulate smart AI rewrites by tone
    const content = testimonial.textContent || 'This service is excellent!';
    let rewritten = content;

    if (tone === 'PROFESSIONAL') {
      rewritten = `We highly recommend this exceptional tool. It has significantly optimized our operations and improved team productivity.`;
    } else if (tone === 'FRIENDLY') {
      rewritten = `Honestly, this tool is amazing! Super easy to set up and the team absolutely loves using it every single day. 😊`;
    } else if (tone === 'TECHNICAL') {
      rewritten = `Integration was straightforward via NPM. Zero lag observed under heavy loads, and API queries execute sub-100ms.`;
    } else if (tone === 'MARKETING') {
      rewritten = `The ultimate social proof accelerator. Boost your landing page conversions instantly with zero setup friction!`;
    }

    await this.prisma.aIHistory.create({
      data: {
        spaceId: testimonial.spaceId,
        feature: 'REWRITE',
        creditsUsed: 1,
        inputLength: content.length
      }
    });

    return rewritten;
  }

  async aiAnalyzeTestimonial(testimonialId: string) {
    const testimonial = await this.prisma.testimonial.findUnique({ where: { id: testimonialId } });
    if (!testimonial) throw new Error('NOT_FOUND: Testimonial not found.');
    await this.ensureSpaceAccess(testimonial.spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER]);

    await this.consumeCredits(testimonial.spaceId, 1);

    const length = (testimonial.textContent || '').length;
    let qualityScore = 55;
    let credibility = 50;
    let specificity = 60;
    let storytelling = 50;
    let suggestions = 'Try to add real outcomes or numeric metrics (e.g. saved 10 hours/week) to make this review stand out.';

    if (length > 150) {
      qualityScore = 94;
      credibility = 90;
      specificity = 95;
      storytelling = 92;
      suggestions = 'This review is excellent! High emotional value and outcomes detailed.';
    } else if (length > 60) {
      qualityScore = 78;
      credibility = 75;
      specificity = 80;
      storytelling = 70;
      suggestions = 'Good testimonial. Adding a custom avatar photo will improve credibility score.';
    }

    let score = await this.prisma.aIScore.findUnique({ where: { testimonialId } });
    if (score) {
      score = await this.prisma.aIScore.update({
        where: { testimonialId },
        data: { qualityScore, credibility, specificity, storytelling, suggestions }
      });
    } else {
      score = await this.prisma.aIScore.create({
        data: { testimonialId, qualityScore, credibility, specificity, storytelling, suggestions }
      });
    }

    await this.prisma.aIHistory.create({
      data: {
        spaceId: testimonial.spaceId,
        feature: 'ANALYZE',
        creditsUsed: 1,
        inputLength: length
      }
    });

    return score;
  }

  async aiTranslateTestimonial(testimonialId: string, locale: string) {
    const testimonial = await this.prisma.testimonial.findUnique({ where: { id: testimonialId } });
    if (!testimonial) throw new Error('NOT_FOUND: Testimonial not found.');
    await this.ensureSpaceAccess(testimonial.spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER]);

    await this.consumeCredits(testimonial.spaceId, 1);
    const content = testimonial.textContent || 'Excellent service!';
    let translated = content;

    const locUpper = locale.toUpperCase();
    if (locUpper === 'ES') {
      translated = 'Excelente servicio y experiencia fantastica!';
    } else if (locUpper === 'FR') {
      translated = 'Excellent service et experience fantastique!';
    } else if (locUpper === 'DE') {
      translated = 'Hervorragender Service und fantastische Erfahrung!';
    } else if (locUpper === 'JA') {
      translated = '素晴らしいサービスと素晴らしい経験！';
    }

    let translation = await this.prisma.aITranslation.findFirst({
      where: { testimonialId, locale: locUpper }
    });

    if (translation) {
      translation = await this.prisma.aITranslation.update({
        where: { id: translation.id },
        data: { translatedText: translated }
      });
    } else {
      translation = await this.prisma.aITranslation.create({
        data: { testimonialId, locale: locUpper, translatedText: translated }
      });
    }

    await this.prisma.aIHistory.create({
      data: {
        spaceId: testimonial.spaceId,
        feature: 'TRANSLATE',
        creditsUsed: 1,
        inputLength: content.length
      }
    });

    return translation;
  }

  async aiGenerateSocial(testimonialId: string, platform: string) {
    const testimonial = await this.prisma.testimonial.findUnique({ where: { id: testimonialId } });
    if (!testimonial) throw new Error('NOT_FOUND: Testimonial not found.');
    await this.ensureSpaceAccess(testimonial.spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER]);

    await this.consumeCredits(testimonial.spaceId, 1);
    const author = testimonial.reviewerName;
    const content = testimonial.textContent || 'This service is awesome!';

    let post = '';
    const platUpper = platform.toUpperCase();
    if (platUpper === 'TWITTER') {
      post = `🔥 "${content}" \n\n- ${author} \n\n#socialproof #saas #growth`;
    } else {
      post = `🚀 Proud to share this amazing feedback from ${author}! \n\n"${content}" \n\nBuilding credibility is everything. Check out our website to learn more! \n\n#Proofly #Testimonials #Marketing`;
    }

    await this.prisma.aIHistory.create({
      data: {
        spaceId: testimonial.spaceId,
        feature: 'SOCIAL',
        creditsUsed: 1,
        inputLength: content.length
      }
    });

    return post;
  }

  async aiGenerateLandingPage(spaceId: string, layoutType: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER]);
    await this.consumeCredits(spaceId, 2);

    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    const name = space ? space.name : 'Our App';

    const copy = `
=== LANDING PAGE STRUCTURE (${layoutType.toUpperCase()}) ===
[Hero Section]
Headline: Convert visitors into customers instantly with real testimonials from ${name} users.
Subheadline: Leverage automated social proof campaigns to build credibility and scale revenue.
CTA Button: Start Free Trial Today

[Features Section]
- Real-time widgets rendering social reviews.
- Embedded video player showcases.
- Custom color theme config adjustments.

[FAQ Section]
Q: Is setup complicated?
A: No, copy and paste a single script element.
    `;

    await this.prisma.aIHistory.create({
      data: {
        spaceId,
        feature: 'LANDING_PAGE',
        creditsUsed: 2,
        inputLength: name.length
      }
    });

    return copy;
  }

  async aiGenerateCaseStudy(spaceId: string, testimonialIds: string[]) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER]);
    await this.consumeCredits(spaceId, 3);

    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    const name = space ? space.name : 'Our Product';

    const copy = `
# Customer Success Story: Scaling with ${name}
  
## Challenge
The team was struggling to build trust among visitor flows, resulting in a low 1.2% signup rate.

## Solution
They embedded Proofly carousel widgets across checkout pages, demonstrating real-time social reviews.

## Results
- Signup rates surged to 4.8%.
- Average order value (AOV) increased by 22%.
- Zero layout shift issues observed.
    `;

    await this.prisma.aIHistory.create({
      data: {
        spaceId,
        feature: 'CASE_STUDY',
        creditsUsed: 3,
        inputLength: testimonialIds.length
      }
    });

    return copy;
  }

  async aiSearchTestimonials(spaceId: string, query: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER]);
    const term = query.toLowerCase();

    return this.prisma.testimonial.findMany({
      where: {
        spaceId,
        OR: [
          { reviewerName: { contains: term, mode: 'insensitive' } },
          { reviewerTitle: { contains: term, mode: 'insensitive' } },
          { textContent: { contains: term, mode: 'insensitive' } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
