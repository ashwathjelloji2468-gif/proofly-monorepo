'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import Link from 'next/link';
import { Sparkles, Loader } from 'lucide-react';
import { ProoflyLogo } from '@/components/ProoflyLogo';

import { useStore } from '@/store/useStore';

const loginSchema = zod.object({
  email: zod.string().email({ message: 'Provide a valid email address.' }),
  password: zod.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type LoginFormValues = zod.infer<typeof loginSchema>;

import { Suspense } from 'react';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useStore(state => state.login);
  const isLoading = useStore(state => state.isLoading);
  const resendVerification = useStore(state => state.resendVerificationEmail);
  
  const [authError, setAuthError] = useState('');
  const [showResend, setShowResend] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      setAuthError('');
      setResendSuccess('');
      setShowResend(false);
      const success = await login(values.email, values.password);
      if (success) {
        const inviteToken = searchParams.get('inviteToken');
        if (inviteToken) {
          router.push(`/auth/accept-invite?token=${inviteToken}`);
        } else {
          router.push('/dashboard?confetti=true');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please check credentials.');
      if (err.message?.includes('EMAIL_NOT_VERIFIED')) {
        setShowResend(true);
      }
    }
  };

  const handleResend = async () => {
    const emailVal = getValues('email');
    if (!emailVal) return;
    try {
      setAuthError('');
      await resendVerification(emailVal);
      setResendSuccess('Verification email resent successfully! Check your inbox.');
      setShowResend(false);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to resend verification email.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#09090B] relative overflow-hidden font-sans">
      {/* Glow ambient background */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-emerald/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-teal/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="bg-[#18181B] border border-border-primary rounded-2xl shadow-2xl p-8 space-y-6 text-left">
          
          {/* Logo & Header */}
          <div className="text-center space-y-2 flex flex-col items-center justify-center">
            <Link href="/" className="inline-block hover:opacity-90 transition">
              <ProoflyLogo iconSize={36} showText={true} />
            </Link>
            <h2 className="text-xl font-bold tracking-tight text-white mt-4">Welcome back</h2>
            <p className="text-muted-foreground text-xs">Enter your details to access your SaaS dashboard</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {authError && (
              <div className="p-3 text-xs rounded bg-red-950/40 border border-red-900/50 text-red-400 space-y-2">
                <div>{authError}</div>
                {showResend && (
                  <button
                    type="button"
                    onClick={handleResend}
                    className="text-brand-emerald hover:underline text-[10px] font-bold block"
                  >
                    Resend verification link
                  </button>
                )}
              </div>
            )}

            {resendSuccess && (
              <div className="p-3 text-xs rounded bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald">
                {resendSuccess}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="founder@my-saas.com"
                className="w-full bg-[#09090B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-[10px] text-red-400 mt-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-slate-300 text-xs font-bold uppercase tracking-wider">Password</label>
                <Link href="/forgot-password" className="text-[10px] text-brand-emerald hover:underline font-semibold">
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full bg-[#09090B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                {...register('password')}
              />
              {errors.password && (
                <p className="text-[10px] text-red-400 mt-1">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 disabled:opacity-50 font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg flex items-center justify-center space-x-1.5 shadow-md shadow-brand-emerald/10 cursor-pointer transition"
            >
              {isLoading ? (
                <>
                  <Loader className="w-3.5 h-3.5 animate-spin" />
                  <span>Logging in...</span>
                </>
              ) : (
                <span>Log In</span>
              )}
            </button>
          </form>

          <div className="h-px bg-border-primary/50" />

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => {
                setAuthError('');
                const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
                if (!clientId) {
                  setAuthError('Google Login is not configured. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your environment variables.');
                  return;
                }
                const redirectUri = `${window.location.origin}/api/auth/callback/google`;
                window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=openid%20email%20profile&state=google`;
              }}
              className="bg-[#09090B] border border-border-primary hover:bg-[#18181B] text-slate-300 text-[10px] font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer transition"
            >
              <span>Google Login</span>
            </button>
            <button 
              onClick={() => {
                setAuthError('');
                const clientId = process.env.NEXT_PUBLIC_GITHUB_CLIENT_ID;
                if (!clientId) {
                  setAuthError('GitHub Login is not configured. Please add NEXT_PUBLIC_GITHUB_CLIENT_ID to your environment variables.');
                  return;
                }
                const redirectUri = `${window.location.origin}/api/auth/callback/github`;
                window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=github`;
              }}
              className="bg-[#09090B] border border-border-primary hover:bg-[#18181B] text-slate-300 text-[10px] font-bold py-2.5 px-4 rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer transition"
            >
              <span>GitHub Login</span>
            </button>
          </div>

          <div className="text-center text-xs text-muted-foreground mt-4">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-brand-emerald hover:underline font-semibold">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen px-4 bg-[#09090B] relative overflow-hidden font-sans">
        <Loader className="w-10 h-10 text-brand-emerald animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
