'use client';

import { useEffect } from 'react';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Report to monitoring in production
    if (process.env.NODE_ENV === 'production') {
      fetch('/api/monitoring/error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error.message,
          name: error.name,
          digest: error.digest,
          url: typeof window !== 'undefined' ? window.location.href : '',
          timestamp: new Date().toISOString(),
          source: 'global-error-boundary',
        }),
      }).catch(() => {});
    }
    if (process.env.NODE_ENV !== 'production') {
      console.error('[GlobalError]', error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="bg-[#09090B] font-sans">
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="absolute top-1/3 left-1/4 w-80 h-80 bg-red-900/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative text-center max-w-md space-y-8">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-2xl bg-red-950/40 border border-red-900/30 flex items-center justify-center">
                <AlertOctagon className="w-10 h-10 text-red-400" />
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl font-black text-white">Something went wrong</h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                An unexpected error occurred. Our team has been automatically notified.
              </p>
              {error.digest && (
                <p className="text-[10px] font-mono text-slate-600">
                  Reference: {error.digest}
                </p>
              )}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#18181B] border border-border-primary text-slate-300 hover:text-white hover:border-slate-600 rounded-xl text-sm font-semibold transition"
              >
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-brand-emerald to-brand-teal text-white rounded-xl text-sm font-bold hover:opacity-90 transition"
              >
                <Home className="w-4 h-4" />
                Go home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
