import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Vote,
  Trophy,
  Users,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  Send,
  Eye,
  ListFilter,
  UserCheck,
} from 'lucide-react';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';

export interface TeamVoteStanding {
  rank: number;
  teamId: string;
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  residenceType: string;
  totalPublicVotes: number;
  status: string;
  avatar?: string;
  themeColor?: string;
}

export interface VoteAuditLog {
  id: string;
  date: string;
  votesCast: number;
  voterType: 'Team' | 'Admin';
  voterName: string;
  voterEmail: string;
  voterLeaderName: string;
  targetTeamId: string;
  targetTeamName: string;
  targetTeamLeader: string;
  createdAt: string;
}

export const VotingManagement: React.FC = () => {
  const { user } = useAuth();
  const [standings, setStandings] = useState<TeamVoteStanding[]>([]);
  const [auditLogs, setAuditLogs] = useState<VoteAuditLog[]>([]);
  const [totalVotesCast, setTotalVotesCast] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'standings' | 'audit'>('standings');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Admin Vote Modal State
  const [selectedTeam, setSelectedTeam] = useState<TeamVoteStanding | null>(null);
  const [voteAmount, setVoteAmount] = useState<number>(10);
  const [submittingVote, setSubmittingVote] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchVotesData();
  }, []);

  const fetchVotesData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/votes', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.ok) {
        const data = await res.json();
        setStandings(data.standings || []);
        setAuditLogs(data.voteAuditLogs || []);
        setTotalVotesCast(data.totalVotesCast || 0);
      }
    } catch (err) {
      console.error('Failed to fetch admin votes data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCastAdminVote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    setSubmittingVote(true);
    setFeedback(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/votes/cast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          targetTeamId: selectedTeam.teamId,
          voteCount: Number(voteAmount),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({ message: data.message || 'Admin votes cast successfully!', type: 'success' });
        setSelectedTeam(null);
        setVoteAmount(10);
        await fetchVotesData();
      } else {
        setFeedback({ message: data.message || 'Failed to cast votes.', type: 'error' });
      }
    } catch (err: any) {
      setFeedback({ message: err.message || 'Network error casting votes.', type: 'error' });
    } finally {
      setSubmittingVote(false);
    }
  };

  // Filtered Standings
  const filteredStandings = standings.filter(
    (t) =>
      t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.leaderName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtered Audit Logs
  const filteredAuditLogs = auditLogs.filter(
    (log) =>
      log.voterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.voterEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetTeamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetTeamLeader.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const topVotedTeam = standings.length > 0 ? standings[0] : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans pb-16">
      {/* Toast Feedback Notification */}
      <AnimatePresence>
        {feedback && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-2xl border text-xs font-mono font-bold flex items-center justify-between shadow-lg ${
              feedback.type === 'success'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/20 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400" />
              )}
              <span>{feedback.message}</span>
            </div>
            <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#18122B] border border-slate-200 dark:border-carnival-gold/30 shadow-xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-carnival-gold/20 text-amber-700 dark:text-carnival-gold text-xs font-mono font-bold border border-amber-300 dark:border-carnival-gold/30 mb-3">
              <Vote className="w-3.5 h-3.5 text-amber-500 dark:text-carnival-gold" />
              <span>FAN-FAVORITE & ADMIN VOTING ARENA</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Carnival Fan Favorite Voting Management
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-2xl">
              Track real-time public fan votes, empower admins to cast votes for teams, and provide complete audit transparency for superadmins into who voted for whom.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchVotesData}
              disabled={loading}
              className="p-3 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer"
              title="Refresh Vote Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={() => setSelectedTeam(standings[0] || null)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-rose-600 dark:from-carnival-gold dark:via-amber-400 dark:to-carnival-crimson text-slate-950 font-black text-xs uppercase tracking-wider shadow-md dark:shadow-neon-gold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Cast Admin Vote 🗳️</span>
            </button>
          </div>
        </div>

        {/* Top Summary Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
              <Vote className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">Total Votes Cast</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{totalVotesCast.toLocaleString()}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">Fan Favorite #1</div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white truncate max-w-[160px]">
                {topVotedTeam ? topVotedTeam.teamName : 'No Votes Yet'}
              </div>
              {topVotedTeam && (
                <div className="text-[10px] font-mono text-amber-500 font-bold">
                  {topVotedTeam.totalPublicVotes} Votes
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">Participating Teams</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white font-mono">{standings.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs & Search Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10">
          <button
            onClick={() => setActiveTab('standings')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'standings'
                ? 'bg-amber-500 dark:bg-carnival-gold text-slate-950 shadow-md font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Votes Standings Table ({standings.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-purple-600 dark:bg-purple-500 text-white shadow-md font-black'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Who Voted to Whom Audit Log ({auditLogs.length})</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={activeTab === 'standings' ? 'Search team or leader...' : 'Search voter or target team...'}
            className="w-full pl-9 pr-4 py-2 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-carnival-gold transition-all"
          />
        </div>
      </div>

      {/* Main Tab Content */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : activeTab === 'standings' ? (
        /* ==========================================================================
           TAB 1: TEAM VOTES STANDINGS TABLE (For All Admins)
           ========================================================================== */
        filteredStandings.length === 0 ? (
          <EmptyState
            title="No Teams Found"
            description="No teams match your search query or no fan votes have been cast yet."
            icon={Vote}
          />
        ) : (
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151226] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                    <th className="py-4 px-6">Rank</th>
                    <th className="py-4 px-6">Team & Leader</th>
                    <th className="py-4 px-6">Category</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-right">Fan Votes Received</th>
                    <th className="py-4 px-6 text-center">Admin Vote Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-xs font-sans">
                  {filteredStandings.map((t) => {
                    const isFirst = t.rank === 1;
                    const isSecond = t.rank === 2;
                    const isThird = t.rank === 3;

                    return (
                      <tr
                        key={t.teamId}
                        className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 px-6 font-mono font-black">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs ${
                              isFirst
                                ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                                : isSecond
                                ? 'bg-slate-300 text-slate-950 font-bold'
                                : isThird
                                ? 'bg-amber-700 text-white font-bold'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            #{t.rank}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <span className="text-xl p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                              {t.avatar || '🎪'}
                            </span>
                            <div>
                              <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                <span>{t.teamName}</span>
                                {isFirst && <span className="text-xs" title="Fan Favorite Winner">🏆</span>}
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                                Leader: {t.leaderName} ({t.leaderEmail})
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono font-bold">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                              t.residenceType === 'Day Scholar'
                                ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30'
                                : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500/30'
                            }`}
                          >
                            {t.residenceType}
                          </span>
                        </td>

                        <td className="py-4 px-6 font-mono font-bold">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] ${
                              t.status === 'Danger' || t.status === 'Eliminated'
                                ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30'
                                : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>

                        <td className="py-4 px-6 text-right font-mono font-black text-sm text-amber-600 dark:text-carnival-gold">
                          {t.totalPublicVotes.toLocaleString()} Votes
                        </td>

                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => setSelectedTeam(t)}
                            className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 dark:bg-carnival-gold/20 text-amber-800 dark:text-carnival-gold border border-amber-300 dark:border-carnival-gold/40 text-xs font-mono font-bold hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-carnival-gold dark:hover:text-slate-950 transition-all cursor-pointer inline-flex items-center gap-1.5"
                          >
                            <Vote className="w-3.5 h-3.5" />
                            <span>Cast Vote</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        /* ==========================================================================
           TAB 2: WHO CAST VOTES TO WHOM AUDIT LOG (SuperAdmin & Admin View)
           ========================================================================== */
        filteredAuditLogs.length === 0 ? (
          <EmptyState
            title="No Vote Audit Logs Recorded"
            description="No individual vote records have been recorded yet or match your search."
            icon={ShieldCheck}
          />
        ) : (
          <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151226] shadow-xl overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
              <div className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>SUPERADMIN VOTE AUDIT TELEMETRY — FULL VOTER TRANSPARENCY</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Showing <span className="text-amber-500 font-bold">{filteredAuditLogs.length}</span> vote events
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                    <th className="py-4 px-6">Timestamp / Date</th>
                    <th className="py-4 px-6">Voter Entity (Who Voted)</th>
                    <th className="py-4 px-6">Voter Role</th>
                    <th className="py-4 px-6">Target Team (Voted For)</th>
                    <th className="py-4 px-6 text-right">Votes Cast</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/10 text-xs font-sans">
                  {filteredAuditLogs.map((log) => {
                    const isLoggedByAdmin = log.voterType === 'Admin';

                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                          <div>{log.date}</div>
                          <div className="text-[10px] text-slate-400">
                            {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{log.voterName}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            {log.voterEmail}
                          </div>
                        </td>

                        <td className="py-4 px-6 font-mono font-bold">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] ${
                              isLoggedByAdmin
                                ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30'
                                : 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30'
                            }`}
                          >
                            {isLoggedByAdmin ? '👑 Admin Direct Vote' : '🎪 Student Team Vote'}
                          </span>
                        </td>

                        <td className="py-4 px-6">
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span className="text-amber-500">🎯</span>
                            <span>{log.targetTeamName}</span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                            Leader: {log.targetTeamLeader}
                          </div>
                        </td>

                        <td className="py-4 px-6 text-right font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                          +{log.votesCast} Votes
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* Admin Cast Vote Modal */}
      <AnimatePresence>
        {selectedTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#1A1228] border border-slate-200 dark:border-carnival-gold/40 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <Vote className="w-5 h-5 text-amber-500 dark:text-carnival-gold" />
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                    Cast Admin Votes 🗳️
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedTeam(null)}
                  className="text-slate-400 hover:text-white font-mono text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCastAdminVote} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Target Team:
                  </label>
                  <select
                    value={selectedTeam.teamId}
                    onChange={(e) => {
                      const t = standings.find((item) => item.teamId === e.target.value);
                      if (t) setSelectedTeam(t);
                    }}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white font-bold"
                  >
                    {standings.map((t) => (
                      <option key={t.teamId} value={t.teamId} className="bg-slate-900 text-white">
                        {t.teamName} (Current Votes: {t.totalPublicVotes})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono font-bold text-slate-600 dark:text-slate-300 uppercase mb-1">
                    Number of Votes to Cast:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={voteAmount}
                    onChange={(e) => setVoteAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full p-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-mono font-bold text-amber-500 dark:text-carnival-gold"
                  />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-1">
                    Admin votes directly increment the team's total public votes and are recorded in the audit trail.
                  </p>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setSelectedTeam(null)}
                    className="flex-1 py-3 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold font-mono hover:bg-slate-200 dark:hover:bg-white/10 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={submittingVote}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 dark:from-carnival-gold dark:to-carnival-amber text-slate-950 text-xs font-black uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Send className={`w-3.5 h-3.5 ${submittingVote ? 'animate-spin' : ''}`} />
                    <span>{submittingVote ? 'Casting...' : 'Cast Votes Now 🚀'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
