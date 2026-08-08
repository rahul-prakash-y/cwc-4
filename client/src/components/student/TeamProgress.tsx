import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Flame, Star, Lightbulb } from 'lucide-react';

export interface DayStatus {
  dayNumber: number;
  date: string;
  title: string;
  points: number;
  status: 'Completed' | 'Active' | 'Upcoming' | string;
  isHighScoreBonus?: boolean;
}

interface TeamProgressProps {
  timeline?: DayStatus[];
  currentDayNumber?: number;
}

export const TeamProgress: React.FC<TeamProgressProps> = ({ timeline, currentDayNumber = 5 }) => {
  const days: DayStatus[] =
    timeline && timeline.length === 10
      ? timeline
      : Array.from({ length: 10 }, (_, i) => {
          const dayNum = i + 1;
          const isBonus = dayNum === 5 || dayNum === 10;
          let status: 'Completed' | 'Active' | 'Upcoming' = 'Upcoming';
          if (dayNum < currentDayNumber) status = 'Completed';
          else if (dayNum === currentDayNumber) status = 'Active';

          return {
            dayNumber: dayNum,
            date: `Day ${dayNum}`,
            title: dayNum === 5 ? 'Boss Fight' : dayNum === 10 ? 'Grand Finale' : `Sprint Task #${dayNum}`,
            points: isBonus ? 500 : 250,
            status,
            isHighScoreBonus: isBonus,
          };
        });

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-200 dark:border-carnival-gold/30 shadow-sm dark:shadow-2xl space-y-6 bg-white/90 dark:bg-gradient-to-r dark:from-[#17142E]/90 dark:via-[#131128]/90 dark:to-[#1C1533]/90 relative overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 dark:bg-carnival-gold/20 text-amber-700 dark:text-carnival-gold border border-amber-500/30 dark:border-carnival-gold/40 shadow-sm dark:shadow-neon-gold">
              🎪 CARNIVAL TRACKER
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">10-Day Carnival Lights Journey</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Team Progress Carnival Tracker
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed ✅
          </div>
          <div className="flex items-center gap-1 text-rose-600 dark:text-carnival-crimson font-bold animate-pulse">
            <Flame className="w-3.5 h-3.5 text-rose-600 dark:text-carnival-crimson" /> Active 🔥
          </div>
          <div className="flex items-center gap-1 text-amber-600 dark:text-carnival-gold font-bold">
            <Star className="w-3.5 h-3.5 text-amber-600 dark:text-carnival-gold" /> Bonus ⭐
          </div>
        </div>
      </div>

      {/* 10 Glowing Carnival Lights Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 sm:gap-4">
        {days.map((day) => {
          const isCompleted = day.status === 'Completed' || day.status === 'completed';
          const isActive =
            day.status === 'Active' || day.status === 'In Progress' || day.dayNumber === currentDayNumber;
          const isBonus = day.isHighScoreBonus || day.dayNumber === 5 || day.dayNumber === 10;

          return (
            <motion.div
              key={day.dayNumber}
              whileHover={{ scale: 1.05, y: -4 }}
              className={`p-3.5 rounded-2xl border flex flex-col items-center justify-between gap-2 text-center transition-all relative overflow-hidden ${
                isActive
                  ? 'bg-rose-500/10 dark:bg-gradient-to-b dark:from-carnival-crimson/30 dark:via-[#2A1526] dark:to-[#120F24] border-rose-500 dark:border-carnival-crimson shadow-md dark:shadow-neon-crimson ring-2 ring-rose-500/30 dark:ring-carnival-crimson/50'
                  : isCompleted
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-500/50 shadow-sm dark:shadow-neon-gold'
                  : isBonus
                  ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-carnival-gold/40'
                  : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-70'
              }`}
            >
              {/* Day Header */}
              <div className="text-[10px] font-mono font-extrabold uppercase text-slate-600 dark:text-slate-300">
                DAY {day.dayNumber}
              </div>

              {/* Carnival Light Status Emoji Icon */}
              <div className="my-1">
                {isCompleted ? (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40 flex items-center justify-center text-xl shadow-sm dark:shadow-neon-gold">
                    ✅
                  </div>
                ) : isActive ? (
                  <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-carnival-crimson/30 text-rose-600 dark:text-carnival-crimson border border-rose-300 dark:border-carnival-crimson/60 flex items-center justify-center text-xl animate-bounce shadow-sm dark:shadow-neon-crimson">
                    🔥
                  </div>
                ) : isBonus ? (
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-carnival-gold/20 text-amber-600 dark:text-carnival-gold border border-amber-300 dark:border-carnival-gold/40 flex items-center justify-center text-xl animate-pulse shadow-sm dark:shadow-neon-gold">
                    ⭐
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-white/10 flex items-center justify-center text-xl">
                    💡
                  </div>
                )}
              </div>

              {/* Day Title & Points */}
              <div className="space-y-0.5 w-full">
                <div className="text-[11px] font-bold text-slate-900 dark:text-white truncate max-w-full">
                  {day.title}
                </div>
                <div className={`text-[10px] font-mono font-semibold ${isBonus ? 'text-amber-600 dark:text-carnival-gold' : 'text-slate-500 dark:text-slate-400'}`}>
                  +{day.points} PTS
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
