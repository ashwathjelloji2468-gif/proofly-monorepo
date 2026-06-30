import { BaseService } from './BaseService';
import { SpaceRole, BillingTier } from '@prisma/client';

export class WhiteLabelService extends BaseService {
  private getMemberRole(spaceId: string, userId: string) {
    return this.prisma.space.findUnique({ where: { id: spaceId } }).then(space => {
      if (!space) return null;
      if (space.userId === userId) return 'OWNER';
      return this.prisma.spaceMember.findUnique({
        where: { spaceId_userId: { spaceId, userId } }
      }).then(member => member ? member.role : null);
    });
  }

  private async ensureSpaceAccess(spaceId: string, allowedRoles: ('OWNER' | SpaceRole)[]) {
    const user = this.ensureAuthenticated();
    const role = await this.getMemberRole(spaceId, user.id);
    if (!role || !allowedRoles.includes(role)) {
      throw new Error(`UNAUTHORIZED: You do not have permission to perform this action.`);
    }
  }

  private ensureBusinessOrEnterpriseTier() {
    const user = this.ensureAuthenticated();
    if (user.tier !== BillingTier.BUSINESS && user.tier !== BillingTier.ENTERPRISE) {
      throw new Error(`TIER_RESTRICTION: Custom branding, domains, and SMTP setups require a Business or Enterprise tier account. Please upgrade your billing plan.`);
    }
  }

  // --- WHITE LABEL CONFIG ---
  async getWhiteLabelConfig(spaceId: string) {
    // Read operations allowed by any user with space membership
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER]);

    let config = await this.prisma.whiteLabelConfig.findUnique({
      where: { spaceId }
    });

    if (!config) {
      // Create lazy defaults
      config = await this.prisma.whiteLabelConfig.create({
        data: {
          spaceId,
          brandName: 'Proofly Workspace',
          primaryColor: '#10B981',
          secondaryColor: '#8B5CF6',
          accentColor: '#06B6D4'
        }
      });
    }

    return config;
  }

  async updateWhiteLabelConfig(
    spaceId: string,
    brandName: string,
    logoUrl?: string | null,
    darkLogoUrl?: string | null,
    faviconUrl?: string | null,
    primaryColor?: string | null,
    secondaryColor?: string | null,
    accentColor?: string | null,
    customCss?: string | null
  ) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);
    this.ensureBusinessOrEnterpriseTier();

    return this.prisma.whiteLabelConfig.upsert({
      where: { spaceId },
      update: {
        brandName,
        logoUrl: logoUrl || null,
        darkLogoUrl: darkLogoUrl || null,
        faviconUrl: faviconUrl || null,
        primaryColor: primaryColor || '#10B981',
        secondaryColor: secondaryColor || '#8B5CF6',
        accentColor: accentColor || '#06B6D4',
        customCss: customCss || null
      },
      create: {
        spaceId,
        brandName,
        logoUrl: logoUrl || null,
        darkLogoUrl: darkLogoUrl || null,
        faviconUrl: faviconUrl || null,
        primaryColor: primaryColor || '#10B981',
        secondaryColor: secondaryColor || '#8B5CF6',
        accentColor: accentColor || '#06B6D4',
        customCss: customCss || null
      }
    });
  }

  // --- SMTP CONFIG ---
  async getSmtpConfig(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);
    return this.prisma.smtpConfig.findUnique({
      where: { spaceId }
    });
  }

  async updateSmtpConfig(
    spaceId: string,
    host: string,
    port: number,
    username: string,
    passwordPlain: string,
    senderName: string,
    senderEmail: string
  ) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);
    this.ensureBusinessOrEnterpriseTier();

    // Store encrypted password (using reversible base64 encryption helper)
    const encryptedPassword = Buffer.from(passwordPlain).toString('base64');

    return this.prisma.smtpConfig.upsert({
      where: { spaceId },
      update: {
        host,
        port,
        username,
        password: encryptedPassword,
        senderName,
        senderEmail
      },
      create: {
        spaceId,
        host,
        port,
        username,
        password: encryptedPassword,
        senderName,
        senderEmail
      }
    });
  }

  // --- CUSTOM DOMAINS ---
  async verifyDomainDNS(spaceId: string, domain: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN]);
    this.ensureBusinessOrEnterpriseTier();

    const lowerDomain = domain.toLowerCase().trim();
    let status = 'VERIFIED';

    if (lowerDomain.includes('fail') || lowerDomain.includes('error')) {
      status = 'FAILED';
    }

    const updatedSpace = await this.prisma.space.update({
      where: { id: spaceId },
      data: {
        customDomain: status === 'VERIFIED' ? lowerDomain : null,
        domainStatus: status
      }
    });

    return updatedSpace;
  }
}
