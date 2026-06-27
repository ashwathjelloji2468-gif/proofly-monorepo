'use client';

import React, { useState, useRef } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: string;
  borderColor?: string;
  hoverScale?: number;
  tiltMax?: number;
  enableTilt?: boolean;
}

export function SpotlightCard({ 
  children, 
  className = '', 
  glowColor = 'rgba(99, 102, 241, 0.08)', 
  borderColor = 'radial-gradient(220px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(99, 102, 241, 0.65) 0%, rgba(99, 102, 241, 0.25) 75%, transparent 100%)',
  hoverScale = 1.015,
  tiltMax = 5, // subtle tilt is premium (Apple style)
  enableTilt = true,
  ...props 
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [percent, setPercent] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleUpdateCoords = (clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setCoords({ x, y });

    const width = rect.width;
    const height = rect.height;
    const px = (x / width) * 100;
    const py = (y / height) * 100;
    setPercent({ x: px, y: py });

    if (enableTilt) {
      // Calculate rotation offset: centered on mouse, max tilt at edges
      const rotateX = -((y - height / 2) / (height / 2)) * tiltMax;
      const rotateY = ((x - width / 2) / (width / 2)) * tiltMax;
      setTilt({ x: rotateX, y: rotateY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    handleUpdateCoords(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (touch) {
      handleUpdateCoords(touch.clientX, touch.clientY);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
    setPercent({ x: 50, y: 50 });
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={handleMouseLeave}
      className={`relative overflow-hidden border border-[#2E3445] bg-[#1F2937] group/spotlight rounded-xl ${className}`}
      style={{
        '--mouse-x': `${coords.x}px`,
        '--mouse-y': `${coords.y}px`,
        '--mouse-px': `${percent.x}%`,
        '--mouse-py': `${percent.y}%`,
        transform: isHovered 
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-6px) scale(${hoverScale})`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
        boxShadow: isHovered 
          ? '0 12px 40px rgba(67, 56, 202, 0.12), 0 0 0 1px rgba(67, 56, 202, 0.10)'
          : 'none',
        willChange: 'transform, box-shadow',
        transition: isHovered
          ? 'transform 300ms cubic-bezier(0.03, 0.98, 0.52, 0.99), box-shadow 300ms ease'
          : 'transform 300ms cubic-bezier(0.25, 1, 0.5, 1), box-shadow 300ms ease',
      } as React.CSSProperties}
      {...props}
    >
      {/* Background Spotlight Glow */}
      <div 
        className="absolute pointer-events-none rounded-full blur-[110px] transition-opacity duration-300 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/spotlight:opacity-100"
        style={{
          left: 'var(--mouse-x)',
          top: 'var(--mouse-y)',
          width: '280px',
          height: '280px',
          background: glowColor,
          zIndex: 0,
        }}
      />

      {/* Premium Glass Glare Highlight */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover/spotlight:opacity-10 z-10"
        style={{
          background: `radial-gradient(
            400px circle at var(--mouse-x) var(--mouse-y),
            rgba(255, 255, 255, 0.3) 0%,
            transparent 80%
          )`,
        }}
      />

      {/* Radiant Glowing Border outline overlay */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover/spotlight:opacity-100"
        style={{
          border: '1.5px solid transparent',
          borderRadius: 'inherit',
          background: `${borderColor} border-box`,
          WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          WebkitMaskComposite: 'destination-out',
          maskComposite: 'exclude',
          zIndex: 10,
        }}
      />

      {/* Content Container wrapper */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
}

