import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Flame, Lock, Trophy, Calendar, Zap, Sparkles } from 'lucide-react';
import { TimelineDay } from '../../types';

export const Timeline: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [timelineItems, setTimelineItems] = useState<TimelineDay[]>([]);
  const [selectedDay, setSelectedDay] = useState<TimelineDay | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTimeline = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/tasks');
        if (res.ok) {
          const data = await res.json();
          const tasks = data.tasks || data;
          if (Array.isArray(tasks) && tasks.length > 0) {
            const mapped: TimelineDay[] = tasks.map((t: any, idx: number) => ({
              dayNumber: t.dayNumber || idx + 1,
              date: t.date || `Day ${idx + 1}`,
              title: t.title,
              description: t.description || 'Arena Challenge Task',
              status: t.status || 'Upcoming',
              points: t.points || 100,
              type: t.type || 'Main Task',
              winnerTeam: t.winnerTeam,
            }));
            setTimelineItems(mapped);
            setSelectedDay(mapped[0]);
          } else {
            setTimelineItems([]);
          }
        } else {
          setTimelineItems([]);
        }
      } catch (err) {
        console.warn('Failed to fetch timeline tasks:', err);
        setTimelineItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeline();
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -340 : 340;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="timeline" className="py-20 px-4 relative max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <div className="inline-flex items-center gap-2 text-cyan-700 dark:text-carnival-cyan font-mono text-xs uppercase tracking-widest mb-2 font-semibold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30">
            <Calendar className="w-4 h-4 text-cyan-600 dark:text-carnival-cyan" />
            <span>Registration → Selection → Day 1-10 → Finale</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
            Season 4 <span className="text-gradient-carnival">Carnival Timeline</span>
          </h2>
        </div>

        {/* Scroll Controls */}
        {timelineItems.length > 0 && (
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <button
              onClick={() => scroll('left')}
              className="p-3 rounded-xl glass-card text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-carnival-gold hover:border-amber-500/50 dark:hover:border-carnival-gold/50 transition-all active:scale-95 shadow-md"
              aria-label="Scroll Left"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-3 rounded-xl glass-card text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-carnival-gold hover:border-amber-500/50 dark:hover:border-carnival-gold/50 transition-all active:scale-95 shadow-md"
              aria-label="Scroll Right"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>

      {/* Horizontal Timeline Scroll Track / Empty State */}
      {timelineItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl glass-card border border-slate-200 dark:border-white/10 space-y-3 bg-white/90 dark:bg-slate-950/60">
          <Calendar className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-slate-900 dark:text-white font-bold text-lg font-mono">No timeline tasks published yet</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            Arena tasks created by admins in the Task Manager will automatically render along this timeline track.
          </p>
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-8 pt-4 scrollbar-none snap-x snap-mandatory scroll-smooth relative"
            style={{ scrollbarWidth: 'none' }}
          >
            {timelineItems.map((item, idx) => {
              const isCompleted = item.status === 'Completed';
              const isInProgress = item.status === 'In Progress' || item.status === 'Live';
              const isSelected = selectedDay?.title === item.title;

              return (
                <motion.div
                  key={idx}
                  onClick={() => setSelectedDay(item)}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className={`snap-center flex-shrink-0 w-72 sm:w-80 rounded-2xl p-6 cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                    isCompleted
                      ? 'glass-card border-amber-500/60 dark:border-carnival-gold/60 shadow-md dark:shadow-neon-gold bg-white dark:bg-gradient-to-b dark:from-[#1C173B] dark:to-[#151329]'
                      : isInProgress
                      ? 'glass-card border-rose-500 dark:border-carnival-crimson shadow-md dark:shadow-neon-crimson bg-white dark:bg-gradient-to-b dark:from-[#2B1024] dark:to-[#151329] animate-pulse-glow'
                      : 'glass-card bg-white/90 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-90 hover:opacity-100 hover:border-cyan-500/40'
                  } ${isSelected ? 'ring-2 ring-cyan-500 dark:ring-carnival-cyan ring-offset-2 ring-offset-slate-100 dark:ring-offset-[#0B0A16]' : ''}`}
                >
                  {/* Day & Date Header */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xl font-black font-mono text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Day {item.dayNumber < 10 ? `0${item.dayNumber}` : item.dayNumber}</span>
                      </span>
                      <span className="text-xs font-mono px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300">
                        {item.date}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 dark:bg-carnival-gold/20 text-amber-700 dark:text-carnival-gold border border-amber-500/30 dark:border-carnival-gold/40">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Completed
                        </span>
                      )}
                      {isInProgress && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/10 dark:bg-carnival-crimson/20 text-rose-600 dark:text-carnival-crimson border border-rose-500/30 dark:border-carnival-crimson/40 animate-pulse">
                          <Flame className="w-3.5 h-3.5" />
                          Live Arena Challenge
                        </span>
                      )}
                      {item.status === 'Upcoming' && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                          <Lock className="w-3.5 h-3.5" />
                          Upcoming
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-2 line-clamp-1">{item.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
                  </div>

                  {/* Footer Details */}
                  <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs font-mono text-cyan-600 dark:text-carnival-cyan font-semibold flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-cyan-600 dark:text-carnival-cyan" />
                      {item.points > 0 ? `${item.points} PTS` : 'PHASE'}
                    </span>

                    {item.winnerTeam ? (
                      <span className="text-xs text-amber-600 dark:text-carnival-gold font-medium flex items-center gap-1" title={`Winner: ${item.winnerTeam}`}>
                        <Trophy className="w-3.5 h-3.5" />
                        {item.winnerTeam.split(' ')[0]}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">{item.type}</span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Selected Day Detail Card */}
          {selectedDay && (
            <motion.div
              key={selectedDay.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 sm:p-8 rounded-2xl glass-card bg-white/95 dark:bg-[#151329]/95 border border-amber-500/30 dark:border-carnival-gold/30 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 dark:bg-carnival-gold/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 dark:bg-carnival-gold/20 text-amber-700 dark:text-carnival-gold font-mono text-xs font-bold">
                      DAY {selectedDay.dayNumber} • {selectedDay.type}
                    </span>
                    {selectedDay.status === 'Completed' && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-semibold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Verified Challenge
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{selectedDay.title}</h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm max-w-2xl">{selectedDay.description}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-slate-100 dark:bg-black/40 p-4 rounded-xl border border-slate-200 dark:border-white/10">
                  <div className="text-center px-4">
                    <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-mono">Reward</div>
                    <div className="text-xl font-bold text-cyan-600 dark:text-carnival-cyan font-mono">
                      {selectedDay.points > 0 ? `${selectedDay.points} PTS` : 'QUALIFICATION'}
                    </div>
                  </div>
                  {selectedDay.winnerTeam && (
                    <div className="text-center px-4 border-l border-slate-200 dark:border-white/10">
                      <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-mono font-bold">Victor</div>
                      <div className="text-sm font-bold text-amber-600 dark:text-carnival-gold">{selectedDay.winnerTeam}</div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </section>
  );
};

export default Timeline;
