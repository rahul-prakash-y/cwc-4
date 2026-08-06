import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Award, Sparkles, Zap, HelpCircle, RotateCcw } from 'lucide-react';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

export interface McqTaskProps {
  id: string;
  title: string;
  description?: string;
  points: number;
  mcqOptions?: string[];
  correctAnswer?: string;
  timeLimitSeconds?: number;
  onGraded?: (result: { isCorrect: boolean; pointsEarned: number; answer: string }) => void;
}

export const McqRapidFireRenderer: React.FC<{ task: McqTaskProps }> = ({ task }) => {
  const options = task.mcqOptions && task.mcqOptions.length > 0
    ? task.mcqOptions
    : ['Option A: Fastify Plugin System', 'Option B: Express Middleware', 'Option C: Next.js API Routes', 'Option D: Koa Router'];

  const timeLimit = task.timeLimitSeconds && task.timeLimitSeconds > 0 ? task.timeLimitSeconds : 30;
  
  const [timeLeft, setTimeLeft] = useState(timeLimit);
  const [timerActive, setTimerActive] = useState(true);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Countdown timer effect
  useEffect(() => {
    if (!timerActive || isSubmitted) return;

    if (timeLeft <= 0) {
      setTimerActive(false);
      setIsSubmitted(true);
      setIsCorrect(false);
      setFeedbackMessage('⏰ Time expired! Rapid Fire window closed.');
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, timerActive, isSubmitted]);

  const handleOptionSelect = async (option: string) => {
    if (isSubmitted || submitting) return;

    setSelectedOption(option);
    setSubmitting(true);
    setTimerActive(false);

    // Call backend submit-interactive route
    try {
      const response = await fetch(`/api/tasks/${task.id}/submit-interactive`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: option, selectedOption: option }),
      });

      const data = await response.json();
      const correct = data.isCorrect ?? (task.correctAnswer ? option === task.correctAnswer : true);

      setIsCorrect(correct);
      setIsSubmitted(true);
      setFeedbackMessage(data.message || (correct ? `🎉 Spot on! +${task.points} PTS` : '❌ Incorrect option selected.'));

      if (correct) {
        triggerCarnivalConfetti();
      }
      if (task.onGraded) {
        task.onGraded({ isCorrect: correct, pointsEarned: correct ? task.points : 0, answer: option });
      }
    } catch (err) {
      // Fallback local evaluation if backend offline
      const correct = task.correctAnswer ? option === task.correctAnswer : true;
      setIsCorrect(correct);
      setIsSubmitted(true);
      setFeedbackMessage(correct ? `🎉 Correct! Earned +${task.points} PTS!` : '❌ Incorrect choice!');
      if (correct) triggerCarnivalConfetti();
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setSelectedOption(null);
    setIsSubmitted(false);
    setIsCorrect(null);
    setTimeLeft(timeLimit);
    setTimerActive(true);
    setFeedbackMessage('');
  };

  const timerPercentage = (timeLeft / timeLimit) * 100;
  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-6 sm:p-8 rounded-3xl bg-[#141029]/95 border border-carnival-gold/30 shadow-2xl space-y-6 relative overflow-hidden"
    >
      {/* Background Neon Accent Glow */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-carnival-gold/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-carnival-crimson/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Quiz Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-extrabold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 flex items-center gap-1.5 animate-pulse">
              <Zap className="w-3.5 h-3.5 fill-carnival-gold" />
              RAPID FIRE MCQ ARENA
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-cyan/20 text-carnival-cyan border border-carnival-cyan/40">
              +{task.points} PTS
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            {task.title}
          </h3>
        </div>

        {/* Timed Counter Display */}
        <div className="flex items-center gap-3 bg-black/60 px-4 py-2.5 rounded-2xl border border-white/15">
          <Clock className={`w-5 h-5 ${timeLeft <= 5 ? 'text-rose-500 animate-ping' : 'text-carnival-cyan'}`} />
          <div className="font-mono text-sm font-bold text-white">
            <span className="text-slate-400 text-xs block font-normal">TIME REMAINING</span>
            <span className={`${timeLeft <= 5 ? 'text-rose-400' : 'text-carnival-cyan'} text-base font-extrabold`}>
              00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
            </span>
          </div>
        </div>
      </div>

      {/* Timer Progress Bar */}
      <div className="w-full bg-black/50 h-2.5 rounded-full overflow-hidden border border-white/10">
        <motion.div
          className={`h-full transition-all duration-300 ${
            timeLeft <= 5
              ? 'bg-gradient-to-r from-rose-500 to-red-600'
              : timeLeft <= 15
              ? 'bg-gradient-to-r from-carnival-gold to-amber-500'
              : 'bg-gradient-to-r from-carnival-cyan to-carnival-purple'
          }`}
          style={{ width: `${timerPercentage}%` }}
        />
      </div>

      {/* Task Description / Prompt */}
      {task.description && (
        <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-slate-200 text-sm leading-relaxed flex items-start gap-3">
          <HelpCircle className="w-5 h-5 text-carnival-cyan flex-shrink-0 mt-0.5" />
          <span>{task.description}</span>
        </div>
      )}

      {/* Option Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((optionText, idx) => {
          const letter = optionLetters[idx % optionLetters.length];
          const isSelected = selectedOption === optionText;
          const isTargetCorrect = task.correctAnswer ? optionText === task.correctAnswer : false;

          let cardStyle = 'bg-black/40 border-white/10 hover:border-carnival-cyan/60 hover:bg-white/5 text-slate-200';
          let icon = null;

          if (isSubmitted) {
            if (isSelected) {
              if (isCorrect) {
                cardStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 shadow-neon-green';
                icon = <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />;
              } else {
                cardStyle = 'bg-rose-500/20 border-rose-500 text-rose-200 shadow-neon-crimson';
                icon = <XCircle className="w-6 h-6 text-rose-400 flex-shrink-0" />;
              }
            } else if (isTargetCorrect) {
              cardStyle = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-300';
              icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />;
            } else {
              cardStyle = 'bg-black/30 border-white/5 opacity-50 text-slate-400';
            }
          } else if (isSelected) {
            cardStyle = 'bg-carnival-cyan/20 border-carnival-cyan text-white shadow-neon-cyan';
          }

          return (
            <motion.button
              key={idx}
              whileHover={{ scale: isSubmitted ? 1 : 1.015 }}
              whileTap={{ scale: isSubmitted ? 1 : 0.98 }}
              disabled={isSubmitted || submitting}
              onClick={() => handleOptionSelect(optionText)}
              className={`p-4 sm:p-5 rounded-2xl border text-left font-medium text-sm sm:text-base transition-all flex items-center justify-between gap-4 relative overflow-hidden ${cardStyle}`}
            >
              <div className="flex items-center gap-3.5">
                <span className={`w-8 h-8 rounded-xl font-mono font-black text-xs sm:text-sm flex items-center justify-center flex-shrink-0 ${
                  isSubmitted && isSelected
                    ? isCorrect ? 'bg-emerald-400 text-slate-950' : 'bg-rose-400 text-slate-950'
                    : 'bg-white/10 text-carnival-gold border border-white/15'
                }`}>
                  {letter}
                </span>
                <span className="font-semibold">{optionText}</span>
              </div>
              {icon}
            </motion.button>
          );
        })}
      </div>

      {/* Result & Feedback Status Bar */}
      <AnimatePresence>
        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isCorrect
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-200'
                : 'bg-rose-500/15 border-rose-500/50 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-3">
              {isCorrect ? (
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-400 flex items-center justify-center text-rose-400 flex-shrink-0">
                  <XCircle className="w-6 h-6" />
                </div>
              )}
              <div>
                <h4 className="font-bold text-base text-white">{feedbackMessage}</h4>
                <p className="text-xs text-slate-300 font-mono">
                  {isCorrect ? 'Score updated automatically in Team Scoreboard!' : 'Review the choice and try again.'}
                </p>
              </div>
            </div>

            <button
              onClick={resetQuiz}
              className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold flex items-center gap-2 border border-white/15 transition-all whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Quiz</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
