import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Users, CheckSquare, Grid, Download, ArrowLeft, Menu, X, ShieldAlert, Sparkles, Flame, Trophy, LogOut } from 'lucide-react';
import { useGrandFinale } from '../context/GrandFinaleContext';
import { useAuth } from '../context/AuthContext';
import { ThemeToggle } from '../components/layout/ThemeToggle';

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
    <div className={`min-h-screen bg-slate-50 dark:bg-[#0B0A16] text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-300 selection:bg-carnival-gold selection:text-black ${isGrandFinale ? 'grand-finale-gold' : ''}`}>
      {/* Admin Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 w-64 h-screen bg-white/95 dark:bg-[#1A1228]/95 backdrop-blur-2xl border-r border-slate-200 dark:border-carnival-crimson/30 flex flex-col justify-between p-4 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand & Admin Badge */}
          <div className="flex items-center gap-3 pb-6 border-b border-slate-200 dark:border-white/10 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-carnival-gold via-carnival-crimson to-carnival-purple p-0.5 shadow-neon-gold">
              <div className="w-full h-full rounded-[10px] bg-slate-900 dark:bg-[#0B0A16] flex items-center justify-center font-mono font-bold text-carnival-gold text-sm">
                👑
              </div>
            </div>
            <div>
              <div className="font-extrabold text-slate-900 dark:text-white text-base">Admin Command</div>
              <div className="text-[10px] text-amber-600 dark:text-carnival-gold font-mono flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-carnival-gold" />
                <span>Ringmaster Controls</span>
              </div>
            </div>
          </div>

          {/* System Status & Grand Finale Badge */}
          <div className={`p-3 rounded-xl border mb-6 font-mono text-xs transition-all ${
            isGrandFinale ? 'bg-amber-500/10 border-yellow-500 shadow-sm dark:shadow-[0_0_20px_rgba(234,179,8,0.3)]' : 'bg-amber-500/10 dark:bg-carnival-gold/10 border-amber-400/30 dark:border-carnival-gold/30'
          }`}>
            <div className="text-[10px] uppercase text-amber-700 dark:text-carnival-gold font-bold flex items-center justify-between">
              <span>ARENA MODE</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
            </div>
            <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 mt-1">
              {isGrandFinale ? (
                <span className="text-amber-600 dark:text-yellow-400 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" /> GRAND FINALE ACTIVE
                </span>
              ) : (
                <span className="text-cyan-700 dark:text-carnival-cyan flex items-center gap-1">
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
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 dark:from-carnival-gold dark:to-carnival-amber text-slate-950 shadow-md dark:shadow-neon-gold font-black'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Task 4: SuperAdmin Controls Section - Rendered ONLY if user.role === 'superadmin' */}
          {user?.role === 'superadmin' && (
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-purple-500/20">
              <div className="text-[10px] font-mono uppercase text-purple-700 dark:text-purple-400 font-bold tracking-wider px-4 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>SuperAdmin Controls</span>
              </div>
              <nav className="space-y-1">
                <Link
                  to="/admin/threats"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    location.pathname.includes('/admin/threats')
                      ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-md dark:shadow-[0_0_15px_rgba(239,68,68,0.5)] font-black'
                      : 'text-slate-600 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-purple-500/10'
                  }`}
                >
                  <span className="text-sm">🚨</span>
                  <span>Anti-DDoS & Threats</span>
                </Link>

                <Link
                  to="/admin/superadmin?tab=logs"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    location.pathname.includes('/admin/superadmin') && location.search.includes('tab=logs')
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md dark:shadow-neon-purple font-black'
                      : 'text-slate-600 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-purple-500/10'
                  }`}
                >
                  <span className="text-sm">📜</span>
                  <span>Audit Logs</span>
                </Link>

                <Link
                  to="/admin/superadmin?tab=security"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    location.pathname.includes('/admin/superadmin') && (location.search.includes('tab=security') || !location.search)
                      ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-md dark:shadow-[0_0_15px_rgba(225,29,72,0.4)] font-black'
                      : 'text-slate-600 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-purple-500/10'
                  }`}
                >
                  <span className="text-sm">🛡️</span>
                  <span>Security Center</span>
                </Link>

                <Link
                  to="/admin/superadmin?tab=admins"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    location.pathname.includes('/admin/superadmin') && location.search.includes('tab=admins')
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md dark:shadow-neon-gold font-black'
                      : 'text-slate-600 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-purple-500/10'
                  }`}
                >
                  <span className="text-sm">👑</span>
                  <span>Admin Management</span>
                </Link>

                <Link
                  to="/admin/superadmin?tab=cms"
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    location.pathname.includes('/admin/superadmin') && location.search.includes('tab=cms')
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-md dark:shadow-neon-cyan font-black'
                      : 'text-slate-600 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white hover:bg-purple-50 dark:hover:bg-purple-500/10'
                  }`}
                >
                  <span className="text-sm">⚙️</span>
                  <span>Site Config (CMS)</span>
                </Link>
              </nav>
            </div>
          )}
        </div>

        {/* Footer info & Exit */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 space-y-2">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout {user?.role === 'superadmin' ? 'SuperAdmin' : 'Admin'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Navigation Bar with Admin Toggle */}
        <header className="h-16 bg-white/80 dark:bg-[#1A1228]/80 backdrop-blur-xl border-b border-slate-200 dark:border-carnival-crimson/30 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="font-extrabold text-lg text-slate-900 dark:text-white font-mono flex items-center gap-2">
              <span>Admin Arena Control Center</span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold font-sans ${
                user?.role === 'superadmin'
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-md dark:shadow-neon-purple animate-pulse'
                  : 'bg-carnival-crimson text-white'
              }`}>
                {user?.role === 'superadmin' ? '⚡ SUPERADMIN' : 'ADMIN'}
              </span>
            </h1>
          </div>

          {/* TASK 1: Global State Toggle (Admin controlled) & Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <div className={`flex items-center gap-3 px-3 py-1.5 rounded-2xl border transition-all ${
              isGrandFinale
                ? 'bg-amber-500/20 border-yellow-500 text-amber-800 dark:text-yellow-300 shadow-sm dark:shadow-[0_0_20px_rgba(234,179,8,0.4)]'
                : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300'
            }`}>
              <div className="flex flex-col text-right">
                <span className="text-[10px] uppercase font-mono font-bold">
                  {isGrandFinale ? '🏆 GRAND FINALE' : '🎪 CARNIVAL MODE'}
                </span>
                <span className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">
                  {isGrandFinale ? 'Gold Theme Active' : 'Standard Theme'}
                </span>
              </div>

              <button
                onClick={toggleGrandFinale}
                disabled={toggleLoading}
                className={`relative w-14 h-8 rounded-full transition-colors duration-300 focus:outline-none p-1 ${
                  isGrandFinale ? 'bg-gradient-to-r from-amber-400 to-yellow-500 shadow-md dark:shadow-neon-gold' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                title="Toggle isGrandFinale Global Theme"
              >
                <div
                  className={`w-6 h-6 rounded-full bg-white dark:bg-slate-950 flex items-center justify-center font-bold text-xs transform transition-transform duration-300 shadow-md ${
                    isGrandFinale ? 'translate-x-6 text-yellow-500 dark:text-yellow-400' : 'translate-x-0 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isGrandFinale ? '🏆' : '🎪'}
                </div>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 p-1.5 px-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-carnival-gold/30">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-carnival-gold" />
              <span className="text-xs font-bold text-slate-900 dark:text-white font-mono">{user?.name || 'Ringmaster Admin'}</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 overflow-x-hidden">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
