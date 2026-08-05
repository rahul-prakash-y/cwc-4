import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Shield, Users, CheckCircle2, Server, Database, Code2, Flame, Award } from 'lucide-react';

export default function App() {
  const schemas = [
    { title: 'User Schema', icon: Users, desc: 'Admin & Student authentication, roles & password hashes' },
    { title: 'Team Schema', icon: Shield, desc: 'Leader details, member arrays, theme colors & status' },
    { title: 'Task Schema', icon: Code2, desc: 'Main, Special & MCQ task types with point values & timing' },
    { title: 'Score Schema', icon: Award, desc: 'Team & Task refs, points earned, power-up advantages & immunity' },
    { title: 'Announcement Schema', icon: Flame, desc: 'Live event announcements with timestamps & pinned flags' },
  ];

  return (
    <div className="min-h-screen bg-[#0B0A16] text-slate-100 flex flex-col items-center justify-between p-6 relative overflow-hidden">
      {/* Background Carnival Ambient Lights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-carnival-glow pointer-events-none blur-3xl opacity-60" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content */}
      <main className="max-w-5xl w-full z-10 my-auto flex flex-col items-center text-center py-12">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-carnival-crimson/30 text-carnival-gold text-sm font-semibold mb-6 shadow-lg shadow-carnival-crimson/10"
        >
          <Sparkles className="w-4 h-4 text-carnival-gold animate-spin-slow" />
          <span>Code With Curious (CWC) Season 4 • Carnival Edition 🎪</span>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4"
        >
          The Grand Coding <span className="text-gradient-carnival">Carnival Arena</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-slate-400 text-lg md:text-xl max-w-2xl mb-12"
        >
          Full-Stack monorepo initialized with Fastify, React, Mongoose schemas, and strict TypeScript interfaces ready for Season 4 action.
        </motion.p>

        {/* Stack Status Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left mb-12"
        >
          <div className="glass-card p-6 rounded-2xl border-white/10 hover:border-carnival-crimson/40 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-carnival-crimson/20 text-carnival-crimson">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Fastify Server (/server)</h3>
                <span className="text-xs text-emerald-400 font-mono">Status: Ready & Configured</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              Pre-configured with @fastify/cors, Zod environment validation, and error handler plugin.
            </p>
          </div>

          <div className="glass-card p-6 rounded-2xl border-white/10 hover:border-carnival-cyan/40 transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-xl bg-carnival-cyan/20 text-carnival-cyan">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Mongoose Schemas (5/5)</h3>
                <span className="text-xs text-emerald-400 font-mono">Status: Exported with Types</span>
              </div>
            </div>
            <p className="text-slate-400 text-sm">
              User, Team, Task, Score, and Announcement models with strict exported TypeScript interfaces.
            </p>
          </div>
        </motion.div>

        {/* Schemas Overview List */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full text-left bg-carnival-card/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8"
        >
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            Initialized Mongoose Models & TypeScript Interfaces
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schemas.map((item, idx) => (
              <div
                key={idx}
                className="glass-card p-4 rounded-xl border-white/5 hover:border-carnival-gold/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 mb-2 text-carnival-gold">
                    <item.icon className="w-4 h-4" />
                    <h4 className="font-semibold text-sm text-slate-200">{item.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>Exported Interface</span>
                  <span className="text-emerald-400">✓ Strict TS</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-5xl py-4 border-t border-white/5 text-center text-xs text-slate-500 flex flex-col md:flex-row justify-between items-center gap-2">
        <div>Code With Curious (CWC) Season 4 • Monorepo Setup Complete</div>
        <div className="font-mono text-carnival-crimson">Fastify • Mongoose • React • TypeScript</div>
      </footer>
    </div>
  );
}
