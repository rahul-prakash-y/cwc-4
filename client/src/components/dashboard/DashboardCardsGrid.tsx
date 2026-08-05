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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* Card 1: Today's Task */}
      <motion.div
        whileHover={{ y: -4 }}
        className="p-5 rounded-2xl glass-card border border-carnival-crimson/40 shadow-neon-crimson flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#1C1226]/90 to-[#120F24]/90"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-carnival-crimson/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-carnival-crimson/20 text-carnival-crimson border border-carnival-crimson/40 animate-pulse flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-carnival-crimson animate-ping" />
              DAY {currentDay} • LIVE
            </span>
            <span className="text-xs font-mono font-bold text-carnival-gold flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-carnival-gold" />
              +{taskPoints} PTS
            </span>
          </div>

          <h3 className="text-lg font-extrabold text-white line-clamp-1 mb-1">{taskTitle}</h3>
          <p className="text-xs text-slate-300 line-clamp-2">
            Category: <strong className="text-carnival-cyan">{taskCategory}</strong>. Execute live solution before the time window expires.
          </p>
        </div>

        <button
          onClick={onSelectTaskCard}
          className="mt-4 w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-carnival-crimson to-carnival-purple text-white text-xs font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-lg"
        >
          <span>Open Task Arena</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </motion.div>

      {/* Card 2: Time Remaining */}
      <motion.div
        whileHover={{ y: -4 }}
        className="p-5 rounded-2xl glass-card border border-carnival-cyan/40 shadow-neon-cyan flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#101F30]/90 to-[#120F24]/90"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-carnival-cyan/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-carnival-cyan" /> Time Remaining
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-carnival-cyan/20 text-carnival-cyan font-bold">
              Arena Window
            </span>
          </div>

          {/* Digital Timer */}
          <div className="flex items-center justify-center gap-1.5 my-2">
            <div className="bg-black/60 border border-carnival-cyan/30 rounded-xl px-3 py-1.5 text-center min-w-[52px]">
              <span className="text-xl font-black font-mono text-white">
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span className="block text-[9px] text-slate-400 font-mono">HRS</span>
            </div>
            <span className="text-xl font-bold text-carnival-cyan animate-pulse">:</span>
            <div className="bg-black/60 border border-carnival-cyan/30 rounded-xl px-3 py-1.5 text-center min-w-[52px]">
              <span className="text-xl font-black font-mono text-white">
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span className="block text-[9px] text-slate-400 font-mono">MIN</span>
            </div>
            <span className="text-xl font-bold text-carnival-cyan animate-pulse">:</span>
            <div className="bg-black/60 border border-carnival-cyan/30 rounded-xl px-3 py-1.5 text-center min-w-[52px]">
              <span className="text-xl font-black font-mono text-carnival-cyan">
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
              <span className="block text-[9px] text-slate-400 font-mono">SEC</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span>Window Closing</span>
            <span className="text-carnival-cyan font-bold">{Math.round(progressPercent)}% Remaining</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-carnival-cyan to-blue-500 rounded-full transition-all duration-1000"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* Card 3: Bonus Available */}
      <motion.div
        whileHover={{ y: -4 }}
        className="p-5 rounded-2xl glass-card border border-carnival-gold/40 shadow-neon-gold flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#241E11]/90 to-[#120F24]/90"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-carnival-gold/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-carnival-gold" /> Bonus Available
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-carnival-gold/20 text-carnival-gold font-bold">
              Streak Boost
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-carnival-gold/20">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-carnival-crimson fill-carnival-crimson" />
                <span className="text-xs font-bold text-white">4-Day Streak Bonus</span>
              </div>
              <span className="text-xs font-black font-mono text-carnival-gold">+200 PTS</span>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-black/40 border border-carnival-cyan/20">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-carnival-cyan" />
                <span className="text-xs font-bold text-white">Speed Submissions</span>
              </div>
              <span className="text-xs font-black font-mono text-carnival-cyan">+15% Multiplier</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-300 font-mono">
          <Sparkles className="w-3.5 h-3.5 text-carnival-gold flex-shrink-0" />
          <span>Submit before 2h mark to claim early-bird speed multiplier!</span>
        </div>
      </motion.div>

      {/* Card 4: Announcements Ticker */}
      <motion.div
        whileHover={{ y: -4 }}
        className="p-5 rounded-2xl glass-card border border-carnival-purple/40 shadow-neon-purple flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-[#1C1330]/90 to-[#120F24]/90"
      >
        <div className="absolute top-0 right-0 w-24 h-24 bg-carnival-purple/10 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-carnival-purple" /> Announcements
            </span>
            <span className="px-2 py-0.5 rounded-full bg-carnival-purple/30 text-white font-mono text-[10px] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-carnival-purple animate-ping" />
              {announcements.length} Live
            </span>
          </div>

          <div className="space-y-2 max-h-[110px] overflow-y-auto pr-1 scrollbar-thin">
            {announcements.map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-xl bg-black/40 border border-white/10 hover:border-carnival-purple/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <span className="text-xs font-bold text-white line-clamp-1">{item.title}</span>
                  <span className="text-[9px] font-mono text-slate-400 whitespace-nowrap">{item.time}</span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-1">{item.message}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 text-[10px] text-carnival-purple font-mono font-semibold text-right">
          • Official Broadcast Stream Active
        </div>
      </motion.div>
    </div>
  );
};
