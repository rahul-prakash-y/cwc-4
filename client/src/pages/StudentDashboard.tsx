import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Flame, CheckCircle2, Zap, Send, Github, Video, Award, Clock, AlertCircle } from 'lucide-react';
import { triggerCarnivalConfetti } from '../components/hero/ConfettiEffect';

export const StudentDashboard: React.FC = () => {
  const [repoUrl, setRepoUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (repoUrl) {
      setSubmitted(true);
      triggerCarnivalConfetti();
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Welcome Ticket Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 sm:p-8 rounded-2xl glass-card border border-carnival-gold/40 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-carnival-gold/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-carnival-gold/20 text-carnival-gold text-xs font-mono font-bold">
            <Award className="w-3.5 h-3.5" />
            <span>CARNIVAL TICKET #CWC4-8842</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Welcome Back, <span className="text-gradient-carnival">Aarav!</span>
          </h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Your team <strong className="text-carnival-gold">Cyber Circus Kings</strong> is currently leading the carnival leaderboard at <strong className="text-carnival-crimson">Rank #1</strong> with 1,850 PTS!
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex items-center gap-4 bg-black/40 p-4 rounded-xl border border-white/10">
          <div className="text-center px-3">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Global Rank</div>
            <div className="text-2xl font-extrabold text-carnival-gold font-mono">#1 👑</div>
          </div>
          <div className="text-center px-3 border-l border-white/10">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Total Points</div>
            <div className="text-2xl font-extrabold text-carnival-cyan font-mono">1,850</div>
          </div>
          <div className="text-center px-3 border-l border-white/10">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Daily Streak</div>
            <div className="text-2xl font-extrabold text-carnival-crimson font-mono flex items-center justify-center gap-1">
              4 <Flame className="w-4 h-4 text-carnival-crimson fill-carnival-crimson" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Grid: Active Challenge & Submission Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Arena Challenge */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-carnival-crimson/40 shadow-neon-crimson relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-crimson/20 text-carnival-crimson border border-carnival-crimson/40 animate-pulse">
                DAY 5 • LIVE ARENA BOSS FIGHT
              </span>
              <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-carnival-gold" />
                Closes in: 03h 42m
              </span>
            </div>

            <h3 className="text-2xl font-extrabold text-white mb-2">Mid-Season Arena Boss Fight</h3>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Build a real-time multiplayer mini-game app incorporating Fastify WebSockets, Framer Motion UI effects, and dynamic team leaderboard sync.
            </p>

            {/* Submission Box */}
            <div className="p-5 rounded-xl bg-black/40 border border-white/10 space-y-4">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Send className="w-4 h-4 text-carnival-cyan" />
                Submit Task Deliverables
              </h4>

              {submitted ? (
                <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 flex-shrink-0" />
                  <div>
                    <strong className="block text-white font-bold">Submission Confirmed!</strong>
                    Your solution repository and live video demo have been logged for evaluation.
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">GitHub Repository URL *</label>
                    <div className="relative">
                      <Github className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        required
                        placeholder="https://github.com/your-username/cwc-arena-task"
                        value={repoUrl}
                        onChange={(e) => setRepoUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 text-sm text-white border border-white/10 focus:border-carnival-cyan focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Cloudinary Video Demo / Live URL</label>
                    <div className="relative">
                      <Video className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder="https://res.cloudinary.com/your-cloud/video/upload/demo.mp4"
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 text-sm text-white border border-white/10 focus:border-carnival-cyan focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-carnival-crimson to-carnival-purple text-white font-bold text-sm shadow-neon-crimson hover:scale-[1.02] transition-all"
                  >
                    Submit Arena Task (+500 PTS)
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Power-Up Inventory */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-carnival-gold/30 shadow-xl">
            <h3 className="font-extrabold text-lg text-white mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-carnival-gold" />
              Power-Up Advantage Cards
            </h3>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-gradient-to-r from-carnival-gold/10 to-amber-500/10 border border-carnival-gold/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-carnival-gold">2x Double Multiplier</div>
                  <div className="text-[11px] text-slate-400">Available: 1 Card</div>
                </div>
                <button
                  onClick={() => alert('Activated 2x Double Multiplier for today!')}
                  className="px-3 py-1.5 rounded-lg bg-carnival-gold text-slate-950 font-bold text-xs hover:scale-105 transition-transform"
                >
                  Activate
                </button>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-carnival-cyan/10 to-blue-500/10 border border-carnival-cyan/30 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-carnival-cyan">Immunity Shield</div>
                  <div className="text-[11px] text-slate-400">Available: 1 Card</div>
                </div>
                <button
                  onClick={() => alert('Immunity Shield Active!')}
                  className="px-3 py-1.5 rounded-lg bg-carnival-cyan text-slate-950 font-bold text-xs hover:scale-105 transition-transform"
                >
                  Equip
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
