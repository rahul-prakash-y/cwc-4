import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  Sparkles,
  Flame,
  Bell,
  CheckCircle2,
  AlertCircle,
  Zap,
  ArrowRight,
  TrendingUp,
  Gift,
  ShieldAlert,
} from 'lucide-react';

export interface AnnouncementItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'urgent' | 'bonus' | 'general';
  isNew?: boolean;
}

interface DashboardCardsGridProps {
  currentDay: number;
  taskTitle: string;
  taskCategory: string;
  taskPoints: number;
  announcements: AnnouncementItem[];
  onSelectTaskCard: () => void;
}

export const DashboardCardsGrid: React.FC<DashboardCardsGridProps> = ({
  currentDay,
  taskTitle,
  taskCategory,
  taskPoints,
  announcements,
  onSelectTaskCard,
}) => {
  // Live Countdown Timer state (e.g. 3 hours, 42 minutes, 18 seconds)
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 18 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const totalTimeSeconds = 4 * 3600; // 4 hours total
  const remainingSeconds = timeLeft.hours * 3600 + timeLeft.minutes * 60 + timeLeft.seconds;
  const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / totalTimeSeconds) * 100));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1: Today's Task */}
      <motion.div
        whileHover={{ y: -4 }}
        className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.5)] hover:border-cwc-red/40 hover:shadow-md transition-all duration-300 ease-out flex flex-col justify-between relative overflow-hidden bg-white/80 dark:bg-white/5"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cwc-red/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="px-3 py-1 rounded-full text-[10px] font-display font-bold bg-cwc-red/10 dark:bg-cwc-red/20 text-cwc-red border border-cwc-red/30 dark:border-cwc-red/40 animate-pulse flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cwc-red animate-ping" />
              DAY {currentDay} • LIVE
            </span>
            <span className="text-xs font-display font-bold text-amber-600 dark:text-cwc-gold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-cwc-gold" />
              +{taskPoints} PTS
            </span>
          </div>

          <h3 className="text-lg font-bold font-display text-slate-900 dark:text-white line-clamp-1 mb-2">{taskTitle}</h3>
          <p className="text-xs text-slate-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
            Category: <strong className="text-amber-600 dark:text-cwc-gold">{taskCategory}</strong>. Execute live solution before the time window expires.
          </p>
        </div>

        <button
          onClick={onSelectTaskCard}
          className="mt-6 w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cwc-red to-[#9F1239] text-white text-xs font-bold font-display tracking-wide border border-white/15 shadow-sm hover:-translate-y-0.5 hover:shadow-glow-red transition-all duration-300 ease-out flex items-center justify-center gap-2"
        >
          <span>Open Task Arena</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* Card 2: Time Remaining */}
      <motion.div
        whileHover={{ y: -4 }}
        className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.5)] hover:border-cwc-gold/40 hover:shadow-md transition-all duration-300 ease-out flex flex-col justify-between relative overflow-hidden bg-white/80 dark:bg-white/5"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cwc-gold/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-xs font-display font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-cwc-gold" /> Time Remaining
            </span>
            <span className="text-[10px] font-display px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-cwc-gold/20 text-amber-700 dark:text-cwc-gold font-bold border border-amber-400/30 dark:border-cwc-gold/30">
              Arena Window
            </span>
          </div>

          {/* Digital Timer */}
          <div className="flex items-center justify-center gap-1.5 my-3">
            <div className="bg-slate-100 dark:bg-cwc-bg/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-center min-w-[54px] shadow-sm">
              <span className="text-xl font-bold font-display text-slate-900 dark:text-white">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="block text-[9px] text-slate-500 dark:text-gray-400 font-display font-bold">HRS</span>
            </div>
            <span className="text-xl font-bold text-amber-600 dark:text-cwc-gold animate-pulse">:</span>
            <div className="bg-slate-100 dark:bg-cwc-bg/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-center min-w-[54px] shadow-sm">
              <span className="text-xl font-bold font-display text-slate-900 dark:text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="block text-[9px] text-slate-500 dark:text-gray-400 font-display font-bold">MIN</span>
            </div>
            <span className="text-xl font-bold text-amber-600 dark:text-cwc-gold animate-pulse">:</span>
            <div className="bg-slate-100 dark:bg-cwc-bg/80 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-center min-w-[54px] shadow-sm">
              <span className="text-xl font-bold font-display text-amber-600 dark:text-cwc-gold">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="block text-[9px] text-slate-500 dark:text-gray-400 font-display font-bold">SEC</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-display text-slate-500 dark:text-gray-400">
            <span>Window Closing</span>
            <span className="text-amber-600 dark:text-cwc-gold font-bold">{Math.round(progressPercent)}% Remaining</span>
          </div>
          <div className="h-1.5 w-full bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cwc-gold via-amber-500 to-cwc-red rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Card 3: Bonus Available */}
      <motion.div
        whileHover={{ y: -4 }}
        className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.5)] hover:border-cwc-gold/40 hover:shadow-md transition-all duration-300 ease-out flex flex-col justify-between relative overflow-hidden bg-white/80 dark:bg-white/5"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cwc-gold/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-xs font-display font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-amber-600 dark:text-cwc-gold" /> Bonus Available
            </span>
            <span className="text-[10px] font-display px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-cwc-gold/20 text-amber-700 dark:text-cwc-gold font-bold border border-amber-400/30 dark:border-cwc-gold/30">
              Streak Boost
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-cwc-bg/60 border border-slate-200 dark:border-cwc-gold/20">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-cwc-red fill-cwc-red" />
                <span className="text-xs font-bold font-display text-slate-900 dark:text-white">4-Day Streak Bonus</span>
              </div>
              <span className="text-xs font-bold font-display text-amber-600 dark:text-cwc-gold">+200 PTS</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-cwc-bg/60 border border-slate-200 dark:border-cwc-purple/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-cwc-purple" />
                <span className="text-xs font-bold font-display text-slate-900 dark:text-white">Speed Submissions</span>
              </div>
              <span className="text-xs font-bold font-display text-cwc-purple">+15% Multiplier</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] text-slate-600 dark:text-gray-300 font-display">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-cwc-gold flex-shrink-0" />
          <span>Submit before 2h mark to claim early-bird speed multiplier!</span>
        </div>
      </motion.div>

      {/* Card 4: Announcements Ticker */}
      <motion.div
        whileHover={{ y: -4 }}
        className="p-6 rounded-2xl glass-card border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.5)] hover:border-cwc-purple/40 hover:shadow-md transition-all duration-300 ease-out flex flex-col justify-between relative overflow-hidden bg-white/80 dark:bg-white/5"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-cwc-purple/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between gap-2 mb-4">
            <span className="text-xs font-display font-semibold text-slate-600 dark:text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-cwc-purple" /> Announcements
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-cwc-purple/10 dark:bg-cwc-purple/20 text-cwc-purple font-display text-[10px] font-bold border border-cwc-purple/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cwc-purple animate-ping" />
              {announcements.length} Live
            </span>
          </div>

          <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1 scrollbar-thin">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-xl bg-slate-100 dark:bg-cwc-bg/60 border border-slate-200 dark:border-white/10 hover:border-cwc-purple/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-bold font-display text-slate-900 dark:text-white line-clamp-1">{item.title}</span>
                  <span className="text-[9px] font-display text-slate-500 dark:text-gray-400 whitespace-nowrap">{item.time}</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-gray-300 line-clamp-1">{item.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-[10px] text-cwc-purple font-display font-semibold text-right">
          • Official Broadcast Stream Active
        </div>
      </motion.div>
    </div>
  );
};
