import React, { useState } from 'react';
import { ShieldCheck, Calendar, Trophy, Sparkles, BookOpen, Zap, Award, Target, ChevronRight } from 'lucide-react';

interface InfoCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  borderColor: string;
  glowColor: string;
  points: { title: string; desc: string }[];
  highlight: string;
}

export const AboutCWC: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);

  const cards: InfoCardProps[] = [
    {
      title: 'Carnival Regulations & Rules',
      subtitle: 'Fair play, strict code purity, and wildcard mechanics',
      icon: <BookOpen className="w-7 h-7 text-carnival-crimson" />,
      badge: 'Rule Codex',
      badgeColor: 'bg-carnival-crimson/20 text-carnival-crimson border-carnival-crimson/40',
      borderColor: 'border-carnival-crimson/30 hover:border-carnival-crimson',
      glowColor: 'hover:shadow-[0_0_30px_rgba(255,0,85,0.25)]',
      highlight: 'Strict Anti-Plagiarism & Automated Code Auditing Active',
      points: [
        {
          title: 'Squad Formation',
          desc: 'Teams consist of 2 to 4 registered students. Cross-departmental squads are welcome.',
        },
        {
          title: 'Daily Submissions',
          desc: 'Tasks open daily at 10:00 AM. Code submissions must be pushed via GitHub before 11:59 PM.',
        },
        {
          title: 'Fair Play & Power-Ups',
          desc: 'Use earned Immunities and Time-Doubler advantages strategically without violating ethics.',
        },
      ],
    },
    {
      title: '10-Day Season Structure',
      subtitle: 'A multi-phase competitive marathon packed with daily sprints',
      icon: <Calendar className="w-7 h-7 text-carnival-gold" />,
      badge: 'Season Roadmap',
      badgeColor: 'bg-carnival-gold/20 text-carnival-gold border-carnival-gold/40',
      borderColor: 'border-carnival-gold/30 hover:border-carnival-gold',
      glowColor: 'hover:shadow-[0_0_30px_rgba(255,215,0,0.25)]',
      highlight: '10 Sprints • 3 Elimination Gates • 1 Live Grand Finale',
      points: [
        {
          title: 'Phase 1: Sprint Sprints (Days 1 - 4)',
          desc: 'Fast-paced algorithmic challenges and core full-stack feature implementations.',
        },
        {
          title: 'Phase 2: Mid-Season Showdown (Days 5 - 7)',
          desc: 'High-stakes battleground where advantage power-ups can steal or protect points.',
        },
        {
          title: 'Phase 3: Grand Finale Arena (Days 8 - 10)',
          desc: 'Top 10 teams enter the gold arena for real-time live coding and judging.',
        },
      ],
    },
    {
      title: 'Carnival Perks & Benefits',
      subtitle: 'Unlock career opportunities, glory, swags, and prize money',
      icon: <Trophy className="w-7 h-7 text-carnival-cyan" />,
      badge: 'Rewards & Perks',
      badgeColor: 'bg-carnival-cyan/20 text-carnival-cyan border-carnival-cyan/40',
      borderColor: 'border-carnival-cyan/30 hover:border-carnival-cyan',
      glowColor: 'hover:shadow-[0_0_30px_rgba(0,240,255,0.25)]',
      highlight: '₹1,00,000+ Prize Pool + Verified Digital Certificates',
      points: [
        {
          title: 'Massive Cash Pool & Trophies',
          desc: 'Cash prizes for Top 3 Podiums plus 4 specialized distinction awards.',
        },
        {
          title: 'Swag Kits & Goodies',
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
    <section id="about" className="py-16 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-carnival-crimson/10 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-carnival-cyan/10 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-carnival-gold/30 text-carnival-gold text-xs font-mono font-bold tracking-widest uppercase shadow-neon-gold">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
            <span>The Carnival Experience 🎪</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            About <span className="text-gradient-carnival">Code With Curious</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg">
            Where competitive programming meets high-energy carnival excitement. Explore the official guidelines, season progression, and rewards awaiting top coders.
          </p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cards.map((card, index) => (
            <div
              key={card.title}
              onMouseEnter={() => setActiveTab(index)}
              className={`glass-card rounded-3xl p-6 sm:p-8 border transition-all duration-300 flex flex-col justify-between group ${card.borderColor} ${card.glowColor} ${
                activeTab === index ? 'bg-[#15122B]/90 scale-[1.02]' : 'bg-[#110E24]/70'
              }`}
            >
              <div>
                {/* Header Top */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform">
                    {card.icon}
                  </div>
                  <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-full border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-carnival-gold transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  {card.subtitle}
                </p>

                {/* Points List */}
                <div className="space-y-4 mb-6">
                  {card.points.map((pt) => (
                    <div key={pt.title} className="flex items-start gap-3">
                      <div className="mt-1 p-1 rounded-full bg-carnival-gold/10 text-carnival-gold border border-carnival-gold/30">
                        <Zap className="w-3 h-3" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">{pt.title}</h4>
                        <p className="text-xs text-slate-400 leading-normal">{pt.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Highlight */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="flex items-center gap-1.5 text-carnival-gold font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  {card.highlight}
                </span>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats Bar */}
        <div className="mt-12 glass-card rounded-2xl p-6 border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-gradient-gold">10 Days</div>
            <div className="text-xs font-mono text-slate-400 uppercase">Non-Stop Sprints</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-gradient-carnival">50+ Squads</div>
            <div className="text-xs font-mono text-slate-400 uppercase">Battling Live</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-gradient-cyan">₹1,00,000+</div>
            <div className="text-xs font-mono text-slate-400 uppercase">Total Prize Pool</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-carnival-crimson">7 Awards</div>
            <div className="text-xs font-mono text-slate-400 uppercase">Trophies & Badges</div>
          </div>
        </div>
      </div>
    </section>
  );
};
