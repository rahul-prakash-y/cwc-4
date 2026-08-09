import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import { TimelineDay } from '../landing/Timeline';

export const DaySchedule: React.FC = () => {
  const [days, setDays] = useState<TimelineDay[]>([]);
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/timeline');
        if (res.ok) {
          const data = await res.json();
          if (data.timeline && Array.isArray(data.timeline) && data.timeline.length > 0) {
            setDays(data.timeline);
          }
        }
      } catch (err) {
        console.error('Failed to fetch schedule:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Student Arena Schedule Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-rose-500/10 dark:from-[#1A112A] dark:via-[#261536] dark:to-[#170E28] p-6 sm:p-8 border border-amber-300 dark:border-carnival-gold/30 shadow-sm dark:shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-carnival-gold/20 border border-amber-500/30 dark:border-carnival-gold/40 text-amber-700 dark:text-carnival-gold text-xs font-mono font-bold mb-2">
              <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-carnival-gold animate-bounce" />
              <span>OFFICIAL 7-DAY ARENA SCHEDULE</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              7-Day Event Timeline 🎪
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-sans">
              View daily themes and elimination rules across all 7 days of competition.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-2xl glass-card border border-amber-300 dark:border-carnival-gold/30 font-mono text-xs text-right bg-white/80 dark:bg-white/5">
              <div className="text-[10px] text-amber-600 dark:text-carnival-gold uppercase font-bold">TOTAL DAYS</div>
              <div className="font-extrabold text-slate-900 dark:text-white text-base">7 EPISODES</div>
            </div>
          </div>
        </div>

        {/* Day Selector Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 mt-6 overflow-x-auto pb-1 border-t border-slate-200 dark:border-white/10 pt-4 scrollbar-none">
          {days.map((day) => {
            const isActive = activeDayNumber === day.dayNumber;
            return (
              <button
                key={day.dayNumber}
                onClick={() => setActiveDayNumber(day.dayNumber)}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white font-black shadow-md'
                    : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>Day {day.dayNumber}</span>
                <span className="text-[10px] opacity-80 font-mono uppercase">({day.theme})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Schedule Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-xs bg-white dark:bg-[#18122B] rounded-3xl border border-slate-200 dark:border-white/10">
          <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
          <span>Loading Arena Schedule...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const isSelected = activeDayNumber === day.dayNumber;

            return (
              <div
                key={day.dayNumber}
                className={`rounded-3xl border transition-all duration-300 overflow-hidden bg-white dark:bg-[#18122B] p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? 'border-amber-400 dark:border-carnival-gold/60 shadow-lg'
                    : 'border-slate-200 dark:border-white/10'
                }`}
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-3 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-mono text-xs font-extrabold">
                      DAY {day.dayNumber} • {day.theme}
                    </span>

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-400/30 text-purple-800 dark:text-purple-300 text-xs font-mono font-bold">
                      <ShieldAlert className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span>{day.eliminationInfo} Teams</span>
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono">
                    {day.daywiseName}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DaySchedule;
