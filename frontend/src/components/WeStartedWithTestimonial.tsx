'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Bot, 
  Inbox, 
  Video, 
  MessageSquare, 
  Check, 
  ChevronRight, 
  Globe, 
  Plus, 
  Star,
  Play,
  Heart,
  FolderOpen,
  ArrowRight,
  TrendingUp,
  ArrowUpRight,
  Share2,
  Trash2
} from 'lucide-react';
import Link from 'next/link';
import { useStore, Testimonial } from '@/store/useStore';

// Reusable Hover Heart Splasher Component
interface LocalHeart {
  id: number;
  x: number;
  y: number;
  size: number;
  scale: number;
  drift: number;
  duration: number;
}

function HoverHeartWrapper({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const [hearts, setHearts] = useState<LocalHeart[]>([]);
  const nextId = useRef(0);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;

    // Spawn 6 small floating red hearts from the bottom center of the card
    const newHearts: LocalHeart[] = Array.from({ length: 6 }).map((_, i) => ({
      id: nextId.current++,
      x: w / 2 + (Math.random() * 80 - 40),
      y: h - 15 - (Math.random() * 15),
      size: Math.random() * 10 + 12,
      scale: 0.6 + Math.random() * 0.6,
      drift: Math.random() * 60 - 30,
      duration: 1.0 + Math.random() * 0.5,
    }));

    setHearts(prev => [...prev, ...newHearts]);

    setTimeout(() => {
      setHearts(prev => prev.filter(item => !newHearts.find(nh => nh.id === item.id)));
    }, 1600);
  };

  return (
    <div onMouseEnter={handleMouseEnter} className={`relative ${className}`}>
      {children}
      {hearts.map(h => (
        <motion.div
          key={h.id}
          initial={{ opacity: 0, scale: 0.5, x: h.x, y: h.y }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: h.y - 110,
            x: h.x + h.drift,
            scale: h.scale,
          }}
          transition={{ duration: h.duration, ease: 'easeOut' }}
          className="absolute text-red-500 font-bold pointer-events-none z-[100] select-none"
          style={{
            fontSize: `${h.size}px`,
            left: 0,
            top: 0,
            textShadow: '0 0 8px rgba(239, 68, 68, 0.6)',
          }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  );
}

export function WeStartedWithTestimonial() {
  const [activeTab, setActiveTab] = useState<'testimonial' | 'collection' | 'inbox' | 'wall' | 'analytics' | 'import'>('testimonial');
  
  // Zustand state
  const stateTestimonials = useStore(state => state.testimonials);
  
  // 1. Branded Collection Config State
  const [spaceTitle, setSpaceTitle] = useState('Acme Corp');
  const [spaceTheme, setSpaceTheme] = useState<'purple' | 'lavender' | 'indigo'>('purple');

  // 2. Smart Inbox State
  const [localTestimonials, setLocalTestimonials] = useState<Testimonial[]>([]);
  
  useEffect(() => {
    // Show first 2 pending or available testimonials
    setLocalTestimonials(stateTestimonials.slice(0, 2));
  }, [stateTestimonials]);

  const handleApproveTestimonial = (id: string) => {
    // Update the Zustand store
    useStore.getState().updateTestimonialStatus(id, 'approved');
    
    // Update local list
    setLocalTestimonials(prev => prev.map(t => t.id === id ? { ...t, status: 'approved' } : t));
  };

  // 3. Wall of Love Embed State
  const [embedTheme, setEmbedTheme] = useState<'dark' | 'light'>('dark');

  // 4. Video Analytics State
  const totalViews = stateTestimonials.reduce((sum, t) => sum + (t.views || 0), 0);
  const totalClicks = stateTestimonials.reduce((sum, t) => sum + (t.clicks || 0), 0);

  // 5. Social Import State
  const [importSource, setImportSource] = useState<'twitter' | 'google' | 'linkedin'>('twitter');
  const [importText, setImportText] = useState('Proofly is absolutely game-changing! We set up our reviews collector in under 15 minutes.');
  const [importAuthor, setImportAuthor] = useState('Marcus Vance');
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);

  // Clickable mock feed items to populate inputs
  const mockFeed = {
    twitter: [
      { author: 'Jonathan Mercer', handle: '@jonathan_saas', content: 'Proofly is next level. Our conversion rates went up by 18% in the first week!', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100' },
      { author: 'Alex Rivera', handle: '@alex_m_dev', content: 'Just imported all our Google reviews into our landing page in under 5 minutes. Brilliant UX.', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100' }
    ],
    google: [
      { author: 'Sarah Connor', handle: 'Google Local Guide', content: 'Incredibly easy to gather video feedback. The webcam recorder works flawlessly on mobile browsers.', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100' },
      { author: 'David Kim', handle: 'Verified Reviewer', content: 'The Wall of Love widget load speeds are blazing fast compared to testimonials.to. Excellent product.', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100' }
    ],
    linkedin: [
      { author: 'Emma Watson', handle: 'VP of Growth @ ScaleUp', content: 'We swapped testimonials.to for Proofly. The AI transcription and sentiment analysis tools save our marketing team hours of manual sorting.', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100' },
      { author: 'Robert Chen', handle: 'Founder @ CloudStack', content: 'The developer APIs are well documented. We built a custom testimonial card layout using the JSON endpoints in less than an hour.', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100' }
    ]
  };

  const handleSelectMockFeedItem = (author: string, content: string) => {
    setImportAuthor(author);
    setImportText(content);
  };

  const handleSimulateImport = () => {
    if (!importText.trim() || !importAuthor.trim()) return;
    setIsImporting(true);

    setTimeout(() => {
      const newTestimonial = {
        id: `imported-${Date.now()}`,
        collection_id: 'col-1',
        name: importAuthor,
        company: importSource === 'twitter' ? 'Twitter Feed' : importSource === 'linkedin' ? 'LinkedIn Pulse' : 'Google Reviews',
        role: 'Verified Customer',
        review: importText,
        status: 'pending' as const,
        rating: 5,
        reviewerEmail: `${importAuthor.toLowerCase().replace(/[^a-z0-9]/g, '')}@gmail.com`,
        reviewerAvatar: `https://api.dicebear.com/7.x/initials/svg?seed=${importAuthor}`,
        sentiment: 'POSITIVE' as const,
        keywords: ['imported', importSource],
        createdAt: new Date().toISOString(),
        views: Math.floor(Math.random() * 200 + 100),
        clicks: Math.floor(Math.random() * 50 + 20),
        shares: Math.floor(Math.random() * 10),
        trustScore: 95,
        bestQuoteHighlight: importText.slice(0, 35) + '...'
      };

      // Push into Zustand store
      useStore.setState(state => ({
        testimonials: [newTestimonial, ...state.testimonials]
      }));

      setIsImporting(false);
      setImportSuccess(true);
      setImportText('');
      setImportAuthor('');

      setTimeout(() => setImportSuccess(false), 3000);
    }, 1200);
  };

  const tabs = [
    {
      id: 'testimonial',
      name: 'Testimonial',
      desc: 'A dedicated page for collecting text and video testimonials, organized in one tidy inbox, embeddable anywhere. Included on every plan — free to start.',
      badge: 'THE ORIGINAL',
      isOriginalHeader: true
    },
    {
      id: 'collection',
      name: 'Branded collection page',
      desc: 'A no-code page you share via link — your logo, colors, custom domain.',
    },
    {
      id: 'inbox',
      name: 'Smart inbox',
      desc: 'Read, tag, approve, reply — every testimonial in one tidy place.',
    },
    {
      id: 'wall',
      name: 'Wall of Love embed',
      desc: 'Drop a one-line snippet on your site and show off your best testimonials.',
    },
    {
      id: 'analytics',
      name: 'Video analytics',
      desc: 'Track views and clicks on every embedded video — see what\'s converting.',
    },
    {
      id: 'import',
      name: 'Social import',
      desc: 'Pull existing praise from X, LinkedIn, Reddit, G2, Yelp, Google, TikTok and more.',
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-24 text-center space-y-12 relative font-sans">
      {/* Background radial soft light gradient */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="space-y-4">
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-none">
          We started with Testimonial
        </h2>
        <p className="text-slate-400 text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
          An entire social proof ecosystem built on beauty, conversion metrics, and real-time interactive dashboards.
        </p>
      </div>

      {/* Main Interactive Grid - Deep Indigo Navy Theme Gradient */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch bg-gradient-to-br from-[#0c0d1b] to-[#07080f] border border-[#2b2c4e] p-5 md:p-8 rounded-3xl backdrop-blur-md shadow-[0_15px_50px_rgba(99,102,241,0.06)] relative overflow-hidden">
        
        {/* Left Navigation Menu */}
        <div className="lg:col-span-5 flex flex-col justify-between text-left space-y-6">
          
          <div className="space-y-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              
              if (tab.isOriginalHeader) {
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab('testimonial')}
                    className={`w-full p-5 rounded-2xl border text-left transition duration-300 flex items-start space-x-4 cursor-pointer relative overflow-hidden ${
                      isActive
                        ? 'bg-[#181635]/50 border-[#4f46e5]/60 shadow-[0_0_20px_rgba(99,102,241,0.12)] ring-1 ring-[#6366f1]/20'
                        : 'bg-transparent border-transparent hover:bg-[#15162a]/40 hover:border-[#383a69]/40'
                    }`}
                  >
                    {/* Testimonial Heart Icon Block (Purple box, Blue heart icon) */}
                    <div className="w-10 h-10 rounded-xl bg-[#4f46e5] flex items-center justify-center border border-[#6366f1]/30 shrink-0 shadow-[0_0_12px_rgba(99,102,241,0.25)]">
                      <Heart className="w-5 h-5 text-[#38bdf8] fill-[#38bdf8]" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-black text-white">
                          {tab.name}
                        </h4>
                        <span className="bg-[#2563eb]/20 border border-[#3b82f6]/30 text-blue-400 px-1.5 py-0.5 rounded-[4px] text-[8px] font-black tracking-widest uppercase">
                          {tab.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                        {tab.desc}
                      </p>
                    </div>
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full p-4 rounded-xl border text-left transition duration-300 flex items-start space-x-3 cursor-pointer ${
                    isActive
                      ? 'bg-[#181635]/50 border-[#4f46e5]/60 shadow-[0_0_20px_rgba(99,102,241,0.12)] ring-1 ring-[#6366f1]/20'
                      : 'bg-transparent border-transparent hover:bg-[#15162a]/40 hover:border-[#383a69]/40'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${
                    isActive ? 'bg-indigo-400 animate-pulse' : 'bg-zinc-700'
                  }`} />
                  <div>
                    <h4 className={`text-xs font-bold transition ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}>
                      {tab.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 leading-normal mt-1 max-w-sm">
                      {tab.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 pl-2">
            <Link 
              href="/signup" 
              className="inline-flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-indigo-400 hover:text-indigo-300 transition group"
            >
              <span>Try it free</span>
              <ChevronRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Preview Display Simulator - Sleek Slate Navy Window */}
        <div className="lg:col-span-7 bg-[#0d0e1b] border border-[#20223f] rounded-2xl flex flex-col justify-between overflow-hidden shadow-2xl relative min-h-[470px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl" />

          {/* Title / Windows Bar */}
          <div className="flex items-center justify-between border-b border-[#1f213a] px-4 py-3 bg-[#131424]">
            <div className="flex items-center space-x-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <span className="text-[9px] font-mono text-[#818cf8] uppercase tracking-widest flex items-center space-x-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>Interactive Simulator</span>
            </span>
          </div>

          {/* Main Simulator Viewports */}
          <div className="flex-1 p-5 flex flex-col justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Testimonial (The Original Inbox Panel) */}
              {activeTab === 'testimonial' && (
                <motion.div
                  key="testimonial-original-viewport"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-12 gap-4 h-full text-left"
                >
                  {/* Mock Sidebar Navigation */}
                  <div className="col-span-4 border-r border-[#1f213a] pr-3 space-y-4 select-none">
                    <div>
                      <span className="text-[8px] font-bold text-zinc-500 tracking-wider block mb-1.5">INBOX</span>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] bg-[#1a1c36] px-2 py-1 rounded text-white font-medium border border-indigo-500/10">
                          <span className="flex items-center"><FolderOpen className="w-2.5 h-2.5 mr-1 text-indigo-400" /> All</span>
                          <span className="text-zinc-400 text-[8px] font-bold">93</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 hover:text-white px-2 py-1 transition cursor-pointer">
                          <span className="flex items-center"><Video className="w-2.5 h-2.5 mr-1 text-zinc-500" /> Video</span>
                          <span className="text-zinc-650 text-[8px]">43</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 hover:text-white px-2 py-1 transition cursor-pointer">
                          <span className="flex items-center"><MessageSquare className="w-2.5 h-2.5 mr-1 text-zinc-500" /> Text</span>
                          <span className="text-zinc-650 text-[8px]">50</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[8px] font-bold text-zinc-500 tracking-wider block mb-1.5">INTEGRATIONS</span>
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <span className="text-[8px] text-zinc-600 block font-semibold">Social Media</span>
                          <div className="flex space-x-1.5">
                            <div className="w-5 h-5 rounded bg-[#090912] flex items-center justify-center border border-[#1f213a]">
                              <svg className="w-2.5 h-2.5 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                              </svg>
                            </div>
                            <div className="w-5 h-5 rounded bg-[#090912] flex items-center justify-center border border-[#1f213a]">
                              <svg className="w-2.5 h-2.5 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56V14.9c0-1.32-.03-3.01-1.84-3.01-1.84 0-2.12 1.43-2.12 2.91v5.65h-3.56V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
                              </svg>
                            </div>
                            <div className="w-5 h-5 rounded bg-[#090912] flex items-center justify-center border border-[#1f213a]">
                              <svg className="w-2.5 h-2.5 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8px] text-zinc-600 block font-semibold">External Videos</span>
                          <div className="flex space-x-1.5">
                            <div className="w-5 h-5 rounded bg-[#090912] flex items-center justify-center border border-[#1f213a]">
                              <svg className="w-2.5 h-2.5 text-red-650" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.507a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11C4.483 20.455 12 20.455 12 20.455s7.517 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                              </svg>
                            </div>
                            <div className="w-5 h-5 rounded bg-[#090912] flex items-center justify-center border border-[#1f213a]">
                              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.99-1.72a6.7 6.7 0 0 1-1.9-2.88v7.41a6.72 6.72 0 0 1-1.37 4.09A6.71 6.71 0 0 1 5.9 19.34a6.73 6.73 0 0 1-1.44-4.78 6.73 6.73 0 0 1 6.72-6.68c.24.01.47.03.71.07V12.1a2.68 2.68 0 0 0-.71-.1 2.69 2.69 0 0 0-2.69 2.69 2.68 2.68 0 0 0 2.69 2.69 2.69 2.69 0 0 0 2.69-2.69V0h-1.35z"/>
                              </svg>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[8px] text-zinc-600 block font-semibold">Other Reviews</span>
                          <div className="flex space-x-1.5">
                            <div className="w-5 h-5 rounded bg-[#090912] flex items-center justify-center border border-[#1f213a]">
                              <svg className="w-2.5 h-2.5 text-[#4285F4]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.103C18.28 1.845 15.547 1 12.24 1 5.866 1 .693 6.173.693 12.5s5.173 11.5 11.547 11.5c6.657 0 11.08-4.681 11.08-11.275 0-.765-.082-1.35-.18-1.94H12.24z"/>
                              </svg>
                            </div>
                            <div className="w-5 h-5 rounded bg-[#090912] flex items-center justify-center border border-[#1f213a]">
                              <svg className="w-2.5 h-2.5 text-[#DA552F]" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M13.6 8.4h-3.4v3.2h3.4c.9 0 1.6-.7 1.6-1.6s-.7-1.6-1.6-1.6zm.4 8h-4v-3.2h4c.9 0 1.6-.7 1.6-1.6s-.7-1.6-1.6-1.6zm-4.4-11.6h5.8c2.8 0 5 2.2 5 5s-2.2 5-5 5H9.6v6H5.6V4.8h4zm0 0"/>
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mock Main Pane */}
                  <div className="col-span-8 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3.5">
                      <div className="flex items-center justify-between border-b border-[#1f213a] pb-2">
                        <span className="text-[10px] font-black text-white uppercase tracking-wider">Video Testimonials</span>
                        <span className="text-[8px] text-zinc-550 font-bold uppercase">Updated 2m ago</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Video Review Card 1 */}
                        <HoverHeartWrapper>
                          <div className="bg-[#131526] border border-[#23264c] rounded-xl overflow-hidden shadow-lg group/item cursor-pointer relative h-[140px] hover:border-indigo-500/40 transition duration-300">
                            <img 
                              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=60" 
                              alt="thumb" 
                              className="w-full h-full object-cover opacity-75 group-hover/item:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            <div className="absolute top-2 left-2 bg-[#090912]/80 border border-indigo-500/20 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded tracking-wide">
                              Video
                            </div>
                            <div className="absolute top-2 right-2 text-zinc-400 text-[6px] font-semibold">
                              26m ago
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/35 flex items-center justify-center group-hover/item:scale-110 group-hover/item:bg-white/20 transition-all shadow">
                                <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 truncate text-left">
                              <span className="text-[9px] font-black text-white block truncate">Sarah Jenkins</span>
                              <span className="text-[7px] text-zinc-400 truncate block">DevFlow Inc · SaaS Founder</span>
                            </div>
                          </div>
                        </HoverHeartWrapper>

                        {/* Video Review Card 2 */}
                        <HoverHeartWrapper>
                          <div className="bg-[#131526] border border-[#23264c] rounded-xl overflow-hidden shadow-lg group/item cursor-pointer relative h-[140px] hover:border-indigo-500/40 transition duration-300">
                            <img 
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60" 
                              alt="thumb" 
                              className="w-full h-full object-cover opacity-75 group-hover/item:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
                            <div className="absolute top-2 left-2 bg-[#090912]/80 border border-indigo-500/20 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded tracking-wide">
                              Video
                            </div>
                            <div className="absolute top-2 right-2 text-zinc-400 text-[6px] font-semibold">
                              28m ago
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-md border border-white/35 flex items-center justify-center group-hover/item:scale-110 group-hover/item:bg-white/20 transition-all shadow">
                                <Play className="w-3.5 h-3.5 text-white fill-white ml-0.5" />
                              </div>
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 truncate text-left">
                              <span className="text-[9px] font-black text-white block truncate">Amelia Ross</span>
                              <span className="text-[7px] text-zinc-400 truncate block">HypeDesign · Studio Lead</span>
                            </div>
                          </div>
                        </HoverHeartWrapper>
                      </div>
                    </div>

                    {/* Pagination indicators */}
                    <div className="flex justify-center space-x-1.5 pb-1 select-none">
                      <div className="w-2.5 h-1 rounded bg-indigo-500" />
                      <div className="w-1 h-1 rounded bg-zinc-700" />
                      <div className="w-1 h-1 rounded bg-zinc-700" />
                      <div className="w-1 h-1 rounded bg-zinc-700" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Branded Collection */}
              {activeTab === 'collection' && (
                <motion.div
                  key="collection-viewport"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left h-full"
                >
                  {/* Editor Side */}
                  <div className="space-y-4 border-r border-[#1f213a] pr-4 select-none">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider block">Space Settings</span>
                    
                    <div className="space-y-1">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider">Collector Title</label>
                      <input
                        type="text"
                        value={spaceTitle}
                        onChange={(e) => setSpaceTitle(e.target.value)}
                        className="w-full bg-[#080911] border border-[#1f213a] p-2.5 text-xs text-white rounded-lg outline-none focus:border-[#4f46e5] transition"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] text-zinc-500 font-bold uppercase tracking-wider block">Theme Accents</label>
                      <div className="flex space-x-2">
                        {(['purple', 'lavender', 'indigo'] as const).map((col) => (
                          <button
                            key={col}
                            onClick={() => setSpaceTheme(col)}
                            className={`w-4 h-4 rounded-full border border-white/20 capitalize cursor-pointer transition ${
                              col === 'purple' ? 'bg-[#6C5CFF]' : col === 'lavender' ? 'bg-[#8677FF]' : 'bg-indigo-500'
                            } ${spaceTheme === col ? 'ring-2 ring-white/60 scale-110 shadow-[0_0_10px_rgba(255,255,255,0.2)]' : ''}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Preview Side */}
                  <HoverHeartWrapper className="h-full">
                    <div className="bg-[#080911] p-4 rounded-xl border border-[#1f213a] flex flex-col justify-between h-full min-h-[180px] shadow-lg">
                      <div>
                        <div className="w-8 h-8 rounded-lg bg-[#16172a] border border-[#2d305d] flex items-center justify-center mb-3">
                          <Globe className="w-4 h-4 text-indigo-400" />
                        </div>
                        <h5 className="text-white text-xs font-bold truncate">{spaceTitle || 'Unnamed Space'}</h5>
                        <p className="text-[9px] text-slate-500 mt-1">Leave a review for our product page</p>
                      </div>

                      <div className="space-y-2 mt-4">
                        <button 
                          className={`w-full py-2 rounded-lg text-[9px] font-black text-white uppercase tracking-wider transition ${
                            spaceTheme === 'purple' ? 'bg-brand-emerald shadow-[0_0_15px_rgba(108,92,255,0.25)] hover:bg-[#8677FF]' : spaceTheme === 'lavender' ? 'bg-brand-teal shadow-[0_0_15px_rgba(134,119,255,0.25)] hover:bg-brand-teal-hover' : 'bg-indigo-650 shadow-[0_0_15px_rgba(99,102,241,0.25)] hover:bg-indigo-600'
                          }`}
                        >
                          Record Video
                        </button>
                        <button className="w-full py-2 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-zinc-800 transition">
                          Write Text
                        </button>
                      </div>
                    </div>
                  </HoverHeartWrapper>
                </motion.div>
              )}

              {/* Tab 3: Smart Inbox */}
              {activeTab === 'inbox' && (
                <motion.div
                  key="inbox-viewport"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3.5 text-left h-full flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between border-b border-[#1f213a] pb-1.5">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider">Inbox Approvals Queue</span>
                    <span className="bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-[8px] font-bold px-1.5 py-0.5 rounded">
                      Zustand Database Connected
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1 py-1">
                    {localTestimonials.map((t) => (
                      <HoverHeartWrapper key={t.id}>
                        <div className="bg-[#131526] border border-[#23264c] p-3 rounded-lg flex items-center justify-between shadow-sm">
                          <div className="flex items-start space-x-3 max-w-[70%]">
                            <img 
                              src={t.reviewerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${t.name}`} 
                              alt="avatar" 
                              className="w-7 h-7 rounded-full object-cover bg-zinc-900 border border-zinc-800 mt-0.5 shrink-0" 
                            />
                            <div className="truncate">
                              <span className="text-[11px] font-bold text-white block truncate">{t.name}</span>
                              <p className="text-[9px] text-slate-350 italic line-clamp-1">"{t.review}"</p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0 select-none">
                            {t.status === 'approved' ? (
                              <span className="bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-[8px] font-black px-2.5 py-1 rounded flex items-center shadow">
                                <Check className="w-2.5 h-2.5 mr-1" /> APPROVED
                              </span>
                            ) : (
                              <button
                                onClick={() => handleApproveTestimonial(t.id)}
                                className="bg-indigo-600 hover:bg-indigo-500 text-white text-[8px] font-black px-2.5 py-1 rounded-lg cursor-pointer transition shadow border border-indigo-400/20 active:scale-95"
                              >
                                APPROVE
                              </button>
                            )}
                          </div>
                        </div>
                      </HoverHeartWrapper>
                    ))}
                  </div>

                  <span className="text-[8px] text-zinc-550 font-bold block select-none">
                    * Approving testimonials will publish them instantly to the Wall of Love below.
                  </span>
                </motion.div>
              )}

              {/* Tab 4: Wall of Love Embed */}
              {activeTab === 'wall' && (
                <motion.div
                  key="wall-viewport"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 text-left h-full"
                >
                  <div className="flex items-center justify-between border-b border-[#1f213a] pb-2">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider">Widget Theme Preview</span>
                    
                    <div className="flex space-x-1">
                      {['dark', 'light'].map((thm) => (
                        <button
                          key={thm}
                          onClick={() => setEmbedTheme(thm as any)}
                          className={`px-2.5 py-0.5 rounded text-[8px] font-black uppercase cursor-pointer border transition ${
                            embedTheme === thm 
                              ? 'bg-zinc-800 border-zinc-700 text-white shadow' 
                              : 'bg-transparent border-transparent text-zinc-550 hover:text-zinc-350'
                          }`}
                        >
                          {thm}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Render 2 Mock Card Previews side by side */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {[
                      { name: 'Sarah Jenkins', role: 'SaaS Founder', review: 'REST APIs are extremely simple and fast.' },
                      { name: 'James Cole', role: 'Agency Owner', review: 'Increased our landing conversions by 24%.' }
                    ].map((mock, idx) => (
                      <HoverHeartWrapper key={idx}>
                        <div 
                          className={`p-3.5 rounded-xl border text-left space-y-2.5 transition duration-350 min-h-[100px] flex flex-col justify-between ${
                            embedTheme === 'dark' 
                              ? 'bg-[#0a0a14] border-[#1f213a] text-white shadow-md' 
                              : 'bg-white border-zinc-200 text-zinc-900 shadow-sm'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex text-amber-400">
                              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
                            </div>
                            <p className={`text-[9px] leading-relaxed font-medium ${embedTheme === 'dark' ? 'text-zinc-300' : 'text-zinc-650'}`}>
                              "{mock.review}"
                            </p>
                          </div>
                          <span className={`text-[8px] font-bold block ${embedTheme === 'dark' ? 'text-zinc-550' : 'text-zinc-450'}`}>
                            {mock.name} · {mock.role}
                          </span>
                        </div>
                      </HoverHeartWrapper>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Tab 5: Video Analytics */}
              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics-viewport"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4 text-left h-full flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider block mb-2">Video Embeds Performance</span>
                    
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-[#131526] border border-[#23264c] p-2.5 rounded-lg text-center shadow-inner">
                        <span className="text-[7.5px] text-[#818cf8] font-extrabold block uppercase tracking-wider">Impressions</span>
                        <span className="text-xs font-black text-white font-mono">{totalViews.toLocaleString()}</span>
                      </div>
                      <div className="bg-[#131526] border border-[#23264c] p-2.5 rounded-lg text-center shadow-inner">
                        <span className="text-[7.5px] text-[#818cf8] font-extrabold block uppercase tracking-wider">Interactions</span>
                        <span className="text-xs font-black text-white font-mono">{totalClicks.toLocaleString()}</span>
                      </div>
                      <div className="bg-[#131526] border border-[#23264c] p-2.5 rounded-lg text-center shadow-inner">
                        <span className="text-[7.5px] text-[#818cf8] font-extrabold block uppercase tracking-wider">Average CTR</span>
                        <span className="text-xs font-black text-indigo-400 font-mono">
                          {totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '6.4'}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Analytical SVG Line Chart */}
                  <div className="bg-[#0c0d1b] border border-[#20223f] p-2.5 rounded-lg h-24 flex flex-col justify-end relative shadow-inner">
                    <div className="absolute top-2 right-2 flex items-center space-x-1 text-[7.5px] font-black uppercase text-brand-emerald select-none">
                      <TrendingUp className="w-2.5 h-2.5 text-brand-emerald" />
                      <span>+18.4% this week</span>
                    </div>
                    <svg viewBox="0 0 300 80" className="w-full h-full text-indigo-500 filter drop-shadow-[0_2px_8px_rgba(99,102,241,0.25)]">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgb(99,102,241)" stopOpacity="0.2"/>
                          <stop offset="100%" stopColor="rgb(99,102,241)" stopOpacity="0.0"/>
                        </linearGradient>
                      </defs>
                      <path 
                        d="M0,70 Q25,55 50,45 T100,55 T150,25 T200,35 T250,15 T300,10 L300,80 L0,80 Z" 
                        fill="url(#chartGrad)"
                      />
                      <path 
                        d="M0,70 Q25,55 50,45 T100,55 T150,25 T200,35 T250,15 T300,10" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                </motion.div>
              )}

              {/* Tab 6: Social Import (Completed upgraded interface with mock reviews feed) */}
              {activeTab === 'import' && (
                <motion.div
                  key="import-viewport"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-3.5 text-left h-full flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <span className="text-[9px] font-black text-indigo-400 uppercase tracking-wider block">Simulated Reviews Importing</span>

                    {/* Source Toggle Headers */}
                    <div className="flex space-x-2 border-b border-[#1f213a] pb-2 select-none">
                      <button
                        onClick={() => setImportSource('twitter')}
                        className={`px-3 py-1.5 rounded-lg text-[9.5px] font-bold flex items-center space-x-1.5 border transition cursor-pointer ${
                          importSource === 'twitter' 
                            ? 'bg-[#181635] border-[#4f46e5]/50 text-white shadow' 
                            : 'bg-transparent border-[#1f213a] text-zinc-500'
                        }`}
                      >
                        <svg className="w-3 h-3 text-[#1DA1F2]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                        </svg>
                        <span>X Feed</span>
                      </button>
                      <button
                        onClick={() => setImportSource('google')}
                        className={`px-3 py-1.5 rounded-lg text-[9.5px] font-bold flex items-center space-x-1.5 border transition cursor-pointer ${
                          importSource === 'google' 
                            ? 'bg-[#181635] border-[#4f46e5]/50 text-white shadow' 
                            : 'bg-transparent border-[#1f213a] text-zinc-500'
                        }`}
                      >
                        <svg className="w-3 h-3 text-[#4285F4]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.103C18.28 1.845 15.547 1 12.24 1 5.866 1 .693 6.173.693 12.5s5.173 11.5 11.547 11.5c6.657 0 11.08-4.681 11.08-11.275 0-.765-.082-1.35-.18-1.94H12.24z"/>
                        </svg>
                        <span>Google</span>
                      </button>
                      <button
                        onClick={() => setImportSource('linkedin')}
                        className={`px-3 py-1.5 rounded-lg text-[9.5px] font-bold flex items-center space-x-1.5 border transition cursor-pointer ${
                          importSource === 'linkedin' 
                            ? 'bg-[#181635] border-[#4f46e5]/50 text-white shadow' 
                            : 'bg-transparent border-[#1f213a] text-zinc-500'
                        }`}
                      >
                        <svg className="w-3 h-3 text-[#0A66C2]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.43c-1.14 0-2.06-.92-2.06-2.06 0-1.14.92-2.06 2.06-2.06 1.14 0 2.06.92 2.06 2.06 0 1.14-.92 2.06-2.06 2.06zm15.11 13.02h-3.56V14.9c0-1.32-.03-3.01-1.84-3.01-1.84 0-2.12 1.43-2.12 2.91v5.65h-3.56V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z"/>
                        </svg>
                        <span>LinkedIn</span>
                      </button>
                    </div>
                  </div>

                  {/* One-Click Import Feed (Solves empty black space) */}
                  <div className="space-y-2 flex-1 overflow-y-auto max-h-[140px] pr-1 py-1">
                    <span className="text-[7.5px] font-black uppercase text-zinc-550 block mb-1">Click a post to import immediately:</span>
                    
                    {mockFeed[importSource].map((item, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleSelectMockFeedItem(item.author, item.content)}
                        className="p-2.5 rounded-lg bg-[#131526] border border-[#23264c] hover:border-indigo-500/40 hover:bg-[#1b1e36] transition cursor-pointer flex items-start space-x-2.5 text-left group"
                      >
                        <img src={item.avatar} alt="avatar" className="w-6 h-6 rounded-full border border-zinc-800 shrink-0 object-cover mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-[9px] font-black text-white truncate block">{item.author}</span>
                            <span className="text-[7.5px] text-zinc-500 font-mono truncate block">{item.handle}</span>
                          </div>
                          <p className="text-[8px] text-slate-350 leading-relaxed line-clamp-2 mt-0.5 group-hover:text-white transition">
                            "{item.content}"
                          </p>
                        </div>
                        <div className="w-5 h-5 rounded-full bg-indigo-650/40 border border-indigo-500/25 flex items-center justify-center text-indigo-300 opacity-60 group-hover:opacity-100 group-hover:bg-indigo-650 transition shrink-0 self-center">
                          <Plus className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Manual Importer Form fields at bottom */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center w-full border-t border-[#1f213a]/50 pt-2.5">
                    <div className="sm:col-span-8 space-y-2 select-text">
                      <input
                        type="text"
                        placeholder="Author (e.g. Marcus Vance)"
                        value={importAuthor}
                        onChange={(e) => setImportAuthor(e.target.value)}
                        className="w-full bg-[#080911] border border-[#1f213a] p-2 text-xs text-white rounded-lg outline-none focus:border-[#4f46e5] transition placeholder-zinc-650"
                      />
                      <input
                        type="text"
                        placeholder="Import review content..."
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        className="w-full bg-[#080911] border border-[#1f213a] p-2 text-xs text-white rounded-lg outline-none focus:border-[#4f46e5] transition placeholder-zinc-650"
                      />
                    </div>

                    <div className="sm:col-span-4 h-full">
                      <button
                        onClick={handleSimulateImport}
                        disabled={isImporting}
                        className="w-full h-full bg-indigo-650 hover:bg-indigo-600 text-white py-3.5 rounded-lg text-[9.5px] font-black uppercase tracking-wider flex items-center justify-center space-x-1 border border-indigo-500/25 cursor-pointer shadow transition active:scale-95"
                      >
                        {isImporting ? (
                          <span>Importing...</span>
                        ) : importSuccess ? (
                          <span className="text-brand-emerald">Success!</span>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Import</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Pagination Indicators Bottom */}
          <div className="flex justify-center space-x-2 border-t border-[#1f213a] py-4 bg-[#131424] select-none">
            {['testimonial', 'collection', 'inbox', 'wall', 'analytics', 'import'].map((item) => (
              <button
                key={item}
                onClick={() => setActiveTab(item as any)}
                className={`w-1.5 h-1.5 rounded-full cursor-pointer transition-all duration-300 ${
                  activeTab === item ? 'bg-indigo-550 w-3' : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
