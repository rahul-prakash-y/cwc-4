import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Flame, Crown, Github, Award, CheckCircle2 } from 'lucide-react';
import { MOCK_TEAMS } from '../../data/mockData';
import { Team } from '../../types';

export const RegisteredTeams: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'top3'>('all');

  const filteredTeams = MOCK_TEAMS.filter((team) => {
    const matchesSearch =
      team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.members.some((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (filterCategory === 'top3') {
      return matchesSearch && team.rank <= 3;
    }
    return matchesSearch;
  });

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-extrabold text-xs shadow-neon-gold">
          <Crown className="w-3.5 h-3.5 fill-current" />
          RANK #1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-300 text-slate-900 font-extrabold text-xs shadow-md">
          <Award className="w-3.5 h-3.5" />
          RANK #2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-700 text-amber-100 font-extrabold text-xs shadow-md">
          <Award className="w-3.5 h-3.5" />
          RANK #3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-carnival-card border border-carnival-cyan/30 text-carnival-cyan font-mono font-bold text-xs">
        RANK #{rank}
      </span>
    );
  };

  return (
    <section id="teams" className="py-20 px-4 max-w-7xl mx-auto relative">
      {/* Background Accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-carnival-purple/10 blur-[150px] pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <div className="inline-flex items-center gap-2 text-carnival-gold font-mono text-xs uppercase tracking-widest mb-2 font-semibold">
            <Shield className="w-4 h-4 text-carnival-gold" />
            <span>Carnival Competitors</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Registered <span className="text-gradient-carnival">Carnival Teams</span>
          </h2>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 mt-6 md:mt-0">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team or member..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 rounded-xl glass-card text-sm text-white placeholder-slate-400 border border-white/10 focus:border-carnival-gold/50 focus:outline-none w-64 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'all'
                ? 'bg-carnival-crimson text-white shadow-neon-crimson'
                : 'glass-card text-slate-300 hover:text-white'
            }`}
          >
            All Teams ({MOCK_TEAMS.length})
          </button>
          <button
            onClick={() => setFilterCategory('top3')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'top3'
                ? 'bg-carnival-gold text-slate-950 shadow-neon-gold'
                : 'glass-card text-slate-300 hover:text-white'
            }`}
          >
            👑 Top 3 Podium
          </button>
        </div>
      </div>

      {/* Grid of Team Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTeams.map((team: Team) => (
          <motion.div
            key={team.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="glass-card rounded-2xl p-6 border border-white/10 hover:border-carnival-gold/40 shadow-xl group transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
          >
            {/* Ambient Corner Accent */}
            <div
              className="absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity"
              style={{ backgroundColor: team.themeColor }}
            />

            {/* Top Bar: Mascot + Name + Rank */}
            <div>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  {/* Mascot Avatar */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/20"
                    style={{ backgroundColor: `${team.themeColor}22` }}
                  >
                    {team.avatar}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-xl text-white group-hover:text-carnival-gold transition-colors">
                      {team.name}
                    </h3>
                    <p className="text-xs text-slate-400 italic line-clamp-1">"{team.tagline}"</p>
                  </div>
                </div>

                {/* Rank Badge */}
                <div>{getRankBadge(team.rank)}</div>
              </div>

              {/* Status & Points Bar */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5 mb-5 font-mono text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{team.status}</span>
                </div>
                <div className="flex items-center gap-1.5 text-carnival-gold font-extrabold text-sm">
                  <Flame className="w-4 h-4 text-carnival-crimson fill-carnival-crimson animate-pulse" />
                  <span>{team.points} PTS</span>
                </div>
              </div>

              {/* Badges Earned */}
              {team.badges && team.badges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {team.badges.map((b, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/5 border border-white/10 text-slate-300"
                    >
                      {b}
                    </span>
                  ))}
                </div>
              )}

              {/* Team Members List */}
              <div className="space-y-2.5">
                <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400 font-bold">
                  Team Roster ({team.members.length})
                </div>
                {team.members.map((member, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <img
                        src={member.avatar}
                        alt={member.name}
                        className="w-7 h-7 rounded-full object-cover border border-carnival-gold/40"
                      />
                      <div>
                        <div className="text-xs font-semibold text-white">{member.name}</div>
                        <div className="text-[10px] text-carnival-cyan font-mono">{member.role}</div>
                      </div>
                    </div>

                    {member.github && (
                      <a
                        href={`https://github.com/${member.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white p-1"
                        title={`GitHub: @${member.github}`}
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Glow Line */}
            <div
              className="absolute bottom-0 inset-x-0 h-[2px] opacity-40 group-hover:opacity-100 transition-opacity"
              style={{ backgroundColor: team.themeColor }}
            />
          </motion.div>
        ))}
      </div>
    </section>
  );
};
