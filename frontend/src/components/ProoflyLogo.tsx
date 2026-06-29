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
          <linearGradient id="proofly-logo-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="35%" stopColor="#6366F1" />
            <stop offset="70%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>
        </defs>

        {/* P-shaped ribbon body */}
        <path
          d="M 22 82 L 22 35 C 22 18, 36 10, 54 10 C 72 10, 86 24, 86 42 C 86 60, 72 74, 54 74 L 38 74 C 33 74, 30 71, 30 66 L 30 58 C 30 53, 33 50, 38 50 L 54 50 C 59 50, 64 45, 64 39 C 64 33, 59 28, 54 28 L 38 28 C 29 28, 22 35, 22 45 Z"
          fill="url(#proofly-logo-gradient)"
        />

        {/* Up-right arrow */}
        <path
          d="M 38 62 L 56 44 M 47 44 L 56 44 L 56 53"
          stroke="#FFFFFF"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Large Sparkle */}
        <path
          d="M 29 41 C 29 45, 26 47, 26 47 C 26 47, 29 49, 29 53 C 29 49, 32 47, 32 47 C 32 47, 29 45, 29 41 Z"
          fill="#FFFFFF"
        />

        {/* Small Sparkle */}
        <path
          d="M 59 24 C 59 27, 57 28, 57 28 C 57 28, 59 29, 59 32 C 59 29, 61 28, 61 28 C 61 28, 59 27, 59 24 Z"
          fill="#FFFFFF"
        />
      </svg>

      {/* Brand Name Typography & Slogan */}
      {showText && (
        <div className="flex flex-col text-left">
          <span className={`font-extrabold tracking-tight text-lg leading-none ${textColor}`}>
            Proofly
          </span>
          {showSlogan && (
            <span className="text-[10px] text-slate-400 font-medium mt-1">
              Turn customer love into <span className="text-[#8B5CF6]">growth.</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
