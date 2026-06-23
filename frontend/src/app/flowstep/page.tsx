'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { FlowStepAI } from '@/components/FlowStepAI';
import { Sparkles, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function FlowStepPage() {
  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col justify-between selection:bg-brand-emerald selection:text-white font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-white transition flex items-center space-x-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <span>/</span>
          <span className="text-brand-teal flex items-center space-x-1">
            <Sparkles className="w-3 h-3" />
            <span>FlowStep AI Designer</span>
          </span>
        </div>

        {/* Builder Viewport */}
        <FlowStepAI />
      </main>

      <Footer />
    </div>
  );
}
