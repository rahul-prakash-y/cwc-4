import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = false }) => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      await toggleTheme();
    } catch {
      // Error handling & optimistic rollback done inside toggleTheme with toast error
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        onClick={handleToggle}
        disabled={isUpdating}
        type="button"
        aria-label={`Switch to ${isDark ? 'Light' : 'Dark'} Mode`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`relative inline-flex items-center justify-between w-14 h-8 p-1 rounded-full border transition-all duration-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-cwc-gold/50 ${
          isDark
            ? 'bg-slate-900/90 border-amber-500/30 text-amber-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]'
            : 'bg-gradient-to-r from-amber-100 to-sky-100 border-amber-400/50 text-amber-600 shadow-md'
        } ${isUpdating ? 'opacity-80 cursor-wait' : ''}`}
      >
        <span className="sr-only">Toggle theme</span>

        {/* Static Background Icons */}
        <Sun className={`w-3.5 h-3.5 ml-0.5 transition-opacity duration-300 ${isDark ? 'opacity-30 text-slate-500' : 'opacity-100 text-amber-500'}`} />
        <Moon className={`w-3.5 h-3.5 mr-0.5 transition-opacity duration-300 ${isDark ? 'opacity-100 text-amber-300' : 'opacity-30 text-slate-400'}`} />

        {/* Animated Sun/Moon Thumb Knob */}
        <motion.div
          className={`absolute top-0.5 left-0.5 w-7 h-7 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm ${
            isDark
              ? 'bg-gradient-to-tr from-slate-800 via-amber-950 to-slate-900 border border-amber-400/40 text-amber-300'
              : 'bg-white border border-amber-300 text-amber-500 shadow-amber-500/20'
          }`}
          animate={{
            x: isDark ? 24 : 0,
            rotate: isDark ? 360 : 0,
          }}
          transition={{
            type: 'spring',
            stiffness: 500,
            damping: 30,
          }}
        >
          {isUpdating ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
          ) : isDark ? (
            <Moon className="w-3.5 h-3.5 fill-amber-300/20 text-amber-300" />
          ) : (
            <Sun className="w-3.5 h-3.5 fill-amber-400/30 text-amber-500" />
          )}
        </motion.div>
      </button>

      {showLabel && (
        <span className="text-xs font-semibold font-display tracking-wide text-gray-700 dark:text-gray-200">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </div>
  );
};

export default ThemeToggle;
