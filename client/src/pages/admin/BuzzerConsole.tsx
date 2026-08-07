import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, RotateCcw, Flame, Trophy, Clock, Users, ShieldAlert, Sparkles, Zap, Award } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

export interface BuzzerQueueItem {
  teamId: string;
  teamName: string;
  timestamp: number;
  reactionTimeMs: number;
}

export const BuzzerConsole: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const [buzzerQueue, setBuzzerQueue] = useState<BuzzerQueueItem[]>([]);
  const [adminTimer, setAdminTimer] = useState<number | null>(null);
  const [buzzerUnlockTime, setBuzzerUnlockTime] = useState<number | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  // Sync state with socket server
  useEffect(() => {
    if (!socket) return;

    // Join admin-panel room if not already joined
    socket.emit('join-room', 'admin-panel');
    socket.emit('GET_BUZZER_STATE');

    const handleBuzzerState = (data: { buzzerUnlockTime: number | null; buzzerQueue: BuzzerQueueItem[] }) => {
      setBuzzerQueue(data.buzzerQueue || []);
      if (data.buzzerUnlockTime) {
        setBuzzerUnlockTime(data.buzzerUnlockTime);
      }
    };

    const handleQuestionDisplayed = (data: { buzzerUnlockTime: number }) => {
      setBuzzerUnlockTime(data.buzzerUnlockTime);
      setBuzzerQueue([]);
      toast.success('🎯 Question displayed! 5-second student countdown started.');
    };

    const handleQueueUpdated = (queue: BuzzerQueueItem[]) => {
      setBuzzerQueue(queue);
    };

    const handleBuzzerReset = () => {
      setBuzzerQueue([]);
      setBuzzerUnlockTime(null);
      setAdminTimer(null);
      setIsLive(false);
      toast('🔄 Buzzer reset successfully', { icon: '🔄' });
    };

    socket.on('BUZZER_STATE', handleBuzzerState);
    socket.on('QUESTION_DISPLAYED', handleQuestionDisplayed);
    socket.on('BUZZER_QUEUE_UPDATED', handleQueueUpdated);
    socket.on('BUZZER_RESET', handleBuzzerReset);

    return () => {
      socket.off('BUZZER_STATE', handleBuzzerState);
      socket.off('QUESTION_DISPLAYED', handleQuestionDisplayed);
      socket.off('BUZZER_QUEUE_UPDATED', handleQueueUpdated);
      socket.off('BUZZER_RESET', handleBuzzerReset);
    };
  }, [socket]);

  // High precision countdown for admin UI timer
  useEffect(() => {
    if (!buzzerUnlockTime) {
      setAdminTimer(null);
      setIsLive(false);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = buzzerUnlockTime - now;

      if (diff <= 0) {
        setAdminTimer(0);
        setIsLive(true);
      } else {
        setAdminTimer(Math.ceil(diff / 1000));
        setIsLive(false);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [buzzerUnlockTime]);

  // Admin Control: Show Question
  const handleShowQuestion = () => {
    if (!socket || !isConnected) {
      toast.error('Socket disconnected! Cannot broadcast question.');
      return;
    }

    socket.emit('ADMIN_START_QUESTION');
  };

  // Admin Control: Reset Buzzer
  const handleResetBuzzer = () => {
    if (!socket || !isConnected) {
      toast.error('Socket disconnected! Cannot reset buzzer.');
      return;
    }

    socket.emit('ADMIN_RESET_BUZZER');
  };

  // Helper for rank medal / badge formatting
  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          label: '🥇 1st Place',
          bg: 'from-amber-400 via-yellow-500 to-amber-600',
          text: 'text-slate-950 font-black',
          border: 'border-yellow-300',
          shadow: 'shadow-[0_0_20px_rgba(234,179,8,0.5)]',
        };
      case 1:
        return {
          label: '🥈 2nd Place',
          bg: 'from-slate-300 via-slate-400 to-slate-500',
          text: 'text-slate-950 font-black',
          border: 'border-slate-200',
          shadow: 'shadow-[0_0_15px_rgba(203,213,225,0.4)]',
        };
      case 2:
        return {
          label: '🥉 3rd Place',
          bg: 'from-amber-700 via-amber-800 to-amber-900',
          text: 'text-amber-100 font-black',
          border: 'border-amber-600',
          shadow: 'shadow-[0_0_15px_rgba(180,83,9,0.3)]',
        };
      default:
        return {
          label: `${index + 1}th Place`,
          bg: 'from-slate-800 to-slate-900',
          text: 'text-slate-300 font-bold',
          border: 'border-slate-700',
          shadow: '',
        };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-red-950 via-slate-950 to-slate-900 p-6 sm:p-8 border border-red-500/30 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Zap className="w-64 h-64 text-red-500" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 text-xs font-mono font-bold mb-3">
              <Flame className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span>RAPID FIRE ROUND • LIVE BUZZER CONTROL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Live Buzzer Console 🎪
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Broadcast questions, enforce 5-second anti-hack lockouts, and track real-time team reaction speeds down to the millisecond.
            </p>
          </div>

          {/* Admin Live Timer Status Card */}
          <div className="flex items-center gap-3">
            <div className="px-5 py-3 rounded-2xl glass-card border border-white/15 text-right font-mono min-w-[180px]">
              <div className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                BUZZER STATUS
              </div>
              {buzzerUnlockTime === null ? (
                <div className="text-slate-400 text-sm font-extrabold flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                  <span>STANDBY</span>
                </div>
              ) : adminTimer !== null && adminTimer > 0 ? (
                <div className="text-amber-400 text-sm font-extrabold flex items-center justify-end gap-1.5 mt-0.5 animate-pulse">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span>UNLOCKING IN {adminTimer}s</span>
                </div>
              ) : (
                <div className="text-emerald-400 text-sm font-extrabold flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>BUZZER LIVE! ⚡</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Admin Action Toolbar */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Show Question Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleShowQuestion}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-mono text-sm font-black shadow-lg hover:shadow-red-500/30 transition-all border border-red-400/40 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>SHOW QUESTION (Start 5s Timer)</span>
          </motion.button>

          {/* Reset Buzzer Button */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleResetBuzzer}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-sm font-bold border border-slate-600 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-400" />
            <span>RESET BUZZER</span>
          </motion.button>
        </div>

        {/* Live Counter */}
        <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
          <Users className="w-4 h-4 text-carnival-gold" />
          <span>TEAMS BUZZED IN: </span>
          <span className="text-white font-extrabold text-base px-2.5 py-0.5 rounded-lg bg-carnival-gold/20 border border-carnival-gold/40 text-carnival-gold">
            {buzzerQueue.length}
          </span>
        </div>
      </div>

      {/* Live Buzzer Feed Section */}
      <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-carnival-gold" />
            <h2 className="text-xl font-black text-white font-mono uppercase tracking-wide">
              Live Reaction Feed
            </h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Real-Time Real-Delay Feed
          </span>
        </div>

        {/* Empty State */}
        {buzzerQueue.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-white/10 bg-slate-900/40">
            <Sparkles className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-slate-300 font-mono">No Teams Have Buzzed In Yet</h3>
            <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
              Click &quot;SHOW QUESTION&quot; to broadcast the 5-second countdown to all active student portals.
            </p>
          </div>
        ) : (
          /* Animated Reaction List */
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence>
              {buzzerQueue.map((entry, index) => {
                const badge = getRankBadge(index);
                return (
                  <motion.div
                    key={entry.teamId + '-' + entry.timestamp}
                    layout
                    initial={{ scale: 0.85, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    className={`relative overflow-hidden p-5 sm:p-6 rounded-2xl bg-gradient-to-r ${badge.bg} ${badge.border} ${badge.shadow} border border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                  >
                    {/* Left: Rank & Team Info */}
                    <div className="flex items-center gap-4">
                      {/* Rank Emblem */}
                      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 text-white font-mono font-black text-xl shrink-0">
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full bg-black/30 text-white`}>
                            {badge.label}
                          </span>
                          <span className="text-[11px] font-mono text-white/80">
                            {new Date(entry.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <h3 className={`text-xl sm:text-2xl font-black ${badge.text} mt-1`}>
                          {entry.teamName}
                        </h3>
                      </div>
                    </div>

                    {/* Right: Reaction Time Badge */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/20 font-mono text-right">
                        <div className="text-[9px] text-white/70 uppercase font-bold">REACTION SPEED</div>
                        <div className="text-lg font-black text-white flex items-center gap-1">
                          <Clock className="w-4 h-4 text-yellow-300" />
                          <span>+{entry.reactionTimeMs} ms</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default BuzzerConsole;
