'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Pause,
  Volume2,
  Maximize2,
  Check, 
  Video, 
  MessageSquare, 
  Cpu, 
  Search, 
  Layers, 
  Terminal,
  ChevronDown,
  X,
  Star,
  Smile,
  Activity,
  Tag
} from 'lucide-react';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WallOfLoveShowcase } from '@/components/WallOfLoveShowcase';
import { useStore, Testimonial } from '@/store/useStore';
import { SpotlightCard } from '@/components/SpotlightCard';
import { CandyHeart3D } from '@/components/CandyHeart3D';
import { StripeCheckoutModal } from '@/components/StripeCheckoutModal';
import { SampleEmbedPlayground } from '@/components/SampleEmbedPlayground';

export default function LandingPage() {
  const testimonials = useStore(state => state.testimonials);
  const user = useStore(state => state.user);
  const fetchApprovedTestimonials = useStore(state => state.fetchApprovedTestimonials);
  const [layoutMode, setLayoutMode] = useState<'masonry' | 'grid' | 'carousel'>('masonry');
  const [filterFormat, setFilterFormat] = useState<'all' | 'video' | 'text'>('all');
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  useEffect(() => {
    fetchApprovedTestimonials();
  }, [fetchApprovedTestimonials]);

  // Stripe Modal state
  const [selectedPlan, setSelectedPlan] = useState<{ id: 'FREE' | 'PRO'; name: string; price: string } | null>(null);
  
  // FAQ Active State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Interactive Hero tabbed showcase states
  const [heroTab, setHeroTab] = useState<'dashboard' | 'recorder' | 'widget'>('recorder');
  const [autoPlay, setAutoPlay] = useState(true);
  const [recordingSeconds, setRecordingSeconds] = useState(14);
  const [sentimentScore, setSentimentScore] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [inboxCount, setInboxCount] = useState(0);
  const [typedText, setTypedText] = useState("");
  const [searchText, setSearchText] = useState("");
  const [widgetLoading, setWidgetLoading] = useState(true);

  // Search input typing effect inside Manage tab
  useEffect(() => {
    if (heroTab !== 'dashboard') {
      setSearchText("");
      return;
    }
    const fullSearch = "setup";
    let text = "";
    let idx = 0;
    const interval = setInterval(() => {
      if (idx < fullSearch.length) {
        text += fullSearch[idx];
        setSearchText(text);
        idx++;
      } else {
        clearInterval(interval);
      }
    }, 250);
    return () => clearInterval(interval);
  }, [heroTab]);

  // Skeletal loader delay inside Showcase tab
  useEffect(() => {
    if (heroTab !== 'widget') {
      setWidgetLoading(true);
      return;
    }
    const timeout = setTimeout(() => {
      setWidgetLoading(false);
    }, 900);
    return () => clearTimeout(timeout);
  }, [heroTab]);

  // Simulated Video Player States
  const [videoPlaying, setVideoPlaying] = useState(true);
  const [videoTime, setVideoTime] = useState(0);

  // Reset video when demo modal opens
  useEffect(() => {
    if (isDemoOpen) {
      setVideoTime(0);
      setVideoPlaying(true);
    }
  }, [isDemoOpen]);

  // Video clock ticking up to 45 seconds
  useEffect(() => {
    if (!isDemoOpen || !videoPlaying) return;
    const interval = setInterval(() => {
      setVideoTime((prev) => (prev >= 45 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isDemoOpen, videoPlaying]);

  const autoplayTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up autoplay timeout on unmount
  useEffect(() => {
    return () => {
      if (autoplayTimeoutRef.current) clearTimeout(autoplayTimeoutRef.current);
    };
  }, []);

  // Handler for custom tab changes (pauses autoplay, schedules resume after 8s)
  const handleHeroTabChange = (tabId: 'recorder' | 'dashboard' | 'widget') => {
    setHeroTab(tabId);
    setAutoPlay(false);
    if (autoplayTimeoutRef.current) {
      clearTimeout(autoplayTimeoutRef.current);
    }
    autoplayTimeoutRef.current = setTimeout(() => {
      setAutoPlay(true);
    }, 8000);
  };

  // 1. Auto-play loop to cycle tabs every 4.5 seconds (Collect -> Manage -> Showcase)
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setHeroTab((prev) => {
        if (prev === 'recorder') return 'dashboard';
        if (prev === 'dashboard') return 'widget';
        return 'recorder';
      });
    }, 4500);
    return () => clearInterval(interval);
  }, [autoPlay]);

  // 2. Count up timer for Recorder UI
  useEffect(() => {
    if (heroTab !== 'recorder') {
      setRecordingSeconds(14);
      return;
    }
    const interval = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [heroTab]);

  // 3. Count up animation for Dashboard numbers
  useEffect(() => {
    if (heroTab !== 'dashboard') {
      setSentimentScore(0);
      setReviewsCount(0);
      setInboxCount(0);
      return;
    }
    const duration = 1000;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = progress * (2 - progress); // easeOutQuad
      setSentimentScore(Math.round(easeProgress * 84));
      setReviewsCount(Math.round(easeProgress * 12));
      setInboxCount(Math.round(easeProgress * 48));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [heroTab]);

  // 4. Typewriter text simulation for Dashboard AI summary
  const fullSummaryText = "Sarah details the fast 15-minute onboarding configuration and the quality of developer integrations.";
  useEffect(() => {
    if (heroTab !== 'dashboard') {
      setTypedText("");
      return;
    }
    let currentText = "";
    let charIndex = 0;
    const interval = setInterval(() => {
      if (charIndex < fullSummaryText.length) {
        currentText += fullSummaryText.charAt(charIndex);
        setTypedText(currentText);
        charIndex++;
      } else {
        clearInterval(interval);
      }
    }, 20);
    return () => clearInterval(interval);
  }, [heroTab]);

  // Filter approved testimonials
  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');

  // Filtered testimonials based on selected format
  const filteredTestimonials = approvedTestimonials.filter(t => {
    if (filterFormat === 'video') return !!t.video_url;
    if (filterFormat === 'text') return !t.video_url;
    return true;
  });



  const pricingTiers = [
    {
      id: 'FREE' as const,
      name: 'Beta Plan',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for early builders and startup launches. Free during public beta.',
      features: [
        'Unlimited spaces & widgets',
        'In-browser webcam video recording',
        'AI transcription & sentiments',
        'Standard text reviews',
        'Proofly branding badge'
      ],
      cta: 'Start Free',
      accent: true
    },
    {
      id: 'PRO' as const,
      name: 'Pro Founding Member',
      price: '$19',
      period: 'per month',
      desc: 'For growing startups who want to support Proofly and remove the badge.',
      features: [
        'Everything in Beta',
        'Remove Proofly branding badge',
        'Custom domain aliases (CNAME)',
        'Priority founder support'
      ],
      cta: 'Start Pro Trial',
      accent: false
    }
  ];

  const faqs = [
    {
      q: 'How does the AI sentiment analysis moderation work?',
      a: 'Incoming customer reviews are evaluated instantly by our local NLP model. Testimonials are tagged as Positive, Neutral, or Negative based on text syntax. Negative submissions can be set to bypass your approved feed automatically, saving your team hours of manual filtering.'
    },
    {
      q: 'Does Proofly support custom domain mappings?',
      a: 'Yes, under our Business and Enterprise plans, you can configure CNAME DNS aliases (e.g. feedback.yourcompany.com) so that hosted collection pages map cleanly to your brand domain.'
    },
    {
      q: 'How does the webcam recording tool handle browser permissions?',
      a: 'It uses standard WebRTC hooks wrapped in RecordRTC to stream and buffer client-side feeds in real-time. No plugins or downloads are needed. Submissions upload direct video blobs to secure state files.'
    },
    {
      q: 'Can I import reviews from G2, LinkedIn, and GMB?',
      a: 'Absolutely! Our dashboard has form sync handlers for Twitter posts, LinkedIn recommendations, Google Maps listings, and comma-separated CSV spreadsheets.'
    }
  ];

  // Motion variants for stagger load
  const heroContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const heroChildVariants = {
    hidden: { opacity: 0, y: 25 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' as const }
    }
  };

  const revealOnScrollVariants = {
    hidden: { opacity: 0, y: 35 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const }
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col font-sans selection:bg-brand-emerald selection:text-white relative overflow-x-hidden">
      
      {/* Background Depth Glowing Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-emerald/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-1/4 w-[500px] h-[500px] bg-brand-teal/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-1/4 left-1/3 w-[600px] h-[600px] bg-brand-emerald/5 rounded-full blur-[160px] pointer-events-none -z-10" />

      <Navbar />

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 relative w-full">
        
        {/* Floating Avatars in Hero Background */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none -z-10">
          {[
            { id: 1, src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', left: '15%', top: '25%', size: 48, delay: 0, duration: 8 },
            { id: 2, src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', left: '80%', top: '20%', size: 40, delay: 1.5, duration: 10 },
            { id: 3, src: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', left: '12%', top: '75%', size: 52, delay: 3, duration: 9 },
            { id: 4, src: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100', left: '75%', top: '68%', size: 44, delay: 4.5, duration: 11 },
          ].map((avatar) => (
            <motion.img
              key={avatar.id}
              src={avatar.src}
              alt=""
              loading="lazy"
              width={avatar.size}
              height={avatar.size}
              fetchPriority="low"
              initial={{ scale: 0.6, opacity: 0, y: 15 }}
              animate={{
                scale: [0.8, 1, 0.8],
                opacity: [0, 0.25, 0],
                y: [15, -15, 15],
              }}
              transition={{
                duration: avatar.duration,
                repeat: Infinity,
                delay: avatar.delay,
                ease: 'easeInOut',
              }}
              className="absolute rounded-full border border-brand-emerald/20 shadow-lg shadow-brand-emerald/5 object-cover"
              style={{
                left: avatar.left,
                top: avatar.top,
                width: `${avatar.size}px`,
                height: `${avatar.size}px`,
              }}
            />
          ))}
        </div>

        {/* Floating Testimonial Review Cards (Framer Motion looping float) */}
        {/* Floating Card 1: Top Left */}
        <motion.div
          initial={{ y: -6, opacity: 0 }}
          animate={{ y: [ -6, 6, -6 ], opacity: 1 }}
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
          className="absolute top-16 left-6 lg:left-24 hidden md:block z-20"
        >
          <SpotlightCard
            className="bg-[#18181B]/80 backdrop-blur p-3.5 rounded-xl shadow-2xl flex items-center space-x-3 max-w-[240px]"
            hoverScale={1.05}
            glowColor="rgba(108, 92, 255, 0.12)"
          >
            <div className="w-8 h-8 rounded-full bg-brand-emerald/20 text-brand-emerald flex items-center justify-center font-bold text-xs shrink-0">J</div>
            <div className="text-left">
              <div className="flex text-yellow-400 mb-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
              </div>
              <p className="text-[10px] text-slate-200 leading-normal">"Support replies in minutes."</p>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Floating Card 2: Mid Right */}
        <motion.div
          initial={{ y: 6, opacity: 0 }}
          animate={{ y: [ 6, -6, 6 ], opacity: 1 }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
          className="absolute top-36 right-6 lg:right-24 hidden md:block z-20"
        >
          <SpotlightCard
            className="bg-[#18181B]/80 backdrop-blur p-3.5 rounded-xl shadow-2xl flex items-center space-x-3 max-w-[260px]"
            hoverScale={1.05}
            glowColor="rgba(134, 119, 255, 0.12)"
          >
            <div className="w-8 h-8 rounded-full bg-brand-teal/20 text-brand-teal flex items-center justify-center font-bold text-xs shrink-0">C</div>
            <div className="text-left">
              <div className="flex text-yellow-400 mb-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
              </div>
              <p className="text-[10px] text-slate-200 leading-normal">"Setup took less than 15 minutes."</p>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Floating Card 3: Bottom Left */}
        <motion.div
          initial={{ y: -4, opacity: 0 }}
          animate={{ y: [ -4, 4, -4 ], opacity: 1 }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}
          className="absolute bottom-12 left-10 lg:left-40 hidden md:block z-20"
        >
          <SpotlightCard
            className="bg-[#18181B]/80 backdrop-blur p-3.5 rounded-xl shadow-2xl flex items-center space-x-3 max-w-[240px]"
            hoverScale={1.05}
            glowColor="rgba(108, 92, 255, 0.12)"
          >
            <div className="w-8 h-8 rounded-full bg-brand-emerald/20 text-brand-emerald flex items-center justify-center font-bold text-xs shrink-0">D</div>
            <div className="text-left">
              <div className="flex text-yellow-400 mb-0.5">
                {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="w-2.5 h-2.5 fill-current" />)}
              </div>
              <p className="text-[10px] text-slate-200 leading-normal">"Best onboarding we've seen."</p>
            </div>
          </SpotlightCard>
        </motion.div>

        {/* Hero Grid layout */}
        <motion.div 
          variants={heroContainerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
        >
          {/* Hero left content */}
          <div className="lg:col-span-7 space-y-8 text-left z-10">
            <motion.div 
              variants={heroChildVariants}
              className="inline-flex items-center space-x-2 bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-xs font-semibold px-3.5 py-1.5 rounded-full"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Currently in Beta — Be one of the first companies using Proofly.</span>
            </motion.div>

            <motion.h1 
              variants={heroChildVariants}
              className="text-4xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight"
            >
              Turn customer love <span className="bg-gradient-to-r from-brand-emerald to-brand-teal bg-clip-text text-transparent">into growth.</span>
            </motion.h1>

            <motion.p 
              variants={heroChildVariants}
              className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl"
            >
              Collect testimonials, showcase social proof, and discover what customers love with AI insights.
            </motion.p>

            <motion.div 
              variants={heroChildVariants}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2"
            >
              <Link href="/signup">
                <button className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-sm py-4 px-8 rounded-lg shadow-xl shadow-brand-emerald/10 flex items-center justify-center space-x-2 cursor-pointer transition hover:scale-103 duration-200">
                  <span>Start Free Trial</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/live-demo">
                <button className="bg-[#18181B] hover:bg-[#27272A] border border-border-primary text-[#8677FF] text-sm font-bold py-4 px-8 rounded-lg flex items-center justify-center space-x-2 cursor-pointer transition hover:scale-103 duration-200">
                  <Sparkles className="w-4 h-4 text-brand-emerald" />
                  <span>Try Live Demo</span>
                </button>
              </Link>
              <button 
                onClick={() => setIsDemoOpen(true)}
                className="bg-transparent hover:underline text-slate-400 text-xs font-semibold py-4 px-4 flex items-center justify-center space-x-1 cursor-pointer transition"
              >
                <Play className="w-3 h-3 fill-slate-400" />
                <span>Watch Video</span>
              </button>
            </motion.div>

            {/* Value Points */}
            <motion.div 
              variants={heroChildVariants}
              className="space-y-3 pt-8 border-t border-border-primary/45"
            >
              {[
                "Collect testimonials.",
                "Analyze customer feedback with AI.",
                "Turn customer love into growth."
              ].map((point, index) => (
                <div key={index} className="flex items-center space-x-3 text-slate-300">
                  <div className="w-5 h-5 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald shrink-0">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm font-semibold">{point}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Hero right: Interactive Mockup Dashboard (Slide from right variant) */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
            className="lg:col-span-5 relative z-10"
          >
            {/* Glowing background highlights behind the mockups */}
            <div className="absolute -inset-4 bg-[#6C5CFF]/10 rounded-full blur-[80px] pointer-events-none -z-10" />
            <div className="absolute -inset-10 bg-brand-emerald/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            {/* Floating Glassmorphic AI Classifier Card */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -top-10 -left-10 bg-[#12161D]/90 backdrop-blur-md border border-brand-emerald/30 p-4 rounded-xl shadow-2xl text-left z-20 w-56 flex flex-col gap-2 select-none"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-brand-emerald/20 text-brand-emerald flex items-center justify-center font-bold text-xs shrink-0">
                  SJ
                </div>
                <div className="text-left">
                  <h4 className="text-[10px] font-black text-white">Sarah Jenkins</h4>
                  <span className="text-[8px] text-slate-400">DevFlow Inc.</span>
                </div>
              </div>
              <div className="h-px bg-border-primary/50" />
              <p className="text-[9px] text-slate-200 leading-normal italic">"... Setup took less than 15 minutes! REST APIs integrated in under 30 minutes! ..."</p>
              <div className="flex items-center justify-between text-[8px] pt-1">
                <span className="bg-brand-emerald/10 text-brand-emerald px-1.5 py-0.5 rounded font-black tracking-wider border border-brand-emerald/20 uppercase">
                  AI: Positive
                </span>
                <span className="text-slate-400">99.4% confidence</span>
              </div>
            </motion.div>

            {/* Floating Glassmorphic Transcription Waveform Card */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 1.5 }}
              className="absolute -bottom-10 -right-10 bg-[#12161D]/90 backdrop-blur-md border border-[#8677FF]/30 p-4 rounded-xl shadow-2xl text-left z-20 w-60 flex flex-col gap-2.5 select-none"
            >
              <div className="flex items-center justify-between text-[9px]">
                <span className="font-extrabold text-white flex items-center space-x-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8677FF] animate-pulse" />
                  <span>AI Video Intelligence</span>
                </span>
                <span className="text-zinc-500 font-mono text-[7px]">transcribing...</span>
              </div>
              <div className="h-6 flex items-end gap-1 px-1 bg-[#09090B] border border-border-primary/60 rounded-lg justify-center overflow-hidden py-1">
                {[2, 4, 3, 5, 2, 4, 6, 3, 2, 4, 3, 5, 2, 4].map((h, i) => (
                  <motion.div 
                    key={i}
                    animate={{ height: [`${h*12}%`, `${h*12 + 40}%`, `${h*12}%`] }}
                    transition={{ repeat: Infinity, duration: 1.2 + (i % 3) * 0.2, ease: "easeInOut" }}
                    className="w-1 bg-gradient-to-t from-brand-emerald to-[#8677FF] rounded-full shrink-0"
                    style={{ height: `${h*12}%` }}
                  />
                ))}
              </div>
              <p className="text-[8px] text-slate-300 italic line-clamp-1">
                " SETUP TOOK LESS THAN 15 MINUTES. WE INTEGRATED THE REST APIS... "
              </p>
            </motion.div>
            
            {/* Product demo subtitle indicator */}
            <div className="text-center sm:text-right text-[10px] font-black uppercase tracking-widest text-[#8677FF] mb-2 animate-pulse flex items-center justify-center sm:justify-end space-x-1.5 select-none">
              <span>Explore the product in 15 seconds</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#8677FF] animate-ping" />
            </div>

            <SpotlightCard className="p-6 rounded-2xl shadow-2xl flex flex-col gap-6 relative min-h-[460px]" glowColor="rgba(108, 92, 255, 0.1)">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-emerald/5 rounded-full blur-xl pointer-events-none" />
              
              {/* Window Header: Window Controls & Interactive Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-primary/50 pb-4">
                {/* Window Dots */}
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                
                {/* Product Navigation Tabs - Premium Rounded Pills with smooth sliding underline */}
                <div className="bg-[#09090B] border border-border-primary/80 p-1.5 rounded-full flex items-center space-x-1 shadow-inner relative z-10">
                  {[
                    { id: 'recorder', label: '🎥 Collect' },
                    { id: 'dashboard', label: '📊 Manage' },
                    { id: 'widget', label: '💖 Showcase' }
                  ].map((tab) => (
                    <motion.button
                      key={tab.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleHeroTabChange(tab.id as any)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          handleHeroTabChange(tab.id as any);
                        }
                      }}
                      className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors duration-300 cursor-pointer select-none relative focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-emerald/50 ${
                        heroTab === tab.id
                          ? 'text-white'
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                      aria-label={`Show ${tab.label}`}
                    >
                      {heroTab === tab.id && (
                        <motion.span
                          layoutId="heroTabActive"
                          className="absolute inset-0 bg-gradient-to-r from-brand-emerald to-brand-teal rounded-full -z-10 shadow-[0_0_15px_rgba(16,185,129,0.45)]"
                          transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        />
                      )}
                      <span>{tab.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <div className="relative flex-1 flex flex-col justify-center min-h-[350px]">
                <AnimatePresence mode="wait">
                  
                  {/* TAB 1: Collect (🎥 Collect) */}
                  {heroTab === 'recorder' && (
                    <motion.div 
                      key="recorder"
                      initial={{ opacity: 0, y: 10, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.99 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="space-y-4 text-left relative"
                    >
                      {/* Animated Cursor Pointer simulating interaction */}
                      <motion.div 
                        initial={{ x: 260, y: 220, opacity: 0 }}
                        animate={{ 
                          x: [260, 110, 110, 110], 
                          y: [220, 240, 240, 280], 
                          opacity: [0, 1, 1, 0],
                          scale: [1, 1, 0.9, 1]
                        }}
                        transition={{ 
                          duration: 4.5, 
                          repeat: Infinity, 
                          repeatType: "loop", 
                          times: [0, 0.4, 0.5, 0.6],
                          ease: "easeInOut" 
                        }}
                        className="absolute z-40 pointer-events-none text-white text-xs drop-shadow-md"
                      >
                        <svg className="w-5 h-5 fill-white stroke-black stroke-1" viewBox="0 0 24 24">
                          <path d="M4.5 3V17L9.5 12H16.5L4.5 3Z" />
                        </svg>
                      </motion.div>

                      {/* Browser Frame Mockup */}
                      <div className="bg-[#09090B] border border-border-primary rounded-xl overflow-hidden flex flex-col justify-between p-4 relative min-h-[300px]">
                        
                        {/* Top Form Header with Space Brand */}
                        <div className="flex items-center justify-between border-b border-border-primary/50 pb-2">
                          <span className="text-[10px] font-black text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-0.5 rounded uppercase tracking-wider">
                            Acme Space ➔ Review Submission
                          </span>
                          <span className="text-[8px] font-mono text-zinc-500">Video Recorder Active</span>
                        </div>

                        {/* Split Form & Video preview */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2 flex-1 items-center">
                          {/* Webcam Recorder Box */}
                          <div className="bg-[#0c0d12] border border-zinc-900 rounded-lg aspect-square sm:aspect-auto sm:h-[135px] flex flex-col justify-between p-2 relative overflow-hidden">
                            {/* REC pulse indicator */}
                            <div className="flex items-center justify-between z-10">
                              <div className="bg-black/60 border border-zinc-800/80 px-2 py-0.5 rounded text-[7px] font-mono text-red-500 flex items-center space-x-1 font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                                <span>REC: 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds}</span>
                              </div>

                              {/* Audio Waveform */}
                              <div className="flex items-end gap-0.5 h-2.5 overflow-hidden">
                                {[2, 4, 3, 5, 2, 4, 3].map((h, i) => (
                                  <motion.div
                                    key={i}
                                    animate={{ height: [`${h*15}%`, `${h*15 + 40}%`, `${h*15}%`] }}
                                    transition={{ repeat: Infinity, duration: 0.8 + (i % 2) * 0.2, ease: "easeInOut" }}
                                    className="w-0.5 bg-brand-emerald rounded-full"
                                    style={{ height: `${h*15}%` }}
                                  />
                                ))}
                              </div>
                            </div>

                            {/* Center camera silhouette */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-75">
                              <Video className="w-8 h-8 text-zinc-700 animate-pulse" />
                            </div>

                            {/* Custom Guiding Prompt Banner overlay */}
                            <div className="bg-gradient-to-r from-brand-emerald/15 to-brand-teal/15 border border-brand-emerald/20 px-2 py-1 rounded text-[8px] text-left text-slate-300 z-10 leading-snug">
                              ❓ <strong>Q1:</strong> What do you love about Acme?
                            </div>
                          </div>

                          {/* Customer name / email Form */}
                          <div className="space-y-2 text-left">
                            <div className="space-y-0.5">
                              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Customer Name</span>
                              <div className="w-full bg-[#18181B] border border-border-primary px-2.5 py-1.5 rounded text-[10px] text-white font-mono">
                                Sarah Jenkins
                              </div>
                            </div>
                            <div className="space-y-0.5">
                              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-wider block">Email Address</span>
                              <div className="w-full bg-[#18181B] border border-border-primary px-2.5 py-1.5 rounded text-[10px] text-white font-mono truncate">
                                sarah@devflow.io
                              </div>
                            </div>
                            {/* Question Progress bar */}
                            <div className="space-y-1 pt-1">
                              <div className="flex justify-between text-[7px] text-zinc-500 font-bold uppercase">
                                <span>Progress</span>
                                <span>Question 1 of 3</span>
                              </div>
                              <div className="w-full h-1 bg-zinc-900 rounded-full overflow-hidden">
                                <div className="w-1/3 h-full bg-brand-emerald" />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons footer */}
                        <div className="flex items-center justify-between border-t border-border-primary/50 pt-2">
                          <span className="text-[8px] text-zinc-500 font-semibold">Webcam review collection preview</span>
                          
                          {/* Record button */}
                          <div className="flex items-center space-x-2 bg-[#18181B] border border-border-primary px-3 py-1 rounded-full text-[9px] font-bold text-slate-300">
                            <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-ping" />
                            <span>Stop Video</span>
                          </div>
                        </div>

                      </div>

                      <p className="text-[10px] text-muted-foreground italic text-center font-semibold">
                        Collect video or text testimonials in under 60 seconds.
                      </p>
                    </motion.div>
                  )}

                  {/* TAB 2: Manage (📊 Manage) */}
                  {heroTab === 'dashboard' && (
                    <motion.div 
                      key="dashboard"
                      initial={{ opacity: 0, y: 10, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.99 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="space-y-4 text-left"
                    >
                      {/* Dashboard header statistics count-up */}
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-[#09090B] border border-border-primary p-2.5 rounded-xl space-y-0.5 text-center">
                          <span className="text-[7px] text-muted-foreground uppercase font-black tracking-wider block">Sentiment</span>
                          <span className="text-xs font-black text-white bg-gradient-to-r from-brand-emerald to-brand-teal bg-clip-text text-transparent block">
                            {sentimentScore}%
                          </span>
                        </div>
                        <div className="bg-[#09090B] border border-border-primary p-2.5 rounded-xl space-y-0.5 text-center">
                          <span className="text-[7px] text-muted-foreground uppercase font-black tracking-wider block">Reviews</span>
                          <span className="text-xs font-black text-white block">{reviewsCount}</span>
                        </div>
                        <div className="bg-[#09090B] border border-border-primary p-2.5 rounded-xl space-y-0.5 text-center">
                          <span className="text-[7px] text-muted-foreground uppercase font-black tracking-wider block">Total Inbox</span>
                          <span className="text-xs font-black text-white block">{inboxCount}</span>
                        </div>
                        <div className="bg-[#09090B] border border-border-primary p-2.5 rounded-xl space-y-0.5 text-center">
                          <span className="text-[7px] text-muted-foreground uppercase font-black tracking-wider block">Response</span>
                          <span className="text-xs font-black text-white block">98%</span>
                        </div>
                      </div>

                      {/* Mock workspace view */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-stretch min-h-[175px]">
                        
                        {/* Left column: Inbox feed list & Search bar */}
                        <div className="bg-[#09090B] border border-border-primary rounded-xl p-3 space-y-2 flex flex-col sm:col-span-1">
                          {/* Search bar with typing effect */}
                          <div className="bg-zinc-950 border border-border-primary px-2.5 py-1 rounded text-[9px] text-slate-300 font-mono flex items-center justify-between">
                            <span className="truncate">{searchText || "search reviews..."}</span>
                            <Search className="w-2.5 h-2.5 text-zinc-500" />
                          </div>
                          
                          {/* Small list items */}
                          <div className="space-y-1.5 flex-1 overflow-y-auto">
                            <div className="bg-brand-emerald/5 border border-brand-emerald/30 p-1.5 rounded text-[8px] flex items-center justify-between">
                              <span className="font-bold text-white truncate">Sarah Jenkins</span>
                              <span className="text-[6px] text-brand-emerald font-black uppercase bg-brand-emerald/10 border border-brand-emerald/20 px-1 py-0.2 rounded">Positive</span>
                            </div>
                            <div className="bg-zinc-950 border border-border-primary/50 p-1.5 rounded text-[8px] flex items-center justify-between opacity-60">
                              <span className="font-bold text-slate-400 truncate">James Cole</span>
                              <span className="text-[6px] text-brand-teal font-black uppercase bg-brand-teal/10 border border-brand-teal/20 px-1 py-0.2 rounded">Video</span>
                            </div>
                          </div>
                        </div>

                        {/* Center column: AI Summary panel & tags */}
                        <div className="bg-[#09090B] border border-border-primary rounded-xl p-3 space-y-2 flex flex-col justify-between sm:col-span-1 text-left">
                          <div className="space-y-1">
                            <span className="text-[8px] font-black text-[#8677FF] uppercase tracking-wider block">AI Analysis Summary</span>
                            <div className="bg-zinc-950 border border-border-primary/60 p-2 rounded text-[8px] font-mono text-slate-300 min-h-[65px] leading-relaxed">
                              {typedText}
                              <span className="w-1 h-2.5 bg-brand-teal inline-block ml-0.5 animate-pulse" />
                            </div>
                          </div>

                          {/* Keyword Cloud tags */}
                          <div className="flex flex-wrap gap-1">
                            <span className="text-[7px] bg-zinc-950 border border-border-primary/80 px-1.5 py-0.5 rounded text-slate-400">#onboarding</span>
                            <span className="text-[7px] bg-zinc-950 border border-border-primary/80 px-1.5 py-0.5 rounded text-slate-400">#rest-api</span>
                          </div>
                        </div>

                        {/* Right column: SVG Line chart */}
                        <div className="bg-[#09090B] border border-border-primary rounded-xl p-3 space-y-1 text-left relative overflow-hidden flex flex-col justify-between sm:col-span-1">
                          <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider block">Conversion Lift</span>
                          
                          {/* SVG line chart */}
                          <div className="flex-1 w-full h-10 relative pt-2">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 40">
                              <motion.path 
                                d="M0,35 Q15,30 30,20 T60,15 T90,5" 
                                fill="none" 
                                stroke="url(#chartGrad)" 
                                strokeWidth="2.5"
                                strokeLinecap="round"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                              />
                              <defs>
                                <linearGradient id="chartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#10B981" />
                                  <stop offset="100%" stopColor="#8677FF" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                          <div className="flex justify-between text-[6px] text-zinc-500 font-mono">
                            <span>Week 1</span>
                            <span>Week 2</span>
                            <span>Week 3</span>
                          </div>
                        </div>

                      </div>

                      <p className="text-[10px] text-muted-foreground italic text-center font-semibold">
                        Organize every testimonial and uncover customer insights powered by AI.
                      </p>
                    </motion.div>
                  )}

                  {/* TAB 3: Showcase (💖 Showcase) */}
                  {heroTab === 'widget' && (
                    <motion.div 
                      key="widget"
                      initial={{ opacity: 0, y: 10, scale: 0.99 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.99 }}
                      transition={{ duration: 0.28, ease: "easeOut" }}
                      className="space-y-4 text-left relative"
                    >
                      {/* Rising hearts overlay */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-20">
                        {[...Array(6)].map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ y: 220, opacity: 0, scale: 0.6 }}
                            animate={{ 
                              y: [220, 20], 
                              opacity: [0, 0.8, 0], 
                              x: [Math.sin(i) * 20, Math.sin(i + 2) * 30] 
                            }}
                            transition={{ 
                              repeat: Infinity, 
                              duration: 3 + (i % 2) * 1.5, 
                              delay: i * 0.7, 
                              ease: "easeOut" 
                            }}
                            className="absolute text-brand-teal text-xs"
                            style={{ left: `${15 + i * 15}%`, bottom: '0px' }}
                          >
                            ❤️
                          </motion.div>
                        ))}
                      </div>

                      {/* Mockup frame content with loading shimmer simulation */}
                      <div className="bg-[#09090B] border border-border-primary rounded-xl p-4 min-h-[225px] flex flex-col justify-between relative overflow-hidden">
                        
                        {/* Company branding header */}
                        <div className="flex items-center justify-between border-b border-border-primary/50 pb-2 mb-2">
                          <span className="text-[9px] font-black text-white uppercase tracking-wider">
                            🚀 Acme SaaS ➔ Testimonial Widget
                          </span>
                          <span className="text-[7px] text-zinc-500 font-mono">Embedded Wall of Love</span>
                        </div>

                        <AnimatePresence mode="wait">
                          {widgetLoading ? (
                            /* SKELETON LOADER SCREEN */
                            <motion.div 
                              key="skeleton"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow items-center"
                            >
                              <div className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-xl space-y-3 animate-pulse h-[125px] flex flex-col justify-between">
                                <div className="space-y-2">
                                  <div className="w-16 h-2 bg-zinc-800 rounded" />
                                  <div className="w-full h-3 bg-zinc-800 rounded" />
                                  <div className="w-2/3 h-3 bg-zinc-800 rounded" />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 rounded-full bg-zinc-800" />
                                  <div className="w-12 h-2 bg-zinc-800 rounded" />
                                </div>
                              </div>
                              <div className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-xl space-y-3 animate-pulse h-[125px] flex flex-col justify-between">
                                <div className="space-y-2">
                                  <div className="w-16 h-2 bg-zinc-800 rounded" />
                                  <div className="w-full h-3 bg-zinc-800 rounded" />
                                  <div className="w-2/3 h-3 bg-zinc-800 rounded" />
                                </div>
                                <div className="flex items-center space-x-2">
                                  <div className="w-6 h-6 rounded-full bg-zinc-800" />
                                  <div className="w-12 h-2 bg-zinc-800 rounded" />
                                </div>
                              </div>
                            </motion.div>
                          ) : (
                            /* REAL WIDGET SCREEN WITH FLOATING AND HOVER INTERACTIONS */
                            <motion.div 
                              key="real-cards"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-grow items-center"
                            >
                              {/* Card 1: Float up-and-down animation */}
                              <motion.div 
                                animate={{ y: [0, -6, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl space-y-2.5 flex flex-col justify-between text-left shadow-lg hover:border-brand-emerald/45 transition duration-300 group cursor-pointer h-[135px]"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex space-x-0.5 text-amber-400 text-[8px]">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className="w-2 h-2 fill-current" />
                                      ))}
                                    </div>
                                    <span className="bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 text-[6px] font-black uppercase px-1 py-0.2 rounded">
                                      Positive
                                    </span>
                                  </div>
                                  <p className="text-[10px] leading-relaxed text-slate-300 italic group-hover:text-white transition line-clamp-3">
                                    "Setup took under 15 minutes. Our onboarding speed doubled instantly!"
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 pt-1.5 border-t border-zinc-900/60">
                                  <img 
                                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" 
                                    alt="Sarah Jenkins"
                                    className="w-5 h-5 rounded-full object-cover border border-zinc-800"
                                  />
                                  <div className="text-left leading-none">
                                    <span className="text-[9px] font-bold text-white block">Sarah Jenkins</span>
                                    <span className="text-[7px] text-zinc-500 block mt-0.5">SaaS Founder</span>
                                  </div>
                                </div>
                              </motion.div>

                              {/* Card 2: Offset float animation */}
                              <motion.div 
                                animate={{ y: [0, 6, 0] }}
                                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
                                className="bg-zinc-950 border border-zinc-900 p-3.5 rounded-xl space-y-2.5 flex flex-col justify-between text-left shadow-lg hover:border-brand-teal/45 transition duration-300 group cursor-pointer h-[135px]"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <div className="flex space-x-0.5 text-amber-400 text-[8px]">
                                      {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className="w-2 h-2 fill-current" />
                                      ))}
                                    </div>
                                    <span className="bg-brand-teal/10 text-brand-teal border border-brand-teal/20 text-[6px] font-black uppercase px-1 py-0.2 rounded">
                                      Video
                                    </span>
                                  </div>
                                  <p className="text-[10px] leading-relaxed text-slate-300 italic group-hover:text-white transition line-clamp-3">
                                    "We increased conversion rates by 18% for our clients in week 1."
                                  </p>
                                </div>
                                <div className="flex items-center space-x-2 pt-1.5 border-t border-zinc-900/60">
                                  <img 
                                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" 
                                    alt="James Cole"
                                    className="w-5 h-5 rounded-full object-cover border border-zinc-800"
                                  />
                                  <div className="text-left leading-none">
                                    <span className="text-[9px] font-bold text-white block">James Cole</span>
                                    <span className="text-[7px] text-zinc-500 block mt-0.5">Agency Owner</span>
                                  </div>
                                </div>
                              </motion.div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                      </div>

                      <p className="text-[10px] text-muted-foreground italic text-center font-semibold">
                        Turn customer proof into trust that drives more conversions.
                      </p>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>

            </SpotlightCard>
          </motion.div>
        </motion.div>
      </section>

      <section className="bg-[#111827]/40 border-y border-border-primary py-8 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#09090B] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#09090B] to-transparent z-10 pointer-events-none" />

        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-emerald text-center mb-5">Built for</p>
        
        {/* Infinite scrolling marquee wrapper */}
        <div className="w-full flex overflow-hidden">
          <div className="animate-marquee flex items-center space-x-12 px-6">
            {['SaaS Teams', 'Agencies', 'Startups', 'Creators', 'Consultants', 'SaaS Teams', 'Agencies', 'Startups', 'Creators', 'Consultants'].map((logo, idx) => (
              <div 
                key={idx} 
                className="bg-[#18181B] border border-border-primary px-6 py-3.5 rounded-full text-xs font-black text-slate-300 tracking-wider shadow-lg hover:border-brand-emerald/30 hover:text-white transition duration-200 cursor-pointer select-none flex items-center space-x-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-brand-teal/40" />
                <span>{logo}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealOnScrollVariants}
        id="features" 
        className="max-w-7xl mx-auto px-6 py-24 text-center space-y-16"
      >
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Amplify Social Proof with <span className="bg-gradient-to-r from-brand-emerald to-brand-teal bg-clip-text text-transparent">AI Intelligence</span>
          </h2>
          <p className="text-slate-400 max-w-lg mx-auto text-sm">
            Everything you need to collect customer reviews, auto-generate transcripts, and embed beautiful feedback widgets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <Video className="w-5 h-5 text-brand-emerald" />,
              title: 'Video Testimonials',
              desc: 'Allow users to record high-fidelity video reviews right inside their browsers using their webcam. No downloads required.'
            },
            {
              icon: <MessageSquare className="w-5 h-5 text-brand-teal" />,
              title: 'Text Testimonials',
              desc: 'Circular avatar uploads, star ratings selector, and reviewer company roles. A fully responsive multi-step collector form.'
            },
            {
              icon: <Search className="w-5 h-5 text-brand-emerald" />,
              title: 'AI Search Engine',
              desc: 'Filter customer database reviews instantly using natural language vector queries. Find reviews about specific topics.'
            },
            {
              icon: <Cpu className="w-5 h-5 text-brand-teal animate-pulse" />,
              title: 'AI Testimonial Amplifier',
              desc: 'Proofly automatically analyzes reviews, extracts the most persuasive hooks, drafts ready-to-share social posts, and recommends high-conversion placements.'
            },
            {
              icon: <Terminal className="w-5 h-5 text-brand-emerald" />,
              title: 'AI Video Processing',
              desc: 'Mux video streams auto-generate transcripts, closed captions, highlights checklists, and key quote sections.'
            },
            {
              icon: <Layers className="w-5 h-5 text-brand-teal" />,
              title: 'Embeddable Widgets',
              desc: 'Copy-paste simple HTML scripts. Embed Wall of Love masonry grids, sliding carousels, or floating popover badges.'
            }
          ].map((feat, idx) => (
            <SpotlightCard key={idx} className="p-8 text-left space-y-4 shadow-lg hover:shadow-xl hover:scale-[1.02] duration-200">
              <div className="w-10 h-10 rounded-lg bg-[#09090B] border border-border-primary flex items-center justify-center">
                {feat.icon}
              </div>
              <h3 className="text-white text-base font-extrabold">{feat.title}</h3>
              <p className="text-slate-400 text-xs leading-relaxed">{feat.desc}</p>
            </SpotlightCard>
          ))}
        </div>
      </motion.section>



      {/* TRY OUR SAMPLE EMBED CODE SECTION */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealOnScrollVariants}
        className="max-w-7xl mx-auto px-6 py-12 relative w-full"
      >
        <SampleEmbedPlayground />
      </motion.section>

      {/* AI INSIGHTS ENGINE DEMO SECTION */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealOnScrollVariants}
        className="max-w-7xl mx-auto px-6 py-24 border-t border-border-primary relative"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[200px] bg-brand-emerald/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Text panel left */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div className="inline-flex items-center space-x-2 bg-brand-teal/10 border border-brand-teal/20 text-[#2DD4BF] text-xs font-semibold px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Deep Performance Intelligence</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
              Testimonials Analytics <br />& AI Insights
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Proofly automatically analyzes incoming customer reviews. Understand what your users love, highlight positive sentiments, and tag key feature keywords instantly.
            </p>
            <ul className="space-y-3 text-xs text-slate-300">
              {['Auto-generate highlights summaries', 'Extract direct pull-out quotes', 'Identify positive/negative features categories'].map((pt, i) => (
                <li key={i} className="flex items-center space-x-2 font-semibold">
                  <Check className="w-4 h-4 text-brand-emerald shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Interactive AI Showcase right */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
            
            {/* Box 1: Sentiment */}
            <SpotlightCard className="p-6 space-y-4 text-left" glowColor="rgba(108, 92, 255, 0.08)">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Smile className="w-4 h-4 text-brand-emerald" />
                <span>Customer Sentiment Trends</span>
              </h4>
              <div className="h-4 bg-[#09090B] rounded-full overflow-hidden flex border border-border-primary/50">
                <div className="h-full bg-brand-emerald flex items-center justify-center text-[8px] font-black text-white" style={{ width: '84%' }}>84% Positive</div>
                <div className="h-full bg-brand-teal flex items-center justify-center text-[8px] font-black text-white" style={{ width: '12%' }}>12%</div>
                <div className="h-full bg-red-500 flex items-center justify-center text-[8px] font-black text-white" style={{ width: '4%' }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                <span>🟢 84% Positive</span>
                <span>🔵 12% Neutral</span>
                <span>🔴 4% Negative</span>
              </div>
            </SpotlightCard>

            {/* Box 2: Keyword clouds */}
            <SpotlightCard className="p-6 space-y-3 text-left flex flex-col justify-between" glowColor="rgba(134, 119, 255, 0.08)">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Tag className="w-4 h-4 text-brand-teal" />
                <span>Extracted Keywords</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {['#RESTAPI', '#onboarding', '#performance', '#support', '#15-minutes', '#pricing'].map((kw, i) => (
                  <span key={kw} className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                    i % 2 === 0 ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' : 'bg-brand-teal/10 text-brand-teal border-brand-teal/20'
                  }`}>
                    {kw}
                  </span>
                ))}
              </div>
            </SpotlightCard>

            {/* Box 3: Praise and complaints */}
            <SpotlightCard className="p-6 space-y-3 text-left sm:col-span-2" glowColor="rgba(108, 92, 255, 0.08)">
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Activity className="w-4 h-4 text-brand-emerald" />
                <span>AI Detected Praise & Issues</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5 border-r border-border-primary/50 pr-4">
                  <span className="text-[10px] font-bold text-brand-emerald block">🔥 Common Praise Points</span>
                  <p className="text-[10px] text-slate-400 italic">"Developer documentation APIs are state-of-the-art and easy to integrate."</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-red-400 block">⚠️ Common Issues Logs</span>
                  <p className="text-[10px] text-slate-400 italic">"Webcam stream initialization takes a few seconds on older devices."</p>
                </div>
              </div>
            </SpotlightCard>

          </div>

        </div>
      </motion.section>

      {/* WALL OF LOVE DEMO */}
      <section id="showcase" className="bg-[#09090B] border-y border-border-primary py-24 text-center relative overflow-hidden">
        
        {/* Layered Living Backgrounds (Emerald & Teal Blobs with random float) */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ margin: "-120px" }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 pointer-events-none -z-10"
        >
          <motion.div 
            animate={{ 
              x: [0, 60, -40, 0],
              y: [0, -40, 50, 0],
              scale: [1, 1.05, 0.95, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 22, 
              ease: "linear" 
            }}
            className="absolute top-12 left-1/4 w-[400px] h-[400px] rounded-full bg-brand-emerald/[0.10] blur-[120px] pointer-events-none"
          />
          <motion.div 
            animate={{ 
              x: [0, -50, 40, 0],
              y: [0, 60, -40, 0],
              scale: [1, 0.95, 1.05, 1]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 28, 
              ease: "linear" 
            }}
            className="absolute bottom-12 right-1/4 w-[400px] h-[400px] rounded-full bg-brand-teal/[0.08] blur-[120px] pointer-events-none"
          />

          {/* Floating background particles */}
          {Array.from({ length: 6 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ y: 550, x: 200 + i * 150, opacity: 0 }}
              animate={{ 
                y: [-50, -650], 
                opacity: [0, 0.05, 0.05, 0],
                x: [200 + i * 150, 200 + i * 150 + (i % 2 === 0 ? 30 : -30)]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 12 + i * 2, 
                delay: i * 2.5, 
                ease: "linear" 
              }}
              className="absolute w-1 h-1 rounded-full bg-brand-teal/30 pointer-events-none"
            />
          ))}
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 space-y-12">
          
          {/* Section Entry Candy Heart Icon */}
          <div className="space-y-4">
            <CandyHeart3D />

            {/* Word by word staggered Heading */}
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Wall
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.45 }}
              >
                of
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: [0, 1.15, 1], scale: [0.8, 1.12, 1] }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.75, ease: "easeOut" }}
                className="bg-gradient-to-r from-brand-emerald to-brand-teal bg-clip-text text-transparent flex items-center"
              >
                Love
                <motion.span
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 1.35, type: "spring", stiffness: 260, damping: 10 }}
                  className="ml-2 inline-block text-xl filter drop-shadow-[0_0_8px_rgba(108,92,255,0.7)] animate-pulse"
                >
                  ❤️
                </motion.span>
              </motion.span>
            </h2>

            {/* Sandbox alert/badge */}
            <div className="pt-2">
              <div className="text-[10px] font-extrabold text-[#2DD4BF] uppercase tracking-widest bg-brand-teal/10 border border-brand-teal/30 px-5 py-2.5 rounded-full inline-block shadow-lg">
                ✨ Interactive Sandbox Showcase — Preview the Proofly Wall of Love widget live
              </div>
            </div>
          </div>

          {/* Liquid Transition Tab controls */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 select-none">
            {/* Format Filter Tabs */}
            <div className="flex items-center justify-center space-x-1.5 p-1.5 bg-[#18181B] border border-border-primary rounded-xl shrink-0 relative shadow-inner w-full md:w-auto">
              {([
                { id: 'all', label: '✨ All Reviews' },
                { id: 'video', label: '🎥 Video reviews' },
                { id: 'text', label: '✍️ Text reviews' }
              ] as const).map(tab => (
                <motion.button
                  key={tab.id}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setFilterFormat(tab.id)}
                  className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg cursor-pointer relative z-10 transition duration-300 ${
                    filterFormat === tab.id ? 'text-white' : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  {filterFormat === tab.id && (
                    <motion.div
                      layoutId="format-pill"
                      transition={{ 
                        type: "spring", 
                        stiffness: 280, 
                        damping: 17, 
                        mass: 0.85 
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-[#6C5CFF] to-[#8677FF] rounded-lg -z-10 shadow-[0_0_18px_rgba(108,92,255,0.35)] border border-white/10"
                    />
                  )}
                  {tab.label}
                </motion.button>
              ))}
            </div>

            {/* Layout Mode Tabs */}
            <div className="flex items-center justify-center space-x-1.5 p-1.5 bg-[#18181B] border border-border-primary rounded-xl shrink-0 relative shadow-inner w-full md:w-auto">
              {(['masonry', 'grid', 'carousel'] as const).map(mode => (
                <motion.button
                  key={mode}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => setLayoutMode(mode)}
                  className={`px-4 py-2 text-[10px] font-black uppercase rounded-lg cursor-pointer relative z-10 transition duration-300 ${
                    layoutMode === mode ? 'text-white' : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  {layoutMode === mode && (
                    <motion.div
                      layoutId="liquid-pill"
                      transition={{ 
                        type: "spring", 
                        stiffness: 280, 
                        damping: 17, 
                        mass: 0.85 
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-brand-emerald to-brand-teal rounded-lg -z-10 shadow-[0_0_18px_rgba(108,92,255,0.35)] border border-white/10"
                    />
                  )}
                  {mode}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Wall display grid */}
          <div className="pt-6 text-left relative z-25">
            <WallOfLoveShowcase testimonials={filteredTestimonials} layout={layoutMode} />
          </div>

          {/* Real Feedback Call to Action */}
          <div className="pt-12 text-center relative z-25">
            <div className="inline-block bg-[#18181B] border border-border-primary p-6 rounded-2xl max-w-xl mx-auto shadow-2xl space-y-4">
              <h4 className="text-sm font-bold text-white">Using Proofly? We'd love to hear your thoughts!</h4>
              <p className="text-xs text-slate-400">
                Be one of the first companies using Proofly. Help us build a better platform by sharing your feedback in under 10 seconds.
              </p>
              <Link href="/collect/acme-saas" className="inline-block">
                <button className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2.5 px-6 rounded-lg shadow-md shadow-brand-emerald/10 cursor-pointer transition">
                  Leave Us a Review 🎥
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>



      {/* PRICING SECTION */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealOnScrollVariants}
        id="pricing" 
        className="max-w-7xl mx-auto px-6 py-24 text-center space-y-16"
      >
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Pricing Plans for SaaS Teams</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Choose a plan that fits your feedback pipeline. Cancel or upgrade anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch max-w-3xl mx-auto">
          {pricingTiers.map((tier, idx) => {
            const isCurrent = user?.tier === tier.id;
            return (
              <SpotlightCard 
                key={idx}
                className={`p-6 text-left flex flex-col justify-between space-y-6 relative border transition duration-300 ${
                  tier.accent 
                    ? 'border-brand-emerald ring-1 ring-brand-emerald/40 shadow-xl shadow-brand-emerald/5 scale-105 z-10' 
                    : 'border-border-primary'
                }`}
                glowColor={tier.accent ? 'rgba(108, 92, 255, 0.15)' : 'rgba(134, 119, 255, 0.08)'}
              >
                {tier.accent && (
                  <span className="absolute top-0 right-0 bg-brand-emerald text-white text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-bl-lg rounded-tr-lg">
                    Popular
                  </span>
                )}

                <div>
                  <h3 className="text-white text-base font-bold mb-1">{tier.name}</h3>
                  <div className="flex items-baseline text-white">
                    <span className="text-4xl font-extrabold tracking-tight">{tier.price}</span>
                    <span className="text-slate-500 text-xs ml-1">/month</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">{tier.desc}</p>
                  <div className="h-px bg-border-primary my-6" />
                  <ul className="space-y-3.5 text-xs text-slate-300">
                    {tier.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start">
                        <Check className="w-4 h-4 text-brand-emerald mr-2 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {user ? (
                  <button 
                    onClick={() => setSelectedPlan({ id: tier.id, name: tier.name, price: tier.price })}
                    className={`w-full py-3 rounded-lg text-xs font-black uppercase tracking-widest cursor-pointer transition hover:scale-103 duration-200 ${
                      isCurrent
                        ? 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/40 cursor-default pointer-events-none'
                        : tier.accent 
                        ? 'bg-gradient-to-r from-brand-emerald to-brand-teal text-white shadow-lg shadow-brand-emerald/10' 
                        : 'bg-zinc-850 hover:bg-zinc-800 text-slate-200 border border-border-primary'
                    }`}
                  >
                    {isCurrent ? 'Current Plan' : 'Upgrade Plan'}
                  </button>
                ) : (
                  <Link href="/signup" className="w-full pt-4">
                    <button 
                      className={`w-full py-3 rounded-lg text-xs font-black uppercase tracking-widest cursor-pointer transition hover:scale-103 duration-200 ${
                        tier.accent 
                          ? 'bg-gradient-to-r from-brand-emerald to-brand-teal text-white shadow-lg shadow-brand-emerald/10' 
                          : 'bg-zinc-850 hover:bg-zinc-800 text-slate-200 border border-border-primary'
                      }`}
                    >
                      {tier.cta}
                    </button>
                  </Link>
                )}
              </SpotlightCard>
            );
          })}
        </div>
      </motion.section>

      {/* HOW PROOFLY WORKS TIMELINE */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealOnScrollVariants}
        className="max-w-6xl mx-auto px-6 py-24 text-center space-y-16 border-t border-border-primary/50"
      >
        <div className="space-y-4">
          <div className="bg-[#6C5CFF]/15 text-[#8677FF] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border border-[#6C5CFF]/25">
            ⚡ simple 3-step workflow
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            How Proofly Works
          </h2>
          <p className="text-slate-400 text-sm max-w-lg mx-auto">
            Collect testimonials automatically, transcribe them with high-fidelity sentiment analysis, and embed them anywhere in seconds.
          </p>
        </div>

        {/* 3-Step Timeline Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative">
          
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-brand-emerald/40 via-brand-teal/40 to-brand-emerald/40 -translate-y-1/2 z-0" />

          {/* Step 1 */}
          <SpotlightCard className="p-8 space-y-6 flex flex-col justify-between items-center text-center relative z-10" glowColor="rgba(108, 92, 255, 0.08)">
            <div className="w-16 h-16 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald shadow-lg">
              <span className="text-xl font-black">01</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">1. Collect Feedback</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate highly interactive review submission links and shareable QR codes. Gather video testimonials and text reviews effortlessly.
              </p>
            </div>
            <div className="bg-[#09090B] border border-border-primary p-3.5 rounded-lg w-full text-left space-y-2 font-mono text-[9px] text-slate-500">
              <span className="text-brand-teal font-extrabold uppercase block">QR Code & Form Link</span>
              <span className="block truncate">useproofly.vercel.app/collect/acme-saas</span>
            </div>
          </SpotlightCard>

          {/* Step 2 */}
          <SpotlightCard className="p-8 space-y-6 flex flex-col justify-between items-center text-center relative z-10" glowColor="rgba(134, 119, 255, 0.08)">
            <div className="w-16 h-16 rounded-full bg-brand-teal/10 border border-brand-teal/30 flex items-center justify-center text-brand-teal shadow-lg">
              <span className="text-xl font-black">02</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">2. Process with AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI transcribes video uploads automatically, filters for positive sentiments, extracts primary keywords, and highlights conversion-optimized quotes.
              </p>
            </div>
            <div className="bg-[#09090B] border border-border-primary p-3.5 rounded-lg w-full text-left space-y-1.5 font-mono text-[9px]">
              <div className="flex justify-between text-brand-emerald">
                <span>Transcription Match:</span>
                <span className="font-bold">96% SUCCESS</span>
              </div>
              <div className="text-slate-500 truncate">
                Highlight: "onboarding speed immediately doubled."
              </div>
            </div>
          </SpotlightCard>

          {/* Step 3 */}
          <SpotlightCard className="p-8 space-y-6 flex flex-col justify-between items-center text-center relative z-10" glowColor="rgba(108, 92, 255, 0.08)">
            <div className="w-16 h-16 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center text-brand-emerald shadow-lg">
              <span className="text-xl font-black">03</span>
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-black text-white">3. Showcase Widgets</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Publish curated lists, masonry walls, or auto-sliding carousels to your product page with a lightweight HTML/JS script bundle.
              </p>
            </div>
            <div className="bg-[#09090B] border border-border-primary p-3.5 rounded-lg w-full text-left space-y-1 font-mono text-[9px] text-slate-500">
              <span className="text-brand-teal font-extrabold uppercase block">One-Click Embed Code</span>
              <code className="text-slate-400 block truncate">&lt;script src="useproofly.vercel.app/embed.js"&gt;&lt;/script&gt;</code>
            </div>
          </SpotlightCard>
        </div>
      </motion.section>



      {/* FAQ SECTION */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealOnScrollVariants}
        id="faq" 
        className="max-w-4xl mx-auto px-6 py-24 text-center space-y-16"
      >
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
          <p className="text-slate-400 text-sm">
            Everything you need to know about the Proofly platform.
          </p>
        </div>

        {/* Accordions */}
        <div className="border border-border-primary rounded-xl overflow-hidden divide-y divide-border-primary text-left">
          {faqs.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div key={idx} className="bg-[#18181B]">
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-5 flex items-center justify-between text-white font-bold text-xs sm:text-sm cursor-pointer select-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 text-brand-teal transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-6 pb-5 text-xs text-slate-400 leading-relaxed border-t border-border-primary/30 pt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </motion.section>



      {/* WATCH DEMO MODAL POPUP */}
      <AnimatePresence>
        {isDemoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDemoOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#18181B] border border-border-primary rounded-2xl overflow-hidden max-w-2xl w-full shadow-2xl relative z-10 text-left"
            >
              <div className="flex items-center justify-between p-4 border-b border-border-primary/50">
                <span className="text-xs font-black uppercase text-brand-emerald tracking-wider flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Product Demonstration</span>
                </span>
                <button onClick={() => setIsDemoOpen(false)} className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="aspect-video bg-black relative overflow-hidden flex flex-col justify-between select-none group/player">
                {/* VIDEO DISPLAY AREA */}
                <div className="flex-1 w-full h-full flex flex-col justify-center items-center p-6 relative">
                  
                  {/* Phase 1: Collect Testimonials (0s to 15s) */}
                  {videoTime >= 0 && videoTime < 15 && (
                    <motion.div 
                      key="video-collect"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full max-w-lg bg-[#09090B] border border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col justify-between h-[230px] relative shadow-2xl"
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="text-[10px] font-black text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          🎥 Phase 1: Collect Testimonials
                        </span>
                        <div className="flex items-center space-x-1.5 text-[8px] font-mono text-zinc-500">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                          <span>WEBCAM ACTIVE</span>
                        </div>
                      </div>

                      {/* Mockup Webcam split view */}
                      <div className="grid grid-cols-2 gap-4 flex-1 items-stretch">
                        {/* Simulated webcam feed overlay */}
                        <div className="bg-[#0c0d12] border border-zinc-800 rounded-lg flex flex-col justify-between p-2 relative overflow-hidden">
                          <div className="flex items-center justify-between text-[7px] text-zinc-500 font-mono z-10">
                            <span className="text-red-500 font-black">REC: 00:08</span>
                            <span>1080p HD</span>
                          </div>
                          
                          {/* Face avatar placeholder */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center">
                              <Smile className="w-5 h-5 text-zinc-600 animate-bounce" />
                            </div>
                          </div>

                          <div className="w-full flex justify-center z-10">
                            <span className="text-[7px] font-bold text-slate-400 bg-black/60 px-2 py-0.5 rounded">Sarah Jenkins</span>
                          </div>
                        </div>

                        {/* Customer Form Overlay */}
                        <div className="space-y-2 flex flex-col justify-center text-left">
                          <div className="space-y-1">
                            <label className="text-[7px] font-bold text-zinc-500 uppercase">Reviewer Name</label>
                            <div className="bg-zinc-950 border border-zinc-850 px-2 py-1 rounded text-[9px] text-white">
                              Sarah Jenkins
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[7px] font-bold text-zinc-500 uppercase">Reviewer Email</label>
                            <div className="bg-zinc-950 border border-zinc-850 px-2 py-1 rounded text-[9px] text-white truncate">
                              sarah@devflow.io
                            </div>
                          </div>
                          <div className="bg-brand-emerald/10 border border-brand-emerald/20 p-1.5 rounded text-[8px] text-slate-300">
                            💡 <strong>Question:</strong> How fast was the setup?
                          </div>
                        </div>
                      </div>

                      {/* Caption */}
                      <div className="text-[9px] text-slate-400 font-bold italic text-center border-t border-zinc-800 pt-2">
                        "Collect video or text testimonials in under 60 seconds."
                      </div>
                    </motion.div>
                  )}

                  {/* Phase 2: Manage Inbox (15s to 30s) */}
                  {videoTime >= 15 && videoTime < 30 && (
                    <motion.div 
                      key="video-manage"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full max-w-lg bg-[#09090B] border border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col justify-between h-[230px] relative shadow-2xl"
                    >
                      {/* Top Header */}
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="text-[10px] font-black text-brand-teal bg-brand-teal/10 border border-brand-teal/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          📊 Phase 2: AI Management Dashboard
                        </span>
                        <span className="text-[8px] font-mono text-zinc-500">SENTIMENT: 99.4% POSITIVE</span>
                      </div>

                      {/* Inbox detail card */}
                      <div className="bg-zinc-950 border border-zinc-850 p-3 rounded-lg space-y-2 flex-1 flex flex-col justify-center">
                        <div className="flex items-center justify-between text-[9px] font-bold">
                          <span className="text-white">Review from Sarah Jenkins (DevFlow)</span>
                          <span className="text-brand-emerald uppercase text-[7px] border border-brand-emerald/20 bg-brand-emerald/10 px-1.5 py-0.5 rounded">AI Tagged</span>
                        </div>
                        
                        {/* Auto summary typing effect */}
                        <div className="bg-black border border-zinc-900 p-2 rounded text-[9px] font-mono text-slate-300 min-h-[36px]">
                          {videoTime >= 18 ? "Sarah details the fast 15-minute onboarding configuration..." : "Analyzing review sentiment..."}
                        </div>

                        {/* Social Draft auto-generated */}
                        <div className="bg-zinc-900/60 p-1.5 rounded flex items-center justify-between">
                          <div className="text-[8px] text-zinc-400 font-mono truncate max-w-xs">
                            𝕏 Draft: "Onboarding setup took under 15 minutes! Onboarding speed doubled..."
                          </div>
                          <span className="bg-brand-teal text-white text-[7px] font-black uppercase px-2 py-0.5 rounded shadow cursor-pointer">
                            Copy Draft
                          </span>
                        </div>
                      </div>

                      {/* Caption */}
                      <div className="text-[9px] text-slate-400 font-bold italic text-center border-t border-zinc-800 pt-2">
                        "Organize every testimonial and discover customer insights powered by AI."
                      </div>
                    </motion.div>
                  )}

                  {/* Phase 3: Showcase Widgets (30s to 45s) */}
                  {videoTime >= 30 && videoTime <= 45 && (
                    <motion.div 
                      key="video-showcase"
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full max-w-lg bg-[#09090B] border border-zinc-800 rounded-xl p-4 space-y-3 flex flex-col justify-between h-[230px] relative shadow-2xl overflow-hidden"
                    >
                      {/* Floating hearts animation */}
                      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-20">
                        {[...Array(5)].map((_, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ y: 200, opacity: 0 }}
                            animate={{ y: 20, opacity: [0, 0.9, 0], x: Math.sin(idx) * 20 }}
                            transition={{ repeat: Infinity, duration: 2.2 + idx * 0.4, delay: idx * 0.5 }}
                            className="absolute text-brand-teal text-xs"
                            style={{ left: `${20 + idx * 15}%` }}
                          >
                            ❤️
                          </motion.div>
                        ))}
                      </div>

                      {/* Top Header */}
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                        <span className="text-[10px] font-black text-brand-emerald bg-brand-emerald/10 border border-brand-emerald/20 px-2 py-0.5 rounded uppercase tracking-wider">
                          💖 Phase 3: Wall of Love Embedded Widget
                        </span>
                        <span className="text-[8px] font-mono text-[#8677FF] border border-[#8677FF]/20 bg-[#8677FF]/10 px-1.5 py-0.5 rounded">+24% CONVERSION LIFT</span>
                      </div>

                      {/* Mini Wall of Love grid */}
                      <div className="grid grid-cols-2 gap-3 flex-1 items-center">
                        <div className="bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg space-y-1.5 text-left h-[100px] flex flex-col justify-between">
                          <p className="text-[9px] leading-relaxed text-slate-300 italic">
                            "Setup took under 15 minutes. Onboarding speed doubled!"
                          </p>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[8px] font-bold text-white">Sarah Jenkins</span>
                            <span className="text-[7px] text-zinc-500 font-mono">SaaS Founder</span>
                          </div>
                        </div>

                        <div className="bg-zinc-950 border border-zinc-850 p-2.5 rounded-lg space-y-1.5 text-left h-[100px] flex flex-col justify-between">
                          <p className="text-[9px] leading-relaxed text-slate-300 italic">
                            "We increased conversion rates by 18% in our first week!"
                          </p>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[8px] font-bold text-white">James Cole</span>
                            <span className="text-[7px] text-zinc-500 font-mono">Agency Owner</span>
                          </div>
                        </div>
                      </div>

                      {/* Caption */}
                      <div className="text-[9px] text-slate-400 font-bold italic text-center border-t border-zinc-800 pt-2 z-10 relative">
                        "Turn customer proof into trust that drives more conversions."
                      </div>
                    </motion.div>
                  )}

                </div>

                {/* VIDEO PLAYER BOTTOM CONTROL BAR */}
                <div className="bg-gradient-to-t from-black via-black/90 to-transparent p-4 pt-10 space-y-3 z-30">
                  
                  {/* Timeline Scrubber */}
                  <div 
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const width = rect.width;
                      const clickPercent = clickX / width;
                      setVideoTime(Math.min(Math.max(Math.round(clickPercent * 45), 0), 45));
                      setVideoPlaying(false); // Pause auto clock on manual scrub
                    }}
                    className="w-full h-1 bg-zinc-700/80 cursor-pointer rounded-full relative group/scrub hover:h-1.5 transition-all duration-200"
                  >
                    {/* Active Progress */}
                    <div 
                      className="absolute inset-y-0 left-0 bg-brand-emerald rounded-full"
                      style={{ width: `${(videoTime / 45) * 100}%` }}
                    />
                    
                    {/* Handle */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 bg-white border border-brand-emerald rounded-full opacity-0 group-hover/scrub:opacity-100 transition-opacity duration-150"
                      style={{ left: `calc(${(videoTime / 45) * 100}% - 5px)` }}
                    />
                  </div>

                  {/* Playback Controls Row */}
                  <div className="flex items-center justify-between text-white">
                    {/* Play/Pause/Volume */}
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => setVideoPlaying(!videoPlaying)} 
                        className="text-white hover:text-brand-emerald transition cursor-pointer focus:outline-none"
                      >
                        {videoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                      </button>
                      
                      <div className="flex items-center space-x-1">
                        <Volume2 className="w-4 h-4 text-zinc-400" />
                        <span className="text-[10px] font-mono text-zinc-500">Muted</span>
                      </div>

                      {/* Current timer */}
                      <span className="text-[10px] font-mono text-zinc-400">
                        0:{videoTime < 10 ? `0${videoTime}` : videoTime} / 0:45
                      </span>
                    </div>

                    {/* Active phase indicator tag */}
                    <div className="hidden sm:flex items-center space-x-1.5 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-wider text-slate-300">
                      <span>Status:</span>
                      <span className="text-brand-emerald">
                        {videoTime < 15 ? "Collecting Feedback" : videoTime < 30 ? "Processing Insights" : "Displaying Widgets"}
                      </span>
                    </div>

                    {/* Quality / Fullscreen */}
                    <div className="flex items-center space-x-3 text-zinc-400 text-[10px]">
                      <span className="bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-1 py-0.5 rounded text-[8px] font-black tracking-widest font-mono">1080p HD</span>
                      <Maximize2 className="w-3.5 h-3.5 hover:text-white cursor-pointer transition" />
                    </div>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />

      <StripeCheckoutModal 
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        planName={selectedPlan?.name || ''}
        price={selectedPlan?.price || ''}
        tierKey={selectedPlan?.id || 'FREE'}
      />
    </div>
  );
}
