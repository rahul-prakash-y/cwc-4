import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Award,
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

export const MarksSection: React.FC<MarksSectionProps> = ({ records = [] }) => {
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
      className="p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-carnival-gold/30 shadow-sm dark:shadow-2xl space-y-6 relative overflow-hidden bg-white/90 dark:bg-[#120D24] dark:bg-gradient-to-b dark:from-[#18132B] dark:via-[#130E24] dark:to-[#0F0A1D]"
    >
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/5 dark:bg-carnival-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 dark:bg-carnival-gold/20 text-amber-700 dark:text-carnival-gold border border-amber-500/30 dark:border-carnival-gold/40 flex items-center gap-1.5 shadow-sm dark:shadow-neon-gold">
              <Calculator className="w-3.5 h-3.5" />
              <span>CARNIVAL SCORE BREAKDOWN</span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            Daywise Marks Breakdown 📊
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Daily arena performance breakdown across Advantage, Main Task, and Special Task points
          </p>
        </div>

        {/* Day Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setFilterDay('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition ${
              filterDay === 'all'
                ? 'bg-amber-500 dark:bg-carnival-gold text-white dark:text-slate-950 font-black shadow-sm dark:shadow-neon-gold'
                : 'bg-slate-100 dark:bg-[#17112C] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white'
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
                  ? 'bg-amber-500 dark:bg-carnival-gold text-white dark:text-slate-950 font-black shadow-sm dark:shadow-neon-gold'
                  : 'bg-slate-100 dark:bg-[#17112C] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Day {r.day}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Highlight Metric Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Metric: Grand Cumulative Score */}
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-gradient-to-r dark:from-[#291D03] dark:to-[#1A1202] border border-amber-300 dark:border-carnival-gold/60 shadow-sm dark:shadow-neon-gold space-y-1">
          <div className="text-xs font-mono text-amber-800 dark:text-carnival-gold font-bold flex items-center gap-1.5 uppercase">
            <Award className="w-4 h-4 text-amber-600 dark:text-carnival-gold" /> CUMULATIVE TOTAL MARKS
          </div>
          <div className="text-3xl font-black text-slate-900 dark:text-white font-mono">{grandTotal.toLocaleString()}</div>
          <div className="text-[11px] text-amber-700 dark:text-amber-300/80 font-bold">Overall Squad Total Score</div>
        </div>
      </div>

      {/* Carnival Breakdown Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2">
          <thead>
            <tr className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-3">
              <th className="py-2 px-4">Arena Day</th>
              <th className="py-2 px-4 text-right">Daywise Total Marks</th>
            </tr>
          </thead>
          <tbody>
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-8 text-center text-slate-500 dark:text-slate-400 font-mono text-xs">
                  No score records recorded yet for your team.
                </td>
              </tr>
            ) : (
              filteredRecords.map((r) => {
                const dayTotal = r.total || (r.adv + r.main + r.special);
                return (
                  <tr
                    key={r.day}
                    className="bg-slate-50 dark:bg-[#140E26] hover:bg-slate-100 dark:hover:bg-[#1C1436] border border-slate-200 dark:border-white/10 rounded-2xl text-sm transition font-mono"
                  >
                    {/* Day Badge Cell */}
                    <td className="py-3.5 px-4 rounded-l-2xl whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-carnival-gold/20 text-amber-700 dark:text-carnival-gold border border-amber-500/30 dark:border-carnival-gold/40 flex items-center justify-center font-black text-xs">
                          D{r.day}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs">Day {r.day} Sprint</div>
                          {r.notes && <div className="text-[10px] text-slate-500 dark:text-slate-400">{r.notes}</div>}
                        </div>
                      </div>
                    </td>

                    {/* Day Total Marks */}
                    <td className="py-3.5 px-4 rounded-r-2xl text-right">
                      <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500/10 dark:bg-carnival-gold/20 border border-amber-500/30 dark:border-carnival-gold/40">
                        <span className="font-black text-base text-amber-700 dark:text-carnival-gold">
                          {dayTotal.toLocaleString()}
                        </span>
                        <span className="text-[10px] text-slate-600 dark:text-slate-300 font-sans font-bold uppercase">
                          TOTAL MARKS
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}

            {/* Overall Total Calculation Footer Row */}
            <tr className="bg-amber-50 dark:bg-gradient-to-r dark:from-[#291D03] dark:via-[#140E26] dark:to-[#291D03] border-2 border-amber-300 dark:border-carnival-gold/60 rounded-2xl text-sm font-mono font-bold">
              <td className="py-4 px-4 rounded-l-2xl text-slate-900 dark:text-white font-extrabold">
                <div className="flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-amber-600 dark:text-carnival-gold" />
                  <span>CUMULATIVE TOTAL MARKS</span>
                </div>
              </td>
              <td className="py-4 px-4 rounded-r-2xl text-right text-amber-700 dark:text-carnival-gold font-black text-xl shadow-sm dark:shadow-neon-gold">
                {grandTotal.toLocaleString()} <span className="text-xs text-amber-700 dark:text-amber-300/80 font-sans">TOTAL MARKS</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default MarksSection;
