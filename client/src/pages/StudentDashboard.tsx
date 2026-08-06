import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Zap, Trophy } from 'lucide-react';
import { TopBarBanner, AdvantageItem } from '../components/dashboard/TopBarBanner';
import { DashboardCardsGrid, AnnouncementItem } from '../components/dashboard/DashboardCardsGrid';
import { DailyTaskView, TaskDetail } from '../components/dashboard/DailyTaskView';
import { TeamProgressTracker } from '../components/dashboard/TeamProgressTracker';
import { LiveLeaderboardTable, LeaderboardTeam } from '../components/dashboard/LiveLeaderboardTable';
import { PowerUpVaultView } from '../components/dashboard/PowerUpVaultView';
import { ChampionBanner } from '../components/common/ChampionBanner';
import { MOCK_TEAMS, MOCK_TIMELINE } from '../data/mockData';

export const StudentDashboard: React.FC = () => {
  const location = useLocation();

  // Active Team state (Cyber Circus Kings - Rank #1)
  const [teamName] = useState('Cyber Circus Kings');
  const [rank, setRank] = useState(1);
  const [totalScore, setTotalScore] = useState(1850);
  const [streak] = useState(4);

  // Survival Status state: Safe | Danger | Eliminated | Qualified
  const [teamStatus, setTeamStatus] = useState<'Safe' | 'Danger' | 'Eliminated' | 'Qualified' | string>('Safe');

  // Real-time backend status broadcast listener
  React.useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/v1/public/teams/events');
      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.teamName === teamName || data.teamId === 'team-1') {
            setTeamStatus(data.status);
          }
        } catch (e) {}
      };
    } catch (err) {}

    return () => {
      if (eventSource) eventSource.close();
    };
  }, [teamName]);

  // Advantages / Immunities state
  const [advantages, setAdvantages] = useState<AdvantageItem[]>([
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
      status: 'ready',
      description: 'Shields team against point deduction on 1 missed sprint.',
    },
    {
      id: 'adv-3',
      name: 'Golden Hint Wheel',
      icon: '🎡',
      type: 'Hint',
      status: 'used',
      description: 'Revealed architectural clue for Day 3.',
    },
  ]);

  const handleActivateAdvantage = (id: string) => {
    setAdvantages((prev) =>
      prev.map((adv) => (adv.id === id ? { ...adv, status: 'active' } : adv))
    );
  };

  // Announcements state
  const [announcements] = useState<AnnouncementItem[]>([
    {
      id: 'ann-1',
      title: '🔊 Boss Fight Window Extended',
      message: 'Day 5 Arena Boss Fight deadline extended by 30 mins IST!',
      time: '10m ago',
      type: 'urgent',
      isNew: true,
    },
    {
      id: 'ann-2',
      title: '⚡ 2x Multiplier Bonus Active',
      message: 'Equip your 2x Double Multiplier before submitting today!',
      time: '1h ago',
      type: 'bonus',
    },
    {
      id: 'ann-3',
      title: '🎁 Bonus Architectural Clue',
      message: 'Check Discord #boss-fight channel for WebSocket tips.',
      time: '2h ago',
      type: 'general',
    },
  ]);

  // Today's Task Details
  const activeTask: TaskDetail = {
    id: 'task-day5',
    dayNumber: 5,
    title: 'Mid-Season Arena Boss Fight: Real-Time Multiplayer Arena',
    category: 'Boss Fight',
    points: 500,
    duration: '4 Hours',
    deadline: '03h 42m 18s',
    description:
      'Build and deploy a real-time multiplayer mini-game application incorporating Fastify WebSockets for synchronized state, Framer Motion UI effects, and dynamic team leaderboard score tracking.',
    requirements: [
      'Provide a public GitHub repository link with clean commits and documentation.',
      'Demonstrate real-time WebSocket communication between at least 2 clients.',
      'Upload a Cloudinary video demonstration or architectural PDF report.',
      'Ensure smooth CSS/Framer Motion animations for player score updates.',
    ],
    submissionTypesAllowed: ['github', 'cloudinary', 'pdf'],
  };

  // Leaderboard Teams setup with IPL fields & trends
  const initialLeaderboardTeams: LeaderboardTeam[] = MOCK_TEAMS.map((t) => ({
    ...t,
    trend: t.rank === 1 ? 'same' : t.rank === 2 ? 'up' : t.rank === 5 ? 'up' : 'down',
    trendValue: t.rank === 2 ? 2 : t.rank === 5 ? 1 : 1,
    played: 5,
    wins: t.rank <= 2 ? 4 : t.rank <= 4 ? 3 : 2,
  }));

  const handleTaskSubmitted = () => {
    setTotalScore((prev) => prev + 500);
  };

  const scrollToTask = () => {
    const el = document.getElementById('daily-task-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const currentPath = location.pathname;

  const dashboardTabs = [
    { label: 'Overview', path: '/student', icon: LayoutDashboard },
    { label: 'Daily Arena Tasks', path: '/student/tasks', icon: CheckSquare },
    { label: 'Power-Up Vault', path: '/student/advantages', icon: Zap },
    { label: 'Team Leaderboard', path: '/student/leaderboard', icon: Trophy },
  ];

  return (
    <div
      className={`space-y-8 max-w-7xl mx-auto pb-12 transition-all duration-500 ${
        teamStatus === 'Danger'
          ? 'border-2 border-orange-500/80 rounded-3xl p-3 sm:p-6 animate-pulse-orange bg-orange-950/10'
          : teamStatus === 'Eliminated'
          ? 'border-2 border-rose-500/50 rounded-3xl p-3 sm:p-6 bg-rose-950/15'
          : ''
      }`}
    >
      {/* Champion Banner when isGrandFinale is active */}
      <ChampionBanner />

      {/* Top Bar Header (Always visible) */}
      <section id="overview-section">
        <TopBarBanner
          teamName={teamName}
          rank={rank}
          totalScore={totalScore}
          streak={streak}
          advantages={advantages}
          onActivateAdvantage={handleActivateAdvantage}
          status={teamStatus}
          onStatusChange={setTeamStatus}
        />
      </section>

      {/* Respectful Lockdown Banner when team is Eliminated */}
      {teamStatus === 'Eliminated' && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/90 via-[#1A0F1E] to-rose-950/90 border-2 border-rose-500/60 shadow-neon-crimson text-center space-y-4 relative overflow-hidden"
        >
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mx-auto text-3xl shadow-lg">
            🎪
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Thank You for Participating in CWC Season 4! 🎪
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Your team <strong className="text-rose-400 font-mono font-extrabold">{teamName}</strong> has concluded its journey in this season&apos;s competition arena. We sincerely thank you for your enthusiasm, hard work, and amazing achievements!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono text-xs font-bold">
            🔒 Task Submissions & Arena Controls Are Locked
          </div>
        </motion.div>
      )}

      {/* Navigation Tab Bar matching URL routes */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#151329]/90 border border-white/10 overflow-x-auto scrollbar-none">
        {dashboardTabs.map((tab) => {
          const isActive =
            tab.path === '/student'
              ? currentPath === '/student' || currentPath === '/student/'
              : currentPath.startsWith(tab.path);

          return (
            <Link
              key={tab.path}
              to={tab.path}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-carnival-crimson to-carnival-purple text-white shadow-neon-crimson'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Dynamic Content Views based on active route */}
      <div className={teamStatus === 'Eliminated' ? 'filter grayscale-[85%] pointer-events-none opacity-80 select-none' : ''}>
        <AnimatePresence mode="wait">
          {/* ROUTE 1: Overview (/student) */}
          {(currentPath === '/student' || currentPath === '/student/') && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-10"
            >
              <DashboardCardsGrid
                currentDay={activeTask.dayNumber}
                taskTitle={activeTask.title}
                taskCategory={activeTask.category}
                taskPoints={activeTask.points}
                announcements={announcements}
                onSelectTaskCard={scrollToTask}
              />

              <section id="daily-task-section">
                <DailyTaskView task={activeTask} status={teamStatus} onTaskSubmitted={handleTaskSubmitted} />
              </section>

              <TeamProgressTracker timeline={MOCK_TIMELINE} currentDayNumber={activeTask.dayNumber} />

              <LiveLeaderboardTable teams={initialLeaderboardTeams} currentTeamId="team-1" />
            </motion.div>
          )}

          {/* ROUTE 2: Daily Arena Tasks (/student/tasks) */}
          {currentPath.startsWith('/student/tasks') && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-10"
            >
              <DailyTaskView task={activeTask} status={teamStatus} onTaskSubmitted={handleTaskSubmitted} />
              <TeamProgressTracker timeline={MOCK_TIMELINE} currentDayNumber={activeTask.dayNumber} />
            </motion.div>
          )}

          {/* ROUTE 3: Power-Up Vault (/student/advantages) */}
          {currentPath.startsWith('/student/advantages') && (
            <motion.div
              key="advantages"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-10"
            >
              <PowerUpVaultView
                advantages={advantages}
                onActivateAdvantage={handleActivateAdvantage}
                streak={streak}
              />
            </motion.div>
          )}

          {/* ROUTE 4: Team Leaderboard (/student/leaderboard) */}
          {currentPath.startsWith('/student/leaderboard') && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-10"
            >
              <LiveLeaderboardTable teams={initialLeaderboardTeams} currentTeamId="team-1" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
