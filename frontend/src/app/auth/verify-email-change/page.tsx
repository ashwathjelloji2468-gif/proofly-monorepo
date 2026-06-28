'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Loader, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

function VerifyEmailChangeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const verifyEmailChange = useStore(state => state.verifyEmailChange);
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'pending-other' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMessage('Verification token is missing.');
      return;
    }

    let isMounted = true;

    async function executeVerification() {
      try {
        const fullSuccess = await verifyEmailChange(token as string);
        if (isMounted) {
          if (fullSuccess) {
            setStatus('success');
            setTimeout(() => {
              router.push('/dashboard/settings');
            }, 2000);
          } else {
            // Returned false: token verified, but we're still waiting for the second email address to confirm
            setStatus('pending-other');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage(err.message || 'An unexpected error occurred during email change verification.');
        }
      }
    }

    executeVerification();

    return () => {
      isMounted = false;
    };
  }, [searchParams, verifyEmailChange, router]);

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-emerald/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-teal/5 rounded-full blur-[120px]" />

      <div className="max-w-md w-full bg-[#18181B] border border-border-primary rounded-2xl p-8 text-center space-y-6 shadow-2xl z-10">
        <Link href="/" className="inline-flex items-center space-x-2">
          <span className="font-black text-xl text-white">✦ Proofly</span>
        </Link>

        {status === 'verifying' && (
          <div className="space-y-4 py-4">
            <Loader className="w-12 h-12 text-brand-emerald mx-auto animate-spin" />
            <h2 className="text-lg font-bold text-white">Verifying email address update</h2>
            <p className="text-xs text-muted-foreground">Confirming your verification code, please hold on...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-brand-emerald mx-auto" />
            <h2 className="text-lg font-bold text-white">Email updated successfully!</h2>
            <p className="text-xs text-muted-foreground">Your account email has been updated. Redirecting you to your settings panel...</p>
          </div>
        )}

        {status === 'pending-other' && (
          <div className="space-y-4 py-4">
            <CheckCircle2 className="w-12 h-12 text-brand-emerald mx-auto" />
            <h2 className="text-lg font-bold text-white">Address verified!</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              This address has been successfully confirmed.
              <br /><br />
              <strong style={{ color: '#F8FAFC' }}>What next?</strong>
              <br />
              Please check your other mailbox (both old and new email addresses require confirmation) and click the verification link there to finalize the update.
            </p>
            <div className="pt-4">
              <Link
                href="/dashboard/settings"
                className="inline-block bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2.5 px-6 rounded-lg shadow-md transition"
              >
                Go to Settings
              </Link>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-4 py-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h2 className="text-lg font-bold text-white">Verification Error</h2>
            <p className="text-xs text-red-400">{errorMessage}</p>
            <div className="pt-4">
              <Link
                href="/dashboard/settings"
                className="inline-block bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2.5 px-6 rounded-lg shadow-md transition"
              >
                Go to Settings
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailChangePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#18181B] border border-border-primary rounded-2xl p-6 text-center space-y-4 shadow-xl">
          <Loader className="w-10 h-10 text-brand-emerald mx-auto animate-spin" />
          <h2 className="text-lg font-bold">Loading</h2>
        </div>
      </div>
    }>
      <VerifyEmailChangeContent />
    </Suspense>
  );
}
