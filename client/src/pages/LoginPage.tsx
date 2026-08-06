import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { User, Shield, Lock, Ticket, ArrowRight, Eye, EyeOff, Sparkles, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { triggerCarnivalConfetti } from '../components/hero/ConfettiEffect';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Active mode: 'student' or 'admin'
  const isPathAdmin = location.pathname.includes('/admin');
  const initialRole = isPathAdmin || searchParams.get('role') === 'admin' ? 'admin' : 'student';
  const [activeRole, setActiveRole] = useState<'student' | 'admin'>(initialRole);

  // Form State
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Student Fields
  const [teamCode, setTeamCode] = useState('CWC-S4-ALPHA');
  const [studentPass, setStudentPass] = useState('carnival2026');

  // Admin Fields
  const [adminUser, setAdminUser] = useState('admin_cwc');
  const [adminPass, setAdminPass] = useState('adminpass123');
  const [securityToken, setSecurityToken] = useState('9988');

  useEffect(() => {
    if (location.pathname.includes('/admin') || searchParams.get('role') === 'admin') {
      setActiveRole('admin');
    } else if (location.pathname.includes('/student') || searchParams.get('role') === 'student') {
      setActiveRole('student');
    }
  }, [location.pathname, searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    // Simulate authentication process
    setTimeout(() => {
      setLoading(false);
      triggerCarnivalConfetti();

      if (activeRole === 'student') {
        setNotification('🎉 Student Access Granted! Redirecting to Student Dashboard...');
        setTimeout(() => {
          navigate('/student');
        }, 1200);
      } else {
        setNotification('⚡ Admin Authorization Confirmed! Redirecting to Command Center...');
        setTimeout(() => {
          navigate('/admin');
        }, 1200);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden bg-[#0B0A16]">
      {/* Background Decorative Carnival Elements */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-carnival-crimson/15 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-carnival-cyan/15 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl space-y-8">
        {/* Header Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-carnival-gold/40 text-carnival-gold text-xs font-mono font-bold tracking-widest uppercase">
            <Ticket className="w-4 h-4 text-carnival-gold" />
            <span>Carnival Gate Authentication</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            Enter <span className="text-gradient-carnival">CWC Season 4</span>
          </h1>
          <p className="text-sm text-slate-300">
            Select your entrance pass below to access your portal.
          </p>
        </div>

        {/* TASK 5 CORE REQUIREMENT: Two Distinct, Large, Animated Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2 rounded-3xl glass-card border border-white/10 shadow-2xl">
          {/* 1. Student Login Animated Button */}
          <button
            type="button"
            onClick={() => {
              setActiveRole('student');
              setNotification(null);
            }}
            className={`relative group overflow-hidden p-5 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer ${
              activeRole === 'student'
                ? 'bg-gradient-to-r from-carnival-cyan/20 via-indigo-900/60 to-carnival-purple/30 border-carnival-cyan shadow-[0_0_30px_rgba(0,240,255,0.35)] scale-[1.02]'
                : 'bg-white/5 border-white/10 hover:border-carnival-cyan/50 hover:bg-white/10 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3.5 z-10">
              <div
                className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                  activeRole === 'student'
                    ? 'bg-carnival-cyan text-black font-bold shadow-neon-cyan'
                    : 'bg-white/10 text-carnival-cyan'
                }`}
              >
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white group-hover:text-carnival-cyan transition-colors">
                  Student Login
                </div>
                <div className="text-[11px] font-mono text-slate-400">Team Dashboard Access</div>
              </div>
            </div>

            {/* Glowing Indicator Badge */}
            {activeRole === 'student' && (
              <div className="w-3 h-3 rounded-full bg-carnival-cyan shadow-[0_0_12px_#00F0FF] animate-pulse" />
            )}

            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>

          {/* 2. Admin Login Animated Button */}
          <button
            type="button"
            onClick={() => {
              setActiveRole('admin');
              setNotification(null);
            }}
            className={`relative group overflow-hidden p-5 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-gradient-to-r from-carnival-crimson/20 via-rose-950/60 to-carnival-gold/20 border-carnival-crimson shadow-[0_0_30px_rgba(255,0,85,0.35)] scale-[1.02]'
                : 'bg-white/5 border-white/10 hover:border-carnival-crimson/50 hover:bg-white/10 opacity-70 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3.5 z-10">
              <div
                className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                  activeRole === 'admin'
                    ? 'bg-carnival-crimson text-white font-bold shadow-neon-crimson'
                    : 'bg-white/10 text-carnival-crimson'
                }`}
              >
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-extrabold text-white group-hover:text-carnival-crimson transition-colors">
                  Admin Login
                </div>
                <div className="text-[11px] font-mono text-slate-400">Command Center Access</div>
              </div>
            </div>

            {/* Glowing Indicator Badge */}
            {activeRole === 'admin' && (
              <div className="w-3 h-3 rounded-full bg-carnival-crimson shadow-[0_0_12px_#FF0055] animate-pulse" />
            )}

            {/* Shimmer sweep effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </button>
        </div>

        {/* Notification Toast */}
        {notification && (
          <div className="p-4 rounded-2xl bg-carnival-gold/20 border border-carnival-gold/50 text-carnival-gold font-semibold text-xs flex items-center gap-3 shadow-neon-gold animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{notification}</span>
          </div>
        )}

        {/* Dynamic Authentication Form */}
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              {activeRole === 'student' ? (
                <Ticket className="w-5 h-5 text-carnival-cyan" />
              ) : (
                <Lock className="w-5 h-5 text-carnival-crimson" />
              )}
              <h3 className="text-lg font-extrabold text-white">
                {activeRole === 'student' ? 'Student Team Ticket Portal' : 'Admin Security Verification'}
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/10 text-slate-300 uppercase">
              {activeRole === 'student' ? 'Squad Mode' : 'Super Admin'}
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {activeRole === 'student' ? (
              /* STUDENT FORM FIELDS */
              <>
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                    Team Ticket Code / ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={teamCode}
                      onChange={(e) => setTeamCode(e.target.value)}
                      placeholder="e.g. CWC-S4-ALPHA"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-carnival-cyan focus:ring-1 focus:ring-carnival-cyan transition-all font-mono"
                    />
                    <Ticket className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                    Ticket Passkey / Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={studentPass}
                      onChange={(e) => setStudentPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-carnival-cyan focus:ring-1 focus:ring-carnival-cyan transition-all font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              /* ADMIN FORM FIELDS */
              <>
                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                    Admin Master ID
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={adminUser}
                      onChange={(e) => setAdminUser(e.target.value)}
                      placeholder="admin_cwc"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-carnival-crimson focus:ring-1 focus:ring-carnival-crimson transition-all font-mono"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                    Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={adminPass}
                      onChange={(e) => setAdminPass(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-carnival-crimson focus:ring-1 focus:ring-carnival-crimson transition-all font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono font-semibold text-slate-300 uppercase mb-2">
                    Security Token / PIN
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={securityToken}
                      onChange={(e) => setSecurityToken(e.target.value)}
                      placeholder="4-Digit Security Code"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pl-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-carnival-crimson focus:ring-1 focus:ring-carnival-crimson transition-all font-mono"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeRole === 'student'
                  ? 'bg-gradient-to-r from-carnival-cyan via-indigo-500 to-carnival-purple text-black shadow-neon-cyan hover:scale-[1.02]'
                  : 'bg-gradient-to-r from-carnival-crimson via-carnival-purple to-carnival-gold text-white shadow-neon-crimson hover:scale-[1.02]'
              } ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{activeRole === 'student' ? 'Access Student Dashboard' : 'Launch Command Center'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Helpers */}
          <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Need immediate test access?</span>
            <button
              type="button"
              onClick={() => {
                if (activeRole === 'student') {
                  setTeamCode('CWC-S4-ALPHA');
                  setStudentPass('carnival2026');
                } else {
                  setAdminUser('admin_cwc');
                  setAdminPass('adminpass123');
                  setSecurityToken('9988');
                }
              }}
              className="text-carnival-gold hover:underline flex items-center gap-1 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autofill Demo Credentials</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
