import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Zap,
  Award,
  Sparkles,
  Flame,
  Calculator,
  ChevronRight,
  TrendingUp,
  Calendar,
  Layers,
} from 'lucide-react';

export interface DailyMarksRecord {
  day: number;
  adv: number; // Advantage / Bonus Points
  main: number; // Main Task Score
  special: number; // Special Task Score
  total: number; // adv + main + special
  notes?: string;
}

interface MarksSectionProps {
  records?: DailyMarksRecord[];
}

const DEFAULT_MOCK_RECORDS: DailyMarksRecord[] = [
  { day: 1, adv: 50, main: 300, special: 50, total: 400, notes: 'Day 1 Kickoff Sprint' },
  { day: 2, adv: 100, main: 350, special: 0, total: 450, notes: '2x Multiplier Perk Applied' },
  { day: 3, adv: 0, main: 250, special: 100, total: 350, notes: 'Special Trivia Challenge' },
  { day: 4, adv: 75, main: 400, special: 50, total: 525, notes: 'Arena Rapid Fire' },
  { day: 5, adv: 50, main: 380, special: 50, total: 480, notes: 'WebSocket Boss Fight' },
];

export const MarksSection: React.FC<MarksSectionProps> = ({ records = DEFAULT_MOCK_RECORDS }) => {
  const [filterDay, setFilterDay] = useState<number | 'all'>('all');

  // Overall totals calculation
  const totalAdv = records.reduce((sum, r) => sum + (r.adv || 0), 0);
  const totalMain = records.reduce((sum, r) => sum + (r.main || 0), 0);
  const totalSpecial = records.reduce((sum, r) => sum + (r.special || 0), 0);
  const grandTotal = records.reduce((sum, r) => sum + (r.total || (r.adv + r.main + r.special)), 0);

  const filteredRecords = filterDay === 'all' ? records : records.filter((r) => r.day === filterDay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 sm:p-8 rounded-3xl glass-card border border-carnival-gold/30 shadow-2xl space-y-6 relative overflow-hidden bg-gradient-to-b from-[#18132B]/95 via-[#130E24]/95 to-[#0F0A1D]/95"
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-carnival-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 flex items-center gap-1.5 shadow-neon-gold">
              <Calculator className="w-3.5 h-3.5" />
              <span>CARNIVAL SCORE BREAKDOWN</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
            Daywise Marks Breakdown 📊
          </h2>
          <p className="text-xs text-slate-300">
            Daily arena performance breakdown across Advantage, Main Task, and Special Task points
          </p>
        </div>

        {/* Day Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setFilterDay('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition ${
              filterDay === 'all'
                ? 'bg-carnival-gold text-slate-950 font-black shadow-neon-gold'
                : 'bg-black/40 text-slate-400 border border-white/10 hover:text-white'
            }`}
          >
            All Days
          </button>
          {records.map((r) => (
            <button
              key={r.day}
              onClick={() => setFilterDay(r.day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition ${
                filterDay === r.day
                  ? 'bg-carnival-gold text-slate-950 font-black shadow-neon-gold'
                  : 'bg-black/40 text-slate-400 border border-white/10 hover:text-white'
              }`}
            >
              Day {r.day}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Highlight Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Advantage Points */}
        <div className="p-4 rounded-2xl bg-black/40 border border-carnival-purple/40 shadow-neon-purple space-y-1">
          <div className="text-[11px] font-mono text-carnival-purple font-bold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> ADVANTAGE (ADV)
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalAdv.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400">Bonus & Perk Boosts</div>
        </div>

        {/* Metric 2: Main Task Points */}
        <div className="p-4 rounded-2xl bg-black/40 border border-carnival-cyan/40 shadow-neon-cyan space-y-1">
          <div className="text-[11px] font-mono text-carnival-cyan font-bold flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> MAIN TASK (MAIN)
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalMain.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400">Core Sprint Submissions</div>
        </div>

        {/* Metric 3: Special Task Points */}
        <div className="p-4 rounded-2xl bg-black/40 border border-carnival-crimson/40 shadow-neon-crimson space-y-1">
          <div className="text-[11px] font-mono text-carnival-crimson font-bold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> SPECIAL TASK
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalSpecial.toLocaleString()}</div>
          <div className="text-[10px] text-slate-400">Trivia & Side Quests</div>
        </div>

        {/* Metric 4: Grand Cumulative Score */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-carnival-gold/20 to-amber-500/20 border border-carnival-gold/60 shadow-neon-gold space-y-1">
          <div className="text-[11px] font-mono text-carnival-gold font-bold flex items-center gap-1">
            <Award className="w-3.5 h-3.5" /> CUMULATIVE TOTAL
          </div>
          <div className="text-2xl font-black text-white font-mono">{grandTotal.toLocaleString()}</div>
          <div className="text-[10px] text-amber-300/80 font-bold">Overall Squad Total</div>
        </div>
      </div>

      {/* Carnival Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-3">
              <th className="py-2 px-4">Day</th>
              <th className="py-2 px-4 text-center">Advantage Points (adv)</th>
              <th className="py-2 px-4 text-center">Main Task Score (main)</th>
              <th className="py-2 px-4 text-center">Special Task Score (special)</th>
              <th className="py-2 px-4 text-right">Day Total (total)</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.map((r) => {
              const dayTotal = r.total || (r.adv + r.main + r.special);
              return (
                <tr
                  key={r.day}
                  className="bg-black/40 hover:bg-white/5 border border-white/10 rounded-2xl text-sm transition font-mono"
                >
                  {/* Day Badge Cell */}
                  <td className="py-3.5 px-4 rounded-l-2xl whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 flex items-center justify-center font-bold text-xs">
                        D{r.day}
                      </div>
                      <div>
                        <div className="font-bold text-white text-xs">Day {r.day} Sprint</div>
                        {r.notes && <div className="text-[10px] text-slate-400">{r.notes}</div>}
                      </div>
                    </div>
                  </td>

                  {/* Advantage Points */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-carnival-purple/20 text-carnival-purple border border-carnival-purple/40 font-bold text-xs">
                      +{r.adv}
                    </span>
                  </td>

                  {/* Main Task Score */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-carnival-cyan/20 text-carnival-cyan border border-carnival-cyan/40 font-bold text-xs">
                      +{r.main}
                    </span>
                  </td>

                  {/* Special Task Score */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-carnival-crimson/20 text-carnival-crimson border border-carnival-crimson/40 font-bold text-xs">
                      +{r.special}
                    </span>
                  </td>

                  {/* Day Total */}
                  <td className="py-3.5 px-4 rounded-r-2xl text-right">
                    <div className="font-black text-base text-carnival-gold">
                      {dayTotal.toLocaleString()} <span className="text-[10px] text-slate-400 font-sans">PTS</span>
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Overall Total Calculation Footer Row */}
            <tr className="bg-gradient-to-r from-carnival-gold/20 via-black/60 to-carnival-gold/20 border-2 border-carnival-gold/60 rounded-2xl text-sm font-mono font-bold">
              <td className="py-4 px-4 rounded-l-2xl text-white font-extrabold">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-carnival-gold" />
                  <span>OVERALL TOTAL</span>
                </div>
              </td>
              <td className="py-4 px-4 text-center text-carnival-purple font-black text-base">
                +{totalAdv.toLocaleString()}
              </td>
              <td className="py-4 px-4 text-center text-carnival-cyan font-black text-base">
                +{totalMain.toLocaleString()}
              </td>
              <td className="py-4 px-4 text-center text-carnival-crimson font-black text-base">
                +{totalSpecial.toLocaleString()}
              </td>
              <td className="py-4 px-4 rounded-r-2xl text-right text-carnival-gold font-black text-xl shadow-neon-gold">
                {grandTotal.toLocaleString()} <span className="text-xs text-amber-300/80 font-sans">PTS</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default MarksSection;
