import { BaseService } from './BaseService';
import { BillingTier } from '@prisma/client';

export interface CreateCampaignInput {
  spaceId: string;
  subject: string;
  emailBody: string;
  recipients: string[];
}

export class CampaignService extends BaseService {
  async getCampaigns(spaceId: string) {
    const user = this.ensureAuthenticated();
    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new Error('SPACE_NOT_FOUND');
    }
    if (space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own this space.');
    }

    return this.prisma.campaign.findMany({
      where: { spaceId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getCampaignById(id: string) {
    const user = this.ensureAuthenticated();
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: { space: true }
    });
    if (!campaign) {
      throw new Error('CAMPAIGN_NOT_FOUND');
    }
    if (campaign.space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own the space associated with this campaign.');
    }

    return campaign;
  }

  async createCampaign(input: CreateCampaignInput) {
    const user = this.ensureAuthenticated();
    const space = await this.prisma.space.findUnique({ where: { id: input.spaceId } });
    if (!space) {
      throw new Error('SPACE_NOT_FOUND');
    }
    if (space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own this space.');
    }

    // Campaigns require at least Pro plan
    if (user.tier === BillingTier.FREE) {
      throw new Error('PRO_FEATURE: Email request campaigns are only available on PRO, BUSINESS, or ENTERPRISE plans.');
    }

    if (input.recipients.length === 0) {
      throw new Error('INVALID_INPUT: You must specify at least one recipient email.');
    }

    if (input.recipients.length > 50) {
      throw new Error('LIMIT_EXCEEDED: You can send to a maximum of 50 recipients per campaign in this demo.');
    }

    return this.prisma.campaign.create({
      data: {
        spaceId: input.spaceId,
        subject: input.subject,
        emailBody: input.emailBody,
        recipients: input.recipients,
        sentCount: 0
      }
    });
  }

  async sendCampaign(id: string) {
    const user = this.ensureAuthenticated();
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: { space: true }
    });
    if (!campaign) {
      throw new Error('CAMPAIGN_NOT_FOUND');
    }
    if (campaign.space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own the space associated with this campaign.');
    }

    // Simulate sending emails to each recipient
    console.log(`[Campaign Service] Dispatching campaign "${campaign.subject}" to ${campaign.recipients.length} recipients...`);
    
    for (const email of campaign.recipients) {
      const personalCollectLink = `https://testimonial.to/space/${campaign.space.slug}?email=${encodeURIComponent(email)}`;
      const formattedBody = campaign.emailBody.includes('{link}') 
        ? campaign.emailBody.replace(/{link}/g, personalCollectLink) 
        : `${campaign.emailBody}\n\nSubmit your testimonial here: ${personalCollectLink}`;

      // Logs out mock email send to terminal
      console.log(`
------------------------------------------------------------
[SIMULATED SMTP EMAIL SEND]
To: ${email}
Subject: ${campaign.subject}
Body:
${formattedBody}
------------------------------------------------------------
      `);
    }

    return this.prisma.campaign.update({
      where: { id },
      data: {
        sentCount: campaign.recipients.length
      }
    });
  }
}
