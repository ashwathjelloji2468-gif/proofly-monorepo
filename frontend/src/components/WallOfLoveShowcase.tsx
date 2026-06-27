'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { Star, Play, Sparkles } from 'lucide-react';
import { Testimonial } from '@/store/useStore';
import { SpotlightCard } from './SpotlightCard';

interface WallOfLoveProps {
  testimonials: Testimonial[];
  layout: 'masonry' | 'grid' | 'carousel' | 'list';
}

interface FloatingEmoji {
  id: number;
  emoji: string;
  left: number;
  scale: number;
  delay: number;
  duration: number;
}

interface ShowcardProps {
  t: Testimonial;
  sortBy: string;
}

function WallOfLoveShowcard({ t, sortBy }: ShowcardProps) {
  const isVideo = !!t.video_url;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (!videoRef.current) return;
    if (isHovered) {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [isHovered]);

  return (
    <WallOfLoveCard>
      <SpotlightCard 
        className="p-6 flex flex-col justify-between space-y-4 h-full cursor-pointer select-none"
        glowColor={isVideo ? 'rgba(99, 102, 241, 0.12)' : 'rgba(99, 102, 241, 0.08)'}
        hoverScale={isVideo ? 1.05 : 1.03}
        tiltMax={isVideo ? 4 : 5}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="space-y-4 text-left">
          {/* Rating stars & media badge */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-0.5 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3.5 h-3.5 transition duration-300 transform group-hover/spotlight:scale-120 group-hover/spotlight:rotate-[12deg] group-hover/spotlight:text-amber-300 group-hover/spotlight:drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] ${
                    i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
                  }`}
                  style={{ transitionDelay: `${i * 45}ms` }}
                />
              ))}
            </div>

            <div className="flex items-center space-x-2">
              {/* CTR / Views badge if sort active */}
              {sortBy === 'ctr' && (
                <span className="bg-brand-emerald/10 border border-brand-emerald/25 text-brand-emerald px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                  🎯 {Math.round((t.clicks / (t.views || 1)) * 100)}% CTR
                </span>
              )}
              {sortBy === 'views' && (
                <span className="bg-brand-emerald/10 border border-brand-emerald/25 text-brand-emerald px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                  👁️ {t.views} Views
                </span>
              )}
              {sortBy === 'trust' && t.trustScore && (
                <span className="bg-brand-teal/10 border border-brand-teal/25 text-brand-teal px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                  🛡️ {t.trustScore}% Trust
                </span>
              )}
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition duration-300 group-hover/spotlight:scale-105 ${
                isVideo 
                  ? 'bg-brand-teal/15 border border-brand-teal/20 text-brand-teal' 
                  : 'bg-brand-emerald/15 border border-brand-emerald/20 text-brand-emerald'
              }`}>
                {isVideo ? 'Video' : 'Text'}
              </span>
            </div>
          </div>

          {/* AI Quote Highlight tag */}
          {t.bestQuoteHighlight && (
            <div className="w-full text-[10px] font-bold text-brand-teal bg-brand-teal/5 border border-brand-teal/15 px-2.5 py-1.5 rounded-lg flex items-center space-x-2 shadow-[0_2px_8px_rgba(99,102,241,0.05)] transition duration-300">
              <Sparkles className="w-3.5 h-3.5 text-brand-teal shrink-0 animate-pulse" />
              <span className="italic leading-snug">"{t.bestQuoteHighlight}"</span>
            </div>
          )}

          {/* Testimonial message */}
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed text-left whitespace-pre-wrap">
            "{t.review}"
          </p>

          {/* Video player preview with hover autoplays */}
          {isVideo && t.video_url && (
            <div 
              className="mt-2.5 rounded-lg overflow-hidden border border-border-primary bg-[#09090B] aspect-video relative group/video shadow-md cursor-pointer transition duration-300"
            >
              <video 
                ref={videoRef}
                src={t.video_url} 
                loop 
                muted 
                preload="auto"
                playsInline 
                className="w-full h-full object-cover opacity-70 group-hover/video:opacity-100 transition duration-300"
              />
              
              {/* Play Button Glow & Watch Button Overlay */}
              {!isPlaying && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center pointer-events-none transition duration-300">
                  <div className="bg-brand-emerald/10 text-brand-emerald px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center space-x-1.5 border border-brand-emerald/20 shadow-md">
                    <Play className="w-2.5 h-2.5 fill-current text-brand-emerald" />
                    <span>Hover Card to Play</span>
                  </div>
                </div>
              )}

              {isPlaying && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center pointer-events-none">
                  <div className="bg-[#6366F1] text-white px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center space-x-2 shadow-[0_0_20px_rgba(108,92,255,0.6)] transform scale-100 transition duration-300">
                    <Play className="w-3 h-3 fill-current text-white animate-pulse" />
                    <span>Playing Preview</span>
                  </div>
                </div>
              )}

              <div className="absolute bottom-2 left-2 bg-[#09090B]/85 backdrop-blur text-[8px] font-black text-white px-2 py-0.5 rounded border border-border-primary/50 flex items-center space-x-1 uppercase tracking-wider z-20">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-teal animate-pulse" />
                <span>Live Video</span>
              </div>
            </div>
          )}
        </div>

        {/* Reviewer Details Footer */}
        <div className="border-t border-border-primary/50 pt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img 
              src={t.reviewerAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + t.name} 
              alt={t.name} 
              className="w-8 h-8 rounded-full object-cover bg-[#09090B] border border-border-primary/80 transition duration-400 group-hover/spotlight:scale-112 group-hover/spotlight:ring-2 group-hover/spotlight:ring-brand-emerald/40"
            />
            <div className="text-left">
              <span className="font-bold text-xs text-white block">{t.name}</span>
              <span className="text-[10px] text-muted-foreground block truncate max-w-[120px]">
                {t.role}{t.company ? ` at ${t.company}` : ''}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-1">
            {t.sentiment && (
              <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider transition duration-300 group-hover/spotlight:animate-pulse ${
                t.sentiment === 'POSITIVE'
                  ? 'bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/30'
                  : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
              }`}>
                {t.sentiment}
              </span>
            )}
            <span className="text-[9px] text-zinc-500 font-mono" suppressHydrationWarning>
              {new Date(t.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </SpotlightCard>
    </WallOfLoveCard>
  );
}

interface HeartParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  scale: number;
  drift: number;
  duration: number;
}

function WallOfLoveCard({ children }: { children: React.ReactNode }) {
  const [hearts, setHearts] = useState<HeartParticle[]>([]);
  const nextId = useRef(0);

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const cardWidth = rect.width;
    const cardHeight = rect.height;

    // Spawn 6 floating red hearts
    const newHearts: HeartParticle[] = Array.from({ length: 6 }).map((_, i) => ({
      id: nextId.current++,
      x: cardWidth / 2 + (Math.random() * 80 - 40),
      y: cardHeight - 20 - (Math.random() * 20),
      size: Math.random() * 12 + 12,
      scale: 0.5 + Math.random() * 0.7,
      drift: Math.random() * 60 - 30,
      duration: 1.0 + Math.random() * 0.6,
    }));

    setHearts((prev) => [...prev, ...newHearts]);

    // Clean up
    setTimeout(() => {
      setHearts((prev) => prev.filter((h) => !newHearts.find((nh) => nh.id === h.id)));
    }, 1800);
  };

  return (
    <div onMouseEnter={handleMouseEnter} className="relative h-full w-full">
      {children}
      {hearts.map((h) => (
        <motion.div
          key={h.id}
          initial={{ opacity: 0, scale: 0.5, x: h.x, y: h.y }}
          animate={{
            opacity: [0, 1, 1, 0],
            y: h.y - 120,
            x: h.x + h.drift,
            scale: h.scale,
          }}
          transition={{ duration: h.duration, ease: 'easeOut' }}
          className="absolute text-red-500 font-bold pointer-events-none z-50 select-none"
          style={{
            fontSize: `${h.size}px`,
            left: 0,
            top: 0,
            textShadow: '0 0 10px rgba(239, 68, 68, 0.6)',
          }}
        >
          ❤️
        </motion.div>
      ))}
    </div>
  );
}

export function WallOfLoveShowcase({ testimonials, layout }: WallOfLoveProps) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [reactions, setReactions] = useState<FloatingEmoji[]>([]);
  const [sortBy, setSortBy] = useState<'newest' | 'ctr' | 'views' | 'trust'>('newest');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Viewport visibility checks
  const isInView = useInView(containerRef, { margin: "200px 0px" });

  // Signature Heart Reveal State
  const [showLargeHeart, setShowLargeHeart] = useState(false);
  const [hasRevealed, setHasRevealed] = useState(false);

  useEffect(() => {
    if (isInView && !hasRevealed) {
      setShowLargeHeart(true);
      setHasRevealed(true);
      
      const timer = setTimeout(() => {
        setShowLargeHeart(false);
      }, 1800);
      
      return () => clearTimeout(timer);
    }
  }, [isInView, hasRevealed]);

  // Generate floating emojis on mount
  useEffect(() => {
    // Emojis: ❤️ Heart, ⭐ Star, 💬 Chat Bubble, 🔥 Fire, 👍 Like
    const emojis = ['❤️', '⭐', '💬', '🔥', '👍'];
    
    // Bias positions toward the columns (e.g. 20%, 50%, 80%) for higher density near cards
    const columnCenters = [20, 50, 80];
    
    const items: FloatingEmoji[] = Array.from({ length: 18 }).map((_, i) => {
      const col = columnCenters[i % columnCenters.length];
      const offset = (Math.random() * 20 - 10); // +/- 10% from column centers
      
      return {
        id: i,
        emoji: emojis[i % emojis.length],
        left: Math.max(5, Math.min(95, col + offset)),
        scale: 0.5 + Math.random() * 0.6,
        delay: Math.random() * 8,
        duration: 8 + Math.random() * 7, // 8s to 15s float time
      };
    });
    setReactions(items);
  }, []);

  // Reset carousel index when sorting changes
  useEffect(() => {
    setCarouselIndex(0);
  }, [sortBy]);

  // Parallax Scroll Offset tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });
  
  // Video cards move at slightly different speed (scroll offset translation)
  const videoParallaxY = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const textParallaxY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  // Sort testimonials dynamically
  const sortedTestimonials = [...testimonials].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'views') {
      return b.views - a.views;
    }
    if (sortBy === 'ctr') {
      const ctrA = a.clicks / (a.views || 1);
      const ctrB = b.clicks / (b.views || 1);
      return ctrB - ctrA;
    }
    if (sortBy === 'trust') {
      return (b.trustScore || 0) - (a.trustScore || 0);
    }
    return 0;
  });

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-16 bg-[#18181B] border border-border-primary rounded-xl space-y-2">
        <Sparkles className="w-8 h-8 text-brand-emerald mx-auto animate-pulse" />
        <h4 className="text-white text-sm font-extrabold">No approved reviews yet</h4>
        <p className="text-muted-foreground text-xs">Approve testimonials in your dashboard inbox to see them appear here.</p>
      </div>
    );
  }

  // Stagger entry variants for viewport entry
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] as const }
    }
  };

  const renderCard = (t: Testimonial) => {
    return <WallOfLoveShowcard key={t.id} t={t} sortBy={sortBy} />;
  };

  // Only start drifting when reveal settles
  const startFloating = hasRevealed && !showLargeHeart;

  // Layout renders
  return (
    <div ref={containerRef} className="relative w-full min-h-[400px]">
      
      {/* Signature Heart Reveal Overlay */}
      <AnimatePresence>
        {showLargeHeart && (
          <motion.div
            initial={{ scale: 0, y: 180, opacity: 0, rotate: -25 }}
            animate={{
              scale: [0, 1.8, 1.5, 0],
              y: [180, -25, 0, 0],
              opacity: [0, 1, 1, 0],
              rotate: [-25, 10, 0, 15],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 1.8,
              times: [0, 0.3, 0.7, 1],
              ease: "easeInOut"
            }}
            className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none"
          >
            {/* Glossy Candy Heart SVG */}
            <div className="relative w-44 h-44 drop-shadow-[0_20px_50px_rgba(108,92,255,0.5)]">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <defs>
                  <linearGradient id="largeHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4338CA" />
                    <stop offset="100%" stopColor="#6366F1" />
                  </linearGradient>
                  <linearGradient id="largeSpecular" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M60 112 C48 101 8 70 8 42 C8 22 23 8 42 8 C51 8 57 13 60 18 C63 13 69 8 78 8 C97 8 112 22 112 42 C112 70 72 101 60 112 Z" fill="#4338CA" transform="translate(0, 4)" />
                <path d="M60 110 C49 99 9 69 9 41 C9 21 24 7 42 7 C51 7 57 12 60 17 C63 12 69 7 78 7 C96 7 111 21 111 41 C111 69 71 99 60 110 Z" fill="url(#largeHeartGrad)" />
                <path d="M42 9 C25 9 11 23 11 41 C11 51 18 63 28 73 C25 65 21 55 21 44 C21 28 32 15 48 15 C54 15 58 18 60 22 C62 18 66 15 72 15 C88 15 99 28 99 44 C99 55 95 65 92 73 C102 63 109 51 109 41 C109 23 95 9 78 9 C69 9 63 14 60 19 C57 14 51 9 42 9 Z" fill="url(#largeSpecular)" />
                <circle cx="38" cy="28" r="8" fill="#fff" opacity="0.32" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-[12px] font-black tracking-widest text-indigo-950 uppercase select-none drop-shadow">LOVE</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Social Proof Emojis in background - only render/animate when in viewport & after reveal */}
      {isInView && startFloating && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0">
          {reactions.map((item) => (
            <motion.div
              key={item.id}
              initial={{ y: '105vh', opacity: 0, scale: 0.4 }}
              animate={{
                y: '-10vh',
                opacity: [0, 0.12, 0.12, 0],
                scale: [0.4, item.scale, 0.4],
                x: [`${item.left}vw`, `${item.left + (item.id % 2 === 0 ? 6 : -6)}vw`],
              }}
              transition={{
                duration: item.duration,
                repeat: Infinity,
                delay: item.delay,
                ease: 'linear',
              }}
              className="absolute text-lg sm:text-xl font-bold select-none pointer-events-none"
              style={{
                left: `${item.left}%`,
                color: item.id % 3 === 0 ? '#4338CA' : item.id % 3 === 1 ? '#6366F1' : '#FFFFFF',
                textShadow: `0 0 10px ${item.id % 3 === 0 ? 'rgba(99, 102, 241, 0.3)' : item.id % 3 === 1 ? 'rgba(99, 102, 241, 0.3)' : 'rgba(255,255,255,0.2)'}`,
              }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </div>
      )}

      {/* Sorting Controls UI */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 bg-[#18181B]/40 backdrop-blur-md border border-zinc-800/60 p-3 px-4 rounded-xl z-20 relative">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-emerald animate-pulse" />
          <span className="text-xs font-bold text-zinc-300 uppercase tracking-widest">Social intelligence filters</span>
        </div>
        
        <div className="flex flex-wrap gap-1.5 justify-center sm:justify-end">
          {[
            { id: 'newest', label: '🆕 Newest' },
            { id: 'ctr', label: '🎯 High CTR' },
            { id: 'views', label: '👁️ Views' },
            { id: 'trust', label: '🛡️ Trust Score' }
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all duration-300 ${
                sortBy === option.id
                  ? 'bg-brand-emerald text-white shadow-[0_0_12px_rgba(108,92,255,0.3)] border border-brand-emerald/20 font-bold'
                  : 'bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800/40'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Render layout contents */}
      <div className="relative z-10">
        {layout === 'grid' && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {sortedTestimonials.map((t, idx) => (
              <motion.div 
                key={t.id} 
                variants={cardVariants}
                style={{ y: t.video_url ? videoParallaxY : textParallaxY }}
              >
                {renderCard(t)}
              </motion.div>
            ))}
          </motion.div>
        )}

        {layout === 'carousel' && (
          <div className="max-w-xl mx-auto space-y-6">
            <motion.div
              key={currentTestimonial()?.id || 'empty'}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
            >
              {currentTestimonial() && renderCard(currentTestimonial()!)}
            </motion.div>
            
            <div className="flex justify-center space-x-2">
              {sortedTestimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCarouselIndex(idx)}
                  className={`w-2 h-2 rounded-full cursor-pointer transition-all duration-300 ${
                    idx === carouselIndex ? 'bg-brand-emerald w-4' : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {layout === 'list' && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-6 max-w-xl mx-auto"
          >
            {sortedTestimonials.map(t => (
              <motion.div 
                key={t.id} 
                variants={cardVariants}
              >
                {renderCard(t)}
              </motion.div>
            ))}
          </motion.div>
        )}

        {layout === 'masonry' && (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 [column-fill:_balance] box-border"
          >
            {sortedTestimonials.map(t => (
              <motion.div 
                key={t.id} 
                variants={cardVariants}
                style={{ y: t.video_url ? videoParallaxY : textParallaxY }}
                className="break-inside-avoid mb-6"
              >
                {renderCard(t)}
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );

  function currentTestimonial() {
    return sortedTestimonials[carouselIndex] || sortedTestimonials[0];
  }
}
