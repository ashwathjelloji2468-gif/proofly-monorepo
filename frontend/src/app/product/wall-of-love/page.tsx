'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Heart, 
  Grid as GridIcon, 
  Columns, 
  LayoutList, 
  Copy, 
  Sparkles,
  Sliders,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function WallOfLovePage() {
  // Testimonials Mock data
  const testimonials = [
    {
      id: 't-1',
      name: 'J. Ashwath',
      role: 'SaaS Founder',
      company: 'DevFlow Inc.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      review: 'Setup took less than 15 minutes! We integrated the REST APIs in less than 30 minutes, and our onboarding pipeline speed immediately doubled.',
      rating: 5
    },
    {
      id: 't-2',
      name: 'Ateeqhulla Khan',
      role: 'Product Lead',
      company: 'TaskGrid',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      review: 'We increased conversion rates by 18% for our clients in week 1. Generating widgets is seamless, and embedding takes only 1 line of HTML code.',
      rating: 5
    },
    {
      id: 't-3',
      name: 'Ateeqhulla Khan',
      role: 'Growth Hacker',
      company: 'LaunchPad',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      review: 'Video collection is friction-free. Customers record short video reviews right from their mobile browser without downloading anything.',
      rating: 5
    }
  ];

  // Configurator states
  const [layoutMode, setLayoutMode] = useState<'grid' | 'masonry' | 'carousel'>('grid');
  const [cardTheme, setCardTheme] = useState<'glass' | 'dark' | 'neon'>('glass');
  const [borderRadius, setBorderRadius] = useState<'md' | 'xl' | 'none'>('xl');
  const [showStars, setShowStars] = useState(true);
  const [starColor, setStarColor] = useState('#F59E0B'); // Orange/Amber
  const [copied, setCopied] = useState(false);

  // Styling maps
  const borderClass = {
    md: 'rounded-xl',
    xl: 'rounded-2xl',
    none: 'rounded-none'
  };

  const themeClass = {
    glass: 'bg-[#0c0d16]/75 backdrop-blur-xl border border-white/5 shadow-2xl',
    dark: 'bg-zinc-950 border border-zinc-800/80 shadow-md',
    neon: 'bg-[#030303] border border-[#6366F1]/20 shadow-[0_0_15px_rgba(134,119,255,0.06)]'
  };

  const handleCopyCode = () => {
    const embedScript = `<div id="proofly-widget-container" data-space-id="acme-saas" data-layout="${layoutMode}" data-theme="${cardTheme}"></div>\n<script src="https://cdn.proofly.co/widget.js" async></script>`;
    navigator.clipboard.writeText(embedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans ">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-8 w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#6366F1]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <span className="bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3.5 animate-pulse">
          Wall of Love Builder
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none max-w-3xl mx-auto">
          Display social proof <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-teal via-brand-emerald to-[#6366F1] bg-clip-text text-transparent">
            with absolute elegance
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-4 leading-relaxed">
          Embed interactive walls on your landing pages. Customize spacing, layouts, and cards to match your site branding flawlessly.
        </p>
      </section>

      {/* Builder Workspace Area */}
      <section className="max-w-7xl mx-auto px-6 pb-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Configurator Controls (4 Columns) */}
        <div className="lg:col-span-4 bg-[#0c0d16] border border-white/[0.06] rounded-2xl p-6 space-y-6 shadow-2xl text-left relative">
          <div className="flex items-center space-x-2 border-b border-white/5 pb-3">
            <Sliders className="w-4 h-4 text-[#6366F1]" />
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-200">Wall Configurator</h2>
          </div>

          {/* Layout Toggle */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Choose Layout</label>
            <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-1.5 rounded-xl border border-white/[0.05]">
              <button
                onClick={() => setLayoutMode('grid')}
                className={`py-1.5 rounded-lg flex flex-col items-center justify-center space-y-1 transition duration-200 cursor-pointer ${
                  layoutMode === 'grid' ? 'bg-[#6366F1] text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <GridIcon className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Grid</span>
              </button>
              <button
                onClick={() => setLayoutMode('masonry')}
                className={`py-1.5 rounded-lg flex flex-col items-center justify-center space-y-1 transition duration-200 cursor-pointer ${
                  layoutMode === 'masonry' ? 'bg-[#6366F1] text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Masonry</span>
              </button>
              <button
                onClick={() => setLayoutMode('carousel')}
                className={`py-1.5 rounded-lg flex flex-col items-center justify-center space-y-1 transition duration-200 cursor-pointer ${
                  layoutMode === 'carousel' ? 'bg-[#6366F1] text-white shadow-lg' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="text-[11px] font-bold">Carousel</span>
              </button>
            </div>
          </div>

          {/* Card Theme */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Card Style</label>
            <div className="grid grid-cols-3 gap-2">
              {['glass', 'dark', 'neon'].map((themeName) => (
                <button
                  key={themeName}
                  onClick={() => setCardTheme(themeName as any)}
                  className={`py-2 text-[10px] font-bold rounded-xl border transition duration-200 cursor-pointer uppercase ${
                    cardTheme === themeName 
                      ? 'border-[#6366F1] bg-[#6366F1]/10 text-white font-black' 
                      : 'border-white/[0.06] bg-zinc-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {themeName}
                </button>
              ))}
            </div>
          </div>

          {/* Border Radius */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Corner Roundness</label>
            <div className="grid grid-cols-3 gap-2">
              {['md', 'xl', 'none'].map((radiusName) => (
                <button
                  key={radiusName}
                  onClick={() => setBorderRadius(radiusName as any)}
                  className={`py-2 text-[10px] font-bold rounded-xl border transition duration-200 cursor-pointer uppercase ${
                    borderRadius === radiusName 
                      ? 'border-[#6366F1] bg-[#6366F1]/10 text-white font-black' 
                      : 'border-white/[0.06] bg-zinc-950 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {radiusName}
                </button>
              ))}
            </div>
          </div>

          {/* Show Stars Toggle */}
          <div className="bg-zinc-950 border border-white/[0.06] p-3 rounded-xl flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-300">Show Review Stars</span>
            <input 
              type="checkbox" 
              checked={showStars} 
              onChange={(e) => setShowStars(e.target.checked)}
              className="w-4 h-4 rounded text-[#6366F1] accent-[#6366F1] cursor-pointer"
            />
          </div>

          {/* Star Color swatch picker */}
          {showStars && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Star Accent Color</label>
              <div className="flex items-center space-x-3">
                {['#F59E0B', '#EF4444', '#10B981', '#4338CA'].map((colorHex, idx) => (
                  <button
                    key={idx}
                    onClick={() => setStarColor(colorHex)}
                    className={`w-6 h-6 rounded-full border-2 transition duration-200 relative ${
                      starColor === colorHex ? 'border-white scale-110 shadow-lg' : 'border-transparent hover:scale-105'
                    }`}
                    style={{ backgroundColor: colorHex }}
                  />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Live Interactive Wall Preview (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col space-y-6">
          
          {/* Main Visual Wall Grid Preview Frame */}
          <div className="bg-zinc-950/60 border border-white/[0.06] rounded-3xl p-6 min-h-[350px] flex flex-col justify-center relative overflow-hidden">
            
            {/* Background decorative glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#6366F1]/5 rounded-full blur-[90px] pointer-events-none -z-10" />

            <div className={`w-full gap-4 transition-all duration-300 ${
              layoutMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2' 
                : layoutMode === 'masonry' 
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'flex items-center space-x-4 overflow-x-auto pb-4 scrollbar-none'
            }`}>
              {testimonials.map((t) => (
                <div 
                  key={t.id}
                  className={`p-5 text-left transition-all duration-300 shrink-0 ${
                    layoutMode === 'carousel' ? 'w-[260px]' : 'w-full'
                  } ${themeClass[cardTheme]} ${borderClass[borderRadius]}`}
                >
                  <div className="flex items-center space-x-3 mb-3 border-b border-white/5 pb-2.5">
                    <img 
                      src={t.avatar} 
                      alt={t.name}
                      className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                    />
                    <div className="leading-none text-left">
                      <span className="text-[11px] font-bold text-white block">{t.name}</span>
                      <span className="text-[11px] text-zinc-500 block mt-0.5">{t.role} at {t.company}</span>
                    </div>
                  </div>

                  {showStars && (
                    <div className="flex space-x-0.5 mb-2.5">
                      {[...Array(t.rating)].map((_, i) => (
                        <span key={i} className="text-xs " style={{ color: starColor }}>★</span>
                      ))}
                    </div>
                  )}

                  <p className="text-[10px] text-slate-300 leading-relaxed italic">
                    "{t.review}"
                  </p>
                </div>
              ))}
            </div>

          </div>

          {/* Code snippet display */}
          <div className="bg-[#0c0d16] border border-white/[0.06] rounded-2xl p-5 shadow-2xl text-left space-y-3">
            <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
              <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Embed Code Snippet</span>
              <button
                onClick={handleCopyCode}
                className="bg-white/5 hover:bg-white/10 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg border border-white/10 transition flex items-center space-x-1.5 cursor-pointer focus:outline-none"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-brand-emerald" />
                    <span className="text-brand-emerald">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            
            <pre className="w-full bg-[#030303] border border-white/[0.05] p-4 rounded-xl text-[11px] sm:text-[10px] font-mono text-zinc-400 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {`<div id="proofly-widget-container" data-space-id="acme-saas" data-layout="${layoutMode}" data-theme="${cardTheme}"></div>\n<script src="https://cdn.proofly.co/widget.js" async></script>`}
            </pre>
          </div>

        </div>

      </section>

      <Footer />
    </div>
  );
}
