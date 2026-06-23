'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
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
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-emerald to-brand-teal flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-black text-lg text-white">PowerTestimonials</span>
            </Link>
            <h2 className="text-xl font-bold tracking-tight text-white mt-4">Reset your password</h2>
            <p className="text-muted-foreground text-xs">We will send you instructions to reset your password</p>
          </div>

          {submitted ? (
            <div className="space-y-4 text-center py-4">
              <div className="w-12 h-12 rounded-full bg-brand-emerald/10 flex items-center justify-center mx-auto text-brand-emerald">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white text-sm">Check your email</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Instructions have been sent to <strong>{email}</strong>. Check your spam folder if you do not receive it in 5 minutes.
              </p>
              <Link href="/login" className="inline-flex items-center space-x-1.5 text-xs text-brand-emerald hover:underline font-semibold pt-2">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Login</span>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-slate-300 text-xs font-bold uppercase tracking-wider block">Email Address</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="founder@my-saas.com"
                  className="w-full bg-[#09090B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs uppercase tracking-widest py-3.5 rounded-lg flex items-center justify-center shadow-md shadow-brand-emerald/10 cursor-pointer transition"
              >
                Send Reset Link
              </button>

              <div className="text-center pt-2">
                <Link href="/login" className="inline-flex items-center space-x-1 text-xs text-muted-foreground hover:text-white transition">
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
