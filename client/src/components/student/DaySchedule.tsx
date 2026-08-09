import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Flame, ShieldAlert, Sparkles, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { CATEGORY_CONFIG, TimelineDay } from '../landing/Timeline';

export const DaySchedule: React.FC = () => {
  const [days, setDays] = useState<TimelineDay[]>([]);
  const [activeDayNumber, setActiveDayNumber] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedDays, setExpandedDays] = useState<Record<number, boolean>>({ 1: true });

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

  const toggleAccordion = (dayNum: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNum]: !prev[dayNum],
    }));
  };

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
              7-Day Event Timeline & Task Directory 🎪
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-sans">
              View daily themes, elimination rules, and categorized arena challenges across all 7 days of competition.
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
                onClick={() => {
                  setActiveDayNumber(day.dayNumber);
                  setExpandedDays((prev) => ({ ...prev, [day.dayNumber]: true }));
                }}
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

      {/* Main Schedule Accordions / Cards */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 font-mono text-xs bg-white dark:bg-[#18122B] rounded-3xl border border-slate-200 dark:border-white/10">
          <Sparkles className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
          <span>Loading Arena Schedule...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {days.map((day) => {
            const isSelected = activeDayNumber === day.dayNumber;
            const isExpanded = expandedDays[day.dayNumber] !== false;

            return (
              <div
                key={day.dayNumber}
                className={`rounded-3xl border transition-all duration-300 overflow-hidden bg-white dark:bg-[#18122B] ${
                  isSelected
                    ? 'border-amber-400 dark:border-carnival-gold/60 shadow-lg'
                    : 'border-slate-200 dark:border-white/10'
                }`}
              >
                {/* Header */}
                <div
                  onClick={() => toggleAccordion(day.dayNumber)}
                  className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/5"
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

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {day.tasks.length} Tasks
                    </span>
                    <button className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Categorized Tasks List */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-5 sm:p-6 bg-slate-50/50 dark:bg-black/20"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                        {day.tasks.map((task, idx) => {
                          const config = CATEGORY_CONFIG[task.category] || {
                            icon: '🎯',
                            title: task.category,
                            colorClasses: 'bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-white/10',
                            badgeClass: 'bg-slate-700 text-white',
                            iconBg: 'bg-slate-200 text-slate-700',
                          };

                          return (
                            <div
                              key={task._id || idx}
                              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all hover:scale-[1.02] shadow-sm ${config.colorClasses}`}
                            >
                              <div className="space-y-2">
                                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-extrabold uppercase tracking-wider inline-block ${config.badgeClass}`}>
                                  {config.icon} {task.category}
                                </span>

                                <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white font-sans leading-snug">
                                  {task.taskDescription}
                                </p>
                              </div>

                              <div className="pt-2 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between text-[10px] font-mono font-bold">
                                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-amber-500" /> Time
                                </span>
                                <span className="px-2 py-0.5 rounded-md bg-white/80 dark:bg-black/40 border border-slate-300 dark:border-white/15 text-slate-900 dark:text-white">
                                  {task.timeLimit}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DaySchedule;
