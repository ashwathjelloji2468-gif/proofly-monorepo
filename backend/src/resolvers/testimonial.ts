import { GraphQLContext } from '../context';
import { CreateTestimonialInput, ImportTestimonialInput, UpdateTestimonialInput } from '../services/TestimonialService';

export const testimonialResolvers = {
  Query: {
    allApprovedTestimonials: async (_parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.testimonial.findMany({
        where: { isApproved: true, isArchived: false },
        orderBy: { createdAt: 'desc' }
      });
    },
    testimonials: async (_parent: any, args: { spaceId: string; approvedOnly?: boolean }, context: GraphQLContext) => {
      return context.services.testimonial.getTestimonials(args.spaceId, args.approvedOnly ?? false);
    },
    testimonial: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.testimonial.getTestimonialById(args.id);
    }
  },
  Mutation: {
    createTestimonial: async (_parent: any, args: { input: CreateTestimonialInput }, context: GraphQLContext) => {
      return context.services.testimonial.createTestimonial(args.input);
    },
    importTestimonial: async (_parent: any, args: { input: ImportTestimonialInput }, context: GraphQLContext) => {
      return context.services.testimonial.importTestimonial(args.input);
    },
    updateTestimonial: async (_parent: any, args: { id: string; input: UpdateTestimonialInput }, context: GraphQLContext) => {
      return context.services.testimonial.updateTestimonial(args.id, args.input);
    },
    deleteTestimonial: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      return context.services.testimonial.deleteTestimonial(args.id);
    }
  },
  Testimonial: {
    space: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.space.findUnique({
        where: { id: parent.spaceId }
      });
    }
  }
};
