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

const MOCK_STUDENT_LEADERBOARD: LeaderboardItem[] = [
  {
    id: 'team-1',
    name: 'Cyber Circus Kings',
    avatar: '🎪',
    tagline: 'Defending Carnival Champions',
    rank: 1,
    trend: 'same',
    trendValue: 0,
    status: 'Qualified',
    points: 1850,
  },
  {
    id: 'team-2',
    name: 'Neon Ringmasters',
    avatar: '🎡',
    tagline: 'High Voltage Sprints',
    rank: 2,
    trend: 'up',
    trendValue: 2,
    status: 'Safe',
    points: 1720,
  },
  {
    id: 'team-3',
    name: 'Jesters of Java',
    avatar: '🃏',
    tagline: 'Code & Chaos',
    rank: 3,
    trend: 'down',
    trendValue: 1,
    status: 'Safe',
    points: 1640,
  },
  {
    id: 'team-4',
    name: 'High Wire Hackers',
    avatar: '🎢',
    tagline: 'Zero Net Failures',
    rank: 4,
    trend: 'up',
    trendValue: 1,
    status: 'Safe',
    points: 1580,
  },
  {
    id: 'team-5',
    name: 'Firebreather Code',
    avatar: '🔥',
    tagline: 'Flame-Proof Algorithms',
    rank: 5,
    trend: 'down',
    trendValue: 2,
    status: 'Danger',
    points: 1420,
  },
  {
    id: 'team-6',
    name: 'Ferris Wheel Functions',
    avatar: '🎠',
    tagline: 'Spinning Async Loops',
    rank: 6,
    trend: 'same',
    trendValue: 0,
    status: 'Eliminated',
    points: 1100,
  },
];

export const Leaderboard: React.FC<StudentLeaderboardProps> = ({
  teams: initialTeams = MOCK_STUDENT_LEADERBOARD,
  currentTeamId = 'team-1',
  showScores = false, // CRITICAL PRIVACY RULE: Defaults to false (scores hidden)
}) => {
  const [teams, setTeams] = useState<LeaderboardItem[]>(initialTeams);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLeaderboardVisible, setIsLeaderboardVisible] = useState<boolean>(true);
  const { socket } = useSocket();

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
      <div className="p-8 sm:p-12 rounded-3xl glass-card border border-carnival-gold/30 shadow-2xl text-center space-y-4 bg-black/60 my-6">
        <div className="w-16 h-16 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400 text-2xl shadow-inner">
          <EyeOff className="w-8 h-8 text-carnival-gold" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl sm:text-2xl font-black text-white">
            Leaderboard Hidden
          </h3>
          <p className="text-sm text-slate-300 max-w-md mx-auto font-sans leading-relaxed">
            The leaderboard is currently hidden by the event organizers. Check back soon for updated live rankings!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-card border border-white/10 shadow-2xl space-y-6 relative overflow-hidden bg-gradient-to-b from-[#18132B]/95 via-[#130E24]/95 to-[#0F0A1D]/95">
      {/* Background Decorative Glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-carnival-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 flex items-center gap-1.5 shadow-neon-gold">
              <Trophy className="w-3.5 h-3.5" />
              <span>POSITION LEADERBOARD</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-mono font-bold flex items-center gap-1">
              <EyeOff className="w-3 h-3" /> HIDE EXACT SCORES
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Live Arena Standings 🏆
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
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
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 text-xs text-white border border-white/15 focus:border-carnival-gold focus:outline-none transition"
          />
        </div>
      </div>

      {/* Privacy-Refactored Points Table (EXACT NUMERICAL MARKS HIDDEN) */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2.5">
          <thead>
            <tr className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-4">
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
                        ? 'bg-rose-950/20 opacity-75 border border-rose-500/30'
                        : team.status === 'Danger'
                        ? 'bg-orange-950/30 border border-orange-500/50 animate-pulse'
                        : isCurrentTeam
                        ? 'bg-gradient-to-r from-carnival-gold/20 via-black/40 to-carnival-gold/20 border-2 border-carnival-gold shadow-neon-gold text-white font-bold'
                        : 'bg-black/40 border border-white/10 hover:border-white/30 text-slate-200'
                    }`}
                  >
                    {/* Position / Rank Cell */}
                    <td className="py-3.5 px-4 rounded-l-2xl whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-9 h-9 rounded-xl font-mono font-black text-sm flex items-center justify-center ${
                            team.rank === 1
                              ? 'bg-carnival-gold text-slate-950 shadow-neon-gold'
                              : team.rank === 2
                              ? 'bg-slate-300 text-slate-950'
                              : team.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-white/10 text-slate-300'
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
                            className="w-10 h-10 rounded-xl object-cover border border-white/20 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/10">
                            {team.avatar || '🎪'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white flex items-center gap-2">
                            <span className={team.status === 'Eliminated' ? 'line-through text-slate-400' : ''}>
                              {team.name}
                            </span>
                            {isCurrentTeam && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-carnival-gold text-slate-950 font-black">
                                YOU
                              </span>
                            )}
                          </div>
                          {team.tagline && <div className="text-xs text-slate-400 line-clamp-1">{team.tagline}</div>}
                        </div>
                      </div>
                    </td>

                    {/* Movement Trend Cell (↑2, ↓1, NEW) */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {team.trend === 'up' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/40">
                          <ArrowUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span>↑{team.trendValue || 1}</span>
                        </span>
                      )}
                      {team.trend === 'down' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-carnival-crimson/20 text-carnival-crimson font-mono text-xs font-bold border border-carnival-crimson/40">
                          <ArrowDown className="w-3.5 h-3.5 text-carnival-crimson" />
                          <span>↓{team.trendValue || 1}</span>
                        </span>
                      )}
                      {team.trend === 'same' && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-slate-400 font-mono text-xs">
                          <Minus className="w-3.5 h-3.5" />
                          <span>=</span>
                        </span>
                      )}
                      {team.trend === 'new' && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-carnival-purple/20 text-carnival-purple font-mono text-xs font-bold">
                          NEW
                        </span>
                      )}
                    </td>

                    {/* Status Badge Cell */}
                    <td className="py-3.5 px-4 rounded-r-2xl text-right whitespace-nowrap">
                      {team.status === 'Danger' && (
                        <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 font-mono font-bold text-xs inline-flex items-center gap-1 animate-pulse">
                          🟠 DANGER
                        </span>
                      )}
                      {team.status === 'Eliminated' && (
                        <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 font-mono font-bold text-xs inline-flex items-center gap-1">
                          🔴 ELIMINATED
                        </span>
                      )}
                      {team.status === 'Qualified' && (
                        <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-mono font-bold text-xs inline-flex items-center gap-1 shadow-neon-gold">
                          🏆 QUALIFIED
                        </span>
                      )}
                      {(team.status === 'Safe' || team.status === 'Approved') && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs inline-flex items-center gap-1">
                          🟢 SAFE
                        </span>
                      )}
                    </td>

                    {/* Admin Score Cell (ONLY visible when showScores is explicitly true) */}
                    {showScores && (
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-carnival-gold">
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
