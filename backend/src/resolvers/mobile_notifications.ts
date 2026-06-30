import { GraphQLContext } from '../context';

export const mobileNotificationsResolvers = {
  Query: {
    inAppNotifications: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.mobileNotification.getNotifications(args.spaceId);
    },
    unreadNotificationsCount: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.mobileNotification.getUnreadCount(args.spaceId);
    }
  },

  Mutation: {
    markNotificationAsRead: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.mobileNotification.markAsRead(args.id);
    },
    markAllNotificationsAsRead: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.mobileNotification.markAllRead(args.spaceId);
    }
  }
};

export default mobileNotificationsResolvers;
