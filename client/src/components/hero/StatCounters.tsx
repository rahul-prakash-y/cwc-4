import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, Trophy, Crown } from 'lucide-react';

interface StatItemProps {
  target: number;
  label: string;
  subtext: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}

const StatItem: React.FC<StatItemProps> = ({ target, label, subtext, icon: Icon, color, delay }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1800; // ms
    const increment = Math.max(1, Math.ceil(target / (duration / 50)));

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 50);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -6, scale: 1.03 }}
      className="relative p-5 rounded-2xl glass-card border border-slate-200 dark:border-white/10 hover:border-amber-400 dark:hover:border-carnival-gold/40 flex flex-col items-center text-center shadow-sm dark:shadow-xl group overflow-hidden transition-all duration-300 bg-white/80 dark:bg-white/5"
    >
      {/* Background Accent Glow */}
      <div
        className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-30 group-hover:opacity-60 transition-opacity"
        style={{ backgroundColor: color }}
      />

      {/* Icon Badge */}
      <div
        className="p-3 rounded-xl mb-3 flex items-center justify-center shadow-md dark:shadow-lg transition-transform group-hover:rotate-12 duration-300"
        style={{ backgroundColor: `${color}20`, color: color }}
      >
        <Icon className="w-6 h-6" />
      </div>

      {/* Counter Number */}
      <div className="text-4xl font-extrabold tracking-tight mb-1 font-mono flex items-center gap-0.5">
        <span style={{ color }}>{count}</span>
        <span className="text-xl text-slate-500 dark:text-slate-400 font-sans">+</span>
      </div>

      {/* Label */}
      <div className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-wide mb-0.5">{label}</div>
      <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">{subtext}</div>

      {/* Bottom neon accent line */}
      <div
        className="absolute bottom-0 inset-x-0 h-[2px] opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: color }}
      />
    </motion.div>
  );
};

export const StatCounters: React.FC = () => {
  const stats = [
    { target: 12, label: 'Registered Teams', subtext: 'Battle Ready', icon: Users, color: '#00F0FF', delay: 0.1 },
    { target: 10, label: 'Carnival Days', subtext: 'Non-stop Action', icon: Calendar, color: '#FF0055', delay: 0.2 },
    { target: 3, label: 'Winners Podium', subtext: 'Cash & Prizes', icon: Trophy, color: '#FFD700', delay: 0.3 },
    { target: 1, label: 'Grand Champion', subtext: 'Carnival Glory', icon: Crown, color: '#39FF14', delay: 0.4 },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl mx-auto my-8 z-20 relative">
      {stats.map((stat, idx) => (
        <StatItem key={idx} {...stat} />
      ))}
    </div>
  );
};
