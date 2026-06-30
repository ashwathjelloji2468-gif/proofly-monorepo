import { GraphQLContext } from '../context';

export const showcaseResolvers = {
  Query: {
    showcaseSettings: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.showcase.getShowcaseSettings(args.spaceId);
    },
    publicShowcase: async (_parent: any, args: { slug: string }, context: GraphQLContext) => {
      return context.services.showcase.getPublicShowcase(args.slug);
    },
    testimonialDetail: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.showcase.getTestimonialDetail(args.id);
    },
    showcaseAnalytics: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.showcase.getShowcaseAnalytics(args.spaceId);
    }
  },

  Mutation: {
    updateShowcaseSettings: async (_parent: any, args: { spaceId: string; input: any }, context: GraphQLContext) => {
      return context.services.showcase.updateShowcaseSettings(args.spaceId, args.input);
    },
    trackShowcaseView: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.showcase.trackShowcaseView(
        args.spaceId,
        args.visitorId,
        args.referrer,
        args.utmSource,
        args.utmMedium,
        args.utmCampaign,
        context.req
      );
    },
    trackShowcaseShare: async (_parent: any, args: { spaceId: string; platform: string; testimonialId?: string }, context: GraphQLContext) => {
      return context.services.showcase.trackShowcaseShare(args.spaceId, args.platform, args.testimonialId);
    }
  },

  Space: {
    showcaseSettings: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.showcaseSettings.findUnique({
        where: { spaceId: parent.id }
      });
    }
  }
};

export default showcaseResolvers;
