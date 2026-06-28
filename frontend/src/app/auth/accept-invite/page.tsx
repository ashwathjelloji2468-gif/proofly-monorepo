'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Loader, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useStore(state => state.user);
  const acceptInvite = useStore(state => state.acceptWorkspaceInvitation);
  
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<'loading' | 'prompt' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const inviteToken = searchParams.get('token');
    if (!inviteToken) {
      setStatus('error');
      setErrorMessage('Invitation token is missing.');
      return;
    }
    setToken(inviteToken);
    setStatus('prompt');
  }, [searchParams]);

  const handleAccept = async () => {
    if (!token) return;
    setIsSubmitting(true);
    setStatus('loading');
    
    try {
      if (!user) {
        // Redirect to login, keeping the token parameter
        router.push(`/login?inviteToken=${token}`);
        return;
      }

      const success = await acceptInvite(token as string);
      if (success) {
        setStatus('success');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
      } else {
        setStatus('error');
        setErrorMessage('Failed to accept the workspace invitation.');
      }
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-emerald/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-teal/5 rounded-full blur-[120px]" />

      <div className="max-w-md w-full bg-[#18181B] border border-border-primary rounded-2xl p-8 text-center space-y-6 shadow-2xl z-10">
        <Link href="/" className="inline-flex items-center space-x-2">
          <span className="font-black text-xl text-white">✦ Proofly Workspace</span>
        </Link>

        {status === 'loading' && (
          <div className="space-y-4 py-4">
            <Loader className="w-12 h-12 text-brand-emerald mx-auto animate-spin" />
            <h2 className="text-lg font-bold text-white">Processing invitation</h2>
            <p className="text-xs text-muted-foreground">Adding you to the team, please hold on...</p>
          </div>
        )}

        {status === 'prompt' && (
          <div className="space-y-4 py-4">
            <Users className="w-12 h-12 text-brand-emerald mx-auto" />
            <h2 className="text-lg font-bold text-white">You've been invited!</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You have been invited to join a teammate's workspace on Proofly.
              {!user && ' Please log in or sign up first to accept this invitation.'}
            </p>
            
            <div className="pt-4">
              <button
                onClick={handleAccept}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg flex items-center justify-center shadow-md shadow-brand-emerald/10 cursor-pointer transition"
              >
                {user ? 'Accept Workspace Invite' : 'Log In to Accept Invitation'}
              </button>
              
              {!user && (
                <div className="text-xs text-muted-foreground mt-4 text-center">
                  Don't have an account?{' '}
                  <Link href={`/signup?inviteToken=${token}`} className="text-brand-emerald hover:underline font-semibold">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-brand-emerald mx-auto" />
            <h2 className="text-lg font-bold text-white">Invitation accepted!</h2>
            <p className="text-xs text-muted-foreground">Workspace linked successfully. Redirecting you to the dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-bold text-white">Invitation Error</h2>
            <p className="text-xs text-red-400">{errorMessage}</p>
            <div className="pt-4">
              <Link
                href="/login"
                className="inline-block bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2.5 px-6 rounded-lg shadow-md transition"
              >
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#18181B] border border-border-primary rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <Loader className="w-10 h-10 text-brand-emerald mx-auto animate-spin" />
          <h2 className="text-lg font-bold">Loading</h2>
        </div>
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}
