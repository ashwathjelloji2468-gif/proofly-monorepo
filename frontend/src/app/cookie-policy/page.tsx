'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldCheck } from 'lucide-react';

export default function CookiePolicyPage() {
  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans  overflow-hidden">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 pt-32 pb-24 w-full flex-1 space-y-6 text-left">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-brand-emerald uppercase tracking-widest block">Legal Terms</span>
          <h1 className="text-xl sm:text-2xl font-black text-white">Cookie Policy</h1>
        </div>

        <div className="bg-[#0c0d16] border border-white/[0.05] p-6 rounded-2xl space-y-4 text-xs text-slate-350 leading-relaxed">
          <p>
            This Cookie Policy explains how Proofly uses cookies and similar tracking technologies to recognize you when you visit our website.
          </p>
          <h4 className="text-white font-bold">1. What are cookies?</h4>
          <p>
            Cookies are small data files stored on your browser or hard drive when you visit a webpage. They help web apps remember settings, secure log sessions, and gather analytics.
          </p>
          <h4 className="text-white font-bold">2. How we use cookies</h4>
          <p>
            We use essential cookies to maintain security authentication sessions, and analytics cookies to measure widget play rates and conversion lift metrics.
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
