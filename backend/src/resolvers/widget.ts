import { GraphQLContext } from '../context';

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
      return context.services.widget.createWidget(args.spaceId, args.name, args.layout, args.theme, args.settings);
    },
    updateWidget: async (
      _parent: any,
      args: { id: string; name?: string; layout?: string; theme?: string; settings?: string; status?: string },
      context: GraphQLContext
    ) => {
      return context.services.widget.updateWidget(args.id, args);
    },
    deleteWidget: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.widget.deleteWidget(args.id);
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
