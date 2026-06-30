import { BaseService } from './BaseService';
import { BillingTier } from '@prisma/client';

export class EnterpriseSecurityService extends BaseService {
  private ensureEnterpriseTier() {
    const user = this.ensureAuthenticated();
    if (user.tier !== BillingTier.ENTERPRISE) {
      throw new Error(`TIER_RESTRICTION: Custom RBAC, Organizations, SAML SSO, and IP policies require an active Enterprise plan. Please upgrade your billing plan.`);
    }
  }

  // --- ORGANIZATION ---
  async getOrganization(id: string) {
    let org = await this.prisma.organization.findUnique({
      where: { id },
      include: { spaces: true, teams: true, roles: true, sso: true, ipPolicies: true }
    });

    if (!org) {
      // Lazy default creation
      org = await this.prisma.organization.create({
        data: {
          id,
          name: 'Acme Enterprise Group'
        },
        include: { spaces: true, teams: true, roles: true, sso: true, ipPolicies: true }
      });
    }

    return org;
  }

  async createOrganization(name: string) {
    this.ensureEnterpriseTier();
    return this.prisma.organization.create({
      data: { name }
    });
  }

  async createTeam(organizationId: string, name: string) {
    this.ensureEnterpriseTier();
    return this.prisma.team.create({
      data: { organizationId, name }
    });
  }

  // --- CUSTOM ROLES ---
  async getCustomRoles(organizationId: string) {
    return this.prisma.customRole.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createCustomRole(organizationId: string, name: string, permissions: string) {
    this.ensureEnterpriseTier();
    return this.prisma.customRole.create({
      data: { organizationId, name, permissions }
    });
  }

  // --- SSO CONFIG ---
  async getSsoConfig(organizationId: string) {
    return this.prisma.ssoConfig.findUnique({
      where: { organizationId }
    });
  }

  async updateSsoConfig(organizationId: string, provider: string, entryPoint: string, issuer: string) {
    this.ensureEnterpriseTier();
    return this.prisma.ssoConfig.upsert({
      where: { organizationId },
      update: { provider, entryPoint, issuer },
      create: { organizationId, provider, entryPoint, issuer }
    });
  }

  // --- IP POLICIES ---
  async getIpPolicies(organizationId: string) {
    return this.prisma.ipPolicy.findMany({
      where: { organizationId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createIpPolicy(organizationId: string, cidr: string, type: string) {
    this.ensureEnterpriseTier();
    return this.prisma.ipPolicy.create({
      data: { organizationId, cidr, type }
    });
  }

  async deleteIpPolicy(id: string) {
    this.ensureEnterpriseTier();
    await this.prisma.ipPolicy.delete({ where: { id } });
    return true;
  }

  // --- AUDIT LOGS ---
  async getOrganizationAuditLogs(organizationId: string) {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      include: { spaces: true }
    });

    if (!org) return [];

    // Fetch user audit logs related to these spaces (or generic logs from our AuditLog table)
    return this.prisma.auditLog.findMany({
      take: 40,
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });
  }
}
