import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Ticket, LogIn, PartyPopper } from 'lucide-react';
import { CircusLights } from '../hero/CircusLights';
import { BalloonBackground } from '../hero/BalloonBackground';
import { ConfettiEffect, triggerCarnivalConfetti } from '../hero/ConfettiEffect';
import { CountdownTimer } from '../hero/CountdownTimer';
import { StatCounters } from '../hero/StatCounters';
import { RegistrationModal } from './RegistrationModal';
import { Link } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';

export const Hero: React.FC = () => {
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [eventStartDate, setEventStartDate] = useState<string | undefined>(undefined);
  const [heroBannerText, setHeroBannerText] = useState<string>(
    '10 Days of high-stakes algorithms, team relays, power-up advantages, and carnival glory. Step right up and claim your crown!'
  );
  const [currentSeason, setCurrentSeason] = useState<number>(4);
  const { socket } = useSocket();

  // Fetch initial global settings
  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const metaEnv = (import.meta as any).env || {};
        const backendUrl =
          metaEnv.VITE_API_URL ||
          (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);

        const res = await fetch(`${backendUrl}/api/v1/settings/global`);
        if (res.ok) {
          const data = await res.json();
          if (data.eventStartDate) setEventStartDate(data.eventStartDate);
          if (data.heroBannerText) setHeroBannerText(data.heroBannerText);
          if (data.currentSeason) setCurrentSeason(data.currentSeason);
        }
      } catch (err) {
        console.error('Failed to fetch global settings for Hero section:', err);
      }
    };

    fetchGlobalSettings();
  }, []);

  // Listen for SETTINGS_UPDATED WebSocket event
  useEffect(() => {
    if (!socket) return;

    const handleSettingsUpdated = (data: any) => {
      if (data.eventStartDate) setEventStartDate(data.eventStartDate);
      if (data.heroBannerText) setHeroBannerText(data.heroBannerText);
      if (data.currentSeason) setCurrentSeason(data.currentSeason);
    };

    socket.on('SETTINGS_UPDATED', handleSettingsUpdated);
    return () => {
      socket.off('SETTINGS_UPDATED', handleSettingsUpdated);
    };
  }, [socket]);

  return (
    <section id="hero" className="relative min-h-[92vh] flex flex-col items-center justify-center pt-24 pb-16 px-4 overflow-hidden border-b border-slate-200 dark:border-white/10">
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
          className="inline-flex items-center gap-2.5 px-6 py-2 rounded-full glass-card border border-amber-400/30 dark:border-cwc-gold/30 text-amber-600 dark:text-cwc-gold text-xs sm:text-sm font-semibold mb-8 shadow-sm dark:shadow-glow-gold/20 hover:border-amber-500 dark:hover:border-cwc-gold/60 hover:-translate-y-0.5 transition-all duration-300 ease-out cursor-pointer"
          onClick={triggerCarnivalConfetti}
        >
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-cwc-gold animate-spin-slow" />
          <span className="tracking-widest uppercase font-display">CODE WITH CURIOUS • SEASON {currentSeason} CARNIVAL 🎪</span>
          <span className="bg-rose-600 dark:bg-cwc-red text-white px-2.5 py-0.5 rounded-full text-[10px] uppercase font-black tracking-widest animate-pulse shadow-sm">
            LIVE ARENA
          </span>
        </motion.div>

        {/* Central CWC Emblem & Main Title */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative mb-6 flex flex-col items-center"
        >
          {/* Central Logo Ring */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-rose-600 via-amber-500 to-violet-600 dark:from-cwc-red dark:via-cwc-gold dark:to-cwc-purple p-1 shadow-md dark:shadow-2xl mb-6 animate-float">
            <div className="w-full h-full rounded-full bg-slate-50 dark:bg-cwc-bg flex items-center justify-center border border-slate-200 dark:border-white/20">
              <span className="text-3xl sm:text-4xl font-extrabold font-display bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-rose-600 to-violet-600 dark:from-cwc-gold dark:to-yellow-200">
                CWC
              </span>
            </div>
          </div>

          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-display tracking-tight leading-none max-w-4xl text-slate-900 dark:text-white">
            Welcome to the <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-600 via-rose-600 to-violet-600 dark:from-cwc-gold dark:to-yellow-200 font-display font-extrabold drop-shadow-sm dark:drop-shadow-[0_10px_35px_rgba(255,215,0,0.35)]">
              Grand Coding Carnival
            </span>
          </h1>
        </motion.div>

        {/* Dynamic Subtitle / Announcement Banner */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-slate-600 dark:text-gray-300 text-base sm:text-xl max-w-2xl font-light mb-6 leading-relaxed"
        >
          {heroBannerText}
        </motion.p>

        {/* Mechanical Countdown Timer connected to eventStartDate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <CountdownTimer eventStartDate={eventStartDate} />
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
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 dark:from-cwc-red dark:to-[#9F1239] text-white font-bold font-display text-base tracking-wide border border-rose-500/20 dark:border-white/15 shadow-md dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_20px_rgba(225,29,72,0.4)] hover:-translate-y-1 hover:shadow-lg dark:hover:shadow-glow-red transition-all duration-300 ease-out active:translate-y-0"
          >
            <Ticket className="w-5 h-5 fill-current" />
            <span>Register Team</span>
          </button>

          {/* CTA 2: Login */}
          <Link
            to="/login"
            className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white dark:bg-cwc-surface backdrop-blur-lg text-slate-800 dark:text-white font-bold font-display text-base tracking-wide border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] hover:-translate-y-1 hover:border-amber-500 dark:hover:border-white/30 hover:text-amber-600 dark:hover:text-cwc-gold transition-all duration-300 ease-out active:translate-y-0"
          >
            <LogIn className="w-5 h-5 text-amber-600 dark:text-cwc-gold" />
            <span>Login to Portal</span>
          </Link>

          {/* Celebration trigger */}
          <button
            onClick={triggerCarnivalConfetti}
            className="inline-flex items-center gap-2.5 px-6 py-4 rounded-xl bg-white dark:bg-cwc-surface backdrop-blur-lg text-amber-600 dark:text-cwc-gold font-semibold font-display border border-amber-400/30 dark:border-cwc-gold/30 shadow-sm hover:bg-amber-50 dark:hover:bg-cwc-gold/10 hover:-translate-y-1 hover:border-amber-500 dark:hover:border-cwc-gold/60 transition-all duration-300 ease-out"
            title="Pop Confetti Celebration!"
          >
            <PartyPopper className="w-5 h-5 text-amber-600 dark:text-cwc-gold" />
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
