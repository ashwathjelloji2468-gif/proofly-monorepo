import { GraphQLContext } from '../context';
import { BillingTier, SpaceRole } from '@prisma/client';
import { setAuthCookies, clearAuthCookies } from '../security/cookies';
import { checkRateLimit } from '../security/rateLimiter';

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
    },
    activeSessions: async (_parent: any, _args: any, context: GraphQLContext) => {
      const sessions = await context.services.session.getActiveSessions();
      return sessions.map(session => ({
        ...session,
        isCurrent: session.id === context.currentSession?.id
      }));
    }
  },
  Mutation: {
    signup: async (_parent: any, args: any, context: GraphQLContext) => {
      const ip = context.req.ip || context.req.headers['x-forwarded-for']?.toString() || 'unknown';
      checkRateLimit(ip, 'signup', 3, 60 * 1000); // 3 per minute
      return context.services.user.signup(args.email, args.name, args.password);
    },
    login: async (_parent: any, args: any, context: GraphQLContext) => {
      const ip = context.req.ip || context.req.headers['x-forwarded-for']?.toString() || 'unknown';
      checkRateLimit(ip, 'login', 5, 60 * 1000); // 5 per minute
      const userAgent = context.req.headers['user-agent'] || null;
      const ipAddress = context.req.ip || null;
      const { accessToken, refreshToken, user } = await context.services.user.login(args.email, args.password, userAgent, ipAddress);
      setAuthCookies(context.res, accessToken, refreshToken);
      return { user };
    },
    githubLogin: async (_parent: any, args: { code: string }, context: GraphQLContext) => {
      const userAgent = context.req.headers['user-agent'] || null;
      const ipAddress = context.req.ip || null;
      const { accessToken, refreshToken, user } = await context.services.oauth.githubLogin(args.code, userAgent, ipAddress);
      setAuthCookies(context.res, accessToken, refreshToken);
      return { user };
    },
    googleLogin: async (_parent: any, args: { code: string }, context: GraphQLContext) => {
      const userAgent = context.req.headers['user-agent'] || null;
      const ipAddress = context.req.ip || null;
      const { accessToken, refreshToken, user } = await context.services.oauth.googleLogin(args.code, userAgent, ipAddress);
      setAuthCookies(context.res, accessToken, refreshToken);
      return { user };
    },
    logout: async (_parent: any, _args: any, context: GraphQLContext) => {
      if (context.currentSession) {
        await context.services.session.revokeSession(context.currentSession.id);
      }
      clearAuthCookies(context.res);
      return true;
    },
    refreshSession: async (_parent: any, _args: any, _context: GraphQLContext) => {
      // The authMiddleware handles automatic silent refresh on request.
      // Simply returning true confirms that cookies have been parsed/rotated.
      return true;
    },
    updateBillingTier: async (_parent: any, args: { tier: BillingTier }, context: GraphQLContext) => {
      return context.services.user.updateBillingTier(args.tier);
    },
    verifyEmail: async (_parent: any, args: { token: string }, context: GraphQLContext) => {
      const userAgent = context.req.headers['user-agent'] || null;
      const ipAddress = context.req.ip || null;
      const { accessToken, refreshToken, user } = await context.services.user.verifyEmail(args.token, userAgent, ipAddress);
      setAuthCookies(context.res, accessToken, refreshToken);
      return { user };
    },
    resendVerificationEmail: async (_parent: any, args: { email: string }, context: GraphQLContext) => {
      return context.services.user.resendVerificationEmail(args.email);
    },
    requestPasswordReset: async (_parent: any, args: { email: string }, context: GraphQLContext) => {
      const ip = context.req.ip || context.req.headers['x-forwarded-for']?.toString() || 'unknown';
      checkRateLimit(ip, 'forgot-password', 3, 60 * 1000); // 3 per minute
      return context.services.user.requestPasswordReset(args.email);
    },
    verifyOTP: async (_parent: any, args: { email: string, otp: string }, context: GraphQLContext) => {
      const ip = context.req.ip || context.req.headers['x-forwarded-for']?.toString() || 'unknown';
      checkRateLimit(ip, 'otp', 5, 15 * 60 * 1000); // 5 per 15 minutes
      return context.services.user.verifyOTP(args.email, args.otp);
    },
    resetPassword: async (_parent: any, args: any, context: GraphQLContext) => {
      const success = await context.services.user.resetPassword(args.email, args.token, args.newPassword);
      if (success) {
        clearAuthCookies(context.res);
      }
      return success;
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
    },
    setPassword: async (_parent: any, args: { password: string }, context: GraphQLContext) => {
      return context.services.user.setPassword(args.password);
    },
    revokeSession: async (_parent: any, args: { sessionId: string }, context: GraphQLContext) => {
      return context.services.session.revokeSession(args.sessionId);
    },
    revokeAllSessions: async (_parent: any, _args: any, context: GraphQLContext) => {
      return context.services.session.revokeAllSessions();
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
