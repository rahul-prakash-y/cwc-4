import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CheckSquare,
  Zap,
  Trophy,
  Award,
  Clock,
  Flame,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Bell,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Gift,
  Lock,
  AlertTriangle,
} from 'lucide-react';

import { DailyTaskView, TaskDetail } from '../../components/student/DailyTaskView';
import { TeamProgress } from '../../components/student/TeamProgress';
import { AdvantagesLocker } from '../../components/student/AdvantagesLocker';
import { LiveLeaderboardTable, LeaderboardTeam } from '../../components/dashboard/LiveLeaderboardTable';
import { ChampionBanner } from '../../components/common/ChampionBanner';
import { AdvantageGrantedToast, AdvantageGrantedPayload } from '../../components/common/AdvantageGrantedToast';
import { triggerCarnivalConfetti } from '../../components/hero/ConfettiEffect';
import { useSocket } from '../../context/SocketContext';
import { MOCK_TEAMS, MOCK_TIMELINE } from '../../data/mockData';

export const StudentDashboard: React.FC = () => {
  const location = useLocation();
  const { socket } = useSocket();

  // Active Team state
  const [teamName] = useState('Cyber Circus Kings');
  const [teamId] = useState('team-1');
  const [rank, setRank] = useState(1);
  const [totalScore, setTotalScore] = useState(1850);
  const [streak] = useState(4);

  // Survival Status state: Safe | Danger | Eliminated | Qualified
  const [teamStatus, setTeamStatus] = useState<'Safe' | 'Danger' | 'Eliminated' | 'Qualified' | string>('Safe');
  const [qualifiedConfettiFired, setQualifiedConfettiFired] = useState(false);

  // Task 4: Real-time Socket.io listener for STATUS_CHANGED event
  useEffect(() => {
    if (!socket) return;

    const handleStatusChanged = (payload: any) => {
      // Match against team ID or team name
      if (payload.teamId === teamId || payload.teamName === teamName) {
        if (payload.status) {
          setTeamStatus(payload.status);
        }
      }
    };

    socket.on('STATUS_CHANGED', handleStatusChanged);

    return () => {
      socket.off('STATUS_CHANGED', handleStatusChanged);
    };
  }, [socket, teamId, teamName]);

  // Task 3: Fire confetti when status transitions to Qualified
  useEffect(() => {
    if (teamStatus === 'Qualified' && !qualifiedConfettiFired) {
      setQualifiedConfettiFired(true);
      triggerCarnivalConfetti();
      // Fire again after a short delay for extra celebration
      setTimeout(() => triggerCarnivalConfetti(), 1200);
    }
    if (teamStatus !== 'Qualified') {
      setQualifiedConfettiFired(false);
    }
  }, [teamStatus, qualifiedConfettiFired]);

  // Advantages / Immunity state
  const [advantages, setAdvantages] = useState([
    {
      id: 'adv-1',
      name: '2x Double Multiplier',
      icon: '⚡',
      type: 'Multiplier',
      status: 'ready',
      description: 'Doubles all points earned in today’s Arena Task.',
    },
    {
      id: 'adv-2',
      name: 'Immunity Shield',
      icon: '🛡️',
      type: 'Shield',
      status: 'active',
      description: 'Shields team against elimination on 1 missed sprint.',
    },
    {
      id: 'adv-[#adv-3]',
      name: 'Golden Hint Wheel',
      icon: '🎡',
      type: 'Hint',
      status: 'used',
      description: 'Revealed architectural clue for Day 3.',
    },
  ]);

  const activeAdvantagesCount = advantages.filter((a) => a.status === 'active').length;
  const immunityActive = advantages.some((a) => a.type === 'Shield' && a.status === 'active');

  // Global Pinned Announcements ticker
  const [announcements] = useState([
    {
      id: 'ann-1',
      title: '🔊 Boss Fight Window Extended',
      message: 'Day 5 Arena Boss Fight deadline extended by 30 mins IST!',
      time: '10m ago',
      type: 'urgent',
    },
    {
      id: 'ann-2',
      title: '⚡ 2x Multiplier Bonus Active',
      message: 'Equip your 2x Double Multiplier before submitting today!',
      time: '1h ago',
    },
    {
      id: 'ann-3',
      title: '🎁 Bonus Clue Released',
      message: 'Check Discord #boss-fight channel for WebSocket tips.',
      time: '2h ago',
    },
  ]);

  // Today's Task Brief
  const sampleTask: TaskDetail = {
    id: 'task-day5',
    dayNumber: 5,
    title: 'Mid-Season Arena Rapid Fire: Real-Time WebSockets Architecture',
    category: 'Rapid Fire',
    type: 'Rapid Fire',
    points: 500,
    duration: '4 Hours',
    startTime: '02:00 PM',
    endTime: '06:00 PM',
    deadline: '03h 42m 18s',
    interactiveTimeLimit: 60,
    mcqOptions: [
      'A) socket.emit("join-room", roomName)',
      'B) socket.broadcast.to(room).emit(event)',
      'C) socket.on("connect_error", callback)',
      'D) io.to(room).emit("SCORE_UPDATED", payload)',
    ],
    description: `Which Socket.io server-side call broadcasts an event to all clients in specified rooms? Select your answer card before the Rapid Fire timer expires!`,
    constraints: ['Max 60 seconds per Rapid Fire attempt', 'Auto-submission enforced on timer expiration'],
    requirements: [
      'Select Option A, B, C, or D.',
      'Click "Lock In Card" to confirm your choice.',
      'Submit your answer or let the 60s Rapid Fire timer auto-submit.',
    ],
  };

  // Live Countdown Timer logic
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 42, seconds: 18 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 0, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Leaderboard Teams setup
  const initialLeaderboardTeams: LeaderboardTeam[] = MOCK_TEAMS.map((t) => ({
    ...t,
    trend: t.rank === 1 ? 'same' : t.rank === 2 ? 'up' : t.rank === 5 ? 'up' : 'down',
    trendValue: t.rank === 2 ? 2 : t.rank === 5 ? 1 : 1,
    played: 5,
    wins: t.rank <= 2 ? 4 : t.rank <= 4 ? 3 : 2,
  }));

  const scrollToTask = () => {
    const el = document.getElementById('daily-task-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRealtimeAdvantage = (payload: AdvantageGrantedPayload) => {
    if (payload.immunity) {
      setAdvantages((prev) => [
        ...prev,
        {
          id: `adv-${Date.now()}`,
          name: 'Immunity Shield',
          icon: '🛡️',
          type: 'Shield',
          status: 'active',
          description: 'Shields team against elimination on 1 missed sprint.',
        },
      ]);
    } else if (payload.advantage) {
      setAdvantages((prev) => [
        ...prev,
        {
          id: `adv-${Date.now()}`,
          name: payload.advantage,
          icon: payload.advantage.toLowerCase().includes('coin') ? '🪙' : payload.advantage.toLowerCase().includes('time') ? '⏳' : '⚡',
          type: payload.advantage,
          status: 'active',
          description: `Admin granted perk: ${payload.advantage}`,
        },
      ]);
    }
  };

  const currentPath = location.pathname;

  return (
    <div
      className={`space-y-8 max-w-7xl mx-auto pb-12 transition-all duration-500 relative ${
        teamStatus === 'Danger'
          ? 'border-2 border-orange-500/80 rounded-3xl p-3 sm:p-6 animate-pulse-orange bg-orange-950/10'
          : teamStatus === 'Eliminated'
          ? 'rounded-3xl p-3 sm:p-6'
          : teamStatus === 'Qualified'
          ? 'border-2 border-amber-400/60 rounded-3xl p-3 sm:p-6 shadow-[0_0_40px_rgba(255,215,0,0.3)]'
          : ''
      }`}
    >
      <ChampionBanner />
      <AdvantageGrantedToast onAdvantageReceived={handleRealtimeAdvantage} />

      {/* Task 3: Danger Zone Alert Banner */}
      <AnimatePresence>
        {teamStatus === 'Danger' && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-950/80 via-amber-950/60 to-orange-950/80 border-2 border-orange-500/60 shadow-[0_0_30px_rgba(249,115,22,0.4)] flex items-center gap-4"
          >
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-orange-500/20 border border-orange-500/50 flex items-center justify-center text-3xl animate-pulse">
              ⚠️
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-black text-orange-300 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                You are in the Danger Zone
              </h3>
              <p className="text-sm text-orange-200/80 mt-0.5">
                Score high today to survive. Your team is at risk of elimination — give it your best shot! 🔥
              </p>
            </div>
            <div className="hidden sm:block px-4 py-2 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 font-mono text-xs font-bold animate-pulse">
              AT RISK
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task 3: Qualified Celebration Banner */}
      <AnimatePresence>
        {teamStatus === 'Qualified' && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/80 via-yellow-950/60 to-amber-950/80 border-2 border-amber-400/60 shadow-[0_0_30px_rgba(255,215,0,0.4)] flex items-center gap-4"
          >
            <div className="w-14 h-14 shrink-0 rounded-2xl bg-amber-400/20 border border-amber-400/50 flex items-center justify-center text-3xl">
              🏆
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-black text-amber-300 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                Congratulations! You&apos;ve Qualified! 🎉
              </h3>
              <p className="text-sm text-amber-200/80 mt-0.5">
                Your team has secured its place in the next stage. Keep the momentum going!
              </p>
            </div>
            <div className="hidden sm:block px-4 py-2 rounded-xl bg-amber-400/20 border border-amber-400/50 text-amber-300 font-mono text-xs font-bold shadow-[0_0_15px_rgba(255,215,0,0.3)]">
              QUALIFIED ✨
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TASK 1: Student Top Bar */}
      <section id="overview-section">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 sm:p-8 rounded-3xl glass-card border border-carnival-gold/30 shadow-2xl relative overflow-hidden bg-gradient-to-r from-[#1A1838]/90 via-[#15132B]/90 to-[#1F1735]/90 space-y-4"
        >
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              {/* Header Badges Pill Row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Current Rank Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 text-xs font-mono font-bold shadow-neon-gold">
                  <Award className="w-3.5 h-3.5" />
                  <span>RANK #{rank} BADGE</span>
                </span>

                {/* Total Points Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-carnival-cyan/20 text-carnival-cyan border border-carnival-cyan/40 text-xs font-mono font-bold shadow-neon-cyan">
                  <Zap className="w-3.5 h-3.5" />
                  <span>{totalScore.toLocaleString()} TOTAL POINTS</span>
                </span>

                {/* Active Advantages Count */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-carnival-purple/20 text-carnival-purple border border-carnival-purple/40 text-xs font-mono font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeAdvantagesCount} ADVANTAGES ACTIVE</span>
                </span>

                {/* Immunity Status Pill */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold ${
                  immunityActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-neon-gold animate-pulse'
                    : 'bg-white/10 text-slate-400 border border-white/10'
                }`}>
                  <Shield className="w-3.5 h-3.5" />
                  <span>IMMUNITY: {immunityActive ? 'PROTECTED 🛡️' : 'AVAILABLE ⚪'}</span>
                </span>

                {/* Status Simulator toggles */}
                <div className="inline-flex items-center gap-1 p-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-mono">
                  <span className="text-slate-400 px-1 font-bold">Status:</span>
                  <button
                    onClick={() => setTeamStatus('Safe')}
                    className={`px-2 py-0.5 rounded-full transition-all ${teamStatus === 'Safe' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-300'}`}
                  >
                    Safe
                  </button>
                  <button
                    onClick={() => setTeamStatus('Danger')}
                    className={`px-2 py-0.5 rounded-full transition-all ${teamStatus === 'Danger' ? 'bg-orange-500 text-slate-950 font-bold' : 'text-slate-300'}`}
                  >
                    Danger
                  </button>
                  <button
                    onClick={() => setTeamStatus('Eliminated')}
                    className={`px-2 py-0.5 rounded-full transition-all ${teamStatus === 'Eliminated' ? 'bg-rose-500 text-white font-bold' : 'text-slate-300'}`}
                  >
                    Eliminated
                  </button>
                  <button
                    onClick={() => setTeamStatus('Qualified')}
                    className={`px-2 py-0.5 rounded-full transition-all ${teamStatus === 'Qualified' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300'}`}
                  >
                    Qualified
                  </button>
                </div>
              </div>

              {/* Welcome Team Name Header */}
              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex flex-wrap items-center gap-3">
                Welcome <span className="text-gradient-carnival">{teamName}</span> 🔥
              </h1>
              <p className="text-slate-300 text-sm sm:text-base max-w-2xl">
                CWC Season 4 Student Command • Manage arena submissions, track 10-day carnival lights, and apply advantage power-ups.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Task 3: Full-screen Eliminated Overlay Lock Screen */}
      <AnimatePresence>
        {teamStatus === 'Eliminated' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 200, damping: 22, delay: 0.2 }}
              className="p-10 sm:p-14 rounded-3xl bg-gradient-to-br from-rose-950/95 via-[#1C0F22] to-[#12081A] border-2 border-rose-500/50 shadow-[0_0_60px_rgba(220,38,38,0.35)] text-center space-y-6 max-w-2xl w-full relative overflow-hidden"
            >
              {/* Decorative background glow */}
              <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-rose-600 blur-[120px]" />
              </div>

              <div className="relative z-10 space-y-6">
                <div className="w-24 h-24 rounded-3xl bg-rose-500/15 text-rose-400 border-2 border-rose-500/40 flex items-center justify-center mx-auto text-5xl shadow-[0_0_30px_rgba(220,38,38,0.25)]">
                  🎪
                </div>
                <h2 className="text-3xl sm:text-5xl font-black text-white leading-tight">
                  Thank You for Participating<br />in CWC Season 4! 🎪
                </h2>
                <p className="text-slate-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
                  Your team <strong className="text-rose-400 font-mono font-extrabold">{teamName}</strong> has completed its run in this season&apos;s coding arena. We sincerely appreciate your dedication, creativity, and code contributions!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-xs font-bold">
                    <Lock className="w-4 h-4" /> All Submissions & Controls Locked
                  </div>
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 text-slate-400 border border-white/10 font-mono text-xs font-bold">
                    <Shield className="w-4 h-4" /> Season 4 Participant
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Grid Cards — grayscale disabled when Eliminated */}
      <div className={teamStatus === 'Eliminated' ? 'filter grayscale opacity-50 pointer-events-none select-none' : ''}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Card 1: Today's Task Brief */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl glass-card border border-carnival-crimson/40 shadow-neon-crimson flex flex-col justify-between bg-gradient-to-b from-[#1C1226]/90 to-[#120F24]/90"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-carnival-crimson mb-2">
                <span>DAY {sampleTask.dayNumber} TASK BRIEF</span>
                <span className="text-carnival-gold">+{sampleTask.points} PTS</span>
              </div>
              <h3 className="text-base font-extrabold text-white line-clamp-2 mb-1">{sampleTask.title}</h3>
              <p className="text-xs text-slate-300 line-clamp-2">Category: {sampleTask.category}</p>
            </div>
            <button
              onClick={scrollToTask}
              className="mt-4 w-full py-2 px-3 rounded-xl bg-carnival-crimson text-white text-xs font-bold flex items-center justify-center gap-1.5 hover:brightness-110"
            >
              <span>View Brief</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </motion.div>

          {/* Card 2: Live Countdown Timer */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl glass-card border border-carnival-cyan/40 shadow-neon-cyan flex flex-col justify-between bg-gradient-to-b from-[#101F30]/90 to-[#120F24]/90"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-carnival-cyan mb-2">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> COUNTDOWN</span>
                <span className="text-[10px] text-slate-400">Deadline</span>
              </div>
              <div className="flex items-center justify-center gap-1 my-2 font-mono font-black text-xl text-white">
                <span className="p-1.5 bg-black/60 rounded-lg">{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span className="text-carnival-cyan">:</span>
                <span className="p-1.5 bg-black/60 rounded-lg">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                <span className="text-carnival-cyan">:</span>
                <span className="p-1.5 bg-black/60 rounded-lg text-carnival-cyan">{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono text-center">
              Active Arena Deadline
            </div>
          </motion.div>

          {/* Card 3: Leaderboard Position Summary & Trends */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl glass-card border border-carnival-gold/40 shadow-neon-gold flex flex-col justify-between bg-gradient-to-b from-[#241E11]/90 to-[#120F24]/90"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-carnival-gold mb-2">
                <span>LEADERBOARD TREND</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3 text-emerald-400" /> ↑2
                </span>
              </div>
              <div className="text-2xl font-black text-white font-mono flex items-center gap-2 my-1">
                <span>Rank #{rank}</span>
                <span className="text-sm text-carnival-gold font-normal">(Top 1%)</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Trends: <span className="text-emerald-400 font-bold font-mono">↑2 Up</span> from yesterday.
              </p>
            </div>
            <div className="text-[10px] text-carnival-gold font-mono flex items-center gap-1">
              <span>Trends: ↑2, ↓1, NEW supported</span>
            </div>
          </motion.div>

          {/* Card 4: Active Advantages & Immunities Available */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl glass-card border border-carnival-purple/40 shadow-neon-purple flex flex-col justify-between bg-gradient-to-b from-[#1C1330]/90 to-[#120F24]/90"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-carnival-purple mb-2">
                <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 fill-carnival-purple" /> ADVANTAGES</span>
                <span className="text-white bg-carnival-purple/30 px-2 py-0.5 rounded">{advantages.length} Total</span>
              </div>
              <div className="space-y-1 my-1 text-xs">
                <div className="flex justify-between text-slate-200">
                  <span>Active Perks:</span>
                  <strong className="text-emerald-400 font-mono">{activeAdvantagesCount}</strong>
                </div>
                <div className="flex justify-between text-slate-200">
                  <span>Immunity Status:</span>
                  <strong className="text-carnival-gold font-mono">{immunityActive ? 'Shielded' : 'Available'}</strong>
                </div>
              </div>
            </div>
            <div className="text-[10px] text-carnival-purple font-mono">
              Ready for immediate activation
            </div>
          </motion.div>

          {/* Card 5: Global Pinned Announcements Ticker */}
          <motion.div
            whileHover={{ y: -4 }}
            className="p-5 rounded-2xl glass-card border border-carnival-cyan/40 shadow-neon-cyan flex flex-col justify-between bg-gradient-to-b from-[#10192A]/90 to-[#120F24]/90"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono font-bold text-carnival-cyan mb-2">
                <span className="flex items-center gap-1"><Bell className="w-3.5 h-3.5" /> BROADCAST TICKER</span>
                <span className="text-[10px] text-carnival-cyan">PINNED</span>
              </div>
              <div className="space-y-1.5 max-h-[85px] overflow-y-auto">
                {announcements.map((a) => (
                  <div key={a.id} className="p-1.5 rounded bg-black/40 text-[11px] text-slate-200">
                    <span className="font-bold text-white block truncate">{a.title}</span>
                    <span className="text-slate-400 text-[10px] block truncate">{a.message}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              Real-time websocket feed
            </div>
          </motion.div>
        </div>

        {/* Dynamic Main Dashboard Views */}
        <div className="space-y-10 mt-8">
          <section id="daily-task-section">
            <DailyTaskView task={sampleTask} status={teamStatus} onTaskSubmitted={() => setTotalScore((prev) => prev + 500)} />
          </section>

          <TeamProgress timeline={MOCK_TIMELINE as any} currentDayNumber={5} />

          <AdvantagesLocker onApplyAdvantage={(id, type) => console.log('Applied', id, type)} />

          <LiveLeaderboardTable teams={initialLeaderboardTeams} currentTeamId="team-1" />
        </div>
      </div>
    </div>
  );
};
