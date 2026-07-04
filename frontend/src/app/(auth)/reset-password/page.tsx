'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, Eye, EyeOff, Loader, ShieldAlert } from 'lucide-react';
import { useStore } from '@/store/useStore';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const emailParam = searchParams.get('email') || '';
  const { resetPassword } = useStore();

  const [email] = useState(emailParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // If no token in URL, show error immediately
  if (!token) {
    return (
      <div className="p-4 text-center rounded bg-red-950/40 border border-red-900/50 text-red-400 text-xs leading-relaxed space-y-3">
        <ShieldAlert className="w-5 h-5 mx-auto" />
        <p>This reset link is invalid or has expired.</p>
        <Link href="/forgot-password" className="block text-brand-emerald underline mt-2">
          Request a new password reset
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await resetPassword(email, token, password);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-xs rounded bg-red-950/40 border border-red-900/50 text-red-400 flex items-start gap-2">
          <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="pass" className="text-slate-300 text-xs font-bold uppercase tracking-wider block">New Password</label>
        <div className="relative">
          <input
            id="pass"
            type={showPassword ? 'text' : 'password'}
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full bg-[#09090B] border border-border-primary text-white text-xs px-3.5 py-3 pr-10 rounded-lg focus:outline-none focus:border-brand-emerald transition"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-slate-500">At least 8 characters</p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirmPass" className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Confirm Password</label>
        <div className="relative">
          <input
            id="confirmPass"
            type={showConfirm ? 'text' : 'password'}
            required
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full bg-[#09090B] border border-border-primary text-white text-xs px-3.5 py-3 pr-10 rounded-lg focus:outline-none focus:border-brand-emerald transition"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            onClick={() => setShowConfirm(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition"
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg flex items-center justify-center gap-2 shadow-md shadow-brand-emerald/10 cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading && <Loader className="w-3.5 h-3.5 animate-spin" />}
        {isLoading ? 'Updating...' : 'Reset Password'}
      </button>

      <div className="text-center">
        <Link href="/login" className="text-[10px] text-slate-500 hover:text-slate-300 transition">
          Back to Login
        </Link>
      </div>
    </form>
  );
}

export default function ResetPasswordPage() {
  const [success, setSuccess] = useState(false);

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#09090B] relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-emerald/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-teal/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="bg-[#18181B] border border-border-primary rounded-2xl shadow-2xl p-8 space-y-6 text-left">
          <div className="text-center space-y-2">
            <Link href="/" aria-label="Go to Proofly homepage" className="inline-flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-emerald to-brand-teal flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-lg text-white">Proofly</span>
            </Link>
            <h2 className="text-xl font-bold tracking-tight text-white mt-4">Set new password</h2>
            <p className="text-muted-foreground text-xs">Enter your new secure password below</p>
          </div>

          {success ? (
            <div className="p-4 text-center rounded bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald text-xs leading-relaxed space-y-3">
              <p>Password reset successfully!</p>
              <p className="text-slate-400">Redirecting you to login in 3 seconds...</p>
              <Link href="/login" className="block text-brand-emerald underline font-semibold">
                Go to Login now
              </Link>
            </div>
          ) : (
            <Suspense fallback={<div className="text-slate-400 text-xs text-center">Loading...</div>}>
              <ResetPasswordForm />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  );
}
