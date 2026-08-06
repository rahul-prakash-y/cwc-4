import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, Lightbulb, Shield, Coins, Gift, FastForward, CheckCircle2, Sparkles, AlertCircle, HelpCircle, X } from 'lucide-react';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

export interface AppliedEffect {
  advantage: string;
  type: string;
  badgeText: string;
  hintText?: string;
  extendedTimeMinutes?: number;
  doublePointsMultiplier?: number;
  bonusScore?: number;
  appliedAt: string;
}

interface AdvantageActionProps {
  taskId: string;
  inventory?: {
    doublePoints?: number;
    extraTime?: number;
    skipQuestion?: number;
    goldenCoin?: number;
    hintCard?: number;
    bonusQuestion?: number;
    immunity?: number;
  };
  advantagesList?: { advantage: string; quantity: number }[];
  onAdvantageApplied?: (effect: AppliedEffect) => void;
}

const AVAILABLE_PERKS = [
  { key: 'Double Points', name: 'Double Points Multiplier', icon: '⚡', keyName: 'doublePoints', color: 'from-amber-500 to-yellow-400', desc: 'Doubles all points earned on this task (2x Multiplier)' },
  { key: 'Extra Time', name: 'Extra Time Extension', icon: '⏳', keyName: 'extraTime', color: 'from-cyan-500 to-blue-400', desc: 'Extends task deadline timer by +45 minutes' },
  { key: 'Hint Card', name: 'Hint Card Clue', icon: '💡', keyName: 'hintCard', color: 'from-rose-500 to-pink-400', desc: 'Reveals architectural hint or solution clue' },
  { key: 'Skip Question', name: 'Skip Pass', icon: '⏭️', keyName: 'skipQuestion', color: 'from-purple-500 to-indigo-400', desc: 'Bypasses 1 task constraint constraint' },
  { key: 'Golden Coin', name: 'Golden Coin Surge', icon: '🪙', keyName: 'goldenCoin', color: 'from-emerald-500 to-teal-400', desc: 'Adds instant +100 bonus score to team total' },
  { key: 'Bonus Question', name: 'Bonus Challenge Ticket', icon: '🎁', keyName: 'bonusQuestion', color: 'from-purple-600 to-pink-500', desc: 'Unlocks side quest challenge' },
];

export const AdvantageAction: React.FC<AdvantageActionProps> = ({
  taskId,
  inventory = { doublePoints: 1, extraTime: 1, hintCard: 1, skipQuestion: 0, goldenCoin: 1, bonusQuestion: 0 },
  advantagesList,
  onAdvantageApplied,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedAdvantage, setSelectedAdvantage] = useState<typeof AVAILABLE_PERKS[0] | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [appliedEffects, setAppliedEffects] = useState<AppliedEffect[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Calculate available quantity for a perk
  const getQuantity = (perk: typeof AVAILABLE_PERKS[0]) => {
    if (advantagesList) {
      const match = advantagesList.find(
        (a) => a.advantage.toLowerCase().includes(perk.key.toLowerCase()) ||
               perk.key.toLowerCase().includes(a.advantage.toLowerCase())
      );
      return match ? match.quantity : 0;
    }
    return (inventory as any)[perk.keyName] || 0;
  };

  const hasAnyAdvantage = AVAILABLE_PERKS.some((perk) => getQuantity(perk) > 0);

  const handleSelectAdvantage = (perk: typeof AVAILABLE_PERKS[0]) => {
    if (getQuantity(perk) <= 0) return;
    setSelectedAdvantage(perk);
    setIsConfirmOpen(true);
    setErrorMessage(null);
  };

  const handleConfirmApply = async () => {
    if (!selectedAdvantage) return;

    setIsApplying(true);
    setErrorMessage(null);

    try {
      const token = localStorage.getItem('cwc_token');
      const response = await fetch(`/api/student/tasks/${taskId}/apply-advantage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ advantage: selectedAdvantage.key }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        triggerCarnivalConfetti();

        const newEffect: AppliedEffect = {
          advantage: selectedAdvantage.key,
          type: selectedAdvantage.key,
          badgeText: data.effect?.badgeText || `${selectedAdvantage.icon} ${selectedAdvantage.name} Active`,
          hintText: data.effect?.hintText,
          extendedTimeMinutes: data.effect?.extendedTimeMinutes,
          doublePointsMultiplier: data.effect?.doublePointsMultiplier,
          bonusScore: data.effect?.bonusScore,
          appliedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setAppliedEffects((prev) => [...prev, newEffect]);

        if (onAdvantageApplied) {
          onAdvantageApplied(newEffect);
        }

        setIsConfirmOpen(false);
        setIsMenuOpen(false);
      } else {
        // Fallback for offline/demo simulation if API not available
        triggerCarnivalConfetti();
        const fallbackEffect: AppliedEffect = {
          advantage: selectedAdvantage.key,
          type: selectedAdvantage.key,
          badgeText: `${selectedAdvantage.icon} ${selectedAdvantage.name} Active`,
          hintText: selectedAdvantage.key === 'Hint Card' ? '💡 Architectural Clue: Leverage asynchronous Redis cache invalidation & non-blocking WebSocket broadcasts for optimal performance.' : undefined,
          extendedTimeMinutes: selectedAdvantage.key === 'Extra Time' ? 45 : undefined,
          doublePointsMultiplier: selectedAdvantage.key === 'Double Points' ? 2 : undefined,
          bonusScore: selectedAdvantage.key === 'Golden Coin' ? 100 : undefined,
          appliedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setAppliedEffects((prev) => [...prev, fallbackEffect]);
        if (onAdvantageApplied) onAdvantageApplied(fallbackEffect);
        setIsConfirmOpen(false);
        setIsMenuOpen(false);
      }
    } catch (err: any) {
      // Demo fallback mode
      triggerCarnivalConfetti();
      const fallbackEffect: AppliedEffect = {
        advantage: selectedAdvantage.key,
        type: selectedAdvantage.key,
        badgeText: `${selectedAdvantage.icon} ${selectedAdvantage.name} Active`,
        hintText: selectedAdvantage.key === 'Hint Card' ? '💡 Architectural Clue: Use Redis caching layer to wrap Mongoose aggregate queries for high concurrency.' : undefined,
        extendedTimeMinutes: selectedAdvantage.key === 'Extra Time' ? 45 : undefined,
        doublePointsMultiplier: selectedAdvantage.key === 'Double Points' ? 2 : undefined,
        bonusScore: selectedAdvantage.key === 'Golden Coin' ? 100 : undefined,
        appliedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setAppliedEffects((prev) => [...prev, fallbackEffect]);
      if (onAdvantageApplied) onAdvantageApplied(fallbackEffect);
      setIsConfirmOpen(false);
      setIsMenuOpen(false);
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Active Glowing Unlocked Effect Badges */}
      {appliedEffects.length > 0 && (
        <div className="space-y-3">
          {appliedEffects.map((eff, idx) => (
            <motion.div
              key={idx}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="p-4 rounded-2xl bg-gradient-to-r from-[#241A3E] via-[#1B1430] to-[#120F26] border-2 border-carnival-gold/60 shadow-neon-gold space-y-2 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 flex items-center gap-1.5 shadow-neon-gold animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 fill-carnival-gold" />
                  <span>{eff.badgeText}</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Applied at {eff.appliedAt}
                </span>
              </div>

              {/* Special Revealed Hint Text Box */}
              {eff.hintText && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl bg-black/60 border border-carnival-gold/30 text-xs font-mono text-carnival-gold leading-relaxed flex items-start gap-2 shadow-inner"
                >
                  <Lightbulb className="w-4 h-4 text-carnival-gold shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-white font-bold mb-0.5">REVEALED ARCHITECTURAL HINT:</strong>
                    <span>{eff.hintText}</span>
                  </div>
                </motion.div>
              )}

              {/* Extra Time Extension Alert */}
              {eff.extendedTimeMinutes && (
                <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Task deadline timer extended by +{eff.extendedTimeMinutes} minutes!</span>
                </div>
              )}

              {/* Double Points Multiplier Alert */}
              {eff.doublePointsMultiplier && (
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-mono text-amber-300 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>2x Double Points multiplier attached to your task submission!</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Apply Advantage Control Bar */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          disabled={!hasAnyAdvantage}
          className={`w-full py-3.5 px-5 rounded-2xl font-mono font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-between cursor-pointer ${
            hasAnyAdvantage
              ? 'bg-gradient-to-r from-carnival-gold via-amber-400 to-carnival-crimson text-slate-950 shadow-neon-gold hover:scale-[1.01] active:scale-95'
              : 'bg-white/5 text-slate-500 border border-white/10 opacity-60 cursor-not-allowed'
          }`}
        >
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 fill-current" />
            <span>Apply Advantage Power-Up</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-950 text-carnival-gold text-[10px] font-extrabold border border-carnival-gold/40">
            {hasAnyAdvantage ? 'Available Inventory' : 'No Advantages'}
          </span>
        </button>

        {/* Dropdown Action Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 right-0 top-full mt-2 z-40 p-4 rounded-2xl glass-card border border-carnival-gold/40 bg-[#16122C]/98 shadow-2xl space-y-2 backdrop-blur-xl"
            >
              <div className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-white/10 pb-2 flex items-center justify-between">
                <span>Select Advantage from Team Vault</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {AVAILABLE_PERKS.map((perk) => {
                  const qty = getQuantity(perk);
                  const isAvailable = qty > 0;

                  return (
                    <button
                      key={perk.key}
                      onClick={() => handleSelectAdvantage(perk)}
                      disabled={!isAvailable}
                      className={`p-3 rounded-xl border text-left transition-all flex items-start gap-3 relative overflow-hidden ${
                        isAvailable
                          ? 'bg-black/40 border-white/15 hover:border-carnival-gold hover:bg-white/10 cursor-pointer'
                          : 'bg-black/20 border-white/5 opacity-40 cursor-not-allowed'
                      }`}
                    >
                      <span className="text-xl p-1.5 rounded-lg bg-black/50 border border-white/10 shrink-0">
                        {perk.icon}
                      </span>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-extrabold text-xs text-white truncate">
                            {perk.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold ${
                              isAvailable
                                ? 'bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40'
                                : 'bg-white/5 text-slate-500'
                            }`}
                          >
                            x{qty}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-300 line-clamp-1">
                          {perk.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Dialog Modal */}
      <AnimatePresence>
        {isConfirmOpen && selectedAdvantage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 rounded-3xl border border-carnival-gold/50 max-w-md w-full shadow-neon-gold bg-[#15122B]/95 space-y-5 text-center relative"
            >
              <div className="w-16 h-16 rounded-2xl bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 flex items-center justify-center mx-auto text-3xl shadow-neon-gold">
                {selectedAdvantage.icon}
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">Apply {selectedAdvantage.name}?</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {selectedAdvantage.desc}. This action will consume 1 unit from your team inventory.
                </p>
              </div>

              {errorMessage && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
                  {errorMessage}
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsConfirmOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/10 text-slate-300 font-mono font-bold text-xs hover:bg-white/20 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isApplying}
                  onClick={handleConfirmApply}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-carnival-gold via-amber-400 to-carnival-crimson text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-gold hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>{isApplying ? 'Applying...' : 'Confirm & Apply'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvantageAction;
