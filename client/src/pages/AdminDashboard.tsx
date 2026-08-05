import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Crown, Users, CheckSquare, Grid, Download } from 'lucide-react';
import { OverviewDashboard } from '../components/admin/OverviewDashboard';
import { TeamManagementView } from '../components/admin/TeamManagementView';
import { TaskManagementView } from '../components/admin/TaskManagementView';
import { ScoreSheetView } from '../components/admin/ScoreSheetView';
import { ExportModuleView } from '../components/admin/ExportModuleView';
import { ChampionBanner } from '../components/common/ChampionBanner';

export const AdminDashboard: React.FC = () => {
  const location = useLocation();

  // Determine active view tab based on current path
  const getTabFromPath = () => {
    if (location.pathname.includes('/admin/teams')) return 'teams';
    if (location.pathname.includes('/admin/tasks')) return 'tasks';
    if (location.pathname.includes('/admin/scores') || location.pathname.includes('/admin/advantages')) return 'scores';
    if (location.pathname.includes('/admin/export')) return 'export';
    return 'overview';
  };

  const activeTab = getTabFromPath();

  return (
    <div className="space-y-6">
      {/* Massive Champion Banner displayed when isGrandFinale is active */}
      <ChampionBanner />

      {/* Top Tab Bar for fast navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 max-w-7xl mx-auto">
        <Link
          to="/admin"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-carnival-gold text-slate-950 shadow-neon-gold'
              : 'glass-card text-slate-300 hover:text-white'
          }`}
        >
          <Crown className="w-4 h-4" />
          <span>Overview</span>
        </Link>

        <Link
          to="/admin/teams"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'teams'
              ? 'bg-carnival-cyan text-slate-950 shadow-neon-cyan'
              : 'glass-card text-slate-300 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Management</span>
        </Link>

        <Link
          to="/admin/tasks"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'tasks'
              ? 'bg-carnival-purple text-white shadow-neon-purple'
              : 'glass-card text-slate-300 hover:text-white'
          }`}
        >
          <CheckSquare className="w-4 h-4" />
          <span>Task Scheduler</span>
        </Link>

        <Link
          to="/admin/scores"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'scores'
              ? 'bg-gradient-to-r from-carnival-gold to-carnival-crimson text-slate-950 shadow-neon-gold font-black'
              : 'glass-card text-slate-300 hover:text-white'
          }`}
        >
          <Grid className="w-4 h-4" />
          <span>Score Sheet Grid</span>
        </Link>

        <Link
          to="/admin/export"
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all ${
            activeTab === 'export'
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 shadow-neon-gold font-black'
              : 'glass-card text-slate-300 hover:text-white'
          }`}
        >
          <Download className="w-4 h-4" />
          <span>Export Center & PDF</span>
        </Link>
      </div>

      {/* Render Active View */}
      {activeTab === 'overview' && <OverviewDashboard />}
      {activeTab === 'teams' && <TeamManagementView />}
      {activeTab === 'tasks' && <TaskManagementView />}
      {activeTab === 'scores' && <ScoreSheetView />}
      {activeTab === 'export' && <ExportModuleView />}
    </div>
  );
};
