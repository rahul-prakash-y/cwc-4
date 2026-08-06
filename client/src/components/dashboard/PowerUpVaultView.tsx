import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Shield,
  Sparkles,
  Lock,
  CheckCircle2,
  Clock,
  RotateCcw,
  Coins,
  Lightbulb,
  Gift,
  HelpCircle,
  Flame,
  Award,
  Star,
  ChevronRight
} from 'lucide-react';
import { AdvantageItem } from './TopBarBanner';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

export interface CollectableCardData {
  id: string;
  key: 'doublePoints' | 'extraTime' | 'skipQuestion' | 'goldenCoin' | 'hintCard' | 'bonusQuestion' | 'immunity';
  name: string;
  rarity: 'EPIC MULTIPLIER' | 'RARE CHRONO' | 'LEGENDARY PASS' | 'MYTHIC TREASURE' | 'SECRET CLUE' | 'BONUS TICKET' | 'DIVINE SHIELD';
  icon: string;
  LucideIcon: React.ElementType;
  themeColor: string; // Tailored gradient/glow
  borderGlow: string;
  badgeBg: string;
  description: string;
  benefit: string;
}

const CARNIVAL_CARDS: CollectableCardData[] = [
  {
    id: 'card-double-points',
    key: 'doublePoints',
    name: 'Double Points',
    rarity: 'EPIC MULTIPLIER',
    icon: '⚡',
    LucideIcon: Zap,
    themeColor: 'from-amber-500/20 via-rose-500/20 to-purple-900/40',
    borderGlow: 'border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.3)]',
    badgeBg: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
    description: 'Doubles all score points earned for your team on today’s task submission.',
    benefit: '2x Total Points Multiplier',
  },
  {
    id: 'card-extra-time',
    key: 'extraTime',
    name: 'Extra Time',
    rarity: 'RARE CHRONO',
    icon: '⏳',
    LucideIcon: Clock,
    themeColor: 'from-cyan-500/20 via-blue-600/20 to-slate-900/40',
    borderGlow: 'border-cyan-400/60 shadow-[0_0_25px_rgba(6,182,212,0.3)]',
    badgeBg: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/40',
    description: 'Extends the submission deadline by an additional 45 minutes without late penalty.',
    benefit: '+45 Mins Deadline Boost',
  },
  {
    id: 'card-skip-question',
    key: 'skipQuestion',
    name: 'Skip Question',
    rarity: 'LEGENDARY PASS',
    icon: '⏭️',
    LucideIcon: RotateCcw,
    themeColor: 'from-purple-500/20 via-indigo-600/20 to-slate-900/40',
    borderGlow: 'border-purple-400/60 shadow-[0_0_25px_rgba(168,85,247,0.3)]',
    badgeBg: 'bg-purple-400/20 text-purple-300 border-purple-400/40',
    description: 'Bypasses 1 mandatory bonus query or requirement without losing completion marks.',
    benefit: 'Pass 1 Tough Constraint',
  },
  {
    id: 'card-golden-coin',
    key: 'goldenCoin',
    name: 'Golden Coin',
    rarity: 'MYTHIC TREASURE',
    icon: '🪙',
    LucideIcon: Coins,
    themeColor: 'from-yellow-400/25 via-amber-600/20 to-yellow-950/40',
    borderGlow: 'border-yellow-400/70 shadow-[0_0_30px_rgba(234,179,8,0.4)]',
    badgeBg: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/40',
    description: 'Redeemable for +100 bonus instant score points or special carnival privilege.',
    benefit: '+100 Instant Arena Score',
  },
  {
    id: 'card-hint-card',
    key: 'hintCard',
    name: 'Hint Card',
    rarity: 'SECRET CLUE',
    icon: '💡',
    LucideIcon: Lightbulb,
    themeColor: 'from-emerald-500/20 via-teal-600/20 to-slate-900/40',
    borderGlow: 'border-emerald-400/60 shadow-[0_0_25px_rgba(16,185,129,0.3)]',
    badgeBg: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
    description: 'Unlocks a direct architectural hint & code scaffold snippet from judges.',
    benefit: 'Direct Solution Blueprint',
  },
  {
    id: 'card-bonus-question',
    key: 'bonusQuestion',
    name: 'Bonus Question',
    rarity: 'BONUS TICKET',
    icon: '🎁',
    LucideIcon: Gift,
    themeColor: 'from-pink-500/20 via-rose-600/20 to-slate-900/40',
    borderGlow: 'border-pink-400/60 shadow-[0_0_25px_rgba(244,63,94,0.3)]',
    badgeBg: 'bg-pink-400/20 text-pink-300 border-pink-400/40',
    description: 'Unlocks a high-yield bonus side quest to earn up to +150 additional score.',
    benefit: 'Unlock Side Quest (+150 PTS)',
  },
];

interface PowerUpVaultViewProps {
  advantages?: AdvantageItem[];
  inventory?: {
    doublePoints?: number;
    extraTime?: number;
    skipQuestion?: number;
    goldenCoin?: number;
    hintCard?: number;
    bonusQuestion?: number;
    immunity?: number;
  };
  onActivateAdvantage?: (id: string, name: string) => void;
  streak?: number;
}

export const PowerUpVaultView: React.FC<PowerUpVaultViewProps> = ({
  advantages = [],
  inventory,
  onActivateAdvantage,
  streak = 4,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'unlocked' | 'locked'>('all');
  const [activeUsedCards, setActiveUsedCards] = useState<Record<string, boolean>>({
    'card-double-points': true, // Mock 1 active card
  });

  // Helper to determine quantity owned for a card
  const getCardQuantity = (card: CollectableCardData): number => {
    if (inventory && inventory[card.key] !== undefined) {
      return inventory[card.key] || 0;
    }
    // Fallback search in advantages prop
    const match = advantages.find(
      (a) => a.name.toLowerCase().includes(card.name.toLowerCase()) ||
             a.id.includes(card.key)
    );
    if (match) {
      return match.status === 'used' ? 0 : 1;
    }
    // Mock default for demonstration (Double Points & Hint Card unlocked)
    if (card.key === 'doublePoints') return 2;
    if (card.key === 'hintCard') return 1;
    if (card.key === 'goldenCoin') return 1;
    return 0;
  };

  const handleUseCard = (card: CollectableCardData) => {
    triggerCarnivalConfetti();
    setActiveUsedCards((prev) => ({ ...prev, [card.id]: true }));
    if (onActivateAdvantage) {
      onActivateAdvantage(card.id, card.name);
    }
  };

  const totalUnlockedCount = CARNIVAL_CARDS.reduce(
    (count, card) => (getCardQuantity(card) > 0 ? count + 1 : count),
    0
  );

  const filteredCards = CARNIVAL_CARDS.filter((card) => {
    const qty = getCardQuantity(card);
    if (filterMode === 'unlocked') return qty > 0;
    if (filterMode === 'locked') return qty === 0;
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 sm:p-8 rounded-3xl glass-card border border-carnival-gold/30 shadow-2xl space-y-8 bg-[#120F24]/95 relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-carnival-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-carnival-purple/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6 relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3.5 py-1 rounded-full text-xs font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 flex items-center gap-1.5 shadow-neon-gold">
              <Zap className="w-3.5 h-3.5 fill-carnival-gold" />
              <span>COLLECTABLE CARNIVAL CARDS</span>
            </span>
            <span className="text-xs font-mono text-slate-300 bg-white/5 px-3 py-1 rounded-full border border-white/10">
              Active Streak: <strong className="text-carnival-gold">{streak} Days 🔥</strong>
            </span>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              Vault Collection: <strong>{totalUnlockedCount} / 6 Unlocked 🏆</strong>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Team Advantages & Power-Up Vault
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl">
            Collect special carnival task cards granted by Admins or earned via Arena Streaks. Activate them during submissions to multiply scores or bypass constraints.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/50 border border-white/10">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-carnival-gold text-slate-950 shadow-neon-gold font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Cards ({CARNIVAL_CARDS.length})
          </button>
          <button
            onClick={() => setFilterMode('unlocked')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              filterMode === 'unlocked'
                ? 'bg-emerald-400 text-slate-950 shadow-neon-cyan font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Unlocked ({totalUnlockedCount})
          </button>
          <button
            onClick={() => setFilterMode('locked')}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
              filterMode === 'locked'
                ? 'bg-purple-500 text-white shadow-neon-purple font-extrabold'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Locked ({CARNIVAL_CARDS.length - totalUnlockedCount})
          </button>
        </div>
      </div>

      {/* Special Immunity Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/60 via-[#102334] to-slate-900/80 border border-carnival-cyan/40 shadow-neon-cyan flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-carnival-cyan/20 text-carnival-cyan border border-carnival-cyan/40 shadow-lg">
            <Shield className="w-7 h-7 fill-carnival-cyan/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-white text-base sm:text-lg">
                Team Immunity Shield Status
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                PASSPORT SHIELD
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Protects your team from rank demotion or eviction during Danger Zone evaluations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 font-mono text-xs font-bold flex items-center gap-2 shadow-neon-cyan">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            IMMUNITY ACTIVE 🛡️
          </span>
        </div>
      </div>

      {/* Collectable Carnival Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredCards.map((card) => {
            const qty = getCardQuantity(card);
            const isUnlocked = qty > 0;
            const isActivated = !!activeUsedCards[card.id];

            return (
              <motion.div
                key={card.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={isUnlocked ? { y: -6, transition: { duration: 0.2 } } : {}}
                className={`relative rounded-3xl p-6 border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  isUnlocked
                    ? `bg-gradient-to-b ${card.themeColor} ${card.borderGlow} backdrop-blur-md`
                    : 'bg-black/60 border-white/10 opacity-70 filter grayscale'
                }`}
                style={{
                  filter: isUnlocked ? 'none' : 'grayscale(100%) opacity(0.65)',
                }}
              >
                {/* Carnival Watermark Icon */}
                <span className="absolute -right-6 -bottom-6 text-8xl opacity-10 pointer-events-none select-none">
                  {card.icon}
                </span>

                {/* Top Card Badge & Lock Status */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-mono font-extrabold tracking-wider border uppercase flex items-center gap-1 ${
                        isUnlocked ? card.badgeBg : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      <card.LucideIcon className="w-3 h-3" />
                      {card.rarity}
                    </span>

                    {/* Quantity Badge */}
                    {isUnlocked ? (
                      <span className="px-3 py-1 rounded-full text-xs font-mono font-black bg-carnival-gold text-slate-950 shadow-neon-gold">
                        OWNED: x{qty}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    )}
                  </div>

                  {/* Card Main Icon & Title */}
                  <div className="flex items-center gap-3.5 mb-3">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border shadow-inner ${
                        isUnlocked
                          ? 'bg-black/40 border-white/20'
                          : 'bg-black/80 border-white/10'
                      }`}
                    >
                      {card.icon}
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white tracking-wide">
                        {card.name}
                      </h3>
                      <span className="text-xs font-mono font-bold text-carnival-gold block">
                        {card.benefit}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-300 leading-relaxed min-h-[48px]">
                    {card.description}
                  </p>
                </div>

                {/* Card Action Button / Footer */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  {isUnlocked ? (
                    isActivated ? (
                      <div className="w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold text-center border border-emerald-500/40 flex items-center justify-center gap-2 shadow-neon-cyan">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>APPLIED TO CURRENT ARENA SUBMISSION</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleUseCard(card)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-carnival-gold via-amber-400 to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Zap className="w-4 h-4 fill-slate-950" />
                        <span>USE {card.name.toUpperCase()} CARD</span>
                      </button>
                    )
                  ) : (
                    <div className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 font-mono text-xs text-center flex items-center justify-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                      <span>UNCLAIMED IN VAULT (0 INVENTORY)</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
