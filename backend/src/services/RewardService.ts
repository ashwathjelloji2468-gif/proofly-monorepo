import { BaseService } from './BaseService';

export interface CreateOrUpdateRewardInput {
  spaceId: string;
  discountCode: string;
  message: string;
}

export class RewardService extends BaseService {
  async getRewardBySpaceId(spaceId: string) {
    return this.prisma.reward.findUnique({
      where: { spaceId }
    });
  }

  async createOrUpdateReward(input: CreateOrUpdateRewardInput) {
    const user = this.ensureAuthenticated();

    const space = await this.prisma.space.findUnique({ where: { id: input.spaceId } });
    if (!space) {
      throw new Error('SPACE_NOT_FOUND');
    }
    if (space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own this space.');
    }

    return this.prisma.reward.upsert({
      where: { spaceId: input.spaceId },
      update: {
        discountCode: input.discountCode.trim().toUpperCase(),
        message: input.message,
        isActive: true
      },
      create: {
        spaceId: input.spaceId,
        discountCode: input.discountCode.trim().toUpperCase(),
        message: input.message,
        isActive: true
      }
    });
  }

  async deleteReward(spaceId: string) {
    const user = this.ensureAuthenticated();

    const space = await this.prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) {
      throw new Error('SPACE_NOT_FOUND');
    }
    if (space.userId !== user.id) {
      throw new Error('UNAUTHORIZED: You do not own this space.');
    }

    const reward = await this.prisma.reward.findUnique({ where: { spaceId } });
    if (!reward) {
      throw new Error('REWARD_NOT_FOUND');
    }

    await this.prisma.reward.delete({ where: { spaceId } });
    return true;
  }
}
