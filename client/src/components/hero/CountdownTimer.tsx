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

const FlipCardUnit: React.FC<FlipCardUnitProps> = ({ value, label }) => {
  const formattedValue = value.toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center">
      {/* Mechanical Flip Container */}
      <div className="relative w-16 h-20 sm:w-20 sm:h-24 md:w-24 md:h-28 bg-[#151329] rounded-xl border border-carnival-gold/30 shadow-[0_10px_30px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
        {/* Top/Bottom Horizontal Split Line */}
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-[#0B0A16] z-20 shadow-sm" />
        <div className="absolute top-1/2 left-1 w-1.5 h-1.5 rounded-full bg-carnival-gold/60 -translate-y-1/2 z-30" />
        <div className="absolute top-1/2 right-1 w-1.5 h-1.5 rounded-full bg-carnival-gold/60 -translate-y-1/2 z-30" />

        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1/2 bg-white/5 pointer-events-none" />

        {/* Number with AnimatePresence for flip transition */}
        <AnimatePresence mode="popLayout">
          <motion.span
            key={formattedValue}
            initial={{ rotateX: -90, opacity: 0 }}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="text-3xl sm:text-4xl md:text-5xl font-black font-mono text-gradient-gold drop-shadow-[0_4px_12px_rgba(255,215,0,0.4)] select-none"
          >
            {formattedValue}
          </motion.span>
        </AnimatePresence>

        {/* Corner Rivets */}
        <div className="absolute top-1.5 left-1.5 w-1 h-1 rounded-full bg-slate-600/50" />
        <div className="absolute top-1.5 right-1.5 w-1 h-1 rounded-full bg-slate-600/50" />
        <div className="absolute bottom-1.5 left-1.5 w-1 h-1 rounded-full bg-slate-600/50" />
        <div className="absolute bottom-1.5 right-1.5 w-1 h-1 rounded-full bg-slate-600/50" />
      </div>

      {/* Label Pill */}
      <span className="mt-2 text-xs sm:text-sm font-semibold tracking-wider text-carnival-cyan uppercase font-mono bg-carnival-card/80 px-2.5 py-0.5 rounded-full border border-white/10">
        {label}
      </span>
    </div>
  );
};

export const CountdownTimer: React.FC = () => {
  // Target date set to 10 days in future
  const [targetDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 10);
    return d.getTime();
  });

  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 10, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className="flex flex-col items-center my-6">
      <div className="text-xs tracking-widest text-carnival-gold font-mono uppercase mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-carnival-crimson animate-ping" />
        <span>Carnival Gates Open In</span>
        <span className="w-2 h-2 rounded-full bg-carnival-crimson animate-ping" />
      </div>

      <div className="flex items-center gap-2 sm:gap-4 p-4 rounded-2xl bg-carnival-dark/80 border border-carnival-crimson/30 shadow-[0_0_40px_rgba(255,0,85,0.2)] backdrop-blur-xl">
        <FlipCardUnit value={timeLeft.days} label="Days" />
        <span className="text-2xl font-bold text-carnival-gold -mt-6 animate-pulse">:</span>
        <FlipCardUnit value={timeLeft.hours} label="Hours" />
        <span className="text-2xl font-bold text-carnival-gold -mt-6 animate-pulse">:</span>
        <FlipCardUnit value={timeLeft.minutes} label="Mins" />
        <span className="text-2xl font-bold text-carnival-gold -mt-6 animate-pulse">:</span>
        <FlipCardUnit value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  );
};
