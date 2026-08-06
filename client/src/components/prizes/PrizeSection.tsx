import React from 'react';
import { Crown, Trophy, Award, Zap, Flame, Sparkles, HeartHandshake, Bug, Timer, TrendingUp, PartyPopper } from 'lucide-react';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

interface MainPrizeCardProps {
  title: string;
  rankLabel: string;
  amount: string;
  trophyColor: string;
  bgGradient: string;
  borderColor: string;
  glowShadow: string;
  perks: string[];
  isChampion?: boolean;
}

interface SpecialPrizeCardProps {
  title: string;
  category: string;
  amount: string;
  icon: React.ReactNode;
  accentColor: string;
  badge: string;
  desc: string;
}

export const PrizeSection: React.FC = () => {
  const mainPrizes: MainPrizeCardProps[] = [
    {
      title: 'Runner Up',
      rankLabel: '2nd Place',
      amount: '₹30,000',
      trophyColor: 'text-slate-300',
      bgGradient: 'from-slate-900/90 via-[#151a2d]/80 to-[#0d101d]/90',
      borderColor: 'border-slate-400/40 hover:border-slate-300',
      glowShadow: 'hover:shadow-[0_0_35px_rgba(203,213,225,0.25)]',
      perks: ['Silver Grand Trophy', 'Carnival Swag Kits', 'Verified Certificate', 'Interview Direct Pass'],
    },
    {
      title: 'Grand Champion',
      rankLabel: '1st Place Winner',
      amount: '₹50,000',
      trophyColor: 'text-yellow-400',
      bgGradient: 'from-yellow-950/70 via-[#261d05]/90 to-[#181102]/95',
      borderColor: 'border-carnival-gold/60 hover:border-carnival-gold',
      glowShadow: 'shadow-[0_0_40px_rgba(255,215,0,0.35)] hover:shadow-[0_0_60px_rgba(255,215,0,0.5)]',
      perks: [
        'Golden Carnival Trophy',
        'Full Swag & Mechanical Keyboards',
        'Winner Champion Title',
        'Direct Sponsor Hiring Fast-Track',
        'Hall of Fame Entry',
      ],
      isChampion: true,
    },
    {
      title: '2nd Runner Up',
      rankLabel: '3rd Place',
      amount: '₹15,000',
      trophyColor: 'text-amber-600',
      bgGradient: 'from-amber-950/60 via-[#1d140e]/80 to-[#100b07]/90',
      borderColor: 'border-amber-600/40 hover:border-amber-500',
      glowShadow: 'hover:shadow-[0_0_35px_rgba(217,119,6,0.25)]',
      perks: ['Bronze Grand Trophy', 'Carnival Swag Kits', 'Verified Certificate', 'Special Recognition Badge'],
    },
  ];

  const specialPrizes: SpecialPrizeCardProps[] = [
    {
      title: 'Best Team Spirit',
      category: 'Crowd Favorite & Synergy',
      amount: '₹5,000',
      icon: <HeartHandshake className="w-6 h-6 text-carnival-crimson" />,
      accentColor: 'border-carnival-crimson/40 hover:border-carnival-crimson text-carnival-crimson',
      badge: 'Synergy Award',
      desc: 'Awarded to the squad demonstrating outstanding camaraderie, active community participation, and peer support.',
    },
    {
      title: 'Best Debugger',
      category: 'Bug Hunter & Code Auditor',
      amount: '₹5,000',
      icon: <Bug className="w-6 h-6 text-carnival-cyan" />,
      accentColor: 'border-carnival-cyan/40 hover:border-carnival-cyan text-carnival-cyan',
      badge: 'Code Auditor',
      desc: 'Given to the developer who identifies, traces, and fixes complex edge-case bugs with surgical precision.',
    },
    {
      title: 'Fastest Coder',
      category: 'Speed Demon Sprint Winner',
      amount: '₹5,000',
      icon: <Timer className="w-6 h-6 text-amber-400" />,
      accentColor: 'border-amber-400/40 hover:border-amber-400 text-amber-400',
      badge: 'Lightning Speed',
      desc: 'Recognizing the team with the fastest average task submission times and optimal runtime complexity.',
    },
    {
      title: 'Most Consistent Team',
      category: 'Daily Streak Master',
      amount: '₹5,000',
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      accentColor: 'border-emerald-400/40 hover:border-emerald-400 text-emerald-400',
      badge: '10-Day Streak',
      desc: 'Honoring the squad that maintained 100% daily task submission consistency across all 10 carnival sprints.',
    },
  ];

  return (
    <section id="prizes" className="py-20 relative overflow-hidden">
      {/* Background radial spotlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-b from-carnival-gold/15 via-carnival-crimson/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-carnival-gold/40 text-carnival-gold text-xs font-mono font-bold tracking-widest uppercase shadow-neon-gold">
            <Trophy className="w-4 h-4 text-carnival-gold" />
            <span>Prize Pool & Hall of Glory 🏆</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Carnival <span className="text-gradient-gold">Prize Arena</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg">
            Over <span className="text-carnival-gold font-bold">₹1,00,000+</span> in cash rewards, custom physical trophies, exclusive swag, and career-defining honors up for grabs!
          </p>

          <div className="pt-2">
            <button
              onClick={triggerCarnivalConfetti}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-carnival-gold via-amber-500 to-carnival-crimson text-black font-extrabold text-xs uppercase tracking-wider shadow-neon-gold hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <PartyPopper className="w-4 h-4" />
              <span>Celebrate Prize Pool</span>
            </button>
          </div>
        </div>

        {/* Podium Top 3 Main Winners Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-16">
          {/* Order logic for podium: Runner Up (2nd), Champion (1st), 2nd Runner Up (3rd) on desktop */}
          {[mainPrizes[0], mainPrizes[1], mainPrizes[2]].map((prize) => {
            const isChamp = prize.isChampion;
            return (
              <div
                key={prize.title}
                className={`relative rounded-3xl p-8 border transition-all duration-300 bg-gradient-to-b ${prize.bgGradient} ${prize.borderColor} ${prize.glowShadow} ${
                  isChamp ? 'md:-translate-y-4 border-2 z-10' : ''
                }`}
              >
                {/* Champion Crown / Badge */}
                {isChamp && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-gradient-to-r from-carnival-gold to-amber-500 text-black font-black text-xs uppercase tracking-widest flex items-center gap-1.5 shadow-neon-gold border border-yellow-200">
                    <Crown className="w-4 h-4 fill-black" />
                    <span>Ultimate Champion</span>
                  </div>
                )}

                <div className="text-center space-y-4">
                  {/* Rank Badge */}
                  <span className="inline-block text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10 uppercase tracking-wider">
                    {prize.rankLabel}
                  </span>

                  {/* Trophy Icon */}
                  <div className="flex justify-center my-4">
                    <div className={`p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner ${isChamp ? 'animate-bounce' : ''}`}>
                      <Trophy className={`w-12 h-12 ${prize.trophyColor}`} />
                    </div>
                  </div>

                  {/* Title & Amount */}
                  <div>
                    <h3 className="text-2xl font-black text-white">{prize.title}</h3>
                    <div className={`text-4xl font-extrabold mt-2 ${isChamp ? 'text-gradient-gold' : 'text-white'}`}>
                      {prize.amount}
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-1 uppercase tracking-widest">Grand Cash Reward</p>
                  </div>

                  {/* Included Perks */}
                  <div className="pt-6 border-t border-white/10 text-left space-y-2.5">
                    <p className="text-xs font-bold text-slate-300 uppercase font-mono mb-3">Rewards & Honors:</p>
                    {prize.perks.map((perk) => (
                      <div key={perk} className="flex items-center gap-2 text-xs text-slate-300">
                        <Sparkles className="w-3.5 h-3.5 text-carnival-gold shrink-0" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Special Distinction Awards Title */}
        <div className="text-center space-y-2 mb-8">
          <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Special Distinction <span className="text-gradient-cyan">Category Awards</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            ₹5,000 Cash Prize + Specialized Honor Medals for Exceptional Feats
          </p>
        </div>

        {/* 4 Special Award Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialPrizes.map((special) => (
            <div
              key={special.title}
              className={`glass-card rounded-2xl p-6 border transition-all duration-300 hover:scale-[1.03] flex flex-col justify-between ${special.accentColor}`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                    {special.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/10 text-slate-300 border border-white/10 uppercase">
                    {special.badge}
                  </span>
                </div>

                <h4 className="text-lg font-bold text-white mb-1">{special.title}</h4>
                <p className="text-xs text-carnival-gold font-mono mb-3">{special.category}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{special.desc}</p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Prize Money:</span>
                <span className="text-lg font-extrabold text-white font-mono">{special.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
