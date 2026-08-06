import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Trophy, Award, Sparkles, HeartHandshake, Bug, Timer, TrendingUp, PartyPopper } from 'lucide-react';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

interface MainPrizeCardProps {
  title: string;
  rankLabel: string;
  amount: string;
  trophyColor: string;
  bgGradient: string;
  borderColor: string;
  glowShadow: string;
  hoverGlow: string;
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

export const Prizes: React.FC = () => {
  const mainPrizes: MainPrizeCardProps[] = [
    {
      title: 'Runner Up',
      rankLabel: '2nd Place',
      amount: '₹30,000',
      trophyColor: 'text-cyan-300',
      bgGradient: 'from-cyan-950/70 via-[#101828]/90 to-[#0a101d]/95',
      borderColor: 'border-cyan-400/50 hover:border-cyan-300',
      glowShadow: 'shadow-[0_0_35px_rgba(0,240,255,0.25)]',
      hoverGlow: 'hover:shadow-[0_0_65px_rgba(0,240,255,0.65)]',
      perks: ['Silver Grand Trophy', 'Carnival Swag Kits', 'Verified Certificate', 'Interview Direct Pass'],
    },
    {
      title: 'Grand Champion',
      rankLabel: '1st Place Winner',
      amount: '₹50,000',
      trophyColor: 'text-amber-300',
      bgGradient: 'from-amber-950/80 via-[#261d05]/95 to-[#160f02]/95',
      borderColor: 'border-carnival-gold hover:border-yellow-200',
      glowShadow: 'shadow-[0_0_50px_rgba(255,215,0,0.45)]',
      hoverGlow: 'hover:shadow-[0_0_85px_rgba(255,215,0,0.85)]',
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
      trophyColor: 'text-orange-400',
      bgGradient: 'from-orange-950/70 via-[#1d120a]/90 to-[#120a05]/95',
      borderColor: 'border-orange-500/50 hover:border-orange-400',
      glowShadow: 'shadow-[0_0_35px_rgba(249,115,22,0.25)]',
      hoverGlow: 'hover:shadow-[0_0_65px_rgba(249,115,22,0.65)]',
      perks: ['Bronze Grand Trophy', 'Carnival Swag Kits', 'Verified Certificate', 'Special Recognition Badge'],
    },
  ];

  const specialPrizes: SpecialPrizeCardProps[] = [
    {
      title: 'Best Team Spirit',
      category: 'Crowd Favorite & Synergy',
      amount: '₹5,000',
      icon: <HeartHandshake className="w-6 h-6 text-carnival-crimson" />,
      accentColor: 'border-carnival-crimson/40 hover:border-carnival-crimson text-carnival-crimson hover:shadow-[0_0_30px_rgba(255,0,85,0.4)]',
      badge: 'Synergy Award',
      desc: 'Awarded to the squad demonstrating outstanding camaraderie, active community participation, and peer support.',
    },
    {
      title: 'Best Debugger',
      category: 'Bug Hunter & Code Auditor',
      amount: '₹5,000',
      icon: <Bug className="w-6 h-6 text-carnival-cyan" />,
      accentColor: 'border-carnival-cyan/40 hover:border-carnival-cyan text-carnival-cyan hover:shadow-[0_0_30px_rgba(0,240,255,0.4)]',
      badge: 'Code Auditor',
      desc: 'Given to the developer who identifies, traces, and fixes complex edge-case bugs with surgical precision.',
    },
    {
      title: 'Fastest Coder',
      category: 'Speed Demon Sprint Winner',
      amount: '₹5,000',
      icon: <Timer className="w-6 h-6 text-amber-400" />,
      accentColor: 'border-amber-400/40 hover:border-amber-400 text-amber-400 hover:shadow-[0_0_30px_rgba(251,191,36,0.4)]',
      badge: 'Lightning Speed',
      desc: 'Recognizing the team with the fastest average task submission times and optimal runtime complexity.',
    },
    {
      title: 'Most Consistent Team',
      category: 'Daily Streak Master',
      amount: '₹5,000',
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      accentColor: 'border-emerald-400/40 hover:border-emerald-400 text-emerald-400 hover:shadow-[0_0_30px_rgba(52,211,153,0.4)]',
      badge: '10-Day Streak',
      desc: 'Honoring the squad that maintained 100% daily task submission consistency across all 10 carnival sprints.',
    },
  ];

  return (
    <section id="prizes" className="py-20 relative overflow-hidden">
      {/* Background radial spotlight */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-gradient-to-b from-carnival-gold/15 via-carnival-crimson/10 to-transparent rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-carnival-gold/40 text-carnival-gold text-xs font-mono font-bold tracking-widest uppercase shadow-neon-gold">
            <Trophy className="w-4 h-4 text-carnival-gold" />
            <span>Prize Pool & Hall of Glory 🏆</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white uppercase font-heading">
            Carnival <span className="text-gradient-gold">Prize Arena</span>
          </h2>
          <p className="max-w-2xl mx-auto text-slate-300 text-base sm:text-lg">
            Over <span className="text-carnival-gold font-bold">₹1,00,000+</span> in cash rewards, custom physical trophies, exclusive swag, and career-defining honors up for grabs!
          </p>

          <div className="pt-2">
            <button
              onClick={triggerCarnivalConfetti}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-carnival-gold via-amber-500 to-carnival-crimson text-black font-extrabold text-xs uppercase tracking-wider shadow-neon-gold hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              <PartyPopper className="w-4 h-4" />
              <span>Celebrate Prize Pool</span>
            </button>
          </div>
        </div>

        {/* Podium Top 3 Main Winners Grid with Framer Motion Tilt & Glow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end mb-16 perspective-1000">
          {/* Order: Runner Up (Silver/Neon Blue), Grand Champion (Gold), 2nd Runner Up (Bronze/Neon Orange) */}
          {[mainPrizes[0], mainPrizes[1], mainPrizes[2]].map((prize, idx) => {
            const isChamp = prize.isChampion;
            return (
              <motion.div
                key={prize.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                whileHover={{ scale: isChamp ? 1.05 : 1.04, rotateY: 3, rotateX: -3 }}
                className={`relative rounded-3xl p-8 border-2 transition-all duration-300 bg-gradient-to-b ${prize.bgGradient} ${prize.borderColor} ${prize.glowShadow} ${prize.hoverGlow} ${
                  isChamp ? 'md:-translate-y-6 z-10 py-10' : ''
                }`}
              >
                {/* Champion Crown / Badge */}
                {isChamp && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full bg-gradient-to-r from-carnival-gold via-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-neon-gold border-2 border-yellow-200 animate-pulse">
                    <Crown className="w-4 h-4 fill-black" />
                    <span>Grand Champion</span>
                  </div>
                )}

                <div className="text-center space-y-4">
                  {/* Rank Badge */}
                  <span
                    className={`inline-block text-[11px] font-mono font-extrabold px-3.5 py-1 rounded-full border uppercase tracking-wider ${
                      isChamp
                        ? 'bg-carnival-gold/20 text-carnival-gold border-carnival-gold/50'
                        : prize.title.includes('Runner Up') && !prize.title.includes('2nd')
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50'
                        : 'bg-orange-500/20 text-orange-300 border-orange-400/50'
                    }`}
                  >
                    {prize.rankLabel}
                  </span>

                  {/* Trophy Icon */}
                  <div className="flex justify-center my-4">
                    <div
                      className={`p-5 rounded-2xl bg-white/5 border border-white/10 shadow-inner ${
                        isChamp ? 'animate-bounce shadow-[0_0_30px_rgba(255,215,0,0.5)]' : ''
                      }`}
                    >
                      <Trophy className={`w-14 h-14 ${prize.trophyColor}`} />
                    </div>
                  </div>

                  {/* Title & Amount */}
                  <div>
                    <h3 className="text-2xl font-black text-white">{prize.title}</h3>
                    <div className={`text-4xl sm:text-5xl font-black mt-2 font-heading ${isChamp ? 'text-gradient-gold' : 'text-white'}`}>
                      {prize.amount}
                    </div>
                    <p className="text-[11px] font-mono text-slate-400 mt-1 uppercase tracking-widest font-bold">
                      Cash Reward
                    </p>
                  </div>

                  {/* Included Perks */}
                  <div className="pt-6 border-t border-white/10 text-left space-y-2.5">
                    <p className="text-xs font-bold text-slate-300 uppercase font-mono mb-3">Rewards & Honors:</p>
                    {prize.perks.map((perk) => (
                      <div key={perk} className="flex items-center gap-2 text-xs text-slate-200">
                        <Sparkles className="w-3.5 h-3.5 text-carnival-gold shrink-0" />
                        <span>{perk}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
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

        {/* 4 Special Award Cards Grid with Tilt Hover Effects */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialPrizes.map((special, index) => (
            <motion.div
              key={special.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -4 }}
              className={`glass-card rounded-2xl p-6 border-2 transition-all duration-300 flex flex-col justify-between ${special.accentColor}`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                    {special.icon}
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white/10 text-slate-200 border border-white/10 uppercase">
                    {special.badge}
                  </span>
                </div>

                <h4 className="text-lg font-black text-white mb-1">{special.title}</h4>
                <p className="text-xs text-carnival-gold font-mono font-bold mb-3">{special.category}</p>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">{special.desc}</p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400 uppercase">Prize Money:</span>
                <span className="text-xl font-black text-white font-mono">{special.amount}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
