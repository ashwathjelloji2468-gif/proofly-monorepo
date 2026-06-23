'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  duration?: number; // duration in ms
}

export function AnimatedCounter({ value, duration = 2000 }: AnimatedCounterProps) {
  const [displayCount, setDisplayCount] = useState(value);
  const containerRef = useRef<HTMLSpanElement>(null);
  const isInView = useInView(containerRef, { once: true, margin: '-50px' });
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      let startTimestamp: number | null = null;
      const startValue = 0;

      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        
        // Quad ease-out formula
        const easeProgress = progress * (2 - progress);
        const currentCount = Math.floor(easeProgress * (value - startValue) + startValue);
        
        setDisplayCount(currentCount);

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setDisplayCount(value);
        }
      };

      window.requestAnimationFrame(step);
    }
  }, [isInView, value, duration]);

  return (
    <span ref={containerRef} suppressHydrationWarning>
      {displayCount.toLocaleString()}
    </span>
  );
}
