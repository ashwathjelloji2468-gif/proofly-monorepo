import { PrismaClient, User, SpaceRole } from '@prisma/client';

export class AuthorizationService {
  constructor(private prisma: PrismaClient, private currentUser: Omit<User, 'passwordHash'> | null) {}

  private ensureAuthenticated(): Omit<User, 'passwordHash'> {
    if (!this.currentUser) {
      throw new Error('UNAUTHENTICATED: You must be logged in to perform this action.');
    }
    return this.currentUser;
  }

  async checkPermission(spaceId: string, allowedRoles: SpaceRole[]): Promise<boolean> {
    const currentUser = this.ensureAuthenticated();

    const space = await this.prisma.space.findUnique({
      where: { id: spaceId }
    });

    if (!space) {
      throw new Error('NOT_FOUND: Space not found.');
    }

    // Owner (creator) has all rights implicitly
    if (space.userId === currentUser.id) {
      return true;
    }

    const member = await this.prisma.spaceMember.findUnique({
      where: {
        spaceId_userId: {
          spaceId,
          userId: currentUser.id
        }
      }
    });

    if (!member) {
      return false;
    }

    return allowedRoles.includes(member.role);
  }

  async checkBillingLimit(spaceId: string, limitKey: 'spaces' | 'testimonials'): Promise<boolean> {
    const currentUser = this.ensureAuthenticated();
    const user = await this.prisma.user.findUnique({ where: { id: currentUser.id } });
    if (!user) return false;

    // Standard SaaS limits:
    // FREE: 1 space, 10 testimonials
    // PRO: 5 spaces, 100 testimonials
    // BUSINESS: unlimited
    // ENTERPRISE: unlimited
    const tier = user.tier;
    if (tier === 'BUSINESS' || tier === 'ENTERPRISE') return true;

    if (limitKey === 'spaces') {
      const ownedSpacesCount = await this.prisma.space.count({
        where: { userId: user.id }
      });
      const maxSpaces = tier === 'FREE' ? 1 : 5;
      return ownedSpacesCount < maxSpaces;
    }

    if (limitKey === 'testimonials') {
      const testimonialsCount = await this.prisma.testimonial.count({
        where: { space: { id: spaceId } }
      });
      const maxTestimonials = tier === 'FREE' ? 10 : 100;
      return testimonialsCount < maxTestimonials;
    }

    return true;
  }
}
