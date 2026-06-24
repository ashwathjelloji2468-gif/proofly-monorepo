import { GraphQLContext } from '../context';
import { BillingTier } from '@prisma/client';

export const authResolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: GraphQLContext) => {
      try {
        return await context.services.user.getMe();
      } catch (err) {
        // Return null if unauthenticated rather than breaking the Query
        return null;
      }
    }
  },
  Mutation: {
    signup: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.user.signup(args.email, args.name, args.password);
    },
    login: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.user.login(args.email, args.password);
    },
    githubLogin: async (_parent: any, args: { code: string }, context: GraphQLContext) => {
      return context.services.user.githubLogin(args.code);
    },
    updateBillingTier: async (_parent: any, args: { tier: BillingTier }, context: GraphQLContext) => {
      return context.services.user.updateBillingTier(args.tier);
    }
  },
  User: {
    spaces: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.space.findMany({
        where: { userId: parent.id },
        orderBy: { createdAt: 'desc' }
      });
    }
  }
};
