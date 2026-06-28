import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { BaseService } from './BaseService';
import { BillingTier, PrismaClient, User } from '@prisma/client';
import { EmailService } from './EmailService';
import crypto from 'crypto';

export class UserService extends BaseService {
  private emailService: EmailService;

  constructor(prisma: PrismaClient, currentUser: Omit<User, 'passwordHash'> | null, emailService: EmailService) {
    super(prisma, currentUser);
    this.emailService = emailService;
  }

  private getJwtSecret(): string {
    return process.env.JWT_SECRET || 'super-secret-key-change-in-production';
  }

  private generateToken(userId: string, email: string): string {
    return jwt.sign({ id: userId, email }, this.getJwtSecret(), {
      expiresIn: '7d'
    });
  }

  private getClientUrl(): string {
    return process.env.CLIENT_URL || 'http://localhost:3000';
  }

  async signup(email: string, name: string, passwordHashRaw: string) {
    if (!email || !name || !passwordHashRaw) {
      throw new Error('MISSING_FIELDS: All fields (email, name, password) are required.');
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      throw new Error('INVALID_EMAIL_FORMAT: Please provide a valid email address.');
    }

    if (passwordHashRaw.length < 6) {
      throw new Error('WEAK_PASSWORD: Password must be at least 6 characters.');
    }

    const existing = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (existing) {
      throw new Error('USER_EXISTS: An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(passwordHashRaw, 12);
    
    // Create unverified user
    const user = await this.prisma.user.create({
      data: {
        email: sanitizedEmail,
        name,
        passwordHash,
        tier: BillingTier.FREE,
        isVerified: false
      }
    });

    // Create verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry
    await this.prisma.verificationToken.create({
      data: {
        email: sanitizedEmail,
        token,
        expiresAt
      }
    });

    // Send Verification Email
    await this.emailService.sendVerificationEmail(sanitizedEmail, name, token, this.getClientUrl());

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'REGISTER_USER',
        ipAddress: 'local',
        deviceInfo: 'web'
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      token: '', // No token generated until they verify
      user: userWithoutPassword
    };
  }

  async login(email: string, passwordHashRaw: string) {
    if (!email || !passwordHashRaw) {
      throw new Error('MISSING_FIELDS: Email and password are required.');
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (!user) {
      throw new Error('INVALID_CREDENTIALS: User not found or password incorrect.');
    }

    if (user.status === 'DISABLED') {
      throw new Error('ACCOUNT_DISABLED: Your account has been disabled. Please contact support.');
    }

    const valid = await bcrypt.compare(passwordHashRaw, user.passwordHash);
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS: User not found or password incorrect.');
    }

    if (!user.isVerified) {
      throw new Error('EMAIL_NOT_VERIFIED: Please verify your email to log in.');
    }

    const token = this.generateToken(user.id, user.email);

    // Track user session
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'LOGIN_USER'
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  }

  async verifyEmail(token: string) {
    const record = await this.prisma.verificationToken.findUnique({
      where: { token }
    });

    if (!record) {
      throw new Error('INVALID_TOKEN: The verification link is invalid or has already been used.');
    }

    if (record.expiresAt < new Date()) {
      await this.prisma.verificationToken.delete({ where: { id: record.id } });
      throw new Error('EXPIRED_TOKEN: The verification link has expired.');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: record.email }
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND: User associated with this token does not exist.');
    }

    // Update user verified state
    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true }
    });

    // Send Welcome Email
    await this.emailService.sendWelcomeEmail(record.email, user.name);

    // Invalidate verification token
    await this.prisma.verificationToken.delete({ where: { id: record.id } });

    // Track Session & Log audit
    const sessionToken = this.generateToken(user.id, user.email);
    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        token: sessionToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'VERIFY_EMAIL'
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;

    return {
      token: sessionToken,
      user: userWithoutPassword
    };
  }

  async resendVerificationEmail(email: string) {
    const sanitizedEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (!user) {
      throw new Error('USER_NOT_FOUND: No user found with this email.');
    }

    if (user.isVerified) {
      throw new Error('ALREADY_VERIFIED: Your account email is already verified.');
    }

    // Clean old tokens
    await this.prisma.verificationToken.deleteMany({ where: { email: sanitizedEmail } });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.prisma.verificationToken.create({
      data: {
        email: sanitizedEmail,
        token,
        expiresAt
      }
    });

    await this.emailService.sendVerificationEmail(sanitizedEmail, user.name, token, this.getClientUrl());
    return true;
  }

  async requestPasswordReset(email: string) {
    const sanitizedEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });
    
    // Safety check to prevent user enumeration attacks:
    // If user is not found, return success dummy but do not send email
    if (!user) {
      return {
        email: sanitizedEmail,
        message: 'If the email matches an account, we have sent a reset code.'
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Delete old OTPs
    await this.prisma.oTPToken.deleteMany({ where: { userId: user.id } });

    await this.prisma.oTPToken.create({
      data: {
        userId: user.id,
        otpHash,
        expiresAt
      }
    });

    await this.emailService.sendPasswordResetOTPEmail(sanitizedEmail, user.name, otp);

    return {
      email: sanitizedEmail,
      message: 'A 6-digit verification code has been sent to your email.'
    };
  }

  async verifyOTP(email: string, otp: string) {
    const sanitizedEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (!user) {
      throw new Error('INVALID_CREDENTIALS: User not found.');
    }

    const otpToken = await this.prisma.oTPToken.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpToken) {
      throw new Error('NO_OTP_REQUESTED: Please request a password reset code first.');
    }

    if (otpToken.attempts >= 5) {
      throw new Error('MAX_ATTEMPTS_EXCEEDED: Too many incorrect attempts. Please request a new code.');
    }

    if (otpToken.expiresAt < new Date()) {
      throw new Error('OTP_EXPIRED: The verification code has expired.');
    }

    const valid = await bcrypt.compare(otp, otpToken.otpHash);
    if (!valid) {
      await this.prisma.oTPToken.update({
        where: { id: otpToken.id },
        data: { attempts: otpToken.attempts + 1 }
      });
      throw new Error('INVALID_OTP: The verification code is incorrect.');
    }

    // Valid OTP! Create a temporary reset token (expires in 15 minutes)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt
      }
    });

    // Delete OTP
    await this.prisma.oTPToken.delete({ where: { id: otpToken.id } });

    return resetToken;
  }

  async resetPassword(email: string, token: string, passwordHashRaw: string) {
    if (passwordHashRaw.length < 6) {
      throw new Error('WEAK_PASSWORD: Password must be at least 6 characters.');
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (!user) {
      throw new Error('USER_NOT_FOUND: User not found.');
    }

    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token }
    });

    if (!resetToken || resetToken.userId !== user.id) {
      throw new Error('INVALID_TOKEN: Password reset token is invalid.');
    }

    if (resetToken.expiresAt < new Date()) {
      await this.prisma.passwordResetToken.delete({ where: { token } });
      throw new Error('EXPIRED_TOKEN: Password reset token has expired.');
    }

    const newPasswordHash = await bcrypt.hash(passwordHashRaw, 12);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newPasswordHash }
      }),
      this.prisma.passwordResetToken.delete({ where: { token } }),
      // Force logout of all active sessions
      this.prisma.userSession.deleteMany({ where: { userId: user.id } })
    ]);

    await this.emailService.sendPasswordChangedEmail(sanitizedEmail, user.name);

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'RESET_PASSWORD'
      }
    });

    return true;
  }

  async requestEmailChange(newEmail: string) {
    const user = this.ensureAuthenticated();
    const sanitizedNewEmail = newEmail.toLowerCase().trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedNewEmail)) {
      throw new Error('INVALID_EMAIL_FORMAT: Please provide a valid email address.');
    }

    if (sanitizedNewEmail === user.email) {
      throw new Error('SAME_EMAIL: New email address cannot be the same as your current address.');
    }

    const duplicate = await this.prisma.user.findUnique({ where: { email: sanitizedNewEmail } });
    if (duplicate) {
      throw new Error('EMAIL_TAKEN: An account with this email already exists.');
    }

    const oldToken = crypto.randomBytes(32).toString('hex');
    const newToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    await this.prisma.emailChangeRequest.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        oldEmail: user.email,
        newEmail: sanitizedNewEmail,
        oldToken,
        newToken,
        expiresAt
      },
      update: {
        oldEmail: user.email,
        newEmail: sanitizedNewEmail,
        oldToken,
        newToken,
        oldVerified: false,
        newVerified: false,
        expiresAt
      }
    });

    // Send verification emails to both the current and the target email address
    await this.emailService.sendEmailChangeVerificationEmail(user.email, user.name, oldToken, false, this.getClientUrl());
    await this.emailService.sendEmailChangeVerificationEmail(sanitizedNewEmail, user.name, newToken, true, this.getClientUrl());

    return true;
  }

  async verifyEmailChangeToken(token: string) {
    const user = this.ensureAuthenticated();
    const request = await this.prisma.emailChangeRequest.findUnique({
      where: { userId: user.id }
    });

    if (!request) {
      throw new Error('NO_REQUEST: No active email change request found for your account.');
    }

    if (request.expiresAt < new Date()) {
      await this.prisma.emailChangeRequest.delete({ where: { id: request.id } });
      throw new Error('EXPIRED_TOKEN: The email change verification link has expired.');
    }

    let updatedOldVerified = request.oldVerified;
    let updatedNewVerified = request.newVerified;

    if (token === request.oldToken) {
      updatedOldVerified = true;
    } else if (token === request.newToken) {
      updatedNewVerified = true;
    } else {
      throw new Error('INVALID_TOKEN: Invalid email change verification token.');
    }

    if (updatedOldVerified && updatedNewVerified) {
      // Check duplicate one final time before committing change
      const duplicate = await this.prisma.user.findUnique({ where: { email: request.newEmail } });
      if (duplicate) {
        throw new Error('EMAIL_TAKEN: An account with this email already exists.');
      }

      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: user.id },
          data: { email: request.newEmail }
        }),
        this.prisma.emailChangeRequest.delete({ where: { id: request.id } })
      ]);

      await this.prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'CHANGE_EMAIL'
        }
      });

      return true;
    } else {
      await this.prisma.emailChangeRequest.update({
        where: { id: request.id },
        data: {
          oldVerified: updatedOldVerified,
          newVerified: updatedNewVerified
        }
      });
      return false; // Still waiting for the other confirmation
    }
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
      const passwordHash = await bcrypt.hash(randomPassword, 12);

      user = await this.prisma.user.create({
        data: {
          email: sanitizedEmail,
          name,
          passwordHash,
          tier: BillingTier.FREE,
          isVerified: true // OAuth users auto verified
        }
      });
    }

    const token = this.generateToken(user.id, user.email);

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  }

  async googleLogin(code: string, redirectUri: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new Error('GOOGLE_AUTH_NOT_CONFIGURED: Google Client ID or Secret is not configured in environment variables.');
    }

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

    if (!email) {
      throw new Error('No email address returned from Google OAuth.');
    }

    const sanitizedEmail = email.toLowerCase().trim();
    let user = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });

    if (!user) {
      const randomPassword = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const passwordHash = await bcrypt.hash(randomPassword, 12);

      user = await this.prisma.user.create({
        data: {
          email: sanitizedEmail,
          name,
          passwordHash,
          tier: BillingTier.FREE,
          isVerified: true // OAuth users auto verified
        }
      });
    }

    const token = this.generateToken(user.id, user.email);

    await this.prisma.userSession.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      token,
      user: userWithoutPassword
    };
  }

  async getMe() {
    const currentUser = this.ensureAuthenticated();
    const user = await this.prisma.user.findUnique({
      where: { id: currentUser.id }
    });
    if (!user) {
      throw new Error('USER_NOT_FOUND: Current user not found.');
    }
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
