import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon } from 'lucide-react';

interface ThemeSwitcherProps {
  showLabel?: boolean;
  className?: string;
  variant?: 'toggle' | 'icon' | 'segmented';
}

export function ThemeSwitcher({ showLabel = false, className = '', variant = 'toggle' }: ThemeSwitcherProps) {
  const { theme, toggleTheme, setTheme, isDark } = useTheme();

  if (variant === 'segmented') {
    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700/60 ${className}`}
        role="group"
        aria-label="Theme selector"
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            !isDark
              ? 'bg-white text-slate-900 shadow-sm shadow-slate-200/50'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
          aria-pressed={!isDark}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Light</span>
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
            isDark
              ? 'bg-slate-900 text-white shadow-sm shadow-slate-950/50'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
          aria-pressed={isDark}
        >
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
          <span>Dark</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        onClick={toggleTheme}
        className={`group relative inline-flex h-8 w-14 shrink-0 cursor-pointer items-center rounded-full p-1 transition-colors duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 ${
          isDark
            ? 'bg-slate-800 border border-slate-700 text-indigo-300 shadow-inner'
            : 'bg-slate-200 border border-slate-300/80 text-amber-500'
        }`}
        title={isDark ? 'Switch to light mode (stored in localStorage)' : 'Switch to dark mode (stored in localStorage)'}
      >
        {/* Background icon hints */}
        <span className="sr-only">Toggle theme mode</span>
        <div className="absolute inset-0 flex items-center justify-between px-1.5 pointer-events-none opacity-40">
          <Sun className="w-3.5 h-3.5 text-amber-600" />
          <Moon className="w-3.5 h-3.5 text-indigo-400" />
        </div>

        {/* Sliding thumb knob */}
        <span
          className={`pointer-events-none relative inline-flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition-transform duration-300 ease-in-out ${
            isDark ? 'translate-x-6 bg-slate-900 text-indigo-400' : 'translate-x-0 bg-white text-amber-500'
          }`}
        >
          {isDark ? (
            <Moon className="h-3.5 w-3.5 transition-transform duration-300 rotate-0" />
          ) : (
            <Sun className="h-3.5 w-3.5 transition-transform duration-300 rotate-0" />
          )}
        </span>
      </button>

      {showLabel && (
        <span
          onClick={toggleTheme}
          className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
        >
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </div>
  );
}
