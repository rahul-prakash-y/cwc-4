import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Sparkles, CheckCircle2, XCircle, HelpCircle, Lock, Unlock, Award, Send, RefreshCw, Compass } from 'lucide-react';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

export interface PuzzleTaskProps {
  id: string;
  title: string;
  description?: string;
  points: number;
  correctAnswer?: string;
  hintText?: string;
  onGraded?: (result: { isCorrect: boolean; pointsEarned: number; answer: string }) => void;
}

export const PuzzleRiddleRenderer: React.FC<{ task: PuzzleTaskProps }> = ({ task }) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isError, setIsError] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [attempts, setAttempts] = useState(0);

  const defaultRiddleDescription = task.description || (
    'I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I? (Type your solution below to unlock the carnival treasure)'
  );

  const handleValidateAnswer = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userAnswer.trim() || submitting) return;

    setSubmitting(true);
    setIsError(false);

    try {
      const response = await fetch(`/api/tasks/${task.id}/submit-interactive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: userAnswer }),
      });

      const data = await response.json();
      const correct = data.isCorrect ?? (
        task.correctAnswer ? userAnswer.trim().toLowerCase() === task.correctAnswer.trim().toLowerCase() : true
      );

      setAttempts((prev) => prev + 1);

      if (correct) {
        setIsUnlocked(true);
        setIsError(false);
        setFeedback(data.message || `🎉 Treasure unlocked! You earned +${task.points} PTS!`);
        triggerCarnivalConfetti();
        if (task.onGraded) {
          task.onGraded({ isCorrect: true, pointsEarned: task.points, answer: userAnswer });
        }
      } else {
        setIsUnlocked(false);
        setIsError(true);
        setFeedback('❌ Incorrect riddle cipher! Double check your answer and try again.');
      }
    } catch (err) {
      // Fallback evaluation
      const correct = task.correctAnswer ? userAnswer.trim().toLowerCase() === task.correctAnswer.trim().toLowerCase() : true;
      setAttempts((prev) => prev + 1);
      if (correct) {
        setIsUnlocked(true);
        setIsError(false);
        setFeedback(`🎉 Riddle solved! +${task.points} PTS!`);
        triggerCarnivalConfetti();
      } else {
        setIsError(true);
        setFeedback('❌ Cipher key incorrect!');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-6 sm:p-8 rounded-3xl bg-[#181124]/95 border shadow-2xl space-y-6 relative overflow-hidden transition-all duration-300 ${
        isUnlocked
          ? 'border-emerald-500/60 shadow-neon-green bg-gradient-to-b from-[#11241C] to-[#181124]'
          : isError
          ? 'border-rose-500/60 animate-shake bg-gradient-to-b from-[#281119] to-[#181124]'
          : 'border-carnival-gold/40'
      }`}
    >
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <Compass className="w-48 h-48 text-carnival-gold animate-spin-slow" />
      </div>

      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 flex items-center gap-1.5 animate-pulse">
              <Key className="w-3.5 h-3.5" />
              TREASURE HUNT & PUZZLE
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-cyan/20 text-carnival-cyan border border-carnival-cyan/40">
              +{task.points} PTS
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            {task.title}
          </h3>
        </div>

        <div className="flex items-center gap-2 bg-black/60 px-4 py-2 rounded-2xl border border-white/15 text-xs font-mono">
          {isUnlocked ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Unlock className="w-4 h-4 text-emerald-400" /> TREASURE UNLOCKED
            </span>
          ) : (
            <span className="text-carnival-gold font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-carnival-gold" /> VAULT LOCKED (Attempts: {attempts})
            </span>
          )}
        </div>
      </div>

      {/* Riddle Card Container */}
      <div className="p-6 rounded-2xl bg-black/50 border border-white/15 space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 flex items-center justify-center flex-shrink-0 mt-0.5">
            📜
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-mono font-bold text-carnival-gold uppercase tracking-wider">
              Mystic Cipher Riddle
            </h4>
            <p className="text-slate-200 text-sm sm:text-base font-serif italic leading-relaxed">
              &quot;{defaultRiddleDescription}&quot;
            </p>
          </div>
        </div>

        {/* Hint Box Toggle */}
        {task.hintText && (
          <div className="pt-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className="text-xs font-mono text-carnival-cyan hover:underline flex items-center gap-1 font-bold"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showHint ? 'Hide Hint' : 'Reveal Architectural Hint'}</span>
            </button>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-2 p-3 rounded-xl bg-carnival-cyan/10 border border-carnival-cyan/30 text-carnival-cyan text-xs font-mono"
              >
                💡 Hint: {task.hintText}
              </motion.div>
            )}
          </div>
        )}
      </div>

      {/* Input Box with Instant Validation */}
      <form onSubmit={handleValidateAnswer} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-xs font-mono text-slate-300 font-bold">
            ENTER RIDDLE SOLUTION / CIPHER ANSWER:
          </label>
          <div className="relative">
            <Key className="w-5 h-5 text-carnival-gold absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              disabled={isUnlocked || submitting}
              placeholder="Type your answer here..."
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              className={`w-full pl-12 pr-32 py-4 rounded-2xl bg-black/60 text-white font-bold text-sm sm:text-base border focus:outline-none transition-all ${
                isUnlocked
                  ? 'border-emerald-500 text-emerald-300'
                  : isError
                  ? 'border-rose-500 text-rose-300'
                  : 'border-white/20 focus:border-carnival-gold focus:ring-1 focus:ring-carnival-gold'
              }`}
            />

            <button
              type="submit"
              disabled={isUnlocked || submitting || !userAnswer.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-carnival-gold to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-gold hover:scale-105 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5 fill-slate-950" />
              <span>{submitting ? 'Verifying...' : 'Unlock'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Feedback Banner */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
              isUnlocked
                ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 shadow-neon-green'
                : 'bg-rose-500/20 border-rose-500/60 text-rose-200 shadow-neon-crimson'
            }`}
          >
            <div className="flex items-center gap-3">
              {isUnlocked ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-rose-500/30 text-rose-400 flex items-center justify-center flex-shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-base text-white">{feedback}</h4>
                <p className="text-xs text-slate-300 font-mono">
                  {isUnlocked ? 'Points synchronized instantly with Carnival Leaderboard!' : 'Try a different cipher or request a hint.'}
                </p>
              </div>
            </div>

            {isUnlocked && (
              <div className="px-4 py-2 rounded-xl bg-emerald-400 text-slate-950 font-mono font-black text-xs uppercase flex items-center gap-1.5 flex-shrink-0">
                <Award className="w-4 h-4" /> +{task.points} PTS
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
