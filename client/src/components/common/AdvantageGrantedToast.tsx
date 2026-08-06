import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, X, Sparkles, Volume2, Shield } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { playCarnivalHornSound } from './AnnouncementToast';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

export interface AdvantageGrantedPayload {
  teamId: string;
  teamName: string;
  advantage: string;
  quantity: number;
  immunity?: boolean;
  timestamp?: string;
}

interface AdvantageGrantedToastProps {
  onAdvantageReceived?: (payload: AdvantageGrantedPayload) => void;
}

export const AdvantageGrantedToast: React.FC<AdvantageGrantedToastProps> = ({
  onAdvantageReceived,
}) => {
  const { socket } = useSocket();
  const [activeGrant, setActiveGrant] = useState<AdvantageGrantedPayload | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleAdvantageGranted = (data: AdvantageGrantedPayload) => {
      console.log('🎁 [Socket.io] ADVANTAGE_GRANTED Event Received:', data);
      setActiveGrant(data);

      // Play synthesized carnival horn / bell sound
      playCarnivalHornSound();

      // Trigger visual confetti burst on screen
      triggerCarnivalConfetti();

      if (onAdvantageReceived) {
        onAdvantageReceived(data);
      }

      // Auto-dismiss after 9 seconds
      const timer = setTimeout(() => {
        setActiveGrant(null);
      }, 9000);

      return () => clearTimeout(timer);
    };

    socket.on('ADVANTAGE_GRANTED', handleAdvantageGranted);
    socket.on('STATUS_CHANGED', (data: any) => {
      if (data.advantage) {
        handleAdvantageGranted(data);
      }
    });

    return () => {
      socket.off('ADVANTAGE_GRANTED', handleAdvantageGranted);
    };
  }, [socket, onAdvantageReceived]);

  return (
    <div className="fixed top-24 right-4 sm:right-8 z-50 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {activeGrant && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 450, damping: 25 }}
            className="pointer-events-auto p-5 rounded-3xl bg-[#1D1438]/95 border-2 border-carnival-gold shadow-neon-gold backdrop-blur-xl relative overflow-hidden text-white"
          >
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-carnival-gold/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-carnival-gold via-amber-400 to-carnival-crimson text-slate-950 flex items-center justify-center font-bold shadow-neon-gold flex-shrink-0 animate-bounce">
                  {activeGrant.immunity ? <Shield className="w-6 h-6 fill-slate-950" /> : <Gift className="w-6 h-6 fill-slate-950" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 fill-carnival-gold" />
                      <span>POWER-UP GRANTED!</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3" />
                      <span>Carnival Bell 🔔</span>
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white mt-1">
                    Team: {activeGrant.teamName || 'Your Team'}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => setActiveGrant(null)}
                className="p-1.5 rounded-xl bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grant Details Body */}
            <div className="mt-3.5 p-3.5 rounded-2xl bg-black/50 border border-carnival-gold/30 text-xs font-mono text-slate-200 space-y-1">
              <div className="flex items-center justify-between text-carnival-gold font-bold">
                <span>Advantage: {activeGrant.advantage}</span>
                <span className="px-2 py-0.5 rounded bg-carnival-gold/20 text-carnival-gold text-[10px]">
                  +{activeGrant.quantity || 1} Unit
                </span>
              </div>
              {activeGrant.immunity && (
                <div className="text-emerald-400 text-[11px] font-bold flex items-center gap-1 pt-1">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Immunity Shield Protection Active! 🛡️</span>
                </div>
              )}
              <p className="text-[10px] text-slate-400 pt-1">
                Admin awarded power-up perk! Check your Team Locker to apply on active tasks.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvantageGrantedToast;
