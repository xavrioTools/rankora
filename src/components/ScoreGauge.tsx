import React from 'react';

interface ScoreGaugeProps {
  score: number;
  label?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export function ScoreGauge({ score, label, size = 'md', showLabel = true }: ScoreGaugeProps) {
  const safeScore = Math.max(0, Math.min(100, Math.round(score)));

  let strokeColor = '#10b981'; // green-500
  let bgColor = 'text-emerald-500';
  let badgeText = 'Good';

  if (safeScore < 60) {
    strokeColor = '#ef4444'; // red-500
    bgColor = 'text-red-500';
    badgeText = 'Needs Work';
  } else if (safeScore < 80) {
    strokeColor = '#f59e0b'; // amber-500
    bgColor = 'text-amber-500';
    badgeText = 'Fair';
  } else if (safeScore >= 90) {
    badgeText = 'Excellent';
  }

  const dimensions = {
    sm: { width: 64, stroke: 5, fontSize: 'text-base font-bold' },
    md: { width: 96, stroke: 7, fontSize: 'text-2xl font-extrabold' },
    lg: { width: 140, stroke: 10, fontSize: 'text-4xl font-extrabold' },
    xl: { width: 180, stroke: 12, fontSize: 'text-5xl font-extrabold' },
  }[size];

  const radius = (dimensions.width - dimensions.stroke * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative inline-flex items-center justify-center" style={{ width: dimensions.width, height: dimensions.width }}>
        <svg className="transform -rotate-90" width={dimensions.width} height={dimensions.width}>
          {/* Background circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={dimensions.stroke}
            fill="transparent"
            className="text-slate-200 dark:text-slate-800"
          />
          {/* Progress circle */}
          <circle
            cx={dimensions.width / 2}
            cy={dimensions.width / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={dimensions.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`${dimensions.fontSize} ${bgColor} tracking-tight font-mono`}>
            {safeScore}
          </span>
          {size === 'xl' && (
            <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
              out of 100
            </span>
          )}
        </div>
      </div>
      {showLabel && (
        <div className="mt-2 text-center">
          {label && (
            <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{label}</div>
          )}
          <span
            className={`block text-xs font-semibold mt-0.5 ${
              safeScore >= 80
                ? 'text-emerald-600 dark:text-emerald-400'
                : safeScore >= 60
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-red-600 dark:text-red-400'
            }`}
          >
            {badgeText}
          </span>
        </div>
      )}
    </div>
  );
}
