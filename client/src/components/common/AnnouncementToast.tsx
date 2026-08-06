import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X, Sparkles, Volume2 } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export interface AnnouncementPayload {
  message: string;
  pinned?: boolean;
  author?: string;
  timestamp?: string;
}

/**
 * Plays a bright 4-note Web Audio synthesized carnival horn fanfare.
 */
export function playCarnivalHornSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    // Carnival Fanfare brass notes: C5, E5, G5, C6
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const noteTimes = [0, 0.1, 0.2, 0.32];
    const noteDurations = [0.12, 0.12, 0.12, 0.4];

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Sawtooth waveform gives a bright brass/horn timbre
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + noteTimes[idx]);

      gain.gain.setValueAtTime(0, ctx.currentTime + noteTimes[idx]);
      gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + noteTimes[idx] + 0.02);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        ctx.currentTime + noteTimes[idx] + noteDurations[idx]
      );

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + noteTimes[idx]);
      osc.stop(ctx.currentTime + noteTimes[idx] + noteDurations[idx]);
    });
  } catch (err) {
    console.warn('AudioContext playback prevented or not supported:', err);
  }
}

export const AnnouncementToast: React.FC = () => {
  const { socket } = useSocket();
  const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementPayload | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewAnnouncement = (data: AnnouncementPayload) => {
      console.log('📢 [Socket.io] NEW_ANNOUNCEMENT Received:', data);
      setActiveAnnouncement(data);

      // Play synthesized carnival horn sound effect
      playCarnivalHornSound();

      // Auto-dismiss after 8 seconds
      const timer = setTimeout(() => {
        setActiveAnnouncement(null);
      }, 8000);

      return () => clearTimeout(timer);
    };

    socket.on('NEW_ANNOUNCEMENT', handleNewAnnouncement);

    return () => {
      socket.off('NEW_ANNOUNCEMENT', handleNewAnnouncement);
    };
  }, [socket]);

  return (
    <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full pointer-events-none">
      <AnimatePresence>
        {activeAnnouncement && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="pointer-events-auto p-5 rounded-2xl bg-[#1A1435]/95 border-2 border-carnival-gold shadow-2xl backdrop-blur-xl relative overflow-hidden text-white"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-carnival-gold/15 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-start justify-between gap-3 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-carnival-gold to-amber-500 text-slate-950 flex items-center justify-center font-bold shadow-neon-gold flex-shrink-0 animate-bounce">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>CARNIVAL ANNOUNCEMENT</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3 text-emerald-400" />
                      <span>Sound ON</span>
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-white mt-1">
                    {activeAnnouncement.author || 'Carnival Admin 🎪'}
                  </h4>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setActiveAnnouncement(null)}
                className="p-1.5 rounded-lg bg-white/10 text-slate-400 hover:text-white hover:bg-white/20 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Announcement Message Body */}
            <p className="mt-3 text-sm text-slate-200 font-medium leading-relaxed bg-black/40 p-3 rounded-xl border border-white/10">
              {activeAnnouncement.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
