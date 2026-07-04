'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { WallOfLoveShowcase } from '@/components/WallOfLoveShowcase';
import { 
  Heart, 
  Sparkles, 
  LayoutGrid, 
  Columns, 
  Sliders, 
  List, 
  Code, 
  Copy, 
  Eye, 
  Settings, 
  Check, 
  Filter, 
  Star 
} from 'lucide-react';

export default function WallOfLovePage() {
  const testimonials = useStore(state => state.testimonials);
  const collections = useStore(state => state.collections);

  // Configuration States
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  const [layout, setLayout] = useState<'masonry' | 'grid' | 'carousel' | 'list'>('masonry');
  const [onlyVideo, setOnlyVideo] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  // Filter approved testimonials based on controls
  const approvedTestimonials = testimonials.filter(t => {
    if (t.status !== 'approved') return false;
    if (selectedCollectionId !== 'all' && t.collection_id !== selectedCollectionId) return false;
    if (onlyVideo && !t.video_url) return false;
    if (t.rating < minRating) return false;
    return true;
  });

  const getEmbedCode = () => {
    const spaceQuery = selectedCollectionId !== 'all' ? `&space=${selectedCollectionId}` : '';
    const layoutQuery = `&layout=${layout}`;
    const videoQuery = onlyVideo ? `&video=true` : '';
    const ratingQuery = minRating > 0 ? `&rating=${minRating}` : '';
    return `<script src="https://cdn.proofly.com/widget.js" data-id="${selectedCollectionId}"${layoutQuery}${videoQuery}${ratingQuery} defer></script>\n<div id="pt-wall-of-love"></div>`;
  };

  const copyEmbedCode = () => {
    navigator.clipboard.writeText(getEmbedCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0">
      {/* Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
            <Heart className="w-5 h-5 text-brand-emerald fill-brand-emerald/20" />
            <span>Wall of Love Builder</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Design and customize a stunning testimonial display for your website.</p>
        </div>
      </header>

      {/* Builder Layout Workspace */}
      <main className="p-8 grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl w-full text-left">
        
        {/* Left Side: Customize Control Panel */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-5 space-y-5 shadow-lg">
            <h3 className="text-xs font-black text-white flex items-center space-x-1.5 uppercase tracking-wider">
              <Settings className="w-4 h-4 text-brand-teal" />
              <span>Customize Widget</span>
            </h3>

            {/* Filter by Space Collection */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">Source Space</label>
              <select
                value={selectedCollectionId}
                onChange={(e) => setSelectedCollectionId(e.target.value)}
                className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs font-semibold py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
              >
                <option value="all">All Approved Reviews</option>
                {collections.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
            </div>

            {/* Widget layout selector */}
            <div className="space-y-2">
              <label className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">Layout Style</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'masonry', label: 'Masonry', icon: <Columns className="w-3.5 h-3.5" /> },
                  { id: 'grid', label: 'Grid', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
                  { id: 'carousel', label: 'Carousel', icon: <Sliders className="w-3.5 h-3.5" /> },
                  { id: 'list', label: 'List', icon: <List className="w-3.5 h-3.5" /> }
                ].map(item => {
                  const isActive = layout === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setLayout(item.id as any)}
                      className={`flex items-center space-x-1.5 px-3 py-2 border rounded-lg text-xs font-semibold cursor-pointer transition ${
                        isActive 
                          ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30' 
                          : 'bg-[#09090B] text-slate-400 border-border-primary hover:text-white'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content Filters */}
            <div className="space-y-4 pt-4 border-t border-border-primary/50">
              <h4 className="text-[10px] font-extrabold text-brand-teal uppercase tracking-widest flex items-center space-x-1">
                <Filter className="w-3 h-3" />
                <span>Filters</span>
              </h4>

              {/* Toggles */}
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-slate-300 group-hover:text-white transition">Only Video Testimonials</span>
                <input
                  type="checkbox"
                  checked={onlyVideo}
                  onChange={(e) => setOnlyVideo(e.target.checked)}
                  className="w-4 h-4 accent-brand-emerald cursor-pointer"
                />
              </label>

              {/* Minimum Stars */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-extrabold text-slate-300 uppercase tracking-wider block">Minimum Rating</span>
                <div className="flex items-center space-x-1">
                  {[0, 3, 4, 5].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setMinRating(stars)}
                      className={`text-[10px] font-bold py-1 px-2.5 rounded border transition cursor-pointer ${
                        minRating === stars
                          ? 'bg-brand-teal/15 text-brand-teal border-brand-teal/30'
                          : 'bg-[#09090B] text-slate-400 border-border-primary hover:text-white'
                      }`}
                    >
                      {stars === 0 ? 'All' : `${stars}★ +`}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Embed code prompt box */}
            <div className="pt-4 border-t border-border-primary/50 space-y-2">
              <h4 className="text-[10px] font-extrabold text-white uppercase tracking-wider flex items-center space-x-1">
                <Code className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Embed Code</span>
              </h4>
              <p className="text-[10px] text-muted-foreground">Copy and paste this script where you want the Wall of Love to render.</p>
              <div className="bg-[#09090B] border border-border-primary/80 rounded-lg p-2.5 relative">
                <pre className="text-[11px] font-mono text-zinc-500 overflow-x-auto whitespace-pre-wrap h-16 scrollbar-thin">
                  {getEmbedCode()}
                </pre>
                <button
                  onClick={copyEmbedCode}
                  className="absolute bottom-2 right-2 bg-[#18181B] hover:bg-[#27272A] text-slate-400 hover:text-white p-1.5 rounded border border-border-primary cursor-pointer transition flex items-center space-x-1 text-[11px] font-bold"
                >
                  {copied ? <Check className="w-3 h-3 text-brand-emerald" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Side: Live Interactive Widget Canvas Previewer */}
        <section className="lg:col-span-3 space-y-6">
          <div className="bg-[#18181B]/40 border border-border-primary rounded-xl p-8 shadow-2xl relative min-h-[400px] flex flex-col justify-between">
            {/* Background Grid Pattern decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none rounded-xl" />
            
            {/* Preview Banner */}
            <div className="relative shrink-0 flex items-center justify-between border-b border-border-primary/50 pb-4 mb-6">
              <div className="flex items-center space-x-2">
                <Eye className="w-4 h-4 text-brand-emerald" />
                <span className="text-xs font-bold text-slate-200">Interactive Canvas Preview</span>
              </div>
              <span className="text-[11px] bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald px-2 py-0.5 rounded-full font-black uppercase">
                {approvedTestimonials.length} Reviews Loaded
              </span>
            </div>

            {/* Display widget element dynamically */}
            <div className="relative flex-1">
              <WallOfLoveShowcase 
                testimonials={approvedTestimonials} 
                layout={layout} 
              />
            </div>

            {/* Hint message footer */}
            <div className="relative border-t border-border-primary/40 pt-4 mt-6 text-[10px] text-muted-foreground flex items-center justify-between">
              <span>* Testimonials must be Approved in the Inbox to appear in this live widget.</span>
              <span className="text-brand-teal font-black flex items-center space-x-0.5 uppercase">
                <Sparkles className="w-3 h-3 text-brand-emerald animate-pulse" />
                <span>Responsive Frame</span>
              </span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
