import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  ArrowUp,
  ArrowDown,
  Minus,
  Search,
  Award,
  Shield,
  Shuffle,
  EyeOff,
} from 'lucide-react';
import { Team } from '../../types';
import { useSocket } from '../../context/SocketContext';

export interface LeaderboardItem {
  id: string;
  name: string;
  logoUrl?: string;
  avatar?: string;
  tagline?: string;
  rank: number;
  trend: 'up' | 'down' | 'same' | 'new';
  trendValue: number;
  status: 'Safe' | 'Danger' | 'Eliminated' | 'Qualified' | 'Approved' | 'Pending' | string;
  points?: number; // Only maintained internally for sorting, NOT displayed
}

interface StudentLeaderboardProps {
  teams?: LeaderboardItem[];
  currentTeamId?: string;
  showScores?: boolean; // Set to true ONLY in Admin Panel
}

export const Leaderboard: React.FC<StudentLeaderboardProps> = ({
  teams: initialTeams,
  currentTeamId,
  showScores = false, // CRITICAL PRIVACY RULE: Defaults to false (scores hidden)
}) => {
  const [teams, setTeams] = useState<LeaderboardItem[]>(initialTeams || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState<boolean>(true);
  const { socket } = useSocket();

  useEffect(() => {
    if (initialTeams && initialTeams.length > 0) {
      setTeams(initialTeams);
      return;
    }

    const fetchLeaderboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/public/leaderboard', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const rawTeams = data.teams || data;
          if (Array.isArray(rawTeams)) {
            const mapped: LeaderboardItem[] = rawTeams.map((t: any, idx: number) => ({
              id: t._id || t.id || `team-${idx + 1}`,
              name: t.name || t.teamName,
              avatar: t.avatar || '🎪',
              logoUrl: t.logoUrl,
              tagline: t.tagline || t.description || '',
              rank: t.rank || idx + 1,
              trend: t.trend || 'same',
              trendValue: t.trendValue || 0,
              status: t.status || 'Safe',
              points: t.points || t.totalPoints || 0,
            }));
            setTeams(mapped);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch leaderboard:', err);
      }
    };

    fetchLeaderboardData();
  }, [initialTeams]);

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
          if (data.isLeaderboardVisible !== undefined) {
            setIsLeaderboardVisible(Boolean(data.isLeaderboardVisible));
          }
        }
      } catch (err) {
        console.error('Failed to fetch settings in Leaderboard:', err);
      }
    };

    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleSettingsUpdated = (data: any) => {
      if (data.isLeaderboardVisible !== undefined) {
        setIsLeaderboardVisible(Boolean(data.isLeaderboardVisible));
      }
    };

    socket.on('SETTINGS_UPDATED', handleSettingsUpdated);
    return () => {
      socket.off('SETTINGS_UPDATED', handleSettingsUpdated);
    };
  }, [socket]);

  // Task 4: Real-time Socket listener for SCORE_UPDATED & STATUS_CHANGED
  useEffect(() => {
    if (!socket) return;

    const handleScoreUpdated = (data: any) => {
      setTeams((prevTeams) => {
        let updated = [...prevTeams];
        if (Array.isArray(data.scores)) {
          updated = updated.map((team) => {
            const match = data.scores.find((s: any) => s.teamId === team.id || s.teamName === team.name);
            if (match) {
              return {
                ...team,
                points: match.totalPoints !== undefined ? match.totalPoints : (team.points || 0) + (match.mainTaskScore || 0),
                status: match.status || team.status,
              };
            }
            return team;
          });
        } else {
          updated = updated.map((team) => {
            if (data.teamId === team.id || data.teamName === team.name) {
              return {
                ...team,
                points: (team.points || 0) + (data.bonusPoints || 100),
              };
            }
            return team;
          });
        }

        const sorted = [...updated].sort((a, b) => (b.points || 0) - (a.points || 0));

        return sorted.map((team, idx) => {
          const newRank = idx + 1;
          const oldRank = team.rank;
          const rankDiff = oldRank - newRank;

          let trend: 'up' | 'down' | 'same' | 'new' = 'same';
          if (rankDiff > 0) trend = 'up';
          else if (rankDiff < 0) trend = 'down';

          return {
            ...team,
            rank: newRank,
            trend,
            trendValue: Math.abs(rankDiff),
          };
        });
      });
    };

    const handleStatusChanged = (data: any) => {
      if (data.teamId || data.teamName) {
        setTeams((prev) =>
          prev.map((t) => (t.id === data.teamId || t.name === data.teamName ? { ...t, status: data.status || t.status } : t))
        );
      }
    };

    socket.on('SCORE_UPDATED', handleScoreUpdated);
    socket.on('STATUS_CHANGED', handleStatusChanged);

    return () => {
      socket.off('SCORE_UPDATED', handleScoreUpdated);
      socket.off('STATUS_CHANGED', handleStatusChanged);
    };
  }, [socket]);

  const filteredTeams = teams.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!isLeaderboardVisible && !showScores) {
    return (
      <div className="p-8 sm:p-12 rounded-3xl glass-card border border-amber-400/40 dark:border-carnival-gold/30 shadow-sm dark:shadow-2xl text-center space-y-4 bg-white/90 dark:bg-black/60 my-6">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-400 text-2xl shadow-inner">
          <EyeOff className="w-8 h-8 text-amber-600 dark:text-carnival-gold" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Leaderboard hidden by Super Admin. The suspense builds...
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto font-sans leading-relaxed">
            The leaderboard is currently hidden by the Super Admin. The suspense builds... Check back soon for updated live rankings!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl space-y-6 relative overflow-hidden bg-white/90 dark:bg-gradient-to-b dark:from-[#18132B]/95 dark:via-[#130E24]/95 dark:to-[#0F0A1D]/95">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/5 dark:bg-carnival-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/10 dark:bg-carnival-gold/20 text-amber-700 dark:text-carnival-gold border border-amber-500/30 dark:border-carnival-gold/40 flex items-center gap-1.5 shadow-sm dark:shadow-neon-gold">
              <Trophy className="w-3.5 h-3.5" />
              <span>POSITION LEADERBOARD</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 dark:border-rose-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
              <EyeOff className="w-3 h-3" /> HIDE EXACT SCORES
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Live Arena Standings 🏆
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
            Privacy Protected Leaderboard • Displays relative rankings, trends, and status badges only
          </p>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search team name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white dark:bg-black/50 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-white/15 focus:border-amber-500 dark:focus:border-carnival-gold focus:outline-none transition"
          />
        </div>
      </div>

      {/* Privacy-Refactored Points Table (EXACT NUMERICAL MARKS HIDDEN) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2.5">
          <thead>
            <tr className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider px-4">
              <th className="py-2 px-4">Rank</th>
              <th className="py-2 px-4">Team Name & Logo</th>
              <th className="py-2 px-4 text-center">Movement Trend</th>
              <th className="py-2 px-4 text-right">Status Badge</th>
              {showScores && <th className="py-2 px-4 text-right">Admin Score</th>}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredTeams.map((team, idx) => {
                const isCurrentTeam = team.id === currentTeamId;

                return (
                  <motion.tr
                    key={team.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`rounded-2xl text-sm transition duration-300 ${
                      team.status === 'Eliminated'
                        ? 'bg-rose-50 dark:bg-rose-950/20 opacity-75 border border-rose-200 dark:border-rose-500/30'
                        : team.status === 'Danger'
                        ? 'bg-orange-50 dark:bg-orange-950/30 border border-orange-300 dark:border-orange-500/50 animate-pulse'
                        : isCurrentTeam
                        ? 'bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-amber-500/10 dark:from-carnival-gold/20 dark:via-black/40 dark:to-carnival-gold/20 border-2 border-amber-500 dark:border-carnival-gold shadow-sm dark:shadow-neon-gold text-slate-900 dark:text-white font-bold'
                        : 'bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 hover:border-amber-400 dark:hover:border-white/30 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {/* Position / Rank Cell */}
                    <td className="py-3.5 px-4 rounded-l-2xl whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl font-mono font-black text-sm flex items-center justify-center ${
                            team.rank === 1
                              ? 'bg-amber-500 dark:bg-carnival-gold text-white dark:text-slate-950 shadow-sm dark:shadow-neon-gold'
                              : team.rank === 2
                              ? 'bg-slate-200 dark:bg-slate-300 text-slate-800 dark:text-slate-950'
                              : team.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          #{team.rank}
                        </div>
                      </div>
                    </td>

                    {/* Team Logo & Name Cell */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {team.logoUrl ? (
                          <img
                            src={team.logoUrl}
                            alt={team.name}
                            crossOrigin="anonymous"
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-white/20 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xl shrink-0 border border-slate-200 dark:border-white/10">
                            {team.avatar || '🎪'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className={team.status === 'Eliminated' ? 'line-through text-slate-400' : ''}>
                              {team.name}
                            </span>
                            {isCurrentTeam && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-amber-500 dark:bg-carnival-gold text-white dark:text-slate-950 font-black">
                                YOU
                              </span>
                            )}
                          </div>
                          {team.tagline && <div className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1">{team.tagline}</div>}
                        </div>
                      </div>
                    </td>

                    {/* Movement Trend Cell (↑2, ↓1, NEW) */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {team.trend === 'up' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30 dark:border-emerald-500/40">
                          <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>↑{team.trendValue || 1}</span>
                        </span>
                      )}
                      {team.trend === 'down' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 dark:bg-carnival-crimson/20 text-rose-700 dark:text-carnival-crimson font-mono text-xs font-bold border border-rose-500/30 dark:border-carnival-crimson/40">
                          <ArrowDown className="w-3.5 h-3.5 text-rose-600 dark:text-carnival-crimson" />
                          <span>↓{team.trendValue || 1}</span>
                        </span>
                      )}
                      {team.trend === 'same' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-400 font-mono text-xs">
                          <Minus className="w-3.5 h-3.5" />
                          <span>=</span>
                        </span>
                      )}
                      {team.trend === 'new' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/10 dark:bg-carnival-purple/20 text-violet-700 dark:text-carnival-purple font-mono text-xs font-bold">
                          NEW
                        </span>
                      )}
                    </td>

                    {/* Status Badge Cell */}
                    <td className="py-3.5 px-4 rounded-r-2xl text-right whitespace-nowrap">
                      {team.status === 'Danger' && (
                        <span className="px-3 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/20 text-orange-700 dark:text-orange-300 border border-orange-500/30 dark:border-orange-500/40 font-mono font-bold text-xs inline-flex items-center gap-1 animate-pulse">
                          🟠 DANGER
                        </span>
                      )}
                      {team.status === 'Eliminated' && (
                        <span className="px-3 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 dark:border-rose-500/40 font-mono font-bold text-xs inline-flex items-center gap-1">
                          🔴 ELIMINATED
                        </span>
                      )}
                      {team.status === 'Qualified' && (
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 dark:border-amber-400/40 font-mono font-bold text-xs inline-flex items-center gap-1 shadow-sm dark:shadow-neon-gold">
                          🏆 QUALIFIED
                        </span>
                      )}
                      {(team.status === 'Safe' || team.status === 'Approved') && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-500/40 font-mono font-bold text-xs inline-flex items-center gap-1">
                          🟢 SAFE
                        </span>
                      )}
                    </td>

                    {/* Admin Score Cell (ONLY visible when showScores is explicitly true) */}
                    {showScores && (
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-600 dark:text-carnival-gold">
                        {team.points?.toLocaleString()} PTS
                      </td>
                    )}
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Leaderboard;
