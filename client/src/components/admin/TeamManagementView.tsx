import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Edit3, Search, Filter, Save, Trash2, X, Ticket, List, Gift, Calendar } from 'lucide-react';
import { TicketTeamCard } from '../common/TicketTeamCard';
import { GrantAdvantageModal } from './GrantAdvantageModal';
import { DailyAttendanceView } from './DailyAttendanceView';
import { EliminationControls } from './EliminationControls';
import { TableSkeleton, CardSkeleton } from '../ui/Skeletons';
import { EmptyState } from '../ui/EmptyState';

export interface ExtendedTeam {
  id: string;
  name: string;
  tagline: string;
  rank: number;
  points: number;
  status: 'Approved' | 'Pending' | 'Safe' | 'Danger' | 'Eliminated' | 'Qualified';
  avatar: string;
  themeColor: string;
  streak: number;
  leaderName: string;
  leaderEmail: string;
  membersCount: number;
}

export const TeamManagementView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'tickets' | 'table' | 'attendance'>('tickets');
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [teams, setTeams] = useState<ExtendedTeam[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/teams', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const rawTeams = data.teams || data;
          if (Array.isArray(rawTeams)) {
            const mapped: ExtendedTeam[] = rawTeams.map((t: any, idx: number) => ({
              id: t._id || t.id || `team-${idx + 1}`,
              name: t.name || t.teamName,
              tagline: t.tagline || t.description || 'Carnival contender',
              rank: t.rank || idx + 1,
              points: t.points ?? 0,
              status: t.status || 'Approved',
              avatar: t.avatar || '🎪',
              themeColor: t.themeColor || '#FFD700',
              streak: t.streak || 0,
              leaderName: t.leaderName || (t.members && t.members[0]?.name) || 'Team Leader',
              leaderEmail: t.leaderEmail || (t.members && t.members[0]?.email) || 'leader@cwc.io',
              membersCount: t.membersCount || (t.members ? t.members.length : 1),
            }));
            setTeams(mapped);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch admin teams:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [editingTeam, setEditingTeam] = useState<ExtendedTeam | null>(null);

  // Filtered teams
  const filteredTeams = teams.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.leaderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.leaderEmail.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && t.status === statusFilter;
  });

  const handleUpdateStatus = async (id: string, newStatus: ExtendedTeam['status']) => {
    setTeams(teams.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));

    try {
      await fetch(`/api/admin/teams/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.warn('Backend sync attempted; team state updated locally:', err);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/admin/teams/${editingTeam.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          teamName: editingTeam.name,
          tagline: editingTeam.tagline,
          status: editingTeam.status,
          themeColor: editingTeam.themeColor,
          leader: {
            name: editingTeam.leaderName,
            email: editingTeam.leaderEmail,
          },
        }),
      });
    } catch (err) {
      console.warn('Backend sync error:', err);
    }

    handleUpdateStatus(editingTeam.id, editingTeam.status);
    setTeams(teams.map((t) => (t.id === editingTeam.id ? editingTeam : t)));
    setEditingTeam(null);
  };

  const handleDeleteTeam = (id: string) => {
    if (confirm('Are you sure you want to reject and remove this team from the carnival?')) {
      setTeams(teams.filter((t) => t.id !== id));
    }
  };

  const getStatusBadge = (status: ExtendedTeam['status']) => {
    switch (status) {
      case 'Approved':
      case 'Safe':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Danger':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30 animate-pulse';
      case 'Eliminated':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Qualified':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Pending':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-carnival-cyan/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-carnival-cyan/20 text-carnival-cyan text-xs font-mono font-bold border border-carnival-cyan/30 mb-2">
            <Users className="w-4 h-4" />
            <span>ROSTER CONTROLLER</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Team Management View</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Approve registrations, view physical 3D admission ticket cards, edit team profiles, or flag status.
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsGrantModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-carnival-gold via-amber-400 to-carnival-crimson text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-gold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Gift className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>Grant Advantage 🎁</span>
          </button>

          {/* View Mode Toggle Switch */}
          <div className="flex items-center gap-2 p-1 rounded-xl glass-card border-white/10">
            <button
              onClick={() => setViewMode('tickets')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                viewMode === 'tickets'
                  ? 'bg-carnival-gold text-slate-950 shadow-neon-gold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>3D Tickets</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-carnival-cyan text-slate-950 shadow-neon-cyan'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>

            <button
              onClick={() => setViewMode('attendance')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1.5 transition-all ${
                viewMode === 'attendance'
                  ? 'bg-gradient-to-r from-carnival-gold to-amber-400 text-slate-950 shadow-neon-gold font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Daily Attendance</span>
            </button>
          </div>
        </div>
      </div>

      {/* Render Daily Attendance Interface */}
      {viewMode === 'attendance' ? (
        <DailyAttendanceView />
      ) : (
        <>
          {/* Filter and Search Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search team or leader..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-cyan transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {['All', 'Safe', 'Danger', 'Eliminated', 'Qualified', 'Approved', 'Pending'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                    statusFilter === filter
                      ? 'bg-carnival-cyan text-slate-950 shadow-neon-cyan'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* 3D Physical Admission Ticket Cards Grid */}
          {isLoading ? (
            viewMode === 'tickets' ? (
              <CardSkeleton count={6} />
            ) : (
              <TableSkeleton rows={5} cols={6} className="min-h-[400px]" />
            )
          ) : filteredTeams.length === 0 ? (
            <EmptyState
              title="No Teams Found"
              description="No teams have registered or matched your search filter."
              icon={Users}
            />
          ) : (
            <>
              {viewMode === 'tickets' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredTeams.map((team) => (
                    <TicketTeamCard
                      key={team.id}
                      team={{
                        _id: team.id,
                        teamName: team.name,
                        leaderName: team.leaderName,
                        leaderEmail: team.leaderEmail,
                        members: [team.leaderName, 'Priya Patel', 'Rohan Gupta'].slice(0, team.membersCount),
                        track: 'Full-Stack Web',
                        totalPoints: team.points,
                        status: team.status,
                        immunity: team.rank <= 2,
                        advantages: team.rank === 1 ? [{ advantage: 'Double Points' }] : [],
                        repoUrl: 'https://github.com/cwc/arena',
                      }}
                      rank={team.rank}
                      onStatusChange={(id, status) => handleUpdateStatus(id, status as ExtendedTeam['status'])}
                    />
                  ))}
                </div>
              ) : null}

              {/* Data Table */}
              {viewMode === 'table' ? (
                <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-slate-300 uppercase tracking-wider">
                    <th className="p-4">Rank & Team</th>
                    <th className="p-4">Leader Details</th>
                    <th className="p-4">Points</th>
                    <th className="p-4">Status Tag</th>
                    <th className="p-4 text-center">Status Action</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTeams.map((team) => (
                    <tr key={team.id} className="hover:bg-white/5 transition-colors">
                      {/* Rank & Team */}
                      <td className="p-4 font-bold text-white">
                        <div className="flex items-center gap-3">
                          <span className="text-carnival-gold text-sm font-extrabold">#{team.rank}</span>
                          <span className="text-xl p-1.5 rounded-xl bg-white/5 border border-white/10">{team.avatar}</span>
                          <div>
                            <div className="font-extrabold text-white text-sm flex items-center gap-2">
                              {team.name}
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: team.themeColor }}
                                title={`Theme: ${team.themeColor}`}
                              />
                            </div>
                            <div className="text-[11px] text-slate-400 font-sans font-normal truncate max-w-xs">{team.tagline}</div>
                          </div>
                        </div>
                      </td>

                      {/* Leader */}
                      <td className="p-4">
                        <div className="font-bold text-slate-200">{team.leaderName}</div>
                        <div className="text-[10px] text-slate-400">{team.leaderEmail}</div>
                      </td>

                      {/* Points */}
                      <td className="p-4 font-extrabold text-carnival-cyan text-sm">{team.points} PTS</td>

                      {/* Status Tag */}
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg border font-sans font-bold text-[11px] inline-block ${getStatusBadge(team.status)}`}>
                          {team.status}
                        </span>
                      </td>

                      {/* Quick Status Controls */}
                      <td className="p-4 text-center">
                        <EliminationControls
                          teamId={team.id}
                          teamName={team.name}
                          currentStatus={team.status}
                          onStatusChange={(id, status) => handleUpdateStatus(id, status as ExtendedTeam['status'])}
                          compact
                        />
                      </td>

                      {/* Action Buttons: Edit, Reject */}
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingTeam(team)}
                          className="px-3 py-1.5 rounded-lg bg-carnival-gold/20 text-carnival-gold hover:bg-carnival-gold hover:text-slate-950 font-sans font-bold text-xs transition-all inline-flex items-center gap-1"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white font-sans font-bold text-xs transition-all inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          ) : null}
            </>
          )}
      </>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingTeam && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 sm:p-8 rounded-2xl border border-carnival-cyan/40 max-w-lg w-full shadow-2xl relative space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Edit3 className="w-5 h-5 text-carnival-cyan" />
                  Edit Team Details
                </h3>
                <button
                  onClick={() => setEditingTeam(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Team Name</label>
                  <input
                    type="text"
                    required
                    value={editingTeam.name}
                    onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-cyan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={editingTeam.tagline}
                    onChange={(e) => setEditingTeam({ ...editingTeam, tagline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-cyan"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Leader Name</label>
                    <input
                      type="text"
                      required
                      value={editingTeam.leaderName}
                      onChange={(e) => setEditingTeam({ ...editingTeam, leaderName: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-cyan"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Leader Email</label>
                    <input
                      type="email"
                      required
                      value={editingTeam.leaderEmail}
                      onChange={(e) => setEditingTeam({ ...editingTeam, leaderEmail: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-cyan"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Status</label>
                    <select
                      value={editingTeam.status}
                      onChange={(e) =>
                        setEditingTeam({ ...editingTeam, status: e.target.value as ExtendedTeam['status'] })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1A1228] border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-cyan"
                    >
                      <option value="Safe">Safe</option>
                      <option value="Danger">Danger</option>
                      <option value="Eliminated">Eliminated</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Approved">Approved</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Theme Color</label>
                    <input
                      type="color"
                      value={editingTeam.themeColor}
                      onChange={(e) => setEditingTeam({ ...editingTeam, themeColor: e.target.value })}
                      className="w-full h-10 px-1 py-1 rounded-xl bg-white/5 border border-white/10 cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingTeam(null)}
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-carnival-cyan text-slate-950 font-black text-xs shadow-neon-cyan hover:scale-105 transition-all flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Grant Advantage Modal */}
      <GrantAdvantageModal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        teams={teams.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
};

