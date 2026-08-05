import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Flame, Award, Zap, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

export interface AdvantageItem {
  id: string;
  name: string;
  icon: string;
  type: 'Multiplier' | 'Shield' | 'Hint' | 'Bonus';
  status: 'active' | 'ready' | 'used';
  description: string;
}

interface TopBarBannerProps {
  teamName: string;
  rank: number;
  totalScore: number;
  streak: number;
  advantages: AdvantageItem[];
  onActivateAdvantage: (id: string) => void;
}

export const TopBarBanner: React.FC<TopBarBannerProps> = ({
  teamName,
  rank,
  totalScore,
  streak,
  advantages,
  onActivateAdvantage,
}) => {
  const activeAdvantages = advantages.filter((a) => a.status === 'active');
  const readyAdvantages = advantages.filter((a) => a.status === 'ready');

  const handleActivate = (adv: AdvantageItem) => {
    triggerCarnivalConfetti();
    onActivateAdvantage(adv.id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 sm:p-8 rounded-3xl glass-card border border-carnival-gold/30 shadow-2xl relative overflow-hidden bg-gradient-to-r from-[#1A1838]/90 via-[#15132B]/90 to-[#1F1735]/90"
    >
      {/* Dynamic Background Glowing Orbs */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-carnival-gold/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-carnival-crimson/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        {/* Left Section: Welcome Header & Team Title */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 text-xs font-mono font-bold shadow-neon-gold">
              <Award className="w-3.5 h-3.5" />
              <span>CARNIVAL VIP TICKET #CWC4-8842</span>
            </span>

            {activeAdvantages.map((adv) => (
              <span
                key={adv.id}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-semibold animate-pulse"
              >
                <Sparkles className="w-3 h-3 text-emerald-400" />
                {adv.name} ACTIVE
              </span>
            ))}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight flex flex-wrap items-center gap-3">
            Welcome <span className="text-gradient-carnival">{teamName}</span> 🔥
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
            Private Student Arena • Track your daily boss fights, deploy power-up immunities, and climb the live carnival points leaderboard.
          </p>
        </div>

        {/* Right Section: Live Stats & Advantages Display */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 sm:gap-4 p-4 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-md">
            {/* Rank Stat */}
            <div className="text-center px-2 sm:px-4">
              <div className="text-[10px] sm:text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">
                Current Rank
              </div>
              <div className="text-2xl sm:text-3xl font-black text-carnival-gold font-mono flex items-center justify-center gap-1 mt-0.5">
                #{rank} <span className="text-lg">👑</span>
              </div>
            </div>

            {/* Total Score Stat */}
            <div className="text-center px-2 sm:px-4 border-x border-white/10">
              <div className="text-[10px] sm:text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">
                Total Score
              </div>
              <div className="text-2xl sm:text-3xl font-black text-carnival-cyan font-mono mt-0.5">
                {totalScore.toLocaleString()}
                <span className="text-xs text-carnival-cyan/80 ml-1 font-sans">PTS</span>
              </div>
            </div>

            {/* Daily Streak Stat */}
            <div className="text-center px-2 sm:px-4">
              <div className="text-[10px] sm:text-xs text-slate-400 font-mono font-semibold uppercase tracking-wider">
                Daily Streak
              </div>
              <div className="text-2xl sm:text-3xl font-black text-carnival-crimson font-mono flex items-center justify-center gap-1 mt-0.5">
                {streak}
                <Flame className="w-5 h-5 text-carnival-crimson fill-carnival-crimson animate-bounce" />
              </div>
            </div>
          </div>

          {/* Active / Ready Advantages Card */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 flex flex-col justify-between gap-2 min-w-[210px]">
            <div className="text-[11px] font-mono text-slate-300 font-bold uppercase flex items-center justify-between">
              <span className="flex items-center gap-1 text-carnival-gold">
                <Zap className="w-3.5 h-3.5 fill-carnival-gold" /> Active Advantages
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                {activeAdvantages.length + readyAdvantages.length} Total
              </span>
            </div>

            <div className="space-y-1.5 my-1">
              {advantages.map((adv) => (
                <div
                  key={adv.id}
                  className="flex items-center justify-between gap-2 text-xs p-1.5 rounded-lg bg-white/5 border border-white/5"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="text-sm">{adv.icon}</span>
                    <span className="font-semibold text-white truncate">{adv.name}</span>
                  </div>

                  {adv.status === 'active' ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 className="w-2.5 h-2.5" /> Active
                    </span>
                  ) : adv.status === 'ready' ? (
                    <button
                      onClick={() => handleActivate(adv)}
                      className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-carnival-gold text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-neon-gold"
                    >
                      Activate
                    </button>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-white/10 text-slate-400">
                      Used
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
