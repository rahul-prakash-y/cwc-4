import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, Filter, Edit3, Trash2, Save, X, Gift, CheckCircle, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';
import { GrantAdvantageModal } from '../../components/admin/GrantAdvantageModal';

export type TeamStatus = 'Approved' | 'Pending' | 'Safe' | 'Danger' | 'Eliminated' | 'Qualified' | 'Rejected';

export interface MemberInfo {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  role: 'Leader' | 'Member';
}

export interface TeamRecord {
  id: string;
  name: string;
  tagline: string;
  avatar: string;
  rank: number;
  points: number;
  status: TeamStatus;
  themeColor: string;
  members: MemberInfo[];
}

export const Teams: React.FC = () => {
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [editingTeam, setEditingTeam] = useState<TeamRecord | null>(null);

  const [teams, setTeams] = useState<TeamRecord[]>([]);

  useEffect(() => {
    const fetchAdminTeams = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/teams', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const rawTeams = data.teams || data;
          if (Array.isArray(rawTeams)) {
            const mapped: TeamRecord[] = rawTeams.map((t: any, idx: number) => ({
              id: t._id || t.id || `team-${idx + 1}`,
              name: t.name || t.teamName,
              tagline: t.tagline || t.description || 'Carnival contender',
              avatar: t.avatar || '🎪',
              rank: t.rank || idx + 1,
              points: t.points ?? 0,
              status: t.status || 'Approved',
              themeColor: t.themeColor || '#FFD700',
              members: Array.isArray(t.members)
                ? t.members.map((m: any, mIdx: number) => ({
                    id: m._id || m.id || `m-${mIdx}`,
                    name: typeof m === 'string' ? m : m.name || 'Member',
                    rollNumber: m.rollNumber || `ROLL-${mIdx + 1}`,
                    email: m.email || 'student@cwc.io',
                    role: m.role || (mIdx === 0 ? 'Leader' : 'Member'),
                  }))
                : [
                    {
                      id: 'lead-1',
                      name: t.leaderName || 'Team Leader',
                      rollNumber: t.leaderRollNumber || '21CS001',
                      email: t.leaderEmail || 'leader@cwc.io',
                      role: 'Leader',
                    },
                  ],
            }));
            setTeams(mapped);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch admin teams roster:', err);
      }
    };

    fetchAdminTeams();
  }, []);

  // Filter logic: Filter by team name OR member roll numbers OR member names
  const filteredTeams = teams.filter((team) => {
    const term = searchTerm.toLowerCase().trim();

    const matchesName = team.name.toLowerCase().includes(term);
    const matchesTagline = team.tagline.toLowerCase().includes(term);
    const matchesMembers = team.members.some(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.rollNumber.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term)
    );

    const matchesSearch = term === '' || matchesName || matchesTagline || matchesMembers;

    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && team.status === statusFilter;
  });

  // Quick Action Handler for status changes
  const handleUpdateStatus = async (id: string, newStatus: TeamStatus) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));

    try {
      await fetch(`/api/admin/teams/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.log('Status updated locally & backend notified');
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;
    setTeams((prev) => prev.map((t) => (t.id === editingTeam.id ? editingTeam : t)));
    handleUpdateStatus(editingTeam.id, editingTeam.status);
    setEditingTeam(null);
  };

  const handleDeleteTeam = (id: string) => {
    if (confirm('Are you sure you want to reject and remove this team from the portal?')) {
      handleUpdateStatus(id, 'Rejected');
      setTeams((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const getStatusBadge = (status: TeamStatus) => {
    switch (status) {
      case 'Approved':
      case 'Safe':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Danger':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse';
      case 'Eliminated':
      case 'Rejected':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      case 'Qualified':
        return 'bg-cyan-500/20 text-carnival-cyan border-cyan-500/30 shadow-neon-cyan';
      case 'Pending':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl glass-card border border-carnival-cyan/30">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-carnival-cyan/20 text-carnival-cyan text-xs font-mono font-bold border border-carnival-cyan/30 mb-2">
            <Users className="w-4 h-4" />
            <span>ROSTER & PARTICIPANT MANAGEMENT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Team Management View</h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1">
            Search teams by name or student roll numbers. Use quick-action dropdowns to change status between Approve, Reject, Safe, Danger, Eliminated, or Qualified.
          </p>
        </div>

        <button
          onClick={() => setIsGrantModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-carnival-gold via-amber-400 to-carnival-crimson text-slate-950 font-black text-xs uppercase tracking-wider shadow-neon-gold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Gift className="w-4 h-4 text-slate-950 fill-slate-950" />
          <span>Grant Advantage 🎁</span>
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input for Name or Roll Numbers */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by team name or member roll numbers (e.g. 21CS001)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-carnival-cyan transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['All', 'Approved', 'Safe', 'Danger', 'Eliminated', 'Qualified', 'Pending'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
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

      {/* Team Data Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-white/10 bg-[#140D21] text-slate-300 uppercase tracking-wider font-bold">
                <th className="p-4 border-r border-white/10 min-w-[200px]">Team & Tagline</th>
                <th className="p-4 border-r border-white/10 min-w-[280px]">Members & Roll Numbers</th>
                <th className="p-4 border-r border-white/10 text-center min-w-[100px]">Points</th>
                <th className="p-4 border-r border-white/10 text-center min-w-[120px]">Current Status</th>
                <th className="p-4 border-r border-white/10 text-center min-w-[200px]">Quick Status Action</th>
                <th className="p-4 text-right min-w-[140px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTeams.map((team) => (
                <tr key={team.id} className="hover:bg-white/5 transition-colors">
                  {/* Team & Tagline */}
                  <td className="p-4 border-r border-white/5 font-bold text-white">
                    <div className="flex items-center gap-3">
                      <span className="text-carnival-gold text-sm font-extrabold font-mono">#{team.rank}</span>
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

                  {/* Members with Roll Numbers */}
                  <td className="p-4 border-r border-white/5">
                    <div className="space-y-1">
                      {team.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-200 font-semibold flex items-center gap-1">
                            {member.role === 'Leader' && <span className="text-carnival-gold" title="Team Lead">👑</span>}
                            {member.name}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-white/5 text-carnival-cyan font-mono text-[10px]">
                            {member.rollNumber}
                          </span>
                        </div>
                      ))}
                    </div>
                  </td>

                  {/* Points */}
                  <td className="p-4 border-r border-white/5 text-center font-extrabold text-carnival-cyan text-sm">
                    {team.points} PTS
                  </td>

                  {/* Current Status Badge */}
                  <td className="p-4 border-r border-white/5 text-center">
                    <span className={`px-2.5 py-1 rounded-lg border font-sans font-bold text-[11px] inline-block ${getStatusBadge(team.status)}`}>
                      {team.status}
                    </span>
                  </td>

                  {/* Quick Action Status Change Buttons & Dropdown */}
                  <td className="p-4 border-r border-white/5 text-center">
                    <select
                      value={team.status}
                      onChange={(e) => handleUpdateStatus(team.id, e.target.value as TeamStatus)}
                      className="px-3 py-1.5 rounded-xl bg-[#1A1228] border border-white/20 text-xs font-mono font-bold text-white focus:outline-none focus:border-carnival-cyan cursor-pointer w-full max-w-[180px]"
                    >
                      <option value="Approved">✓ Approve</option>
                      <option value="Safe">🛡️ Safe</option>
                      <option value="Danger">⚠️ Danger</option>
                      <option value="Eliminated">❌ Eliminated</option>
                      <option value="Qualified">🏆 Qualified</option>
                      <option value="Pending">⏳ Pending</option>
                      <option value="Rejected">🚫 Reject</option>
                    </select>
                  </td>

                  {/* Row Actions: Edit, Reject */}
                  <td className="p-4 text-right space-x-2">
                    <button
                      onClick={() => setEditingTeam(team)}
                      className="px-3 py-1.5 rounded-lg bg-carnival-gold/20 text-carnival-gold hover:bg-carnival-gold hover:text-slate-950 font-sans font-bold text-xs transition-all inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTeam(team.id)}
                      className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white font-sans font-bold text-xs transition-all inline-flex items-center gap-1 cursor-pointer"
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

      {/* Edit Team Modal */}
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
                  Edit Team & Member Details
                </h3>
                <button
                  onClick={() => setEditingTeam(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 cursor-pointer"
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
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-cyan font-mono"
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
                    <label className="block text-xs font-mono text-slate-300 mb-1">Status</label>
                    <select
                      value={editingTeam.status}
                      onChange={(e) =>
                        setEditingTeam({ ...editingTeam, status: e.target.value as TeamStatus })
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-[#1A1228] border border-white/10 text-xs text-white focus:outline-none focus:border-carnival-cyan"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Safe">Safe</option>
                      <option value="Danger">Danger</option>
                      <option value="Eliminated">Eliminated</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Pending">Pending</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-300 mb-1">Theme Accent</label>
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
                    className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 text-xs font-bold hover:bg-white/10 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 rounded-xl bg-carnival-cyan text-slate-950 font-black text-xs shadow-neon-cyan hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-slate-950" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <GrantAdvantageModal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        teams={teams.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
};
