'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Sparkles, 
  Search, 
  ThumbsUp, 
  MessageSquare, 
  Share2, 
  Copy,
  BrainCircuit,
  CornerDownRight,
  User,
  Heart,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AIWorkspacePage() {
  // Testimonials Mock Database
  const mockTestimonials = [
    {
      id: 't-1',
      name: 'J. Ashwath',
      role: 'SaaS Founder',
      company: 'DevFlow Inc.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      review: 'Setup took less than 15 minutes! We integrated the REST APIs in less than 30 minutes, and our onboarding pipeline speed immediately doubled. The developer documentation is absolutely state-of-the-art.',
      sentiment: 'POSITIVE',
      score: 99.4,
      tags: ['onboarding', 'rest-api', 'fast-setup'],
      aiSummary: 'J. Ashwath integrated the platform in under 15 minutes, noting that developer integration speed doubled and documentation was top-tier.',
      socialTwitter: '🚀 Just migrated to Proofly! Onboarding speed doubled instantly, setup took less than 15 minutes. Highly recommended for SaaS founders.',
      socialLinkedIn: 'Integrating social proof usually takes hours of developer configuration. With Proofly, we got the REST APIs running in under 30 minutes. The results? Double the onboarding pipeline speed.'
    },
    {
      id: 't-2',
      name: 'Ateeqhulla Khan',
      role: 'Product Lead',
      company: 'TaskGrid',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      review: 'We increased conversion rates by 18% for our clients in week 1. Generating widgets is seamless, and embedding takes only 1 line of HTML code. Best investment of the year.',
      sentiment: 'POSITIVE',
      score: 98.2,
      tags: ['conversion-lift', 'embeds', 'widgets'],
      aiSummary: 'James reports an 18% conversion rate lift within the first week of deployment, noting widget setup is simple with single-line embeds.',
      socialTwitter: 'Conversion rates increased by 18% in week 1 after adding Proofly widget code. Setup is literally 1 line of HTML. 🔥',
      socialLinkedIn: 'We recently added custom Proofly testimonial widgets to client landing pages. In just 7 days, conversion rates jumped by 18%. The setup is simple, requiring only 1 line of HTML code.'
    },
    {
      id: 't-3',
      name: 'Ateeqhulla Khan',
      role: 'Growth Hacker',
      company: 'LaunchPad',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      review: 'Video collection is friction-free. Customers record short video reviews right from their mobile browser without downloading anything. Our sales team closed 3 enterprise clients using these videos.',
      sentiment: 'POSITIVE',
      score: 96.8,
      tags: ['video-reviews', 'mobile', 'enterprise-deals'],
      aiSummary: 'Ateeqhulla Khan notes that customers can record video feedback from mobile devices without app installs, which directly helped secure 3 enterprise accounts.',
      socialTwitter: 'Collected video reviews from mobile customers with 0 friction. Closed 3 enterprise clients this week using video proof! 🎥',
      socialLinkedIn: 'Customer video reviews are the ultimate validation asset. Proofly lets customers record directly from any mobile browser. It already helped our team secure 3 new enterprise contracts.'
    }
  ];

  // States
  const [selectedId, setSelectedId] = useState('t-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedType, setCopiedType] = useState<'twitter' | 'linkedin' | null>(null);

  const activeTestimonial = mockTestimonials.find(t => t.id === selectedId) || mockTestimonials[0];

  // Filtered List
  const filteredList = mockTestimonials.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.review.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCopyText = (text: string, type: 'twitter' | 'linkedin') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 1500);
  };

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-8 w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#10B981]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <span className="bg-[#10B981]/10 text-brand-emerald border border-brand-emerald/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3.5">
          AI Workspace
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none max-w-3xl mx-auto">
          AI-powered testimonial <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-teal via-brand-emerald to-[#6366F1] bg-clip-text text-transparent">
            curation & analysis
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-4 leading-relaxed">
          Instantly extract insights, detect feedback sentiment, summarize long transcripts, and generate custom social copy drafts with deep cognitive models.
        </p>
      </section>

      {/* Workspace Area */}
      <section className="max-w-7xl mx-auto px-6 pb-24 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left column: Feed List & Search (4 Columns) */}
        <div className="lg:col-span-4 bg-[#0c0d16] border border-white/[0.06] rounded-2xl p-4 flex flex-col space-y-4 shadow-2xl">
          <div className="space-y-1 text-left">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Review Inbox</span>
            <div className="relative">
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sentiment, tags, names..."
                className="w-full bg-zinc-950 border border-white/[0.08] focus:border-brand-emerald outline-none rounded-xl pl-9 pr-4 py-2 text-xs text-white transition duration-200"
              />
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto max-h-[420px] pr-1 space-y-2">
            <AnimatePresence>
              {filteredList.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex items-start space-x-3 cursor-pointer ${
                    selectedId === t.id 
                      ? 'bg-brand-emerald/5 border-brand-emerald/30 shadow-[0_0_12px_rgba(16,185,129,0.1)]' 
                      : 'bg-zinc-950 border-white/[0.05] hover:bg-white/[0.02]'
                  }`}
                >
                  <img 
                    src={t.avatar} 
                    alt={t.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-white/5"
                  />
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white block truncate">{t.name}</span>
                      <span className="text-[7.5px] font-black uppercase bg-brand-emerald/10 border border-brand-emerald/20 px-1.5 py-0.2 rounded text-brand-emerald">
                        Positive
                      </span>
                    </div>
                    <span className="text-[8.5px] text-zinc-500 block truncate">{t.company}</span>
                    <p className="text-[9.5px] text-slate-400 line-clamp-2 leading-relaxed italic mt-1.5">
                      "{t.review}"
                    </p>
                  </div>
                </button>
              ))}
            </AnimatePresence>

            {filteredList.length === 0 && (
              <div className="py-16 text-center flex flex-col items-center justify-center space-y-1.5">
                <span className="text-zinc-600 text-xs">No matching testimonials.</span>
                <span className="text-[9px] text-zinc-500">Try searching "onboarding" or "conversion"</span>
              </div>
            )}
          </div>
        </div>

        {/* Right column: AI Workspace View & Social drafts (8 Columns) */}
        <div className="lg:col-span-8 flex flex-col space-y-4 justify-between">
          
          {/* Active Review Details & AI Analytics */}
          <div className="bg-[#0c0d16] border border-white/[0.06] rounded-2xl p-6 space-y-5 shadow-2xl text-left flex-1">
            
            {/* Header profile details */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="flex items-center space-x-3.5">
                <img 
                  src={activeTestimonial.avatar} 
                  alt={activeTestimonial.name}
                  className="w-11 h-11 rounded-full object-cover border border-white/10"
                />
                <div className="leading-none text-left">
                  <h3 className="text-sm font-black text-white block">{activeTestimonial.name}</h3>
                  <span className="text-[10px] text-zinc-400 block mt-1">{activeTestimonial.role} ➔ {activeTestimonial.company}</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">AI Sentiment Score</span>
                <span className="text-base font-black text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2.5 py-0.5 rounded-lg inline-block mt-1">
                  {activeTestimonial.score}% Positive
                </span>
              </div>
            </div>

            {/* Testimonial Quote */}
            <div className="space-y-1 text-left relative bg-zinc-950/40 p-4 rounded-xl border border-white/[0.03]">
              <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest block">Original Transcription</span>
              <p className="text-xs text-slate-200 leading-relaxed italic mt-1.5">
                "{activeTestimonial.review}"
              </p>
            </div>

            {/* AI Summary and smart tags block */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 pt-1 items-start">
              
              {/* AI Summary card (8 Columns) */}
              <div className="sm:col-span-8 bg-zinc-950/50 border border-white/[0.04] p-4 rounded-xl space-y-2.5 text-left relative">
                <div className="flex items-center space-x-1.5">
                  <BrainCircuit className="w-4 h-4 text-brand-teal animate-pulse" />
                  <span className="text-[9px] font-black uppercase text-brand-teal tracking-widest">AI Generated Summary</span>
                </div>
                <p className="text-[10px] text-slate-300 leading-relaxed">
                  {activeTestimonial.aiSummary}
                </p>
              </div>

              {/* Smart Keyword Tags (4 Columns) */}
              <div className="sm:col-span-4 bg-zinc-950/50 border border-white/[0.04] p-4 rounded-xl space-y-2 text-left h-full">
                <span className="text-[9px] font-black uppercase text-zinc-500 tracking-widest block">extracted keywords</span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {activeTestimonial.tags.map((tag, idx) => (
                    <span 
                      key={idx}
                      className="text-[8px] font-bold bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Social post drafts generators */}
          <div className="bg-[#0c0d16] border border-white/[0.06] rounded-2xl p-5 shadow-2xl text-left grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Twitter draft */}
            <div className="bg-zinc-950 border border-white/[0.04] p-3.5 rounded-xl flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-sky-400 tracking-wider flex items-center space-x-1">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Twitter Post Draft</span>
                </span>
                <button
                  onClick={() => handleCopyText(activeTestimonial.socialTwitter, 'twitter')}
                  className="text-zinc-500 hover:text-white transition flex items-center space-x-1 text-[9px] cursor-pointer"
                >
                  {copiedType === 'twitter' ? (
                    <span className="text-brand-emerald">Copied!</span>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[9.5px] text-slate-300 font-mono leading-relaxed bg-[#030303] border border-white/5 p-2 rounded-lg italic">
                "{activeTestimonial.socialTwitter}"
              </p>
            </div>

            {/* LinkedIn draft */}
            <div className="bg-zinc-950 border border-white/[0.04] p-3.5 rounded-xl flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase text-blue-400 tracking-wider flex items-center space-x-1">
                  <Share2 className="w-3.5 h-3.5" />
                  <span>LinkedIn Post Draft</span>
                </span>
                <button
                  onClick={() => handleCopyText(activeTestimonial.socialLinkedIn, 'linkedin')}
                  className="text-zinc-500 hover:text-white transition flex items-center space-x-1 text-[9px] cursor-pointer"
                >
                  {copiedType === 'linkedin' ? (
                    <span className="text-brand-emerald">Copied!</span>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[9.5px] text-slate-300 font-mono leading-relaxed bg-[#030303] border border-white/5 p-2 rounded-lg italic line-clamp-3">
                "{activeTestimonial.socialLinkedIn}"
              </p>
            </div>

          </div>

        </div>

      </section>

      <Footer />
    </div>
  );
}
