import { GraphQLContext } from '../context';
import { CreateSpaceInput, UpdateSpaceInput } from '../services/SpaceService';

export const spaceResolvers = {
  Query: {
    mySpaces: async (_parent: any, _args: any, context: GraphQLContext) => {
      return context.services.space.getMySpaces();
    },
    spaceBySlug: async (_parent: any, args: { slug: string }, context: GraphQLContext) => {
      return context.services.space.getSpaceBySlug(args.slug);
    }
  },
  Mutation: {
    createSpace: async (_parent: any, args: { input: CreateSpaceInput }, context: GraphQLContext) => {
      return context.services.space.createSpace(args.input);
    },
    updateSpace: async (_parent: any, args: { id: string; input: UpdateSpaceInput }, context: GraphQLContext) => {
      return context.services.space.updateSpace(args.id, args.input);
    },
    deleteSpace: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.space.deleteSpace(args.id);
    },
    createWebhook: async (_parent: any, args: { input: { spaceId: string; url: string } }, context: GraphQLContext) => {
      return context.services.space.createWebhook(args.input.spaceId, args.input.url);
    },
    deleteWebhook: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.space.deleteWebhook(args.id);
    }
  },
  Space: {
    testimonials: async (parent: any, _args: any, context: GraphQLContext) => {
      const isOwner = context.currentUser && context.currentUser.id === parent.userId;
      return context.prisma.testimonial.findMany({
        where: {
          spaceId: parent.id,
          ...(isOwner ? {} : { isApproved: true, isArchived: false })
        },
        orderBy: { createdAt: 'desc' }
      });
    },
    campaigns: async (parent: any, _args: any, context: GraphQLContext) => {
      const isOwner = context.currentUser && context.currentUser.id === parent.userId;
      if (!isOwner) return [];
      return context.prisma.campaign.findMany({
        where: { spaceId: parent.id },
        orderBy: { createdAt: 'desc' }
      });
    },
    webhooks: async (parent: any, _args: any, context: GraphQLContext) => {
      const isOwner = context.currentUser && context.currentUser.id === parent.userId;
      if (!isOwner) return [];
      return context.prisma.webhook.findMany({
        where: { spaceId: parent.id },
        orderBy: { createdAt: 'desc' }
      });
    },
    reward: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.reward.findUnique({
        where: { spaceId: parent.id }
      });
    }
  }
};
