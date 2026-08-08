import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Clock, FastForward, Coins, Lightbulb, Gift, CheckCircle2, Lock, Sparkles, AlertCircle } from 'lucide-react';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

export type AdvantageState = 'Active' | 'Available' | 'Used' | 'Locked';

export interface AdvantageCard {
  id: string;
  name: string;
  type: 'Double Points' | 'Extra Time' | 'Skip Question' | 'Golden Coin' | 'Hint Card' | 'Bonus Question';
  icon: string;
  description: string;
  state: AdvantageState;
  color: string; // Tailored glow color accent
}

interface AdvantagesLockerProps {
  onApplyAdvantage?: (advantageId: string, advantageType: string) => void;
  activeTaskId?: string;
}

export const AdvantagesLocker: React.FC<AdvantagesLockerProps> = ({
  onApplyAdvantage,
  activeTaskId,
}) => {
  const [cards, setCards] = useState<AdvantageCard[]>([
    {
      id: 'adv-double-points',
      name: 'Double Points Multiplier',
      type: 'Double Points',
      icon: '⚡',
      description: 'Doubles all score points awarded for your next task submission.',
      state: 'Available',
      color: 'from-amber-500 to-yellow-400',
    },
    {
      id: 'adv-extra-time',
      name: 'Extra Time Extension',
      type: 'Extra Time',
      icon: '⏳',
      description: 'Extends your task submission countdown timer by +30 minutes.',
      state: 'Active',
      color: 'from-cyan-500 to-blue-400',
    },
    {
      id: 'adv-skip-question',
      name: 'Skip Question Pass',
      type: 'Skip Question',
      icon: '⏭️',
      description: 'Pass 1 troublesome sprint question without point deduction.',
      state: 'Available',
      color: 'from-purple-500 to-indigo-400',
    },
    {
      id: 'adv-golden-coin',
      name: 'Golden Coin Surge',
      type: 'Golden Coin',
      icon: '🪙',
      description: 'Grants 150 instant bonus points straight to total team score.',
      state: 'Used',
      color: 'from-emerald-500 to-teal-400',
    },
    {
      id: 'adv-hint-card',
      name: 'Hint Clue Card',
      type: 'Hint Card',
      icon: '💡',
      description: 'Reveals 1 architectural hint or hidden solution clue.',
      state: 'Available',
      color: 'from-rose-500 to-pink-400',
    },
    {
      id: 'adv-bonus-question',
      name: 'Bonus Question Challenge',
      type: 'Bonus Question',
      icon: '🎁',
      description: 'Unlocks a secret bonus mini-game worth +300 bonus points.',
      state: 'Locked',
      color: 'from-[#8A2BE2] to-[#DA70D6]',
    },
  ]);

  const [notification, setNotification] = useState<string | null>(null);

  const handleApply = (card: AdvantageCard) => {
    if (card.state !== 'Available') return;

    triggerCarnivalConfetti();
    setCards((prev) =>
      prev.map((c) => (c.id === card.id ? { ...c, state: 'Active' as AdvantageState } : c))
    );

    setNotification(`Successfully Applied ${card.name}! 🔥`);
    setTimeout(() => setNotification(null), 4000);

    if (onApplyAdvantage) {
      onApplyAdvantage(card.id, card.type);
    }
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-200 dark:border-carnival-gold/30 shadow-sm dark:shadow-2xl space-y-6 bg-white/90 dark:bg-gradient-to-r dark:from-[#17132B]/95 dark:via-[#131128]/95 dark:to-[#1E1736]/95 relative overflow-hidden">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 dark:bg-carnival-gold/20 text-amber-700 dark:text-carnival-gold border border-amber-500/30 dark:border-carnival-gold/40 shadow-sm dark:shadow-neon-gold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-amber-500 dark:fill-carnival-gold" /> POWER-UP LOCKER
            </span>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">Collectable Carnival Cards</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">
            Interactive Advantages Locker
          </h2>
        </div>

        {notification && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-xs font-mono font-bold flex items-center gap-2 shadow-sm dark:shadow-neon-gold"
          >
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{notification}</span>
          </motion.div>
        )}
      </div>

      {/* Grid of 6 Collectable Carnival Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => {
          const isActive = card.state === 'Active';
          const isAvailable = card.state === 'Available';
          const isUsed = card.state === 'Used';
          const isLocked = card.state === 'Locked';

          return (
            <motion.div
              key={card.id}
              whileHover={{ y: -5, scale: 1.02 }}
              className={`p-6 rounded-3xl border flex flex-col justify-between space-y-4 relative overflow-hidden transition-all duration-300 ${
                isActive
                  ? 'bg-amber-50 dark:bg-gradient-to-b dark:from-[#2B1F3D]/90 dark:to-[#151226]/90 border-amber-400 dark:border-carnival-gold shadow-md dark:shadow-neon-gold ring-2 ring-amber-400/40 dark:ring-carnival-gold/40'
                  : isAvailable
                  ? 'bg-cyan-50 dark:bg-gradient-to-b dark:from-[#1C1836]/90 dark:to-[#120F24]/90 border-cyan-300 dark:border-carnival-cyan/40 hover:border-cyan-500 dark:hover:border-carnival-cyan shadow-sm dark:shadow-neon-cyan'
                  : isUsed
                  ? 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 opacity-70'
                  : 'bg-slate-100 dark:bg-black/60 border-slate-200 dark:border-white/5 filter grayscale opacity-60'
              }`}
            >
              {/* Card Badge Top */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-3xl p-2 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center">
                  {card.icon}
                </span>

                {/* State Badge */}
                {isActive && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 flex items-center gap-1 shadow-sm dark:shadow-neon-gold animate-pulse">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> ACTIVE
                  </span>
                )}
                {isAvailable && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-100 dark:bg-carnival-cyan/20 text-cyan-700 dark:text-carnival-cyan border border-cyan-300 dark:border-carnival-cyan/40">
                    UNLOCKED
                  </span>
                )}
                {isUsed && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400">
                    USED
                  </span>
                )}
                {isLocked && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-200 dark:bg-white/5 text-slate-500 border border-slate-300 dark:border-white/10 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> LOCKED
                  </span>
                )}
              </div>

              {/* Card Information */}
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">{card.name}</h3>
                <span className="text-[11px] font-mono text-amber-700 dark:text-carnival-gold font-semibold uppercase tracking-wider block">
                  {card.type}
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1">
                  {card.description}
                </p>
              </div>

              {/* Action Button */}
              <div>
                {isAvailable ? (
                  <button
                    onClick={() => handleApply(card)}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-md dark:shadow-neon-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4 fill-white" />
                    <span>Apply Advantage</span>
                  </button>
                ) : isActive ? (
                  <div className="w-full py-2.5 px-4 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-xs font-mono font-bold flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Advantage Applied to Task</span>
                  </div>
                ) : isUsed ? (
                  <div className="w-full py-2.5 px-4 rounded-2xl bg-slate-200 dark:bg-white/5 text-slate-600 dark:text-slate-400 text-xs font-mono text-center">
                    Already Used This Season
                  </div>
                ) : (
                  <div className="w-full py-2.5 px-4 rounded-2xl bg-slate-200 dark:bg-white/5 text-slate-500 text-xs font-mono text-center flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Requires Streak Level 5</span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
