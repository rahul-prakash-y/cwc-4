import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Lock, CheckCircle2, ShieldAlert, Sparkles, Volume2 } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export interface BuzzerQueueItem {
  teamId: string;
  teamName: string;
  timestamp: number;
  reactionTimeMs: number;
}

export const BuzzerButton: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();

  const [buzzerState, setBuzzerState] = useState<'LOCKED' | 'COUNTDOWN' | 'UNLOCKED' | 'BUZZED'>('LOCKED');
  const [unlockTime, setUnlockTime] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number>(5);
  const [userQueuePosition, setUserQueuePosition] = useState<number | null>(null);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const teamId = user?.teamId || user?.id || 'guest-team';
  const teamName = user?.teamName || user?.name || 'Guest Team';

  // Sound effect generator using Web Audio API
  const playCarnivalBuzzerAudio = () => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Dual oscillator synth for rich carnival arcade buzzer sound
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'square';

      // Pitch sweep up for excited arcade feel
      osc1.frequency.setValueAtTime(350, ctx.currentTime);
      osc1.frequency.exponentialRampToValueAtTime(700, ctx.currentTime + 0.12);
      osc1.frequency.setValueAtTime(520, ctx.currentTime + 0.12);

      osc2.frequency.setValueAtTime(175, ctx.currentTime);
      osc2.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.4);
      osc2.stop(ctx.currentTime + 0.4);
    } catch (err) {
      console.warn('Audio synthesis failed:', err);
    }
  };

  // Sync state on socket connect / event listeners
  useEffect(() => {
    if (!socket) return;

    // Fetch initial state
    socket.emit('GET_BUZZER_STATE');

    const handleBuzzerState = (data: { buzzerUnlockTime: number | null; buzzerQueue: BuzzerQueueItem[] }) => {
      const { buzzerUnlockTime, buzzerQueue } = data;
      checkQueuePosition(buzzerQueue);

      if (buzzerUnlockTime && Date.now() < buzzerUnlockTime) {
        setUnlockTime(buzzerUnlockTime);
        setBuzzerState('COUNTDOWN');
      } else if (buzzerUnlockTime && Date.now() >= buzzerUnlockTime) {
        setUnlockTime(buzzerUnlockTime);
        const myIndex = buzzerQueue.findIndex((item) => item.teamId === teamId);
        if (myIndex !== -1) {
          setBuzzerState('BUZZED');
          setUserQueuePosition(myIndex + 1);
          setReactionTime(buzzerQueue[myIndex].reactionTimeMs);
        } else {
          setBuzzerState('UNLOCKED');
        }
      } else {
        setBuzzerState('LOCKED');
        setUnlockTime(null);
      }
    };

    const handleQuestionDisplayed = (data: { buzzerUnlockTime: number; questionId?: string }) => {
      setUnlockTime(data.buzzerUnlockTime);
      setUserQueuePosition(null);
      setReactionTime(null);
      setBuzzerState('COUNTDOWN');
      toast.success('🎯 QUESTION DISPLAYED! Buzzer unlocking in 5s!', { id: 'question-displayed-toast' });
    };

    const handleQueueUpdated = (queue: BuzzerQueueItem[]) => {
      checkQueuePosition(queue);
    };

    const handleBuzzerReset = () => {
      setBuzzerState('LOCKED');
      setUnlockTime(null);
      setUserQueuePosition(null);
      setReactionTime(null);
      toast('🔄 Buzzer reset by Admin', { id: 'buzzer-reset-toast' });
    };

    const handleBuzzerRejected = (data: { reason: string }) => {
      toast.error(data.reason || 'Buzzer hit rejected!');
      // Revert state if rejected
      if (unlockTime && Date.now() >= unlockTime) {
        setBuzzerState('UNLOCKED');
      } else {
        setBuzzerState('LOCKED');
      }
    };

    const handleBuzzerAccepted = (data: { position: number; entry: BuzzerQueueItem }) => {
      setBuzzerState('BUZZED');
      setUserQueuePosition(data.position);
      setReactionTime(data.entry.reactionTimeMs);
      toast.success(`⚡ BUZZED IN! Rank #${data.position} (${data.entry.reactionTimeMs}ms)`);
    };

    const checkQueuePosition = (queue: BuzzerQueueItem[]) => {
      const myIndex = queue.findIndex((item) => item.teamId === teamId);
      if (myIndex !== -1) {
        setBuzzerState('BUZZED');
        setUserQueuePosition(myIndex + 1);
        setReactionTime(queue[myIndex].reactionTimeMs);
      }
    };

    socket.on('BUZZER_STATE', handleBuzzerState);
    socket.on('QUESTION_DISPLAYED', handleQuestionDisplayed);
    socket.on('BUZZER_QUEUE_UPDATED', handleQueueUpdated);
    socket.on('BUZZER_RESET', handleBuzzerReset);
    socket.on('BUZZER_REJECTED', handleBuzzerRejected);
    socket.on('BUZZER_ACCEPTED', handleBuzzerAccepted);

    return () => {
      socket.off('BUZZER_STATE', handleBuzzerState);
      socket.off('QUESTION_DISPLAYED', handleQuestionDisplayed);
      socket.off('BUZZER_QUEUE_UPDATED', handleQueueUpdated);
      socket.off('BUZZER_RESET', handleBuzzerReset);
      socket.off('BUZZER_REJECTED', handleBuzzerRejected);
      socket.off('BUZZER_ACCEPTED', handleBuzzerAccepted);
    };
  }, [socket, teamId]);

  // High-precision local countdown timer
  useEffect(() => {
    if (!unlockTime || buzzerState === 'BUZZED') return;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = unlockTime - now;

      if (diff <= 0) {
        if (buzzerState === 'COUNTDOWN') {
          setBuzzerState('UNLOCKED');
          setSecondsLeft(0);
        }
      } else {
        const secs = Math.ceil(diff / 1000);
        setSecondsLeft(secs);
        setBuzzerState((prev) => (prev === 'BUZZED' ? 'BUZZED' : 'COUNTDOWN'));
      }
    }, 50);

    return () => clearInterval(interval);
  }, [unlockTime, buzzerState]);

  // Handle Buzzer Hit Click
  const handleBuzzerHit = () => {
    if (!socket || !isConnected) {
      toast.error('Socket disconnected! Cannot buzz.');
      return;
    }

    if (buzzerState !== 'UNLOCKED') {
      if (buzzerState === 'COUNTDOWN') {
        toast.error('🚫 Security Lock: Wait for countdown to reach zero!');
      }
      return;
    }

    // Play Carnival sound effect
    playCarnivalBuzzerAudio();

    // Optimistic UI update
    setBuzzerState('BUZZED');

    // Emit event to server
    socket.emit('STUDENT_BUZZER_HIT', {
      teamId,
      teamName,
    });
  };

  // Progress ring calculation (for 5 second timer)
  const countdownProgress = unlockTime ? Math.max(0, Math.min(100, ((unlockTime - Date.now()) / 5000) * 100)) : 100;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-slate-900/90 via-slate-950 to-black border border-carnival-gold/20 shadow-2xl overflow-hidden max-w-md mx-auto">
      {/* Background Carnival Glow Effects */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-carnival-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info */}
      <div className="w-full flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-carnival-gold animate-spin" />
          <span className="font-mono text-xs font-bold text-carnival-gold uppercase tracking-wider">
            RAPID FIRE BUZZER 🎪
          </span>
        </div>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-all ${
            soundEnabled
              ? 'border-carnival-gold/40 text-carnival-gold bg-carnival-gold/10'
              : 'border-slate-700 text-slate-500 bg-slate-800'
          }`}
          title="Toggle Buzzer Sound"
        >
          <Volume2 className="w-3.5 h-3.5" />
          <span className="font-mono text-[10px] uppercase font-bold">{soundEnabled ? 'SFX ON' : 'MUTED'}</span>
        </button>
      </div>

      {/* Team Badge */}
      <div className="mb-6 px-4 py-1.5 rounded-full glass-card border border-white/10 text-xs font-mono font-bold text-slate-300 z-10 text-center">
        TEAM: <span className="text-white font-extrabold">{teamName}</span>
      </div>

      {/* Massive Carnival Circular Buzzer Button */}
      <div className="relative group flex items-center justify-center my-4 z-10">
        {/* Glowing Outer Ring for UNLOCKED state */}
        {buzzerState === 'UNLOCKED' && (
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
            className="absolute -inset-4 rounded-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 blur-lg pointer-events-none opacity-80"
          />
        )}

        {/* Outer Circular Rim */}
        <div
          className={`relative p-4 rounded-full transition-all duration-300 ${
            buzzerState === 'UNLOCKED'
              ? 'bg-gradient-to-b from-red-500 via-rose-700 to-red-950 shadow-[0_0_50px_rgba(239,68,68,0.7)]'
              : buzzerState === 'BUZZED'
              ? 'bg-gradient-to-b from-emerald-600 via-teal-800 to-slate-950 shadow-[0_0_30px_rgba(16,185,129,0.5)]'
              : buzzerState === 'COUNTDOWN'
              ? 'bg-gradient-to-b from-amber-600 via-amber-800 to-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
              : 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border border-slate-700/50 opacity-80'
          }`}
        >
          {/* Circular Countdown SVG Ring */}
          <svg className="w-56 h-56 sm:w-64 sm:h-64 transform -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              className="stroke-slate-800 fill-none"
              strokeWidth="10"
            />
            {buzzerState === 'COUNTDOWN' && (
              <circle
                cx="50%"
                cy="50%"
                r="45%"
                className="stroke-amber-400 fill-none transition-all duration-100 ease-linear"
                strokeWidth="10"
                strokeDasharray="680"
                strokeDashoffset={(680 * (100 - countdownProgress)) / 100}
                strokeLinecap="round"
              />
            )}
          </svg>

          {/* Inner Interactive Buzzer Button */}
          <motion.button
            whileHover={buzzerState === 'UNLOCKED' ? { scale: 1.04 } : {}}
            whileTap={buzzerState === 'UNLOCKED' ? { scale: 0.93 } : {}}
            onClick={handleBuzzerHit}
            disabled={buzzerState !== 'UNLOCKED'}
            className={`absolute inset-4 rounded-full flex flex-col items-center justify-center transition-all duration-300 font-extrabold cursor-pointer select-none shadow-2xl border-4 ${
              buzzerState === 'UNLOCKED'
                ? 'bg-gradient-to-b from-red-500 via-rose-600 to-red-800 border-red-300 text-white shadow-[inset_0_4px_12px_rgba(255,255,255,0.4)] hover:brightness-110 active:shadow-inner'
                : buzzerState === 'BUZZED'
                ? 'bg-gradient-to-b from-emerald-500 via-teal-700 to-emerald-900 border-emerald-300 text-white shadow-inner cursor-not-allowed'
                : buzzerState === 'COUNTDOWN'
                ? 'bg-gradient-to-b from-amber-700 via-slate-800 to-slate-900 border-amber-500/50 text-amber-300 cursor-not-allowed'
                : 'bg-gradient-to-b from-slate-800 via-slate-900 to-black border-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {/* Button Icon & Dynamic Text Content */}
            <AnimatePresence mode="wait">
              {buzzerState === 'LOCKED' && (
                <motion.div
                  key="locked"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center gap-2"
                >
                  <Lock className="w-10 h-10 text-slate-500" />
                  <span className="text-sm font-mono tracking-wider uppercase">Wait for Question...</span>
                  <span className="text-[10px] font-mono text-slate-500 font-normal">Buzzer Locked</span>
                </motion.div>
              )}

              {buzzerState === 'COUNTDOWN' && (
                <motion.div
                  key="countdown"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center gap-1"
                >
                  <span className="text-4xl sm:text-5xl font-black text-amber-300 font-mono animate-pulse">
                    {secondsLeft}
                  </span>
                  <span className="text-xs font-mono font-bold text-amber-200 uppercase tracking-widest">
                    Unlocking in {secondsLeft}s...
                  </span>
                  <span className="text-[10px] font-mono text-amber-400/70 font-normal">Get Ready!</span>
                </motion.div>
              )}

              {buzzerState === 'UNLOCKED' && (
                <motion.div
                  key="unlocked"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1.1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center gap-1 text-center"
                >
                  <Zap className="w-12 h-12 text-yellow-300 fill-yellow-300 animate-bounce" />
                  <span className="text-4xl font-black tracking-widest text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                    BUZZ!
                  </span>
                  <span className="text-[11px] font-mono text-yellow-200 uppercase font-bold tracking-wider">
                    CLICK NOW!
                  </span>
                </motion.div>
              )}

              {buzzerState === 'BUZZED' && (
                <motion.div
                  key="buzzed"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex flex-col items-center gap-1 text-center"
                >
                  <CheckCircle2 className="w-10 h-10 text-emerald-300 animate-pulse" />
                  <span className="text-2xl font-black tracking-wider text-white">BUZZED!</span>
                  {userQueuePosition && (
                    <span className="text-xs font-mono font-extrabold text-emerald-200 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-400/40">
                      RANK #{userQueuePosition}
                    </span>
                  )}
                  {reactionTime !== null && (
                    <span className="text-[11px] font-mono text-emerald-300 font-semibold">
                      +{reactionTime}ms reaction
                    </span>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      {/* Footer Instructions / Status */}
      <div className="mt-4 text-center z-10">
        {buzzerState === 'UNLOCKED' && (
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>BUZZER IS ACTIVE - HIT TO LOCK IN YOUR SPOT!</span>
          </div>
        )}
        {buzzerState === 'LOCKED' && (
          <p className="text-[11px] font-mono text-slate-400">
            Admin will trigger question. Buzzer unlocks 5 seconds after question appears.
          </p>
        )}
        {buzzerState === 'COUNTDOWN' && (
          <p className="text-[11px] font-mono text-amber-300/80">
            5-second buffer active. Client-side early hits will be rejected by backend.
          </p>
        )}
        {buzzerState === 'BUZZED' && (
          <p className="text-[11px] font-mono text-emerald-400">
            Your hit is registered on server! Await admin response.
          </p>
        )}
      </div>
    </div>
  );
};
