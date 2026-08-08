import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

export interface VotingBoothProps {
  isOpen?: boolean;
  onClose?: () => void;
  userTeamId?: string;
  onVotesUpdated?: () => void;
}

export interface TeamVoteInfo {
  id: string;
  _id?: string;
  teamName: string;
  name?: string;
  logoUrl?: string;
  avatar?: string;
  themeColor?: string;
  totalPublicVotes: number;
  status: string;
}

export const VotingBooth: React.FC<VotingBoothProps> = ({
  isOpen = true,
  onClose,
  userTeamId,
  onVotesUpdated,
}) => {
  const { apiFetch, user } = useAuth();
  const [internalOpen, setInternalOpen] = useState<boolean>(isOpen);
  const [teams, setTeams] = useState<TeamVoteInfo[]>([]);
  const [voterTeamId, setVoterTeamId] = useState<string | null>(userTeamId || null);
  const [dailyVotesRemaining, setDailyVotesRemaining] = useState<number>(100);
  const [votesPerTargetTeam, setVotesPerTargetTeam] = useState<Record<string, number>>({});
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setInternalOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setInternalOpen(false);
    if (onClose) {
      onClose();
    }
  };

  // Fetch Teams & Student Voting Status
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch voting status for logged-in student
      const statusRes = await apiFetch('/student/voting-status');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setDailyVotesRemaining(statusData.dailyVotesRemaining ?? 100);
        setVotesPerTargetTeam(statusData.votesPerTargetTeam || {});
        if (statusData.voterTeamId) {
          setVoterTeamId(statusData.voterTeamId);
        }
      }

      // 2. Fetch public teams list
      const teamsRes = await apiFetch('/public/teams');
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        const rawTeams: TeamVoteInfo[] = teamsData.teams || [];
        setTeams(rawTeams);
      }
    } catch (err) {
      console.error('Error loading voting booth data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const effectiveVoterTeamId = voterTeamId || userTeamId || user?.teamId;

  // Filter out the user's own team
  const opposingTeams = teams.filter((t) => {
    const tid = t.id || t._id;
    return tid !== effectiveVoterTeamId;
  });

  // Calculate sum of currently allocated votes across teams in modal
  const totalPendingAllocated = Object.values(allocations).reduce((sum, val) => sum + (val || 0), 0);
  const totalDailyUsedSoFar = 100 - dailyVotesRemaining;
  const remainingBudgetForAllocations = dailyVotesRemaining - totalPendingAllocated;

  const handleAllocationChange = (teamId: string, value: number) => {
    const votesAlreadyCastToday = votesPerTargetTeam[teamId] || 0;
    const maxAllowedForTeam = Math.max(0, 15 - votesAlreadyCastToday);
    
    // Clamp value between 0 and maxAllowedForTeam
    let newAlloc = Math.max(0, Math.min(value, maxAllowedForTeam));

    // Ensure total allocations don't exceed remaining daily budget
    const otherAllocationsSum = Object.entries(allocations).reduce((sum, [tid, count]) => {
      return tid === teamId ? sum : sum + count;
    }, 0);

    const maxBudgetAvailable = dailyVotesRemaining - otherAllocationsSum;
    newAlloc = Math.min(newAlloc, maxBudgetAvailable);

    setAllocations((prev) => ({
      ...prev,
      [teamId]: newAlloc,
    }));
  };

  const handleCastVotes = async () => {
    const teamsToVote = Object.entries(allocations).filter(([_, count]) => count > 0);
    if (teamsToVote.length === 0) {
      setToastMessage({ type: 'error', text: 'Please allocate votes to at least one team before casting!' });
      return;
    }

    setSubmitting(true);
    setToastMessage(null);

    let successCount = 0;
    let errorMessage = '';

    for (const [targetTeamId, count] of teamsToVote) {
      try {
        const response = await apiFetch('/student/vote', {
          method: 'POST',
          body: JSON.stringify({ targetTeamId, voteCount: count }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          successCount++;
        } else {
          errorMessage = data.message || 'Failed to cast votes';
        }
      } catch (err: any) {
        errorMessage = err.message || 'Network error while casting votes';
      }
    }

    if (successCount > 0) {
      setToastMessage({
        type: 'success',
        text: `🎉 Successfully cast votes for ${successCount} team(s)! Fan Favorite board updated live.`,
      });
      setAllocations({});
      await fetchData();
      if (onVotesUpdated) onVotesUpdated();
    } else if (errorMessage) {
      setToastMessage({ type: 'error', text: errorMessage });
    }

    setSubmitting(false);
  };

  if (!isOpen || !internalOpen) return null;

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden text-slate-900 dark:text-white my-8 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-amber-100 via-amber-50 to-purple-100 dark:from-amber-950 dark:via-slate-900 dark:to-purple-950 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-3xl animate-bounce">🎟️</span>
            <div>
              <h2 className="text-xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-pink-600 to-purple-600 dark:from-amber-400 dark:via-pink-400 dark:to-cyan-400 font-serif">
                Fan Favorite Voting Booth
              </h2>
              <p className="text-xs text-amber-900/80 dark:text-amber-200/70 font-medium">
                Support your favorite carnival teams! 100 Daily Votes • Max 15 per team/day
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800/80 hover:bg-amber-500/20 text-slate-700 dark:text-gray-300 hover:text-amber-600 dark:hover:text-amber-400 transition flex items-center justify-center font-bold text-base border border-slate-300 dark:border-white/10"
            title="Close Voting Booth"
            aria-label="Close Voting Booth"
          >
            ✕
          </button>
        </div>

        {/* Progress Bar & Status Section */}
        <div className="p-6 bg-slate-50 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
          <div className="flex justify-between items-center text-sm font-semibold mb-2">
            <span className="text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <span>⚡ Daily Votes Remaining:</span>
              <span className="text-lg font-black text-slate-900 dark:text-white px-2 py-0.5 bg-amber-500/20 rounded border border-amber-500/30">
                {dailyVotesRemaining - totalPendingAllocated} / 100
              </span>
            </span>
            <span className="text-xs text-slate-500 dark:text-gray-400">
              Allocated Pending: <strong className="text-amber-600 dark:text-amber-400">{totalPendingAllocated}</strong>
            </span>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-4 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-amber-500/20">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min(100, Math.max(0, ((totalDailyUsedSoFar + totalPendingAllocated) / 100) * 100))}%`,
              }}
              transition={{ duration: 0.4 }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-pink-500 to-cyan-400 shadow-lg shadow-pink-500/50"
            />
          </div>
        </div>

        {/* Notification Toast */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mx-6 mt-4 p-3 rounded-xl border text-sm flex items-center justify-between ${
                toastMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500/50 text-emerald-900 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/80 border-rose-500/50 text-rose-900 dark:text-rose-200'
              }`}
            >
              <span>{toastMessage.text}</span>
              <button onClick={() => setToastMessage(null)} className="text-xs opacity-70 hover:opacity-100">
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Teams List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {loading ? (
            <div className="text-center py-12 text-amber-600 dark:text-amber-300 animate-pulse font-bold">
              🎪 Loading Carnival Teams & Voting Records...
            </div>
          ) : opposingTeams.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-gray-400">
              No rival teams found for voting.
            </div>
          ) : (
            opposingTeams.map((team) => {
              const teamId = team.id || team._id || '';
              const votesCastToday = votesPerTargetTeam[teamId] || 0;
              const maxAllowedForTeam = Math.max(0, 15 - votesCastToday);
              const remainingForTeam = Math.max(0, maxAllowedForTeam - (allocations[teamId] || 0));
              const allocatedNow = allocations[teamId] || 0;
              const themeColor = team.themeColor || '#FF0055';

              return (
                <motion.div
                  key={teamId}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-amber-500/40 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4 transition shadow-md"
                >
                  {/* Team Identity */}
                  <div className="flex items-center space-x-4 min-w-[220px]">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl border-2 shadow-inner overflow-hidden bg-white dark:bg-slate-900"
                      style={{ borderColor: themeColor }}
                    >
                      {team.logoUrl ? (
                        <img src={team.logoUrl} alt={team.teamName} className="w-full h-full object-cover" />
                      ) : (
                        <span>🎪</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        {team.teamName}
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block"
                          style={{ backgroundColor: themeColor }}
                        />
                      </h3>
                      <p className="text-xs text-amber-800 dark:text-amber-300/80 font-medium">
                        Total Public Votes: <strong className="text-amber-600 dark:text-amber-400 font-mono text-sm">{team.totalPublicVotes}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Allocation Controls & Slider */}
                  <div className="flex-1 w-full md:w-auto flex flex-col gap-1">
                    <div className="flex justify-between items-center text-xs text-slate-600 dark:text-gray-300 font-medium">
                      <span>
                        Votes cast today: <strong className="text-amber-600 dark:text-amber-400">{votesCastToday}</strong> / 15
                      </span>
                      <span className="text-cyan-700 dark:text-cyan-300 font-semibold">
                        Votes remaining for this team: {remainingForTeam} / 15
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Decrement Button */}
                      <button
                        onClick={() => handleAllocationChange(teamId, allocatedNow - 1)}
                        disabled={allocatedNow <= 0 || submitting}
                        className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:bg-slate-400 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg text-slate-900 dark:text-amber-300 transition"
                      >
                        -
                      </button>

                      {/* Slider Control */}
                      <input
                        type="range"
                        min={0}
                        max={maxAllowedForTeam}
                        value={allocatedNow}
                        disabled={maxAllowedForTeam <= 0 || submitting}
                        onChange={(e) => handleAllocationChange(teamId, Number(e.target.value))}
                        className="flex-1 accent-amber-500 h-2 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer disabled:opacity-30"
                      />

                      {/* Increment Button */}
                      <button
                        onClick={() => handleAllocationChange(teamId, allocatedNow + 1)}
                        disabled={allocatedNow >= maxAllowedForTeam || remainingBudgetForAllocations <= 0 || submitting}
                        className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 active:bg-slate-400 disabled:opacity-30 disabled:cursor-not-allowed font-bold text-lg text-slate-900 dark:text-amber-300 transition"
                      >
                        +
                      </button>

                      {/* Allocation Counter Badge */}
                      <span className="w-10 text-center font-mono font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/80 border border-amber-500/40 rounded-lg py-1 text-sm">
                        {allocatedNow}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Modal Footer / Action Button */}
        <div className="p-5 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-600 dark:text-gray-400 font-medium">
            Pending Votes to Cast: <strong className="text-amber-600 dark:text-amber-400 font-mono text-sm">{totalPendingAllocated}</strong>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-slate-800 font-medium transition text-sm"
            >
              Close
            </button>
            <button
              onClick={handleCastVotes}
              disabled={totalPendingAllocated === 0 || submitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-600 to-purple-600 hover:from-amber-400 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-amber-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin">🎪</span> Casting Votes...
                </>
              ) : (
                <>
                  <span>🗳️</span> Cast Votes ({totalPendingAllocated})
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VotingBooth;
