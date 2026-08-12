import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy,
  Flame,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Search,
  Zap,
  Shield,
  Shuffle,
  Award,
} from 'lucide-react';
import { Team } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { sortLeaderboardTeams } from '../student/Leaderboard';

export interface LeaderboardTeam extends Team {
  trend: 'up' | 'down' | 'same' | 'new';
  trendValue: number;
  played: number;
  wins: number;
}

interface LiveLeaderboardTableProps {
  teams: LeaderboardTeam[];
  currentTeamId?: string;
  showScores?: boolean; // Set to true ONLY in Admin Panel
  onSimulatePoints?: () => void;
}

export const LiveLeaderboardTable: React.FC<LiveLeaderboardTableProps> = ({
  teams: initialTeams,
  currentTeamId = 'team-1',
  showScores = false, // Default to false to obey Task 4 privacy rules
}) => {
  const [teams, setTeams] = useState<LeaderboardTeam[]>(() =>
    initialTeams ? sortLeaderboardTeams(initialTeams).map((t, idx) => ({ ...t, rank: idx + 1 })) : []
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'top3'>('all');
  const { socket } = useSocket();

  React.useEffect(() => {
    if (initialTeams && initialTeams.length > 0) {
      setTeams(sortLeaderboardTeams(initialTeams).map((t, idx) => ({ ...t, rank: idx + 1 })));
    }
  }, [initialTeams]);

  // Task 4: Real-time Socket.io listener for SCORE_UPDATED & STATUS_CHANGED events
  React.useEffect(() => {
    if (!socket) return;

    const handleScoreUpdated = (data: any) => {
      console.log('⚡ [Socket.io] SCORE_UPDATED Event received:', data);
      setTeams((prevTeams) => {
        let updated = [...prevTeams];
        if (Array.isArray(data.scores)) {
          updated = updated.map((team) => {
            const match = data.scores.find((s: any) => s.teamId === team.id || s.teamName === team.name);
            if (match) {
              return {
                ...team,
                points: match.totalPoints !== undefined ? match.totalPoints : team.points + (match.mainTaskScore || 0),
                status: match.status || team.status,
              };
            }
            return team;
          });
        } else {
          updated = updated.map((team) => {
            if (data.teamId === team.id || data.teamName === team.name) {
              const newTotal = data.newTotalScore ?? data.totalPoints ?? data.points;
              return {
                ...team,
                points: newTotal !== undefined ? newTotal : team.points + (data.pointsEarned ?? data.bonusPoints ?? 0),
              };
            }
            return team;
          });
        }

        const sorted = sortLeaderboardTeams(updated);

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
      console.log('⚡ [Socket.io] STATUS_CHANGED Event received:', data);
      if (data.teamId || data.teamName) {
        setTeams((prev) => {
          const updated = prev.map((t) =>
            t.id === data.teamId || t.name === data.teamName ? { ...t, status: data.status || t.status } : t
          );
          const sorted = sortLeaderboardTeams(updated);
          return sorted.map((t, idx) => ({ ...t, rank: idx + 1 }));
        });
      }
    };

    socket.on('SCORE_UPDATED', handleScoreUpdated);
    socket.on('STATUS_CHANGED', handleStatusChanged);

    return () => {
      socket.off('SCORE_UPDATED', handleScoreUpdated);
      socket.off('STATUS_CHANGED', handleStatusChanged);
    };
  }, [socket]);

  // Interactive Live Simulation: randomize points to showcase Framer Motion row re-ordering
  const handleSimulateUpdate = () => {
    setTeams((prevTeams) => {
      const updated = prevTeams.map((team) => {
        // Randomly add 50-300 points to 2 random teams
        const bonus = Math.random() > 0.4 ? Math.floor(Math.random() * 250) + 50 : 0;
        return {
          ...team,
          points: team.points + bonus,
        };
      });

      // Re-sort teams by status priority & points
      const sorted = sortLeaderboardTeams(updated);

      // Recalculate rank & trends
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

  const filteredTeams = teams.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterMode === 'top3') {
      return matchesSearch && t.rank <= 3;
    }
    return matchesSearch;
  });

  return (
    <div className="p-6 sm:p-8 rounded-3xl glass-card border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_20px_50px_rgba(0,0,0,0.6)] space-y-6 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-cwc-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-display font-bold bg-amber-500/10 dark:bg-cwc-gold/20 text-amber-600 dark:text-cwc-gold border border-amber-400/30 dark:border-cwc-gold/40 flex items-center gap-1.5 shadow-sm">
              <Trophy className="w-3.5 h-3.5" />
              <span>IPL-STYLE POINTS TABLE</span>
            </span>
            <span className="text-xs font-display text-slate-500 dark:text-gray-400">Live Sync</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white">
            Carnival Leaderboard Standings
          </h2>
        </div>

        {/* Action Buttons & Search */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search team name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white dark:bg-cwc-bg/80 text-xs text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 focus:border-cwc-red focus:outline-none transition-colors"
            />
          </div>

          {/* Filter Toggles */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-cwc-bg/60 border border-slate-200 dark:border-white/10 text-xs font-display">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all duration-300 ${
                filterMode === 'all'
                  ? 'bg-cwc-gold text-cwc-bg shadow-glow-gold'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Teams
            </button>
            <button
              onClick={() => setFilterMode('top3')}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-all duration-300 ${
                filterMode === 'top3'
                  ? 'bg-cwc-gold text-cwc-bg shadow-glow-gold'
                  : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Top 3 Podium
            </button>
          </div>

          {/* Live Simulation Button */}
          <button
            onClick={handleSimulateUpdate}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cwc-gold to-amber-500 text-cwc-bg font-bold font-display text-xs tracking-wide flex items-center gap-2 border border-white/20 shadow-sm hover:-translate-y-0.5 hover:shadow-glow-gold transition-all duration-300 ease-out"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Simulate Rank Shift</span>
          </button>
        </div>
      </div>

      {/* Leaderboard IPL Points Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-3">
          <thead>
            <tr className="text-[11px] font-display font-bold text-slate-600 dark:text-gray-400 uppercase tracking-wider px-4">
              <th className="py-2 px-4">Rank & Trend</th>
              <th className="py-2 px-4">Team</th>
              <th className="py-2 px-4 text-center">Status</th>
              <th className="py-2 px-4 text-center">Played</th>
              <th className="py-2 px-4 text-center">Won</th>
              <th className="py-2 px-4 text-center">Streak</th>
              {showScores && <th className="py-2 px-4 text-right">Points (PTS)</th>}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredTeams.map((team, idx) => {
                const isCurrentTeam = team.id === currentTeamId;
                const teamStatus = team.status || (idx === 4 ? 'Danger' : idx === 5 ? 'Eliminated' : idx === 0 ? 'Qualified' : 'Safe');

                return (
                  <motion.tr
                    key={team.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`rounded-2xl text-sm transition-all duration-300 ease-out ${
                      teamStatus === 'Eliminated'
                        ? 'bg-rose-100/80 dark:bg-rose-950/20 opacity-75 border border-rose-300 dark:border-rose-500/30'
                        : teamStatus === 'Danger'
                        ? 'bg-orange-100/80 dark:bg-orange-950/30 border border-orange-400 dark:border-orange-500/50 animate-pulse'
                        : isCurrentTeam
                        ? 'bg-amber-500/10 dark:bg-gradient-to-r dark:from-cwc-gold/20 dark:via-cwc-surface dark:to-cwc-gold/20 border-2 border-cwc-gold shadow-md dark:shadow-glow-gold text-slate-900 dark:text-white font-bold'
                        : 'bg-white dark:bg-white/5 backdrop-blur-lg border border-slate-200/80 dark:border-white/10 hover:border-cwc-red/40 hover:shadow-md text-slate-800 dark:text-gray-200'
                    }`}
                  >
                    {/* Rank & Trend Cell */}
                    <td className="py-4 px-4 rounded-l-2xl whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl font-display font-black text-sm flex items-center justify-center ${
                            team.rank === 1
                              ? 'bg-cwc-gold text-cwc-bg shadow-glow-gold'
                              : team.rank === 2
                              ? 'bg-slate-200 dark:bg-gray-300 text-slate-900'
                              : team.rank === 3
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-none'
                          }`}
                        >
                          #{team.rank}
                        </div>

                        {/* Trend Indicator badge */}
                        <div className="flex items-center">
                          {team.trend === 'up' && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-display text-xs font-bold border border-emerald-500/30">
                              <ArrowUp className="w-3 h-3" />
                              <span>{team.trendValue || 1}</span>
                            </span>
                          )}
                          {team.trend === 'down' && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-cwc-red/10 dark:bg-cwc-red/20 text-cwc-red font-display text-xs font-bold border border-cwc-red/30">
                              <ArrowDown className="w-3 h-3" />
                              <span>{team.trendValue || 1}</span>
                            </span>
                          )}
                          {team.trend === 'same' && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-gray-400 font-display text-xs">
                              <Minus className="w-3 h-3" />
                              <span>=</span>
                            </span>
                          )}
                          {team.trend === 'new' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-cwc-purple/10 dark:bg-cwc-purple/20 text-cwc-purple font-display text-[10px] font-bold">
                              NEW
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Team Avatar & Name Cell */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/10 flex items-center justify-center text-xl flex-shrink-0 border border-slate-200 dark:border-white/10">
                          {team.avatar}
                        </div>
                        <div>
                          <div className="font-bold font-display text-slate-900 dark:text-white flex items-center gap-2">
                            <span className={teamStatus === 'Eliminated' ? 'line-through text-slate-400 dark:text-gray-400' : ''}>
                              {team.name}
                            </span>
                            {isCurrentTeam && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-display uppercase bg-cwc-gold text-cwc-bg font-black">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 dark:text-gray-400 line-clamp-1">{team.tagline}</div>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge Cell */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      {teamStatus === 'Danger' && (
                        <span className="px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-600 dark:text-orange-300 border border-orange-500/40 font-display font-bold text-[10px] inline-flex items-center gap-1 animate-pulse">
                          🟠 DANGER
                        </span>
                      )}
                      {teamStatus === 'Eliminated' && (
                        <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/40 font-display font-bold text-[10px] inline-flex items-center gap-1">
                          🔴 ELIMINATED
                        </span>
                      )}
                      {teamStatus === 'Qualified' && (
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-300 border border-blue-500/40 font-display font-bold text-[10px] inline-flex items-center gap-1">
                          🔵 QUALIFIED
                        </span>
                      )}
                      {(teamStatus === 'Safe' || teamStatus === 'Approved') && (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40 font-display font-bold text-[10px] inline-flex items-center gap-1">
                          🟢 SAFE
                        </span>
                      )}
                    </td>

                    {/* Played (P) */}
                    <td className="py-4 px-4 text-center font-display font-semibold text-slate-700 dark:text-gray-300">
                      {team.played || 5}
                    </td>

                    {/* Wins (W) */}
                    <td className="py-4 px-4 text-center font-display font-semibold text-emerald-600 dark:text-emerald-400">
                      {team.wins || (team.rank <= 2 ? 4 : 2)}
                    </td>

                    {/* Streak (🔥) */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-yellow-400/80 text-cwc-red border border-cwc-red/30 font-display font-bold text-xs">
                        <span>{team.streak}</span>
                        <Flame className="w-3.5 h-3.5 fill-cwc-red" />
                      </div>
                    </td>

                    {/* Points (PTS) - Hidden when showScores is false */}
                    {showScores && (
                      <td className="py-4 px-4 rounded-r-2xl text-right">
                        <div className="font-display font-black text-lg text-amber-600 dark:text-cwc-gold">
                          {team.points.toLocaleString()}
                          <span className="text-xs text-amber-600/70 dark:text-cwc-gold/70 ml-1 font-sans">PTS</span>
                        </div>
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
