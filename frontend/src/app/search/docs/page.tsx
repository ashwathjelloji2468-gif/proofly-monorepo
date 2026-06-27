'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, ChevronRight, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function DocsSearchPage() {
  const docArticles = [
    { id: 'quickstart', category: 'Getting Started', title: 'Quickstart Guide', desc: 'Setup collection space and display reviews in under 5 minutes.' },
    { id: 'installation', category: 'Getting Started', title: 'Installation & Packages', desc: 'Native frameworks wrappers for React, Vue, and Next.js.' },
    { id: 'collections', category: 'Core Features', title: 'Collection Spaces', desc: 'Custom prompts, reward systems, and branding rules.' },
    { id: 'ai-curation', category: 'Core Features', title: 'AI Insights & Curation', desc: 'Sentiment scoring, keyword tags extracting, and social drafts.' },
    { id: 'embeds', category: 'Core Features', title: 'Widget Embeds & Styling', desc: 'Grid, Masonry, and Carousel styling options.' }
  ];

  const [query, setQuery] = useState('');

  const filtered = docArticles.filter(d => 
    d.title.toLowerCase().includes(query.toLowerCase()) ||
    d.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none overflow-hidden">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 pt-32 pb-24 w-full flex-1 space-y-6 text-left">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-[#6366F1] uppercase tracking-widest block">Global Search</span>
          <h1 className="text-xl sm:text-2xl font-black text-white">Search Documentation</h1>
        </div>

        {/* Input box */}
        <div className="relative">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type terms like 'quickstart', 'embeds'..."
            className="w-full bg-[#0c0d16] border border-white/[0.08] focus:border-[#6366F1] outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition duration-200"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Results */}
        <div className="space-y-2.5 pt-2">
          {filtered.map((item, idx) => (
            <Link key={idx} href="/docs">
              <button className="w-full text-left bg-[#0c0d16] border border-white/[0.04] hover:border-white/10 p-4 rounded-xl flex items-center justify-between transition cursor-pointer mt-2.5">
                <div className="space-y-1">
                  <span className="text-[8px] font-black uppercase text-zinc-500 tracking-wider block">{item.category}</span>
                  <span className="text-xs font-bold text-white block">{item.title}</span>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No documentation pages match your search term.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
