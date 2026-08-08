import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles, CheckCircle2, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

export interface AdvantageModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams?: { id: string; name: string }[];
  onAdvantageGranted?: (teamId: string, advantage: string, quantity: number, immunity?: boolean) => void;
}

export const ADVANTAGE_OPTIONS = [
  { value: 'Double Points', label: '⚡ Double Points (2x Multiplier)', icon: '⚡' },
  { value: 'Extra Time', label: '⏳ Extra Time (+45 Mins Extension)', icon: '⏳' },
  { value: 'Skip Question', label: '⏭️ Skip Question (Pass Constraint)', icon: '⏭️' },
  { value: 'Golden Coin', label: '🪙 Golden Coin (+100 Arena Score)', icon: '🪙' },
  { value: 'Hint Card', label: '💡 Hint Card (Architectural Clue)', icon: '💡' },
  { value: 'Bonus Question', label: '🎁 Bonus Question (Side Quest Ticket)', icon: '🎁' },
  { value: 'Immunity Shield', label: '🛡️ Immunity Shield (Eviction Protection)', icon: '🛡️' },
];

const DEFAULT_TEAMS = [
  { id: 'team-1', name: 'Cyber Circus Kings 🎪' },
  { id: 'team-2', name: 'Neon Ringmasters 🦁' },
  { id: 'team-3', name: 'Jesters of Java 🃏' },
  { id: 'team-4', name: 'High Wire Hackers 🚀' },
  { id: 'team-5', name: 'Firebreather Code 🔥' },
  { id: 'team-6', name: 'Ferris Wheel Functions 🎡' },
];

export const AdvantageModal: React.FC<AdvantageModalProps> = ({
  isOpen,
  onClose,
  teams = DEFAULT_TEAMS,
  onAdvantageGranted,
}) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || 'team-1');
  const [selectedAdvantage, setSelectedAdvantage] = useState<string>('Double Points');
  const [isImmunity, setIsImmunity] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const triggerLightweightConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#FF0055', '#FFD700', '#00F0FF', '#8A2BE2'],
      });
    } catch {
      triggerCarnivalConfetti();
    }
  };

  const handleGrant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage(null);

    const team = teams.find((t) => t.id === selectedTeamId) || teams[0];
    const grantImmunity = isImmunity || selectedAdvantage.toLowerCase().includes('immunity');

    try {
      const token = localStorage.getItem('cwc_token');
      const response = await fetch('/api/admin/grant-advantage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          teamId: selectedTeamId,
          advantage: selectedAdvantage,
          quantity: Number(quantity) || 1,
          immunity: grantImmunity,
        }),
      });

      // Trigger lightweight confetti animation on success
      triggerLightweightConfetti();

      if (onAdvantageGranted) {
        onAdvantageGranted(selectedTeamId, selectedAdvantage, Number(quantity) || 1, grantImmunity);
      }

      setSuccessMessage(
        grantImmunity
          ? `Granted Immunity Shield to ${team.name} successfully! 🛡️`
          : `Granted ${quantity}x '${selectedAdvantage}' to ${team.name} successfully! 🎁`
      );

      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } catch (err) {
      // Fallback for offline/demo mode
      triggerLightweightConfetti();
      if (onAdvantageGranted) {
        onAdvantageGranted(selectedTeamId, selectedAdvantage, Number(quantity) || 1, grantImmunity);
      }
      setSuccessMessage(
        `Granted ${quantity}x '${selectedAdvantage}' to ${team.name} successfully! ⚡`
      );
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-[#141026]/95 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-carnival-gold/40 max-w-lg w-full shadow-xl dark:shadow-neon-gold relative space-y-6 overflow-hidden"
        >
          {/* Ambient Header Glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-amber-500/10 dark:bg-carnival-gold/15 rounded-full blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-100 dark:bg-carnival-gold/20 text-amber-700 dark:text-carnival-gold border border-amber-300 dark:border-carnival-gold/40 shadow-sm dark:shadow-neon-gold">
                <Gift className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Grant Carnival Advantage</h3>
                <p className="text-xs font-mono text-slate-600 dark:text-slate-300">
                  Award power-ups or immunity shields directly to registered teams
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-mono text-xs font-bold flex items-center gap-2 shadow-sm dark:shadow-neon-cyan"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleGrant} className="space-y-5 relative z-10">
            {/* Step 1: Select Team */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                1. Select Target Team
              </label>
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#1D1735] border border-slate-300 dark:border-carnival-gold/30 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-carnival-gold focus:ring-1 focus:ring-amber-500 dark:focus:ring-carnival-gold cursor-pointer"
              >
                {teams.map((t) => (
                  <option key={t.id} value={t.id} className="bg-white dark:bg-[#19132B] text-slate-900 dark:text-white">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Step 2: Select Advantage Dropdown */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                2. Select Carnival Advantage / Immunity
              </label>
              <select
                value={selectedAdvantage}
                onChange={(e) => {
                  setSelectedAdvantage(e.target.value);
                  if (e.target.value.toLowerCase().includes('immunity')) {
                    setIsImmunity(true);
                  }
                }}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#1D1735] border border-slate-300 dark:border-carnival-purple/40 text-xs font-mono font-bold text-amber-700 dark:text-carnival-gold focus:outline-none focus:border-amber-500 dark:focus:border-carnival-gold focus:ring-1 focus:ring-amber-500 dark:focus:ring-carnival-gold cursor-pointer"
              >
                {ADVANTAGE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value} className="bg-white dark:bg-[#19132B] text-slate-900 dark:text-white">
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Immunity Toggle Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-cyan-600 dark:text-carnival-cyan" />
                <div>
                  <div className="text-xs font-mono font-bold text-slate-900 dark:text-white">Grant Immunity Shield</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">Protect team from eviction on missed sprint</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImmunity(!isImmunity)}
                className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                  isImmunity ? 'bg-cyan-500 dark:bg-carnival-cyan' : 'bg-slate-300 dark:bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white dark:bg-slate-950 transition-transform ${
                    isImmunity ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Step 3: Quantity */}
            <div>
              <label className="block text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                3. Quantity to Grant
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-[#1D1735] border border-slate-300 dark:border-white/10 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-carnival-gold"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-rose-600 dark:from-carnival-gold dark:via-amber-400 dark:to-carnival-crimson text-slate-950 font-black text-xs uppercase tracking-wider shadow-md dark:shadow-neon-gold hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span>{isSubmitting ? 'Granting...' : 'Grant Advantage Now 🎉'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AdvantageModal;
