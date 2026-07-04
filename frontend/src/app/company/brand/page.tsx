'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Sparkles, Palette } from 'lucide-react';

export default function BrandAssetsPage() {
  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans  overflow-hidden">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 pt-32 pb-24 w-full flex-1 space-y-6 text-left">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest block">Brand Guidelines</span>
          <h1 className="text-xl sm:text-2xl font-black text-white">Brand Assets</h1>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Official Proofly logo marks, typography standards, and color palettes. Use these templates to link back to your verified collection space or trust widgets.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
          {/* Logo card */}
          <div className="bg-[#0c0d16] border border-white/[0.05] p-5 rounded-2xl flex flex-col justify-between items-start space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-gradient-to-tr from-brand-emerald to-brand-teal flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-sm text-white">Proofly Logo</span>
            </div>
            <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg transition cursor-pointer">
              Download SVG
            </button>
          </div>

          {/* Colors card */}
          <div className="bg-[#0c0d16] border border-white/[0.05] p-5 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2">
              <Palette className="w-4.5 h-4.5 text-brand-teal" />
              <h4 className="text-xs font-bold text-white">Color Palette</h4>
            </div>
            <div className="flex space-x-2 pt-2">
              <div className="flex-1 h-8 rounded bg-[#6366F1]" title="#6366F1 Accent" />
              <div className="flex-1 h-8 rounded bg-[#10B981]" title="#10B981 Emerald" />
              <div className="flex-1 h-8 rounded bg-[#4338CA]" title="#4338CA Teal" />
              <div className="flex-1 h-8 rounded bg-[#0A0B14]" title="#0A0B14 Dark" />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
