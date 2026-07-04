import { oauthLogger as logger } from '../utils/logger';
import { Router, Request, Response } from 'express';
import { PrismaClient, BillingTier } from '@prisma/client';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { setAuthCookies } from '../security/cookies';
import { hashToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateState(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generatePKCE(): { verifier: string; challenge: string } {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto
    .createHash('sha256')
    .update(verifier)
    .digest('base64url');
  return { verifier, challenge };
}

function getClientUrl(): string {
  return process.env.CLIENT_URL || 'http://localhost:3000';
}

function getGoogleRedirectUri(): string {
  return process.env.GOOGLE_REDIRECT_URI || `${getClientUrl()}/api/auth/callback/google`;
}

function getGithubRedirectUri(): string {
  return process.env.GITHUB_REDIRECT_URI || `${getClientUrl()}/api/auth/callback/github`;
}

async function createUserSession(
  userId: string,
  email: string,
  userAgent: string | null,
  ipAddress: string | null
): Promise<{ accessToken: string; refreshToken: string }> {
  const accessToken = generateAccessToken(userId, email);
  const refreshToken = generateRefreshToken(userId, email);
  const refreshTokenHash = hashToken(refreshToken);

  const session = await prisma.session.create({
    data: {
      userId,
      userAgent,
      ipAddress,
      deviceType: 'Browser',
      isValid: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      userId,
      sessionId: session.id,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  return { accessToken, refreshToken };
}

async function upsertOAuthUser(
  email: string,
  name: string,
  provider: 'GOOGLE' | 'GITHUB',
  providerUserId: string,
  metadata: Record<string, string>
) {
  const sanitizedEmail = email.toLowerCase().trim();
  let user = await prisma.user.findUnique({ where: { email: sanitizedEmail } });

  if (!user) {
    const randomPassword = crypto.randomBytes(32).toString('hex');
    const passwordHash = await bcrypt.hash(randomPassword, 12);
    user = await prisma.user.create({
      data: {
        email: sanitizedEmail,
        name,
        passwordHash,
        tier: BillingTier.FREE,
        isVerified: true,
        provider,
        hasPassword: false,
      },
    });
  }

  // Link OAuth account if not already linked
  const existing = await prisma.oAuthAccount.findUnique({
    where: { provider_providerUserId: { provider, providerUserId } },
  });

  if (!existing) {
    await prisma.oAuthAccount.create({
      data: { userId: user.id, provider, providerUserId, metadata },
    });
    await prisma.auditLog.create({
      data: { userId: user.id, action: `LINK_${provider}_ACCOUNT` },
    });
  }

  return user;
}

// ─── Google OAuth ─────────────────────────────────────────────────────────────

/**
 * GET /auth/google
 * Generates PKCE code_challenge + cryptographic state.
 * Stores verifier + state in a signed HttpOnly cookie.
 * Redirects the user to Google's authorization endpoint.
 */
router.get('/google', (_req: Request, res: Response) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'Google OAuth not configured.' });
  }

  const { verifier, challenge } = generatePKCE();
  const state = generateState();

  // Store state + verifier in a short-lived signed cookie (10 min TTL)
  res.cookie('oauth_state', JSON.stringify({ state, verifier, provider: 'google' }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
    signed: true,
  });

  const redirectUri = getGoogleRedirectUri();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    access_type: 'offline',
    prompt: 'select_account',
  });

  return res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
});

/**
 * GET /auth/google/callback
 * Validates CSRF state, validates PKCE verifier, exchanges code, creates session.
 */
router.get('/google/callback', async (req: Request, res: Response) => {
  const clientUrl = getClientUrl();

  try {
    const { code, state: returnedState, error } = req.query as Record<string, string>;

    if (error) {
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error)}`);
    }

    if (!code || !returnedState) {
      return res.redirect(`${clientUrl}/login?error=missing_params`);
    }

    // Validate CSRF state from signed cookie
    const rawCookie = (req as any).signedCookies?.oauth_state;
    if (!rawCookie) {
      return res.redirect(`${clientUrl}/login?error=state_missing`);
    }

    let oauthSession: { state: string; verifier: string; provider: string };
    try {
      oauthSession = JSON.parse(rawCookie);
    } catch {
      return res.redirect(`${clientUrl}/login?error=state_invalid`);
    }

    if (oauthSession.state !== returnedState || oauthSession.provider !== 'google') {
      return res.redirect(`${clientUrl}/login?error=state_mismatch`);
    }

    // Clear the oauth state cookie immediately (one-time use)
    res.clearCookie('oauth_state');

    const clientId = process.env.GOOGLE_CLIENT_ID!;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    const redirectUri = getGoogleRedirectUri();

    // Exchange authorization code for tokens (with PKCE verifier)
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
        code_verifier: oauthSession.verifier,
      }).toString(),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      logger.error('Google token exchange failed:', err);
      return res.redirect(`${clientUrl}/login?error=token_exchange_failed`);
    }

    const tokenData = (await tokenRes.json()) as any;
    const googleAccessToken = tokenData.access_token;

    if (!googleAccessToken) {
      return res.redirect(`${clientUrl}/login?error=no_access_token`);
    }

    // Fetch user profile
    const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
    });

    if (!profileRes.ok) {
      return res.redirect(`${clientUrl}/login?error=profile_fetch_failed`);
    }

    const profile = (await profileRes.json()) as any;
    const { email, name, id: googleUserId, picture } = profile;

    if (!email || !googleUserId) {
      return res.redirect(`${clientUrl}/login?error=no_email`);
    }

    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = req.ip || null;

    const user = await upsertOAuthUser(email, name || 'Google User', 'GOOGLE', googleUserId, {
      profileUrl: picture || '',
    });

    const { accessToken, refreshToken } = await createUserSession(user.id, user.email, userAgent, ipAddress);
    setAuthCookies(res, accessToken, refreshToken);

    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent,
        status: 'SUCCESS',
        browser: 'OAuth/Google',
      },
    });

    return res.redirect(`${clientUrl}/dashboard?oauth=google`);
  } catch (err: any) {
    logger.error('Google OAuth callback error:', err);
    return res.redirect(`${clientUrl}/login?error=server_error`);
  }
});

// ─── GitHub OAuth ─────────────────────────────────────────────────────────────

/**
 * GET /auth/github
 * Generates cryptographic state, stores in signed cookie, redirects to GitHub.
 * (GitHub OAuth does not support PKCE code_challenge, state is sufficient)
 */
router.get('/github', (_req: Request, res: Response) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ error: 'GitHub OAuth not configured.' });
  }

  const state = generateState();

  res.cookie('oauth_state', JSON.stringify({ state, verifier: '', provider: 'github' }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000,
    signed: true,
  });

  const redirectUri = getGithubRedirectUri();

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: 'user:email read:user',
    state,
  });

  return res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

/**
 * GET /auth/github/callback
 * Validates CSRF state, exchanges code, creates session.
 */
router.get('/github/callback', async (req: Request, res: Response) => {
  const clientUrl = getClientUrl();

  try {
    const { code, state: returnedState, error } = req.query as Record<string, string>;

    if (error) {
      return res.redirect(`${clientUrl}/login?error=${encodeURIComponent(error)}`);
    }

    if (!code || !returnedState) {
      return res.redirect(`${clientUrl}/login?error=missing_params`);
    }

    // Validate CSRF state
    const rawCookie = (req as any).signedCookies?.oauth_state;
    if (!rawCookie) {
      return res.redirect(`${clientUrl}/login?error=state_missing`);
    }

    let oauthSession: { state: string; verifier: string; provider: string };
    try {
      oauthSession = JSON.parse(rawCookie);
    } catch {
      return res.redirect(`${clientUrl}/login?error=state_invalid`);
    }

    if (oauthSession.state !== returnedState || oauthSession.provider !== 'github') {
      return res.redirect(`${clientUrl}/login?error=state_mismatch`);
    }

    // Clear the oauth state cookie immediately (one-time use)
    res.clearCookie('oauth_state');

    const clientId = process.env.GITHUB_CLIENT_ID!;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET!;
    const redirectUri = getGithubRedirectUri();

    // Exchange code for access token
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri }),
    });

    if (!tokenRes.ok) {
      const err = await tokenRes.text();
      logger.error('GitHub token exchange failed:', err);
      return res.redirect(`${clientUrl}/login?error=token_exchange_failed`);
    }

    const tokenData = (await tokenRes.json()) as any;
    const githubAccessToken = tokenData.access_token;

    if (!githubAccessToken) {
      return res.redirect(`${clientUrl}/login?error=no_access_token`);
    }

    // Fetch user profile
    const profileRes = await fetch('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${githubAccessToken}`, 'User-Agent': 'proofly-backend' },
    });

    if (!profileRes.ok) {
      return res.redirect(`${clientUrl}/login?error=profile_fetch_failed`);
    }

    const profile = (await profileRes.json()) as any;
    const githubUserId = String(profile.id);

    // Fetch verified primary email
    const emailsRes = await fetch('https://api.github.com/user/emails', {
      headers: { Authorization: `Bearer ${githubAccessToken}`, 'User-Agent': 'proofly-backend' },
    });

    let email = profile.email as string | null;
    if (emailsRes.ok) {
      const emails = (await emailsRes.json()) as any[];
      const primary = emails.find((e) => e.primary && e.verified);
      if (primary) email = primary.email;
    }

    if (!email) {
      return res.redirect(`${clientUrl}/login?error=no_verified_email`);
    }

    const name = profile.name || profile.login || 'GitHub User';
    const userAgent = req.headers['user-agent'] || null;
    const ipAddress = req.ip || null;

    const user = await upsertOAuthUser(email, name, 'GITHUB', githubUserId, {
      profileUrl: profile.html_url || '',
      avatarUrl: profile.avatar_url || '',
    });

    const { accessToken, refreshToken } = await createUserSession(user.id, user.email, userAgent, ipAddress);
    setAuthCookies(res, accessToken, refreshToken);

    await prisma.loginHistory.create({
      data: {
        userId: user.id,
        ipAddress,
        userAgent,
        status: 'SUCCESS',
        browser: 'OAuth/GitHub',
      },
    });

    return res.redirect(`${clientUrl}/dashboard?oauth=github`);
  } catch (err: any) {
    logger.error('GitHub OAuth callback error:', err);
    return res.redirect(`${clientUrl}/login?error=server_error`);
  }
});

export default router;
