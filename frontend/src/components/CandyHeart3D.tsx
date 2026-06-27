'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
}

export function CandyHeart3D() {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const nextId = useRef(0);
  const controls = useAnimation();
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-100px' });
  const [isFloating, setIsFloating] = useState(false);

  // Trigger animations sequentially when entering viewport
  useEffect(() => {
    if (isInView) {
      // Entry Animation: Rise from below, bounce, settle
      controls.start({
        y: [120, -15, 0],
        opacity: [0, 1, 1],
        scale: [0.6, 1.15, 1],
        rotate: [-20, 8, 0],
        transition: {
          duration: 1.2,
          ease: [0.175, 0.885, 0.32, 1.2] as const,
        }
      }).then(() => {
        // Start floating loop once entry settles
        setIsFloating(true);
      });
    }
  }, [isInView, controls]);

  // Sparkles generator loop when heart is visible
  useEffect(() => {
    if (!isInView) return;

    const interval = setInterval(() => {
      const colors = ['#4338CA', '#6366F1', '#4338CA', '#3730A3', '#ffffff'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newSparkle: Sparkle = {
        id: nextId.current++,
        x: Math.random() * 40 - 20, // offset from center
        y: Math.random() * 20 + 20, // offset below heart center
        size: Math.random() * 4 + 2, // 2px to 6px
        color: randomColor,
      };

      setSparkles((prev) => [...prev.slice(-15), newSparkle]); // Limit to max 15 sparkles
    }, 280);

    return () => clearInterval(interval);
  }, [isInView]);

  return (
    <div ref={containerRef} className="relative w-28 h-28 mx-auto flex items-center justify-center select-none">
      
      {/* Particle emitter overlay */}
      {sparkles.map((sp) => (
        <motion.div
          key={sp.id}
          initial={{ opacity: 1, scale: 0.5, x: sp.x, y: sp.y }}
          animate={{
            y: sp.y - 120, // Float upward
            x: sp.x + (Math.random() * 30 - 15), // Drifting sideways
            opacity: 0,
            scale: 0.1,
          }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: `${sp.size}px`,
            height: `${sp.size}px`,
            backgroundColor: sp.color,
            boxShadow: `0 0 8px 2px ${sp.color === '#ffffff' ? '#6366F1' : sp.color}`,
            zIndex: 5,
          }}
        />
      ))}

      {/* 3D Candy Heart Container */}
      <motion.div
        initial={{ opacity: 0, y: 120, scale: 0.6, rotate: -20 }}
        animate={isFloating ? {
          y: [0, -10, 0],
          rotate: [0, 2, -2, 0],
          transition: {
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }
        } : controls}
        className="w-20 h-20 cursor-pointer active:scale-95 transition-transform duration-200 relative group"
      >
        {/* Glow Shadow Behind Heart */}
        <div className="absolute inset-0 bg-gradient-to-tr from-brand-emerald to-brand-teal rounded-full blur-xl opacity-40 group-hover:opacity-75 transition-opacity duration-500 scale-90" />

        {/* 3D Curved Heart SVG */}
        <svg 
          viewBox="0 0 120 120" 
          className="w-full h-full filter drop-shadow-[0_12px_24px_rgba(108,92,255,0.35)] relative z-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Main Gradient */}
            <linearGradient id="candyHeartGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4338CA" />
              <stop offset="100%" stopColor="#6366F1" />
            </linearGradient>

            {/* Light Specular/Bevel Gradient */}
            <linearGradient id="specularGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>

            {/* Bottom Inner Shadow Bevel */}
            <linearGradient id="bevelShadowGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#4338CA" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#4338CA" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* 3D Extrusion Side shadow */}
          <path
            d="M60 112 C48 101 8 70 8 42 C8 22 23 8 42 8 C51 8 57 13 60 18 C63 13 69 8 78 8 C97 8 112 22 112 42 C112 70 72 101 60 112 Z"
            fill="#4338CA"
            className="transform translate-y-[3px]"
          />

          {/* Main Candy Body */}
          <path
            d="M60 110 C49 99 9 69 9 41 C9 21 24 7 42 7 C51 7 57 12 60 17 C63 12 69 7 78 7 C96 7 111 21 111 41 C111 69 71 99 60 110 Z"
            fill="url(#candyHeartGrad)"
          />

          {/* Bottom Shadow Overlay for Bevel depth */}
          <path
            d="M60 110 C49 99 9 69 9 41 C9 21 24 7 42 7 C51 7 57 12 60 17 C63 12 69 7 78 7 C96 7 111 21 111 41 C111 69 71 99 60 110 Z"
            fill="url(#bevelShadowGrad)"
            className="mix-blend-multiply"
          />

          {/* Top Bevel Highlight (Glossy Rim) */}
          <path
            d="M42 9 C25 9 11 23 11 41 C11 51 18 63 28 73 C25 65 21 55 21 44 C21 28 32 15 48 15 C54 15 58 18 60 22 C62 18 66 15 72 15 C88 15 99 28 99 44 C99 55 95 65 92 73 C102 63 109 51 109 41 C109 23 95 9 78 9 C69 9 63 14 60 19 C57 14 51 9 42 9 Z"
            fill="url(#specularGrad)"
          />

          {/* Center Specular Shine Spot */}
          <ellipse
            cx="38"
            cy="28"
            rx="14"
            ry="7"
            transform="rotate(-25 38 28)"
            fill="#ffffff"
            opacity="0.32"
          />
          
          <ellipse
            cx="82"
            cy="28"
            rx="10"
            ry="5"
            transform="rotate(25 82 28)"
            fill="#ffffff"
            opacity="0.22"
          />
        </svg>
      </motion.div>
    </div>
  );
}
