'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Download, FileText, Globe } from 'lucide-react';

export default function PressKitPage() {
  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none overflow-hidden">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 pt-32 pb-24 w-full flex-1 space-y-6 text-left">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-[#8677FF] uppercase tracking-widest block">Company Press Kit</span>
          <h1 className="text-xl sm:text-2xl font-black text-white">Press Kit & Resources</h1>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          Welcome to the Proofly press resources portal. Below you can find downloadable media assets, branding guidelines, and official logos for publications.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <div className="bg-[#0c0d16] border border-white/[0.05] p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-white">Media Kit Assets</h4>
            <p className="text-[10px] text-slate-400">Download high-res logo packages, screenshots mockups, and executive headshots.</p>
            <button className="bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-[9px] px-3.5 py-2 rounded-xl transition flex items-center space-x-1 cursor-pointer">
              <Download className="w-3.5 h-3.5" />
              <span>Download ZIP Package (12MB)</span>
            </button>
          </div>

          <div className="bg-[#0c0d16] border border-white/[0.05] p-5 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-white">Brand Assets Info</h4>
            <p className="text-[10px] text-slate-400">Learn about Proofly colors, typography guidelines, and styling badges.</p>
            <a href="/company/brand">
              <button className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-[9px] px-3.5 py-2 rounded-xl transition cursor-pointer mt-2.5">
                View Brand Assets
              </button>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
