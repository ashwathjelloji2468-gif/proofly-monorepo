'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowLeft, 
  Copy, 
  Check, 
  Settings, 
  Sliders, 
  Code, 
  Eye, 
  Star, 
  Play, 
  ChevronRight,
  Monitor,
  Smartphone,
  Info
} from 'lucide-react';
import { useStore, Testimonial } from '@/store/useStore';
import { SpotlightCard } from '@/components/SpotlightCard';

export default function DemoPlayground() {
  const testimonials = useStore(state => state.testimonials);
  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');

  // Customizer States
  const [layout, setLayout] = useState<'masonry' | 'grid' | 'carousel' | 'list'>('masonry');
  const [themeColor, setThemeColor] = useState<'emerald' | 'teal' | 'indigo' | 'slate'>('emerald');
  const [enableTilt, setEnableTilt] = useState(true);
  const [enableGlow, setEnableGlow] = useState(true);
  const [glowIntensity, setGlowIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [sortBy, setSortBy] = useState<'default' | 'ctr' | 'views' | 'trust'>('default');
  const [copied, setCopied] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Sort and Filter Logic
  const getSortedTestimonials = () => {
    let list = [...approvedTestimonials];
    if (sortBy === 'ctr') {
      // sort by clicks / views CTR
      list.sort((a, b) => (b.clicks / (b.views || 1)) - (a.clicks / (a.views || 1)));
    } else if (sortBy === 'views') {
      list.sort((a, b) => b.views - a.views);
    } else if (sortBy === 'trust') {
      list.sort((a, b) => (b.trustScore || 0) - (a.trustScore || 0));
    }
    return list;
  };

  const sortedList = getSortedTestimonials();

  // Color Mapping
  const colorMap = {
    emerald: {
      primary: '#6C5CFF',
      secondary: '#8677FF',
      glow: 'rgba(108, 92, 255, 0.08)',
      borderColor: (x: string, y: string) => `radial-gradient(180px circle at ${x} ${y}, rgba(108, 92, 255, 0.45) 0%, rgba(134, 119, 255, 0.25) 50%, transparent 100%)`
    },
    teal: {
      primary: '#8677FF',
      secondary: '#6C5CFF',
      glow: 'rgba(134, 119, 255, 0.08)',
      borderColor: (x: string, y: string) => `radial-gradient(180px circle at ${x} ${y}, rgba(134, 119, 255, 0.45) 0%, rgba(108, 92, 255, 0.25) 50%, transparent 100%)`
    },
    indigo: {
      primary: '#6366F1',
      secondary: '#8B5CF6',
      glow: 'rgba(99, 102, 241, 0.08)',
      borderColor: (x: string, y: string) => `radial-gradient(180px circle at ${x} ${y}, rgba(99, 102, 241, 0.45) 0%, rgba(139, 92, 246, 0.25) 50%, transparent 100%)`
    },
    slate: {
      primary: '#94A3B8',
      secondary: '#64748B',
      glow: 'rgba(148, 163, 184, 0.06)',
      borderColor: (x: string, y: string) => `radial-gradient(180px circle at ${x} ${y}, rgba(148, 163, 184, 0.4) 0%, rgba(100, 116, 139, 0.2) 50%, transparent 100%)`
    }
  };

  const activeColors = colorMap[themeColor];

  // Glow Intensity Adjustment
  let glowOpacityMultiplier = 1;
  if (glowIntensity === 'low') glowOpacityMultiplier = 0.4;
  if (glowIntensity === 'high') glowOpacityMultiplier = 1.8;

  const customizedGlowColor = enableGlow 
    ? activeColors.glow.replace('0.08', (0.08 * glowOpacityMultiplier).toString())
    : 'rgba(0,0,0,0)';

  // Carousel Index
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Generate Script String
  const generateEmbedScript = () => {
    return `<!-- PowerTestimonials Wall of Love Embed -->
<div id="pt-wall-widget" 
  data-space="acme-saas" 
  data-layout="${layout}" 
  data-theme="${themeColor}" 
  data-glow="${glowIntensity}"
  data-tilt="${enableTilt}"
  data-sort="${sortBy}">
</div>
<script src="https://cdn.powertestimonials.ai/widget.js" async defer></script>`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(generateEmbedScript());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen text-slate-200 relative flex flex-col justify-between">
      
      {/* Top Header Navigation */}
      <nav className="border-b border-border-primary/80 bg-[#09090B]/60 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <Link href="/" className="text-xs font-bold text-slate-400 hover:text-white flex items-center space-x-1.5 transition">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Exit Playground</span>
          </Link>
          <div className="h-4 w-px bg-border-primary" />
          <h1 className="text-xs font-black tracking-widest uppercase text-white flex items-center space-x-2">
            <Code className="w-4 h-4 text-brand-emerald" />
            <span>Developer Sandbox Playground</span>
          </h1>
        </div>

        <Link href="/dashboard">
          <button className="bg-brand-emerald hover:bg-brand-emerald-hover text-white text-[10px] font-black uppercase tracking-wider px-4 py-2 rounded-lg flex items-center space-x-1.5 cursor-pointer shadow shadow-brand-emerald/10 hover:shadow-brand-emerald/20 transition">
            <span>Enter Demo Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </Link>
      </nav>

      {/* Main Splits Workspace */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* Left Column: Live Customizer Panel */}
        <section className="lg:col-span-4 border-r border-border-primary/80 bg-[#09090B]/40 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-120px)]">
          <div className="space-y-1.5 border-b border-border-primary/40 pb-4">
            <h2 className="text-white text-sm font-black uppercase tracking-wide flex items-center space-x-1.5">
              <Sliders className="w-4 h-4 text-brand-teal" />
              <span>Widget Customizer</span>
            </h2>
            <p className="text-[11px] text-slate-400 leading-normal">
              Adjust widgets layout options and styling tokens in real-time. Embed snippets adapt automatically.
            </p>
          </div>

          {/* 1. Layout Selection */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Widget Display Layout</label>
            <div className="grid grid-cols-2 gap-2">
              {(['masonry', 'grid', 'carousel', 'list'] as const).map(mode => (
                <button
                  key={mode}
                  onClick={() => { setLayout(mode); setCarouselIndex(0); }}
                  className={`py-2 px-3 rounded-lg text-xs font-bold capitalize border cursor-pointer text-center transition ${
                    layout === mode 
                      ? 'bg-zinc-800 text-white border-brand-emerald shadow-md' 
                      : 'bg-zinc-900/60 text-slate-400 border-border-primary hover:text-white hover:border-zinc-700'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Color Theme Selection */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Theme Color Accent</label>
            <div className="grid grid-cols-4 gap-2">
              {(['emerald', 'teal', 'indigo', 'slate'] as const).map(color => {
                const colors = {
                  emerald: 'bg-[#6C5CFF]',
                  teal: 'bg-[#8677FF]',
                  indigo: 'bg-[#6366F1]',
                  slate: 'bg-[#64748B]'
                };
                return (
                  <button
                    key={color}
                    onClick={() => setThemeColor(color)}
                    className={`py-2 rounded-lg border text-[10px] font-extrabold capitalize cursor-pointer flex flex-col items-center justify-center space-y-1.5 transition ${
                      themeColor === color 
                        ? 'border-white bg-zinc-850 text-white' 
                        : 'border-border-primary bg-zinc-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${colors[color]}`} />
                    <span>{color === 'emerald' ? 'purple' : color === 'teal' ? 'lavender' : color}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. Micro-Interaction Toggles */}
          <div className="space-y-3">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Micro-Interactions</label>
            
            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-border-primary/80">
              <div>
                <span className="text-[11px] font-extrabold text-white block">3D Perspective Tilt</span>
                <span className="text-[9px] text-slate-400">Card responds to mouse movement coordinates</span>
              </div>
              <input
                type="checkbox"
                checked={enableTilt}
                onChange={(e) => setEnableTilt(e.target.checked)}
                className="w-4 h-4 rounded text-brand-emerald accent-brand-emerald focus:ring-0 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-border-primary/80">
              <div>
                <span className="text-[11px] font-extrabold text-white block">Aesthetic Glow Shadow</span>
                <span className="text-[9px] text-slate-400">Mesh spotlight overlays on card faces</span>
              </div>
              <input
                type="checkbox"
                checked={enableGlow}
                onChange={(e) => setEnableGlow(e.target.checked)}
                className="w-4 h-4 rounded text-brand-emerald accent-brand-emerald focus:ring-0 cursor-pointer"
              />
            </div>
          </div>

          {/* 4. Glow Intensity Selection */}
          {enableGlow && (
            <div className="space-y-2">
              <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">Glow Spotlight Density</label>
              <div className="flex items-center space-x-1.5 p-1 bg-zinc-900/80 border border-border-primary rounded-xl">
                {(['low', 'medium', 'high'] as const).map(intensity => (
                  <button
                    key={intensity}
                    onClick={() => setGlowIntensity(intensity)}
                    className={`flex-1 text-[10px] font-black uppercase py-2 rounded-lg cursor-pointer transition ${
                      glowIntensity === intensity ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 5. Smart Ranking */}
          <div className="space-y-2">
            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest block">AI Smart Sorting Rule</label>
            <div className="flex items-center space-x-1.5 p-1 bg-zinc-900/80 border border-border-primary rounded-xl">
              {(['default', 'ctr', 'views', 'trust'] as const).map(rule => (
                <button
                  key={rule}
                  onClick={() => setSortBy(rule)}
                  className={`flex-1 text-[9px] font-black uppercase py-2 rounded-lg cursor-pointer transition ${
                    sortBy === rule ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {rule}
                </button>
              ))}
            </div>
            <div className="bg-zinc-900/40 p-2.5 rounded-lg border border-border-primary/50 flex space-x-2 text-[9px] text-slate-400 italic">
              <Info className="w-3.5 h-3.5 text-brand-teal shrink-0 mt-0.5" />
              <span>
                {sortBy === 'default' && "Standard chronologically approved testimonials pipeline feed."}
                {sortBy === 'ctr' && "Highest Conversion Rate (Clicks/Views ratio) displayed first."}
                {sortBy === 'views' && "Testimonials attracting the highest traffic count sorted first."}
                {sortBy === 'trust' && "Power AI computed trust telemetry scores sorted descending."}
              </span>
            </div>
          </div>
        </section>

        {/* Right Column: Live View & Generated Code Playground */}
        <section className="lg:col-span-8 bg-[#09090B]/60 p-6 flex flex-col justify-between space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
          
          {/* Top Panel: Device Preview & Controls */}
          <div className="flex items-center justify-between border-b border-border-primary/40 pb-4">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-brand-emerald animate-pulse" />
              <span className="text-xs font-extrabold text-white uppercase tracking-wider">Live Embed Preview</span>
            </div>
            
            <div className="flex items-center space-x-1 p-0.5 bg-zinc-900/60 border border-border-primary rounded-lg">
              <button 
                onClick={() => setPreviewDevice('desktop')}
                className={`p-1.5 rounded cursor-pointer ${previewDevice === 'desktop' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setPreviewDevice('mobile')}
                className={`p-1.5 rounded cursor-pointer ${previewDevice === 'mobile' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Sandbox Frame */}
          <div className="flex-1 flex items-center justify-center py-6 min-h-[300px]">
            <div className={`transition-all duration-300 w-full ${previewDevice === 'mobile' ? 'max-w-[340px] border border-border-primary rounded-3xl p-4 bg-[#09090B] shadow-2xl h-[520px] overflow-y-auto' : 'max-w-full'}`}>
              
              {/* Actual Cards Render */}
              {layout === 'masonry' && (
                <div className={`grid gap-4 ${previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {sortedList.slice(0, 6).map((t) => (
                    <div key={t.id}>{renderCard(t)}</div>
                  ))}
                </div>
              )}

              {layout === 'grid' && (
                <div className={`grid gap-4 ${previewDevice === 'mobile' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
                  {sortedList.slice(0, 6).map((t) => (
                    <div key={t.id}>{renderCard(t)}</div>
                  ))}
                </div>
              )}

              {layout === 'list' && (
                <div className="space-y-4 max-w-xl mx-auto">
                  {sortedList.slice(0, 4).map((t) => (
                    <div key={t.id}>{renderCard(t)}</div>
                  ))}
                </div>
              )}

              {layout === 'carousel' && (
                <div className="max-w-xl mx-auto space-y-4 text-center">
                  <div>{renderCard(sortedList[carouselIndex] || sortedList[0])}</div>
                  <div className="flex justify-center space-x-1.5">
                    {sortedList.slice(0, 6).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCarouselIndex(idx)}
                        className={`w-2 h-2 rounded-full cursor-pointer transition ${
                          idx === carouselIndex ? 'bg-white w-4' : 'bg-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Bottom Panel: Code Playground */}
          <div className="space-y-3 bg-zinc-950 border border-border-primary rounded-2xl p-5 text-left relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-white">
                <Code className="w-4 h-4 text-brand-emerald" />
                <span className="text-xs font-black uppercase tracking-wider">HTML/JSX Integration Embed Code</span>
              </div>
              <button
                onClick={handleCopyCode}
                className="bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg flex items-center space-x-1.5 cursor-pointer border border-zinc-700 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Snippet'}</span>
              </button>
            </div>
            
            <pre className="text-[10px] text-slate-300 font-mono overflow-x-auto bg-[#09090B]/60 p-3 rounded-lg border border-border-primary/50 select-all leading-relaxed whitespace-pre-wrap">
              {generateEmbedScript()}
            </pre>
          </div>

        </section>

      </main>

    </div>
  );

  // Card rendering engine using reactive sandbox state overrides
  function renderCard(t: Testimonial) {
    const isVideo = !!t.video_url;
    
    // Dynamic Spotlight settings
    const activeBorderColor = `radial-gradient(180px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), ${activeColors.primary} 0%, ${activeColors.secondary} 40%, transparent 100%)`;

    return (
      <SpotlightCard
        className="p-5 flex flex-col justify-between space-y-4 h-full"
        hoverScale={isVideo ? 1.05 : 1.03}
        enableTilt={enableTilt}
        tiltMax={isVideo ? 4 : 5}
        glowColor={customizedGlowColor}
        borderColor={activeBorderColor}
      >
        <div className="space-y-3 text-left">
          {/* Stars & type */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3.5 h-3.5 fill-amber-400 text-amber-400 transition group-hover/spotlight:drop-shadow-[0_0_6px_rgba(245,158,11,0.85)]`} 
                />
              ))}
            </div>

            {/* Smart Ranking Highlight (Views / conversion label) */}
            <span 
              className="px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider"
              style={{
                backgroundColor: `${activeColors.primary}20`,
                border: `1px solid ${activeColors.primary}30`,
                color: activeColors.primary
              }}
            >
              {sortBy === 'ctr' && `${Math.round((t.clicks / (t.views || 1)) * 100)}% CTR`}
              {sortBy === 'views' && `${t.views} views`}
              {sortBy === 'trust' && `AI Trust Score: ${t.trustScore}%`}
              {sortBy === 'default' && (isVideo ? 'Video' : 'Text')}
            </span>
          </div>

          {/* AI highlights if available */}
          {t.bestQuoteHighlight && (
            <div 
              className="text-[9px] font-black tracking-wide uppercase px-2 py-0.5 rounded inline-block"
              style={{
                backgroundColor: `${activeColors.primary}10`,
                color: activeColors.primary,
                border: `1px solid ${activeColors.primary}20`
              }}
            >
              🔥 Best Quote: "{t.bestQuoteHighlight}"
            </div>
          )}

          {/* Review message */}
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed text-left whitespace-pre-wrap">
            "{t.review}"
          </p>

          {/* Autoplay Video Review */}
          {isVideo && (
            <div className="mt-2.5 rounded-lg overflow-hidden border border-border-primary bg-black aspect-video relative group/video">
              <video 
                src={t.video_url} 
                loop 
                muted 
                playsInline 
                autoPlay
                className="w-full h-full object-cover opacity-80 group-hover/spotlight:opacity-100 transition duration-300"
              />
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/spotlight:opacity-100 transition duration-300 flex items-center justify-center">
                <div 
                  className="text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center space-x-1.5 shadow-lg transform scale-90 group-hover/spotlight:scale-100 transition duration-300"
                  style={{
                    backgroundColor: activeColors.primary,
                    boxShadow: `0 0 15px ${activeColors.primary}50`
                  }}
                >
                  <Play className="w-3 h-3 fill-current text-white" />
                  <span>Watch Testimonial</span>
                </div>
              </div>

              <div className="absolute bottom-2 left-2 bg-[#09090B]/85 backdrop-blur text-[8px] font-black text-white px-2 py-0.5 rounded border border-border-primary/50 flex items-center space-x-1 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeColors.primary }} />
                <span>Live Video</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border-primary/50 pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img 
              src={t.reviewerAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + t.name} 
              alt={t.name} 
              className="w-8 h-8 rounded-full object-cover bg-[#09090B]"
            />
            <div className="text-left">
              <span className="font-bold text-xs text-white block">{t.name}</span>
              <span className="text-[10px] text-muted-foreground block truncate max-w-[120px]">{t.role}</span>
            </div>
          </div>

          <span 
            className="px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider"
            style={{
              backgroundColor: `${activeColors.primary}15`,
              color: activeColors.primary,
              border: `1px solid ${activeColors.primary}30`
            }}
          >
            {t.company || 'Customer'}
          </span>
        </div>
      </SpotlightCard>
    );
  }
}
