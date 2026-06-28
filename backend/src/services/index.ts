import { PrismaClient, User } from '@prisma/client';
import { UserService } from './UserService';
import { SpaceService } from './SpaceService';
import { TestimonialService } from './TestimonialService';
import { AnalyticsService } from './AnalyticsService';
import { CampaignService } from './CampaignService';
import { AIService } from './AIService';
import { RewardService } from './RewardService';
import { EmailService } from './EmailService';

export interface Services {
  user: UserService;
  space: SpaceService;
  testimonial: TestimonialService;
  analytics: AnalyticsService;
  campaign: CampaignService;
  ai: AIService;
  reward: RewardService;
  email: EmailService;
}

const emailService = new EmailService();

export function createServices(
  prisma: PrismaClient,
  currentUser: Omit<User, 'passwordHash'> | null
): Services {
  return {
    user: new UserService(prisma, currentUser, emailService),
    space: new SpaceService(prisma, currentUser, emailService),
    testimonial: new TestimonialService(prisma, currentUser),
    analytics: new AnalyticsService(prisma, currentUser),
    campaign: new CampaignService(prisma, currentUser),
    ai: new AIService(),
    reward: new RewardService(prisma, currentUser),
    email: emailService
  };
}
