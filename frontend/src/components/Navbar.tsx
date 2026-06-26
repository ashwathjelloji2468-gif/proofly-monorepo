'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Sparkles, ArrowRight, Menu, X } from 'lucide-react';
import { ProoflyLogo } from './ProoflyLogo';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const user = useStore(state => state.user);
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

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

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex md:hidden text-slate-400 hover:text-white p-1 focus:outline-none transition cursor-pointer"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="md:hidden border-t border-border-primary/50 bg-[#09090B]/95 backdrop-blur-sm overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col space-y-4 text-left">
              <Link 
                href="/#features" 
                onClick={(e) => { handleScroll(e, 'features'); setIsOpen(false); }}
                className="text-xs font-semibold text-muted-foreground hover:text-white transition-colors py-2 border-b border-white/5"
              >
                Features
              </Link>
              <Link 
                href="/#showcase" 
                onClick={(e) => { handleScroll(e, 'showcase'); setIsOpen(false); }}
                className="text-xs font-semibold text-muted-foreground hover:text-white transition-colors py-2 border-b border-white/5"
              >
                Wall of Love
              </Link>

              <Link 
                href="/#pricing" 
                onClick={(e) => { handleScroll(e, 'pricing'); setIsOpen(false); }}
                className="text-xs font-semibold text-muted-foreground hover:text-white transition-colors py-2 border-b border-white/5"
              >
                Pricing
              </Link>
              <Link 
                href="/#faq" 
                onClick={(e) => { handleScroll(e, 'faq'); setIsOpen(false); }}
                className="text-xs font-semibold text-muted-foreground hover:text-white transition-colors py-2"
              >
                FAQ
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
