'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Play, 
  Check, 
  Video, 
  MessageSquare, 
  Cpu, 
  Search, 
  Layers, 
  Terminal,
  HelpCircle,
  X,
  ChevronDown,
  Star,
  Quote,
  Eye,
  TrendingUp,
  Share2,
  Calendar,
  Smile,
  Meh,
  Frown,
  Activity,
  User,
  Heart,
  Tag
} from 'lucide-react';

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { WallOfLoveShowcase } from '@/components/WallOfLoveShowcase';
import { useStore, Testimonial } from '@/store/useStore';
import { SpotlightCard } from '@/components/SpotlightCard';
import { CandyHeart3D } from '@/components/CandyHeart3D';
import { AnimatedCounter } from '@/components/AnimatedCounter';
import { StripeCheckoutModal } from '@/components/StripeCheckoutModal';
import { SampleEmbedPlayground } from '@/components/SampleEmbedPlayground';
import { WeStartedWithTestimonial } from '@/components/WeStartedWithTestimonial';

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
  const [selectedPlan, setSelectedPlan] = useState<{ id: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE'; name: string; price: string } | null>(null);

  // Counter States for Hero Animation
  const [testimonialsCollected, setTestimonialsCollected] = useState(0);
  const [positiveSentiment, setPositiveSentiment] = useState(0);
  const [averageRating, setAverageRating] = useState(0);

  // Interactive AI Search Simulator State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearchQuery, setActiveSearchQuery] = useState('');
  
  // FAQ Active State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Wall of Love Counter & Ticker States
  const [customerCount, setCustomerCount] = useState(12000);
  const [tickerIndex, setTickerIndex] = useState(0);

  const tickers = [
    "Sarah Jenkins uploaded a video testimonial 2 minutes ago",
    "James Cole left a text testimonial 5 minutes ago",
    "Priya Sharma shared LinkedIn feedback 12 minutes ago",
    "Alex Rivera approved a Google Review import 15 minutes ago",
    "Marcus Vance left a 5-star rating 30 minutes ago",
  ];

  useEffect(() => {
    // Tick up love counter to 12487
    const target = 12487;
    const start = 12000;
    const duration = 2000;
    const steps = 50;
    const increment = (target - start) / steps;
    const intervalTime = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setCustomerCount(Math.min(Math.round(start + increment * step), target));
      if (step >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % tickers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Trigger Counter Animation on Mount
  useEffect(() => {
    const duration = 1500; // 1.5s duration
    const steps = 60;
    const intervalTime = duration / steps;
    
    let step = 0;
    const timer = setInterval(() => {
      step++;
      setTestimonialsCollected(Math.min(Math.round((step / steps) * 12487), 12487));
      setPositiveSentiment(Math.min(Math.round((step / steps) * 96), 96));
      setAverageRating(Number(Math.min((step / steps) * 4.9, 4.9).toFixed(1)));
      
      if (step >= steps) {
        clearInterval(timer);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Filter approved testimonials
  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');

  // Filtered testimonials based on selected format
  const filteredTestimonials = approvedTestimonials.filter(t => {
    if (filterFormat === 'video') return !!t.video_url;
    if (filterFormat === 'text') return !t.video_url;
    return true;
  });

  // AI Search simulation logic
  const handleQueryClick = (query: string) => {
    setSearchQuery(query);
    setActiveSearchQuery(query);
  };

  const getSimulatedSearchResults = () => {
    if (!activeSearchQuery) return approvedTestimonials.slice(0, 2);
    
    const query = activeSearchQuery.toLowerCase();
    return approvedTestimonials.filter(t => 
      t.review.toLowerCase().includes(query) || 
      t.keywords.some(kw => kw.toLowerCase().includes(query)) ||
      (query.includes('founder') && t.role.toLowerCase().includes('founder')) ||
      (query.includes('cto') && t.role.toLowerCase().includes('cto')) ||
      (query.includes('video') && t.video_url)
    );
  };

  const simulatedSearchResults = getSimulatedSearchResults();

  const pricingTiers = [
    {
      id: 'FREE',
      name: 'Starter Plan',
      price: '$0',
      period: 'forever',
      desc: 'Perfect for builders and early product validation launch.',
      features: [
        '1 Active collection Space',
        '10 Total testimonials limit',
        'Standard text review collection',
        'Proofly branding badge',
        'Basic iframe display widget'
      ],
      cta: 'Start Free',
      accent: false
    },
    {
      id: 'PRO',
      name: 'Professional Tier',
      price: '$49',
      period: 'per month',
      desc: 'Our most popular plan for scaling SaaS teams and startups.',
      features: [
        '5 Active collection Spaces',
        '100 Total testimonials',
        'In-browser webcam video recorder',
        'AI Sentiment analysis tags',
        'Custom branding & styling CSS',
        'Remove watermarks & branding',
        'Standard CSV imports'
      ],
      cta: 'Start Pro Trial',
      accent: true
    },
    {
      id: 'BUSINESS',
      name: 'Business Growth',
      price: '$99',
      period: 'per month',
      desc: 'For scaling agencies and multi-product teams requiring speed.',
      features: [
        'Unlimited spaces & widgets',
        '1,000 Testimonials limit',
        'AI transcript summary reports',
        'AI keyword tag clouds extraction',
        'Custom domain aliases CNAME',
        'LinkedIn & Twitter bulk imports',
        'Priority email SLA support'
      ],
      cta: 'Start Business Trial',
      accent: false
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise Dedicated',
      price: '$249',
      period: 'per month',
      desc: 'Custom security limits, SLA agreements, and dedicated clusters.',
      features: [
        'Unlimited everything',
        'SSO/SAML client logins',
        'Dedicated vector search cluster',
        'Mux webcam SLA guarantees',
        'Custom invoice payments portal',
        '24/7 dedicated support team'
      ],
      cta: 'Contact Enterprise',
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
              alt="customer avatar"
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
              className="inline-flex items-center space-x-2 bg-brand-emerald/10 border border-brand-emerald/20 text-[#8677FF] text-xs font-semibold px-3.5 py-1.5 rounded-full"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>The AI-Powered Evolution of Social Proof</span>
            </motion.div>

            <motion.h1 
              variants={heroChildVariants}
              className="text-4xl sm:text-6xl font-black text-white leading-[1.05] tracking-tight"
            >
              Collect, Manage and Showcase Testimonials <span className="bg-gradient-to-r from-brand-emerald to-brand-teal bg-clip-text text-transparent">with AI</span>
            </motion.h1>

            <motion.p 
              variants={heroChildVariants}
              className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-xl"
            >
              Linear's speed, Stripe's reliability, and Notion's simplicity—supercharged by AI. Automatically transcribe video reviews, map semantic vector searches, and analyze sentiment trends.
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

            {/* Animated Hero Counters */}
            <motion.div 
              variants={heroChildVariants}
              className="grid grid-cols-3 gap-6 pt-8 border-t border-border-primary/45"
            >
              <div className="space-y-1 text-left">
                <span className="text-2xl sm:text-3xl font-black text-white block font-mono">
                  {testimonialsCollected.toLocaleString()}
                </span>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Testimonials Collected
                </span>
              </div>
              
              <div className="space-y-1 text-left">
                <span className="text-2xl sm:text-3xl font-black text-brand-emerald block font-mono">
                  {positiveSentiment}%
                </span>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Positive Sentiment
                </span>
              </div>

              <div className="space-y-1 text-left">
                <span className="text-2xl sm:text-3xl font-black text-brand-teal block font-mono flex items-center">
                  {averageRating}
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400 ml-1 inline" />
                </span>
                <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">
                  Average Rating
                </span>
              </div>
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

            <SpotlightCard className="p-6 rounded-2xl shadow-2xl flex flex-col gap-6" glowColor="rgba(108, 92, 255, 0.1)">
              <div className="absolute top-0 right-0 w-24 h-24 bg-brand-emerald/5 rounded-full blur-xl" />
              
              {/* Window buttons */}
              <div className="flex items-center justify-between border-b border-border-primary/50 pb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                </div>
                <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest bg-zinc-900 px-2.5 py-0.5 rounded border border-border-primary flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                  <span>AI Monitor Active</span>
                </span>
              </div>

              {/* Animated Dashboard counters */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#09090B] border border-border-primary p-3 rounded-xl space-y-1 text-center">
                  <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider block">Sentiment</span>
                  <span className="text-sm font-black text-white flex items-center justify-center space-x-1">
                    <span className="bg-gradient-to-r from-brand-emerald to-brand-teal bg-clip-text text-transparent">{positiveSentiment}%</span>
                  </span>
                </div>
                <div className="bg-[#09090B] border border-border-primary p-3 rounded-xl space-y-1 text-center">
                  <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider block">Webcam Reviews</span>
                  <span className="text-sm font-black text-white">45</span>
                </div>
                <div className="bg-[#09090B] border border-border-primary p-3 rounded-xl space-y-1 text-center">
                  <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-wider block">Total Inbox</span>
                  <span className="text-sm font-black text-white">{testimonialsCollected.toLocaleString()}</span>
                </div>
              </div>

              {/* Cinematic AIsentient Map Mockup */}
              <div className="bg-[#09090B] border border-border-primary rounded-xl overflow-hidden relative group/img cursor-zoom-in aspect-square sm:aspect-video flex items-center justify-center">
                <img 
                  src="/ai_social_proof_mockup.png" 
                  alt="Sentient AI Social Proof dashboard network" 
                  className="w-full h-full object-cover opacity-90 group-hover/img:scale-102 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                
                {/* Floating HUD status indicator overlay */}
                <div className="absolute top-4 right-4 bg-[#09090B]/90 backdrop-blur border border-border-primary/50 py-1 px-2.5 rounded-lg text-[9px] font-mono text-[#8677FF] flex items-center space-x-1 select-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8677FF] animate-pulse" />
                  <span>PROJECTION: ACTIVE</span>
                </div>
              </div>

            </SpotlightCard>
          </motion.div>
        </motion.div>
      </section>

      {/* INFINITE TRUST LOGOS MARQUEE */}
      <section className="bg-[#111827]/40 border-y border-border-primary py-8 overflow-hidden relative">
        <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#09090B] to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#09090B] to-transparent z-10 pointer-events-none" />

        <p className="text-[10px] font-extrabold uppercase tracking-widest text-brand-emerald text-center mb-5">Trusted by teams at</p>
        
        {/* Infinite scrolling marquee wrapper */}
        <div className="w-full flex overflow-hidden">
          <div className="animate-marquee flex items-center space-x-12 px-6">
            {['Google', 'Stripe', 'Vercel', 'Linear', 'Supabase', 'Netlify', 'Google', 'Stripe', 'Vercel', 'Linear', 'Supabase', 'Netlify'].map((logo, idx) => (
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
              icon: <Cpu className="w-5 h-5 text-brand-teal" />,
              title: 'AI Insights Dashboard',
              desc: 'Auto-detect customer praise themes, keywords clouds, sentiment trends, and common complaints logs.'
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
              Testimonials.to gives you static comments. Proofly gives you intelligence. Understand what your users love, highlight positive sentiments, and track feature complaints automatically.
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
                <span>AI Detected Praise & Complaints</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5 border-r border-border-primary/50 pr-4">
                  <span className="text-[10px] font-bold text-brand-emerald block">🔥 Common Praise Points</span>
                  <p className="text-[10px] text-slate-400 italic">"Developer documentation APIs are state-of-the-art and easy to integrate."</p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-red-400 block">⚠️ Common Issues Logs</span>
                  <p className="text-[10px] text-slate-400 italic">"Android webcam feed stream initialization takes a few seconds."</p>
                </div>
              </div>
            </SpotlightCard>

          </div>

        </div>
      </motion.section>

      {/* AI SEARCH ENGINE SIMULATOR */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealOnScrollVariants}
        className="max-w-6xl mx-auto px-6 py-24 border-t border-border-primary text-center space-y-12"
      >
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">AI Semantic Vector Search</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Click on any of the natural language query tags below to simulate search queries in the customer database immediately.
          </p>
        </div>

        {/* Query click buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          {[
            'Show testimonials mentioning support',
            'Show reviews from founders',
            'Show testimonials discussing onboarding',
            'Show video reviews'
          ].map((q) => (
            <button
              key={q}
              onClick={() => handleQueryClick(q)}
              className={`text-xs font-bold px-4 py-2 border rounded-full transition cursor-pointer select-none ${
                activeSearchQuery === q
                  ? 'bg-gradient-to-r from-brand-emerald to-brand-teal text-white border-brand-emerald shadow-lg'
                  : 'bg-[#18181B] text-slate-400 border-border-primary hover:text-white'
              }`}
            >
              "{q}"
            </button>
          ))}
        </div>

        {/* Display Simulated Search Results */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto pt-6 text-left">
          <AnimatePresence mode="popLayout">
            {simulatedSearchResults.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="bg-[#18181B] border border-border-primary p-6 rounded-xl space-y-4 hover:border-zinc-800 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <img src={t.reviewerAvatar} alt="avatar" className="w-8 h-8 rounded-full border border-border-primary" />
                    <div>
                      <span className="text-xs font-extrabold text-white block">{t.name}</span>
                      <span className="text-[10px] text-muted-foreground block">{t.role} at {t.company}</span>
                    </div>
                  </div>
                  <span className="bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                    {t.sentiment}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-semibold">"{t.review}"</p>
                
                <div className="flex items-center space-x-1.5 pt-2 border-t border-border-primary/20 text-[9px] text-zinc-500 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-brand-teal" />
                  <span>Matches search query term "{activeSearchQuery || 'Default'}"</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
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

            {/* Live Ticker Feed */}
            <div className="text-[10px] font-bold text-[#8677FF] h-5 overflow-hidden flex items-center justify-center space-x-1.5 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-ping" />
              <AnimatePresence mode="wait">
                <motion.span
                  key={tickerIndex}
                  initial={{ y: 15, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -15, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="tracking-wider uppercase"
                >
                  {tickers[tickerIndex]}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Happy Customers count widget */}
            <div className="pt-2">
              <div className="text-[10px] font-extrabold text-slate-300 uppercase tracking-widest bg-[#18181B] border border-border-primary px-5 py-2.5 rounded-full inline-block shadow-lg">
                ✨ join <span className="text-brand-emerald font-black"><AnimatedCounter value={12487} /></span> happy SaaS teams
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
        </div>
      </section>

      {/* ANALYTICS DEMO */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealOnScrollVariants}
        className="max-w-7xl mx-auto px-6 py-24 text-center space-y-16"
      >
        <div className="space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">Conversion & Click Analytics</h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Deep performance tracking. Know exactly which card brings in the highest amount of user engagement.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto text-left">
          {/* Card 1: Engagement heatmap */}
          <SpotlightCard className="p-6 space-y-4" glowColor="rgba(108, 92, 255, 0.08)">
            <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2">
              <Eye className="w-4 h-4 text-brand-emerald" />
              <span>Engagement Heatmap</span>
            </h4>
            <div className="grid grid-cols-4 gap-2 pt-2">
              {Array.from({ length: 16 }).map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-8 rounded border flex items-center justify-center text-[9px] font-black ${
                    idx % 4 === 0 
                      ? 'bg-brand-emerald/25 border-brand-emerald/40 text-white' 
                      : idx % 4 === 1
                      ? 'bg-brand-teal/20 border-brand-teal/30 text-white'
                      : 'bg-zinc-900 border-border-primary text-zinc-600'
                  }`}
                  title="Interaction weight logs"
                >
                  {idx % 4 === 0 ? '90%' : idx % 4 === 1 ? '60%' : '10%'}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 mt-2">Heatmap tracking of clicks distributed on embedding widgets.</p>
          </SpotlightCard>

          {/* Card 2: Top performing card */}
          <SpotlightCard className="p-6 space-y-4 flex flex-col justify-between" glowColor="rgba(134, 119, 255, 0.08)">
            <div>
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2 mb-4">
                <TrendingUp className="w-4 h-4 text-brand-teal" />
                <span>Best Performing Card</span>
              </h4>
              <div className="bg-[#09090B] border border-border-primary p-3 rounded-lg space-y-2">
                <div className="flex items-center space-x-2">
                  <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150" alt="Sarah" className="w-6 h-6 rounded-full border border-border-primary" />
                  <span className="text-[10px] font-bold text-white">Sarah Jenkins (CTO)</span>
                </div>
                <p className="text-[10px] text-slate-400 italic">"REST APIs set up in under 30 minutes..."</p>
              </div>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-border-primary/20 mt-4">
              <span className="text-xs text-slate-400 font-medium">Conversion Rate</span>
              <span className="text-sm font-black text-brand-emerald">+24.2% CTR</span>
            </div>
          </SpotlightCard>

          {/* Card 3: Metrics summary */}
          <SpotlightCard className="p-6 space-y-4 flex flex-col justify-between" glowColor="rgba(108, 92, 255, 0.08)">
            <div>
              <h4 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center space-x-2 mb-4">
                <Share2 className="w-4 h-4 text-brand-emerald" />
                <span>Conversions Analytics</span>
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Total Views</span>
                  <span className="text-white font-extrabold">12,450</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">CTA Link Clicks</span>
                  <span className="text-brand-teal font-extrabold">3,420</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Social Shares</span>
                  <span className="text-brand-emerald font-extrabold">840</span>
                </div>
              </div>
            </div>
            <div>
              <div className="h-px bg-border-primary my-3" />
              <div className="flex justify-between items-baseline">
                <span className="text-xs text-slate-400 font-medium">Average Click Rate</span>
                <span className="text-base font-black text-white">27.4%</span>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </motion.section>

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto">
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
                    onClick={() => setSelectedPlan({ id: tier.id as 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE', name: tier.name, price: tier.price })}
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

      {/* FEATURE COMPARISON - WE STARTED WITH TESTIMONIAL */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealOnScrollVariants}
        className="w-full relative"
      >
        <WeStartedWithTestimonial />
      </motion.section>

      {/* FLOWSTEP AI JOURNEYS TIMELINE */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={revealOnScrollVariants}
        className="max-w-6xl mx-auto px-6 py-28 text-center space-y-16 border-t border-border-primary/50"
      >
        <div className="space-y-4">
          <div className="bg-[#6C5CFF]/15 text-[#8677FF] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border border-[#6C5CFF]/25">
            ⚡ automation workflow
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            How FlowStep AI Works
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
                Generate highly interactive review submission links and scannable QR codes. Gather video testimonials and text reviews effortlessly.
              </p>
            </div>
            <div className="bg-[#09090B] border border-border-primary p-3.5 rounded-lg w-full text-left space-y-2 font-mono text-[9px] text-slate-500">
              <span className="text-brand-teal font-extrabold uppercase block">QR Code & Form Link</span>
              <span className="block truncate">proofly.to/collect/acme-saas</span>
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
                <span>Sentiment Match:</span>
                <span className="font-bold">96% POSITIVE</span>
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
              <code className="text-slate-400 block truncate">&lt;script src="proofly.to/embed.js"&gt;&lt;/script&gt;</code>
            </div>
          </SpotlightCard>
        </div>

        {/* Call to action for full canvas flow builder */}
        <div className="pt-4">
          <Link href="/flowstep">
            <button className="bg-gradient-to-r from-[#6C5CFF] to-[#8677FF] text-white hover:opacity-90 font-bold text-xs py-3.5 px-8 rounded-lg shadow-xl shadow-[#6C5CFF]/10 flex items-center justify-center space-x-2 mx-auto cursor-pointer transition hover:scale-103 duration-200">
              <Sparkles className="w-4 h-4 text-brand-emerald" />
              <span>Try Interactive AI Flow Builder</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
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
                  <HelpCircle className={`w-4 h-4 text-brand-teal transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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
              <div className="aspect-video bg-black">
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
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
