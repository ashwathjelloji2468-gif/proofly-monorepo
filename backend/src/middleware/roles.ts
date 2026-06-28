import { GraphQLContext } from '../context';
import { SpaceRole, SpaceMember } from '@prisma/client';

export function requireUser(context: GraphQLContext) {
  if (!context.currentUser) {
    throw new Error('UNAUTHENTICATED: You must be logged in to perform this action.');
  }
  return context.currentUser;
}

export async function requireSpaceRole(
  context: GraphQLContext,
  spaceId: string,
  allowedRoles: SpaceRole[]
): Promise<SpaceMember> {
  const currentUser = requireUser(context);

  // Check if user is space owner (creator) or space member
  const space = await context.prisma.space.findUnique({
    where: { id: spaceId }
  });

  if (!space) {
    throw new Error('NOT_FOUND: Space not found.');
  }

  // If user is owner of space, they have OWNER permissions implicitly
  if (space.userId === currentUser.id) {
    // Return a mock SpaceMember matching OWNER role
    return {
      id: 'owner-implicit',
      spaceId,
      userId: currentUser.id,
      role: SpaceRole.OWNER,
      createdAt: space.createdAt,
      updatedAt: space.createdAt
    };
  }

  // Look up space member record
  const member = await context.prisma.spaceMember.findUnique({
    where: {
      spaceId_userId: {
        spaceId,
        userId: currentUser.id
      }
    }
  });

  if (!member || !allowedRoles.includes(member.role)) {
    throw new Error('UNAUTHORIZED: You do not have permission to access this workspace.');
  }

  return member;
}
