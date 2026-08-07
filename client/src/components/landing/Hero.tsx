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
          className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full bg-cwc-surface backdrop-blur-lg border border-cwc-gold/30 text-cwc-gold text-xs sm:text-sm font-semibold mb-8 shadow-glow-gold/20 hover:border-cwc-gold/60 hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer"
          onClick={triggerCarnivalConfetti}
        >
          <Sparkles className="w-4 h-4 text-cwc-gold animate-spin-slow" />
          <span className="tracking-widest uppercase font-display">CODE WITH CURIOUS • SEASON 4 CARNIVAL 🎪</span>
          <span className="bg-cwc-red text-white px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest animate-pulse">
            LIVE ARENA
          </span>
        </motion.div>

        {/* Central CWC Season 4 Emblem & Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative mb-6 flex flex-col items-center"
        >
          {/* Central Logo Ring */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-cwc-red via-cwc-gold to-cwc-purple p-1 shadow-2xl mb-6 animate-float">
            <div className="w-full h-full rounded-full bg-cwc-bg flex items-center justify-center border border-white/20">
              <span className="text-3xl sm:text-4xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-r from-cwc-gold to-yellow-200">
                CWC
              </span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-display tracking-tight leading-none max-w-4xl">
            Welcome to the <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cwc-gold to-yellow-200 font-display font-extrabold drop-shadow-[0_10px_35px_rgba(255,215,0,0.35)]">
              Grand Coding Carnival
            </span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-gray-300 text-base sm:text-xl max-w-2xl font-light mb-6 leading-relaxed"
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
          className="flex flex-wrap items-center justify-center gap-5 my-8"
        >
          {/* CTA 1: Register Team */}
          <button
            onClick={() => setIsRegisterOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-cwc-red to-[#9F1239] text-white font-bold font-display text-base tracking-wide border border-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_20px_rgba(225,29,72,0.4)] hover:-translate-y-1 hover:border-white/30 hover:shadow-glow-red transition-all duration-300 ease-out active:translate-y-0"
          >
            <Ticket className="w-5 h-5 fill-current" />
            <span>Register Team</span>
          </button>

          {/* CTA 2: Login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-cwc-surface backdrop-blur-lg text-white font-bold font-display text-base tracking-wide border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:-translate-y-1 hover:border-white/30 hover:shadow-glow-gold hover:text-cwc-gold transition-all duration-300 ease-out active:translate-y-0"
          >
            <LogIn className="w-5 h-5 text-cwc-gold" />
            <span>Login to Portal</span>
          </Link>

          {/* Celebration trigger */}
          <button
            onClick={triggerCarnivalConfetti}
            className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl bg-cwc-surface backdrop-blur-lg text-cwc-gold font-semibold font-display border border-cwc-gold/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:bg-cwc-gold/10 hover:-translate-y-1 hover:border-cwc-gold/60 hover:shadow-glow-gold transition-all duration-300 ease-out"
            title="Pop Confetti Celebration!"
          >
            <PartyPopper className="w-5 h-5 text-cwc-gold" />
            <span className="hidden sm:inline">Celebrate 🎊</span>
          </button>
        </motion.div>

        {/* Task 2 Stat Counters */}
        <StatCounters />
      </div>

      {/* Registration Modal Ticket Form */}
      <RegistrationModal isOpen={isRegisterOpen} onClose={() => setIsRegisterOpen(false)} />
    </section>
  );
};
