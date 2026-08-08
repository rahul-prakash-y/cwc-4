import React from 'react';
import { Sparkles, Globe, Code, Server, Database, Cloud, Terminal, Cpu, Zap, Shield } from 'lucide-react';

interface SponsorItem {
  name: string;
  category: string;
  tier: 'Title Partner' | 'Gold Sponsor' | 'Tech Partner' | 'Power Booster';
  tierBadgeColor: string;
  brandColor: string;
  icon: React.ReactNode;
}

export const Sponsors: React.FC = () => {
  const sponsorsList: SponsorItem[] = [
    {
      name: 'Cloudflare',
      category: 'Global Edge & Security',
      tier: 'Title Partner',
      tierBadgeColor: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      brandColor: 'text-orange-500',
      icon: <Cloud className="w-7 h-7" />,
    },
    {
      name: 'MongoDB',
      category: 'Developer Data Platform',
      tier: 'Title Partner',
      tierBadgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      brandColor: 'text-emerald-500',
      icon: <Database className="w-7 h-7" />,
    },
    {
      name: 'GitHub',
      category: 'Developer Ecosystem',
      tier: 'Gold Sponsor',
      tierBadgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      brandColor: 'text-purple-400',
      icon: <Code className="w-7 h-7" />,
    },
    {
      name: 'Vercel',
      category: 'Frontend & Cloud Platform',
      tier: 'Gold Sponsor',
      tierBadgeColor: 'bg-slate-300/20 text-white border-slate-300/40',
      brandColor: 'text-slate-100',
      icon: <Terminal className="w-7 h-7" />,
    },
    {
      name: 'Postman',
      category: 'API Development Platform',
      tier: 'Tech Partner',
      tierBadgeColor: 'bg-carnival-crimson/20 text-carnival-crimson border-carnival-crimson/40',
      brandColor: 'text-carnival-crimson',
      icon: <Globe className="w-7 h-7" />,
    },
    {
      name: 'JetBrains',
      category: 'Developer Tools',
      tier: 'Gold Sponsor',
      tierBadgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      brandColor: 'text-cyan-400',
      icon: <Cpu className="w-7 h-7" />,
    },
    {
      name: 'Amazon Web Services',
      category: 'Cloud Infrastructure',
      tier: 'Tech Partner',
      tierBadgeColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      brandColor: 'text-amber-400',
      icon: <Server className="w-7 h-7" />,
    },
    {
      name: 'Red Bull Energy',
      category: 'Official Carnival Booster',
      tier: 'Power Booster',
      tierBadgeColor: 'bg-red-600/20 text-red-400 border-red-500/40',
      brandColor: 'text-red-500',
      icon: <Zap className="w-7 h-7" />,
    },
  ];

  // Quadruple the sponsors array to guarantee continuous gapless looping across wide screens
  const marqueeItems = [...sponsorsList, ...sponsorsList, ...sponsorsList, ...sponsorsList];

  return (
    <section id="sponsors" className="py-20 relative overflow-hidden bg-white/80 dark:bg-[#0A0816]/70 border-y border-slate-200 dark:border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-cyan-500/40 dark:border-carnival-cyan/40 text-cyan-700 dark:text-carnival-cyan text-xs font-mono font-bold tracking-widest uppercase mb-3 shadow-sm dark:shadow-neon-cyan">
          <Sparkles className="w-4 h-4 text-cyan-600 dark:text-carnival-cyan" />
          <span>Powered By Tech Industry Leaders</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight font-heading uppercase">
          Carnival <span className="text-gradient-cyan">Sponsors & Partners</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto mt-3">
          Empowering coders with developer tools, cloud infrastructure, mentorship, and career fast-track opportunities.
        </p>
      </div>

      {/* Infinite Horizontal Marquee Container */}
      <div className="relative w-full overflow-hidden group py-4">
        {/* Gradient edge masks to smoothly fade content at left and right edges */}
        <div className="absolute top-0 bottom-0 left-0 w-32 bg-gradient-to-r from-slate-50 dark:from-[#0C0A1A] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-32 bg-gradient-to-l from-slate-50 dark:from-[#0C0A1A] to-transparent z-10 pointer-events-none" />

        {/* Marquee Track: animate-marquee with smooth continuous movement, pauses on hover */}
        <div className="flex gap-6 w-max animate-marquee group-hover:[animation-play-state:paused]">
          {marqueeItems.map((sponsor, idx) => (
            <div
              key={`${sponsor.name}-${idx}`}
              className="glass-card rounded-2xl px-6 py-5 border border-slate-200 dark:border-white/10 hover:border-cyan-500/60 dark:hover:border-carnival-cyan/60 flex items-center gap-4 transition-all duration-300 hover:scale-105 shrink-0 bg-white dark:bg-[#14112e]/90 shadow-xl group/card cursor-pointer"
            >
              {/* Logo icon converted to grayscale by default, transitioning to full color on hover */}
              <div
                className={`p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 filter grayscale opacity-60 group-hover/card:grayscale-0 group-hover/card:opacity-100 transition-all duration-300 ${sponsor.brandColor}`}
              >
                {sponsor.icon}
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight group-hover/card:text-cyan-600 dark:group-hover/card:text-carnival-cyan transition-colors">
                    {sponsor.name}
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${sponsor.tierBadgeColor}`}>
                    {sponsor.tier}
                  </span>
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-mono">{sponsor.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
