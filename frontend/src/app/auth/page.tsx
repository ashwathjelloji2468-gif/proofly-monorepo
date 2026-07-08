'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Loader, Sparkles, ArrowLeft, RefreshCw, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { ProoflyLogo } from '@/components/ProoflyLogo';

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Store actions & state
  const requestOTP = useStore(state => state.requestOTP);
  const verifyOTP = useStore(state => state.verifyOTP);
  const completeSignup = useStore(state => state.completeSignup);
  const isLoading = useStore(state => state.isLoading);

  // Flow states
  // 'email' | 'otp' | 'onboarding'
  const [step, setStep] = useState<'email' | 'otp' | 'onboarding'>('email');
  
  // Data states
  const [email, setEmail] = useState('');
  const [otpCodes, setOtpCodes] = useState<string[]>(Array(6).fill(''));
  const [signupToken, setSignupToken] = useState('');
  const [fullName, setFullName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');

  const [debugOtpCode, setDebugOtpCode] = useState('');

  // UI Status
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);

  // Refs for OTP input navigation
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Request OTP Email
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setErrorMsg('');
    setSuccessMsg('');

    try {
      useStore.setState({ isLoading: true });
      const res = await requestOTP(email);
      setResendTimer(60);
      setStep('otp');
      setOtpCodes(Array(6).fill(''));
      if (res?.debugOtp) {
        setDebugOtpCode(res.debugOtp);
        setSuccessMsg(`We generated a verification code for ${email}`);
      } else {
        setDebugOtpCode('');
        setSuccessMsg(`We sent a 6-digit verification code to ${email}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request verification code. Please try again.');
    } finally {
      useStore.setState({ isLoading: false });
    }
  };

  // Resend OTP Email
  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setErrorMsg('');
    setSuccessMsg('');
    try {
      useStore.setState({ isLoading: true });
      const res = await requestOTP(email);
      setResendTimer(60);
      if (res?.debugOtp) {
        setDebugOtpCode(res.debugOtp);
        setSuccessMsg('A new verification code was generated!');
      } else {
        setDebugOtpCode('');
        setSuccessMsg('Verification code resent successfully!');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to resend code.');
    } finally {
      useStore.setState({ isLoading: false });
    }
  };

  // OTP inputs navigation & auto-advance
  const handleOtpChange = (value: string, index: number) => {
    const newCodes = [...otpCodes];
    
    // Handle paste support
    if (value.length > 1) {
      const pastedData = value.slice(0, 6).split('');
      const updatedCodes = [...otpCodes];
      pastedData.forEach((char, i) => {
        if (i < 6) updatedCodes[i] = char;
      });
      setOtpCodes(updatedCodes);
      
      // Auto-trigger verification if 6 digits entered
      if (updatedCodes.every(c => c !== '')) {
        triggerVerify(updatedCodes.join(''));
      }
      
      // Focus last input or next logical empty
      const targetIndex = Math.min(pastedData.length, 5);
      inputRefs.current[targetIndex]?.focus();
      return;
    }

    newCodes[index] = value;
    setOtpCodes(newCodes);

    // Auto advance focus
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto verify when 6th digit is entered
    if (newCodes.every(c => c !== '')) {
      triggerVerify(newCodes.join(''));
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otpCodes[index] === '' && index > 0) {
        const newCodes = [...otpCodes];
        newCodes[index - 1] = '';
        setOtpCodes(newCodes);
        inputRefs.current[index - 1]?.focus();
      } else {
        const newCodes = [...otpCodes];
        newCodes[index] = '';
        setOtpCodes(newCodes);
      }
    }
  };

  // Automatically trigger OTP verification
  const triggerVerify = async (code: string) => {
    setErrorMsg('');
    setIsVerifying(true);
    try {
      const res = await verifyOTP(email, code);
      if (res.success) {
        if (res.userExists) {
          // Success! Logged in automatically (cookies are set)
          setSuccessMsg('Signed in successfully! Redirecting...');
          const inviteToken = searchParams.get('inviteToken');
          setTimeout(() => {
            if (inviteToken) {
              router.push(`/auth/accept-invite?token=${inviteToken}`);
            } else {
              router.push('/dashboard?confetti=true');
            }
          }, 1000);
        } else {
          // New User Onboarding flow
          setSignupToken(res.signupToken || '');
          setStep('onboarding');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid or expired verification code.');
      // Clear OTP inputs on error to let user retry
      setOtpCodes(Array(6).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Profile completion handler (Signup)
  const handleOnboardingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !workspaceName.trim()) {
      setErrorMsg('Both fields are required to setup your account.');
      return;
    }
    setErrorMsg('');
    try {
      useStore.setState({ isLoading: true });
      const res = await completeSignup(email, signupToken, fullName, workspaceName);
      if (res.success) {
        setSuccessMsg('Account created successfully! Redirecting...');
        const inviteToken = searchParams.get('inviteToken');
        setTimeout(() => {
          if (inviteToken) {
            router.push(`/auth/accept-invite?token=${inviteToken}`);
          } else {
            router.push('/dashboard?confetti=true');
          }
        }, 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete signup.');
    } finally {
      useStore.setState({ isLoading: false });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#09090B] relative overflow-hidden font-sans text-slate-100">
      {/* Background Blurs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-emerald/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-teal/10 rounded-full blur-3xl -z-10" />

      <div className="w-full max-w-[420px] space-y-6">
        
        {/* Brand Logo header */}
        <div className="flex flex-col items-center space-y-2">
          <ProoflyLogo className="w-10 h-10" />
          <h2 className="text-xl font-black tracking-tight text-white mt-2">
            {step === 'onboarding' ? 'Create your profile' : 'Welcome to Proofly'}
          </h2>
          <p className="text-xs text-slate-400">
            {step === 'email' && 'Capture, showcase, and share client testimonials'}
            {step === 'otp' && 'Verify your identity to log in'}
            {step === 'onboarding' && 'Tell us a bit about yourself and your company'}
          </p>
        </div>

        {/* Info/Error/Success Banner */}
        {errorMsg && (
          <div className="p-3 text-xs bg-red-950/40 border border-red-900/40 rounded-xl text-red-400 flex items-start space-x-2 animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 text-xs bg-brand-emerald/10 border border-brand-emerald/20 rounded-xl text-brand-emerald flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Authentication Card */}
        <div className="bg-[#121214] border border-border-primary/80 rounded-2xl p-6 shadow-2xl space-y-6">
          
          {/* STEP 1: Email entry screen */}
          {step === 'email' && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    disabled={isLoading}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full bg-[#1A1A1E] border border-border-primary text-white text-xs px-3.5 py-3.5 pl-10 rounded-xl focus:outline-none focus:border-brand-emerald transition disabled:opacity-50"
                  />
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 disabled:opacity-50 font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-brand-emerald/10 transition"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending code...</span>
                  </>
                ) : (
                  <span>Continue</span>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border-primary/50"></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-widest">or</span>
                <div className="flex-grow border-t border-border-primary/50"></div>
              </div>

              {/* OAuth buttons */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href={`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000'}/auth/google`}
                  className="bg-[#1A1A1E] border border-border-primary hover:bg-[#232329] text-slate-300 text-[10px] font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition"
                >
                  <span>Continue with Google</span>
                </a>
                <a
                  href={`${process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:4000'}/auth/github`}
                  className="bg-[#1A1A1E] border border-border-primary hover:bg-[#232329] text-slate-300 text-[10px] font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition"
                >
                  <span>Continue with GitHub</span>
                </a>
              </div>
            </form>
          )}

          {/* STEP 2: OTP Entry verification screen */}
          {step === 'otp' && (
            <div className="space-y-6">
              <div className="text-left space-y-1">
                <p className="text-xs text-slate-400">
                  We sent a 6-digit verification code to <span className="text-white font-bold">{email}</span>. Enter it below to authenticate.
                </p>
              </div>

              {debugOtpCode && (
                <div className="p-4 bg-purple-950/20 border border-purple-900/30 text-purple-400 text-xs rounded-xl text-left space-y-1.5 animate-pulse">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
                    <span className="font-extrabold uppercase tracking-wide">Demo Sandbox Mode</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    This recipient is unverified on the Resend free tier. Use this code to bypass:
                  </p>
                  <div className="bg-purple-950/40 border border-purple-900/40 rounded-lg p-2 text-center font-mono font-black text-sm text-purple-300 tracking-widest mt-1">
                    {debugOtpCode}
                  </div>
                </div>
              )}

              {/* OTP Digits boxes */}
              <div className="flex justify-between gap-2.5">
                {otpCodes.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={6} // Supports pasting multiple chars
                    value={digit}
                    disabled={isVerifying}
                    ref={(el) => { inputRefs.current[idx] = el; }}
                    onChange={(e) => handleOtpChange(e.target.value, idx)}
                    onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                    className="w-12 h-14 bg-[#1A1A1E] border border-border-primary text-center text-lg font-bold rounded-xl text-brand-emerald focus:outline-none focus:border-brand-emerald focus:ring-1 focus:ring-brand-emerald/30 transition disabled:opacity-50"
                  />
                ))}
              </div>

              {/* OTP Verifying state */}
              {isVerifying && (
                <div className="flex items-center justify-center space-x-2 text-xs text-brand-emerald py-1">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Verifying code...</span>
                </div>
              )}

              {/* Secondary links & countdown */}
              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-slate-400 hover:text-slate-200 flex items-center space-x-1 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Email</span>
                </button>

                <button
                  type="button"
                  disabled={resendTimer > 0 || isLoading}
                  onClick={handleResendOTP}
                  className="text-brand-emerald hover:opacity-90 disabled:text-slate-500 font-bold transition flex items-center space-x-1 cursor-pointer disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? (
                    <span>Resend in {resendTimer}s</span>
                  ) : (
                    <>
                      <RefreshCw className="w-3 h-3 animate-pulse" />
                      <span>Resend Code</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Complete profile / New user onboarding */}
          {step === 'onboarding' && (
            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div className="p-3 bg-brand-emerald/5 border border-brand-emerald/20 rounded-xl text-[11px] text-brand-emerald flex items-start space-x-2 leading-relaxed text-left">
                <Sparkles className="w-4 h-4 shrink-0 text-brand-emerald mt-0.5" />
                <span>
                  <strong>Welcome aboard!</strong> Email verified. Setup your profile details and your first testimonial workspace below.
                </span>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Full Name</label>
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-[#1A1A1E] border border-border-primary text-white text-xs px-3.5 py-3.5 rounded-xl focus:outline-none focus:border-brand-emerald transition disabled:opacity-50"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Company / Workspace Name</label>
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="Acme Inc."
                  className="w-full bg-[#1A1A1E] border border-border-primary text-white text-xs px-3.5 py-3.5 rounded-xl focus:outline-none focus:border-brand-emerald transition disabled:opacity-50"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 disabled:opacity-50 font-bold text-xs uppercase tracking-widest py-3.5 rounded-xl flex items-center justify-center space-x-1.5 cursor-pointer shadow-md shadow-brand-emerald/10 transition"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-3.5 h-3.5 animate-spin" />
                    <span>Setting up workspace...</span>
                  </>
                ) : (
                  <span>Complete Setup</span>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Footer info link */}
        <div className="text-center text-[10px] text-slate-500">
          By signing in, you agree to our{' '}
          <a href="/terms" className="hover:underline">Terms of Service</a> and{' '}
          <a href="/privacy" className="hover:underline">Privacy Policy</a>.
        </div>
      </div>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen px-4 bg-[#09090B] relative overflow-hidden font-sans">
        <Loader className="w-10 h-10 text-brand-emerald animate-spin" />
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
