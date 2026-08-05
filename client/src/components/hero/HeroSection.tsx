import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Play, Compass, PartyPopper } from 'lucide-react';
import { CircusLights } from './CircusLights';
import { BalloonBackground } from './BalloonBackground';
import { ConfettiEffect, triggerCarnivalConfetti } from './ConfettiEffect';
import { CountdownTimer } from './CountdownTimer';
import { StatCounters } from './StatCounters';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-[92vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden border-b border-white/10">
      {/* Background Circus Lights & Effects */}
      <CircusLights />
      <BalloonBackground />
      <ConfettiEffect />

      {/* Hero Content Container */}
      <div className="relative z-20 max-w-5xl w-full mx-auto flex flex-col items-center text-center">
        {/* Animated Badge */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full glass-card border border-carnival-gold/40 text-carnival-gold text-xs sm:text-sm font-semibold mb-6 shadow-neon-gold group cursor-pointer"
          onClick={triggerCarnivalConfetti}
        >
          <Sparkles className="w-4 h-4 text-carnival-gold animate-spin-slow" />
          <span className="tracking-wide">CODE WITH CURIOUS • SEASON 4 CARNIVAL 🎪</span>
          <span className="bg-carnival-crimson text-white px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-widest animate-pulse">
            LIVE ARENA
          </span>
        </motion.div>

        {/* CWC Season 4 Emblem & Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative mb-4 flex flex-col items-center"
        >
          {/* Central Logo Ring */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-carnival-crimson via-carnival-gold to-carnival-cyan p-1 shadow-2xl mb-4 animate-float">
            <div className="w-full h-full rounded-full bg-[#0B0A16] flex items-center justify-center border border-white/20">
              <span className="text-3xl sm:text-4xl font-extrabold text-gradient-carnival font-mono">
                CWC
              </span>
            </div>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight leading-tight max-w-4xl">
            Welcome to the <br />
            <span className="text-gradient-carnival font-extrabold drop-shadow-[0_10px_35px_rgba(255,0,85,0.4)]">
              Grand Coding Carnival
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-slate-300 text-base sm:text-xl max-w-2xl font-light mb-4 leading-relaxed"
        >
          10 Days of high-stakes algorithms, team relays, power-up advantages, and carnival glory. Step right up and claim your crown!
        </motion.p>

        {/* Mechanical Countdown Timer */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <CountdownTimer />
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 my-6"
        >
          <a
            href="#teams"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-carnival-crimson to-carnival-purple text-white font-bold shadow-neon-crimson hover:scale-105 transition-all duration-300"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Enter Carnival Arena</span>
          </a>

          <a
            href="#timeline"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl glass-card text-slate-200 hover:text-white font-semibold border border-white/20 hover:border-carnival-cyan/60 shadow-lg hover:scale-105 transition-all duration-300"
          >
            <Compass className="w-5 h-5 text-carnival-cyan" />
            <span>Season Schedule</span>
          </a>

          <button
            onClick={triggerCarnivalConfetti}
            className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl glass-card text-carnival-gold font-semibold border border-carnival-gold/30 hover:bg-carnival-gold/10 hover:scale-105 transition-all duration-300"
            title="Pop Confetti Celebration!"
          >
            <PartyPopper className="w-5 h-5 text-carnival-gold" />
            <span>Celebrate 🎊</span>
          </button>
        </motion.div>

        {/* Task 2 Stat Counters */}
        <StatCounters />
      </div>
    </section>
  );
};
