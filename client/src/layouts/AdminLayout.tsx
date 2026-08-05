import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Crown, Users, CheckSquare, Zap, Megaphone, ArrowLeft, Menu, X, ShieldAlert, Sparkles, Grid } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const adminNavItems = [
    { label: 'Overview Dashboard', path: '/admin', icon: Crown },
    { label: 'Team Management', path: '/admin/teams', icon: Users },
    { label: 'Task Scheduler', path: '/admin/tasks', icon: CheckSquare },
    { label: 'Score Sheet Grid', path: '/admin/scores', icon: Grid },
  ];


  return (
    <div className="min-h-screen bg-[#0B0A16] text-slate-100 flex font-sans selection:bg-carnival-gold selection:text-black">
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

          {/* System Status Pill */}
          <div className="p-3 rounded-xl bg-carnival-gold/10 border border-carnival-gold/30 mb-6 font-mono text-xs">
            <div className="text-[10px] uppercase text-carnival-gold font-bold">Carnival Engine</div>
            <div className="font-extrabold text-white flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Fastify API Connected</span>
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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 p-1.5 rounded-xl glass-card border-carnival-gold/30">
              <ShieldAlert className="w-4 h-4 text-carnival-gold" />
              <span className="text-xs font-bold text-white hidden sm:inline font-mono">Ringmaster Admin</span>
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
