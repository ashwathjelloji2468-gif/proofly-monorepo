import { GraphQLContext } from '../context';

export const whiteLabelResolvers = {
  Query: {
    whiteLabelConfig: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.whiteLabel.getWhiteLabelConfig(args.spaceId);
    },
    smtpConfig: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.whiteLabel.getSmtpConfig(args.spaceId);
    }
  },

  Mutation: {
    updateWhiteLabelConfig: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.whiteLabel.updateWhiteLabelConfig(
        args.spaceId,
        args.brandName,
        args.logoUrl,
        args.darkLogoUrl,
        args.faviconUrl,
        args.primaryColor,
        args.secondaryColor,
        args.accentColor,
        args.customCss
      );
    },
    updateSmtpConfig: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.whiteLabel.updateSmtpConfig(
        args.spaceId,
        args.host,
        args.port,
        args.username,
        args.passwordPlain,
        args.senderName,
        args.senderEmail
      );
    },
    verifyDomainDNS: async (_parent: any, args: { spaceId: string; domain: string }, context: GraphQLContext) => {
      return context.services.whiteLabel.verifyDomainDNS(args.spaceId, args.domain);
    }
  }
};

export default whiteLabelResolvers;
