import { GraphQLContext } from '../context';

export const staticPageResolvers = {
  Query: {
    staticPage: async (_parent: any, args: { slug: string }, context: GraphQLContext) => {
      return context.prisma.staticPage.findUnique({
        where: { slug: args.slug }
      });
    }
  },
  Mutation: {
    upsertStaticPage: async (
      _parent: any,
      args: { slug: string; title: string; content: string },
      context: GraphQLContext
    ) => {
      return context.prisma.staticPage.upsert({
        where: { slug: args.slug },
        update: {
          title: args.title,
          content: args.content,
        },
        create: {
          slug: args.slug,
          title: args.title,
          content: args.content,
        }
      });
    }
  }
};
