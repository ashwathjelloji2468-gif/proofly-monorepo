'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Sparkles, ArrowRight } from 'lucide-react';
import { ProoflyLogo } from './ProoflyLogo';

export function Navbar() {
  const user = useStore(state => state.user);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    // If we are on the homepage, prevent Next.js client-side router fetching and simply scroll smoothly
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border-primary bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="group hover:opacity-90 transition-opacity">
          <ProoflyLogo iconSize={34} showText={true} />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            href="/#features" 
            onClick={(e) => handleScroll(e, 'features')}
            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            Features
          </Link>
          
          <Link 
            href="/#showcase" 
            onClick={(e) => handleScroll(e, 'showcase')}
            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            Wall of Love
          </Link>
          
          <Link 
            href="/flowstep" 
            className="text-sm font-semibold text-brand-teal flex items-center space-x-1 hover:text-brand-teal-hover transition-colors relative group"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-teal group-hover:animate-spin" />
            <span>FlowStep AI</span>
            <span className="absolute -top-3.5 -right-3 bg-indigo-600 text-indigo-100 text-[6px] font-black uppercase px-1 py-0.5 rounded tracking-wider animate-pulse">
              New
            </span>
          </Link>
          
          <Link 
            href="/#pricing" 
            onClick={(e) => handleScroll(e, 'pricing')}
            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            Pricing
          </Link>
          
          <Link 
            href="/#faq" 
            onClick={(e) => handleScroll(e, 'faq')}
            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            FAQ
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center space-x-4">
          {mounted && user ? (
            <Link href="/dashboard">
              <button className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2 px-4 rounded-lg flex items-center space-x-1 shadow-md shadow-brand-emerald/10 cursor-pointer transition">
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-xs font-semibold text-muted-foreground hover:text-white transition-colors">
                Log in
              </Link>
              <Link href="/signup">
                <button className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2 px-4 rounded-lg shadow-md shadow-brand-emerald/10 cursor-pointer transition">
                  Start Free
                </button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
