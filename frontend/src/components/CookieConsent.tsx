'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Check if consent has been selected previously
    const consent = localStorage.getItem('proofly-cookie-consent');
    if (!consent) {
      // Small delay before banner slides up
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('proofly-cookie-consent', 'accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('proofly-cookie-consent', 'declined');
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#0c0d16]/95 backdrop-blur-xl border border-white/[0.08] p-5 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] flex flex-col space-y-4 text-left select-none"
        >
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-brand-teal" />
              <span className="text-[10px] font-black text-white uppercase tracking-widest">GDPR Consent</span>
            </div>
            <button 
              onClick={handleDecline}
              className="text-zinc-500 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-[10px] text-slate-400 leading-relaxed">
            Proofly uses cookies to secure session sessions, track conversion lift analytics, and cache widget styling configurations. Read our <a href="/privacy" className="text-[#8677FF] hover:underline">Privacy Policy</a>.
          </p>

          {/* Actions */}
          <div className="flex space-x-2.5">
            <button
              onClick={handleAccept}
              className="flex-1 bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-[10px] py-2 rounded-lg transition cursor-pointer focus:outline-none"
            >
              Accept All
            </button>
            <button
              onClick={handleDecline}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-bold text-[10px] py-2 rounded-lg transition cursor-pointer focus:outline-none"
            >
              Preferences
            </button>
          </div>

        </motion.div>
      )}
    </AnimatePresence>
  );
}
