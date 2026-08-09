import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

export interface FanFavoriteTeam {
  rank: number;
  id: string;
  _id?: string;
  teamName: string;
  logoUrl?: string;
  themeColor?: string;
  totalPublicVotes: number;
  status: string;
  lastUpdated?: boolean;
}

export const FanFavoriteBoard: React.FC<{ limit?: number }> = ({ limit = 12 }) => {
  const { socket, isConnected } = useSocket();
  const { apiFetch } = useAuth();
  const [teams, setTeams] = useState<FanFavoriteTeam[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [livePulseTeamId, setLivePulseTeamId] = useState<string | null>(null);

  const fetchFanFavoriteLeaderboard = async () => {
    try {
      const res = await apiFetch('/public/fan-favorite');
      if (res.ok) {
        const data = await res.json();
        setTeams(data.leaderboard || []);
      } else {
        // Fallback to /public/teams
        const fallbackRes = await apiFetch('/public/teams');
        if (fallbackRes.ok) {
          const fallbackData = await fallbackRes.json();
          const rawTeams: any[] = fallbackData.teams || [];
          const sorted = rawTeams
            .map((t) => ({
              rank: 0,
              id: t.id || t._id,
              teamName: t.teamName || t.name,
              logoUrl: t.logoUrl || t.avatar,
              themeColor: t.themeColor || '#FF0055',
              totalPublicVotes: t.totalPublicVotes || 0,
              status: t.status || 'Approved',
            }))
            .sort((a, b) => b.totalPublicVotes - a.totalPublicVotes)
            .map((item, idx) => ({ ...item, rank: idx + 1 }));
          setTeams(sorted);
        }
      }
    } catch (err) {
      console.error('Error fetching fan favorite leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFanFavoriteLeaderboard();
  }, []);

  // Listen to VOTES_UPDATED WebSocket event for real-time live re-ordering
  useEffect(() => {
    if (!socket) return;

    const handleVotesUpdated = (payload: any) => {
      console.log('⚡ VOTES_UPDATED WebSocket event received:', payload);
      const targetTeamId = payload.targetTeamId;
      const votesCast = payload.votesCast || 0;
      const newTotal = payload.totalPublicVotes;

      setLivePulseTeamId(targetTeamId);
      setTimeout(() => setLivePulseTeamId(null), 2500);

      setTeams((prevTeams) => {
        const updatedList = prevTeams.map((team) => {
          if (team.id === targetTeamId || team._id === targetTeamId) {
            const updatedVotes = typeof newTotal === 'number' ? newTotal : (team.totalPublicVotes || 0) + votesCast;
            return {
              ...team,
              totalPublicVotes: updatedVotes,
              lastUpdated: true,
            };
          }
          return team;
        });

        // Re-sort strictly by totalPublicVotes descending
        updatedList.sort((a, b) => b.totalPublicVotes - a.totalPublicVotes);

        // Re-index rank
        return updatedList.map((team, index) => ({
          ...team,
          rank: index + 1,
        }));
      });
    };

    socket.on('VOTES_UPDATED', handleVotesUpdated);

    return () => {
      socket.off('VOTES_UPDATED', handleVotesUpdated);
    };
  }, [socket]);

  const displayTeams = teams.slice(0, limit);

  return (
    <div className="w-full glass-card bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-amber-500/30 rounded-2xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-lg">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 mb-6 border-b border-slate-200 dark:border-amber-500/20 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-2xl animate-pulse">👑</span>
            <h2 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-pink-600 to-purple-600 dark:from-amber-400 dark:via-pink-500 dark:to-purple-400 font-serif">
              Fan Favorite Leaderboard
            </h2>
            {isConnected && (
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-ping" />
                Live Socket Sync
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 dark:text-amber-200/70 mt-1 font-medium">
            Ranked strictly by public spectator and team votes cast in real-time 🗳️
          </p>
        </div>

        <button
          onClick={fetchFanFavoriteLeaderboard}
          className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-amber-300 border border-slate-200 dark:border-amber-500/20 transition flex items-center gap-1.5"
        >
          <span>🔄</span> Refresh
        </button>
      </div>

      {/* Leaderboard List */}
      {loading ? (
        <div className="py-12 text-center text-amber-600 dark:text-amber-300 animate-pulse font-medium">
          🎪 Syncing Fan Favorite Leaderboard...
        </div>
      ) : displayTeams.length === 0 ? (
        <div className="py-12 text-center text-slate-500 dark:text-gray-400 font-medium">
          No team vote logs recorded yet. Cast the first vote in the Voting Booth!
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {displayTeams.map((team) => {
              const teamId = team.id || team._id || '';
              const isPulsing = livePulseTeamId === teamId;
              const themeColor = team.themeColor || '#FF0055';

              // Rank icons for top 3
              let rankBadge = `#${team.rank}`;
              if (team.rank === 1) rankBadge = '👑 1st';
              else if (team.rank === 2) rankBadge = '🥈 2nd';
              else if (team.rank === 3) rankBadge = '🥉 3rd';

              return (
                <motion.div
                  key={teamId}
                  layout
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`relative p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${
                    isPulsing
                      ? 'bg-amber-100 dark:bg-amber-950/80 border-amber-500 dark:border-amber-400 shadow-lg shadow-amber-500/30 scale-[1.02]'
                      : team.rank === 1
                      ? 'bg-gradient-to-r from-amber-100/90 via-white to-purple-100/90 dark:from-amber-950/70 dark:via-slate-900 dark:to-purple-950/70 border-amber-500/60 shadow-md shadow-amber-500/10'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70 hover:border-amber-500/40 dark:hover:border-amber-500/30 shadow-sm'
                  }`}
                >
                  {/* Left: Rank & Team */}
                  <div className="flex items-center space-x-4">
                    {/* Rank Badge */}
                    <div
                      className={`w-14 text-center font-black text-sm px-2 py-1.5 rounded-lg border font-mono ${
                        team.rank === 1
                          ? 'bg-amber-500 text-slate-950 border-amber-300 shadow-md shadow-amber-500/40'
                          : team.rank === 2
                          ? 'bg-slate-200 dark:bg-slate-300 text-slate-900 border-slate-300 dark:border-white'
                          : team.rank === 3
                          ? 'bg-amber-700 text-amber-100 border-amber-500'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {rankBadge}
                    </div>

                    {/* Logo & Name */}
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border-2 shadow-inner overflow-hidden bg-white dark:bg-slate-950"
                        style={{ borderColor: themeColor }}
                      >
                        {team.logoUrl ? (
                          <img src={team.logoUrl} crossOrigin="anonymous" alt={team.teamName} className="w-full h-full object-cover" />
                        ) : (
                          <span>🎪</span>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                          {team.teamName}
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: themeColor }}
                          />
                        </h4>
                        <span className="text-xs text-slate-600 dark:text-gray-400">Status: {team.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Vote Counter */}
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-[10px] font-mono uppercase font-extrabold tracking-wider text-slate-600 dark:text-slate-400">Public Votes</div>
                      <motion.div
                        key={team.totalPublicVotes}
                        initial={{ scale: 1.25 }}
                        animate={{ scale: 1 }}
                        className="text-2xl font-black font-mono text-amber-600 dark:text-carnival-gold drop-shadow-sm"
                      >
                        {team.totalPublicVotes}
                      </motion.div>
                    </div>

                    <div className="text-2xl">
                      {team.rank === 1 ? '🔥' : team.rank <= 3 ? '⭐' : '🎟️'}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

export default FanFavoriteBoard;
