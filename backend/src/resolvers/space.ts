import { GraphQLContext } from '../context';
import { CreateSpaceInput, UpdateSpaceInput } from '../services/SpaceService';
import { requireSpaceRole } from '../middleware/roles';
import { SpaceRole } from '@prisma/client';

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
      await requireSpaceRole(context, args.id, SpaceRole.ADMIN);
      return context.services.space.updateSpace(args.id, args.input);
    },
    deleteSpace: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      await requireSpaceRole(context, args.id, SpaceRole.ADMIN);
      return context.services.space.deleteSpace(args.id);
    },
    createWebhook: async (_parent: any, args: { input: { spaceId: string; url: string } }, context: GraphQLContext) => {
      await requireSpaceRole(context, args.input.spaceId, SpaceRole.ADMIN);
      return context.services.space.createWebhook(args.input.spaceId, args.input.url);
    },
    deleteWebhook: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      const webhook = await context.prisma.webhook.findUnique({ where: { id: args.id } });
      if (!webhook) {
        throw new Error('NOT_FOUND: Webhook not found.');
      }
      await requireSpaceRole(context, webhook.spaceId, SpaceRole.ADMIN);
      return context.services.space.deleteWebhook(args.id);
    }
  },
  Space: {
    testimonials: async (parent: any, _args: any, context: GraphQLContext) => {
      let canSeeAll = false;
      if (context.currentUser) {
        if (parent.userId === context.currentUser.id) {
          canSeeAll = true;
        } else {
          const member = await context.prisma.spaceMember.findUnique({
            where: { spaceId_userId: { spaceId: parent.id, userId: context.currentUser.id } }
          });
          if (member) {
            canSeeAll = true;
          }
        }
      }
      return context.prisma.testimonial.findMany({
        where: {
          spaceId: parent.id,
          ...(canSeeAll ? {} : { isApproved: true, isArchived: false })
        },
        orderBy: { createdAt: 'desc' }
      });
    },
    campaigns: async (parent: any, _args: any, context: GraphQLContext) => {
      let isAuthorized = false;
      if (context.currentUser) {
        if (parent.userId === context.currentUser.id) {
          isAuthorized = true;
        } else {
          const member = await context.prisma.spaceMember.findUnique({
            where: { spaceId_userId: { spaceId: parent.id, userId: context.currentUser.id } }
          });
          if (member && (member.role === 'OWNER' || member.role === 'ADMIN' || member.role === 'MANAGER')) {
            isAuthorized = true;
          }
        }
      }
      if (!isAuthorized) return [];
      return context.prisma.campaign.findMany({
        where: { spaceId: parent.id },
        orderBy: { createdAt: 'desc' }
      });
    },
    webhooks: async (parent: any, _args: any, context: GraphQLContext) => {
      let isAuthorized = false;
      if (context.currentUser) {
        if (parent.userId === context.currentUser.id) {
          isAuthorized = true;
        } else {
          const member = await context.prisma.spaceMember.findUnique({
            where: { spaceId_userId: { spaceId: parent.id, userId: context.currentUser.id } }
          });
          if (member && (member.role === 'OWNER' || member.role === 'ADMIN')) {
            isAuthorized = true;
          }
        }
      }
      if (!isAuthorized) return [];
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
