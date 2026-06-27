'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck, Lock } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none overflow-hidden">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 pt-32 pb-24 w-full flex-1 space-y-6 text-left">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-[#8677FF] uppercase tracking-widest block">Data Protection</span>
          <h1 className="text-xl sm:text-2xl font-black text-white">Security & Encryption</h1>
        </div>

        <div className="bg-[#0c0d16] border border-white/[0.05] p-6 rounded-2xl space-y-4 text-xs text-slate-350 leading-relaxed">
          <p>
            Proofly is built from the ground up to protect user testimonials, media reviews, and billing metadata.
          </p>
          <div className="flex items-start space-x-3.5 pt-2">
            <Lock className="w-4.5 h-4.5 text-brand-teal shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-white font-bold">Encrypted Video Uploads</h4>
              <p className="text-[10.5px]">All recorded user video testimonials are stored securely in encrypted object buckets via high-speed global CDNs.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3.5 pt-2">
            <ShieldCheck className="w-4.5 h-4.5 text-brand-teal shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-white font-bold">Secure Bearer Tokens</h4>
              <p className="text-[10.5px]">Our REST and developer API keys utilize cryptographically random bearer keys and strict rate-limiting policies.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
