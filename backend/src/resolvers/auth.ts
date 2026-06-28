import { GraphQLContext } from '../context';
import { BillingTier, SpaceRole } from '@prisma/client';

export const authResolvers = {
  Query: {
    me: async (_parent: any, _args: any, context: GraphQLContext) => {
      try {
        return await context.services.user.getMe();
      } catch (err) {
        return null;
      }
    },
    getWorkspaceInvitations: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.space.getWorkspaceInvitations(args.spaceId);
    },
    getWorkspaceMembers: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.space.getWorkspaceMembers(args.spaceId);
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
    googleLogin: async (_parent: any, args: { code: string, redirectUri: string }, context: GraphQLContext) => {
      return context.services.user.googleLogin(args.code, args.redirectUri);
    },
    updateBillingTier: async (_parent: any, args: { tier: BillingTier }, context: GraphQLContext) => {
      return context.services.user.updateBillingTier(args.tier);
    },
    verifyEmail: async (_parent: any, args: { token: string }, context: GraphQLContext) => {
      return context.services.user.verifyEmail(args.token);
    },
    resendVerificationEmail: async (_parent: any, args: { email: string }, context: GraphQLContext) => {
      return context.services.user.resendVerificationEmail(args.email);
    },
    requestPasswordReset: async (_parent: any, args: { email: string }, context: GraphQLContext) => {
      return context.services.user.requestPasswordReset(args.email);
    },
    verifyOTP: async (_parent: any, args: { email: string, otp: string }, context: GraphQLContext) => {
      return context.services.user.verifyOTP(args.email, args.otp);
    },
    resetPassword: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.user.resetPassword(args.email, args.token, args.newPassword);
    },
    requestEmailChange: async (_parent: any, args: { newEmail: string }, context: GraphQLContext) => {
      return context.services.user.requestEmailChange(args.newEmail);
    },
    verifyEmailChangeToken: async (_parent: any, args: { token: string }, context: GraphQLContext) => {
      return context.services.user.verifyEmailChangeToken(args.token);
    },
    inviteToWorkspace: async (_parent: any, args: { spaceId: string, email: string, role: SpaceRole }, context: GraphQLContext) => {
      return context.services.space.inviteToWorkspace(args.spaceId, args.email, args.role);
    },
    acceptWorkspaceInvitation: async (_parent: any, args: { token: string }, context: GraphQLContext) => {
      return context.services.space.acceptWorkspaceInvitation(args.token);
    },
    removeWorkspaceMember: async (_parent: any, args: { memberId: string }, context: GraphQLContext) => {
      return context.services.space.removeWorkspaceMember(args.memberId);
    }
  },
  User: {
    spaces: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.space.findMany({
        where: {
          OR: [
            { userId: parent.id },
            { members: { some: { userId: parent.id } } }
          ]
        },
        orderBy: { createdAt: 'desc' }
      });
    }
  },
  SpaceMember: {
    user: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.user.findUnique({
        where: { id: parent.userId }
      });
    }
  }
};
