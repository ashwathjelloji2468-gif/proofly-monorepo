import { GraphQLContext } from '../context';

export const analyticsResolvers = {
  Query: {
    spaceAnalytics: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.analytics.getSpaceAnalytics(args.spaceId);
    }
  },
  Mutation: {
    trackEvent: async (_parent: any, args: { spaceId: string; eventType: string; metadata?: string }, context: GraphQLContext) => {
      return context.services.analytics.trackEvent(args.spaceId, args.eventType, args.metadata);
    }
  }
};
