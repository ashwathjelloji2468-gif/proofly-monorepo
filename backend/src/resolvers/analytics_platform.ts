import { GraphQLContext } from '../context';

export const analyticsPlatformResolvers = {
  Query: {
    advancedAnalytics: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.analyticsPlatform.getAdvancedAnalytics(args.spaceId);
    },
    showcaseFunnel: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.analyticsPlatform.getShowcaseFunnel(args.spaceId);
    },
    conversionGoals: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.analyticsPlatform.getConversionGoals(args.spaceId);
    },
    telemetryReports: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.analyticsPlatform.getTelemetryReports(args.spaceId);
    }
  },

  Mutation: {
    createGoal: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.analyticsPlatform.createGoal(
        args.spaceId,
        args.name,
        args.description,
        args.triggerType,
        args.category,
        args.value
      );
    },
    logConversion: async (_parent: any, args: { spaceId: string; visitorId: string; goalId: string }, context: GraphQLContext) => {
      return context.services.analyticsPlatform.logConversion(args.spaceId, args.visitorId, args.goalId);
    },
    logRevenue: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.analyticsPlatform.logRevenue(
        args.spaceId,
        args.visitorId,
        args.amount,
        args.source,
        args.sourceId
      );
    },
    logHeatmapPoint: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.analyticsPlatform.logHeatmapPoint(
        args.spaceId,
        args.targetId,
        args.type,
        args.x,
        args.y,
        args.device
      );
    },
    generateReport: async (_parent: any, args: { spaceId: string; range: string; format: string }, context: GraphQLContext) => {
      return context.services.analyticsPlatform.generateReport(args.spaceId, args.range, args.format);
    }
  }
};

export default analyticsPlatformResolvers;
