import { GraphQLContext } from '../context';
import { CreateTestimonialInput, ImportTestimonialInput, UpdateTestimonialInput } from '../services/TestimonialService';
import { requireSpaceRole } from '../middleware/roles';
import { SpaceRole } from '@prisma/client';

export const testimonialResolvers = {
  Query: {
    allApprovedTestimonials: async (_parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.testimonial.findMany({
        where: { isApproved: true, isArchived: false },
        orderBy: { createdAt: 'desc' }
      });
    },
    testimonials: async (_parent: any, args: { spaceId: string; approvedOnly?: boolean }, context: GraphQLContext) => {
      if (!args.approvedOnly) {
        await requireSpaceRole(context, args.spaceId, SpaceRole.VIEWER);
      }
      return context.services.testimonial.getTestimonials(args.spaceId, args.approvedOnly ?? false);
    },
    testimonial: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      // Find testimonial first to see what space it belongs to for security
      const t = await context.prisma.testimonial.findUnique({ where: { id: args.id } });
      if (!t) {
        throw new Error('NOT_FOUND: Testimonial not found.');
      }
      // If approved, public can view, else must be a space member
      if (!t.isApproved || t.isArchived) {
        await requireSpaceRole(context, t.spaceId, SpaceRole.VIEWER);
      }
      return context.services.testimonial.getTestimonialById(args.id);
    }
  },
  Mutation: {
    createTestimonial: async (_parent: any, args: { input: CreateTestimonialInput }, context: GraphQLContext) => {
      // Public collector submission — no space member check needed
      return context.services.testimonial.createTestimonial(args.input);
    },
    importTestimonial: async (_parent: any, args: { input: ImportTestimonialInput }, context: GraphQLContext) => {
      await requireSpaceRole(context, args.input.spaceId, SpaceRole.MANAGER);
      return context.services.testimonial.importTestimonial(args.input);
    },
    updateTestimonial: async (_parent: any, args: { id: string; input: UpdateTestimonialInput }, context: GraphQLContext) => {
      const testimonial = await context.prisma.testimonial.findUnique({ where: { id: args.id } });
      if (!testimonial) {
        throw new Error('NOT_FOUND: Testimonial not found.');
      }
      await requireSpaceRole(context, testimonial.spaceId, SpaceRole.MANAGER);
      return context.services.testimonial.updateTestimonial(args.id, args.input);
    },
    deleteTestimonial: async (_parent: any, args: { id: string }, context: GraphQLContext) => {
      const testimonial = await context.prisma.testimonial.findUnique({ where: { id: args.id } });
      if (!testimonial) {
        throw new Error('NOT_FOUND: Testimonial not found.');
      }
      await requireSpaceRole(context, testimonial.spaceId, SpaceRole.MANAGER);
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
