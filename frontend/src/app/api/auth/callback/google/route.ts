import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/auth/callback/google
 *
 * The frontend registered this URL with Google as the OAuth redirect URI
 * (since only Vercel URLs are accepted as authorized redirect URIs in the
 * Google Cloud Console).
 *
 * This route simply forwards the full query string (code, state, error)
 * to the backend OAuth handler which performs PKCE validation, token exchange,
 * user upsert, and session creation.
 *
 * No code processing is done here — the backend owns the full OAuth flow.
 */
export async function GET(request: NextRequest) {
  const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || process.env.SERVER_URL || 'http://localhost:4000';
  const searchParams = request.nextUrl.searchParams;

  // Forward entire query string to backend /auth/google/callback
  const backendCallbackUrl = `${serverUrl}/auth/google/callback?${searchParams.toString()}`;
  return NextResponse.redirect(backendCallbackUrl);
}
