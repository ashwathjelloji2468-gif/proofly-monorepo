'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border-primary bg-background py-16">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="space-y-4 text-left">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-gradient-to-tr from-brand-emerald to-brand-teal flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-sm text-white">Proofly</span>
          </div>
          <p className="text-muted-foreground text-xs leading-relaxed max-w-xs">
            The premium AI-powered testimonials platform to collect, analyze, and showcase customer reviews with video processing and vector search.
          </p>
        </div>

        <div className="space-y-3 text-left">
          <h4 className="text-white text-xs font-extrabold uppercase tracking-wider">Product</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link href="/#features" className="hover:text-white transition">AI Insights</Link></li>
            <li><Link href="/#features" className="hover:text-white transition">Video Recorder</Link></li>
            <li><Link href="/#showcase" className="hover:text-white transition">Wall of Love</Link></li>
            <li><Link href="/#pricing" className="hover:text-white transition">Pricing Plans</Link></li>
          </ul>
        </div>

        <div className="space-y-3 text-left">
          <h4 className="text-white text-xs font-extrabold uppercase tracking-wider">Company</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link href="/#features" className="hover:text-white transition">About Us</Link></li>
            <li><Link href="/#features" className="hover:text-white transition">SaaS Blog</Link></li>
            <li><Link href="/#features" className="hover:text-white transition">Customers</Link></li>
          </ul>
        </div>

        <div className="space-y-3 text-left">
          <h4 className="text-white text-xs font-extrabold uppercase tracking-wider">Legal</h4>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li><Link href="/#features" className="hover:text-white transition">Terms of Service</Link></li>
            <li><Link href="/#features" className="hover:text-white transition">Privacy Policy</Link></li>
            <li><Link href="/#features" className="hover:text-white transition">GDPR Compliance</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-border-primary text-center text-xs text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Proofly. All rights reserved. Powered by Supabase & Mux.</p>
      </div>
    </footer>
  );
}
