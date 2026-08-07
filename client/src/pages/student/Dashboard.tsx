import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Trophy, CheckSquare, Zap, Heart, LayoutDashboard, Flame, Radio } from 'lucide-react';
import { Leaderboard } from '../../components/student/Leaderboard';
import { DailyTaskView } from '../../components/student/DailyTaskView';
import { AdvantagesLocker } from '../../components/student/AdvantagesLocker';
import { VotingBooth } from '../../components/student/VotingBooth';
import { TeamProgress } from '../../components/student/TeamProgress';
import { MarksSection } from '../../components/student/MarksSection';
import { BuzzerButton } from '../../components/student/BuzzerButton';

export const StudentDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVotingOpen, setIsVotingOpen] = useState(false);

  // Derive current active tab strictly from URL pathname
  const path = location.pathname.toLowerCase();
  const currentTab = path.includes('/tasks')
    ? 'tasks'
    : path.includes('/advantages')
    ? 'advantages'
    : path.includes('/leaderboard')
    ? 'leaderboard'
    : path.includes('/buzzer')
    ? 'buzzer'
    : 'overview';

  const handleTabClick = (tab: 'overview' | 'tasks' | 'advantages' | 'leaderboard' | 'buzzer') => {
    switch (tab) {
      case 'overview':
        navigate('/student');
        break;
      case 'tasks':
        navigate('/student/tasks');
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
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#170E28] via-[#241338] to-[#120B20] p-6 sm:p-8 border border-carnival-gold/30 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-carnival-gold/20 border border-carnival-gold/40 text-carnival-gold text-xs font-mono font-bold mb-2">
              <Flame className="w-3.5 h-3.5 text-carnival-gold animate-bounce" />
              <span>CARNIVAL ARENA • STUDENT PORTAL</span>
            </div>
            <h1 className="text-3xl font-black text-white">Student Dashboard 🎪</h1>
            <p className="text-xs text-slate-300 mt-1 font-sans">
              Track squad points, tackle interactive daily coding challenges, lock in power-up advantages, and cast daily votes.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-2xl glass-card border border-carnival-gold/30 font-mono text-xs text-right">
              <div className="text-[10px] text-carnival-gold uppercase font-bold">STATUS</div>
              <div className="font-extrabold text-emerald-400 text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>ARENA ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-white/10 pt-4 scrollbar-none">
          <button
            onClick={() => handleTabClick('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'overview'
                ? 'bg-gradient-to-r from-carnival-gold to-amber-500 text-slate-950 font-black shadow-neon-gold'
                : 'glass-card text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Arena Overview</span>
          </button>

          <button
            onClick={() => handleTabClick('buzzer')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'buzzer'
                ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-500 text-white font-black shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse'
                : 'glass-card text-rose-300 hover:text-white border-rose-500/30'
            }`}
          >
            <Radio className="w-4 h-4 text-red-400" />
            <span>Rapid Fire Buzzer</span>
          </button>

          <button
            onClick={() => handleTabClick('tasks')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'tasks'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black shadow-neon-purple'
                : 'glass-card text-slate-300 hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>Daily Tasks</span>
          </button>

          <button
            onClick={() => handleTabClick('advantages')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'advantages'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 font-black shadow-neon-cyan'
                : 'glass-card text-slate-300 hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Power-Up Advantages</span>
          </button>

          <button
            onClick={() => handleTabClick('leaderboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              currentTab === 'leaderboard'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                : 'glass-card text-slate-300 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Leaderboard</span>
          </button>

          <button
            onClick={() => setIsVotingOpen(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              isVotingOpen
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white font-black shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                : 'glass-card text-slate-300 hover:text-white'
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
          {/* <BuzzerButton /> */}
          <TeamProgress />
          <MarksSection />
          <DailyTaskView />
          <Leaderboard />
        </div>
      )}

      {currentTab === 'buzzer' && (
        <div className="py-4">
          <BuzzerButton />
        </div>
      )}

      {currentTab === 'tasks' && <DailyTaskView />}
      {currentTab === 'advantages' && <AdvantagesLocker />}
      {currentTab === 'leaderboard' && <Leaderboard />}
    </div>
  );
};

export default StudentDashboard;
