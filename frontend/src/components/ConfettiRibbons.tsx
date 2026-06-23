'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Ribbon {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  rotation: number;
  drift: number;
  duration: number;
  delay: number;
  shape: 'rect' | 'circle' | 'triangle' | 'spiral';
}

const colors = [
  '#6C5CFF', // Purple
  '#8677FF', // Lavender
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#3B82F6', // Blue
  '#EC4899', // Pink
  '#8B5CF6', // Purple
];

export function ConfettiRibbons() {
  const [ribbons, setRibbons] = useState<Ribbon[]>([]);
  const [active, setActive] = useState(true);

  useEffect(() => {
    // Generate 65 colorful falling ribbon particles
    const generated: Ribbon[] = Array.from({ length: 65 }).map((_, i) => {
      const shapes: ('rect' | 'circle' | 'triangle' | 'spiral')[] = ['rect', 'circle', 'triangle', 'spiral'];
      return {
        id: i,
        x: Math.random() * 100, // percentage horizontal start
        y: Math.random() * -20 - 5, // offset above viewport
        size: Math.random() * 12 + 6, // size in pixels
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        drift: Math.random() * 30 - 15, // horizontal drift sway
        duration: 3.5 + Math.random() * 2.5, // fall duration
        delay: Math.random() * 0.8, // staggered delay
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      };
    });
    setRibbons(generated);

    // Turn off rendering after animation completion to preserve DOM nodes
    const timer = setTimeout(() => {
      setActive(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  if (!active) return null;

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden z-[9999] select-none">
      {ribbons.map((r) => {
        const renderShape = () => {
          if (r.shape === 'circle') {
            return (
              <div 
                style={{
                  width: `${r.size}px`,
                  height: `${r.size}px`,
                  backgroundColor: r.color,
                  borderRadius: '50%',
                }}
              />
            );
          }
          if (r.shape === 'triangle') {
            return (
              <div 
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: `${r.size / 2}px solid transparent`,
                  borderRight: `${r.size / 2}px solid transparent`,
                  borderBottom: `${r.size}px solid ${r.color}`,
                }}
              />
            );
          }
          if (r.shape === 'spiral') {
            return (
              <svg width={r.size} height={r.size * 2} viewBox="0 0 20 40" style={{ opacity: 0.85 }}>
                <path 
                  d="M10 0 C0 10 20 20 10 30 C0 40 20 50 10 60" 
                  fill="none" 
                  stroke={r.color} 
                  strokeWidth="3.5" 
                  strokeLinecap="round"
                />
              </svg>
            );
          }
          return (
            <div 
              style={{
                width: `${r.size * 2}px`,
                height: `${r.size / 2.5}px`,
                backgroundColor: r.color,
                borderRadius: '2px',
              }}
            />
          );
        };

        return (
          <motion.div
            key={r.id}
            initial={{ 
              opacity: 0, 
              y: `${r.y}vh`, 
              x: `${r.x}vw`, 
              rotate: r.rotation,
              scale: 0.8
            }}
            animate={{
              opacity: [0, 1, 1, 0],
              y: '105vh',
              x: `${r.x + r.drift}vw`,
              rotate: r.rotation + (r.id % 2 === 0 ? 720 : -720),
              scale: [0.8, 1, 0.8]
            }}
            transition={{
              duration: r.duration,
              delay: r.delay,
              ease: [0.25, 0.46, 0.45, 0.94] as const,
            }}
            className="absolute"
          >
            {renderShape()}
          </motion.div>
        );
      })}
    </div>
  );
}
