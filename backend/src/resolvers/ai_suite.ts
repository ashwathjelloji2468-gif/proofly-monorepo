import { GraphQLContext } from '../context';

export const aiSuiteResolvers = {
  Query: {
    aiUsage: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.aiSuite.getAIUsage(args.spaceId);
    },
    aiHistory: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.aiSuite.getAIHistory(args.spaceId);
    },
    aiInsights: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.aiSuite.getAIInsights(args.spaceId);
    },
    aiSearchTestimonials: async (_parent: any, args: { spaceId: string; query: string }, context: GraphQLContext) => {
      return context.services.aiSuite.aiSearchTestimonials(args.spaceId, args.query);
    }
  },

  Mutation: {
    aiRewrite: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.aiSuite.aiRewrite(args.testimonialId, args.tone, args.options);
    },
    aiAnalyzeTestimonial: async (_parent: any, args: { testimonialId: string }, context: GraphQLContext) => {
      return context.services.aiSuite.aiAnalyzeTestimonial(args.testimonialId);
    },
    aiTranslateTestimonial: async (_parent: any, args: { testimonialId: string; locale: string }, context: GraphQLContext) => {
      return context.services.aiSuite.aiTranslateTestimonial(args.testimonialId, args.locale);
    },
    aiGenerateSocial: async (_parent: any, args: { testimonialId: string; platform: string }, context: GraphQLContext) => {
      return context.services.aiSuite.aiGenerateSocial(args.testimonialId, args.platform);
    },
    aiGenerateLandingPage: async (_parent: any, args: { spaceId: string; layoutType: string }, context: GraphQLContext) => {
      return context.services.aiSuite.aiGenerateLandingPage(args.spaceId, args.layoutType);
    },
    aiGenerateCaseStudy: async (_parent: any, args: { spaceId: string; testimonialIds: string[] }, context: GraphQLContext) => {
      return context.services.aiSuite.aiGenerateCaseStudy(args.spaceId, args.testimonialIds);
    }
  }
};

export default aiSuiteResolvers;
