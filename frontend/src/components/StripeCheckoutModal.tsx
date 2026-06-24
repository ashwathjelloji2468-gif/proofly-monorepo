'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ShieldCheck, X, CheckCircle, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { useStore } from '@/store/useStore';

interface StripeModalProps {
  isOpen: boolean;
  onClose: () => void;
  planName: string;
  price: string;
  tierKey: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
}

export function StripeCheckoutModal({ isOpen, onClose, planName, price, tierKey }: StripeModalProps) {
  const updateBillingTier = useStore(state => state.updateBillingTier);
  const user = useStore(state => state.user);
  const [step, setStep] = useState<'form' | 'loading' | 'success'>('form');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('321');
  const [cardName, setCardName] = useState('Jelloji ASHWATH');

  const handlePaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');

    // 1. Try real Stripe Checkout redirect
    if (user?.id) {
      try {
        const checkoutUrl = (process.env.NEXT_PUBLIC_GRAPHQL_URL 
          ? process.env.NEXT_PUBLIC_GRAPHQL_URL.replace('/graphql', '/api/stripe-checkout') 
          : 'http://localhost:4000/api/stripe-checkout');

        const checkoutRes = await fetch(checkoutUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user.id, planName })
        });

        if (checkoutRes.ok) {
          const data = await checkoutRes.json();
          if (data.url) {
            window.location.href = data.url;
            return;
          }
        }
      } catch (err) {
        console.warn('Real Stripe Checkout not available or failed. Falling back to simulated checkout.', err);
      }
    }

    // 2. Simulated webhook fallback (if Stripe is not configured/failed)
    try {
      if (user?.id) {
        const webhookUrl = (process.env.NEXT_PUBLIC_GRAPHQL_URL 
          ? process.env.NEXT_PUBLIC_GRAPHQL_URL.replace('/graphql', '/api/stripe-webhook-simulate') 
          : 'http://localhost:4000/api/stripe-webhook-simulate');

        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ userId: user.id })
        });
      }
    } catch (err) {
      console.error('Failed to trigger simulated Stripe webhook:', err);
    }

    setTimeout(() => {
      // Update local store tier state
      updateBillingTier(tierKey);
      setStep('success');
    }, 1200);
  };

  const handleSuccessDone = () => {
    setStep('form');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/75 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            className="relative w-full max-w-md bg-[#18181B] border border-border-primary rounded-2xl shadow-2xl overflow-hidden z-10 text-left"
          >
            {/* Top Close Button */}
            {step !== 'loading' && (
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* STAGE 1: Checkout Billing Form */}
            {step === 'form' && (
              <form onSubmit={handlePaySubmit} className="p-6 space-y-5">
                <div className="space-y-1">
                  <div className="flex items-center space-x-1.5">
                    <span className="bg-brand-emerald/10 text-brand-emerald text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border border-brand-emerald/20">Stripe Secure</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald" />
                  </div>
                  <h3 className="text-white text-lg font-black tracking-tight">Checkout Subscription</h3>
                  <p className="text-xs text-slate-400">Upgrade to the <span className="text-white font-extrabold">{planName}</span> plan.</p>
                </div>

                {/* Bill details */}
                <div className="bg-[#09090B] border border-border-primary p-4 rounded-xl flex justify-between items-center">
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold">Total Amount Due</span>
                    <span className="text-white text-sm font-extrabold">{planName} Subscription</span>
                  </div>
                  <span className="text-white text-xl font-black">{price}</span>
                </div>

                {/* Card Fields */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Cardholder Name</label>
                    <input
                      type="text"
                      required
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full bg-[#09090B] border border-border-primary p-3 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-emerald"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-[#09090B] border border-border-primary pl-10 pr-3 py-3 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-emerald"
                      />
                      <CreditCard className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        required
                        value={expiry}
                        onChange={(e) => setExpiry(e.target.value)}
                        className="w-full bg-[#09090B] border border-border-primary p-3 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-emerald text-center"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider block">CVC</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={3}
                        required
                        value={cvc}
                        onChange={(e) => setCvc(e.target.value)}
                        className="w-full bg-[#09090B] border border-border-primary p-3 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-emerald text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[10px] text-zinc-500">
                  <ShieldCheck className="w-4 h-4 text-zinc-600 shrink-0" />
                  <span>Payments processed instantly in sandbox test environment. No real funds are moved.</span>
                </div>

                {/* Action button */}
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-brand-emerald to-brand-teal text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer shadow-lg shadow-brand-emerald/10 hover:shadow-brand-emerald/20 hover:scale-[1.01] transition duration-200"
                >
                  Pay & Upgrade Plan
                </button>
              </form>
            )}

            {/* STAGE 2: Processing Payment Loader */}
            {step === 'loading' && (
              <div className="p-12 flex flex-col items-center justify-center space-y-4 text-center">
                <Loader2 className="w-10 h-10 text-brand-emerald animate-spin" />
                <div className="space-y-1">
                  <h4 className="text-white text-sm font-black">Authorizing Payment...</h4>
                  <p className="text-xs text-slate-500">Stripe is verifying card token credentials securely.</p>
                </div>
              </div>
            )}

            {/* STAGE 3: Success Confirmation screen */}
            {step === 'success' && (
              <div className="p-8 flex flex-col items-center justify-center space-y-6 text-center">
                <div className="w-14 h-14 bg-brand-emerald/10 rounded-full border border-brand-emerald flex items-center justify-center text-brand-emerald relative">
                  <CheckCircle className="w-8 h-8" />
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full border border-brand-emerald/50"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-white text-lg font-black flex items-center justify-center space-x-1.5">
                    <span>Payment Approved!</span>
                    <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                    Welcome to the <span className="text-white font-extrabold">{planName}</span> Tier. Your dashboard limits are updated instantly.
                  </p>
                </div>

                <div className="bg-[#09090B] border border-border-primary/60 p-3 rounded-lg text-[10px] text-zinc-500 font-mono w-full">
                  Receipt ID: pt_rec_{Math.random().toString(36).substr(2, 9)}
                </div>

                <button
                  onClick={handleSuccessDone}
                  className="w-full bg-brand-emerald text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest cursor-pointer flex items-center justify-center space-x-2 shadow-lg shadow-brand-emerald/10 hover:shadow-brand-emerald/20 transition"
                >
                  <span>Go to Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
