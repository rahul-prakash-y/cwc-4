import React, { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, LayoutDashboard, CheckSquare, Trophy, Zap, Ticket, ArrowLeft, Menu, X, Bell, LogOut } from 'lucide-react';
import { AnnouncementToast } from '../components/common/AnnouncementToast';
import { useAuth } from '../context/AuthContext';

export const StudentLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  // If token check is complete and user is not logged in, redirect to login
  if (!isLoading && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const studentNavItems = [
    { label: 'Overview', path: '/student', icon: LayoutDashboard },
    { label: 'Daily Arena Tasks', path: '/student/tasks', icon: CheckSquare },
    { label: 'Power-Up Vault', path: '/student/advantages', icon: Zap },
    { label: 'Team Leaderboard', path: '/student/leaderboard', icon: Trophy },
  ];

  return (
    <div className="min-h-screen bg-[#0B0A16] text-slate-100 flex font-sans">
      {/* Student Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-40 w-64 h-screen bg-[#151329]/95 backdrop-blur-2xl border-r border-white/10 flex flex-col justify-between p-4 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Brand & Ticket Badge */}
          <div className="flex items-center gap-3 pb-6 border-b border-white/10 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-carnival-cyan to-carnival-purple p-0.5">
              <div className="w-full h-full rounded-[10px] bg-[#0B0A16] flex items-center justify-center font-mono font-bold text-carnival-cyan text-sm">
                🎪
              </div>
            </div>
            <div>
              <div className="font-extrabold text-white text-base">Student Portal</div>
              <div className="text-[10px] text-carnival-gold font-mono flex items-center gap-1">
                <Ticket className="w-3 h-3" />
                <span>Ticket #{user?.ticketId || 'CWC4-8842'}</span>
              </div>
            </div>
          </div>

          {/* Active Team Pill */}
          <div className="p-3 rounded-xl bg-carnival-crimson/10 border border-carnival-crimson/30 mb-6">
            <div className="text-[10px] uppercase font-mono text-carnival-crimson font-bold">Assigned Team</div>
            <div className="font-extrabold text-sm text-white flex items-center gap-1.5 mt-0.5">
              <Shield className="w-4 h-4 text-carnival-gold" />
              <span>{user?.teamName || 'Cyber Circus Kings'}</span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1">
            {studentNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-carnival-crimson text-white shadow-neon-crimson'
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
            <span>Logout</span>
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
        {/* Top Navigation Bar */}
        <header className="h-16 bg-[#151329]/80 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl glass-card text-slate-300 hover:text-white"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h1 className="font-extrabold text-lg text-white font-mono flex items-center gap-2">
              <span>Student Arena Dashboard</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/30 font-sans">
                Rank #1
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl glass-card text-slate-300 hover:text-white relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-carnival-crimson animate-ping" />
            </button>
            <div className="flex items-center gap-2 p-1.5 rounded-xl glass-card border-white/10">
              <div className="w-7 h-7 rounded-lg bg-carnival-gold/20 text-carnival-gold flex items-center justify-center font-bold text-xs">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'AS'}
              </div>
              <span className="text-xs font-bold text-white hidden sm:inline">{user?.name || 'Aarav Sharma'}</span>
            </div>
          </div>
        </header>

        {/* Page Body */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 relative overflow-x-hidden">
          <AnnouncementToast />
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
