import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Flame, Crown, Github, Award, CheckCircle2, Ticket, RefreshCw } from 'lucide-react';
import { MOCK_TEAMS } from '../../data/mockData';
import { Team } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const RegisteredTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'top3'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const { apiFetch } = useAuth();

  useEffect(() => {
    const fetchApprovedTeams = async () => {
      setIsLoading(true);
      try {
        const res = await apiFetch('/teams');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            // Map backend schema to Team frontend model if needed
            const mappedTeams: Team[] = data.map((t: any, idx: number) => ({
              id: t._id || t.id || `team-${idx + 1}`,
              name: t.name,
              tagline: t.tagline || t.description || 'Carnival contender',
              rank: t.rank || idx + 1,
              points: t.points ?? 1200,
              status: t.status || 'Approved',
              avatar: t.avatar || '🎪',
              themeColor: t.themeColor || '#FFD700',
              streak: t.streak || 0,
              badges: t.badges || ['🎟️ Approved Ticket'],
              members: t.members || [
                { name: t.leaderName || 'Team Leader', role: 'Leader', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80' },
              ],
            }));
            setTeams(mappedTeams);
          }
        }
      } catch (err) {
        console.warn('API offline or error fetching teams, using mock team data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApprovedTeams();
  }, []);

  const filteredTeams = teams.filter((team) => {
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
          <div className="inline-flex items-center gap-2 text-carnival-gold font-mono text-xs uppercase tracking-widest mb-2 font-semibold px-3 py-1 rounded-full bg-carnival-gold/10 border border-carnival-gold/30">
            <Ticket className="w-4 h-4 text-carnival-gold" />
            <span>Admission Ticket Competitors</span>
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
            All Teams ({teams.length})
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

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-carnival-gold font-mono gap-3">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>Fetching Arena Ticket Roster...</span>
        </div>
      ) : (
        /* Grid of Admission-Ticket Styled Carnival Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeams.map((team: Team) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -8, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className="glass-card rounded-3xl p-6 border border-carnival-gold/30 hover:border-carnival-gold shadow-xl hover:shadow-[0_0_35px_rgba(255,215,0,0.35)] group transition-all duration-300 flex flex-col justify-between relative overflow-hidden"
            >
              {/* Ticket Semicircle Side Cutouts */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0B0A16] border-r border-white/20 z-10" />
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-[#0B0A16] border-l border-white/20 z-10" />

              {/* Ambient Corner Accent */}
              <div
                className="absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl opacity-25 group-hover:opacity-50 transition-opacity"
                style={{ backgroundColor: team.themeColor }}
              />

              {/* Ticket Header Stub */}
              <div>
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-carnival-gold uppercase tracking-widest mb-3">
                  <span className="flex items-center gap-1">
                    <Ticket className="w-3.5 h-3.5 text-carnival-gold" />
                    ADMISSION TICKET #{team.id.toUpperCase()}
                  </span>
                  <span className="text-emerald-400">PASSED ARENA</span>
                </div>

                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    {/* Mascot Avatar */}
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-white/20 group-hover:scale-110 transition-transform"
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
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/50 border border-white/10 mb-4 font-mono text-xs shadow-inner">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{team.status}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-carnival-gold font-extrabold text-sm">
                    <Flame className="w-4 h-4 text-carnival-crimson fill-carnival-crimson animate-pulse" />
                    <span>{team.points} PTS</span>
                  </div>
                </div>

                {/* Dotted Ticket Perforation Line */}
                <div className="border-b border-dashed border-white/20 my-4 relative">
                  <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-[#151329] px-2 text-[9px] font-mono text-slate-500 uppercase">
                    TEAMS ROSTER
                  </span>
                </div>

                {/* Team Members List */}
                <div className="space-y-2.5">
                  {team.members.map((member, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
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
      )}
    </section>
  );
};
