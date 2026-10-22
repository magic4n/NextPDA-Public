import React from 'react';
import { motion } from 'framer-motion';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconDimensions = {
    sm: { w: 32, h: 32, r: 10, stroke: 1.5 },
    md: { w: 40, h: 40, r: 13, stroke: 1.8 },
    lg: { w: 52, h: 52, r: 16, stroke: 2.2 },
    xl: { w: 64, h: 64, r: 20, stroke: 2.5 },
  }[size];

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Glowing Icon Emblem */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative flex items-center justify-center cursor-pointer group"
        style={{ width: iconDimensions.w, height: iconDimensions.h }}
      >
        {/* Ambient Radial Glow behind logo */}
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-brand-600 via-sky-400 to-indigo-500 opacity-40 blur-md group-hover:opacity-75 transition-opacity duration-300" />

        {/* Vector SVG Emblem: The iconic 'N' + '4' fusion monogram */}
        <svg
          width={iconDimensions.w}
          height={iconDimensions.h}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10 drop-shadow-[0_4px_12px_rgba(43,126,201,0.45)]"
        >
          <defs>
            <linearGradient id="pdaBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1e293b" />
              <stop offset="50%" stop-color="#0f172a" />
              <stop offset="100%" stop-color="#070c16" />
            </linearGradient>

            <linearGradient id="pdaPrimaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#7dd3fc" />
              <stop offset="35%" stop-color="#38bdf8" />
              <stop offset="70%" stop-color="#2563eb" />
              <stop offset="100%" stop-color="#1d4ed8" />
            </linearGradient>

            <linearGradient id="pdaAccentDot" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#67e8f9" />
              <stop offset="100%" stop-color="#3b82f6" />
            </linearGradient>

            <filter id="pdaInnerGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#38bdf8" flood-opacity="0.5" />
            </filter>
          </defs>

          {/* Squircle Background Container */}
          <rect
            width="100"
            height="100"
            rx="28"
            fill="url(#pdaBgGrad)"
          />
          <rect
            x="1.5"
            y="1.5"
            width="97"
            height="97"
            rx="26.5"
            fill="none"
            stroke="rgba(255, 255, 255, 0.12)"
            strokeWidth="1.5"
          />
          <rect
            x="3"
            y="3"
            width="94"
            height="94"
            rx="25"
            fill="none"
            stroke="url(#pdaPrimaryGrad)"
            strokeWidth="1"
            strokeOpacity="0.4"
          />

          {/* Monogram Shape: NextPDA 'N' styled like the 4PDA '4' lightning bolt */}
          <g filter="url(#pdaInnerGlow)">
            {/* Left vertical pillar */}
            <rect x="22" y="24" width="13" height="52" rx="6.5" fill="url(#pdaPrimaryGrad)" />

            {/* Diagonal energetic dynamic bar */}
            <path
              d="M32 28 C32 25 36 24 38 27 L65 67 C67 70 65 74 61 74 L49 74 C47 74 44 72 43 70 L28 46 Z"
              fill="url(#pdaPrimaryGrad)"
              opacity="0.9"
            />

            {/* Right vertical pillar */}
            <rect x="65" y="24" width="13" height="52" rx="6.5" fill="url(#pdaPrimaryGrad)" />

            {/* 4PDA Horizontal Crossbar completing the '4' allusion */}
            <path
              d="M18 57 C18 53.5 21 51 24.5 51 L75.5 51 C79 51 82 53.5 82 57 C82 60.5 79 63 75.5 63 L24.5 63 C21 63 18 60.5 18 57 Z"
              fill="url(#pdaPrimaryGrad)"
              opacity="0.85"
            />

            {/* Glowing Accent Core Dot */}
            <circle cx="71.5" cy="30.5" r="4.5" fill="url(#pdaAccentDot)" />
          </g>
        </svg>
      </motion.div>

      {/* Typography Wordmark */}
      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-tight text-white group-hover:text-brand-300 transition-colors text-lg leading-tight">
              Next<span className="bg-gradient-to-r from-sky-400 to-brand-400 bg-clip-text text-transparent">PDA</span>
            </span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-brand-500/15 text-brand-300 border border-brand-400/25 tracking-wider uppercase">
              CLIENT
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide">
            сообщество 4PDA
          </span>
        </div>
      )}
    </div>
  );
};
