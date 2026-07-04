'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, ChevronRight, Code } from 'lucide-react';
import Link from 'next/link';

export default function ApiSearchPage() {
  const endpoints = [
    { method: 'POST', path: '/v1/spaces', desc: 'Create a new testimonial collection space.' },
    { method: 'GET', path: '/v1/spaces/:id/testimonials', desc: 'Fetch approved testimonials for a specific space.' },
    { method: 'POST', path: '/v1/testimonials', desc: 'Submit a new text review to a collection space.' }
  ];

  const [query, setQuery] = useState('');

  const filtered = endpoints.filter(e => 
    e.path.toLowerCase().includes(query.toLowerCase()) ||
    e.desc.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans  overflow-hidden">
      <Navbar />

      <section className="max-w-4xl mx-auto px-6 pt-32 pb-24 w-full flex-1 space-y-6 text-left">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest block">Global Search</span>
          <h1 className="text-xl sm:text-2xl font-black text-white">Search Developer API</h1>
        </div>

        {/* Input box */}
        <div className="relative">
          <input 
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type terms like 'spaces', 'testimonials'..."
            className="w-full bg-[#0c0d16] border border-white/[0.08] focus:border-brand-teal outline-none rounded-xl pl-10 pr-4 py-2.5 text-xs text-white transition duration-200"
          />
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Results */}
        <div className="space-y-2.5 pt-2">
          {filtered.map((item, idx) => (
            <Link key={idx} href="/developers/api">
              <button className="w-full text-left bg-[#0c0d16] border border-white/[0.04] hover:border-white/10 p-4 rounded-xl flex items-center justify-between transition cursor-pointer mt-2.5">
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className={`text-[11px] font-black px-1.5 py-0.5 rounded ${
                      item.method === 'POST' ? 'bg-brand-teal/10 text-brand-teal' : 'bg-blue-500/10 text-blue-400'
                    }`}>
                      {item.method}
                    </span>
                    <span className="text-xs font-mono font-bold text-white block">{item.path}</span>
                  </div>
                  <p className="text-[10px] text-slate-400">{item.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-500" />
              </button>
            </Link>
          ))}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-zinc-500 text-xs">
              No API endpoints match your search term.
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
