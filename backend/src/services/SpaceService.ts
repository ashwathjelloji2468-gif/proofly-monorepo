import { BaseService } from './BaseService';
import { BillingTier, PrismaClient, User, SpaceRole } from '@prisma/client';
import { EmailService } from './EmailService';
import crypto from 'crypto';

export interface CreateSpaceInput {
  name: string;
  slug: string;
  headerTitle: string;
  customMessage: string;
  logoUrl?: string | null;
  collectVideo?: boolean | null;
  collectText?: boolean | null;
  theme?: string | null;
  showBranding?: boolean | null;
  customDomain?: string | null;
}

export interface UpdateSpaceInput {
  name?: string | null;
  headerTitle?: string | null;
  customMessage?: string | null;
  logoUrl?: string | null;
  collectVideo?: boolean | null;
  collectText?: boolean | null;
  theme?: string | null;
  showBranding?: boolean | null;
  customDomain?: string | null;
}

export class SpaceService extends BaseService {
  private emailService: EmailService;

  constructor(prisma: PrismaClient, currentUser: Omit<User, 'passwordHash'> | null, emailService: EmailService) {
    super(prisma, currentUser);
    this.emailService = emailService;
  }

  private getClientUrl(): string {
    return process.env.CLIENT_URL || 'http://localhost:3000';
  }

  // Check role of current user in a space
  async getMemberRole(spaceId: string, userId: string): Promise<SpaceRole | 'OWNER' | null> {
    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) return null;
    if (space.userId === userId) return 'OWNER';
    
    const member = await this.prisma.spaceMember.findUnique({
      where: { spaceId_userId: { spaceId, userId } }
    });
    return member ? member.role : null;
  }

  // Ensure caller has access with any of the allowed roles
  async ensureSpaceAccess(spaceId: string, allowedRoles: ('OWNER' | SpaceRole)[]): Promise<void> {
    const user = this.ensureAuthenticated();
    const role = await this.getMemberRole(spaceId, user.id);
    if (!role || !allowedRoles.includes(role)) {
      throw new Error(`UNAUTHORIZED: You do not have permission to access this space with your current role (${role || 'None'}).`);
    }
  }

  async getMySpaces() {
    const user = this.ensureAuthenticated();
    return this.prisma.space.findMany({
      where: {
        OR: [
          { userId: user.id },
          { members: { some: { userId: user.id } } }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getSpaceBySlug(slug: string) {
    const space = await this.prisma.space.findUnique({
      where: { slug: slug.toLowerCase().trim() },
      include: {
        testimonials: {
          where: { isApproved: true, isArchived: false },
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    return space;
  }

  async createSpace(input: CreateSpaceInput) {
    const user = this.ensureAuthenticated();

    const sanitizedSlug = input.slug.toLowerCase().trim();
    const existing = await this.prisma.space.findUnique({
      where: { slug: sanitizedSlug }
    });
    if (existing) {
      throw new Error(`SLUG_TAKEN: The space slug "${sanitizedSlug}" is already taken.`);
    }

    if (user.tier === BillingTier.FREE) {
      const count = await this.prisma.space.count({
        where: { userId: user.id }
      });
      if (count >= 1) {
        throw new Error('LIMIT_REACHED: Your Free plan is limited to 1 space. Please upgrade to Pro to unlock unlimited spaces.');
      }
    }

    return this.prisma.space.create({
      data: {
        name: input.name,
        slug: sanitizedSlug,
        headerTitle: input.headerTitle,
        customMessage: input.customMessage,
        logoUrl: input.logoUrl,
        collectVideo: input.collectVideo ?? true,
        collectText: input.collectText ?? true,
        theme: input.theme ?? 'light',
        showBranding: user.tier === BillingTier.FREE ? true : (input.showBranding ?? true),
        customDomain: input.customDomain,
        userId: user.id
      }
    });
  }

  async updateSpace(id: string, input: UpdateSpaceInput) {
    // Require Owner or Admin role to edit settings
    await this.ensureSpaceAccess(id, ['OWNER', SpaceRole.ADMIN]);

    const user = this.ensureAuthenticated();
    const data: any = {};
    if (input.name !== undefined) data.name = input.name;
    if (input.headerTitle !== undefined) data.headerTitle = input.headerTitle;
    if (input.customMessage !== undefined) data.customMessage = input.customMessage;
    if (input.logoUrl !== undefined) data.logoUrl = input.logoUrl;
    if (input.collectVideo !== undefined) data.collectVideo = input.collectVideo;
    if (input.collectText !== undefined) data.collectText = input.collectText;
    if (input.theme !== undefined) data.theme = input.theme;
    if (input.showBranding !== undefined) {
      if (user.tier === BillingTier.FREE && input.showBranding === false) {
        throw new Error('PRO_FEATURE: Removing Proofly branding is only available on the PRO or BUSINESS plans.');
      }
      data.showBranding = input.showBranding ?? true;
    }
    if (input.customDomain !== undefined) {
      if (user.tier !== BillingTier.BUSINESS && user.tier !== BillingTier.ENTERPRISE && input.customDomain) {
        throw new Error('BUSINESS_FEATURE: Custom domains are only available on the BUSINESS or ENTERPRISE plans.');
      }
      data.customDomain = input.customDomain;
    }

    return this.prisma.space.update({
      where: { id },
      data
    });
  }

  async deleteSpace(id: string) {
    // Only Owner can delete the entire space
    await this.ensureSpaceAccess(id, ['OWNER']);

    await this.prisma.space.delete({ where: { id } });
    return true;
  }

  async createWebhook(spaceId: string, url: string) {
    // Require Owner, Admin or Manager
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER]);

    const user = this.ensureAuthenticated();
    if (user.tier === BillingTier.FREE) {
      throw new Error('PRO_FEATURE: Webhooks are only available on PRO, BUSINESS, or ENTERPRISE plans.');
    }

    const sub = await this.prisma.webhookSubscription.create({
      data: {
        spaceId,
        targetUrl: url,
        events: 'testimonial.created',
        secret: 'legacy-secret',
        status: 'ACTIVE'
      }
    });

    return {
      id: sub.id,
      url: sub.targetUrl,
      isActive: sub.status === 'ACTIVE',
      createdAt: sub.createdAt
    };
  }

  async deleteWebhook(id: string) {
    const webhook = await this.prisma.webhookSubscription.findUnique({
      where: { id },
      include: { space: true }
    });
    if (!webhook) {
      throw new Error('WEBHOOK_NOT_FOUND');
    }

    // Require Owner, Admin or Manager of the associated space
    await this.ensureSpaceAccess(webhook.spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER]);

    await this.prisma.webhookSubscription.delete({ where: { id } });
    return true;
  }

  // Teammate Workspace Invitations
  async inviteToWorkspace(spaceId: string, email: string, role: SpaceRole) {
    // Only Owner or Admin can send invites
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);
    const user = this.ensureAuthenticated();

    const sanitizedEmail = email.toLowerCase().trim();

    // Check if space exists
    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new Error('SPACE_NOT_FOUND: Workspace not found.');
    }

    // Check if already the owner
    if (space.userId === user.id && sanitizedEmail === user.email) {
      throw new Error('ALREADY_OWNER: You are the owner of this workspace.');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.spaceMember.findFirst({
      where: {
        spaceId,
        user: { email: sanitizedEmail }
      }
    });
    if (existingMember) {
      throw new Error('ALREADY_MEMBER: This user is already a member of this workspace.');
    }

    // Clean old invites for this email + space
    await this.prisma.workspaceInvitation.deleteMany({
      where: { spaceId, email: sanitizedEmail }
    });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.prisma.workspaceInvitation.create({
      data: {
        spaceId,
        email: sanitizedEmail,
        role,
        token,
        invitedBy: user.id,
        expiresAt
      }
    });

    // Send Invite Email
    await this.emailService.sendWorkspaceInvitationEmail(sanitizedEmail, space.name, role, user.name, token, this.getClientUrl());

    return true;
  }

  async acceptWorkspaceInvitation(token: string) {
    const user = this.ensureAuthenticated();

    const invitation = await this.prisma.workspaceInvitation.findUnique({
      where: { token },
      include: { space: true }
    });

    if (!invitation) {
      throw new Error('INVALID_TOKEN: Invitation is invalid or has already been accepted.');
    }

    if (invitation.expiresAt < new Date()) {
      await this.prisma.workspaceInvitation.delete({ where: { token } });
      throw new Error('EXPIRED_TOKEN: This workspace invitation has expired.');
    }

    if (invitation.email !== user.email) {
      throw new Error('INVITATION_EMAIL_MISMATCH: This invitation was sent to a different email address. Please log in with the correct account.');
    }

    // Create member entry
    await this.prisma.spaceMember.create({
      data: {
        spaceId: invitation.spaceId,
        userId: user.id,
        role: invitation.role
      }
    });

    // Clean invitation
    await this.prisma.workspaceInvitation.delete({ where: { token } });

    return true;
  }

  async getWorkspaceInvitations(spaceId: string) {
    // Require member access to view invitations
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER, SpaceRole.VIEWER]);
    return this.prisma.workspaceInvitation.findMany({
      where: { spaceId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getWorkspaceMembers(spaceId: string) {
    // Require member access to view teammates list
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER, SpaceRole.VIEWER]);

    const space = await this.prisma.space.findUnique({
      where: { id: spaceId },
      include: { user: true }
    });
    if (!space) {
      throw new Error('SPACE_NOT_FOUND');
    }

    // Retrieve active invited space members
    const members = await this.prisma.spaceMember.findMany({
      where: { spaceId },
      include: { user: true }
    });

    // Map owner as a member entry in response list
    const ownerEntry = {
      id: 'owner-entry',
      spaceId,
      userId: space.userId,
      role: 'OWNER' as const,
      user: space.user
    };

    return [ownerEntry, ...members];
  }

  async removeWorkspaceMember(memberId: string) {
    const member = await this.prisma.spaceMember.findUnique({
      where: { id: memberId }
    });
    if (!member) {
      throw new Error('MEMBER_NOT_FOUND: The specified teammate was not found.');
    }

    // Require Owner or Admin role of space
    await this.ensureSpaceAccess(member.spaceId, ['OWNER', SpaceRole.ADMIN]);

    await this.prisma.spaceMember.delete({ where: { id: memberId } });
    return true;
  }
}
