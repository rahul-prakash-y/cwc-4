import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Calendar, Trophy, Sparkles, BookOpen, Zap, Star, Flame, ChevronRight, Award } from 'lucide-react';

interface CircusPosterCardProps {
  act: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
  badgeBg: string;
  posterTheme: {
    border: string;
    glow: string;
    headerBg: string;
    accentText: string;
  };
  points: { title: string; desc: string }[];
  highlight: string;
}

export const About: React.FC = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const circusPosters: CircusPosterCardProps[] = [
    {
      act: 'ACT I • THE CODE CODEX',
      title: 'Carnival Regulations & Rules',
      subtitle: 'Fair play, strict code purity, & tactical power-ups',
      icon: <BookOpen className="w-7 h-7 text-carnival-crimson" />,
      badge: 'Circus Rules',
      badgeBg: 'bg-carnival-crimson/20 text-carnival-crimson border-carnival-crimson/40',
      posterTheme: {
        border: 'border-carnival-crimson/50 hover:border-carnival-crimson',
        glow: 'hover:shadow-[0_0_35px_rgba(255,0,85,0.3)]',
        headerBg: 'bg-gradient-to-r from-carnival-crimson/20 via-rose-950/40 to-transparent',
        accentText: 'text-carnival-crimson',
      },
      highlight: 'Strict Anti-Plagiarism & Automated Code Auditing Active',
      points: [
        {
          title: 'Squad Formation',
          desc: 'Squads consist of 2 to 4 registered coders. Cross-departmental teams are welcome.',
        },
        {
          title: 'Daily Submissions',
          desc: 'Tasks drop daily at 10:00 AM. Code submissions must be pushed via GitHub before 11:59 PM.',
        },
        {
          title: 'Fair Play & Power-Ups',
          desc: 'Utilize earned Immunities and Time-Doubler advantages strategically without violating ethics.',
        },
      ],
    },
    {
      act: 'ACT II • THE 10-DAY MARATHON',
      title: 'Season Structure & Roadmap',
      subtitle: 'A high-stakes competitive battleground packed with daily sprints',
      icon: <Calendar className="w-7 h-7 text-carnival-gold" />,
      badge: '10-Day Sprint',
      badgeBg: 'bg-carnival-gold/20 text-carnival-gold border-carnival-gold/40',
      posterTheme: {
        border: 'border-carnival-gold/50 hover:border-carnival-gold',
        glow: 'hover:shadow-[0_0_35px_rgba(255,215,0,0.3)]',
        headerBg: 'bg-gradient-to-r from-carnival-gold/20 via-amber-950/40 to-transparent',
        accentText: 'text-carnival-gold',
      },
      highlight: '10 Sprints • 3 Elimination Gates • 1 Live Grand Finale',
      points: [
        {
          title: 'Phase 1: Speed Sprints (Days 1 - 4)',
          desc: 'Fast-paced algorithmic puzzles and core full-stack feature implementations.',
        },
        {
          title: 'Phase 2: Mid-Season Showdown (Days 5 - 7)',
          desc: 'High-stakes battleground where advantage power-ups can steal or protect team points.',
        },
        {
          title: 'Phase 3: Grand Finale Arena (Days 8 - 10)',
          desc: 'Top 10 teams enter the gold arena for real-time live coding and expert panel judging.',
        },
      ],
    },
    {
      act: 'ACT III • THE HALL OF GLORY',
      title: 'Carnival Perks & Benefits',
      subtitle: 'Unlock career opportunities, glory, swags, & cash rewards',
      icon: <Trophy className="w-7 h-7 text-carnival-cyan" />,
      badge: 'Rewards Pass',
      badgeBg: 'bg-carnival-cyan/20 text-carnival-cyan border-carnival-cyan/40',
      posterTheme: {
        border: 'border-carnival-cyan/50 hover:border-carnival-cyan',
        glow: 'hover:shadow-[0_0_35px_rgba(0,240,255,0.3)]',
        headerBg: 'bg-gradient-to-r from-carnival-cyan/20 via-sky-950/40 to-transparent',
        accentText: 'text-carnival-cyan',
      },
      highlight: '₹1,00,000+ Cash Pool + Verified Digital Credentials',
      points: [
        {
          title: 'Massive Cash Pool & Trophies',
          desc: 'Cash rewards for Top 3 Podiums plus 4 specialized distinction awards.',
        },
        {
          title: 'Swag Kits & Mechanical Keyboards',
          desc: 'Custom CWC hoodies, mechanical keycaps, sticker packs, and developer badges.',
        },
        {
          title: 'Direct Industry Fast-Track',
          desc: 'Top coders get priority interview referrals with sponsor tech companies.',
        },
      ],
    },
  ];

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      {/* Ambient Circus Light Orbs */}
      <div className="absolute top-1/3 left-0 w-[450px] h-[450px] bg-carnival-crimson/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[450px] h-[450px] bg-carnival-gold/10 rounded-full blur-[120px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Circus Tent Flair */}
        <div className="text-center space-y-4 mb-16 relative">
          {/* Top Vintage Marquee Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full glass-card border border-amber-500/40 dark:border-carnival-gold/40 text-amber-700 dark:text-carnival-gold text-xs font-mono font-bold tracking-widest uppercase shadow-sm dark:shadow-neon-gold">
            <Sparkles className="w-4 h-4 text-amber-500 dark:text-carnival-gold animate-spin" style={{ animationDuration: '6s' }} />
            <span>🎪 Step Right Up to CWC Season 4 🎪</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-heading">
            About The <span className="text-gradient-carnival">Carnival Experience</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-600 dark:text-slate-300 text-base sm:text-lg">
            Where competitive engineering meets high-energy carnival excitement. Explore the official guidelines, 10-day sprint progression, and glory awaiting top coders.
          </p>

          {/* Decorative Circus Stars Row */}
          <div className="flex justify-center items-center gap-3 pt-2 text-amber-500/60 dark:text-carnival-gold/60">
            <Star className="w-4 h-4 fill-amber-400/40 dark:fill-carnival-gold/40" />
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-amber-400/40 dark:via-carnival-gold/40 to-transparent" />
            <Flame className="w-5 h-5 text-rose-600 dark:text-carnival-crimson" />
            <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-amber-400/40 dark:via-carnival-gold/40 to-transparent" />
            <Star className="w-4 h-4 fill-amber-400/40 dark:fill-carnival-gold/40" />
          </div>
        </div>

        {/* Circus Poster Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {circusPosters.map((poster, index) => (
            <motion.div
              key={poster.title}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className={`relative rounded-3xl p-6 sm:p-8 border-2 transition-all duration-300 flex flex-col justify-between overflow-hidden group ${poster.posterTheme.border} ${poster.posterTheme.glow} ${
                hoveredCard === index ? 'bg-white dark:bg-[#161233]/95 scale-[1.02] shadow-xl' : 'glass-card bg-white/90 dark:bg-[#110E26]/80'
              }`}
            >
              {/* Vintage Circus Poster Striped Top Banner Accent */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-[repeating-linear-gradient(45deg,#FF0055,#FF0055_10px,#FFD700_10px,#FFD700_20px)] opacity-80" />

              <div>
                {/* Poster Act Label */}
                <div className="flex items-center justify-between gap-3 mb-6 pt-2">
                  <span className="text-[10px] font-mono font-black tracking-widest text-slate-500 dark:text-slate-400 uppercase">
                    {poster.act}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-3 py-1 rounded-full border ${poster.badgeBg}`}>
                    {poster.badge}
                  </span>
                </div>

                {/* Poster Card Header */}
                <div className={`p-4 rounded-2xl ${poster.posterTheme.headerBg} border border-slate-200 dark:border-white/10 mb-6 flex items-start gap-4`}>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 group-hover:scale-110 transition-transform">
                    {poster.icon}
                  </div>
                  <div>
                    <h3 className={`text-xl font-extrabold text-slate-900 dark:text-white group-hover:${poster.posterTheme.accentText} transition-colors`}>
                      {poster.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {poster.subtitle}
                    </p>
                  </div>
                </div>

                {/* Points List */}
                <div className="space-y-4 mb-6">
                  {poster.points.map((point) => (
                    <div key={point.title} className="flex items-start gap-3">
                      <div className="mt-1 p-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-carnival-gold border border-amber-500/30 shrink-0">
                        <Zap className="w-3 h-3" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{point.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-normal">{point.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Poster Footer & Highlight */}
              <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-amber-600 dark:text-carnival-gold font-semibold">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-amber-500 dark:text-carnival-gold" />
                  <span className="truncate">{poster.highlight}</span>
                </span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
              </div>

              {/* Subtle Circus Corner Flourishes */}
              <div className="absolute bottom-2 right-2 text-slate-300 dark:text-white/5 font-mono text-xs select-none">
                ✦ CWC-S4 ✦
              </div>
            </motion.div>
          ))}
        </div>

        {/* Quick Carnival Stats Bar */}
        <div className="mt-12 glass-card rounded-2xl p-6 border border-slate-200 dark:border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center shadow-xl">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-gradient-gold">10 Days</div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">Non-Stop Sprints</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-gradient-carnival">50+ Squads</div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Battling Live</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-gradient-cyan">₹1,00,000+</div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">Total Prize Pool</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-carnival-crimson">7 Awards</div>
            <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase">Trophies & Badges</div>
          </div>
        </div>
      </div>
    </section>
  );
};
