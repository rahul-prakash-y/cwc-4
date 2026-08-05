import React from 'react';
import { Crown, Trophy, Sparkles, Flame, Award, Star } from 'lucide-react';
import { useGrandFinale } from '../../context/GrandFinaleContext';

export const ChampionBanner: React.FC = () => {
  const { isGrandFinale } = useGrandFinale();

  if (!isGrandFinale) return null;

  return (
    <div className="relative overflow-hidden mb-8 rounded-3xl bg-gradient-to-r from-amber-950 via-yellow-900/90 to-amber-950 border-2 border-yellow-500/80 shadow-[0_0_50px_rgba(234,179,8,0.4)] p-6 sm:p-8">
      {/* Background Animated Glare */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent animate-pulse pointer-events-none" />

      {/* Top Gold Light Bulbs */}
      <div className="absolute top-2 left-0 right-0 flex justify-between px-6 opacity-80 pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <span
            key={i}
            className="w-2.5 h-2.5 rounded-full bg-yellow-300 shadow-[0_0_12px_#fde047] animate-ping"
            style={{ animationDelay: `${i * 0.15}s`, animationDuration: '1.8s' }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left Section - Trophy & Crown */}
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-300 to-amber-600 p-1 shadow-2xl flex-shrink-0 animate-bounce">
            <div className="w-full h-full rounded-[14px] bg-black/90 flex flex-col items-center justify-center border border-yellow-400">
              <Crown className="w-10 h-10 text-yellow-400 filter drop-shadow-[0_0_12px_#fde047]" />
              <span className="text-[10px] font-black text-amber-300 font-mono tracking-widest">SEASON 4</span>
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>OFFICIAL GRAND FINALE ARENA</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-100 uppercase tracking-tight flex items-center gap-2">
              <span>GRAND FINALE CHAMPIONSHIP</span>
              <Trophy className="w-8 h-8 text-yellow-400 inline" />
            </h1>
            <p className="text-xs sm:text-sm text-amber-200/90 max-w-xl font-medium mt-1">
              The ultimate carnival coding battle has reached its climax! Celebrating our extraordinary champions, record scores, and legendary code sculptors.
            </p>
          </div>
        </div>

        {/* Right Section - Leader Podiums Badge */}
        <div className="w-full lg:w-auto glass-card p-4 rounded-2xl border-yellow-500/50 bg-black/50 backdrop-blur-xl flex flex-wrap items-center justify-around gap-4 min-w-[280px]">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-yellow-400 text-xs font-bold font-mono">
              <Award className="w-3.5 h-3.5" /> 1ST PLACE
            </div>
            <div className="text-sm font-extrabold text-white">Cyber Circus Kings</div>
            <div className="text-[11px] text-amber-400 font-mono font-bold">980 PTS • CHAMPION</div>
          </div>
          <div className="h-8 w-px bg-yellow-500/30 hidden sm:block" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-slate-300 text-xs font-bold font-mono">
              <Star className="w-3.5 h-3.5 text-slate-300" /> 2ND PLACE
            </div>
            <div className="text-sm font-extrabold text-white">Neon Code Strikers</div>
            <div className="text-[11px] text-slate-300 font-mono font-bold">945 PTS</div>
          </div>
          <div className="h-8 w-px bg-yellow-500/30 hidden sm:block" />
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-amber-600 text-xs font-bold font-mono">
              <Flame className="w-3.5 h-3.5 text-amber-600" /> 3RD PLACE
            </div>
            <div className="text-sm font-extrabold text-white">Quantum Jargons</div>
            <div className="text-[11px] text-amber-500 font-mono font-bold">910 PTS</div>
          </div>
        </div>
      </div>

      {/* Marquee Ticker */}
      <div className="mt-4 pt-3 border-t border-yellow-500/30 overflow-hidden relative">
        <div className="flex items-center gap-6 whitespace-nowrap font-mono text-xs text-yellow-300 animate-marquee">
          <span className="flex items-center gap-2">🏆 GRAND FINALE IS LIVE</span>
          <span>•</span>
          <span className="flex items-center gap-2">✨ CERTIFICATES GENERATED</span>
          <span>•</span>
          <span className="flex items-center gap-2">🔥 FINAL LEADERBOARD LOCKED</span>
          <span>•</span>
          <span className="flex items-center gap-2">🎪 CODE WITH CURIOUS SEASON 4</span>
          <span>•</span>
          <span className="flex items-center gap-2">🏆 GRAND FINALE IS LIVE</span>
        </div>
      </div>
    </div>
  );
};
