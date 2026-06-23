'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Code, 
  Sparkles, 
  Copy, 
  Check, 
  Layout, 
  Maximize2, 
  MessageSquare, 
  Sliders, 
  Smartphone, 
  Eye,
  Settings,
  Star,
  Quote
} from 'lucide-react';

export default function WidgetsPage() {
  const testimonials = useStore(state => state.testimonials);
  const collections = useStore(state => state.collections);

  const [activeWidgetTab, setActiveWidgetTab] = useState<'wall' | 'single' | 'slider' | 'badge'>('wall');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>('dark');
  const [borderRadius, setBorderRadius] = useState<'rounded-none' | 'rounded-lg' | 'rounded-2xl'>('rounded-lg');
  const [showRating, setShowRating] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [copied, setCopied] = useState(false);

  const getCodeSnippet = () => {
    const spaceVal = selectedCollectionId !== 'all' ? ` data-space="${selectedCollectionId}"` : '';
    const themeVal = ` data-theme="${themeMode}"`;
    const radiusVal = ` data-radius="${borderRadius}"`;
    const ratingVal = !showRating ? ` data-hide-stars="true"` : '';
    const dateVal = !showDate ? ` data-hide-date="true"` : '';

    switch (activeWidgetTab) {
      case 'wall':
        return `<script src="https://cdn.powertestimonials.com/wall-of-love.js"${spaceVal}${themeVal}${radiusVal}${ratingVal}${dateVal} defer></script>\n<div id="pt-wall"></div>`;
      case 'single':
        return `<script src="https://cdn.powertestimonials.com/single-card.js" data-id="test-1"${themeVal}${radiusVal} defer></script>\n<div id="pt-single-card"></div>`;
      case 'slider':
        return `<script src="https://cdn.powertestimonials.com/carousel.js"${spaceVal}${themeVal}${radiusVal}${ratingVal} defer></script>\n<div id="pt-carousel"></div>`;
      case 'badge':
        return `<script src="https://cdn.powertestimonials.com/floating-badge.js"${spaceVal} data-position="bottom-right"${themeVal} defer></script>`;
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(getCodeSnippet());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sampleTestimonial = testimonials[0] || {
    name: 'Sarah Jenkins',
    company: 'DevFlow Inc',
    role: 'CTO & Co-founder',
    review: 'Setting up Acme was incredibly fast. We integrated the REST APIs in less than 30 minutes, and our onboarding pipeline speed immediately doubled.',
    rating: 5,
    reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    createdAt: new Date().toISOString()
  };

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0">
      {/* Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
            <Code className="w-5 h-5 text-brand-emerald" />
            <span>Embed Widgets</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Configure and copy embed codes for various testimonial displays.</p>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl w-full text-left">
        
        {/* Left Columns: Configurator Panels */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Widget Type Selector */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-5 space-y-4 shadow-lg">
            <h3 className="text-xs font-black text-white flex items-center space-x-1.5 uppercase tracking-wider">
              <Layout className="w-4 h-4 text-brand-emerald" />
              <span>Widget Type</span>
            </h3>

            <div className="space-y-2">
              {[
                { id: 'wall', label: 'Wall of Love Masonry', desc: 'A full masonry layout for landing pages.' },
                { id: 'single', label: 'Single Feature Card', desc: 'Display a single standout testimonial.' },
                { id: 'slider', label: 'Horizontal Slider', desc: 'Slide reviews inside a narrow column container.' },
                { id: 'badge', label: 'Floating Popover Badge', desc: 'Floating widget in the corner of your page.' }
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveWidgetTab(item.id as any);
                    setCopied(false);
                  }}
                  className={`w-full text-left p-3 border rounded-xl transition ${
                    activeWidgetTab === item.id 
                      ? 'bg-brand-emerald/10 border-brand-emerald/40 text-white' 
                      : 'bg-[#09090B] border-border-primary text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold block">{item.label}</span>
                  <span className="text-[10px] text-muted-foreground block mt-0.5">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Style Configurator panel */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-5 space-y-4 shadow-lg">
            <h3 className="text-xs font-black text-white flex items-center space-x-1.5 uppercase tracking-wider">
              <Settings className="w-4 h-4 text-brand-teal" />
              <span>Customize Styles</span>
            </h3>

            {/* Source space selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider block">Source Space</label>
              <select
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs font-semibold py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
              >
                <option value="all">All Spaces</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/* Theme selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider block">Widget Theme</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'dark', label: 'Dark Theme' },
                  { id: 'light', label: 'Light Theme' }
                ].map(theme => (
                  <button
                    key={theme.id}
                    onClick={() => setThemeMode(theme.id as any)}
                    className={`text-xs font-bold py-1.5 rounded-lg border transition cursor-pointer ${
                      themeMode === theme.id
                        ? 'bg-brand-teal/15 text-brand-teal border-brand-teal/30'
                        : 'bg-[#09090B] text-slate-400 border-border-primary hover:text-white'
                    }`}
                  >
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Corner Radius */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-extrabold text-slate-300 uppercase tracking-wider block">Corner Shape</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'rounded-none', label: 'Square' },
                  { id: 'rounded-lg', label: 'Rounded' },
                  { id: 'rounded-2xl', label: 'Pill' }
                ].map(r => (
                  <button
                    key={r.id}
                    onClick={() => setBorderRadius(r.id as any)}
                    className={`text-[10px] font-semibold py-1 rounded border transition cursor-pointer ${
                      borderRadius === r.id
                        ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20'
                        : 'bg-[#09090B] text-slate-400 border-border-primary hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Card Content Toggles */}
            <div className="space-y-2 pt-3 border-t border-border-primary/50">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-slate-300 group-hover:text-white transition">Show Reviewer Stars</span>
                <input
                  type="checkbox"
                  checked={showRating}
                  onChange={(e) => setShowRating(e.target.checked)}
                  className="w-4 h-4 accent-brand-emerald cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-slate-300 group-hover:text-white transition">Show Submission Date</span>
                <input
                  type="checkbox"
                  checked={showDate}
                  onChange={(e) => setShowDate(e.target.checked)}
                  className="w-4 h-4 accent-brand-emerald cursor-pointer"
                />
              </label>
            </div>

          </div>

        </div>

        {/* Right Columns: Preview Panel & Embed Codes */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Live Preview Screen */}
          <div className="bg-[#18181B]/30 border border-border-primary rounded-xl p-6 shadow-2xl relative flex flex-col min-h-[300px]">
            <div className="flex items-center justify-between border-b border-border-primary/50 pb-3 mb-5">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-brand-teal" />
                <span className="text-xs font-bold text-slate-200">Interactive Preview Frame</span>
              </div>
              <span className="text-[9px] bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-2 py-0.5 rounded uppercase font-black">
                {activeWidgetTab} widget
              </span>
            </div>

            {/* Preview Canvas Area */}
            <div className={`flex-1 flex items-center justify-center p-6 ${themeMode === 'light' ? 'bg-[#F4F4F5] text-zinc-900' : 'bg-[#09090B] text-slate-100'} rounded-xl border border-border-primary/50 transition duration-300`}>
              
              {activeWidgetTab === 'wall' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {[1, 2].map((i) => (
                    <div 
                      key={i} 
                      className={`p-4 border ${themeMode === 'light' ? 'bg-white border-zinc-200 text-zinc-900 shadow-sm' : 'bg-[#18181B] border-border-primary text-slate-200'} ${borderRadius} space-y-3 text-left`}
                    >
                      <div className="flex items-center justify-between">
                        {showRating && (
                          <div className="flex space-x-0.5 text-amber-400">
                            {Array.from({ length: 5 }).map((_, st) => (
                              <Star key={st} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        )}
                        {showDate && <span className="text-[9px] text-zinc-500" suppressHydrationWarning>{new Date().toLocaleDateString()}</span>}
                      </div>
                      <p className="text-xs leading-relaxed">
                        "Acme is absolutely stunning. We have automated all our feedback processes and saved 10+ hours a week."
                      </p>
                      <div className="flex items-center space-x-2 border-t border-border-primary/20 pt-3">
                        <div className="w-7 h-7 rounded-full bg-brand-emerald flex items-center justify-center text-[10px] font-black text-white">
                          JD
                        </div>
                        <div>
                          <span className="text-[10px] font-bold block">John Doe</span>
                          <span className="text-[8px] text-zinc-500 block">Founder at SaaSify</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeWidgetTab === 'single' && (
                <div className={`p-6 border relative max-w-md w-full ${themeMode === 'light' ? 'bg-white border-zinc-200 shadow-md text-zinc-900' : 'bg-[#18181B] border-border-primary text-slate-200'} ${borderRadius} text-left space-y-4`}>
                  <Quote className="w-8 h-8 text-brand-emerald/20 absolute top-4 right-4" />
                  {showRating && (
                    <div className="flex space-x-0.5 text-amber-400">
                      {Array.from({ length: sampleTestimonial.rating }).map((_, st) => (
                        <Star key={st} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  )}
                  <p className="text-xs sm:text-sm leading-relaxed font-semibold">
                    "{sampleTestimonial.review}"
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-border-primary/20">
                    <div className="flex items-center space-x-2.5">
                      <img 
                        src={sampleTestimonial.reviewerAvatar} 
                        alt="avatar" 
                        className="w-8 h-8 rounded-full border border-border-primary object-cover" 
                      />
                      <div>
                        <span className="text-xs font-bold block">{sampleTestimonial.name}</span>
                        <span className="text-[9px] text-muted-foreground block">{sampleTestimonial.role} at {sampleTestimonial.company}</span>
                      </div>
                    </div>
                    {showDate && <span className="text-[9px] text-zinc-500 font-mono" suppressHydrationWarning>{new Date(sampleTestimonial.createdAt).toLocaleDateString()}</span>}
                  </div>
                </div>
              )}

              {activeWidgetTab === 'slider' && (
                <div className={`p-6 border max-w-sm w-full ${themeMode === 'light' ? 'bg-white border-zinc-200 shadow-md text-zinc-900' : 'bg-[#18181B] border-border-primary text-slate-200'} ${borderRadius} text-left space-y-4 relative overflow-hidden`}>
                  <div className="flex items-center justify-between text-zinc-500">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-brand-teal">Slider review</span>
                    {showDate && <span className="text-[9px] font-mono" suppressHydrationWarning>{new Date().toLocaleDateString()}</span>}
                  </div>
                  <p className="text-xs leading-relaxed">
                    "Setting up developer APIs was unbelievably straightforward. Exceptional experience!"
                  </p>
                  <div className="flex items-center justify-between border-t border-border-primary/20 pt-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center text-[9px] font-black">
                        MJ
                      </div>
                      <span className="text-[10px] font-bold">Marcus Jenkins</span>
                    </div>
                    {showRating && (
                      <div className="flex space-x-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, st) => (
                          <Star key={st} className="w-2.5 h-2.5 fill-current" />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeWidgetTab === 'badge' && (
                <div className="relative h-44 w-full flex flex-col justify-end items-end">
                  <div className="bg-brand-emerald text-white rounded-full p-2.5 flex items-center space-x-2 shadow-lg shadow-brand-emerald/20 cursor-pointer hover:scale-105 transition duration-200">
                    <Sparkles className="w-4 h-4 text-white" />
                    <span className="text-[10px] font-black uppercase tracking-wider pr-1">Trusted by 10k+</span>
                  </div>
                  <div className={`absolute bottom-12 right-0 p-4 border max-w-[240px] ${themeMode === 'light' ? 'bg-white border-zinc-200 shadow-xl text-zinc-900' : 'bg-[#18181B] border-border-primary text-slate-200'} ${borderRadius} text-left space-y-2`}>
                    <p className="text-[10px] leading-relaxed">
                      "Devs love this software. 10 hours saved weekly."
                    </p>
                    <div className="flex items-center space-x-1.5">
                      <div className="w-5 h-5 rounded-full bg-brand-emerald text-white text-[8px] font-black flex items-center justify-center">S</div>
                      <span className="text-[9px] font-bold">Sarah, CTO</span>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Embed Script Section */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-5 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-white flex items-center space-x-1.5 uppercase tracking-wider">
                <Code className="w-4 h-4 text-brand-emerald" />
                <span>Embed Code Snippet</span>
              </h3>
              <button
                onClick={copyCode}
                className="bg-[#09090B] hover:bg-[#18181B] text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-border-primary cursor-pointer transition flex items-center space-x-1.5 text-xs font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Add this code snippet to your website HTML codebase where you want the testimonial display to load.
            </p>

            <div className="bg-[#09090B] border border-border-primary/80 rounded-lg p-4 relative">
              <pre className="text-xs font-mono text-zinc-500 overflow-x-auto whitespace-pre-wrap scrollbar-thin">
                {getCodeSnippet()}
              </pre>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
