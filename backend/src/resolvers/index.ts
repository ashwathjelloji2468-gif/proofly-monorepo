import { authResolvers } from './auth';
import { spaceResolvers } from './space';
import { testimonialResolvers } from './testimonial';
import { campaignResolvers } from './campaign';
import { analyticsResolvers } from './analytics';
import { rewardResolvers } from './reward';
import { staticPageResolvers } from './staticPage';
import { widgetResolvers } from './widget';
import { collectionResolvers } from './collection';
import { showcaseResolvers } from './showcase';

export const resolvers = {
  Query: {
    ...authResolvers.Query,
    ...spaceResolvers.Query,
    ...testimonialResolvers.Query,
    ...campaignResolvers.Query,
    ...analyticsResolvers.Query,
    ...staticPageResolvers.Query,
    ...widgetResolvers.Query,
    ...collectionResolvers.Query,
    ...showcaseResolvers.Query
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...spaceResolvers.Mutation,
    ...testimonialResolvers.Mutation,
    ...campaignResolvers.Mutation,
    ...analyticsResolvers.Mutation,
    ...rewardResolvers.Mutation,
    ...staticPageResolvers.Mutation,
    ...widgetResolvers.Mutation,
    ...collectionResolvers.Mutation,
    ...showcaseResolvers.Mutation
  },
  User: authResolvers.User,
  SpaceMember: authResolvers.SpaceMember,
  Space: {
    ...spaceResolvers.Space,
    ...collectionResolvers.Space,
    ...showcaseResolvers.Space
  },
  Testimonial: testimonialResolvers.Testimonial,
  Campaign: campaignResolvers.Campaign,
  Reward: rewardResolvers.Reward,
  Widget: widgetResolvers.Widget,
  Collection: collectionResolvers.Collection
};
