import { PrismaClient, User } from '@prisma/client';
import { UserService } from './UserService';
import { SpaceService } from './SpaceService';
import { TestimonialService } from './TestimonialService';
import { AnalyticsService } from './AnalyticsService';
import { CampaignService } from './CampaignService';
import { AIService } from './AIService';
import { RewardService } from './RewardService';

export interface Services {
  user: UserService;
  space: SpaceService;
  testimonial: TestimonialService;
  analytics: AnalyticsService;
  campaign: CampaignService;
  ai: AIService;
  reward: RewardService;
}

export function createServices(
  prisma: PrismaClient,
  currentUser: Omit<User, 'passwordHash'> | null
): Services {
  return {
    user: new UserService(prisma, currentUser),
    space: new SpaceService(prisma, currentUser),
    testimonial: new TestimonialService(prisma, currentUser),
    analytics: new AnalyticsService(prisma, currentUser),
    campaign: new CampaignService(prisma, currentUser),
    ai: new AIService(),
    reward: new RewardService(prisma, currentUser)
  };
}
