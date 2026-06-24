'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, Star, Play, MessageSquare, Video, HelpCircle, Code, Layers, Copy, Check } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WallOfLoveShowcase } from '@/components/WallOfLoveShowcase';
import { useStore } from '@/store/useStore';
import { SpotlightCard } from '@/components/SpotlightCard';

export default function LiveDemoPage() {
  const testimonials = useStore(state => state.testimonials);
  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');
  const [layoutMode, setLayoutMode] = useState<'masonry' | 'grid' | 'carousel' | 'list'>('masonry');
  
  // Simulated AI Insights State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<'ALL' | 'POSITIVE' | 'NEUTRAL'>('ALL');
  
  // Embed Copy Generator State
  const [theme, setTheme] = useState<'dark' | 'light' | 'emerald'>('dark');
  const [glowEnabled, setGlowEnabled] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleQueryClick = (q: string) => {
    setSearchQuery(q);
    setActiveSearchQuery(q);
  };

  const getFilteredReviews = () => {
    let list = [...approvedTestimonials];

    // Filter by sentiment
    if (selectedSentiment !== 'ALL') {
      list = list.filter(t => t.sentiment === selectedSentiment);
    }

    // Filter by search query
    if (activeSearchQuery) {
      const q = activeSearchQuery.toLowerCase();
      list = list.filter(t => 
        t.review.toLowerCase().includes(q) ||
        t.name.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q) ||
        t.company.toLowerCase().includes(q) ||
        t.keywords.some(kw => kw.toLowerCase().includes(q))
      );
    }

    return list;
  };

  const activeReviews = getFilteredReviews();

  const getEmbedCode = () => {
    return `<iframe src="https://proofly.com/embed/wall-of-love?theme=${theme}&glow=${glowEnabled}" width="100%" height="650" style="border:none; border-radius:12px; background:transparent;" defer></iframe>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col relative">
      <Navbar />

      {/* Hero Header */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-16 text-center space-y-6 relative w-full">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[600px] h-[250px] bg-brand-teal/5 rounded-full blur-[140px] pointer-events-none" />
        
        <div className="inline-flex items-center space-x-2 bg-brand-teal/10 border border-brand-teal/20 text-[#2DD4BF] text-xs font-semibold px-4 py-1.5 rounded-full">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Interactive Playground - No Sign Up Required</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none max-w-4xl mx-auto">
          Proofly <span className="bg-gradient-to-r from-brand-emerald to-brand-teal bg-clip-text text-transparent">Live Demo Sandbox</span>
        </h1>
        
        <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Test drive the live Wall of Love experience. Sort, filter, and inspect AI semantic search queries inside a real 12-item database. Customize themes and generate iframe codes instantly.
        </p>

        <div className="flex justify-center">
          <Link href="/">
            <button className="bg-zinc-900 hover:bg-zinc-850 border border-border-primary text-slate-300 hover:text-white px-5 py-3 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-2 cursor-pointer transition">
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Homepage</span>
            </button>
          </Link>
        </div>
      </section>

      {/* Interactive AI Insights Sandbox */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left panel: Filters & AI Search */}
          <div className="lg:col-span-4 space-y-6">
            <SpotlightCard className="p-6 space-y-5 text-left" glowColor="rgba(108, 92, 255, 0.08)">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#8677FF] uppercase tracking-widest block">AI Semantic Engine</span>
                <h3 className="text-white text-base font-extrabold">Instant Database Search</h3>
              </div>

              {/* Natural Query suggestion buttons */}
              <div className="space-y-2">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Suggested Queries</span>
                <div className="flex flex-wrap gap-1.5">
                  {['API', 'onboarding', 'Founder', 'webcam', 'conversion'].map((q) => (
                    <button
                      key={q}
                      onClick={() => handleQueryClick(q)}
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition cursor-pointer select-none ${
                        activeSearchQuery === q
                          ? 'bg-brand-emerald text-white border-brand-emerald'
                          : 'bg-zinc-900/60 text-slate-400 border-border-primary hover:text-white'
                      }`}
                    >
                      "{q}"
                    </button>
                  ))}
                  {activeSearchQuery && (
                    <button
                      onClick={() => { setSearchQuery(''); setActiveSearchQuery(''); }}
                      className="text-[10px] font-black text-red-400 bg-red-950/20 border border-red-900/30 px-2.5 py-1 rounded-full cursor-pointer hover:bg-red-950/40"
                    >
                      Clear Filter
                    </button>
                  )}
                </div>
              </div>

              {/* Custom Input */}
              <div className="space-y-1">
                <input
                  type="text"
                  placeholder="Type anything (e.g. support, bounce)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && setActiveSearchQuery(searchQuery)}
                  className="w-full bg-[#09090B] border border-border-primary p-2.5 text-xs text-slate-300 rounded-lg outline-none focus:border-brand-emerald"
                />
                <span className="text-[9px] text-zinc-500 font-medium block">Press Enter to run query search</span>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-6 space-y-4 text-left" glowColor="rgba(20, 184, 166, 0.08)">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-[#2DD4BF] uppercase tracking-widest block">Sentiment Filters</span>
                <h3 className="text-white text-base font-extrabold">Filter by Emotional Tone</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ALL', label: 'All Reviews' },
                  { id: 'POSITIVE', label: '🟢 Positive' },
                  { id: 'NEUTRAL', label: '🔵 Neutral' }
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSentiment(s.id as any)}
                    className={`p-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-center border cursor-pointer transition ${
                      selectedSentiment === s.id
                        ? 'bg-brand-teal/15 text-brand-teal border-brand-teal'
                        : 'bg-zinc-900/60 text-slate-400 border-border-primary hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </SpotlightCard>

            {/* Simulated Live Stats */}
            <SpotlightCard className="p-6 space-y-4 text-left" glowColor="rgba(16, 185, 129, 0.08)">
              <div className="space-y-1">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Widget Analytics</span>
                <h3 className="text-white text-base font-extrabold">Active Embed Statistics</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#09090B] border border-border-primary/80 p-3 rounded-lg text-center">
                  <span className="text-[9px] text-zinc-500 font-extrabold block">TOTAL VIEWS</span>
                  <span className="text-sm font-black text-white font-mono">18,520</span>
                </div>
                <div className="bg-[#09090B] border border-border-primary/80 p-3 rounded-lg text-center">
                  <span className="text-[9px] text-zinc-500 font-extrabold block">TOTAL CLICKS</span>
                  <span className="text-sm font-black text-white font-mono">4,195</span>
                </div>
              </div>
            </SpotlightCard>
          </div>

          {/* Right panel: Showcase Live Preview with layouts tab */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-[#18181B]/40 border border-border-primary p-3 rounded-xl backdrop-blur">
              <div className="flex items-center space-x-2 pl-2">
                <Layers className="w-4 h-4 text-brand-emerald" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-300">Layout Selectors</span>
              </div>
              
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'masonry', label: '📊 Masonry Grid' },
                  { id: 'grid', label: '🔲 Equal Grid' },
                  { id: 'carousel', label: '🎠 Carousel Slider' },
                  { id: 'list', label: '📝 Single List' }
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setLayoutMode(mode.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition ${
                      layoutMode === mode.id
                        ? 'bg-brand-emerald text-white border border-brand-emerald/20 shadow-md'
                        : 'bg-zinc-900 hover:bg-zinc-850 text-slate-400 border border-border-primary/40'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Display the active grid */}
            <div className="min-h-[500px] border border-border-primary/60 bg-[#18181B]/20 p-6 rounded-2xl relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-brand-emerald/5 rounded-full blur-[100px] pointer-events-none" />
              
              {activeReviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px] space-y-3">
                  <span className="text-4xl">🔍</span>
                  <h4 className="text-white text-sm font-bold">No matching reviews found</h4>
                  <p className="text-slate-400 text-xs max-w-xs mx-auto">Try typing a different keyword or clearing your search queries.</p>
                </div>
              ) : (
                <WallOfLoveShowcase testimonials={activeReviews} layout={layoutMode} />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Widget Embed Code Generator */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full border-t border-border-primary">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 text-left space-y-4">
            <div className="inline-flex items-center space-x-2 bg-brand-emerald/10 border border-brand-emerald/20 text-[#8677FF] text-xs font-semibold px-3 py-1 rounded-full">
              <Code className="w-3.5 h-3.5" />
              <span>Embed configuration</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
              Get widget iframe embeds instantly
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Use our live snippet generator to configure styles. Choose themes, enable glowing border highlights, and copy clean copy-pasteable iframe script tags directly into your client products.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="space-y-1.5">
                <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider block">Widget Theme Color</span>
                <div className="flex space-x-2">
                  {['dark', 'light', 'emerald'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTheme(t as any)}
                      className={`px-3 py-1.5 rounded text-xs font-bold uppercase cursor-pointer border transition ${
                        theme === t 
                          ? 'bg-zinc-800 text-white border-brand-emerald' 
                          : 'bg-[#18181B] text-zinc-400 border-border-primary hover:text-white'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <input
                  type="checkbox"
                  id="glow-config"
                  checked={glowEnabled}
                  onChange={(e) => setGlowEnabled(e.target.checked)}
                  className="rounded border-zinc-800 text-brand-emerald focus:ring-brand-emerald w-4 h-4 bg-zinc-950"
                />
                <label htmlFor="glow-config" className="text-xs text-slate-300 font-bold cursor-pointer select-none">
                  Enable Border Glowing Hover Spotlight Effects
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <SpotlightCard className="p-6 space-y-4 text-left" glowColor="rgba(20, 184, 166, 0.1)">
              <div className="flex items-center justify-between border-b border-border-primary/50 pb-3">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Iframe Code Snippet</span>
                <span className="text-[9px] font-mono text-zinc-500">HTML embed code</span>
              </div>
              <div className="bg-[#09090B] border border-border-primary p-4 rounded-lg overflow-x-auto">
                <code className="text-xs text-brand-teal block whitespace-normal break-all font-mono leading-relaxed select-all">
                  {getEmbedCode()}
                </code>
              </div>
              
              <button
                onClick={copyEmbedCode}
                className="w-full bg-brand-emerald hover:opacity-90 text-white py-3.5 rounded-lg text-xs font-black uppercase tracking-widest flex items-center justify-center space-x-2 transition cursor-pointer active:scale-98 shadow-md shadow-brand-emerald/10"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied Embed Code!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Embed Code Snippet</span>
                  </>
                )}
              </button>
            </SpotlightCard>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
