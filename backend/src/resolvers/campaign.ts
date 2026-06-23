import { GraphQLContext } from '../context';
import { CreateCampaignInput } from '../services/CampaignService';

export const campaignResolvers = {
  Query: {
    campaigns: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.campaign.getCampaigns(args.spaceId);
    },
    campaign: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.campaign.getCampaignById(args.id);
    }
  },
  Mutation: {
    createCampaign: async (_parent: any, args: { input: CreateCampaignInput }, context: GraphQLContext) => {
      return context.services.campaign.createCampaign(args.input);
    },
    sendCampaign: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.campaign.sendCampaign(args.id);
    }
  },
  Campaign: {
    space: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.space.findUnique({
        where: { id: parent.spaceId }
      });
    }
  }
};
