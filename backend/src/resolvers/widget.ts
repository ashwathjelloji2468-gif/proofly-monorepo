import { GraphQLContext } from '../context';
import { writeAuditLog } from '../monitoring/auditLogger';

export const widgetResolvers = {
  Query: {
    widgetById: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.widget.getWidgetById(args.id);
    },
    myWidgets: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.widget.getMyWidgets(args.spaceId);
    },
    widgetAnalytics: async (_parent: any, args: { widgetId: string }, context: GraphQLContext) => {
      return context.services.widget.getWidgetAnalytics(args.widgetId);
    }
  },
  Mutation: {
    createWidget: async (
      _parent: any,
      args: { spaceId: string; name: string; layout: string; theme: string; settings: string },
      context: GraphQLContext
    ) => {
      const result = await context.services.widget.createWidget(args.spaceId, args.name, args.layout, args.theme, args.settings);
      if (context.currentUser?.id) {
        writeAuditLog(context.prisma, {
          userId: context.currentUser.id,
          action: 'WIDGET_CREATE',
          workspaceId: args.spaceId,
          ipAddress: context.req.ip,
          requestId: (context.req as any).requestId,
          severity: 'INFO',
          targetResource: 'Widget',
          targetResourceId: result?.id,
          newValues: { name: args.name, layout: args.layout, theme: args.theme },
        });
      }
      return result;
    },
    updateWidget: async (
      _parent: any,
      args: { id: string; name?: string; layout?: string; theme?: string; settings?: string; status?: string },
      context: GraphQLContext
    ) => {
      const result = await context.services.widget.updateWidget(args.id, args);
      if (context.currentUser?.id) {
        writeAuditLog(context.prisma, {
          userId: context.currentUser.id,
          action: args.status === 'PUBLISHED' ? 'WIDGET_PUBLISH' : args.status === 'DRAFT' ? 'WIDGET_UNPUBLISH' : 'WIDGET_EDIT',
          ipAddress: context.req.ip,
          requestId: (context.req as any).requestId,
          severity: 'INFO',
          targetResource: 'Widget',
          targetResourceId: args.id,
          newValues: { name: args.name, status: args.status },
        });
      }
      return result;
    },
    deleteWidget: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      const result = await context.services.widget.deleteWidget(args.id);
      if (context.currentUser?.id) {
        writeAuditLog(context.prisma, {
          userId: context.currentUser.id,
          action: 'WIDGET_DELETE',
          ipAddress: context.req.ip,
          requestId: (context.req as any).requestId,
          severity: 'WARN',
          targetResource: 'Widget',
          targetResourceId: args.id,
        });
      }
      return result;
    }
  },
  Widget: {
    settings: (parent: any) => {
      if (typeof parent.settings === 'object') {
        return JSON.stringify(parent.settings);
      }
      return parent.settings || '{}';
    }
  }
};
export default widgetResolvers;
