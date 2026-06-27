'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, ChevronRight, History } from 'lucide-react';
import Link from 'next/link';

export default function ChangelogSearchPage() {
  const releases = [
    { version: 'v1.2.0', date: 'June 26, 2026', headline: 'Interactive Wall of Love styling & custom theme presets' },
    { version: 'v1.1.0', date: 'May 14, 2026', headline: 'Cognitive AI insights engine & custom guides questions' }
  ];

  const [query, setQuery] = useState('');

  const filtered = releases.filter(r => 
    r.version.toLowerCase().includes(query.toLowerCase()) ||
    r.headline.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none overflow-hidden">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 pt-32 pb-24 w-full flex-1 space-y-6 text-left">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-[#6366F1] uppercase tracking-widest block">Global Search</span>
          <h1 className="text-xl sm:text-2xl font-black text-white">Search Product Changelog</h1>
        </div>

        {/* Input box */}
        <div className="relative">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type terms like 'v1.2.0', 'styling'..."
            className="w-full bg-[#0c0d16] border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition duration-200"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Results */}
        <div className="space-y-2.5 pt-2">
          {filtered.map((item, idx) => (
            <Link key={idx} href="/changelog">
              <button className="w-full text-left bg-[#0c0d16] border border-white/[0.04] hover:border-white/10 p-4 rounded-xl flex items-center justify-between transition cursor-pointer mt-2.5">
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider block">{item.date}</span>
                  <div className="flex items-center space-x-2.5">
                    <span className="text-[9.5px] font-mono font-black text-[#6366F1]">{item.version}</span>
                    <span className="text-xs font-bold text-white block">{item.headline}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No changelog releases match your search term.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
