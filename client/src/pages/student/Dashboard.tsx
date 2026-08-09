import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, CheckSquare, Zap, Heart, LayoutDashboard, Flame, Radio, Calendar } from 'lucide-react';
import { Leaderboard } from '../../components/student/Leaderboard';
import { DailyTaskView } from '../../components/student/DailyTaskView';
import { DaySchedule } from '../../components/student/DaySchedule';
import { AdvantagesLocker } from '../../components/student/AdvantagesLocker';
import { VotingBooth } from '../../components/student/VotingBooth';
import { TeamProgress } from '../../components/student/TeamProgress';
import { MarksSection } from '../../components/student/MarksSection';
import { BuzzerButton } from '../../components/student/BuzzerButton';

export const StudentDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVotingOpen, setIsVotingOpen] = useState(false);
  const [studentTeam, setStudentTeam] = useState<any>(null);

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const token = localStorage.getItem('cwc_token') || localStorage.getItem('token');
        const res = await fetch('/api/student/dashboard', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setStudentTeam(data.team);
        }
      } catch (err) {
        console.warn('Failed to fetch student dashboard data:', err);
      }
    };

    fetchStudentData();
  }, []);

  // Derive current active tab strictly from URL pathname
  const path = location.pathname.toLowerCase();
  const currentTab = path.includes('/tasks')
    ? 'tasks'
    : path.includes('/schedule')
    ? 'schedule'
    : path.includes('/advantages')
    ? 'advantages'
    : path.includes('/leaderboard')
    ? 'leaderboard'
    : path.includes('/buzzer')
    ? 'buzzer'
    : 'overview';

  const handleTabClick = (tab: 'overview' | 'tasks' | 'schedule' | 'advantages' | 'leaderboard' | 'buzzer') => {
    switch (tab) {
      case 'overview':
        navigate('/student');
        break;
      case 'tasks':
        navigate('/student/tasks');
        break;
      case 'schedule':
        navigate('/student/schedule');
        break;
      case 'advantages':
        navigate('/student/advantages');
        break;
      case 'leaderboard':
        navigate('/student/leaderboard');
        break;
      case 'buzzer':
        navigate('/student/buzzer');
        break;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Voting Booth Modal Overlay */}
      <VotingBooth isOpen={isVotingOpen} onClose={() => setIsVotingOpen(false)} />

      {/* Student Arena Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-100 via-white to-slate-100 dark:from-[#170E28] dark:via-[#241338] dark:to-[#120B20] p-6 sm:p-8 border border-slate-200 dark:border-carnival-gold/30 shadow-sm dark:shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-carnival-gold/20 border border-amber-500/30 dark:border-carnival-gold/40 text-amber-700 dark:text-carnival-gold text-xs font-mono font-bold mb-2">
              <Flame className="w-3.5 h-3.5 text-amber-600 dark:text-carnival-gold animate-bounce" />
              <span>CARNIVAL ARENA • STUDENT PORTAL</span>
            </div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Student Dashboard 🎪</h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-sans">
              Track squad points, tackle interactive daily coding challenges, lock in power-up advantages, and cast daily votes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-2xl glass-card border border-slate-200 dark:border-carnival-gold/30 font-mono text-xs text-right bg-white/80 dark:bg-white/5">
              <div className="text-[10px] text-amber-600 dark:text-carnival-gold uppercase font-bold">STATUS</div>
              <div className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>ARENA ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-slate-200 dark:border-white/10 pt-4 scrollbar-none">
          <button
            onClick={() => handleTabClick('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'overview'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 dark:from-carnival-gold dark:to-amber-500 text-white dark:text-slate-950 font-black shadow-md dark:shadow-neon-gold'
                : 'glass-card text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Arena Overview</span>
          </button>

          <button
            onClick={() => handleTabClick('buzzer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'buzzer'
                ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white font-black shadow-md animate-pulse'
                : 'glass-card text-rose-600 dark:text-rose-300 hover:text-slate-900 dark:hover:text-white border-rose-300 dark:border-rose-500/30'
            }`}
          >
            <Radio className="w-4 h-4 text-rose-600 dark:text-red-400" />
            <span>Rapid Fire Buzzer</span>
          </button>
          <button
            onClick={() => handleTabClick('tasks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'tasks'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-black shadow-md dark:shadow-neon-purple'
                : 'glass-card text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Daily Tasks</span>
          </button>

          {/* <button
            onClick={() => handleTabClick('schedule')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'schedule'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black shadow-md'
                : 'glass-card text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>7-Day Schedule</span>
          </button> */}

          {/* <button
            onClick={() => handleTabClick('advantages')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'advantages'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-500 dark:to-blue-500 text-white dark:text-slate-950 font-black shadow-md dark:shadow-neon-cyan'
                : 'glass-card text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Power-Up Advantages</span>
          </button> */}

          <button
            onClick={() => handleTabClick('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'leaderboard'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 text-white dark:text-slate-950 font-black shadow-md'
                : 'glass-card text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setIsVotingOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              isVotingOpen
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black shadow-md'
                : 'glass-card text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Daily Fan Voting</span>
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      {currentTab === 'overview' && (
        <div className="space-y-8">
          <TeamProgress />
          <MarksSection />
          {/* <DailyTaskView /> */}
          <Leaderboard currentTeamId={studentTeam?.id || studentTeam?._id} />
        </div>
      )}

      {currentTab === 'buzzer' && (
        <div className="py-4">
          <BuzzerButton />
        </div>
      )}

      {currentTab === 'tasks' && (
        <div className="space-y-8">
          {/* <DailyTaskView /> */}
          <DaySchedule />
        </div>
      )}

      {currentTab === 'schedule' && <DaySchedule />}
      {currentTab === 'advantages' && <AdvantagesLocker />}
      {currentTab === 'leaderboard' && <Leaderboard />}
    </div>
  );
};

export default StudentDashboard;
