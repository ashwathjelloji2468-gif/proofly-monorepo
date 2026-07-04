'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  BarChart3, 
  TrendingUp, 
  Percent, 
  Users, 
  MousePointerClick,
  ChevronDown,
  Globe,
  Monitor
} from 'lucide-react';

export default function AnalyticsProductPage() {
  // Mock spaces
  const spacesList = ['All Spaces', 'Acme SaaS', 'LaunchPad App', 'DevFlow documentation'];
  const [selectedSpace, setSelectedSpace] = useState('All Spaces');
  const [isOpenSpace, setIsOpenSpace] = useState(false);

  // Metrics database
  const metrics = [
    { name: 'Total Views', value: '45,280', change: '+12.4%', icon: <Users className="w-4 h-4 text-brand-teal" /> },
    { name: 'Testimonial Clicks', value: '12,940', change: '+8.6%', icon: <MousePointerClick className="w-4 h-4 text-[#6366F1]" /> },
    { name: 'Avg Watch Time', value: '42.5s', change: '+5.2%', icon: <BarChart3 className="w-4 h-4 text-brand-emerald" /> },
    { name: 'Conversion Lift', value: '18.4%', change: '+4.1%', icon: <Percent className="w-4 h-4 text-orange-500" /> }
  ];

  // Countries mockup
  const countries = [
    { country: 'United States', code: 'US', views: '22,450', percent: '49.5%' },
    { country: 'United Kingdom', code: 'UK', views: '8,320', percent: '18.3%' },
    { country: 'Germany', code: 'DE', views: '4,100', percent: '9.0%' },
    { country: 'India', code: 'IN', views: '3,890', percent: '8.5%' }
  ];

  // Devices mockup
  const devices = [
    { name: 'Desktop Browsers', views: '28,140', percent: 62 },
    { name: 'Mobile / Tablets', views: '17,140', percent: 38 }
  ];

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans ">
      <Navbar />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-8 w-full text-center relative">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#F97316]/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        
        <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block mb-3.5">
          Conversion Analytics
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-none max-w-3xl mx-auto">
          Deep conversions & <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-brand-teal via-brand-emerald to-[#6366F1] bg-clip-text text-transparent">
            attribution analytics
          </span>
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto mt-4 leading-relaxed">
          Measure the direct impact of testimonial views, video watch duration, button clicks, and geographical distribution across your workspace in real-time.
        </p>
      </section>

      {/* Workspace Area */}
      <section className="max-w-7xl mx-auto px-6 pb-24 w-full space-y-6">
        
        {/* Workspace space selector */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Live Dashboard Metrics</span>
          <div className="relative">
            <button 
              onClick={() => setIsOpenSpace(!isOpenSpace)}
              className="bg-[#0c0d16] border border-white/10 hover:border-white/20 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2.5 cursor-pointer focus:outline-none"
            >
              <span>{selectedSpace}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>
            
            {isOpenSpace && (
              <div className="absolute right-0 mt-2 w-48 bg-[#0c0d16] border border-white/10 rounded-xl shadow-2xl z-30 overflow-hidden text-left">
                {spacesList.map((space, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedSpace(space);
                      setIsOpenSpace(false);
                    }}
                    className="w-full text-left px-4 py-2.5 text-xs text-slate-300 hover:bg-[#6366F1]/10 hover:text-white transition cursor-pointer"
                  >
                    {space}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m, idx) => (
            <div 
              key={idx}
              className="bg-[#0c0d16] border border-white/[0.05] p-5 rounded-2xl flex flex-col space-y-2 text-left relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.name}</span>
                <div className="p-1.5 bg-white/5 rounded-lg border border-white/5">
                  {m.icon}
                </div>
              </div>
              <div className="flex items-baseline space-x-2 pt-1">
                <span className="text-xl font-black text-white">{m.value}</span>
                <span className="text-[11px] font-bold text-brand-emerald">{m.change}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Graph & Visual analytics grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* SVG Vector traffic Analytics line graph (8 Columns) */}
          <div className="lg:col-span-8 bg-[#0c0d16] border border-white/[0.05] p-6 rounded-2xl space-y-4 text-left shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center space-x-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-brand-teal" />
                <span>Conversion Growth Curve</span>
              </span>
              <span className="text-[11px] text-zinc-500 font-bold uppercase tracking-widest">Attributed Lift in Week 1</span>
            </div>

            {/* Custom SVG Line graph */}
            <div className="w-full h-48 flex items-center justify-center pt-2 relative">
              <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                {/* Horizontal grid lines */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="75" x2="500" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

                {/* Shading/gradient area under line */}
                <defs>
                  <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4338CA" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4338CA" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path 
                  d="M0,150 L0,120 L100,105 L200,90 L300,50 L400,35 L500,15 L500,150 Z" 
                  fill="url(#chartGlow)" 
                />

                {/* Vector Line */}
                <path 
                  d="M0,120 L100,105 L200,90 L300,50 L400,35 L500,15" 
                  fill="none" 
                  stroke="#4338CA" 
                  strokeWidth="2.5" 
                  strokeLinecap="round"
                />

                {/* Data point glowing dots */}
                <circle cx="300" cy="50" r="4.5" fill="#4338CA" stroke="#09090B" strokeWidth="1.5" />
                <circle cx="500" cy="15" r="4.5" fill="#4338CA" stroke="#09090B" strokeWidth="1.5" />
              </svg>
            </div>

            {/* X-Axis Labels */}
            <div className="flex justify-between text-[11px] text-zinc-500 font-bold uppercase pt-1">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu (Release)</span>
              <span>Fri</span>
              <span>Sat / Today</span>
            </div>

          </div>

          {/* Demographic & devices breakdown side section (4 Columns) */}
          <div className="lg:col-span-4 bg-[#0c0d16] border border-white/[0.05] p-5 rounded-2xl flex flex-col justify-between shadow-2xl space-y-5">
            
            {/* Geographic panel */}
            <div className="space-y-3.5 text-left">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center space-x-1.5 border-b border-white/5 pb-2.5">
                <Globe className="w-3.5 h-3.5 text-[#6366F1]" />
                <span>Geographic Attributions</span>
              </span>
              <div className="space-y-2.5">
                {countries.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[9.5px] text-slate-300">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] shrink-0">
                        {c.code === 'US' ? '🇺🇸' : c.code === 'UK' ? '🇬🇧' : c.code === 'DE' ? '🇩🇪' : '🇮🇳'}
                      </span>
                      <span className="font-bold">{c.country}</span>
                    </div>
                    <div className="space-x-1.5 font-mono">
                      <span>{c.views} views</span>
                      <span className="text-zinc-500">({c.percent})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Devices panel */}
            <div className="space-y-3.5 text-left">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest flex items-center space-x-1.5 border-b border-white/5 pb-2.5">
                <Monitor className="w-3.5 h-3.5 text-brand-emerald" />
                <span>Device Attributions</span>
              </span>
              <div className="space-y-3">
                {devices.map((d, idx) => (
                  <div key={idx} className="space-y-1 text-[9.5px]">
                    <div className="flex items-center justify-between text-slate-300">
                      <span className="font-bold">{d.name}</span>
                      <span className="font-mono text-zinc-500">{d.percent}%</span>
                    </div>
                    {/* Visual progress bar line */}
                    <div className="w-full h-1 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="h-full bg-gradient-to-r from-brand-teal to-brand-emerald rounded-full" 
                        style={{ width: `${d.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </section>

      <Footer />
    </div>
  );
}
