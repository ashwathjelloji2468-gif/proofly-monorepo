import { GraphQLContext } from '../context';

export const integrationsResolvers = {
  Query: {
    apiKeys: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.integration.getApiKeys(args.spaceId);
    },
    webhooks: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.integration.getWebhooks(args.spaceId);
    },
    connections: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.integration.getConnections(args.spaceId);
    },
    apiLogs: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.integration.getApiLogs(args.spaceId);
    }
  },

  Mutation: {
    createApiKey: async (_parent: any, args: { spaceId: string; name: string; scopes: string }, context: GraphQLContext) => {
      return context.services.integration.createApiKey(args.spaceId, args.name, args.scopes);
    },
    revokeApiKey: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.integration.revokeApiKey(args.id);
    },
    createWebhook: async (_parent: any, args: { spaceId: string; targetUrl: string; events: string }, context: GraphQLContext) => {
      return context.services.integration.createWebhook(args.spaceId, args.targetUrl, args.events);
    },
    deleteWebhook: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.integration.deleteWebhook(args.id);
    },
    connectApp: async (_parent: any, args: { spaceId: string; appId: string; config?: string }, context: GraphQLContext) => {
      return context.services.integration.connectApp(args.spaceId, args.appId, args.config);
    },
    disconnectApp: async (_parent: any, args: { spaceId: string; appId: string }, context: GraphQLContext) => {
      return context.services.integration.disconnectApp(args.spaceId, args.appId);
    }
  }
};

export default integrationsResolvers;
