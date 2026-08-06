import React from 'react';
import { Sparkles, Globe, Shield, Code, Server, Database, Cloud, Terminal, Cpu, Zap } from 'lucide-react';

interface Sponsor {
  name: string;
  category: string;
  tier: 'Title Partner' | 'Gold Sponsor' | 'Tech Partner' | 'Power Booster';
  tierColor: string;
  icon: React.ReactNode;
}

export const SponsorMarquee: React.FC = () => {
  const sponsorsList: Sponsor[] = [
    {
      name: 'Cloudflare',
      category: 'Global Edge & Security',
      tier: 'Title Partner',
      tierColor: 'bg-orange-500/20 text-orange-400 border-orange-500/40',
      icon: <Cloud className="w-6 h-6 text-orange-400" />,
    },
    {
      name: 'MongoDB',
      category: 'Developer Data Platform',
      tier: 'Title Partner',
      tierColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
      icon: <Database className="w-6 h-6 text-emerald-400" />,
    },
    {
      name: 'GitHub',
      category: 'Developer Ecosystem',
      tier: 'Gold Sponsor',
      tierColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      icon: <Code className="w-6 h-6 text-purple-300" />,
    },
    {
      name: 'Vercel',
      category: 'Frontend & Cloud Platform',
      tier: 'Gold Sponsor',
      tierColor: 'bg-slate-300/20 text-white border-slate-300/40',
      icon: <Terminal className="w-6 h-6 text-white" />,
    },
    {
      name: 'Postman',
      category: 'API Development Platform',
      tier: 'Tech Partner',
      tierColor: 'bg-carnival-crimson/20 text-carnival-crimson border-carnival-crimson/40',
      icon: <Globe className="w-6 h-6 text-carnival-crimson" />,
    },
    {
      name: 'JetBrains',
      category: 'Developer Tools',
      tier: 'Gold Sponsor',
      tierColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
      icon: <Cpu className="w-6 h-6 text-cyan-400" />,
    },
    {
      name: 'Amazon Web Services',
      category: 'Cloud Computing Infrastructure',
      tier: 'Tech Partner',
      tierColor: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
      icon: <Server className="w-6 h-6 text-amber-400" />,
    },
    {
      name: 'Red Bull Energy',
      category: 'Official Carnival Booster',
      tier: 'Power Booster',
      tierColor: 'bg-red-600/20 text-red-400 border-red-500/40',
      icon: <Zap className="w-6 h-6 text-red-400" />,
    },
  ];

  // We double the list to guarantee smooth continuous loop
  const marqueeItems = [...sponsorsList, ...sponsorsList];

  return (
    <section id="sponsors" className="py-16 relative overflow-hidden bg-black/40 border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-carnival-cyan/30 text-carnival-cyan text-xs font-mono font-bold tracking-widest uppercase mb-3">
          <Sparkles className="w-4 h-4 text-carnival-cyan" />
          <span>Powered By Industry Leaders</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Carnival <span className="text-gradient-cyan">Sponsors & Partners</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto mt-2">
          Empowering the next generation of full-stack engineers with tools, mentorship, and opportunities.
        </p>
      </div>

      {/* Infinite Horizontal Marquee Container */}
      <div className="relative w-full overflow-hidden group">
        {/* Gradient edge masks to smoothly fade content at sides */}
        <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-[#0B0A16] to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-[#0B0A16] to-transparent z-10 pointer-events-none" />

        {/* Marquee Track */}
        <div className="flex gap-6 w-max animate-marquee group-hover:[animation-play-state:paused] py-4">
          {marqueeItems.map((sponsor, idx) => (
            <div
              key={`${sponsor.name}-${idx}`}
              className="glass-card rounded-2xl px-6 py-4 border border-white/10 hover:border-carnival-cyan/60 flex items-center gap-4 transition-all duration-300 hover:scale-105 shrink-0 bg-[#14112c]/80 shadow-lg"
            >
              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                {sponsor.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white text-base tracking-tight">{sponsor.name}</span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${sponsor.tierColor}`}>
                    {sponsor.tier}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-mono">{sponsor.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
