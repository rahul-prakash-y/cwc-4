import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2, Flame, Lock, Trophy, Calendar, Zap, Sparkles } from 'lucide-react';
import { MOCK_TIMELINE } from '../../data/mockData';
import { TimelineDay } from '../../types';

export const SeasonTimeline: React.FC = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedDay, setSelectedDay] = useState<TimelineDay>(MOCK_TIMELINE[4]); // Default active day 5

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section id="timeline" className="py-20 px-4 relative max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <div className="inline-flex items-center gap-2 text-carnival-cyan font-mono text-xs uppercase tracking-widest mb-2 font-semibold">
            <Calendar className="w-4 h-4 text-carnival-cyan" />
            <span>10-Day Carnival Roadmap</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Season 4 <span className="text-gradient-carnival">Timeline Arena</span>
          </h2>
        </div>

        {/* Scroll Controls */}
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button
            onClick={() => scroll('left')}
            className="p-3 rounded-xl glass-card text-slate-300 hover:text-carnival-gold hover:border-carnival-gold/50 transition-all active:scale-95"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-3 rounded-xl glass-card text-slate-300 hover:text-carnival-gold hover:border-carnival-gold/50 transition-all active:scale-95"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Timeline Scroll Track */}
      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto pb-8 pt-4 scrollbar-none snap-x snap-mandatory scroll-smooth relative"
        style={{ scrollbarWidth: 'none' }}
      >
        {MOCK_TIMELINE.map((item) => {
          const isCompleted = item.status === 'Completed';
          const isInProgress = item.status === 'In Progress';
          const isSelected = selectedDay.dayNumber === item.dayNumber;

          return (
            <motion.div
              key={item.dayNumber}
              onClick={() => setSelectedDay(item)}
              whileHover={{ y: -8, scale: 1.02 }}
              className={`snap-center flex-shrink-0 w-72 sm:w-80 rounded-2xl p-6 cursor-pointer transition-all duration-300 relative flex flex-col justify-between ${
                isCompleted
                  ? 'glass-card border-carnival-gold/50 shadow-neon-gold bg-gradient-to-b from-[#1C173B] to-[#151329]'
                  : isInProgress
                  ? 'glass-card border-carnival-crimson shadow-neon-crimson bg-gradient-to-b from-[#2B1024] to-[#151329] animate-pulse-glow'
                  : 'glass-card border-white/10 opacity-80 hover:opacity-100 hover:border-carnival-cyan/40'
              } ${isSelected ? 'ring-2 ring-carnival-cyan ring-offset-2 ring-offset-[#0B0A16]' : ''}`}
            >
              {/* Day & Date Header */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-black font-mono text-white">
                    Day {item.dayNumber < 10 ? `0${item.dayNumber}` : item.dayNumber}
                  </span>
                  <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">
                    {item.date}
                  </span>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  {isCompleted && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 shadow-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Completed (Neon Glow)
                    </span>
                  )}
                  {isInProgress && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-carnival-crimson/20 text-carnival-crimson border border-carnival-crimson/40 animate-pulse">
                      <Flame className="w-3.5 h-3.5" />
                      Live Arena Challenge
                    </span>
                  )}
                  {item.status === 'Upcoming' && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                      <Lock className="w-3.5 h-3.5" />
                      Locked Challenge
                    </span>
                  )}
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg text-white mb-2 line-clamp-1">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{item.description}</p>
              </div>

              {/* Footer Details */}
              <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-carnival-cyan font-semibold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-carnival-cyan" />
                  {item.points} PTS
                </span>

                {item.winnerTeam && (
                  <span className="text-xs text-carnival-gold font-medium flex items-center gap-1" title={`Winner: ${item.winnerTeam}`}>
                    <Trophy className="w-3.5 h-3.5" />
                    {item.winnerTeam.split(' ')[0]}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Day Detail Card */}
      <motion.div
        key={selectedDay.dayNumber}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 p-6 sm:p-8 rounded-2xl glass-card border border-carnival-gold/30 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-carnival-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-carnival-gold/20 text-carnival-gold font-mono text-xs font-bold">
                DAY {selectedDay.dayNumber} • {selectedDay.type}
              </span>
              {selectedDay.status === 'Completed' && (
                <span className="text-xs text-emerald-400 font-mono font-semibold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Neon Glow Verified
                </span>
              )}
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">{selectedDay.title}</h3>
            <p className="text-slate-300 text-sm max-w-2xl">{selectedDay.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/10">
            <div className="text-center px-4">
              <div className="text-xs text-slate-400 uppercase font-mono">Reward</div>
              <div className="text-xl font-bold text-carnival-cyan font-mono">{selectedDay.points} PTS</div>
            </div>
            {selectedDay.winnerTeam && (
              <div className="text-center px-4 border-l border-white/10">
                <div className="text-xs text-slate-400 uppercase font-mono">Victor</div>
                <div className="text-sm font-bold text-carnival-gold">{selectedDay.winnerTeam}</div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </section>
  );
};
