import { GraphQLContext } from '../context';

export const enterpriseResolvers = {
  Query: {
    organization: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.enterpriseSecurity.getOrganization(args.id);
    },
    organizationAuditLogs: async (_parent: any, args: { orgId: string }, context: GraphQLContext) => {
      return context.services.enterpriseSecurity.getOrganizationAuditLogs(args.orgId);
    },
    customRoles: async (_parent: any, args: { orgId: string }, context: GraphQLContext) => {
      return context.services.enterpriseSecurity.getCustomRoles(args.orgId);
    },
    ssoConfig: async (_parent: any, args: { orgId: string }, context: GraphQLContext) => {
      return context.services.enterpriseSecurity.getSsoConfig(args.orgId);
    },
    ipPolicies: async (_parent: any, args: { orgId: string }, context: GraphQLContext) => {
      return context.services.enterpriseSecurity.getIpPolicies(args.orgId);
    }
  },

  Mutation: {
    createOrganization: async (_parent: any, args: { name: string }, context: GraphQLContext) => {
      return context.services.enterpriseSecurity.createOrganization(args.name);
    },
    createTeam: async (_parent: any, args: { orgId: string; name: string }, context: GraphQLContext) => {
      return context.services.enterpriseSecurity.createTeam(args.orgId, args.name);
    },
    createCustomRole: async (_parent: any, args: { orgId: string; name: string; permissions: string }, context: GraphQLContext) => {
      return context.services.enterpriseSecurity.createCustomRole(args.orgId, args.name, args.permissions);
    },
    updateSsoConfig: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.enterpriseSecurity.updateSsoConfig(
        args.orgId,
        args.provider,
        args.entryPoint,
        args.issuer
      );
    },
    createIpPolicy: async (_parent: any, args: { orgId: string; cidr: string; type: string }, context: GraphQLContext) => {
      return context.services.enterpriseSecurity.createIpPolicy(args.orgId, args.cidr, args.type);
    },
    deleteIpPolicy: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.enterpriseSecurity.deleteIpPolicy(args.id);
    }
  }
};

export default enterpriseResolvers;
