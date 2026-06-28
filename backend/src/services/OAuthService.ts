import { PrismaClient, BillingTier } from '@prisma/client';
import { SessionService } from './SessionService';
import bcrypt from 'bcrypt';

export class OAuthService {
  constructor(
    private prisma: PrismaClient,
    private sessionService: SessionService
  ) {}

  async googleLogin(code: string, userAgent: string | null, ipAddress: string | null) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('GOOGLE_AUTH_NOT_CONFIGURED: Google OAuth environment variables are missing.');
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      }).toString()
    });

    if (!tokenResponse.ok) {
      const errText = await tokenResponse.text();
      throw new Error(`Google token exchange failed: ${errText}`);
    }

    const tokenData = (await tokenResponse.json()) as any;
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error(`Google token exchange response did not contain access token: ${JSON.stringify(tokenData)}`);
    }

    // Fetch user profile from Google UserInfo endpoint
    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile from Google');
    }

    const profile = (await profileResponse.json()) as any;
    const email = profile.email;
    const name = profile.name || 'Google User';
    const googleUserId = profile.id;

    if (!email || !googleUserId) {
      throw new Error('No email address or unique ID returned from Google OAuth.');
    }

    const sanitizedEmail = email.toLowerCase().trim();
    let user = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });

    if (!user) {
      // Create new user (mark as verified, provider GOOGLE, hasPassword = false)
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const passwordHash = await bcrypt.hash(randomPassword, 12);

      user = await this.prisma.user.create({
        data: {
          email: sanitizedEmail,
          name,
          passwordHash,
          tier: BillingTier.FREE,
          isVerified: true,
          provider: 'GOOGLE',
          hasPassword: false
        }
      });
    }

    // Check if user has an OAuthAccount mapping for GOOGLE already
    const oauthMap = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: 'GOOGLE',
          providerUserId: googleUserId
        }
      }
    });

    if (!oauthMap) {
      // Link Google account mapping
      await this.prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: 'GOOGLE',
          providerUserId: googleUserId,
          metadata: { profileUrl: profile.picture || '' }
        }
      });

      // Write link audit log
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LINK_GOOGLE_ACCOUNT'
        }
      });
    }

    // Create secure login session
    const { session, accessToken: jwtAccess, refreshToken: jwtRefresh } = await this.sessionService.createSession(
      user.id,
      userAgent,
      ipAddress
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      session,
      accessToken: jwtAccess,
      refreshToken: jwtRefresh,
      user: userWithoutPassword
    };
  }

  async githubLogin(code: string, userAgent: string | null, ipAddress: string | null) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;
    const redirectUri = process.env.GITHUB_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('GITHUB_AUTH_NOT_CONFIGURED: GitHub OAuth environment variables are missing.');
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
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

    // Fetch user profile from GitHub API
    const profileResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'proofly-backend'
      }
    });

    if (!profileResponse.ok) {
      throw new Error('Failed to fetch user profile from GitHub');
    }

    const userProfile = (await profileResponse.json()) as any;
    const githubUserId = userProfile.id.toString();

    // Fetch verified emails
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
      // Create new user (mark as verified, provider GITHUB, hasPassword = false)
      const name = userProfile.name || userProfile.login || 'GitHub User';
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const passwordHash = await bcrypt.hash(randomPassword, 12);

      user = await this.prisma.user.create({
        data: {
          email: sanitizedEmail,
          name,
          passwordHash,
          tier: BillingTier.FREE,
          isVerified: true,
          provider: 'GITHUB',
          hasPassword: false
        }
      });
    }

    // Check if user has an OAuthAccount mapping for GITHUB already
    const oauthMap = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerUserId: {
          provider: 'GITHUB',
          providerUserId: githubUserId
        }
      }
    });

    if (!oauthMap) {
      // Link GitHub account mapping
      await this.prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: 'GITHUB',
          providerUserId: githubUserId,
          metadata: { profileUrl: userProfile.html_url || '' }
        }
      });

      // Write link audit log
      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'LINK_GITHUB_ACCOUNT'
        }
      });
    }

    // Create secure login session
    const { session, accessToken: jwtAccess, refreshToken: jwtRefresh } = await this.sessionService.createSession(
      user.id,
      userAgent,
      ipAddress
    );

    const { passwordHash: _, ...userWithoutPassword } = user;
    return {
      session,
      accessToken: jwtAccess,
      refreshToken: jwtRefresh,
      user: userWithoutPassword
    };
  }
}
