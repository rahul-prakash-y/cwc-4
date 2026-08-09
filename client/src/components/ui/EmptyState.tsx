import React from 'react';
import { motion } from 'framer-motion';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon: React.ElementType;
  actionElement?: React.ReactNode;
  className?: string;
  minHeight?: string;
}

/**
 * Reusable Empty State Component for CWC Season 4 Portal.
 * Renders a frosted glass card with semi-transparent icon, title, description, and optional action element.
 * Professional in Light Mode (slate styling) & cinematic in Dark Mode (purple/gray subtle glow).
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  actionElement,
  className = '',
  minHeight = '300px',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      style={{ minHeight }}
      className={`w-full p-8 sm:p-12 rounded-2xl sm:rounded-3xl bg-white/60 dark:bg-[#18122B]/60 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-lg flex flex-col items-center justify-center text-center my-4 relative overflow-hidden group transition-all duration-300 ${className}`}
    >
      {/* Soft background ambient glow for dark mode */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/5 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />

      {/* Large Semi-Transparent Icon inside Frosted Ring Container */}
      <div className="relative p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-slate-100/80 dark:bg-purple-950/40 border border-slate-200 dark:border-purple-500/20 shadow-inner mb-5 flex items-center justify-center text-slate-400 dark:text-purple-300/60 group-hover:scale-105 transition-transform duration-300">
        <Icon className="w-12 h-12 sm:w-14 sm:h-14 stroke-[1.5] text-slate-400/80 dark:text-purple-300/50" />
      </div>

      {/* Title */}
      <h3 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white tracking-tight mb-2 font-mono">
        {title}
      </h3>

      {/* Description */}
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed font-sans font-normal mb-6">
        {description}
      </p>

      {/* Optional Action Button / Element */}
      {actionElement && (
        <div className="relative z-10 flex items-center justify-center">
          {actionElement}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;
