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

export interface LeaderboardTeam extends Team {
  trend: 'up' | 'down' | 'same' | 'new';
  trendValue: number;
  played: number;
  wins: number;
}

interface LiveLeaderboardTableProps {
  teams: LeaderboardTeam[];
  currentTeamId?: string;
  onSimulatePoints?: () => void;
}

export const LiveLeaderboardTable: React.FC<LiveLeaderboardTableProps> = ({
  teams: initialTeams,
  currentTeamId = 'team-1',
}) => {
  const [teams, setTeams] = useState<LeaderboardTeam[]>(initialTeams);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'top3'>('all');

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

      // Re-sort teams by points descending
      const sorted = [...updated].sort((a, b) => b.points - a.points);

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
    <div className="p-6 sm:p-8 rounded-3xl glass-card border border-carnival-gold/30 shadow-2xl space-y-6 bg-[#131128]/95 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-carnival-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Controls Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40 flex items-center gap-1.5 shadow-neon-gold">
              <Trophy className="w-3.5 h-3.5" />
              <span>IPL-STYLE POINTS TABLE</span>
            </span>
            <span className="text-xs font-mono text-slate-400">Live Framer Motion Sync</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
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
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/50 text-xs text-white border border-white/15 focus:border-carnival-gold focus:outline-none"
            />
          </div>

          {/* Filter Toggles */}
          <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 text-xs font-mono">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterMode === 'all'
                  ? 'bg-carnival-gold text-slate-950 shadow-neon-gold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All Teams
            </button>
            <button
              onClick={() => setFilterMode('top3')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterMode === 'top3'
                  ? 'bg-carnival-gold text-slate-950 shadow-neon-gold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Top 3 Podium
            </button>
          </div>

          {/* Live Simulation Button */}
          <button
            onClick={handleSimulateUpdate}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-carnival-gold to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-neon-gold"
          >
            <Shuffle className="w-3.5 h-3.5" />
            <span>Simulate Rank Shift</span>
          </button>
        </div>
      </div>

      {/* Leaderboard IPL Points Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-separate border-spacing-y-2.5">
          <thead>
            <tr className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider px-4">
              <th className="py-2 px-4">Rank & Trend</th>
              <th className="py-2 px-4">Team</th>
              <th className="py-2 px-4 text-center">Played (P)</th>
              <th className="py-2 px-4 text-center">Wins (W)</th>
              <th className="py-2 px-4 text-center">Streak</th>
              <th className="py-2 px-4 text-right">Points (PTS)</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredTeams.map((team) => {
                const isCurrentTeam = team.id === currentTeamId;

                return (
                  <motion.tr
                    key={team.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className={`rounded-2xl text-sm transition-colors ${
                      isCurrentTeam
                        ? 'bg-gradient-to-r from-[#241E11] via-[#1A1838] to-[#241E11] border-2 border-carnival-gold shadow-neon-gold text-white font-bold'
                        : 'bg-black/40 hover:bg-white/5 text-slate-200 border border-white/10'
                    }`}
                  >
                    {/* Rank & Trend Cell */}
                    <td className="py-4 px-4 rounded-l-2xl whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-xl font-mono font-black text-sm flex items-center justify-center ${
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

                        {/* Trend Indicator badge */}
                        <div className="flex items-center">
                          {team.trend === 'up' && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/40">
                              <ArrowUp className="w-3 h-3" />
                              <span>{team.trendValue || 1}</span>
                            </span>
                          )}
                          {team.trend === 'down' && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-carnival-crimson/20 text-carnival-crimson font-mono text-xs font-bold border border-carnival-crimson/40">
                              <ArrowDown className="w-3 h-3" />
                              <span>{team.trendValue || 1}</span>
                            </span>
                          )}
                          {team.trend === 'same' && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-white/10 text-slate-400 font-mono text-xs">
                              <Minus className="w-3 h-3" />
                              <span>=</span>
                            </span>
                          )}
                          {team.trend === 'new' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-carnival-cyan/20 text-carnival-cyan font-mono text-[10px] font-bold">
                              NEW
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Team Avatar & Name Cell */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl flex-shrink-0 border border-white/10">
                          {team.avatar}
                        </div>
                        <div>
                          <div className="font-extrabold text-white flex items-center gap-2">
                            <span>{team.name}</span>
                            {isCurrentTeam && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase bg-carnival-gold text-slate-950 font-black">
                                YOU
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 line-clamp-1">{team.tagline}</div>
                        </div>
                      </div>
                    </td>

                    {/* Played (P) */}
                    <td className="py-4 px-4 text-center font-mono font-semibold text-slate-300">
                      {team.played || 5}
                    </td>

                    {/* Wins (W) */}
                    <td className="py-4 px-4 text-center font-mono font-semibold text-emerald-400">
                      {team.wins || (team.rank <= 2 ? 4 : 2)}
                    </td>

                    {/* Streak (🔥) */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-carnival-crimson/20 text-carnival-crimson border border-carnival-crimson/30 font-mono font-bold text-xs">
                        <span>{team.streak}</span>
                        <Flame className="w-3.5 h-3.5 fill-carnival-crimson" />
                      </div>
                    </td>

                    {/* Points (PTS) */}
                    <td className="py-4 px-4 rounded-r-2xl text-right">
                      <div className="font-mono font-black text-lg text-carnival-gold">
                        {team.points.toLocaleString()}
                        <span className="text-xs text-carnival-gold/70 ml-1 font-sans">PTS</span>
                      </div>
                    </td>
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
