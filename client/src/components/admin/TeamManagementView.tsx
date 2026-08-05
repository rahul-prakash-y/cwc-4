import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, CheckCircle2, XCircle, Edit3, Shield, AlertTriangle, Search, Filter, Plus, Save, Trash2, X } from 'lucide-react';
import { MOCK_TEAMS } from '../../data/mockData';

export interface ExtendedTeam {
  id: string;
  name: string;
  tagline: string;
  rank: number;
  points: number;
  status: 'Approved' | 'Pending' | 'Safe' | 'Danger' | 'Eliminated';
  avatar: string;
  themeColor: string;
  streak: number;
  leaderName: string;
  leaderEmail: string;
  membersCount: number;
}

export const TeamManagementView: React.FC = () => {
  const [teams, setTeams] = useState<ExtendedTeam[]>([
    ...MOCK_TEAMS.map((t, idx) => ({
      id: t.id,
      name: t.name,
      tagline: t.tagline,
      rank: t.rank,
      points: t.points,
      status: (idx === 0 || idx === 1 ? 'Approved' : idx === 4 ? 'Danger' : idx === 5 ? 'Eliminated' : 'Safe') as ExtendedTeam['status'],
      avatar: t.avatar,
      themeColor: t.themeColor,
      streak: t.streak,
      leaderName: t.members[0]?.name || 'Leader Name',
      leaderEmail: t.members[0]?.github ? `${t.members[0].github}@cwc.io` : 'leader@cwc.io',
      membersCount: t.members.length,
    })),
  ]);

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

  const handleUpdateStatus = (id: string, newStatus: ExtendedTeam['status']) => {
    setTeams(teams.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
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
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Safe':
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
      case 'Danger':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Eliminated':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
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
            Approve registrations, edit team profiles, reject invalid squads, or flag status as Safe, Danger, or Eliminated.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono text-slate-400">Total Teams: {teams.length}</span>
        </div>
      </div>

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
          {['All', 'Approved', 'Safe', 'Danger', 'Eliminated', 'Pending'].map((filter) => (
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

      {/* Data Table */}
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

                  {/* Quick Status Mark Buttons */}
                  <td className="p-4 text-center">
                    <div className="inline-flex items-center gap-1.5 p-1 rounded-xl bg-black/40 border border-white/5">
                      <button
                        onClick={() => handleUpdateStatus(team.id, 'Approved')}
                        title="Approve Team"
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          team.status === 'Approved'
                            ? 'bg-emerald-500 text-black'
                            : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(team.id, 'Safe')}
                        title="Mark Safe"
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          team.status === 'Safe'
                            ? 'bg-cyan-500 text-black'
                            : 'text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10'
                        }`}
                      >
                        Safe
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(team.id, 'Danger')}
                        title="Mark Danger"
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          team.status === 'Danger'
                            ? 'bg-amber-500 text-black'
                            : 'text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
                        }`}
                      >
                        Danger
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(team.id, 'Eliminated')}
                        title="Mark Eliminated"
                        className={`px-2 py-1 rounded text-[10px] font-bold ${
                          team.status === 'Eliminated'
                            ? 'bg-rose-500 text-white'
                            : 'text-slate-400 hover:text-rose-400 hover:bg-rose-500/10'
                        }`}
                      >
                        Evict
                      </button>
                    </div>
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
                      <option value="Approved">Approved</option>
                      <option value="Safe">Safe</option>
                      <option value="Danger">Danger</option>
                      <option value="Eliminated">Eliminated</option>
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
    </div>
  );
};
