import bcrypt from 'bcrypt';
import { BaseService } from './BaseService';
import { BillingTier, PrismaClient, User } from '@prisma/client';
import { EmailService } from './EmailService';
import { SessionService } from './SessionService';
import crypto from 'crypto';

function validatePasswordStrength(password: string) {
  if (password.length < 8) {
    throw new Error('WEAK_PASSWORD: Password must be at least 8 characters long.');
  }
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasUppercase || !hasLowercase || !hasNumber || !hasSpecial) {
    throw new Error('WEAK_PASSWORD: Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.');
  }
}

export class UserService extends BaseService {
  private emailService: EmailService;
  private sessionService: SessionService;

  constructor(
    prisma: PrismaClient,
    currentUser: Omit<User, 'passwordHash'> | null,
    emailService: EmailService,
    sessionService: SessionService
  ) {
    super(prisma, currentUser);
    this.emailService = emailService;
    this.sessionService = sessionService;
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

    validatePasswordStrength(passwordHashRaw);

    const existing = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (existing) {
      throw new Error('EMAIL_TAKEN: An account with this email already exists.');
    }

    const passwordHash = await bcrypt.hash(passwordHashRaw, 12);

    const user = await this.prisma.user.create({
      data: {
        email: sanitizedEmail,
        name,
        passwordHash,
        tier: BillingTier.FREE,
        isVerified: false, // Must verify email
        provider: 'EMAIL',
        hasPassword: true
      }
    });

    // Create verification token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.prisma.verificationToken.create({
      data: {
        email: sanitizedEmail,
        token,
        expiresAt
      }
    });

    // Send verification email
    await this.emailService.sendVerificationEmail(sanitizedEmail, name, token, this.getClientUrl());

    // Write audit log
    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SIGNUP_USER'
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      token: '', // Do not log in until verified
      user: userWithoutPassword
    };
  }

  async login(email: string, passwordHashRaw: string, userAgent: string | null = null, ipAddress: string | null = null) {
    if (!email || !passwordHashRaw) {
      throw new Error('MISSING_FIELDS: Email and password are required.');
    }

    const sanitizedEmail = email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (!user) {
      throw new Error('INVALID_CREDENTIALS: User not found or password incorrect.');
    }

    // Check account Lockout
    if (user.lockoutUntil && user.lockoutUntil > new Date()) {
      throw new Error('ACCOUNT_LOCKED: Too many failed login attempts. Your account is locked for 15 minutes.');
    }

    if (user.status === 'DISABLED') {
      throw new Error('ACCOUNT_DISABLED: Your account has been disabled. Please contact support.');
    }

    if (!user.hasPassword) {
      throw new Error(`OAUTH_ACCOUNT: This account was created using ${user.provider}. Please continue with ${user.provider} or set a password first.`);
    }

    const valid = await bcrypt.compare(passwordHashRaw, user.passwordHash);
    if (!valid) {
      // Increment failed attempts
      const attempts = user.failedLoginAttempts + 1;
      const lockoutUntil = attempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null;
      
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: attempts,
          lockoutUntil
        }
      });

      await this.prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress,
          userAgent,
          status: attempts >= 5 ? 'FAIL_LOCKED' : 'FAIL_PASSWORD'
        }
      });

      if (attempts >= 5) {
        throw new Error('ACCOUNT_LOCKED: Too many failed login attempts. Your account has been locked for 15 minutes.');
      } else {
        throw new Error('INVALID_CREDENTIALS: User not found or password incorrect.');
      }
    }

    if (!user.isVerified) {
      throw new Error('EMAIL_NOT_VERIFIED: Please verify your email to log in.');
    }

    // Reset failed login attempts and create active session
    const { accessToken, refreshToken } = await this.sessionService.createSession(
      user.id,
      userAgent,
      ipAddress
    );

    // Write login history log
    await this.prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent,
        status: 'SUCCESS'
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      accessToken,
      refreshToken,
      user: userWithoutPassword
    };
  }

  async verifyEmail(token: string, userAgent: string | null = null, ipAddress: string | null = null) {
    const record = await this.prisma.verificationToken.findUnique({ where: { token } });
    if (!record) {
      throw new Error('INVALID_TOKEN: Verification token is invalid.');
    }

    if (record.expiresAt < new Date()) {
      await this.prisma.verificationToken.delete({ where: { token } });
      throw new Error('EXPIRED_TOKEN: Verification token has expired.');
    }

    const user = await this.prisma.user.findUnique({ where: { email: record.email } });
    if (!user) {
      throw new Error('USER_NOT_FOUND: User no longer exists.');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true }
    });

    await this.emailService.sendWelcomeEmail(record.email, user.name);
    await this.prisma.verificationToken.delete({ where: { token } });

    // Establish secure session
    const { accessToken, refreshToken } = await this.sessionService.createSession(
      user.id,
      userAgent,
      ipAddress
    );

    await this.prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'VERIFY_EMAIL'
      }
    });

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;

    return {
      accessToken,
      refreshToken,
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
    
    if (!user) {
      return {
        email: sanitizedEmail,
        message: 'If the email matches an account, we have sent a reset code.'
      };
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

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
    validatePasswordStrength(passwordHashRaw);

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
      // Force logout of all active sessions across all devices
      this.prisma.session.updateMany({
        where: { userId: user.id },
        data: { isValid: false }
      }),
      this.prisma.refreshToken.deleteMany({ where: { userId: user.id } })
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

  async setPassword(passwordHashRaw: string) {
    const currentUser = this.ensureAuthenticated();
    
    validatePasswordStrength(passwordHashRaw);

    const passwordHash = await bcrypt.hash(passwordHashRaw, 12);

    await this.prisma.user.update({
      where: { id: currentUser.id },
      data: {
        passwordHash,
        hasPassword: true
      }
    });

    await this.prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'SET_PASSWORD'
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
      const duplicate = await this.prisma.user.findUnique({ where: { email: request.newEmail } });
      if (duplicate) {
        throw new Error('EMAIL_TAKEN: An account with this email already exists.');
      }

      await this.prisma.$transaction([
        this.prisma.user.update({
          where: { id: user.id },
          data: { email: request.newEmail }
        }),
        this.prisma.emailChangeRequest.delete({
          where: { userId: user.id }
        }),
        // Audit log email change
        this.prisma.auditLog.create({
          data: {
            userId: user.id,
            action: 'EMAIL_CHANGED'
          }
        })
      ]);
      return true;
    } else {
      await this.prisma.emailChangeRequest.update({
        where: { userId: user.id },
        data: {
          oldVerified: updatedOldVerified,
          newVerified: updatedNewVerified
        }
      });
      return false;
    }
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
