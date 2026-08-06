import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { Crown, Users, CheckSquare, Grid, Download, ArrowLeft, Menu, X, ShieldAlert, Sparkles, Flame, Trophy, LogOut } from 'lucide-react';
import { useGrandFinale } from '../context/GrandFinaleContext';
import { useAuth } from '../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isGrandFinale, toggleGrandFinale, loading: toggleLoading } = useGrandFinale();
  const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();

  // Route protection for Admin area
  if (!isLoading && (!isAuthenticated || !isAdmin)) {
    return <Navigate to="/login" replace />;
  }

  const adminNavItems = [
    { label: 'Overview Dashboard', path: '/admin', icon: Crown },
    { label: 'Team Management', path: '/admin/teams', icon: Users },
    { label: 'Task Scheduler', path: '/admin/tasks', icon: CheckSquare },
    { label: 'Score Sheet Grid', path: '/admin/scores', icon: Grid },
    { label: 'Export & Reports', path: '/admin/export', icon: Download },
  ];

  return (
    <div className={`min-h-screen bg-[#0B0A16] text-slate-100 flex font-sans selection:bg-carnival-gold selection:text-black ${isGrandFinale ? 'grand-finale-gold' : ''}`}>
      {/* Admin Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 w-64 h-screen bg-[#1A1228]/95 backdrop-blur-2xl border-r border-carnival-crimson/30 flex flex-col justify-between p-4 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-carnival-gold via-carnival-crimson to-carnival-purple p-0.5 shadow-neon-gold">
              <div className="w-full h-full rounded-[10px] bg-[#0B0A16] flex items-center justify-center font-mono font-bold text-carnival-gold text-sm">
                👑
              </div>
            </div>
            <div>
              <div className="font-extrabold text-white text-base">Admin Command</div>
              <div className="text-[10px] text-carnival-gold font-mono flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-carnival-gold" />
                <span>Ringmaster Controls</span>
              </div>
            </div>
          </div>

          {/* System Status & Grand Finale Badge */}
          <div className={`p-3 rounded-xl border mb-6 font-mono text-xs transition-all ${
            isGrandFinale ? 'bg-amber-500/20 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'bg-carnival-gold/10 border-carnival-gold/30'
          }`}>
            <div className="text-[10px] uppercase text-carnival-gold font-bold flex items-center justify-between">
              <span>ARENA MODE</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>
            <div className="font-extrabold text-white flex items-center gap-1.5 mt-1">
              {isGrandFinale ? (
                <span className="text-yellow-400 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> GRAND FINALE ACTIVE
                </span>
              ) : (
                <span className="text-carnival-cyan flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5" /> CARNIVAL ARENA LIVE
                </span>
              )}
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-carnival-gold to-carnival-amber text-slate-950 shadow-neon-gold font-black'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info & Exit */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Admin</span>
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card text-xs font-semibold text-slate-300 hover:text-white transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Landing</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar with Admin Toggle */}
        <header className="h-16 bg-[#1A1228]/80 backdrop-blur-xl border-b border-carnival-crimson/30 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl glass-card text-slate-300 hover:text-white"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="font-extrabold text-lg text-white font-mono flex items-center gap-2">
              <span>Admin Arena Control Center</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-carnival-crimson text-white font-bold font-sans">
                SUPERADMIN
              </span>
            </h1>
          </div>

          {/* TASK 1: Global State Toggle (Admin controlled) called "isGrandFinale" */}
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-3 px-3 py-1.5 rounded-2xl border transition-all ${
              isGrandFinale ? 'bg-amber-500/20 border-yellow-400 text-yellow-300 shadow-[0_0_20px_rgba(234,179,8,0.4)]' : 'glass-card border-white/10 text-slate-300'
            }`}>
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase font-mono font-bold">
                  {isGrandFinale ? '🏆 GRAND FINALE' : '🎪 CARNIVAL MODE'}
                </span>
                <span className="text-[9px] text-slate-400 font-mono">
                  {isGrandFinale ? 'Gold Theme Active' : 'Standard Theme'}
                </span>
              </div>

              <button
                onClick={toggleGrandFinale}
                disabled={toggleLoading}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none p-1 ${
                  isGrandFinale ? 'bg-gradient-to-r from-amber-400 to-yellow-500 shadow-neon-gold' : 'bg-slate-700'
                }`}
                title="Toggle isGrandFinale Global Theme"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-slate-950 flex items-center justify-center font-bold text-xs transform transition-transform duration-300 shadow-md ${
                    isGrandFinale ? 'translate-x-6 text-yellow-400' : 'translate-x-0 text-slate-400'
                  }`}
                >
                  {isGrandFinale ? '🏆' : '🎪'}
                </div>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 p-1.5 rounded-xl glass-card border-carnival-gold/30">
              <ShieldAlert className="w-4 h-4 text-carnival-gold" />
              <span className="text-xs font-bold text-white font-mono">{user?.name || 'Ringmaster Admin'}</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
