import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Trophy,
  AlertOctagon,
  X,
  Loader2,
} from 'lucide-react';

export type TeamStatus = 'Safe' | 'Danger' | 'Eliminated' | 'Qualified';

interface EliminationControlsProps {
  teamId: string;
  teamName: string;
  currentStatus: TeamStatus | string;
  onStatusChange: (teamId: string, newStatus: TeamStatus) => void;
  compact?: boolean; // If true, renders pill-style buttons (for table rows)
}

interface ConfirmModal {
  open: boolean;
  teamId: string;
  teamName: string;
  action: TeamStatus;
}

const STATUS_CONFIG: Record<
  TeamStatus,
  { label: string; emoji: string; icon: React.ElementType; activeClass: string; hoverClass: string }
> = {
  Safe: {
    label: 'Safe',
    emoji: '✅',
    icon: CheckCircle2,
    activeClass: 'bg-emerald-500 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    hoverClass: 'hover:bg-emerald-500/20 hover:text-emerald-300 hover:border-emerald-500/60',
  },
  Danger: {
    label: 'Danger',
    emoji: '⚠️',
    icon: AlertTriangle,
    activeClass: 'bg-orange-500 text-slate-950 shadow-[0_0_12px_rgba(249,115,22,0.6)] animate-pulse',
    hoverClass: 'hover:bg-orange-500/20 hover:text-orange-300 hover:border-orange-500/60',
  },
  Eliminated: {
    label: 'Eliminated',
    emoji: '💀',
    icon: XCircle,
    activeClass: 'bg-rose-600 text-white shadow-[0_0_16px_rgba(220,38,38,0.7)]',
    hoverClass: 'hover:bg-rose-500/20 hover:text-rose-300 hover:border-rose-500/60',
  },
  Qualified: {
    label: 'Qualified',
    emoji: '🏆',
    icon: Trophy,
    activeClass:
      'bg-gradient-to-r from-blue-500 to-amber-400 text-slate-950 shadow-[0_0_16px_rgba(250,204,21,0.6)]',
    hoverClass: 'hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-500/60',
  },
};

// ─── Internal Confirmation Modal ──────────────────────────────────────────────

interface EliminationConfirmModalProps {
  modal: ConfirmModal;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

const EliminationConfirmModal: React.FC<EliminationConfirmModalProps> = ({
  modal,
  onConfirm,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.88, opacity: 0, y: 30 }}
        transition={{ type: 'spring', stiffness: 340, damping: 28 }}
        className="glass-card border border-rose-500/60 rounded-2xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(220,38,38,0.4)] space-y-6 relative"
      >
        {/* Close */}
        <button
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="w-20 h-20 rounded-2xl bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(220,38,38,0.3)]">
            💀
          </div>
          <div>
            <h3 className="text-2xl font-black text-white">Confirm Elimination</h3>
            <p className="text-slate-400 text-sm mt-1">This action cannot be undone lightly.</p>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/30 text-sm text-slate-200 leading-relaxed space-y-2">
          <p>
            You are about to <strong className="text-rose-400">eliminate</strong> team:
          </p>
          <p className="text-lg font-extrabold text-white font-mono">🎪 {modal.teamName}</p>
          <p className="text-slate-400 text-xs">
            This will immediately lock their dashboard, disable all submissions, and broadcast a
            real-time <code className="text-rose-300">STATUS_CHANGED</code> event to their session.
          </p>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
          <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Please confirm with your co-organizer before eliminating a team. A status email
            will be dispatched automatically to the team leader.
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 font-bold text-sm hover:bg-white/10 transition-all"
          >
            Cancel — Keep Active
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-700 to-rose-500 text-white font-black text-sm shadow-[0_0_16px_rgba(220,38,38,0.5)] hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4" />
            )}
            {loading ? 'Eliminating...' : '💀 Confirm Elimination'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Main EliminationControls ─────────────────────────────────────────────────

export const EliminationControls: React.FC<EliminationControlsProps> = ({
  teamId,
  teamName,
  currentStatus,
  onStatusChange,
  compact = false,
}) => {
  const [confirmModal, setConfirmModal] = useState<ConfirmModal>({
    open: false,
    teamId: '',
    teamName: '',
    action: 'Eliminated',
  });

  const handleButtonClick = (status: TeamStatus) => {
    if (status === 'Eliminated') {
      // Gate the destructive action behind a confirmation modal
      setConfirmModal({ open: true, teamId, teamName, action: 'Eliminated' });
    } else {
      onStatusChange(teamId, status);
    }
  };

  const handleConfirmElimination = async () => {
    onStatusChange(confirmModal.teamId, 'Eliminated');
    setConfirmModal((prev) => ({ ...prev, open: false }));
  };

  if (compact) {
    // ── Compact pill-row for table/scoresheet use ──────────────────────────
    return (
      <>
        <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-black/40 border border-white/5">
          {(Object.keys(STATUS_CONFIG) as TeamStatus[]).map((status) => {
            const cfg = STATUS_CONFIG[status];
            const Icon = cfg.icon;
            const isActive = currentStatus === status;
            return (
              <button
                key={status}
                id={`elim-ctrl-${teamId}-${status.toLowerCase()}`}
                onClick={() => handleButtonClick(status)}
                title={`Mark ${status}`}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-all flex items-center gap-1 border ${
                  isActive
                    ? cfg.activeClass
                    : `text-slate-400 border-transparent ${cfg.hoverClass}`
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{cfg.label}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {confirmModal.open && (
            <EliminationConfirmModal
              modal={confirmModal}
              onConfirm={handleConfirmElimination}
              onClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
            />
          )}
        </AnimatePresence>
      </>
    );
  }

  // ── Full Card layout for dedicated panel use ──────────────────────────────
  return (
    <>
      <div className="p-4 rounded-2xl glass-card border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
          <AlertOctagon className="w-4 h-4 text-rose-400" />
          <span>Team Status Controls</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(STATUS_CONFIG) as TeamStatus[]).map((status) => {
            const cfg = STATUS_CONFIG[status];
            const Icon = cfg.icon;
            const isActive = currentStatus === status;
            return (
              <button
                key={status}
                id={`elim-ctrl-full-${teamId}-${status.toLowerCase()}`}
                onClick={() => handleButtonClick(status)}
                className={`px-3 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 border ${
                  isActive
                    ? `${cfg.activeClass} border-transparent`
                    : `bg-white/5 text-slate-400 border-white/10 ${cfg.hoverClass}`
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>
                  {cfg.emoji} {cfg.label}
                </span>
              </button>
            );
          })}
        </div>

        {currentStatus && STATUS_CONFIG[currentStatus as TeamStatus] && (
          <div className="text-center text-xs font-mono text-slate-400">
            Current:{' '}
            <span className="font-bold text-white">{currentStatus}</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {confirmModal.open && (
          <EliminationConfirmModal
            modal={confirmModal}
            onConfirm={handleConfirmElimination}
            onClose={() => setConfirmModal((prev) => ({ ...prev, open: false }))}
          />
        )}
      </AnimatePresence>
    </>
  );
};
