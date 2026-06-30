import { GraphQLContext } from '../context';

export const collectionResolvers = {
  Query: {
    collectionById: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.collection.getCollectionById(args.id);
    },
    collectionBySlug: async (_parent: any, args: { slug: string }, context: GraphQLContext) => {
      return context.services.collection.getCollectionBySlug(args.slug);
    },
    spaceCollections: async (_parent: any, args: { spaceId: string }, context: GraphQLContext) => {
      return context.services.collection.getSpaceCollections(args.spaceId);
    },
    collectionAnalytics: async (_parent: any, args: { collectionId: string }, context: GraphQLContext) => {
      return context.services.collection.getCollectionAnalytics(args.collectionId);
    }
  },

  Mutation: {
    createCollection: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.collection.createCollection(args);
    },
    updateCollection: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.collection.updateCollection(args.id, args);
    },
    deleteCollection: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.collection.deleteCollection(args.id);
    },
    duplicateCollection: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.collection.duplicateCollection(args.id);
    },
    submitCollectionTestimonial: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.collection.submitCollectionTestimonial(
        args.collectionId,
        args.type,
        args.reviewerName,
        args.reviewerEmail,
        args.reviewerTitle,
        args.reviewerSocial,
        args.reviewerAvatar,
        args.rating,
        args.textContent,
        args.videoUrl,
        args.consentGiven,
        args.customAnswers,
        context.req
      );
    },
    trackCollectionView: async (_parent: any, args: any, context: GraphQLContext) => {
      return context.services.collection.trackCollectionView(
        args.collectionId,
        args.visitorId,
        args.referrer,
        args.utmSource,
        args.utmMedium,
        args.utmCampaign,
        context.req
      );
    },
    startCollectionSubmission: async (_parent: any, args: { collectionId: string }, context: GraphQLContext) => {
      return context.services.collection.startCollectionSubmission(args.collectionId);
    },
    logCollectionShare: async (_parent: any, args: { collectionId: string; platform: string }, context: GraphQLContext) => {
      return context.services.collection.logCollectionShare(args.collectionId, args.platform);
    }
  },

  Space: {
    collections: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.services.collection.getSpaceCollections(parent.id);
    }
  },

  Collection: {
    theme: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.collectionTheme.findUnique({
        where: { collectionId: parent.id }
      });
    },
    questions: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.collectionQuestion.findMany({
        where: { collectionId: parent.id },
        orderBy: { order: 'asc' }
      });
    },
    testimonials: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.testimonial.findMany({
        where: { collectionId: parent.id },
        orderBy: { createdAt: 'desc' }
      });
    }
  }
};

export default collectionResolvers;
