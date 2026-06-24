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

  async githubLogin(code: string) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('GITHUB_AUTH_NOT_CONFIGURED: GitHub Client ID or Secret is not configured in environment variables.');
    }

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      throw new Error(`GitHub token exchange failed: ${errText}`);
    }

    const tokenData = (await tokenResponse.json()) as any;
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error(`GitHub token exchange response did not contain access token: ${JSON.stringify(tokenData)}`);
    }

    const userProfileResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'proofly-backend'
      }
    });

    if (!userProfileResponse.ok) {
      throw new Error('Failed to fetch user profile from GitHub');
    }

    const userProfile = (await userProfileResponse.json()) as any;

    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'proofly-backend'
      }
    });

    let email = userProfile.email;

    if (emailsResponse.ok) {
      const emails = (await emailsResponse.json()) as any[];
      const primaryEmail = emails.find(e => e.primary && e.verified);
      if (primaryEmail) {
        email = primaryEmail.email;
      } else if (emails.length > 0) {
        email = emails[0].email;
      }
    }

    if (!email) {
      throw new Error('No verified email address returned from GitHub OAuth.');
    }

    const sanitizedEmail = email.toLowerCase().trim();
    let user = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });

    if (!user) {
      const name = userProfile.name || userProfile.login || 'GitHub User';
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = await this.prisma.user.create({
        data: {
          email: sanitizedEmail,
          name,
          passwordHash,
          tier: BillingTier.FREE
        }
      });
    }

    const token = this.generateToken(user.id, user.email);
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  }
}
