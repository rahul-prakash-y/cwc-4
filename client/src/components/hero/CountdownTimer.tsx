import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface FlipCardUnitProps {
  value: number;
  label: string;
}

interface CountdownTimerProps {
  eventStartDate?: string | Date;
}

const FlipCardUnit: React.FC<FlipCardUnitProps> = ({ value, label }) => {
  const formattedValue = value.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      {/* Mechanical Flip Container - Glossy Dark/Light Glass Panel */}
      <div className="relative w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/15 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_10px_30px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden transition-all duration-300 hover:border-amber-400 dark:hover:border-cwc-gold/40 hover:shadow-md dark:hover:shadow-glow-gold">
        {/* Top/Bottom Horizontal Split Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-slate-200 dark:bg-white/10 z-20" />
        <div className="absolute top-1/2 left-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-cwc-gold/70 -translate-y-1/2 z-30 shadow-sm dark:shadow-glow-gold" />
        <div className="absolute top-1/2 right-1.5 w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-cwc-gold/70 -translate-y-1/2 z-30 shadow-sm dark:shadow-glow-gold" />

        {/* Ambient Top Gloss Light Reflection */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-slate-100/50 dark:from-white/10 to-transparent pointer-events-none" />

        {/* Number with AnimatePresence for flip transition */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={formattedValue}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-transparent bg-clip-text bg-gradient-to-b from-slate-900 via-amber-600 to-amber-700 dark:from-white dark:via-amber-200 dark:to-cwc-gold drop-shadow-sm dark:drop-shadow-[0_4px_12px_rgba(255,215,0,0.3)] select-none"
          >
            {formattedValue}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Label Pill */}
      <span className="mt-2.5 text-[11px] sm:text-xs font-bold tracking-widest text-amber-700 dark:text-cwc-gold/90 uppercase font-display bg-slate-100 dark:bg-white/5 backdrop-blur-md px-3 py-0.5 rounded-full border border-slate-200 dark:border-white/10 shadow-sm">
        {label}
      </span>
    </div>
  );
};

export const CountdownTimer: React.FC<CountdownTimerProps> = ({ eventStartDate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const getTargetTime = () => {
      if (eventStartDate) {
        return new Date(eventStartDate).getTime();
      }
      // Fallback: 10 days in future
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 10);
      return defaultDate.getTime();
    };

    const calculateTime = () => {
      const targetTime = getTargetTime();
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [eventStartDate]);

  return (
    <div className="flex flex-col items-center my-8">
      <div className="text-xs tracking-widest text-amber-700 dark:text-cwc-gold font-display font-semibold uppercase mb-4 flex items-center gap-2 bg-white dark:bg-white/5 px-4 py-1.5 rounded-full border border-amber-400/30 dark:border-cwc-gold/20 shadow-sm dark:shadow-glow-gold/20">
        <span className="w-2 h-2 rounded-full bg-rose-600 dark:bg-cwc-red animate-ping" />
        <span>Carnival Gates Open In</span>
        <span className="w-2 h-2 rounded-full bg-rose-600 dark:bg-cwc-red animate-ping" />
      </div>

      <div className="flex items-center gap-3 sm:gap-5 p-5 rounded-3xl glass-card border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.7)] bg-white/80 dark:bg-white/5">
        <FlipCardUnit value={timeLeft.days} label="Days" />
        <span className="text-2xl font-bold text-amber-600 dark:text-cwc-gold -mt-6 animate-pulse">:</span>
        <FlipCardUnit value={timeLeft.hours} label="Hours" />
        <span className="text-2xl font-bold text-amber-600 dark:text-cwc-gold -mt-6 animate-pulse">:</span>
        <FlipCardUnit value={timeLeft.minutes} label="Mins" />
        <span className="text-2xl font-bold text-amber-600 dark:text-cwc-gold -mt-6 animate-pulse">:</span>
        <FlipCardUnit value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  );
};
