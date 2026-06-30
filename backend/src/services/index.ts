import { PrismaClient, User } from '@prisma/client';
import { UserService } from './UserService';
import { SpaceService } from './SpaceService';
import { TestimonialService } from './TestimonialService';
import { AnalyticsService } from './AnalyticsService';
import { CampaignService } from './CampaignService';
import { AIService } from './AIService';
import { RewardService } from './RewardService';
import { EmailService } from './EmailService';
import { OAuthService } from './OAuthService';
import { SessionService } from './SessionService';
import { AuthorizationService } from './AuthorizationService';
import { WidgetService } from './WidgetService';
import { CollectionService } from './CollectionService';
import { ShowcaseService } from './ShowcaseService';
import { AnalyticsPlatformService } from './AnalyticsPlatformService';
import { AISuiteService } from './AISuiteService';

export interface Services {
  user: UserService;
  space: SpaceService;
  testimonial: TestimonialService;
  analytics: AnalyticsService;
  campaign: CampaignService;
  ai: AIService;
  reward: RewardService;
  email: EmailService;
  oauth: OAuthService;
  session: SessionService;
  authorization: AuthorizationService;
  widget: WidgetService;
  collection: CollectionService;
  showcase: ShowcaseService;
  analyticsPlatform: AnalyticsPlatformService;
  aiSuite: AISuiteService;
}

const emailService = new EmailService();

export function createServices(
  prisma: PrismaClient,
  currentUser: Omit<User, 'passwordHash'> | null
): Services {
  const sessionService = new SessionService(prisma, currentUser);
  const oauthService = new OAuthService(prisma, sessionService);
  const authorizationService = new AuthorizationService(prisma, currentUser);

  return {
    user: new UserService(prisma, currentUser, emailService, sessionService),
    space: new SpaceService(prisma, currentUser, emailService),
    testimonial: new TestimonialService(prisma, currentUser),
    analytics: new AnalyticsService(prisma, currentUser),
    campaign: new CampaignService(prisma, currentUser),
    ai: new AIService(),
    reward: new RewardService(prisma, currentUser),
    email: emailService,
    session: sessionService,
    oauth: oauthService,
    authorization: authorizationService,
    widget: new WidgetService(prisma, currentUser),
    collection: new CollectionService(prisma, currentUser),
    showcase: new ShowcaseService(prisma, currentUser),
    analyticsPlatform: new AnalyticsPlatformService(prisma, currentUser),
    aiSuite: new AISuiteService(prisma, currentUser)
  };
}
