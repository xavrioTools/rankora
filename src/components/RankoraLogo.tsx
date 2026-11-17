import React from 'react';

interface RankoraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  iconOnly?: boolean;
  className?: string;
}

export function RankoraLogo({
  size = 'md',
  showTagline = false,
  iconOnly = false,
  className = '',
}: RankoraLogoProps) {
  // Dimensions map
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9 sm:w-10 sm:h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg sm:text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl sm:text-4xl',
  };

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 group ${className}`}>
      {/* Abstract Geometric Mark: Ascending Faceted Crystalline Lens */}
      <div className={`relative shrink-0 ${iconSizes[size]}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md transition-transform duration-300 group-hover:scale-105"
        >
          <defs>
            {/* Primary Indigo to Deep Violet Gradient */}
            <linearGradient id="rankora-primary" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4f46e5" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#7c3aed" />
            </linearGradient>

            {/* Ascending Vector Gradient */}
            <linearGradient id="rankora-growth" x1="12" y1="36" x2="36" y2="12" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4338ca" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>

            {/* Soft Lavender Optical Core Glow */}
            <linearGradient id="rankora-aperture" x1="18" y1="18" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ede9fe" />
              <stop offset="100%" stopColor="#c4b5fd" />
            </linearGradient>

            {/* Surface Highlight */}
            <linearGradient id="rankora-highlight" x1="8" y1="8" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Outer Rounded Hexagonal Diamond Frame */}
          <rect
            x="4"
            y="4"
            width="40"
            height="40"
            rx="12"
            fill="url(#rankora-primary)"
            className="transition-colors"
          />

          {/* Specular Highlight Sheen */}
          <path
            d="M5 16C5 9.92487 9.92487 5 16 5H32C38.0751 5 43 9.92487 43 16V22L5 34V16Z"
            fill="url(#rankora-highlight)"
          />

          {/* Ascending Dynamic Facets (Search Discovery & Optimization Growth) */}
          {/* Facet 1: Lower West Ascending Pillar */}
          <path
            d="M13 33L13 23L24 16L24 26L13 33Z"
            fill="#312e81"
            fillOpacity="0.8"
          />

          {/* Facet 2: Upper East Elevation Wing */}
          <path
            d="M24 16L35 23L35 33L24 26L24 16Z"
            fill="url(#rankora-growth)"
          />

          {/* Facet 3: Central Isometric Optical Ring (Precision Lens / Intelligence Aperture) */}
          <path
            d="M24 11L33 16.5L33 27.5L24 33L15 27.5L15 16.5L24 11Z"
            stroke="url(#rankora-aperture)"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />

          {/* Central Radiant Discovery Core Node */}
          <circle
            cx="24"
            cy="22"
            r="3.5"
            fill="#ffffff"
            className="animate-pulse"
          />
        </svg>

        {/* Ambient Glow */}
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/20 blur-md pointer-events-none -z-10 group-hover:bg-indigo-500/30 transition-all" />
      </div>

      {/* Wordmark and Tagline */}
      {!iconOnly && (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`font-black tracking-tight text-slate-900 dark:text-white ${textSizes[size]}`}
            >
              Rankora
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-violet-600 dark:bg-violet-400 shrink-0" />
            <span className="hidden sm:inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/60 shrink-0 ml-1">
              Open Access
            </span>
          </div>

          {showTagline ? (
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
              Smarter SEO. Open to Everyone.
            </p>
          ) : (
            <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 hidden sm:block truncate">
              Smarter SEO. Open to Everyone.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default RankoraLogo;
