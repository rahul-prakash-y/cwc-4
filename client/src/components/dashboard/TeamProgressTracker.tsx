import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Flame, Lock, Trophy, Sparkles, X, Award, ChevronRight } from 'lucide-react';
import { TimelineDay } from '../../types';

interface TeamProgressTrackerProps {
  timeline: TimelineDay[];
  currentDayNumber: number;
}

export const TeamProgressTracker: React.FC<TeamProgressTrackerProps> = ({
  timeline,
  currentDayNumber,
}) => {
  const [selectedDay, setSelectedDay] = useState<TimelineDay | null>(null);

  // High scoring day threshold e.g. points >= 250 or winner
  const isHighScoring = (day: TimelineDay) => {
    return (day.status === 'Completed' && day.points >= 250) || day.winnerTeam === 'Cyber Circus Kings';
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-card border border-carnival-gold/30 shadow-2xl space-y-6 bg-gradient-to-r from-[#17142E]/90 to-[#120F24]/90 relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40">
              10-Day Carnival Sprint
            </span>
            <span className="text-xs font-mono text-slate-400">
              Completed: <strong className="text-emerald-400 font-bold">4/10 Days</strong>
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            🎪 Team Progress & Carnival Lights
          </h2>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Completed (✓)</span>
          </div>
          <div className="flex items-center gap-1.5 text-carnival-crimson">
            <Flame className="w-4 h-4 fill-carnival-crimson" />
            <span>High-Scorer (🔥)</span>
          </div>
        </div>
      </div>

      {/* Carnival Wire & 10 Lights Chain Grid */}
      <div className="relative pt-6 pb-2 px-2">
        {/* Wire Line passing behind bulbs */}
        <div className="absolute top-1/2 left-4 right-4 h-1 bg-gradient-to-r from-emerald-500 via-carnival-gold to-white/10 -translate-y-1/2 rounded-full hidden lg:block pointer-events-none" />

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3 relative z-10">
          {timeline.map((day) => {
            const isCompleted = day.status === 'Completed';
            const isCurrent = day.dayNumber === currentDayNumber;
            const isHighScore = isHighScoring(day);

            return (
              <motion.button
                key={day.dayNumber}
                whileHover={{ scale: 1.06, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(day)}
                className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all text-center relative overflow-hidden group min-h-[125px] ${
                  isCurrent
                    ? 'bg-carnival-crimson/25 border-carnival-crimson shadow-neon-crimson ring-2 ring-carnival-crimson/50'
                    : isCompleted
                    ? 'bg-[#152328]/80 border-emerald-500/40 shadow-neon-gold hover:border-emerald-400'
                    : 'bg-black/40 border-white/10 text-slate-500 opacity-70 hover:opacity-100'
                }`}
              >
                {/* Glowing Bulb Head */}
                <div className="relative mb-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                      isCurrent
                        ? 'bg-carnival-crimson text-white shadow-neon-crimson animate-pulse ring-4 ring-carnival-crimson/30'
                        : isCompleted
                        ? isHighScore
                          ? 'bg-gradient-to-tr from-amber-500 to-carnival-gold text-slate-950 shadow-neon-gold'
                          : 'bg-emerald-500 text-slate-950 shadow-neon-cyan'
                        : 'bg-white/10 text-slate-400'
                    }`}
                  >
                    {isCompleted ? (
                      isHighScore ? (
                        <Flame className="w-5 h-5 fill-slate-950" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-slate-950" />
                      )
                    ) : isCurrent ? (
                      <span className="font-mono">D{day.dayNumber}</span>
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  {/* High score flame badge indicator top-right */}
                  {isCompleted && isHighScore && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-carnival-crimson text-[10px]">
                      🔥
                    </span>
                  )}
                </div>

                {/* Day Info */}
                <div className="space-y-0.5">
                  <div className="text-[11px] font-mono font-bold text-white uppercase">
                    Day {day.dayNumber}
                  </div>
                  <div className="text-[9px] font-mono text-slate-400 truncate max-w-[80px]">
                    {day.date}
                  </div>
                </div>

                {/* Status Indicator Pill */}
                <div className="mt-2 w-full">
                  {isCurrent ? (
                    <span className="block w-full py-0.5 text-[9px] font-mono font-bold rounded-full bg-carnival-crimson/30 text-carnival-crimson border border-carnival-crimson/40">
                      LIVE NOW
                    </span>
                  ) : isCompleted ? (
                    <span className="block w-full py-0.5 text-[9px] font-mono font-bold rounded-full bg-emerald-500/20 text-emerald-300">
                      +{day.points} PTS
                    </span>
                  ) : (
                    <span className="block w-full py-0.5 text-[9px] font-mono text-slate-400 rounded-full bg-white/5">
                      Locked
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Modal / Drawer */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 rounded-2xl bg-black/60 border border-white/15 relative space-y-3"
          >
            <button
              onClick={() => setSelectedDay(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/10 text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/30">
                DAY {selectedDay.dayNumber} • {selectedDay.date}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-carnival-cyan/20 text-carnival-cyan">
                {selectedDay.type}
              </span>
              {isHighScoring(selectedDay) && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-carnival-crimson/20 text-carnival-crimson flex items-center gap-1">
                  🔥 High-Scoring Arena Victory
                </span>
              )}
            </div>

            <h3 className="text-xl font-extrabold text-white">{selectedDay.title}</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-3xl">
              {selectedDay.description}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-4 text-xs font-mono border-t border-white/10">
              <div>
                <span className="text-slate-400">Total Available Points:</span>{' '}
                <strong className="text-carnival-gold">{selectedDay.points} PTS</strong>
              </div>
              {selectedDay.winnerTeam && (
                <div className="flex items-center gap-1.5 text-carnival-gold">
                  <Trophy className="w-4 h-4 text-carnival-gold" />
                  <span>Day Winner: <strong>{selectedDay.winnerTeam}</strong></span>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
