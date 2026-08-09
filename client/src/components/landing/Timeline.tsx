import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Flame, ShieldAlert, Sparkles, Trophy, ChevronDown, ChevronUp } from 'lucide-react';

export interface TimelineTask {
  _id?: string;
  category: 'LUCKY BOOTH' | 'GRAND CHALLENGE' | 'FUN FAIR' | 'DANGER ZONE' | 'GOLDEN ZONE' | string;
  taskDescription: string;
  timeLimit: string;
}

export interface TimelineDay {
  _id?: string;
  dayNumber: number;
  theme: string;
  daywiseName: string;
  eliminationInfo: string;
  tasks: TimelineTask[];
}

export const CATEGORY_CONFIG: Record<
  string,
  { icon: string; title: string; colorClasses: string; badgeClass: string; iconBg: string }
> = {
  'LUCKY BOOTH': {
    icon: '💖',
    title: 'LUCKY BOOTH',
    colorClasses: 'bg-pink-500/10 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border-pink-300 dark:border-pink-500/30',
    badgeClass: 'bg-pink-500 text-white font-bold',
    iconBg: 'bg-pink-100 dark:bg-pink-500/20 text-pink-600 dark:text-pink-400',
  },
  'GRAND CHALLENGE': {
    icon: '🏆',
    title: 'GRAND CHALLENGE',
    colorClasses: 'bg-purple-500/10 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-500/30',
    badgeClass: 'bg-purple-600 text-white font-bold',
    iconBg: 'bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400',
  },
  'FUN FAIR': {
    icon: '🎡',
    title: 'FUN FAIR',
    colorClasses: 'bg-blue-500/10 dark:bg-blue-950/40 text-blue-700 dark:text-cyan-300 border-blue-300 dark:border-blue-500/30',
    badgeClass: 'bg-blue-600 text-white font-bold',
    iconBg: 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-cyan-400',
  },
  'DANGER ZONE': {
    icon: '⚠️',
    title: 'DANGER ZONE',
    colorClasses:
      'bg-rose-500/15 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-400 dark:border-rose-500/50 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.25)]',
    badgeClass: 'bg-rose-600 text-white font-black animate-pulse',
    iconBg: 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400',
  },
  'GOLDEN ZONE': {
    icon: '🌟',
    title: 'GOLDEN ZONE',
    colorClasses: 'bg-amber-500/10 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/30',
    badgeClass: 'bg-amber-500 text-slate-950 font-black',
    iconBg: 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
  },
};

export const Timeline: React.FC = () => {
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
          } else {
            setDays([]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch timeline:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  const toggleDayAccordion = (dayNum: number) => {
    setExpandedDays((prev) => ({
      ...prev,
      [dayNum]: !prev[dayNum],
    }));
  };

  const selectedDay = days.find((d) => d.dayNumber === activeDayNumber) || days[0];

  return (
    <section id="timeline" className="py-20 px-4 relative max-w-7xl mx-auto font-sans">
      {/* Glow aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-3/4 h-96 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-rose-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-14 space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 dark:bg-carnival-gold/20 border border-amber-500/30 dark:border-carnival-gold/40 text-amber-700 dark:text-carnival-gold font-mono text-xs font-bold uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-amber-600 dark:text-carnival-gold" />
          <span>OFFICIAL 7-DAY EVENT SCHEDULE</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Season 4 <span className="text-gradient-carnival">Carnival Timeline</span>
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base font-sans leading-relaxed">
          Explore the daily arena schedule, elimination rules, and categorized carnival challenges for every stage of CWC Season 4.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-slate-200 dark:border-white/10 space-y-3 bg-white/90 dark:bg-slate-950/60 font-mono text-sm text-slate-500">
          <Sparkles className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
          <p>Loading Official Event Schedule...</p>
        </div>
      ) : days.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-slate-200 dark:border-white/10 space-y-3 bg-white/90 dark:bg-slate-950/60">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-slate-900 dark:text-white font-bold text-lg font-mono">No Event Timeline Seeded</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Run <code className="bg-slate-100 dark:bg-black/50 px-2 py-0.5 rounded font-mono text-amber-500">npm run seed:timeline</code> to populate the 7-day schedule.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Day Selection Nav Pills */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-3 pt-1 scrollbar-none justify-start md:justify-center">
            {days.map((day) => {
              const isActive = activeDayNumber === day.dayNumber;
              return (
                <button
                  key={day.dayNumber}
                  onClick={() => {
                    setActiveDayNumber(day.dayNumber);
                    setExpandedDays((prev) => ({ ...prev, [day.dayNumber]: true }));
                  }}
                  className={`px-4 sm:px-5 py-2.5 rounded-2xl font-mono text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2 border ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white border-amber-400 shadow-lg shadow-rose-500/25 scale-105'
                      : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-amber-400 dark:hover:border-carnival-gold/40'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  <span>Day {day.dayNumber}</span>
                  <span className="text-[10px] opacity-80 uppercase">({day.theme})</span>
                </button>
              );
            })}
          </div>

          {/* Structured Cards & Accordion Views */}
          <div className="grid grid-cols-1 gap-6">
            {days.map((day) => {
              const isSelected = activeDayNumber === day.dayNumber;
              const isExpanded = expandedDays[day.dayNumber] !== false;

              return (
                <motion.div
                  key={day.dayNumber}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`rounded-3xl border transition-all duration-300 overflow-hidden bg-white/95 dark:bg-[#151226]/95 backdrop-blur-xl ${
                    isSelected
                      ? 'border-amber-400 dark:border-carnival-gold/60 shadow-xl dark:shadow-[0_0_30px_rgba(245,158,11,0.15)] ring-2 ring-amber-400/30'
                      : 'border-slate-200 dark:border-white/10 hover:border-amber-400/40'
                  }`}
                >
                  {/* Day Header Card */}
                  <div
                    onClick={() => toggleDayAccordion(day.dayNumber)}
                    className="p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors border-b border-slate-100 dark:border-white/5"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="px-3.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white font-mono text-xs font-black shadow-sm">
                          DAY {day.dayNumber} • {day.theme}
                        </span>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-400/30 text-purple-800 dark:text-purple-300 text-xs font-mono font-extrabold">
                          <ShieldAlert className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                          <span>{day.eliminationInfo} Teams</span>
                        </span>
                      </div>

                      <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
                        {day.daywiseName}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0">
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {day.tasks.length} Carnival Categories
                      </span>
                      <button
                        className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
                        aria-label="Toggle Accordion"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* 5 Categorized Tasks Grid */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-6 sm:p-7 space-y-4 bg-slate-50/50 dark:bg-black/20"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                                  <div className="flex items-center justify-between">
                                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-mono font-black uppercase tracking-wider ${config.badgeClass}`}>
                                      {config.icon} {task.category}
                                    </span>
                                  </div>

                                  <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug font-sans pt-1">
                                    {task.taskDescription}
                                  </p>
                                </div>

                                <div className="pt-2 border-t border-slate-200/50 dark:border-white/10 flex items-center justify-between text-[11px] font-mono font-bold">
                                  <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Time Limit</span>
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
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};

export default Timeline;
