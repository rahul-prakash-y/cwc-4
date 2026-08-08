import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Search, Flame, Crown, Github, Award, CheckCircle2, Ticket, RefreshCw } from 'lucide-react';
import { Team } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const RegisteredTeams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
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
          if (Array.isArray(data)) {
            // Map backend schema to Team frontend model
            const mappedTeams: Team[] = data.map((t: any, idx: number) => ({
              id: t._id || t.id || `team-${idx + 1}`,
              name: t.name,
              tagline: t.tagline || t.description || 'Carnival contender',
              rank: t.rank || idx + 1,
              points: t.points ?? 0,
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
          } else {
            setTeams([]);
          }
        } else {
          setTeams([]);
        }
      } catch (err) {
        console.warn('Failed to fetch arena teams:', err);
        setTeams([]);
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
              className="pl-10 pr-4 py-2.5 rounded-xl glass-card text-sm text-slate-900 dark:text-white placeholder-slate-400 border border-slate-200 dark:border-white/10 focus:border-cwc-red focus:outline-none w-64 transition-all"
            />
          </div>

          {/* Filter Pills */}
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'all'
                ? 'bg-carnival-crimson text-white shadow-neon-crimson'
                : 'glass-card text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Teams ({teams.length})
          </button>
          <button
            onClick={() => setFilterCategory('top3')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
              filterCategory === 'top3'
                ? 'bg-carnival-gold text-slate-950 shadow-neon-gold'
                : 'glass-card text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
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
      ) : filteredTeams.length === 0 ? (
        <div className="p-16 text-center rounded-3xl glass-card border border-slate-200 dark:border-white/10 space-y-4 bg-white/80 dark:bg-slate-950/60 my-8">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-400 flex items-center justify-center mx-auto">
            <Ticket className="w-8 h-8 text-carnival-gold" />
          </div>
          <div className="space-y-1">
            <h4 className="text-slate-900 dark:text-white font-bold text-lg font-mono">No registered teams found</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              No approved carnival teams are currently registered in the database. When teams self-register or get approved by SuperAdmin, they will appear here.
            </p>
          </div>
        </div>
      ) : (
        /* Grid of 3D Physical Admission-Ticket Styled Carnival Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTeams.map((team: Team) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="ticket-flip-card min-h-[420px] w-full group cursor-pointer"
            >
              <div className="ticket-flip-inner min-h-[420px]">
                {/* FRONT OF TICKET */}
                <div className="ticket-flip-front glass-card rounded-3xl p-6 border border-slate-200 dark:border-carnival-gold/30 group-hover:border-carnival-gold shadow-xl hover:shadow-[0_0_35px_rgba(255,215,0,0.35)] flex flex-col justify-between relative overflow-hidden bg-white/95 dark:bg-[#151329]/95">
                  {/* Ticket Semicircle Side Cutouts */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-[#0B0A16] border-r border-slate-200 dark:border-white/20 z-10" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-[#0B0A16] border-l border-slate-200 dark:border-white/20 z-10" />

                  {/* Ambient Corner Accent */}
                  <div
                    className="absolute top-0 right-0 w-36 h-36 rounded-full blur-2xl opacity-25 group-hover:opacity-50 transition-opacity"
                    style={{ backgroundColor: team.themeColor }}
                  />

                  {/* Ticket Header Stub */}
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-600 dark:text-carnival-gold uppercase tracking-widest mb-3">
                      <span className="flex items-center gap-1">
                        <Ticket className="w-3.5 h-3.5 text-amber-600 dark:text-carnival-gold" />
                        TICKET #{team.id.toUpperCase()}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400">PASSED ARENA</span>
                    </div>

                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border border-slate-200 dark:border-white/20 group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: `${team.themeColor}22` }}
                        >
                          {team.avatar}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-xl text-slate-900 dark:text-white group-hover:text-cwc-red dark:group-hover:text-carnival-gold transition-colors">
                            {team.name}
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-1">"{team.tagline}"</p>
                        </div>
                      </div>

                      <div>{getRankBadge(team.rank)}</div>
                    </div>

                    {/* Status & Points Bar */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-black/50 border border-slate-200 dark:border-white/10 mb-4 font-mono text-xs shadow-inner">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{team.status}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-amber-600 dark:text-carnival-gold font-extrabold text-sm">
                        <Flame className="w-4 h-4 text-carnival-crimson fill-carnival-crimson animate-pulse" />
                        <span>{team.points} PTS</span>
                      </div>
                    </div>

                    {/* Dotted Ticket Perforation Line */}
                    <div className="border-b border-dashed border-slate-300 dark:border-white/20 my-4 relative">
                      <span className="absolute left-1/2 -translate-x-1/2 -top-2 bg-white dark:bg-[#151329] px-2 text-[9px] font-mono text-slate-500 uppercase">
                        ROSTER • HOVER TO FLIP
                      </span>
                    </div>

                    {/* Team Members List */}
                    <div className="space-y-2">
                      {team.members.map((member, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-100/70 dark:bg-white/5 hover:bg-slate-200/70 dark:hover:bg-white/10 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                              alt={member.name}
                              className="w-7 h-7 rounded-full object-cover border border-amber-400 dark:border-carnival-gold/40"
                            />
                            <div>
                              <div className="text-xs font-semibold text-slate-900 dark:text-white">{member.name}</div>
                              <div className="text-[10px] text-cyan-700 dark:text-carnival-cyan font-mono">{member.role}</div>
                            </div>
                          </div>

                          {member.github && (
                            <a
                              href={`https://github.com/${member.github}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-slate-400 hover:text-slate-900 dark:hover:text-white p-1"
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
                </div>

                {/* BACK OF TICKET (Physical Ticket Reverse Details) */}
                <div className="ticket-flip-back glass-card rounded-3xl p-6 border-2 border-amber-400 dark:border-carnival-gold shadow-2xl flex flex-col justify-between relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-slate-100 dark:from-[#1C172E] dark:via-[#120F24] dark:to-[#0B0916] text-slate-900 dark:text-slate-200">
                  {/* Ticket Semicircle Side Cutouts */}
                  <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-[#0B0A16] border-r border-slate-300 dark:border-white/20 z-10" />
                  <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-slate-100 dark:bg-[#0B0A16] border-l border-slate-300 dark:border-white/20 z-10" />

                  <div>
                    {/* Back Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 mb-4">
                      <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-amber-600 dark:text-carnival-gold" />
                        <span className="font-extrabold text-slate-900 dark:text-white text-sm">ARENA PASS VERIFICATION</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 dark:bg-carnival-gold/20 text-amber-700 dark:text-carnival-gold border border-amber-400/30 dark:border-carnival-gold/30">
                        OFFICIAL STAMP
                      </span>
                    </div>

                    {/* Team Badges & Perks */}
                    <div className="space-y-3 mb-4">
                      <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold">Granted Perks & Badges:</div>
                      <div className="flex flex-wrap gap-2">
                        {team.badges.map((b, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-semibold text-slate-800 dark:text-white flex items-center gap-1"
                          >
                            <span>{b}</span>
                          </span>
                        ))}
                        {team.streak > 0 && (
                          <span className="px-2.5 py-1 rounded-xl bg-carnival-crimson/10 dark:bg-carnival-crimson/20 border border-carnival-crimson/40 text-carnival-crimson text-xs font-bold font-mono">
                            🔥 {team.streak}-Day Streak
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Simulated Barcode & Serial */}
                    <div className="p-3 rounded-2xl bg-slate-100 dark:bg-black/60 border border-slate-200 dark:border-white/10 text-center font-mono space-y-1">
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">SERIAL BARCODE #CWC4-{team.id.toUpperCase()}-2026</div>
                      <div className="h-8 bg-slate-200 dark:bg-[#0F0D1C] rounded-lg flex items-center justify-center tracking-widest text-amber-600 dark:text-carnival-gold text-lg font-bold select-none border border-amber-400/30 dark:border-carnival-gold/30">
                        ||| | |||| | ||| || ||||
                      </div>
                    </div>
                  </div>

                  {/* Back Footer Link */}
                  <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-500 dark:text-slate-400">CWC SEASON 4</span>
                    <span className="text-amber-600 dark:text-carnival-gold font-bold flex items-center gap-1">
                      <span>VERIFIED TICKET</span>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};
