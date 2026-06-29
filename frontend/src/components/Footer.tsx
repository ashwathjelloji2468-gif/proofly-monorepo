'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  ArrowUp, 
  Send, 
  Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ProoflyLogo } from './ProoflyLogo';

export function Footer() {
  // Newsletter state
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Floating Back to Top Button state
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 300) {
        setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 300) {
        setShowScroll(false);
      }
    };

    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    
    // Simple validation
    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="border-t border-white/[0.08] bg-[#0A0B14] py-16 relative text-left select-none overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#6366F1]/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10">
        
        {/* Column 1: Brand Info */}
        <div className="lg:col-span-3 space-y-4">
          <ProoflyLogo iconSize={24} showText={true} showSlogan={false} />
          <p className="text-white text-xs font-black italic tracking-wide">
            "Turn customer love into growth."
          </p>
          <p className="text-[10px] text-slate-450 leading-relaxed">
            AI-powered social proof dashboard to collect, process, and embed verifiable video reviews into SaaS frameworks with zero page overhead.
          </p>
          <div className="text-[9.5px] text-zinc-500 space-y-1">
            <p>Contact: <span className="text-[#6366F1] font-medium">support@useproofly.co</span></p>
            <p>&copy; {new Date().getFullYear()} Proofly. All rights reserved.</p>
            <p className="pt-2 border-t border-white/5">
              Built with ❤️ by <span className="font-semibold text-slate-400">J. Ashwath</span> & <span className="font-semibold text-slate-400">Ateeqhulla Khan</span>.
            </p>
          </div>
        </div>

        {/* Column 2: Product */}
        <div className="lg:col-span-1.5 space-y-3.5">
          <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Product</h4>
          <ul className="space-y-2.5 text-[10px] text-slate-400 font-medium">
            <li><Link href="/product/collect" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Collect reviews</Link></li>
            <li><Link href="/product/ai-workspace" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">AI Workspace</Link></li>
            <li><Link href="/product/wall-of-love" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Wall of Love</Link></li>
            <li><Link href="/product/embeds" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Embed widgets</Link></li>
            <li><Link href="/product/analytics" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Analytics</Link></li>
            <li><Link href="/#pricing" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Pricing Plans</Link></li>
            <li><Link href="/live-demo" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Live Demo</Link></li>
          </ul>
        </div>

        {/* Column 3: Solutions */}
        <div className="lg:col-span-1.5 space-y-3.5">
          <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Solutions</h4>
          <ul className="space-y-2.5 text-[10px] text-slate-400 font-medium">
            <li><Link href="/solutions/saas" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">For SaaS</Link></li>
            <li><Link href="/solutions/agencies" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">For Agencies</Link></li>
            <li><Link href="/solutions/startups" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">For Startups</Link></li>
            <li><Link href="/solutions/creators" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">For Creators</Link></li>
            <li><Link href="/solutions/ecommerce" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">E-commerce</Link></li>
            <li><Link href="/solutions/marketing" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Marketing Teams</Link></li>
          </ul>
        </div>

        {/* Column 4: Resources */}
        <div className="lg:col-span-1.5 space-y-3.5">
          <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Resources</h4>
          <ul className="space-y-2.5 text-[10px] text-slate-400 font-medium">
            <li><Link href="/docs" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Documentation</Link></li>
            <li><Link href="/developers/api" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Developer API</Link></li>
            <li><Link href="/dashboard" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Dashboard Integrations</Link></li>
            <li><Link href="/roadmap" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Roadmap</Link></li>
            <li><Link href="/changelog" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Changelog updates</Link></li>
            <li><Link href="/support" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Help Center</Link></li>
            <li><Link href="/blog" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Platform Blog</Link></li>
            <li><Link href="/status" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">System Status</Link></li>
          </ul>
        </div>

        {/* Column 5: Company */}
        <div className="lg:col-span-1.5 space-y-3.5">
          <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Company</h4>
          <ul className="space-y-2.5 text-[10px] text-slate-400 font-medium">
            <li><Link href="/company/about" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">About Us</Link></li>
            <li><Link href="/company/careers" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Careers Portal</Link></li>
            <li><Link href="/company/contact-sales" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Contact Sales</Link></li>
            <li><Link href="/company/press" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Press Kit</Link></li>
            <li><Link href="/company/brand" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Brand Assets</Link></li>
          </ul>
        </div>

        {/* Column 6: Legal */}
        <div className="lg:col-span-1.5 space-y-3.5">
          <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Legal</h4>
          <ul className="space-y-2.5 text-[10px] text-slate-400 font-medium">
            <li><Link href="/privacy" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Terms of Service</Link></li>
            <li><Link href="/cookie-policy" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Cookie Policy</Link></li>
            <li><Link href="/gdpr" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">GDPR Ready</Link></li>
            <li><Link href="/security" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Security Specs</Link></li>
            <li><Link href="/trust" className="hover:text-white transition duration-150 block hover:translate-x-0.5 transform">Trust Center</Link></li>
          </ul>
        </div>

      </div>

      {/* Footer Bottom details & Newsletter Form */}
      <div className="max-w-7xl mx-auto px-6 pt-12 mt-12 border-t border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 text-[10px]">
        
        {/* Newsletter widget */}
        <div className="space-y-2 text-left w-full max-w-sm">
          <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Stay updated with Proofly</h4>
          <p className="text-[9.5px] text-slate-450 leading-relaxed">
            Receive product updates, AI features releases, and startup insights.
          </p>

          <form onSubmit={handleSubscribe} className="flex gap-2 w-full pt-1.5">
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="flex-1 bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl px-3 py-2 text-[10px] text-white"
            />
            <button 
              type="submit"
              className="bg-white hover:bg-zinc-200 text-zinc-950 font-bold px-4 py-2 rounded-xl transition cursor-pointer text-[10px] flex items-center space-x-1 focus:outline-none"
            >
              {subscribed ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              <span>{subscribed ? 'Subscribed' : 'Subscribe'}</span>
            </button>
          </form>
          {errorMsg && <p className="text-[9.5px] text-rose-400 font-bold">{errorMsg}</p>}
        </div>

        {/* Dynamic Status Indicator & Uptime Details & Social Links */}
        <div className="flex flex-col items-start md:items-end space-y-4 w-full md:w-auto">
          
          <div className="flex items-center space-x-4">
            {/* Live Status indicator */}
            <Link href="/status" className="flex items-center space-x-2 text-[9.5px] font-bold text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-3 py-1 rounded-full hover:scale-102 transition duration-200">
              <span className="w-1.5 h-1.5 bg-brand-emerald rounded-full animate-pulse" />
              <span>All Systems Operational</span>
            </Link>

            {/* Version specs */}
            <Link href="/changelog" className="text-[9.5px] text-zinc-500 font-mono hover:text-white transition">
              Version v1.2.0 • Shipped 2026-06-27
            </Link>
          </div>

          {/* Social Icons list */}
          <div className="flex space-x-4">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white hover:scale-105 transition transform duration-150">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white hover:scale-105 transition transform duration-150">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
              </svg>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white hover:scale-105 transition transform duration-150">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>

        </div>

      </div>

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showScroll && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-40 bg-[#0c0d16] border border-white/[0.08] text-white p-3 rounded-full hover:border-[#6366F1]/25 shadow-2xl transition hover:scale-105 cursor-pointer focus:outline-none flex items-center justify-center"
            title="Back to Top"
          >
            <ArrowUp className="w-4 h-4" />
          </motion.button>
        )}
      </AnimatePresence>

    </footer>
  );
}
export default Footer;
