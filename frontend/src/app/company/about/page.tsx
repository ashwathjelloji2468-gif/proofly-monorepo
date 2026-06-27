'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  Heart, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  MapPin, 
  Target,
  Compass,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AboutPage() {
  const coreValues = [
    { title: 'Extreme Transparency', desc: 'We build in public, share roadmap releases, and ensure every feedback card has verifiable authorship.' },
    { title: 'Friction-Free Design', desc: 'No one should download an app or sign up for account pipelines just to leave a 10-second review.' },
    { title: 'Customer Obsession', desc: 'We help founders celebrate and leverage the success stories of their early adoptors on Day 1.' }
  ];

  const team = [
    { name: 'J. Ashwath', role: 'Founder', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ashwath' },
    { name: 'Ateeqhulla Khan', role: 'Co-Founder', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Ateeq' }
  ];

  const timeline = [
    { year: '2025', title: 'The Spark', desc: 'Proofly was founded to solve manual screenshot chaos on landing pages.' },
    { year: '2025', title: 'Beta Release', desc: 'Released beta recorders, securing initial trust widgets for 100+ early SaaS startups.' },
    { year: '2026', title: 'AI Workspace Suite', desc: 'Launched sentiment scoring, keywords extractor tools, and dynamic Wall of Love customizers.' }
  ];

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none overflow-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-12 w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#6366F1]/10 rounded-full blur-[100px] pointer-events-none -z-10" />
        
        <span className="bg-[#6366F1]/10 text-[#6366F1] border border-[#6366F1]/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3.5">
          Our Company Mission
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none max-w-3xl mx-auto">
          We organize the world's <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-teal via-brand-emerald to-[#6366F1] bg-clip-text text-transparent">
            customer love
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-4 leading-relaxed">
          Proofly helps high-growth startups and creators capture, organize, and showcase authentic user testimonials effortlessly to accelerate trust.
        </p>
      </section>

      {/* Mission & Vision Statements */}
      <section className="max-w-4xl mx-auto px-6 py-8 w-full grid grid-cols-1 sm:grid-cols-2 gap-8 text-left">
        <div className="bg-[#0c0d16] border border-white/[0.05] p-6 rounded-2xl space-y-3 relative shadow-xl">
          <div className="w-8 h-8 rounded-lg bg-brand-teal/10 border border-brand-teal/20 flex items-center justify-center">
            <Target className="w-4 h-4 text-brand-teal" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-white">Our Mission</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            To eliminate unverifiable, static reviews from the web by providing transparent, single-click video and text attributions that prove conversion lift.
          </p>
        </div>
        
        <div className="bg-[#0c0d16] border border-white/[0.05] p-6 rounded-2xl space-y-3 relative shadow-xl">
          <div className="w-8 h-8 rounded-lg bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center">
            <Compass className="w-4 h-4 text-[#6366F1]" />
          </div>
          <h3 className="text-sm font-black uppercase tracking-wider text-white">Our Vision</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            A web where every SaaS, e-commerce brand, and creator has a dynamic "Wall of Love" that updates and Curates client trust assets automatically in real-time.
          </p>
        </div>
      </section>

      {/* Vertical Timeline Card */}
      <section className="max-w-4xl mx-auto px-6 py-12 w-full text-left">
        <h2 className="text-xs font-black uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2.5 mb-8">
          The Journey Timeline
        </h2>

        <div className="relative border-l border-white/10 pl-6 ml-4 space-y-8">
          {timeline.map((item, idx) => (
            <div key={idx} className="relative space-y-1.5">
              {/* Dot marker */}
              <div className="w-3.5 h-3.5 rounded-full bg-[#6366F1] border-2 border-[#09090B] absolute -left-[33px] top-0.5 shadow-lg" />
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-black uppercase bg-[#6366F1]/10 border border-[#6366F1]/20 text-[#6366F1] px-2 py-0.5 rounded-full">
                  {item.year}
                </span>
                <h4 className="text-xs font-bold text-white tracking-wide">{item.title}</h4>
              </div>
              <p className="text-[10.5px] text-slate-400 leading-relaxed max-w-xl">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="max-w-4xl mx-auto px-6 py-12 w-full text-left">
        <h2 className="text-xs font-black uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2.5 mb-6">
          Core Values
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {coreValues.map((val, idx) => (
            <div key={idx} className="bg-[#0c0d16] border border-white/[0.05] p-5 rounded-xl space-y-2">
              <h4 className="text-xs font-bold text-white tracking-wide">{val.title}</h4>
              <p className="text-[10px] text-slate-400 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team gallery */}
      <section className="max-w-4xl mx-auto px-6 py-12 pb-24 w-full text-left">
        <h2 className="text-xs font-black uppercase text-zinc-500 tracking-widest border-b border-white/5 pb-2.5 mb-6">
          Founding Team
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {team.map((member, idx) => (
            <div key={idx} className="bg-[#0c0d16] border border-white/[0.05] p-4 rounded-2xl flex items-center space-x-3.5">
              <img 
                src={member.avatar} 
                alt={member.name}
                className="w-10 h-10 rounded-full border border-white/10 shrink-0"
              />
              <div className="leading-none text-left">
                <span className="text-xs font-bold text-white block">{member.name}</span>
                <span className="text-[8.5px] text-zinc-500 block mt-1">{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
