import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Shield, Ticket, ArrowRight, Sparkles, Star, Flame, Lock, Crown } from 'lucide-react';

export const LoginSelection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden bg-slate-50 dark:bg-[#0B0A16]">
      {/* Background Decorative Carnival Glow Orbs & Spotlights */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-carnival-crimson/10 dark:bg-carnival-crimson/15 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-carnival-cyan/10 dark:bg-carnival-cyan/15 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-80 h-80 bg-carnival-gold/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl space-y-10 text-center">
        {/* Header Section */}
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card bg-white/80 dark:bg-transparent border border-amber-500/40 dark:border-carnival-gold/40 text-amber-600 dark:text-carnival-gold text-xs font-mono font-bold tracking-widest uppercase shadow-sm dark:shadow-neon-gold">
            <Ticket className="w-4 h-4 text-amber-600 dark:text-carnival-gold" />
            <span>🎪 Carnival Admission Gate 🎪</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight uppercase font-heading">
            Select Your <span className="text-gradient-carnival">Entrance Ticket</span>
          </h1>
          <p className="max-w-xl mx-auto text-base text-slate-600 dark:text-slate-300">
            Welcome to Code With Curious Season 4. Choose your admission ticket below to access your dedicated portal.
          </p>

          {/* Decorative Stars Row */}
          <div className="flex justify-center items-center gap-3 pt-2 text-amber-500/60 dark:text-carnival-gold/60">
            <Star className="w-4 h-4 fill-amber-500/40 dark:fill-carnival-gold/40 text-amber-500 dark:text-carnival-gold" />
            <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 dark:via-carnival-gold/40 to-transparent" />
            <Flame className="w-5 h-5 text-carnival-crimson" />
            <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-amber-500/40 dark:via-carnival-gold/40 to-transparent" />
            <Star className="w-4 h-4 fill-amber-500/40 dark:fill-carnival-gold/40 text-amber-500 dark:text-carnival-gold" />
          </div>
        </div>

        {/* Two Distinct, Massive, Animated Ticket Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* 1. MASSIVE CARNIVAL TICKET BUTTON: STUDENT LOGIN */}
          <motion.div
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <button
              type="button"
              onClick={() => navigate('/login/student')}
              className="w-full h-full text-left relative group overflow-hidden rounded-3xl p-8 border-2 border-cyan-400/80 dark:border-carnival-cyan/60 bg-gradient-to-br from-white via-cyan-50/70 to-indigo-50/60 dark:from-[#121936] dark:via-[#10142a]/95 dark:to-[#0b0e1e] shadow-lg dark:shadow-[0_0_40px_rgba(0,240,255,0.25)] hover:shadow-xl dark:hover:shadow-[0_0_70px_rgba(0,240,255,0.65)] hover:border-cyan-500 dark:hover:border-carnival-cyan transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              {/* Ticket Notched Stub Circles at Sides */}
              <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 dark:bg-[#0B0A16] border-r-2 border-cyan-400 dark:border-carnival-cyan/60" />
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 dark:bg-[#0B0A16] border-l-2 border-cyan-400 dark:border-carnival-cyan/60" />

              {/* Shimmer Sweep Animation Layer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              {/* Top Ticket Details Header */}
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-cyan-100 dark:bg-carnival-cyan/20 border border-cyan-300 dark:border-carnival-cyan/40 text-cyan-700 dark:text-carnival-cyan shadow-sm dark:shadow-neon-cyan group-hover:scale-110 transition-transform">
                    <User className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full bg-cyan-100 dark:bg-carnival-cyan/20 text-cyan-700 dark:text-carnival-cyan border border-cyan-300 dark:border-carnival-cyan/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                      ADM-TCK-STUDENT
                    </span>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">PASS CODE: SQUAD-S4</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-carnival-cyan transition-colors">
                    Student Login
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Access your Squad Dashboard, submit daily task code repositories, unlock carnival advantages, and track live leaderboard rankings.
                  </p>
                </div>
              </div>

              {/* Ticket Perforated Divider */}
              <div className="my-6 border-t-2 border-dashed border-cyan-300/80 dark:border-carnival-cyan/30 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white dark:bg-[#10142a] border border-slate-200 dark:border-transparent text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                  ✂ Cut Here to Admit
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-2 text-cyan-700 dark:text-carnival-cyan">
                  <Ticket className="w-4 h-4" />
                  <span>Admit Squad Member</span>
                </span>
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 dark:bg-carnival-cyan text-white dark:text-black font-extrabold shadow-sm dark:shadow-neon-cyan group-hover:translate-x-1 transition-transform">
                  <span>Enter Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </button>
          </motion.div>

          {/* 2. MASSIVE CARNIVAL TICKET BUTTON: ADMIN LOGIN */}
          <motion.div
            whileHover={{ scale: 1.03, y: -6 }}
            whileTap={{ scale: 0.98 }}
            className="relative"
          >
            <button
              type="button"
              onClick={() => navigate('/login/admin')}
              className="w-full h-full text-left relative group overflow-hidden rounded-3xl p-8 border-2 border-rose-400/80 dark:border-carnival-crimson/60 bg-gradient-to-br from-white via-rose-50/70 to-pink-50/60 dark:from-[#2a101f] dark:via-[#200d17]/95 dark:to-[#13070e] shadow-lg dark:shadow-[0_0_40px_rgba(255,0,85,0.25)] hover:shadow-xl dark:hover:shadow-[0_0_70px_rgba(255,0,85,0.65)] hover:border-rose-500 dark:hover:border-carnival-crimson transition-all duration-300 flex flex-col justify-between cursor-pointer"
            >
              {/* Ticket Notched Stub Circles at Sides */}
              <div className="absolute top-1/2 -left-4 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 dark:bg-[#0B0A16] border-r-2 border-rose-400 dark:border-carnival-crimson/60" />
              <div className="absolute top-1/2 -right-4 -translate-y-1/2 w-8 h-8 rounded-full bg-slate-50 dark:bg-[#0B0A16] border-l-2 border-rose-400 dark:border-carnival-crimson/60" />

              {/* Shimmer Sweep Animation Layer */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-rose-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

              {/* Top Ticket Details Header */}
              <div>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="p-4 rounded-2xl bg-rose-100 dark:bg-carnival-crimson/20 border border-rose-300 dark:border-carnival-crimson/40 text-rose-700 dark:text-carnival-crimson shadow-sm dark:shadow-neon-crimson group-hover:scale-110 transition-transform">
                    <Shield className="w-8 h-8" />
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-3 py-1 rounded-full bg-rose-100 dark:bg-carnival-crimson/20 text-rose-700 dark:text-carnival-crimson border border-rose-300 dark:border-carnival-crimson/40 text-[10px] font-mono font-bold uppercase tracking-wider">
                      ADM-TCK-ADMIN
                    </span>
                    <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-1">PASS CODE: MASTER-KEY</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-carnival-crimson transition-colors">
                    Admin Login
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                    Access the Admin Command Center, grade task code submissions, trigger WebSocket broadcasts, manage team statuses, and export CSV/PDF reports.
                  </p>
                </div>
              </div>

              {/* Ticket Perforated Divider */}
              <div className="my-6 border-t-2 border-dashed border-rose-300/80 dark:border-carnival-crimson/30 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-white dark:bg-[#200d17] border border-slate-200 dark:border-transparent text-[9px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                  ✂ Cut Here for Command
                </div>
              </div>

              {/* Bottom Action Footer */}
              <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-700 dark:text-slate-200">
                <span className="flex items-center gap-2 text-rose-700 dark:text-carnival-crimson">
                  <Lock className="w-4 h-4" />
                  <span>Super Admin Verification</span>
                </span>
                <span className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 dark:bg-carnival-crimson text-white font-extrabold shadow-sm dark:shadow-neon-crimson group-hover:translate-x-1 transition-transform">
                  <span>Launch Command</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </button>
          </motion.div>
        </div>

        {/* Registration Prompt Banner */}
        <div className="pt-4 p-4 rounded-2xl glass-card bg-white/90 dark:bg-white/5 border border-slate-200 dark:border-carnival-gold/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-left space-y-0.5">
            <span className="text-xs font-mono text-amber-700 dark:text-carnival-gold font-bold uppercase flex items-center gap-1.5">
              <Ticket className="w-3.5 h-3.5" />
              Need a Team Admission Ticket?
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Apply as a 4-member squad to join the CWC Season 4 Carnival competition.
            </p>
          </div>
          <Link
            to="/register"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-cyan-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm hover:scale-105 transition-transform shrink-0"
          >
            Apply & Punch Ticket 🎟️
          </Link>
        </div>

        {/* Back to Home Link */}
        <div className="pt-2">
          <Link
            to="/"
            className="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors underline"
          >
            ← Return to Public Landing Page
          </Link>
        </div>
      </div>
    </div>
  );
};
