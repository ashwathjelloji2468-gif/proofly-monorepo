import { BaseService } from './BaseService';
import { SpaceRole } from '@prisma/client';

export class MobileNotificationService extends BaseService {
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

  // --- ACTIONS ---
  async getNotifications(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER]);
    return this.prisma.inAppNotification.findMany({
      where: { spaceId },
      orderBy: { createdAt: 'desc' },
      take: 50
    });
  }

  async getUnreadCount(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER]);
    return this.prisma.inAppNotification.count({
      where: { spaceId, status: 'UNREAD' }
    });
  }

  async markAsRead(id: string) {
    const notification = await this.prisma.inAppNotification.findUnique({ where: { id } });
    if (!notification) throw new Error('NOT_FOUND: Notification not found.');
    await this.ensureSpaceAccess(notification.spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER]);

    await this.prisma.inAppNotification.update({
      where: { id },
      data: { status: 'READ' }
    });

    return true;
  }

  async markAllRead(spaceId: string) {
    await this.ensureSpaceAccess(spaceId, ['OWNER', SpaceRole.ADMIN, SpaceRole.MANAGER, SpaceRole.MEMBER]);
    
    await this.prisma.inAppNotification.updateMany({
      where: { spaceId, status: 'UNREAD' },
      data: { status: 'READ' }
    });

    return true;
  }

  async createNotification(spaceId: string, title: string, description: string, category: string) {
    // Generate notification (system trigger call, bypassed auth checks so events sync instantly)
    return this.prisma.inAppNotification.create({
      data: {
        spaceId,
        title,
        description,
        category: category.toUpperCase()
      }
    });
  }
}
