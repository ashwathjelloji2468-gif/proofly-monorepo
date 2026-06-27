'use client';

import React from 'react';

interface ProoflyLogoProps {
  className?: string;
  iconSize?: number;
  showText?: boolean;
  textColor?: string;
  showSlogan?: boolean;
}

export function ProoflyLogo({
  className = '',
  iconSize = 32,
  showText = true,
  textColor = 'text-white',
  showSlogan = false
}: ProoflyLogoProps) {
  return (
    <div className={`flex items-center space-x-3 select-none ${className}`}>
      {/* SVG Icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <defs>
          <linearGradient id="proofly-ribbon" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4338CA" />
            <stop offset="45%" stopColor="#4338CA" />
            <stop offset="70%" stopColor="#4338CA" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="proofly-arrow" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#4338CA" />
          </linearGradient>
        </defs>

        {/* P-shaped ribbon */}
        <path
          d="M 20 85 L 20 45 C 20 28, 35 15, 55 15 C 75 15, 90 30, 90 50 C 90 70, 75 85, 55 85 L 45 85 C 38 85, 35 80, 35 73 L 35 63 C 35 57, 40 52, 47 52 L 55 52 C 59 52, 62 49, 62 45 C 62 41, 59 38, 55 38 L 40 38 C 29 38, 20 47, 20 58 Z"
          fill="url(#proofly-ribbon)"
        />

        {/* Sparkle Star at base of arrow */}
        <path
          d="M 38 48 C 38 53, 33 56, 33 56 C 33 56, 38 59, 38 64 C 38 59, 43 56, 43 56 C 43 56, 38 53, 38 48 Z"
          fill="#ffffff"
        />

        {/* Up-right arrow */}
        <path
          d="M 39 55 L 57 37 M 49 37 L 57 37 L 57 45"
          stroke="url(#proofly-arrow)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Brand Name Typography & Slogan */}
      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-black tracking-tight text-lg leading-none ${textColor}`}>
            Proofly
          </span>
          {showSlogan && (
            <span className="text-[10px] text-slate-400 font-medium mt-1">
              Turn customer love into growth.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
