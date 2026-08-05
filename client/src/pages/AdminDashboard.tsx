import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Crown, Users, CheckSquare, Grid } from 'lucide-react';
import { OverviewDashboard } from '../components/admin/OverviewDashboard';
import { TeamManagementView } from '../components/admin/TeamManagementView';
import { TaskManagementView } from '../components/admin/TaskManagementView';
import { ScoreSheetView } from '../components/admin/ScoreSheetView';

export const AdminDashboard: React.FC = () => {
  const location = useLocation();

  // Determine active view tab based on current path
  const getTabFromPath = () => {
    if (location.pathname.includes('/admin/teams')) return 'teams';
    if (location.pathname.includes('/admin/tasks')) return 'tasks';
    if (location.pathname.includes('/admin/scores') || location.pathname.includes('/admin/advantages')) return 'scores';
    return 'overview';
  };

  const activeTab = getTabFromPath();

  return (
    <div className="space-y-6">
      {/* Top Tab Bar for fast navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 max-w-7xl mx-auto">
        <a
          href="/admin"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-carnival-gold text-slate-950 shadow-neon-gold'
              : 'glass-card text-slate-300 hover:text-white'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Task 1: Overview & Charts</span>
        </a>

        <a
          href="/admin/teams"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'teams'
              ? 'bg-carnival-cyan text-slate-950 shadow-neon-cyan'
              : 'glass-card text-slate-300 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Task 2: Team Management</span>
        </a>

        <a
          href="/admin/tasks"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'tasks'
              ? 'bg-carnival-purple text-white shadow-neon-purple'
              : 'glass-card text-slate-300 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Task 3: Task Scheduler</span>
        </a>

        <a
          href="/admin/scores"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'scores'
              ? 'bg-gradient-to-r from-carnival-gold to-carnival-crimson text-slate-950 shadow-neon-gold font-black'
              : 'glass-card text-slate-300 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Task 4: Score Sheet Grid</span>
        </a>
      </div>

      {/* Render Active View */}
      {activeTab === 'overview' && <OverviewDashboard />}
      {activeTab === 'teams' && <TeamManagementView />}
      {activeTab === 'tasks' && <TaskManagementView />}
      {activeTab === 'scores' && <ScoreSheetView />}
    </div>
  );
};
