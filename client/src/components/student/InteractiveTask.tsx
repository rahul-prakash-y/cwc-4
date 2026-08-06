import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  XCircle,
  Play,
  Send,
  Zap,
  Lock,
  Sparkles,
  HelpCircle,
  Code2,
  Terminal,
  KeyRound,
  Compass,
  AlertTriangle,
  RotateCcw,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

export type TaskType =
  | 'Main'
  | 'Special'
  | 'MCQ'
  | 'Rapid Fire'
  | 'Code Completion'
  | 'Output Prediction'
  | 'Treasure Hunt'
  | 'Puzzle';

export interface TestCase {
  input?: string;
  expectedOutput: string;
  isHidden?: boolean;
}

export interface InteractiveTaskProps {
  id: string;
  title: string;
  description: string;
  type: TaskType;
  points: number;
  mcqOptions?: string[];
  interactiveTimeLimit?: number; // In seconds for Rapid Fire
  testCases?: TestCase[];
  status?: string; // Team survival status ('Safe', 'Danger', 'Eliminated', etc.)
  onSuccessSubmitted?: (result: any) => void;
}

export const InteractiveTask: React.FC<InteractiveTaskProps> = ({
  id,
  title,
  description,
  type,
  points,
  mcqOptions = [],
  interactiveTimeLimit = 60, // default 60s if Rapid Fire
  testCases = [],
  status = 'Safe',
  onSuccessSubmitted,
}) => {
  const { apiFetch } = useAuth();

  // Selected Option for MCQ / Rapid Fire
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isLockedIn, setIsLockedIn] = useState<boolean>(false);

  // Input state for Puzzle / Treasure Hunt
  const [puzzleAnswer, setPuzzleAnswer] = useState<string>('');

  // Code state for Code Completion / Output Prediction
  const [codeValue, setCodeValue] = useState<string>(
    type === 'Code Completion'
      ? '// Complete the code snippet below:\nfunction solveTask(input) {\n  // Your code here\n  return input;\n}'
      : ''
  );

  // Rapid Fire Timer State
  const [secondsRemaining, setSecondsRemaining] = useState<number>(
    type === 'Rapid Fire' ? (interactiveTimeLimit > 0 ? interactiveTimeLimit : 45) : 0
  );
  const [isTimerExpired, setIsTimerExpired] = useState<boolean>(false);
  const [timerStarted, setTimerStarted] = useState<boolean>(type !== 'Rapid Fire');

  // Double Points Advantage toggle state
  const [useDoublePoints, setUseDoublePoints] = useState<boolean>(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [evalResult, setEvalResult] = useState<{
    success?: boolean;
    isCorrect?: boolean;
    pointsEarned?: number;
    doublePointsApplied?: boolean;
    message?: string;
    testResults?: any[];
  } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Task 4: Rapid Fire Timer & Auto-Submit logic
  const handleAutoSubmit = useCallback(async () => {
    if (isSubmitting || evalResult?.isCorrect) return;

    setIsSubmitting(true);
    try {
      const payload: any = {
        selectedOption: selectedOption || (mcqOptions.length > 0 ? mcqOptions[0] : ''),
        answer: puzzleAnswer || selectedOption || codeValue,
        code: codeValue,
        advantageUsed: useDoublePoints ? 'Double Points' : undefined,
      };

      const res = await apiFetch(`/student/tasks/${id}/submit-interactive`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setEvalResult(data);

      if (data.isCorrect) {
        triggerCarnivalConfetti();
        if (onSuccessSubmitted) onSuccessSubmitted(data);
      }
    } catch (err: any) {
      setEvalResult({
        success: false,
        isCorrect: false,
        message: 'Auto-submit completed upon time expiry.',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [apiFetch, codeValue, evalResult?.isCorrect, id, isSubmitting, mcqOptions, onSuccessSubmitted, puzzleAnswer, selectedOption, useDoublePoints]);

  useEffect(() => {
    if (type === 'Rapid Fire' && timerStarted && !isTimerExpired && !evalResult) {
      timerRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsTimerExpired(true);
            setIsLockedIn(true);
            // Trigger auto-submit when timer expires
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [type, timerStarted, isTimerExpired, evalResult, handleAutoSubmit]);

  // Handle Option Click for MCQ / Rapid Fire
  const handleOptionClick = (option: string) => {
    if (isLockedIn || isTimerExpired || status === 'Eliminated') return;
    setSelectedOption(option);
  };

  const handleLockIn = () => {
    if (!selectedOption) return;
    setIsLockedIn(true);
  };

  // Submit Interactive Task
  const handleSubmitInteractive = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (status === 'Eliminated') return;

    if ((type === 'MCQ' || type === 'Rapid Fire') && !selectedOption) {
      alert('Please select an option before submitting!');
      return;
    }

    if ((type === 'Puzzle' || type === 'Treasure Hunt') && !puzzleAnswer.trim()) {
      alert('Please enter your answer before submitting!');
      return;
    }

    setIsSubmitting(true);
    setEvalResult(null);

    try {
      // Mock code test case execution for Code Completion
      let mockTestResults: any[] = [];
      if (type === 'Code Completion' && testCases.length > 0) {
        mockTestResults = testCases.map((tc) => {
          const hasReturn = codeValue.includes('return');
          const isError = codeValue.toLowerCase().includes('error');
          const outputMatch = hasReturn && !isError ? tc.expectedOutput : 'undefined';
          return {
            input: tc.input || '',
            expectedOutput: tc.expectedOutput,
            actualOutput: outputMatch,
          };
        });
      }

      const payload: any = {
        selectedOption: selectedOption || '',
        answer: puzzleAnswer.trim() || selectedOption || codeValue,
        code: codeValue,
        testResults: mockTestResults,
        advantageUsed: useDoublePoints ? 'Double Points' : undefined,
      };

      const res = await apiFetch(`/student/tasks/${id}/submit-interactive`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setEvalResult(data);

      if (data.isCorrect) {
        setIsLockedIn(true);
        triggerCarnivalConfetti();
        if (onSuccessSubmitted) onSuccessSubmitted(data);
      }
    } catch (err: any) {
      setEvalResult({
        success: false,
        isCorrect: false,
        message: err.message || 'Error submitting interactive task',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const optionLabels = ['A', 'B', 'C', 'D', 'E', 'F'];

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-card border border-carnival-purple/40 shadow-2xl bg-[#14102B]/95 space-y-6 relative overflow-hidden">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-purple/20 text-carnival-purple border border-carnival-purple/40 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              INTERACTIVE {type.toUpperCase()} ARENA
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40">
              +{points} PTS
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white">{title}</h3>
        </div>

        {/* Task 4: Rapid Fire Specific Countdown Timer */}
        {type === 'Rapid Fire' && (
          <div
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border font-mono ${
              isTimerExpired
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                : secondsRemaining <= 10
                ? 'bg-orange-500/20 border-orange-500/60 text-orange-300 animate-pulse'
                : 'bg-black/60 border-carnival-cyan/40 text-carnival-cyan'
            }`}
          >
            <Clock className="w-5 h-5" />
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Rapid Fire Timer
              </span>
              <span className="text-lg font-black tracking-widest">
                {String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:
                {String(secondsRemaining % 60).padStart(2, '0')}s
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Problem Description */}
      <div className="p-4 rounded-2xl bg-black/40 border border-white/10 text-slate-200 text-sm leading-relaxed">
        {description}
      </div>

      {/* Double Points Perk Toggle Banner */}
      {status !== 'Eliminated' && !evalResult?.isCorrect && (
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-carnival-gold/15 via-amber-500/10 to-transparent border border-carnival-gold/30">
          <div className="flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-carnival-gold fill-carnival-gold" />
            <div>
              <span className="text-xs font-bold text-carnival-gold block">
                2x Double Points Perk Available
              </span>
              <span className="text-[11px] text-slate-400 block">
                Apply 2x Double Points advantage from team inventory for +{points * 2} PTS!
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setUseDoublePoints(!useDoublePoints)}
            className={`px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
              useDoublePoints
                ? 'bg-carnival-gold text-slate-950 shadow-neon-gold'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {useDoublePoints ? '⚡ 2x Active' : 'Enable 2x'}
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* RENDERER 1: MCQ & RAPID FIRE (Large Cards A, B, C, D)     */}
      {/* ========================================================= */}
      {(type === 'MCQ' || type === 'Rapid Fire') && (
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Select Option & Lock In Answer:</span>
            {isLockedIn && (
              <span className="text-carnival-gold flex items-center gap-1">
                <Lock className="w-3.5 h-3.5" /> Answer Locked
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {(mcqOptions.length > 0
              ? mcqOptions
              : ['Option Option A', 'Option Option B', 'Option Option C', 'Option Option D']
            ).map((opt, idx) => {
              const label = optionLabels[idx] || `${idx + 1}`;
              const isSelected = selectedOption === opt;

              return (
                <motion.button
                  key={idx}
                  type="button"
                  whileHover={!isLockedIn && !isTimerExpired ? { scale: 1.01 } : {}}
                  whileTap={!isLockedIn && !isTimerExpired ? { scale: 0.98 } : {}}
                  disabled={isLockedIn || isTimerExpired || status === 'Eliminated'}
                  onClick={() => handleOptionClick(opt)}
                  className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-carnival-cyan/20 via-carnival-purple/20 to-black border-carnival-cyan shadow-neon-cyan text-white'
                      : 'bg-black/40 border-white/15 text-slate-300 hover:border-white/30 hover:bg-white/5'
                  } ${isLockedIn || isTimerExpired ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl font-mono font-black flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-carnival-cyan text-slate-950 shadow-neon-cyan'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {label}
                  </div>
                  <div className="flex-1 pt-1">
                    <span className="text-sm font-semibold leading-snug block">{opt}</span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-5 h-5 text-carnival-cyan shrink-0 self-center" />
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Action Buttons for MCQ / Rapid Fire */}
          <div className="flex items-center justify-between gap-4 pt-2">
            {!isLockedIn && selectedOption && !isTimerExpired && (
              <button
                type="button"
                onClick={handleLockIn}
                className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-mono font-bold text-white flex items-center gap-2 transition-all"
              >
                <Lock className="w-4 h-4 text-carnival-gold" />
                <span>Lock In Card</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => handleSubmitInteractive()}
              disabled={
                !selectedOption || isSubmitting || isTimerExpired || status === 'Eliminated'
              }
              className="ml-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-carnival-crimson via-carnival-purple to-carnival-cyan text-white font-black text-xs uppercase tracking-wider shadow-neon-crimson hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Auto-Grading...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Answer</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RENDERER 2: CODE COMPLETION & OUTPUT PREDICTION           */}
      {/* ========================================================= */}
      {(type === 'Code Completion' || type === 'Output Prediction') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-300">
            <span className="flex items-center gap-2 text-carnival-cyan">
              <Code2 className="w-4 h-4 text-carnival-cyan" />
              Interactive Code Evaluation Canvas
            </span>
            <span className="text-slate-400">JavaScript / TypeScript</span>
          </div>

          <div className="relative rounded-2xl bg-[#0B0914] border border-white/15 overflow-hidden shadow-inner font-mono text-xs text-emerald-400">
            <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-white/10 text-slate-400 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-mono text-slate-300">solution.js</span>
              </div>
              <span className="text-carnival-gold font-bold">Auto-Grading Enabled ⚡</span>
            </div>

            <textarea
              rows={8}
              value={codeValue}
              onChange={(e) => setCodeValue(e.target.value)}
              disabled={status === 'Eliminated'}
              className="w-full p-4 bg-transparent font-mono text-xs sm:text-sm text-emerald-300 focus:outline-none leading-relaxed resize-y"
              placeholder="// Write your code or answer here..."
            />
          </div>

          {/* Test Cases Status Summary */}
          {testCases.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Test Cases Evaluation Matrix:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {testCases.map((tc, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-black/40 border border-white/10 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between text-slate-300 font-bold">
                      <span>Test Case #{idx + 1}</span>
                      <span className="text-carnival-gold">{tc.isHidden ? 'Hidden' : 'Public'}</span>
                    </div>
                    {tc.input && (
                      <div className="text-slate-400 text-[11px]">
                        Input: <code className="text-white">{tc.input}</code>
                      </div>
                    )}
                    <div className="text-slate-400 text-[11px]">
                      Expected Output: <code className="text-emerald-400">{tc.expectedOutput}</code>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSubmitInteractive()}
              disabled={isSubmitting || status === 'Eliminated'}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-carnival-purple via-carnival-cyan to-emerald-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-cyan hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Terminal className="w-4 h-4 fill-slate-950" />
              <span>{isSubmitting ? 'Evaluating Test Cases...' : 'Run & Auto-Grade Code'}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* RENDERER 3: TREASURE HUNT & PUZZLE (Riddle Input)          */}
      {/* ========================================================= */}
      {(type === 'Treasure Hunt' || type === 'Puzzle') && (
        <form onSubmit={handleSubmitInteractive} className="space-y-4">
          <div className="space-y-2">
            <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-carnival-gold" />
              Interactive Solution / Secret Key Validation
            </label>
            <div className="relative">
              <Compass className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={puzzleAnswer}
                onChange={(e) => setPuzzleAnswer(e.target.value)}
                disabled={status === 'Eliminated'}
                placeholder="Enter keyphrase, secret hash, or riddle solution..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-black/60 font-mono text-sm text-white border border-white/15 focus:border-carnival-gold focus:ring-1 focus:ring-carnival-gold focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={!puzzleAnswer.trim() || isSubmitting || status === 'Eliminated'}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-carnival-gold via-amber-500 to-carnival-crimson text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-gold hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>{isSubmitting ? 'Validating Secret Key...' : 'Validate Riddle Solution'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Evaluation Results Overlay */}
      <AnimatePresence>
        {evalResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`p-4 rounded-2xl border space-y-3 font-mono text-xs ${
              evalResult.isCorrect
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-2 text-sm">
                {evalResult.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Evaluation Passed! +{evalResult.pointsEarned} PTS</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-400" />
                    <span>Evaluation Failed</span>
                  </>
                )}
              </span>
              {evalResult.doublePointsApplied && (
                <span className="px-2.5 py-0.5 rounded-full bg-carnival-gold text-slate-950 font-bold text-[10px]">
                  ⚡ 2x Double Points Applied
                </span>
              )}
            </div>

            <p className="text-slate-300 leading-relaxed">{evalResult.message}</p>

            {evalResult.testResults && evalResult.testResults.length > 0 && (
              <div className="space-y-1 pt-2 border-t border-white/10">
                <span className="text-[11px] font-bold text-slate-300 block">
                  Test Results breakdown:
                </span>
                {evalResult.testResults.map((tr, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-black/40 text-[11px]"
                  >
                    <span>Input: {tr.input || 'Standard'}</span>
                    <span className={tr.passed ? 'text-emerald-400' : 'text-rose-400'}>
                      {tr.passed ? 'PASSED ✓' : 'FAILED ✗'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InteractiveTask;
