import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Shield, Sparkles, Flame, CheckCircle2, Lock, Award, HelpCircle } from 'lucide-react';
import { AdvantageItem } from './TopBarBanner';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

interface PowerUpVaultViewProps {
  advantages: AdvantageItem[];
  onActivateAdvantage: (id: string) => void;
  streak: number;
}

export const PowerUpVaultView: React.FC<PowerUpVaultViewProps> = ({
  advantages,
  onActivateAdvantage,
  streak,
}) => {
  const handleActivate = (id: string) => {
    triggerCarnivalConfetti();
    onActivateAdvantage(id);
  };

  const vaultPerks = [
    {
      title: '2x Double Point Multiplier',
      icon: '⚡',
      type: 'Multiplier',
      requirement: 'Unlocked at 3-Day Streak',
      description: 'Doubles all points awarded for today’s submitted Daily Arena Task.',
      status: advantages.find((a) => a.id === 'adv-1')?.status || 'ready',
      id: 'adv-1',
    },
    {
      title: 'Immunity Shield Ticket',
      icon: '🛡️',
      type: 'Shield',
      requirement: 'Earned via Boss Fight Victory',
      description: 'Shields your team from points deduction if 1 daily quiz sprint is missed.',
      status: advantages.find((a) => a.id === 'adv-2')?.status || 'ready',
      id: 'adv-2',
    },
    {
      title: 'Golden Hint Wheel',
      icon: '🎡',
      type: 'Hint',
      requirement: 'Earned on Day 3',
      description: 'Grants access to 1 direct architectural clue during Boss Fight challenges.',
      status: advantages.find((a) => a.id === 'adv-3')?.status || 'used',
      id: 'adv-3',
    },
    {
      title: 'Time Extension Hourglass',
      icon: '⏳',
      type: 'Bonus',
      requirement: 'Unlocked at 7-Day Streak',
      description: 'Extends submission window by 1 extra hour for 1 task.',
      status: 'locked',
      id: 'adv-4',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 sm:p-8 rounded-3xl glass-card border border-carnival-gold/30 shadow-2xl space-y-8 bg-[#131128]/95 relative overflow-hidden"
    >
      {/* Background Decorative Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-carnival-gold/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 flex items-center gap-1.5 shadow-neon-gold">
              <Zap className="w-3.5 h-3.5 fill-carnival-gold" />
              <span>CARNIVAL POWER-UP VAULT</span>
            </span>
            <span className="text-xs font-mono text-slate-400">
              Active Streak: <strong className="text-carnival-crimson">{streak} Days 🔥</strong>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Equip & Deploy Team Advantages
          </h2>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/40 border border-white/10 text-xs font-mono">
          <Sparkles className="w-4 h-4 text-carnival-gold animate-bounce" />
          <span className="text-slate-300">
            Card Multipliers Stack with <strong className="text-white">Early Bird Speed Bonuses</strong>!
          </span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {vaultPerks.map((perk) => {
          const isActive = perk.status === 'active';
          const isReady = perk.status === 'ready';
          const isUsed = perk.status === 'used';
          const isLocked = perk.status === 'locked';

          return (
            <div
              key={perk.title}
              className={`p-6 rounded-2xl border transition-all relative flex flex-col justify-between space-y-4 ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-950/60 to-[#121E23] border-emerald-500/50 shadow-neon-cyan'
                  : isReady
                  ? 'bg-gradient-to-r from-[#241E11]/80 to-[#17142E] border-carnival-gold/40 shadow-neon-gold hover:border-carnival-gold'
                  : isUsed
                  ? 'bg-black/40 border-white/10 opacity-75'
                  : 'bg-black/60 border-white/5 opacity-50'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl p-2 rounded-xl bg-white/10 border border-white/10">
                      {perk.icon}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-white">{perk.title}</h3>
                      <span className="text-[11px] font-mono text-carnival-gold block">
                        {perk.requirement}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div>
                    {isActive ? (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE NOW
                      </span>
                    ) : isReady ? (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40">
                        READY TO USE
                      </span>
                    ) : isUsed ? (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-slate-400">
                        EXHAUSTED
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/5 text-slate-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {perk.description}
                </p>
              </div>

              {/* Action Button */}
              <div>
                {isReady && (
                  <button
                    onClick={() => handleActivate(perk.id)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-carnival-gold to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-gold hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    Deploy Power-Up Card Now ⚡
                  </button>
                )}
                {isActive && (
                  <div className="w-full py-2.5 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold text-center border border-emerald-500/40">
                    ✓ Currently Applied to Today’s Task
                  </div>
                )}
                {isUsed && (
                  <div className="w-full py-2.5 rounded-xl bg-white/5 text-slate-400 font-mono text-xs text-center">
                    Used on Previous Task Round
                  </div>
                )}
                {isLocked && (
                  <div className="w-full py-2.5 rounded-xl bg-white/5 text-slate-500 font-mono text-xs text-center flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5" /> Reach 7-Day Streak to Unlock
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
