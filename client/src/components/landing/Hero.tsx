import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Ticket, LogIn, PartyPopper, Flame } from 'lucide-react';
import { CircusLights } from '../hero/CircusLights';
import { BalloonBackground } from '../hero/BalloonBackground';
import { ConfettiEffect, triggerCarnivalConfetti } from '../hero/ConfettiEffect';
import { CountdownTimer } from '../hero/CountdownTimer';
import { StatCounters } from '../hero/StatCounters';
import { RegistrationModal } from './RegistrationModal';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  return (
    <section id="hero" className="relative min-h-[92vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden border-b border-white/10">
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

        {/* Central CWC Season 4 Emblem & Main Title */}
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

        {/* Action Buttons: Task 2 CTAs (Register Team & Login) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 my-6"
        >
          {/* CTA 1: Register Team */}
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-carnival-gold via-carnival-amber to-carnival-crimson text-black font-extrabold text-base shadow-neon-gold hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <Ticket className="w-5 h-5 fill-current" />
            <span>Register Team</span>
          </button>

          {/* CTA 2: Login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl glass-card text-white font-bold text-base border border-white/20 hover:border-carnival-cyan/60 shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
          >
            <LogIn className="w-5 h-5 text-carnival-cyan" />
            <span>Login to Portal</span>
          </Link>

          {/* Celebration trigger */}
          <button
            onClick={triggerCarnivalConfetti}
            className="inline-flex items-center gap-2 px-5 py-4 rounded-xl glass-card text-carnival-gold font-semibold border border-carnival-gold/30 hover:bg-carnival-gold/10 hover:scale-105 transition-all duration-300"
            title="Pop Confetti Celebration!"
          >
            <PartyPopper className="w-5 h-5 text-carnival-gold" />
            <span className="hidden sm:inline">Celebrate 🎊</span>
          </button>
        </motion.div>

        {/* Task 2 Stat Counters: 12 Teams, 10 Days, 3 Winners, 1 Champion */}
        <StatCounters />
      </div>

      {/* Registration Modal Ticket Form */}
      <RegistrationModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </section>
  );
};
