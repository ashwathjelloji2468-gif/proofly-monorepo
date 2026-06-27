'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { CheckCircle } from 'lucide-react';

export default function TrustCenterPage() {
  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none overflow-hidden">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 pt-32 pb-24 w-full flex-1 space-y-6 text-left">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest block">Compliance Hub</span>
          <h1 className="text-xl sm:text-2xl font-black text-white">Trust Center</h1>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Our core promise is transparency and reliability. Here you can inspect our real-time operational metrics and compliance declarations.
        </p>

        <div className="bg-[#0c0d16] border border-white/[0.05] p-6 rounded-2xl space-y-4">
          <h4 className="text-xs font-bold text-white">Trust Commitments</h4>
          <div className="space-y-3">
            {[
              '100% Verified Authorship on all review cards.',
              'Frictionless user consent controls for text and video.',
              'GDPR Ready metadata storage partitions.'
            ].map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs text-slate-300">
                <CheckCircle className="w-4 h-4 text-brand-teal shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
