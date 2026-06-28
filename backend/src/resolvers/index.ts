import { authResolvers } from './auth';
import { spaceResolvers } from './space';
import { testimonialResolvers } from './testimonial';
import { campaignResolvers } from './campaign';
import { analyticsResolvers } from './analytics';
import { rewardResolvers } from './reward';
import { staticPageResolvers } from './staticPage';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...spaceResolvers.Query,
    ...testimonialResolvers.Query,
    ...campaignResolvers.Query,
    ...analyticsResolvers.Query,
    ...staticPageResolvers.Query
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...spaceResolvers.Mutation,
    ...testimonialResolvers.Mutation,
    ...campaignResolvers.Mutation,
    ...analyticsResolvers.Mutation,
    ...rewardResolvers.Mutation,
    ...staticPageResolvers.Mutation
  },
  User: authResolvers.User,
  SpaceMember: authResolvers.SpaceMember,
  Space: spaceResolvers.Space,
  Testimonial: testimonialResolvers.Testimonial,
  Campaign: campaignResolvers.Campaign,
  Reward: rewardResolvers.Reward
};
