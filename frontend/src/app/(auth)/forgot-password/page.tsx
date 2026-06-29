'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowLeft, Mail, ShieldAlert, CheckCircle, KeyRound } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function ForgotPasswordPage() {
  const router = useRouter();
  
  const requestReset = useStore(state => state.requestPasswordReset);
  const verifyOTP = useStore(state => state.verifyOTP);
  const resetPassword = useStore(state => state.resetPassword);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [otpVal, setOtpVal] = useState<string[]>(Array(6).fill(''));
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Timer state for Resend Code
  const [timer, setTimer] = useState(0);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleSendOTP = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const response = await requestReset(email);
      setSuccessMsg(response.message);
      setStep(2);
      setTimer(60); // 60s cooldown for resend
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otpVal.join('');
    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await verifyOTP(email, otpCode);
      setSuccessMsg('Verification successful! Logging you in...');
      setTimeout(() => {
        router.push('/dashboard?confetti=true');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const success = await resetPassword(email, resetToken, newPassword);
      if (success) {
        setSuccessMsg('Your password has been changed successfully. Redirecting you to login...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError('Failed to reset password.');
      }
    } catch (err: any) {
      setError(err.message || 'Password update failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // OTP inputs auto-focus handlers
  const handleOtpChange = (index: number, val: string) => {
    const numericVal = val.replace(/[^0-9]/g, '');
    if (!numericVal) {
      const newOtp = [...otpVal];
      newOtp[index] = '';
      setOtpVal(newOtp);
      return;
    }

    const newOtp = [...otpVal];
    newOtp[index] = numericVal[numericVal.length - 1];
    setOtpVal(newOtp);

    // Advance focus
    if (index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpVal[index] && index > 0) {
      const newOtp = [...otpVal];
      newOtp[index - 1] = '';
      setOtpVal(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pasteData.length === 6) {
      const splitVal = pasteData.split('');
      setOtpVal(splitVal);
      inputRefs.current[5]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-[#09090B] relative overflow-hidden font-sans">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-emerald/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-teal/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md z-10">
        <div className="bg-[#18181B] border border-border-primary rounded-2xl shadow-2xl p-8 space-y-6 text-left">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <Link href="/" className="inline-flex items-center space-x-2">
              <span className="font-black text-xl text-white">✦ Proofly</span>
            </Link>
            <h2 className="text-xl font-bold tracking-tight text-white mt-4">
              {step === 1 && 'Reset your password'}
              {step === 2 && 'Enter verification code'}
              {step === 3 && 'Set new password'}
            </h2>
            <p className="text-muted-foreground text-xs">
              {step === 1 && 'We will send you a 6-digit security code to verify your account'}
              {step === 2 && `We've sent a code to ${email}`}
              {step === 3 && 'Enter your new secure account password below'}
            </p>
          </div>

          {error && (
            <div className="p-3 text-xs rounded-lg bg-red-950/40 border border-red-900/50 text-red-400 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && step !== 2 && (
            <div className="p-3 text-xs rounded-lg bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="email"
                    type="email"
                    required
                    placeholder="founder@my-saas.com"
                    className="w-full bg-[#09090B] border border-border-primary text-white text-xs pl-10 pr-3.5 py-3.5 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg flex items-center justify-center shadow-md shadow-brand-emerald/10 cursor-pointer transition disabled:opacity-55"
              >
                {isLoading ? 'Sending code...' : 'Send Reset Code'}
              </button>

              <div className="text-center pt-2">
                <Link href="/login" className="inline-flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-white transition font-medium">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div className="space-y-2">
                <label className="text-slate-300 text-xs font-bold uppercase tracking-wider block text-center">Security Code</label>
                <div className="flex justify-between items-center gap-2.5">
                  {otpVal.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      className="w-12 h-14 bg-[#09090B] border border-border-primary text-white text-center font-bold text-lg rounded-lg focus:outline-none focus:border-brand-emerald transition"
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      autoFocus={idx === 0}
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg flex items-center justify-center shadow-md shadow-brand-emerald/10 cursor-pointer transition disabled:opacity-55"
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>

              <div className="text-center space-y-3 pt-2">
                {timer > 0 ? (
                  <p className="text-xs text-muted-foreground">Resend code in {timer} seconds</p>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSendOTP()}
                    className="text-xs text-brand-emerald hover:underline font-bold"
                  >
                    Resend verification code
                  </button>
                )}
                
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setError('');
                      setOtpVal(Array(6).fill(''));
                    }}
                    className="inline-flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-white transition font-medium"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change email address</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="pass" className="text-slate-300 text-xs font-bold uppercase tracking-wider block">New Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="pass"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#09090B] border border-border-primary text-white text-xs pl-10 pr-3.5 py-3.5 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPass" className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Confirm Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    id="confirmPass"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full bg-[#09090B] border border-border-primary text-white text-xs pl-10 pr-3.5 py-3.5 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg flex items-center justify-center shadow-md shadow-brand-emerald/10 cursor-pointer transition disabled:opacity-55"
              >
                {isLoading ? 'Updating password...' : 'Update Password'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
}
