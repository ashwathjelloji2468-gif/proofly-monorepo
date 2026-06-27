'use client';

import React, { useState } from 'react';
import { useStore } from '@/store/useStore';
import { 
  BarChart3, 
  Eye, 
  TrendingUp, 
  Share2, 
  Calendar,
  Globe,
  Monitor,
  Sparkles,
  Smartphone,
  ChevronDown
} from 'lucide-react';

export default function AnalyticsPage() {
  const testimonials = useStore(state => state.testimonials);
  const collections = useStore(state => state.collections);

  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Filter testimonials based on source space
  const spaceTestimonials = testimonials.filter(t => 
    selectedCollectionId === 'all' || t.collection_id === selectedCollectionId
  );

  // Compute metrics
  const viewsCount = spaceTestimonials.reduce((sum, t) => sum + t.views, 0) + (selectedCollectionId === 'all' ? 1240 : 450);
  const clicksCount = spaceTestimonials.reduce((sum, t) => sum + t.clicks, 0) + (selectedCollectionId === 'all' ? 342 : 110);
  const sharesCount = spaceTestimonials.reduce((sum, t) => sum + t.shares, 0) + (selectedCollectionId === 'all' ? 84 : 20);
  
  const ctr = viewsCount > 0 ? ((clicksCount / viewsCount) * 100).toFixed(1) : '0.0';

  // SVG chart data
  const viewsTrendData = timeRange === '7d' 
    ? [120, 145, 130, 185, 210, 190, 245]
    : timeRange === '30d'
    ? [410, 390, 520, 480, 610, 580, 720, 690, 840, 810, 940, 990]
    : [1200, 1450, 1300, 1850, 2100, 1900, 2450, 2900, 3100];

  const clicksTrendData = timeRange === '7d'
    ? [24, 32, 28, 45, 52, 41, 58]
    : timeRange === '30d'
    ? [82, 75, 110, 96, 128, 118, 148, 135, 172, 160, 195, 210]
    : [240, 320, 280, 450, 520, 410, 580, 690, 740];

  const calculateSvgPath = (data: number[], height: number, width: number) => {
    const maxVal = Math.max(...data) * 1.2;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - (val / maxVal) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  const calculateAreaPath = (data: number[], height: number, width: number) => {
    const maxVal = Math.max(...data) * 1.2;
    const points = data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * width;
      const y = height - (val / maxVal) * height;
      return `${x},${y}`;
    });
    return `M 0,${height} L ${points.join(' L ')} L ${width},${height} Z`;
  };

  const browserBreakdown = [
    { name: 'Chrome', percentage: 58, count: Math.round(viewsCount * 0.58) },
    { name: 'Safari', percentage: 26, count: Math.round(viewsCount * 0.26) },
    { name: 'Firefox', percentage: 9, count: Math.round(viewsCount * 0.09) },
    { name: 'Edge / Others', percentage: 7, count: Math.round(viewsCount * 0.07) }
  ];

  const geoBreakdown = [
    { name: 'United States', percentage: 46 },
    { name: 'United Kingdom', percentage: 18 },
    { name: 'Germany', percentage: 12 },
    { name: 'India', percentage: 10 },
    { name: 'Canada / Others', percentage: 14 }
  ];

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0">
      {/* Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-brand-emerald" />
            <span>Telemetry Analytics</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Monitor performance metrics, widget views, and customer interactions.</p>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center space-x-3">
          {/* Space Filter */}
          <div className="relative">
            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              className="bg-[#18181B] border border-border-primary rounded-lg text-xs font-semibold py-1.5 pl-3 pr-8 text-white focus:border-brand-emerald outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Spaces</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Time range selector */}
          <div className="bg-[#18181B] border border-border-primary rounded-lg p-1 flex space-x-1 shrink-0">
            {([
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setTimeRange(tab.id)}
                className={`text-[10px] font-extrabold px-2 py-1 rounded transition cursor-pointer select-none ${
                  timeRange === tab.id
                    ? 'bg-brand-emerald/10 text-brand-emerald'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Panel Content */}
      <main className="p-8 space-y-8 max-w-6xl w-full text-left">
        
        {/* Analytics cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Views */}
          <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl relative shadow-lg flex flex-col justify-between h-32 hover:border-zinc-800 transition">
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Widget Views</span>
              <Eye className="w-4 h-4 text-brand-emerald" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-white">{viewsCount.toLocaleString()}</div>
              <p className="text-[10px] text-brand-emerald font-bold">+12.4% vs last period</p>
            </div>
          </div>

          {/* Card 2: Clicks */}
          <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl relative shadow-lg flex flex-col justify-between h-32 hover:border-zinc-800 transition">
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">CTA Link Clicks</span>
              <TrendingUp className="w-4 h-4 text-brand-teal" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-white">{clicksCount.toLocaleString()}</div>
              <p className="text-[10px] text-brand-emerald font-bold">+8.2% vs last period</p>
            </div>
          </div>

          {/* Card 3: Click-Through Rate */}
          <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl relative shadow-lg flex flex-col justify-between h-32 hover:border-zinc-800 transition">
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Conversion Rate (CTR)</span>
              <BarChart3 className="w-4 h-4 text-brand-emerald" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-white">{ctr}%</div>
              <p className="text-[10px] text-brand-teal font-bold">+0.9% vs last period</p>
            </div>
          </div>

          {/* Card 4: Shares */}
          <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl relative shadow-lg flex flex-col justify-between h-32 hover:border-zinc-800 transition">
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Social Shares</span>
              <Share2 className="w-4 h-4 text-brand-teal" />
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black text-white">{sharesCount}</div>
              <p className="text-[10px] text-brand-emerald font-bold">+18.5% vs last period</p>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Chart 1: Widget views trend */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-sm font-bold">Views Analytics</h3>
                <p className="text-xs text-muted-foreground">Detailed page impressions trend</p>
              </div>
              <span className="text-[10px] text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-0.5 rounded font-black uppercase">
                Views Trend
              </span>
            </div>

            {/* Custom SVG Line Chart representation */}
            <div className="h-44 w-full pt-4 relative">
              <svg className="w-full h-full" viewBox="0 0 400 150">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4338CA" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#4338CA" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d={calculateAreaPath(viewsTrendData, 120, 390)} 
                  fill="url(#areaGrad)" 
                />
                <path 
                  d={calculateSvgPath(viewsTrendData, 120, 390)} 
                  fill="none" 
                  stroke="#4338CA" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold pt-1">
                <span>Period Start</span>
                <span>Midway</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Clicks analytics */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-sm font-bold">CTA Link Clickthroughs</h3>
                <p className="text-xs text-muted-foreground">Telemetry logs of clicks on card CTA links</p>
              </div>
              <span className="text-[10px] text-brand-teal bg-brand-teal/10 border border-brand-teal/20 px-2 py-0.5 rounded font-black uppercase">
                Clicks Trend
              </span>
            </div>

            {/* Custom SVG Line Chart representation */}
            <div className="h-44 w-full pt-4 relative">
              <svg className="w-full h-full" viewBox="0 0 400 150">
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path 
                  d={calculateAreaPath(clicksTrendData, 120, 390)} 
                  fill="url(#tealGrad)" 
                />
                <path 
                  d={calculateSvgPath(clicksTrendData, 120, 390)} 
                  fill="none" 
                  stroke="#6366F1" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold pt-1">
                <span>Period Start</span>
                <span>Midway</span>
                <span>Today</span>
              </div>
            </div>
          </div>

        </div>

        {/* Detailed Breakdown section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Breakdown 1: Browsers/Devices */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-white text-sm font-bold flex items-center space-x-2">
              <Monitor className="w-4 h-4 text-brand-emerald" />
              <span>Browsers & Devices</span>
            </h3>
            
            <div className="space-y-4 pt-2">
              {browserBreakdown.map((b) => (
                <div key={b.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200">{b.name}</span>
                    <span className="text-muted-foreground">{b.count.toLocaleString()} views ({b.percentage}%)</span>
                  </div>
                  <div className="h-2 bg-[#09090B] rounded-full overflow-hidden border border-border-primary/50">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-emerald to-brand-teal rounded-full"
                      style={{ width: `${b.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown 2: Geo / Regions */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-white text-sm font-bold flex items-center space-x-2">
              <Globe className="w-4 h-4 text-brand-teal" />
              <span>Geographic Distribution</span>
            </h3>

            <div className="space-y-4 pt-2">
              {geoBreakdown.map((g) => (
                <div key={g.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-200">{g.name}</span>
                    <span className="text-muted-foreground">{g.percentage}% share</span>
                  </div>
                  <div className="h-2 bg-[#09090B] rounded-full overflow-hidden border border-border-primary/50">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-teal to-brand-emerald rounded-full"
                      style={{ width: `${g.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
