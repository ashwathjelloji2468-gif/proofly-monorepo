'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const githubLogin = useStore(state => state.githubLogin);
  const googleLogin = useStore(state => state.googleLogin);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state') || 'github';

    if (!code) {
      setError('No authorization code received.');
      return;
    }

    let isMounted = true;

    async function executeLogin(authCode: string) {
      try {
        let success = false;
        if (state === 'google') {
          const redirectUri = `${window.location.origin}/auth/callback`;
          success = await googleLogin(authCode, redirectUri);
        } else {
          success = await githubLogin(authCode);
        }

        if (success && isMounted) {
          router.push('/dashboard?confetti=true');
        } else if (isMounted) {
          setError('Authentication failed. Please try again.');
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || `An unexpected error occurred during ${state === 'google' ? 'Google' : 'GitHub'} login.`);
        }
      }
    }

    executeLogin(code);

    return () => {
      isMounted = false;
    };
  }, [searchParams, githubLogin, googleLogin, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#030303] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#09090B] border border-border-primary rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Authentication Error</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-block bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2.5 px-6 rounded-lg shadow-md transition"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const state = searchParams.get('state') || 'github';

  return (
    <div className="min-h-screen bg-[#030303] text-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#09090B] border border-border-primary rounded-2xl p-6 text-center space-y-4 shadow-xl">
        <Loader2 className="w-10 h-10 text-brand-emerald mx-auto animate-spin" />
        <h2 className="text-lg font-bold">Authenticating with {state === 'google' ? 'Google' : 'GitHub'}</h2>
        <p className="text-xs text-muted-foreground">Securing your session, please hold on...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#030303] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#09090B] border border-border-primary rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <Loader2 className="w-10 h-10 text-brand-emerald mx-auto animate-spin" />
          <h2 className="text-lg font-bold">Loading</h2>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
