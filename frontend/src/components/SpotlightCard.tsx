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
  glowColor = 'rgba(108, 92, 255, 0.08)', 
  borderColor = 'radial-gradient(200px circle at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(108, 92, 255, 0.45) 0%, rgba(134, 119, 255, 0.25) 50%, transparent 100%)',
  hoverScale = 1.03,
  tiltMax = 5, // subtle tilt is premium (Apple style)
  enableTilt = true,
  ...props 
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleUpdateCoords = (clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    setCoords({ x, y });

    if (enableTilt) {
      const width = rect.width;
      const height = rect.height;
      
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
      className={`relative overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] border border-border-primary bg-[#18181B] group/spotlight rounded-xl ${className}`}
      style={{
        '--mouse-x': `${coords.x}px`,
        '--mouse-y': `${coords.y}px`,
        transform: isHovered 
          ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateY(-10px) scale(${hoverScale})`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)',
        boxShadow: isHovered 
          ? '0 25px 50px -12px rgba(108, 92, 255, 0.25), 0 0 35px -5px rgba(134, 119, 255, 0.15)'
          : 'none',
      } as React.CSSProperties}
      {...props}
    >
      {/* Background Spotlight Glow */}
      <div 
        className="absolute pointer-events-none rounded-full blur-[110px] transition-opacity duration-500 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover/spotlight:opacity-100"
        style={{
          left: 'var(--mouse-x)',
          top: 'var(--mouse-y)',
          width: '280px',
          height: '280px',
          background: glowColor,
          zIndex: 0,
        }}
      />

      {/* Radiant Glowing Border outline overlay (Emerald Animated Border) */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover/spotlight:opacity-100 animate-border-glow"
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
