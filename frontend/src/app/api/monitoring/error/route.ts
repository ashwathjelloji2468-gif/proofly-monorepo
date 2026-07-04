import { NextRequest, NextResponse } from 'next/server';

/**
 * Frontend error reporting endpoint.
 * Receives errors from ErrorBoundary and global-error.tsx,
 * logs them server-side, and forwards to backend if configured.
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();
    const {
      message,
      name,
      url,
      userAgent,
      errorId,
      digest,
      componentStack,
      timestamp,
      source = 'frontend',
    } = body;

    // Structured server-side log (visible in Vercel/Render logs)
    const entry = {
      level: 'ERROR',
      service: 'frontend',
      source,
      message: message || 'Unknown frontend error',
      errorName: name,
      url,
      userAgent: userAgent?.slice(0, 200),
      errorId: errorId || digest,
      componentStack: componentStack?.slice(0, 500),
      timestamp: timestamp || new Date().toISOString(),
      environment: process.env.NODE_ENV,
    };

    // Write to stdout so it appears in deployment logs
    process.stdout.write(JSON.stringify(entry) + '\n');

    // Forward to backend monitoring if configured
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    // Fire and forget — don't block the response
    fetch(`${backendUrl}/api/frontend-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
      signal: AbortSignal.timeout(2000),
    }).catch(() => {/* intentionally silent */});

    return NextResponse.json({ received: true }, { status: 200 });
  } catch {
    return NextResponse.json({ received: false }, { status: 200 }); // Never 500 from error handler
  }
}
