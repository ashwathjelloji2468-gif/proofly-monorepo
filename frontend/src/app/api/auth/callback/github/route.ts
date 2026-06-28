import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/callback/github
 *
 * The frontend registered this URL with GitHub as the OAuth callback URL
 * (since only Vercel URLs are accepted as authorized callback URLs in the
 * GitHub Developer Settings OAuth App configuration).
 *
 * This route simply forwards the full query string (code, state, error)
 * to the backend OAuth handler which performs CSRF state validation, token
 * exchange, user upsert, and session creation.
 *
 * No code processing is done here — the backend owns the full OAuth flow.
 */
export async function GET(request: NextRequest) {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || 'http://localhost:4000';
  const searchParams = request.nextUrl.searchParams;

  // Forward entire query string to backend /auth/github/callback
  const backendCallbackUrl = `${serverUrl}/auth/github/callback?${searchParams.toString()}`;
  return NextResponse.redirect(backendCallbackUrl);
}
