import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { BaseService } from './BaseService';
import { BillingTier } from '@prisma/client';

export class UserService extends BaseService {
  private getJwtSecret(): string {
    return process.env.JWT_SECRET || 'super-secret-key-change-in-production';
  }

  private generateToken(userId: string, email: string): string {
    return jwt.sign({ id: userId, email }, this.getJwtSecret(), {
      expiresIn: '7d'
    });
  }

  async signup(email: string, name: string, passwordHashRaw: string) {
    const sanitizedEmail = email.toLowerCase().trim();
    const existing = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (existing) {
      throw new Error('USER_EXISTS: An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(passwordHashRaw, 10);
    const user = await this.prisma.user.create({
      data: {
        email: sanitizedEmail,
        name,
        passwordHash,
        tier: BillingTier.FREE
      }
    });

    const token = this.generateToken(user.id, user.email);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  }

  async login(email: string, passwordHashRaw: string) {
    const sanitizedEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (!user) {
      throw new Error('INVALID_CREDENTIALS: User not found or password incorrect.');
    }

    const valid = await bcrypt.compare(passwordHashRaw, user.passwordHash);
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS: User not found or password incorrect.');
    }

    const token = this.generateToken(user.id, user.email);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  }

  async getMe() {
    const currentUser = this.ensureAuthenticated();
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id },
      include: {
        spaces: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });
    if (!user) throw new Error('USER_NOT_FOUND');
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async updateBillingTier(tier: BillingTier) {
    const currentUser = this.ensureAuthenticated();
    const user = await this.prisma.user.update({
      where: { id: currentUser.id },
      data: { tier }
    });
    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
