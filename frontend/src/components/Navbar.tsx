'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  Sparkles, 
  ArrowRight, 
  Menu, 
  X, 
  Video, 
  LayoutDashboard, 
  Heart, 
  Code, 
  TrendingUp, 
  Cloud, 
  Briefcase, 
  Rocket, 
  User, 
  ShoppingBag, 
  Megaphone, 
  Search, 
  ChevronDown,
  Info,
  Users,
  ShieldCheck,
  Mail,
  Map,
  History,
  FileCode,
  HelpCircle,
  Activity,
  ChevronRight
} from 'lucide-react';
import { ProoflyLogo } from './ProoflyLogo';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const user = useStore(state => state.user);
  const pathname = usePathname();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [activeDropdown, setActiveDropdown] = useState<'product' | 'solutions' | 'resources' | 'company' | null>(null);
  
  // Command Palette states
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    
    // Scroll height and active section logic
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Active section highlight observer
      const scrollPosition = window.scrollY + 180;
      const homeEl = document.getElementById('home');
      const featuresEl = document.getElementById('features');
      const showcaseEl = document.getElementById('showcase');
      const pricingEl = document.getElementById('pricing');
      const faqEl = document.getElementById('faq');

      if (faqEl && scrollPosition >= faqEl.offsetTop) {
        setActiveSection('faq');
      } else if (pricingEl && scrollPosition >= pricingEl.offsetTop) {
        setActiveSection('pricing');
      } else if (showcaseEl && scrollPosition >= showcaseEl.offsetTop) {
        setActiveSection('showcase');
      } else if (featuresEl && scrollPosition >= featuresEl.offsetTop) {
        setActiveSection('features');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut listener for Command Palette (⌘+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      
      // Close Command Palette on Escape
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus search input when command palette opens
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      setSearchQuery('');
      setSelectedIndex(0);
    }
  }, [commandPaletteOpen]);

  const handleScrollToId = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, id: string) => {
    if (pathname === '/') {
      e.preventDefault();
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleMouseEnter = (menu: 'product' | 'solutions' | 'resources' | 'company') => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setActiveDropdown(menu);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  // Command palette navigation entries
  const commandPaletteItems = [
    { name: '🎥 Collect Testimonials', description: 'Interactive recording tool settings', path: '/product/collect' },
    { name: '📊 AI Workspace', description: 'Testimonial inbox management dashboard', path: '/product/ai-workspace' },
    { name: '💖 Wall of Love', description: 'Widgets and custom wall displays', path: '/product/wall-of-love' },
    { name: '🔌 Embed Code Snippets', description: 'Framework scripts for HTML, React, Next.js', path: '/product/embeds' },
    { name: '📈 Attributions & Analytics', description: 'Measure conversions and play duration rates', path: '/product/analytics' },
    { name: '🏷️ Pricing Plans', description: 'Compare Free, Growth, and Premium tiers', path: '/#pricing', id: 'pricing' },
    { name: '📚 Product Documentation', description: 'API reference guides and setup manuals', path: '/docs' },
    { name: '🔌 REST API References', description: 'Interact with Proofly programmatically', path: '/developers/api' },
    { name: '🚀 Features Changelog', description: 'See what has been newly updated', path: '/changelog' },
    { name: '✍️ Platform Blog', description: 'Tips and tricks to boost sales conversions', path: '/blog' },
    { name: '❓ Frequently Asked Questions', description: 'General client support FAQ', path: '/#faq', id: 'faq' }
  ];

  const filteredCommands = commandPaletteItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCommand = (index: number) => {
    const selected = filteredCommands[index];
    if (!selected) return;
    setCommandPaletteOpen(false);
    
    if (selected.id && pathname === '/') {
      const el = document.getElementById(selected.id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(selected.path);
    }
  };

  // Command Palette keyboard navigations
  const handleCommandKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSelectCommand(selectedIndex);
    }
  };

  return (
    <>
      <header 
        className={`fixed left-0 right-0 z-50 transition-all duration-300 w-full select-none ${
          isScrolled ? 'top-2' : 'top-4'
        }`}
      >
        <div 
          className={`max-w-7xl mx-auto w-[92%] sm:w-[94%] rounded-full border border-white/[0.08] transition-all duration-300 ${
            isScrolled 
              ? 'h-14 bg-[#0a0b14]/75 backdrop-blur-[24px] shadow-[0_10px_30px_rgba(0,0,0,0.4)] px-5' 
              : 'h-16 bg-[#0a0b14]/60 backdrop-blur-[18px] shadow-[0_8px_20px_rgba(0,0,0,0.2)] px-6'
          } flex items-center justify-between`}
        >
          {/* Left: Logo */}
          <Link 
            href="/" 
            className="flex items-center space-x-2 group focus:outline-none"
            onClick={(e) => handleScrollToId(e, 'home')}
          >
            <motion.div
              whileHover={{ 
                scale: 1.03, 
                rotate: 2.5,
                filter: 'drop-shadow(0 0 8px rgba(108, 92, 255, 0.4))'
              }}
              transition={{ type: 'spring', stiffness: 350, damping: 15 }}
            >
              <ProoflyLogo iconSize={isScrolled ? 30 : 34} showText={true} />
            </motion.div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            
            {/* PRODUCT DROPDOWN */}
            <div 
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('product')}
              onMouseLeave={handleMouseLeave}
            >
              <button 
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 hover:text-white flex items-center space-x-1.5 focus:outline-none ${
                  activeSection === 'features' ? 'text-white' : 'text-slate-400'
                }`}
              >
                <span>Product</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'product' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'product' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#0d0e19]/95 backdrop-blur-xl border border-white/[0.08] p-4 rounded-2xl w-[480px] grid grid-cols-2 gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
                  >
                    {[
                      { icon: <Video className="w-4 h-4 text-[#8677FF]" />, title: '🎥 Collect Testimonials', desc: 'Gather rich feedback easily.', path: '/product/collect' },
                      { icon: <LayoutDashboard className="w-4 h-4 text-brand-emerald" />, title: '📊 AI Workspace', desc: 'AI summary curation suite.', path: '/product/ai-workspace' },
                      { icon: <Heart className="w-4 h-4 text-red-500" />, title: '💖 Wall of Love', desc: 'Beautiful social proof grids.', path: '/product/wall-of-love' },
                      { icon: <Sparkles className="w-4 h-4 text-brand-teal" />, title: '🤖 AI Insights', desc: 'Autodetect feedback sentiment.', path: '/product/ai-workspace' },
                      { icon: <Code className="w-4 h-4 text-purple-400" />, title: '🔌 Embeds', desc: 'Single-line copy HTML display.', path: '/product/embeds' },
                      { icon: <TrendingUp className="w-4 h-4 text-yellow-400" />, title: '📈 Analytics', desc: 'Measure conversion lift stats.', path: '/product/analytics' }
                    ].map((item: any, idx) => (
                      <Link 
                        key={idx}
                        href={item.path || `/#${item.id}`}
                        onClick={(e) => item.id && handleScrollToId(e, item.id)}
                        className="flex items-start space-x-3 p-2.5 rounded-xl transition duration-200 hover:bg-white/[0.04] hover:scale-[1.02] active:scale-[0.98] border border-transparent hover:border-white/[0.02]"
                      >
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                          {item.icon}
                        </div>
                        <div className="text-left space-y-0.5">
                          <h4 className="text-[11px] font-bold text-white tracking-wide">{item.title}</h4>
                          <p className="text-[9px] text-slate-400 leading-normal">{item.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* SOLUTIONS DROPDOWN */}
            <div 
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('solutions')}
              onMouseLeave={handleMouseLeave}
            >
              <button 
                className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide text-slate-400 hover:text-white transition-all duration-200 flex items-center space-x-1.5 focus:outline-none"
              >
                <span>Solutions</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'solutions' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'solutions' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#0d0e19]/95 backdrop-blur-xl border border-white/[0.08] p-4 rounded-2xl w-[460px] grid grid-cols-2 gap-3 shadow-[0_15px_40px_rgba(0,0,0,0.6)]"
                  >
                     {[
                      { icon: <Cloud className="w-4 h-4 text-blue-400" />, title: 'For SaaS', desc: 'Accelerate recurring conversion.', path: '/solutions/saas' },
                      { icon: <Briefcase className="w-4 h-4 text-emerald-400" />, title: 'For Agencies', desc: 'Build client verification pages.', path: '/solutions/agencies' },
                      { icon: <Rocket className="w-4 h-4 text-brand-teal" />, title: 'For Startups', desc: 'Gather initial user trust faster.', path: '/solutions/startups' },
                      { icon: <User className="w-4 h-4 text-purple-400" />, title: 'For Creators', desc: 'Monetize validation assets.', path: '/solutions/creators' },
                      { icon: <ShoppingBag className="w-4 h-4 text-rose-400" />, title: 'For E-commerce', desc: 'Reduce customer checkout dropoff.', path: '/solutions/ecommerce' },
                      { icon: <Megaphone className="w-4 h-4 text-amber-400" />, title: 'For Marketing Teams', desc: 'Deploy assets across advertising.', path: '/solutions/marketing' }
                    ].map((item: any, idx) => (
                      <Link 
                        key={idx}
                        href={item.path}
                        className="flex items-start space-x-3 p-2.5 rounded-xl transition duration-200 hover:bg-white/[0.04] hover:scale-[1.02] border border-transparent hover:border-white/[0.02]"
                      >
                        <div className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                          {item.icon}
                        </div>
                        <div className="text-left space-y-0.5">
                          <h4 className="text-[11px] font-bold text-white tracking-wide">{item.title}</h4>
                          <p className="text-[9px] text-slate-400 leading-normal">{item.desc}</p>
                        </div>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* PRICING LINK */}
            <Link 
              href="/#pricing" 
              onClick={(e) => handleScrollToId(e, 'pricing')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 hover:text-white relative focus:outline-none ${
                activeSection === 'pricing' ? 'text-white' : 'text-slate-400'
              }`}
            >
              <span>Pricing</span>
              {activeSection === 'pricing' && (
                <motion.div 
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#8677FF]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>

            {/* WALL OF LOVE LINK */}
            <Link 
              href="/#showcase" 
              onClick={(e) => handleScrollToId(e, 'showcase')}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 hover:text-white relative focus:outline-none ${
                activeSection === 'showcase' ? 'text-white' : 'text-slate-400'
              }`}
            >
              <span>Customers</span>
              {activeSection === 'showcase' && (
                <motion.div 
                  layoutId="nav-underline"
                  className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#8677FF]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </Link>

            {/* RESOURCES DROPDOWN */}
            <div 
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('resources')}
              onMouseLeave={handleMouseLeave}
            >
              <button 
                className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide text-slate-400 hover:text-white transition-all duration-200 flex items-center space-x-1.5 focus:outline-none"
              >
                <span>Resources</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'resources' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'resources' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#0d0e19]/95 backdrop-blur-xl border border-white/[0.08] p-3 rounded-2xl w-[320px] shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col gap-1 text-left"
                  >
                    {[
                      { icon: <FileCode className="w-3.5 h-3.5" />, title: 'Documentation', path: '/docs' },
                      { icon: <Code className="w-3.5 h-3.5" />, title: 'Developer API', path: '/developers/api' },
                      { icon: <TrendingUp className="w-3.5 h-3.5" />, title: 'Integrations', path: '/dashboard' },
                      { icon: <Map className="w-3.5 h-3.5" />, title: 'Product Roadmap', path: '/roadmap' },
                      { icon: <History className="w-3.5 h-3.5" />, title: 'Changelog updates', path: '/changelog' },
                      { icon: <HelpCircle className="w-3.5 h-3.5" />, title: 'Help Center', path: '/support' },
                      { icon: <Activity className="w-3.5 h-3.5" />, title: 'System Status', path: '/status' }
                    ].map((item, idx) => (
                      <Link 
                        key={idx}
                        href={item.path}
                        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition duration-150 text-slate-300 hover:text-white"
                      >
                        <div className="p-1 rounded bg-white/5 text-slate-400">
                          {item.icon}
                        </div>
                        <span className="text-[11px] font-semibold">{item.title}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* COMPANY DROPDOWN */}
            <div 
              className="relative py-2"
              onMouseEnter={() => handleMouseEnter('company')}
              onMouseLeave={handleMouseLeave}
            >
              <button 
                className="px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide text-slate-400 hover:text-white transition-all duration-200 flex items-center space-x-1.5 focus:outline-none"
              >
                <span>Company</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${activeDropdown === 'company' ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {activeDropdown === 'company' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.18 }}
                    className="absolute top-10 left-1/2 -translate-x-1/2 bg-[#0d0e19]/95 backdrop-blur-xl border border-white/[0.08] p-3 rounded-2xl w-[260px] shadow-[0_15px_40px_rgba(0,0,0,0.6)] flex flex-col gap-1 text-left"
                  >
                    {[
                      { icon: <Info className="w-3.5 h-3.5" />, title: 'About Us', path: '/company/about' },
                      { icon: <Users className="w-3.5 h-3.5" />, title: 'Careers', path: '/company/careers' },
                      { icon: <Mail className="w-3.5 h-3.5" />, title: 'Contact Sales', path: '/company/contact-sales' },
                      { icon: <ShieldCheck className="w-3.5 h-3.5" />, title: 'GDPR & Privacy', path: '/privacy' }
                    ].map((item: any, idx) => (
                      <Link 
                        key={idx}
                        href={item.path}
                        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-white/5 transition duration-150 text-slate-300 hover:text-white"
                      >
                        <div className="p-1 rounded bg-white/5 text-slate-400">
                          {item.icon}
                        </div>
                        <span className="text-[11px] font-semibold">{item.title}</span>
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center space-x-4">
            
            {/* COMMAND PALETTE SHORTCUT CHIP */}
            <button 
              onClick={() => setCommandPaletteOpen(true)}
              className="hidden md:flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.03] text-slate-400 hover:text-white hover:border-white/10 transition duration-150 focus:outline-none"
              aria-label="Open Command Palette"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold tracking-wider">Search</span>
              <kbd className="text-[8px] bg-white/10 px-1.5 py-0.5 rounded font-mono font-black text-slate-300 border border-white/5">
                ⌘K
              </kbd>
            </button>

            {/* LIVE DEMO GHOST BUTTON */}
            <Link href="/demo">
              <button 
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-full border border-white/[0.08] hover:border-white/20 text-xs font-semibold text-slate-300 hover:text-white bg-transparent hover:bg-white/5 transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.02)] focus:outline-none"
              >
                Live Demo
              </button>
            </Link>

            {mounted && user ? (
              <Link href="/dashboard">
                <button className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2 px-4 rounded-full flex items-center space-x-1 shadow-md shadow-brand-emerald/10 cursor-pointer transition-all duration-200 focus:outline-none">
                  <span>Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors hover:underline">
                  Log in
                </Link>
                <Link href="/signup">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-[#6C5CFF] to-[#8677FF] text-white font-bold text-xs py-2 px-4.5 rounded-full cursor-pointer transition-all duration-200 flex items-center space-x-1 shadow-[0_4px_15px_rgba(108,92,255,0.35)] hover:shadow-[0_4px_20px_rgba(108,92,255,0.5)] focus:outline-none group"
                  >
                    <span>Start Free</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </motion.button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex lg:hidden text-slate-400 hover:text-white p-1 focus:outline-none transition cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER NAVIGATION */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden bg-black/60 backdrop-blur-md"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-[280px] bg-[#09090c] border-l border-white/[0.08] p-6 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                  <ProoflyLogo iconSize={30} showText={true} />
                  <button onClick={() => setIsOpen(false)}>
                    <X className="w-5 h-5 text-slate-400 hover:text-white" />
                  </button>
                </div>

                <div className="flex flex-col space-y-1.5 text-left">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Navigation</span>
                  {[
                    { title: 'Product Features', id: 'features' },
                    { title: 'Wall of Love', id: 'showcase' },
                    { title: 'Pricing Plans', id: 'pricing' },
                    { title: 'Support FAQ', id: 'faq' }
                  ].map((item, idx) => (
                    <Link 
                      key={idx}
                      href={`/#${item.id}`}
                      onClick={(e) => { handleScrollToId(e, item.id); setIsOpen(false); }}
                      className="flex items-center justify-between p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition"
                    >
                      <span>{item.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </Link>
                  ))}
                </div>

                <div className="flex flex-col space-y-1.5 text-left pt-2 border-t border-white/5">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Actions</span>
                  <Link href="/demo" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition">
                    <span>Live Demo</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                  <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition">
                    <span>Login</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                  </Link>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <button className="w-full bg-gradient-to-r from-[#6C5CFF] to-[#8677FF] text-white font-bold text-xs py-3 rounded-xl flex items-center justify-center space-x-1.5 shadow-[0_4px_15px_rgba(108,92,255,0.35)]">
                    <span>Start Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LINEAR/RAYCAST INSPIRED COMMAND PALETTE DIALOG */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#020205]/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setCommandPaletteOpen(false)}
          >
            <motion.div 
              initial={{ scale: 0.96, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 260 }}
              className="bg-[#0b0c16] border border-white/[0.08] rounded-2xl w-full max-w-xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search input header */}
              <div className="flex items-center px-4 py-3.5 border-b border-white/[0.06] space-x-3 bg-white/[0.01]">
                <Search className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                <input 
                  ref={searchInputRef}
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSelectedIndex(0);
                  }}
                  onKeyDown={handleCommandKeyDown}
                  placeholder="Search pages, tools, docs, settings..."
                  className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none border-none"
                />
                <button 
                  onClick={() => setCommandPaletteOpen(false)}
                  className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.8 rounded text-slate-400 hover:text-white"
                >
                  ESC
                </button>
              </div>

              {/* Commands List */}
              <div className="max-h-[300px] overflow-y-auto p-2.5 flex flex-col gap-0.5">
                {filteredCommands.length > 0 ? (
                  filteredCommands.map((cmd, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectCommand(idx)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full text-left p-2.5 rounded-xl flex items-center justify-between transition-all border border-transparent ${
                        idx === selectedIndex 
                          ? 'bg-[#8677FF]/10 text-white border-[#8677FF]/20 shadow-[0_0_12px_rgba(108,92,255,0.1)]' 
                          : 'text-slate-350 hover:bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex flex-col space-y-0.5 text-left">
                        <span className="text-xs font-bold tracking-wide">{cmd.name}</span>
                        <span className="text-[9px] text-slate-500 font-medium">{cmd.description}</span>
                      </div>
                      
                      {idx === selectedIndex && (
                        <span className="text-[8px] uppercase font-black text-[#8677FF] bg-[#8677FF]/10 border border-[#8677FF]/20 px-2 py-0.5 rounded tracking-widest flex items-center space-x-0.5">
                          <span>Select</span>
                          <span>↵</span>
                        </span>
                      )}
                    </button>
                  ))
                ) : (
                  <div className="py-12 text-center flex flex-col items-center justify-center space-y-1.5 select-none">
                    <span className="text-zinc-600 text-xs">No matching commands found.</span>
                    <span className="text-[9px] text-zinc-500">Try searching "AI", "Pricing" or "Embeds"</span>
                  </div>
                )}
              </div>

              {/* Command Palette Footer */}
              <div className="border-t border-white/[0.06] bg-white/[0.01] px-4 py-2 flex items-center justify-between text-[8.5px] text-slate-500 select-none">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center space-x-1">
                    <kbd className="bg-white/5 border border-white/10 px-1 rounded font-mono">↑↓</kbd>
                    <span>to navigate</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <kbd className="bg-white/5 border border-white/10 px-1 rounded font-mono">↵</kbd>
                    <span>to select</span>
                  </span>
                </div>
                <span>Raycast integration</span>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
