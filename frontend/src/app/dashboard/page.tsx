'use client';

import React from 'react';
import { useStore } from '@/store/useStore';
import { 
  FolderHeart, 
  Video, 
  MessageSquare, 
  TrendingUp, 
  Eye, 
  Activity, 
  Star,
  Sparkles,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardHome() {
  const collections = useStore(state => state.collections);
  const testimonials = useStore(state => state.testimonials);
  const user = useStore(state => state.user);

  // Compute metrics
  const totalTestimonials = testimonials.length;
  const videoTestimonials = testimonials.filter(t => t.video_url).length;
  const textTestimonials = totalTestimonials - videoTestimonials;

  // Aggregate simulated metrics
  const totalViews = testimonials.reduce((sum, t) => sum + t.views, 0) + 145;
  const conversionRate = totalViews > 0 ? ((totalTestimonials / totalViews) * 100).toFixed(1) : '0.0';

  const recentActivity = [...testimonials]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);

  // Custom SVG chart path calculators
  const monthlyData = [12, 19, 32, 45, 34, 52, 68]; // monthly collection counts
  const conversionData = [8.4, 9.2, 11.5, 12.0, 10.8, 13.5, 15.4]; // conversion percentages

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

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0">
      {/* Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <h1 className="font-extrabold text-lg text-white">Dashboard Overview</h1>
        <Link href="/dashboard/collections">
          <button className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2 px-4 rounded-lg flex items-center space-x-1 cursor-pointer transition">
            <span>Collect Testimonial</span>
          </button>
        </Link>
      </header>

      {/* Main Content Dashboard */}
      <main className="p-8 space-y-8 max-w-6xl w-full text-left">
        
        {/* Usage Card Dashboard widget for Free Users */}
        {user?.tier === 'FREE' && (
          <div className="bg-gradient-to-r from-slate-900 via-[#1e1b4b]/30 to-slate-900 border border-white/[0.08] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold text-[#8B5CF6] uppercase bg-[#8B5CF6]/10 px-2.5 py-0.5 rounded-full">Free Tier Plan</span>
                <span className="text-[10px] text-slate-400 font-medium">Resetting monthly</span>
              </div>
              <h3 className="text-white text-base font-black">Your Social Proof Fuel Tank</h3>
              <p className="text-xs text-slate-400">Upgrade to Pro to unlock unlimited spaces, unlimited testimonials, priority support, and to hide branding.</p>
            </div>
            
            <div className="flex items-center gap-6 w-full md:w-auto shrink-0 overflow-x-auto py-1">
              {/* Spaces Meter */}
              <div className="flex flex-col items-center space-y-1.5 min-w-[70px]">
                <div className="text-[10px] font-bold text-slate-300">Spaces</div>
                <div className="text-sm font-black text-white">{collections.length} / 1</div>
                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-emerald animate-pulse" style={{ width: `${Math.min((collections.length / 1) * 100, 100)}%` }} />
                </div>
              </div>

              {/* Testimonials Meter */}
              <div className="flex flex-col items-center space-y-1.5 min-w-[70px]">
                <div className="text-[10px] font-bold text-slate-300">Reviews</div>
                <div className="text-sm font-black text-white">{totalTestimonials} / 25</div>
                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-brand-teal" style={{ width: `${Math.min((totalTestimonials / 25) * 100, 100)}%` }} />
                </div>
              </div>

              {/* Videos Meter */}
              <div className="flex flex-col items-center space-y-1.5 min-w-[70px]">
                <div className="text-[10px] font-bold text-slate-300">Videos</div>
                <div className="text-sm font-black text-white">{videoTestimonials} / 5</div>
                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#8B5CF6]" style={{ width: `${Math.min((videoTestimonials / 5) * 100, 100)}%` }} />
                </div>
              </div>

              {/* AI Credits Meter */}
              <div className="flex flex-col items-center space-y-1.5 min-w-[70px]">
                <div className="text-[10px] font-bold text-slate-300">AI Credits</div>
                <div className="text-sm font-black text-white">{user?.aiCreditsUsed || 0} / 10</div>
                <div className="w-16 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-[#EC4899]" style={{ width: `${Math.min(((user?.aiCreditsUsed || 0) / 10) * 100, 100)}%` }} />
                </div>
              </div>

              {/* Upgrade Button */}
              <Link href="/dashboard/settings" className="shrink-0">
                <button className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:opacity-95 text-white text-xs font-bold py-2.5 px-4 rounded-lg flex items-center space-x-1.5 shadow-lg shadow-[#6366F1]/20 cursor-pointer transition">
                  <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" />
                  <span>⭐⭐ Upgrade</span>
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: Total Testimonials */}
          <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl relative shadow-lg flex flex-col justify-between h-32 hover:border-zinc-800 transition">
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Total Testimonials</span>
              <FolderHeart className="w-4 h-4 text-brand-emerald" />
            </div>
            <div className="text-3xl font-black text-white">{totalTestimonials}</div>
          </div>

          {/* Card 2: Video Testimonials */}
          <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl relative shadow-lg flex flex-col justify-between h-32 hover:border-zinc-800 transition">
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Video Testimonials</span>
              <Video className="w-4 h-4 text-brand-teal" />
            </div>
            <div className="text-3xl font-black text-white">{videoTestimonials}</div>
          </div>

          {/* Card 3: Text Testimonials */}
          <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl relative shadow-lg flex flex-col justify-between h-32 hover:border-zinc-800 transition">
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Text Testimonials</span>
              <MessageSquare className="w-4 h-4 text-brand-emerald" />
            </div>
            <div className="text-3xl font-black text-white">{textTestimonials}</div>
          </div>

          {/* Card 4: Conversion Rate */}
          <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl relative shadow-lg flex flex-col justify-between h-32 hover:border-zinc-800 transition">
            <div className="flex items-start justify-between">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Conversion Rate</span>
              <TrendingUp className="w-4 h-4 text-brand-teal" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-3xl font-black text-white">{conversionRate}%</span>
              <span className="text-[10px] text-brand-emerald font-bold">+2.4%</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Chart 1: Monthly Trend */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-sm font-bold">Monthly Collection Trend</h3>
                <p className="text-xs text-muted-foreground">Total reviews collected over the past months</p>
              </div>
              <span className="text-xs text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded font-black uppercase">
                Live
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
                  d={calculateAreaPath(monthlyData, 120, 390)} 
                  fill="url(#areaGrad)" 
                />
                <path 
                  d={calculateSvgPath(monthlyData, 120, 390)} 
                  fill="none" 
                  stroke="#4338CA" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold pt-1">
                <span>Nov</span>
                <span>Dec</span>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>
            </div>
          </div>

          {/* Chart 2: Conversion Trend */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white text-sm font-bold">Conversion Rate Trend</h3>
                <p className="text-xs text-muted-foreground">Testimonial submissions vs collection page views</p>
              </div>
              <span className="text-xs text-brand-teal bg-brand-teal/10 px-2 py-0.5 rounded font-black uppercase">
                Active
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
                  d={calculateAreaPath(conversionData, 120, 390)} 
                  fill="url(#tealGrad)" 
                />
                <path 
                  d={calculateSvgPath(conversionData, 120, 390)} 
                  fill="none" 
                  stroke="#6366F1" 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />
              </svg>
              <div className="flex justify-between text-[10px] text-muted-foreground font-semibold pt-1">
                <span>Nov</span>
                <span>Dec</span>
                <span>Jan</span>
                <span>Feb</span>
                <span>Mar</span>
                <span>Apr</span>
                <span>May</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Recent Activity & Top space */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card: Recent Activity Feed */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl md:col-span-2 space-y-4">
            <div className="flex items-center justify-between border-b border-border-primary/50 pb-3">
              <h3 className="text-white text-sm font-bold flex items-center space-x-2">
                <Activity className="w-4 h-4 text-brand-emerald" />
                <span>Recent Activity</span>
              </h3>
              <span className="text-[10px] text-muted-foreground">Real-time</span>
            </div>

            <div className="space-y-4">
              {recentActivity.map(act => (
                <div key={act.id} className="flex items-start justify-between text-xs">
                  <div className="flex items-start space-x-3 text-left">
                    <img 
                      src={act.reviewerAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + act.name} 
                      alt={act.name}
                      className="w-7 h-7 rounded-full bg-[#09090B]"
                    />
                    <div>
                      <p className="text-slate-200">
                        <strong>{act.name}</strong> submitted a new {act.video_url ? 'video' : 'text'} testimonial.
                      </p>
                      <span className="text-[9px] text-muted-foreground" suppressHydrationWarning>{new Date(act.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border ${
                    act.status === 'approved' 
                      ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30' 
                      : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                  }`}>
                    {act.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Quick Stats */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border-primary/50 pb-3">
                <h3 className="text-white text-sm font-bold flex items-center space-x-2">
                  <Eye className="w-4 h-4 text-brand-teal" />
                  <span>Telemetry</span>
                </h3>
              </div>
              
              <div className="space-y-4 text-left">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Visits:</span>
                  <span className="text-slate-200 font-bold">{totalViews}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Collections:</span>
                  <span className="text-slate-200 font-bold">{collections.length}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Total Shares:</span>
                  <span className="text-slate-200 font-bold">
                    {testimonials.reduce((sum, t) => sum + t.shares, 0)}
                  </span>
                </div>
              </div>
            </div>

            <Link href="/dashboard/collections" className="w-full">
              <button className="w-full bg-zinc-800 hover:bg-zinc-750 border border-border-primary text-slate-200 text-xs font-bold py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition">
                <span>Manage Collections</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
