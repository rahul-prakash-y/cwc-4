import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  RotateCcw,
  Flame,
  Trophy,
  Clock,
  Users,
  Sparkles,
  Zap,
  Plus,
  Trash2,
  HelpCircle,
  X,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import apiClient from '../../api/axios';
import toast from 'react-hot-toast';

export interface BuzzerQueueItem {
  teamId: string;
  teamName: string;
  timestamp: number;
  reactionTimeMs: number;
}

export interface BuzzerQuestionItem {
  _id: string;
  title: string;
  questionText: string;
  expectedAnswer?: string;
  createdAt?: string;
}

export const BuzzerConsole: React.FC = () => {
  const { socket, isConnected } = useSocket();
  const [buzzerQueue, setBuzzerQueue] = useState<BuzzerQueueItem[]>([]);
  const [adminTimer, setAdminTimer] = useState<number | null>(null);
  const [buzzerUnlockTime, setBuzzerUnlockTime] = useState<number | null>(null);
  const [isLive, setIsLive] = useState<boolean>(false);

  // Question Management State
  const [questions, setQuestions] = useState<BuzzerQuestionItem[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [activeQuestion, setActiveQuestion] = useState<BuzzerQuestionItem | null>(null);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newExpectedAnswer, setNewExpectedAnswer] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch Questions from backend
  const fetchQuestions = async () => {
    try {
      const res = await apiClient.get('/admin/buzzer-questions');
      if (res.data?.questions) {
        setQuestions(res.data.questions);
        if (res.data.questions.length > 0 && !selectedQuestionId) {
          setSelectedQuestionId(res.data.questions[0]._id);
        }
      }
    } catch (err) {
      console.error('Error fetching buzzer questions:', err);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  // Sync state with socket server
  useEffect(() => {
    if (!socket) return;

    socket.emit('join-room', 'admin-panel');
    socket.emit('GET_BUZZER_STATE');

    const handleBuzzerState = (data: {
      buzzerUnlockTime: number | null;
      buzzerQueue: BuzzerQueueItem[];
      currentQuestion?: any;
    }) => {
      setBuzzerQueue(data.buzzerQueue || []);
      if (data.buzzerUnlockTime) {
        setBuzzerUnlockTime(data.buzzerUnlockTime);
      }
      if (data.currentQuestion) {
        setActiveQuestion(data.currentQuestion);
      }
    };

    const handleQuestionDisplayed = (data: {
      buzzerUnlockTime: number;
      questionId?: string;
      title?: string;
      questionText?: string;
    }) => {
      setBuzzerUnlockTime(data.buzzerUnlockTime);
      setBuzzerQueue([]);
      if (data.title || data.questionText) {
        setActiveQuestion({
          _id: data.questionId || '',
          title: data.title || '',
          questionText: data.questionText || '',
        });
      }
      toast.success('🎯 Question broadcasted! 5-second student countdown active.');
    };

    const handleQueueUpdated = (queue: BuzzerQueueItem[]) => {
      setBuzzerQueue(queue);
    };

    const handleBuzzerReset = () => {
      setBuzzerQueue([]);
      setBuzzerUnlockTime(null);
      setAdminTimer(null);
      setIsLive(false);
      setActiveQuestion(null);
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

  // Admin Action: Broadcast Selected Question
  const handleBroadcastQuestion = () => {
    if (!socket || !isConnected) {
      toast.error('Socket disconnected! Cannot broadcast question.');
      return;
    }

    const selectedQ = questions.find((q) => q._id === selectedQuestionId);
    const payload = selectedQ
      ? {
          questionId: selectedQ._id,
          title: selectedQ.title,
          questionText: selectedQ.questionText,
          expectedAnswer: selectedQ.expectedAnswer,
        }
      : {};

    socket.emit('ADMIN_START_QUESTION', payload);
  };

  // Admin Action: Reset Buzzer
  const handleResetBuzzer = () => {
    if (!socket || !isConnected) {
      toast.error('Socket disconnected! Cannot reset buzzer.');
      return;
    }

    socket.emit('ADMIN_RESET_BUZZER');
  };

  // Admin Action: Create New Question
  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newQuestionText.trim()) {
      toast.error('Please fill in title and question text.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await apiClient.post('/admin/buzzer-questions', {
        title: newTitle,
        questionText: newQuestionText,
        expectedAnswer: newExpectedAnswer,
      });

      toast.success('Buzzer question created!');
      setNewTitle('');
      setNewQuestionText('');
      setNewExpectedAnswer('');
      setIsAddModalOpen(false);
      fetchQuestions();

      if (res.data?.question?._id) {
        setSelectedQuestionId(res.data.question._id);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create question.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Admin Action: Delete Question
  const handleDeleteQuestion = async (id: string) => {
    if (!window.confirm('Delete this buzzer question?')) return;
    try {
      await apiClient.delete(`/admin/buzzer-questions/${id}`);
      toast.success('Question deleted.');
      if (selectedQuestionId === id) {
        setSelectedQuestionId('');
      }
      fetchQuestions();
    } catch (err: any) {
      toast.error('Failed to delete question.');
    }
  };

  // Helper for rank medal formatting
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
              Select questions, enforce 5-second anti-hack lockouts, and track real-time team reaction speeds down to the millisecond.
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

      {/* Question Selector & Control Toolbar */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Question Selector Dropdown */}
          <div className="flex-1 min-w-[280px]">
            <label className="block text-xs font-mono font-bold text-carnival-gold uppercase mb-1.5">
              Select Rapid Fire Question:
            </label>
            <div className="flex items-center gap-2">
              <select
                value={selectedQuestionId}
                onChange={(e) => setSelectedQuestionId(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl bg-slate-900/90 border border-white/20 text-white font-mono text-sm focus:outline-none focus:border-red-500 transition-all"
              >
                <option value="">-- Generic Rapid Fire Round --</option>
                {questions.map((q) => (
                  <option key={q._id} value={q._id}>
                    {q.title} {q.expectedAnswer ? `(Ans: ${q.expectedAnswer})` : ''}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-3.5 py-3 rounded-2xl bg-carnival-gold/20 hover:bg-carnival-gold/30 text-carnival-gold border border-carnival-gold/40 font-mono text-xs font-bold flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                title="Add New Question"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Q</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleBroadcastQuestion}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-mono text-sm font-black shadow-lg hover:shadow-red-500/30 transition-all border border-red-400/40 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>BROADCAST QUESTION (5s)</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.96 }}
              onClick={handleResetBuzzer}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-mono text-sm font-bold border border-slate-600 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4 text-slate-400" />
              <span>RESET</span>
            </motion.button>
          </div>
        </div>

        {/* Selected / Active Question Detail Banner */}
        {activeQuestion && (
          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-500/30 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <FileText className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wide">
                  CURRENT BROADCAST QUESTION
                </span>
                <h4 className="text-base font-black text-white">{activeQuestion.title}</h4>
                <p className="text-xs text-slate-300 font-mono mt-0.5">{activeQuestion.questionText}</p>
              </div>
            </div>
            {activeQuestion.expectedAnswer && (
              <span className="px-3 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-mono text-emerald-400 shrink-0">
                Expected: {activeQuestion.expectedAnswer}
              </span>
            )}
          </div>
        )}
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
          <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
            <Users className="w-4 h-4 text-carnival-gold" />
            <span>BUZZED IN: </span>
            <span className="text-white font-extrabold text-base px-2.5 py-0.5 rounded-lg bg-carnival-gold/20 border border-carnival-gold/40 text-carnival-gold">
              {buzzerQueue.length}
            </span>
          </div>
        </div>

        {/* Empty State */}
        {buzzerQueue.length === 0 ? (
          <div className="py-16 text-center space-y-3 rounded-2xl border border-dashed border-white/10 bg-slate-900/40">
            <Sparkles className="w-12 h-12 text-slate-600 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-slate-300 font-mono">No Teams Have Buzzed In Yet</h3>
            <p className="text-xs text-slate-500 font-mono max-w-sm mx-auto">
              Select a question above and click &quot;BROADCAST QUESTION&quot; to trigger the 5-second countdown across all active student portals.
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
                    <div className="flex items-center gap-4">
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

      {/* Questions Bank List */}
      <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-carnival-gold" />
            <h3 className="text-lg font-bold text-white font-mono uppercase">
              Buzzer Question Bank ({questions.length})
            </h3>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Question</span>
          </button>
        </div>

        {questions.length === 0 ? (
          <p className="text-xs text-slate-400 font-mono py-4">No saved questions in the question bank yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {questions.map((q) => (
              <div
                key={q._id}
                className={`p-4 rounded-2xl border transition-all ${
                  selectedQuestionId === q._id
                    ? 'bg-red-950/30 border-red-500/50 shadow-lg'
                    : 'bg-slate-900/60 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-white">{q.title}</h4>
                    <p className="text-xs text-slate-300 font-mono mt-1">{q.questionText}</p>
                    {q.expectedAnswer && (
                      <p className="text-[11px] text-emerald-400 font-mono mt-1">
                        Answer: {q.expectedAnswer}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setSelectedQuestionId(q._id)}
                      className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-bold ${
                        selectedQuestionId === q._id
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {selectedQuestionId === q._id ? 'Selected' : 'Select'}
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/40 transition-all"
                      title="Delete Question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add New Question Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-card border border-white/20 bg-slate-950 space-y-5 shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-carnival-gold" />
                  <h3 className="text-xl font-bold text-white font-mono">Create Rapid Fire Question</h3>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateQuestion} className="space-y-4 font-mono text-sm">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Question Title:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Round 1 - Q1 Algorithm Challenge"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-carnival-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Question Prompt / Text:</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="What is the time complexity of QuickSort in worst case?"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-carnival-gold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Expected Answer (Optional):</label>
                  <input
                    type="text"
                    placeholder="e.g. O(n^2)"
                    value={newExpectedAnswer}
                    onChange={(e) => setNewExpectedAnswer(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-white/15 text-white focus:outline-none focus:border-carnival-gold"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-500 text-white text-xs font-extrabold shadow-lg hover:shadow-red-500/20 transition-all cursor-pointer"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Question'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BuzzerConsole;
