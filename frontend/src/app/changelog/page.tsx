'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  History, 
  Calendar, 
  Search, 
  CheckCircle, 
  ArrowRight,
  Sparkles,
  TrendingUp,
  Bug
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChangelogPage() {
  const releases = [
    {
      version: 'v1.2.0',
      date: 'June 26, 2026',
      headline: 'Interactive Wall of Love styling & custom theme presets',
      features: [
        'Added dynamic layout controllers for Carousel, Masonry, and standard Grids.',
        'Implemented customizable card corner radius properties (Small, Medium, Large).',
        'Added accent color picker swatches matching core branding colors.'
      ],
      improvements: [
        'Improved local storage tokens persistence fallbacks for offline testing environments.',
        'Optimized core CDN iframe script weights reducing load latencies by 30%.'
      ],
      fixes: [
        'Fixed TypeScript interface key compile properties inside useStore actions.',
        'Resolved mobile drawer sidebar z-index positioning overlapping footer layouts.'
      ]
    },
    {
      version: 'v1.1.0',
      date: 'May 14, 2026',
      headline: 'Cognitive AI insights engine & custom guides questions',
      features: [
        'Integrated sentiment scoring analyzer mapping comments from 0-100%.',
        'Implemented automated tags extractor parsing hashtags from transcripts.'
      ],
      improvements: [
        'Added guidance prompts support inside collection fields.',
        'Optimized video compression files reducing storage usage by 40%.'
      ],
      fixes: [
        'Fixed card play button trigger actions failing on iOS Safari browsers.',
        'Resolved billing checkout expand items not reflecting coupon values.'
      ]
    }
  ];

  // States
  const [searchQuery, setSearchQuery] = useState('');

  // Filter list
  const filteredReleases = releases.filter(r => 
    r.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.features.some(f => f.toLowerCase().includes(searchQuery.toLowerCase())) ||
    r.improvements.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-8 w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#6366F1]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <span className="bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3.5">
          Product Changelog
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none max-w-3xl mx-auto">
          See what we've newly <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-teal via-brand-emerald to-[#6366F1] bg-clip-text text-transparent">
            built & optimized
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-4 leading-relaxed">
          Version release notes, bug fixes, performance optimizations, and feature enhancements for the Proofly platform.
        </p>
      </section>

      {/* Main Workspace Container */}
      <section className="max-w-4xl mx-auto px-6 pb-24 w-full space-y-8 text-left">
        
        {/* Search filter input */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Release Registry</span>
          <div className="relative w-64">
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features, fixes, versions..."
              className="w-full bg-zinc-950 border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl pl-8 pr-4 py-2 text-xs text-white transition duration-200"
            />
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Releases List */}
        <div className="space-y-10">
          {filteredReleases.map((release, idx) => (
            <div 
              key={idx}
              className="bg-[#0c0d16] border border-white/[0.05] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden"
            >
              
              {/* Header version details */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/5 pb-4 gap-2">
                <div className="flex items-center space-x-3">
                  <span className="text-[11px] font-black font-mono bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] px-3 py-1 rounded-full">
                    {release.version}
                  </span>
                  <h2 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                    {release.headline}
                  </h2>
                </div>
                <div className="flex items-center space-x-1.5 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{release.date}</span>
                </div>
              </div>

              {/* Version Categories details */}
              <div className="space-y-5">
                
                {/* Features (if present) */}
                {release.features.length > 0 && (
                  <div className="space-y-2 text-left">
                    <span className="text-[9px] font-black uppercase text-brand-teal tracking-widest block flex items-center space-x-1">
                      <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
                      <span>New Features</span>
                    </span>
                    <ul className="space-y-1.5 pl-5 list-disc text-[10.5px] text-slate-350 leading-relaxed">
                      {release.features.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements (if present) */}
                {release.improvements.length > 0 && (
                  <div className="space-y-2 text-left">
                    <span className="text-[9px] font-black uppercase text-blue-450 tracking-widest block flex items-center space-x-1">
                      <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
                      <span>Improvements</span>
                    </span>
                    <ul className="space-y-1.5 pl-5 list-disc text-[10.5px] text-slate-350 leading-relaxed">
                      {release.improvements.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bug Fixes (if present) */}
                {release.fixes.length > 0 && (
                  <div className="space-y-2 text-left">
                    <span className="text-[9px] font-black uppercase text-red-400 tracking-widest block flex items-center space-x-1">
                      <Bug className="w-3.5 h-3.5 text-red-500" />
                      <span>Bug Fixes</span>
                    </span>
                    <ul className="space-y-1.5 pl-5 list-disc text-[10.5px] text-slate-350 leading-relaxed">
                      {release.fixes.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

              </div>

            </div>
          ))}

          {filteredReleases.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center justify-center space-y-2">
              <History className="w-6 h-6 text-zinc-700 animate-pulse" />
              <span className="text-xs text-zinc-500">No releases found matching your search.</span>
            </div>
          )}
        </div>

      </section>

      <Footer />
    </div>
  );
}
