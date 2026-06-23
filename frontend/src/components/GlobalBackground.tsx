'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
}

export function GlobalBackground() {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    // Generate particles on client side to avoid SSR mismatch
    const generated: Particle[] = Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage x-axis
      y: Math.random() * 100, // percentage y-axis
      size: Math.random() * 2 + 1, // 1px to 3px
      duration: Math.random() * 20 + 15, // 15s to 35s
      delay: Math.random() * -20, // Negative delay so they start at different times
    }));
    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full bg-[#09090B] overflow-hidden pointer-events-none -z-50 select-none">
      {/* Texture Noise Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Layer 2: Slow-moving Emerald Gradient Blob */}
      <motion.div
        animate={{
          x: [0, 80, -60, 0],
          y: [0, -50, 70, 0],
          scale: [1, 1.15, 0.9, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute -top-[10%] left-[10%] w-[45vw] h-[45vw] rounded-full bg-brand-emerald/[0.08] blur-[100px] sm:blur-[140px]"
      />

      {/* Layer 3: Slow-moving Teal Gradient Blob */}
      <motion.div
        animate={{
          x: [0, -70, 50, 0],
          y: [0, 60, -80, 0],
          scale: [1, 0.9, 1.15, 1],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: 'linear',
        }}
        className="absolute -bottom-[10%] right-[10%] w-[45vw] h-[45vw] rounded-full bg-brand-teal/[0.06] blur-[100px] sm:blur-[140px]"
      />

      {/* Layer 4: Floating Particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 0, y: '110vh', x: `${p.x}vw` }}
          animate={{
            y: '-10vh',
            opacity: [0, 0.08, 0.08, 0],
            x: [`${p.x}vw`, `${p.x + (p.id % 2 === 0 ? 5 : -5)}vw`],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            width: `${p.size}px`,
            height: `${p.size}px`,
            borderRadius: '50%',
            backgroundColor: p.id % 2 === 0 ? '#6C5CFF' : '#8677FF',
            boxShadow: `0 0 8px ${p.id % 2 === 0 ? '#6C5CFF' : '#8677FF'}`,
          }}
        />
      ))}
    </div>
  );
}
