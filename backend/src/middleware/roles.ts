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
  minRole: SpaceRole
): Promise<SpaceMember> {
  const currentUser = requireUser(context);

  const space = await context.prisma.space.findUnique({
    where: { id: spaceId }
  });

  if (!space) {
    throw new Error('NOT_FOUND: Space not found.');
  }

  // Owner implicitly has OWNER role
  if (space.userId === currentUser.id) {
    return {
      id: 'owner-implicit',
      spaceId,
      userId: currentUser.id,
      role: SpaceRole.OWNER,
      createdAt: space.createdAt,
      updatedAt: space.createdAt
    };
  }

  const member = await context.prisma.spaceMember.findUnique({
    where: {
      spaceId_userId: {
        spaceId,
        userId: currentUser.id
      }
    }
  });

  const ROLE_HIERARCHY: Record<SpaceRole, number> = {
    [SpaceRole.OWNER]: 5,
    [SpaceRole.ADMIN]: 4,
    [SpaceRole.MANAGER]: 3,
    [SpaceRole.MEMBER]: 2,
    [SpaceRole.VIEWER]: 1
  };

  if (!member || ROLE_HIERARCHY[member.role] < ROLE_HIERARCHY[minRole]) {
    throw new Error(`FORBIDDEN: You do not have sufficient permissions. Required role: ${minRole}, your role: ${member?.role || 'NONE'}`);
  }

  return member;
}

export function requireFounder(context: GraphQLContext) {
  const currentUser = requireUser(context);
  if ((currentUser as any).role !== 'FOUNDER') {
    throw new Error('FORBIDDEN: Founder permissions required.');
  }
  return currentUser;
}

import { Request, Response, NextFunction } from 'express';

export function requireFounderMiddleware(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'FOUNDER') {
    res.status(403).json({ error: 'FORBIDDEN: Platform Founder access required.' });
    return;
  }
  next();
}
