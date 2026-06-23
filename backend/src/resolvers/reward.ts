import { GraphQLContext } from '../context';

export const rewardResolvers = {
  Mutation: {
    createOrUpdateReward: async (_parent: any, args: { input: { spaceId: string; discountCode: string; message: string } }, context: GraphQLContext) => {
      return context.services.reward.createOrUpdateReward(args.input);
    },
    deleteReward: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.reward.deleteReward(args.spaceId);
    }
  },
  Reward: {
    space: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.space.findUnique({
        where: { id: parent.spaceId }
      });
    }
  }
};
