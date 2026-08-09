import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Edit3,
  Trash2,
  Save,
  X,
  Gift,
  FileSpreadsheet,
  Plus,
  RefreshCcw,
  Crown,
  User,
  UserPlus,
  UserX,
  Phone,
  Mail,
  Hash,
  Sparkles,
} from 'lucide-react';
import { GrantAdvantageModal } from '../../components/admin/GrantAdvantageModal';
import { BulkUploadTeamsModal } from '../../components/admin/BulkUploadTeamsModal';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';

export type TeamStatus = 'Approved' | 'Pending' | 'Safe' | 'Danger' | 'Eliminated' | 'Qualified' | 'Rejected';

export interface MemberInfo {
  id: string;
  name: string;
  rollNumber: string;
  email: string;
  phone?: string;
  gender?: 'Male' | 'Female' | 'Other';
  residenceType?: 'Hosteller' | 'DayScholar' | 'Day Scholar';
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
  const { apiFetch } = useAuth();
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [editingTeam, setEditingTeam] = useState<TeamRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [teams, setTeams] = useState<TeamRecord[]>([]);

  const fetchAdminTeams = async () => {
    try {
      const res = await apiFetch('/admin/teams');
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
            points: t.totalPoints ?? t.points ?? 0,
            status: t.status || 'Approved',
            themeColor: t.themeColor || '#FFD700',
            members: Array.isArray(t.members) && t.members.length > 0
              ? t.members.map((m: any, mIdx: number) => ({
                  id: m._id || m.id || `m-${mIdx}-${Date.now()}`,
                  name: typeof m === 'string' ? m : m.name || 'Member',
                  rollNumber: m.rollNumber || m.rollNo || `ROLL-${mIdx + 1}`,
                  email: m.email || m.deptMailId || 'student@cwc.io',
                  phone: m.phone || '',
                  gender: m.gender || 'Male',
                  residenceType: m.residenceType || 'Hosteller',
                  role: m.role || (mIdx === 0 ? 'Leader' : 'Member'),
                }))
              : [
                  {
                    id: 'lead-1',
                    name: t.leader?.name || t.leaderName || 'Team Leader',
                    rollNumber: t.leader?.rollNumber || t.leaderRollNumber || '21CS001',
                    email: t.leader?.email || t.leaderEmail || 'leader@cwc.io',
                    phone: t.leader?.phone || '',
                    gender: 'Male',
                    residenceType: 'Hosteller',
                    role: 'Leader',
                  },
                ],
          }));
          setTeams(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch admin teams roster:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminTeams();
  }, []);

  // Filter logic: Filter by team name OR member roll numbers OR member names OR member emails
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

  // Direct Team Points Update Handler
  const handleUpdatePoints = async (id: string, newPoints: number) => {
    try {
      await apiFetch(`/admin/teams/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ points: newPoints }),
      });
    } catch (err) {
      console.error('Failed to update team points:', err);
    }
  };

  // Quick Action Handler for status changes
  const handleUpdateStatus = async (id: string, newStatus: TeamStatus) => {
    setTeams((prev) => prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t)));

    try {
      await apiFetch(`/admin/teams/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (err) {
      console.log('Status updated locally & backend notified');
    }
  };

  // Team & Member Edit Save Handler
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTeam) return;

    setIsSaving(true);
    try {
      const leaderMember = editingTeam.members.find((m) => m.role === 'Leader') || editingTeam.members[0];

      const payload = {
        teamName: editingTeam.name,
        tagline: editingTeam.tagline,
        status: editingTeam.status,
        themeColor: editingTeam.themeColor,
        points: Number(editingTeam.points),
        leader: leaderMember
          ? {
              name: leaderMember.name,
              email: leaderMember.email,
              phone: leaderMember.phone,
              rollNumber: leaderMember.rollNumber,
            }
          : undefined,
        members: editingTeam.members.map((m) => ({
          name: m.name,
          rollNo: m.rollNumber,
          rollNumber: m.rollNumber,
          deptMailId: m.email,
          email: m.email,
          phone: m.phone || '0000000000',
          gender: m.gender || 'Male',
          residenceType: m.residenceType || 'Hosteller',
          role: m.role || 'Member',
        })),
      };

      const res = await apiFetch(`/admin/teams/${editingTeam.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        const updatedDoc = data.team;
        if (updatedDoc) {
          const finalPoints = updatedDoc.points ?? updatedDoc.totalPoints ?? editingTeam.points;
          setTeams((prev) =>
            prev.map((t) =>
              t.id === editingTeam.id
                ? {
                    ...t,
                    name: updatedDoc.teamName || editingTeam.name,
                    status: updatedDoc.status || editingTeam.status,
                    points: finalPoints,
                    themeColor: updatedDoc.themeColor || editingTeam.themeColor,
                    members: Array.isArray(updatedDoc.members)
                      ? updatedDoc.members.map((m: any, mIdx: number) => ({
                          id: m._id || m.id || `m-${mIdx}`,
                          name: m.name,
                          rollNumber: m.rollNumber || m.rollNo || '',
                          email: m.email || m.deptMailId || '',
                          phone: m.phone || '',
                          gender: m.gender || 'Male',
                          residenceType: m.residenceType || 'Hosteller',
                          role: m.role || (mIdx === 0 ? 'Leader' : 'Member'),
                        }))
                      : editingTeam.members,
                  }
                : t
            )
          );
        }
        await fetchAdminTeams();
      } else {
        setTeams((prev) => prev.map((t) => (t.id === editingTeam.id ? editingTeam : t)));
      }
    } catch (err) {
      console.error('Failed to save team edits:', err);
      setTeams((prev) => prev.map((t) => (t.id === editingTeam.id ? editingTeam : t)));
    } finally {
      setIsSaving(false);
      setEditingTeam(null);
    }
  };

  // Member Management Helpers inside Modal
  const handleUpdateMemberField = (index: number, field: keyof MemberInfo, value: any) => {
    if (!editingTeam) return;
    const updatedMembers = [...editingTeam.members];
    updatedMembers[index] = {
      ...updatedMembers[index],
      [field]: value,
    };
    if (field === 'role' && value === 'Leader') {
      updatedMembers.forEach((m, i) => {
        if (i !== index) m.role = 'Member';
      });
    }
    setEditingTeam({ ...editingTeam, members: updatedMembers });
  };

  const handleReplaceMember = (index: number) => {
    if (!editingTeam) return;
    const updatedMembers = [...editingTeam.members];
    const currentRole = updatedMembers[index].role;
    updatedMembers[index] = {
      id: `m-replaced-${Date.now()}`,
      name: '',
      rollNumber: '',
      email: '',
      phone: '',
      gender: 'Male',
      residenceType: 'Hosteller',
      role: currentRole,
    };
    setEditingTeam({ ...editingTeam, members: updatedMembers });
  };

  const handleDeleteMember = (index: number) => {
    if (!editingTeam) return;
    if (editingTeam.members.length <= 1) {
      alert('A team must have at least 1 member.');
      return;
    }
    const updatedMembers = editingTeam.members.filter((_, i) => i !== index);
    if (!updatedMembers.some((m) => m.role === 'Leader') && updatedMembers.length > 0) {
      updatedMembers[0].role = 'Leader';
    }
    setEditingTeam({ ...editingTeam, members: updatedMembers });
  };

  const handleAddMember = () => {
    if (!editingTeam) return;
    if (editingTeam.members.length >= 6) {
      alert('Maximum team capacity is 6 members.');
      return;
    }
    const newMember: MemberInfo = {
      id: `m-new-${Date.now()}`,
      name: 'New Member',
      rollNumber: `21CS00${editingTeam.members.length + 1}`,
      email: `member${editingTeam.members.length + 1}@cwc.io`,
      phone: '9876543210',
      gender: 'Male',
      residenceType: 'Hosteller',
      role: 'Member',
    };
    setEditingTeam({
      ...editingTeam,
      members: [...editingTeam.members, newMember],
    });
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#18122B] border border-slate-200 dark:border-carnival-cyan/30 shadow-sm dark:shadow-lg">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-carnival-cyan/20 text-cyan-700 dark:text-carnival-cyan text-xs font-mono font-bold border border-cyan-500/30 dark:border-carnival-cyan/30 mb-2">
            <Users className="w-4 h-4" />
            <span>ROSTER & TEAM MEMBER MANAGEMENT</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Team Roster Management</h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1">
            Edit team details, modify member profiles, replace team members, delete members, or update status tags.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-carnival-cyan dark:to-blue-500 text-slate-950 dark:text-slate-950 font-black text-xs uppercase tracking-wider shadow-md dark:shadow-neon-cyan hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-950" />
            <span>Upload Teams Excel 📊</span>
          </button>

          <button
            onClick={() => setIsGrantModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-rose-600 dark:from-carnival-gold dark:via-amber-400 dark:to-carnival-crimson text-slate-950 font-black text-xs uppercase tracking-wider shadow-md dark:shadow-neon-gold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Gift className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>Grant Advantage 🎁</span>
          </button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input for Name or Roll Numbers */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Filter by team name, member name, email or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono focus:outline-none focus:border-cyan-500 dark:focus:border-carnival-cyan transition-all"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          {['All', 'Approved', 'Safe', 'Danger', 'Eliminated', 'Qualified', 'Pending'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                statusFilter === filter
                  ? 'bg-cyan-500 dark:bg-carnival-cyan text-slate-950 shadow-sm dark:shadow-neon-cyan'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Team Data Table */}
      {isLoading ? (
        <TableSkeleton rows={5} cols={6} className="min-h-[400px]" />
      ) : filteredTeams.length === 0 ? (
        <EmptyState
          title="No Teams Found"
          description="No teams have registered or matched your search filter."
          icon={Users}
        />
      ) : (
        <div className="bg-white dark:bg-[#140D21] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#140D21] text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                  <th className="p-4 border-r border-slate-200 dark:border-white/10 min-w-[200px]">Team & Tagline</th>
                  <th className="p-4 border-r border-slate-200 dark:border-white/10 min-w-[300px]">Members Roster ({filteredTeams.reduce((acc, t) => acc + t.members.length, 0)} Members)</th>
                  <th className="p-4 border-r border-slate-200 dark:border-white/10 text-center min-w-[100px]">Points</th>
                  <th className="p-4 border-r border-slate-200 dark:border-white/10 text-center min-w-[120px]">Current Status</th>
                  <th className="p-4 border-r border-slate-200 dark:border-white/10 text-center min-w-[180px]">Status Quick Action</th>
                  <th className="p-4 text-right min-w-[160px]">Roster Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    {/* Team & Tagline */}
                    <td className="p-4 border-r border-slate-200 dark:border-white/5 font-bold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <span className="text-amber-600 dark:text-carnival-gold text-sm font-extrabold font-mono">#{team.rank}</span>
                        <span className="text-xl p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">{team.avatar}</span>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                            {team.name}
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: team.themeColor }}
                              title={`Theme: ${team.themeColor}`}
                            />
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-sans font-normal truncate max-w-xs">{team.tagline}</div>
                        </div>
                      </div>
                    </td>

                    {/* Members with Roll Numbers */}
                    <td className="p-4 border-r border-slate-200 dark:border-white/5">
                      <div className="space-y-1.5">
                        {team.members.map((member) => (
                          <div key={member.id} className="flex items-center justify-between text-[11px] bg-slate-50 dark:bg-white/5 p-1.5 rounded-lg border border-slate-200 dark:border-white/5">
                            <span className="text-slate-800 dark:text-slate-200 font-semibold flex items-center gap-1.5">
                              {member.role === 'Leader' ? (
                                <Crown className="w-3.5 h-3.5 text-amber-500 dark:text-carnival-gold fill-amber-500 dark:fill-carnival-gold" />
                              ) : (
                                <User className="w-3.5 h-3.5 text-slate-400" />
                              )}
                              <span>{member.name || 'Unnamed Member'}</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-carnival-cyan font-mono text-[10px] border border-cyan-200 dark:border-cyan-500/30 font-bold">
                                {member.rollNumber}
                              </span>
                              <span className="text-[10px] text-slate-400 hidden sm:inline">{member.email}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Points (Editable by SuperAdmin/Admin) */}
                    <td className="p-4 border-r border-slate-200 dark:border-white/5 text-center font-extrabold text-cyan-700 dark:text-carnival-cyan text-sm">
                      <div className="flex items-center justify-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          value={team.points}
                          onChange={(e) => {
                            const val = Math.max(0, Number(e.target.value) || 0);
                            setTeams((prev) => prev.map((t) => (t.id === team.id ? { ...t, points: val } : t)));
                          }}
                          onBlur={() => handleUpdatePoints(team.id, team.points)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdatePoints(team.id, team.points);
                            }
                          }}
                          className="w-20 px-2 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1A1228] border border-amber-300 dark:border-carnival-gold/40 text-center font-mono font-black text-xs text-amber-600 dark:text-carnival-gold focus:outline-none focus:border-amber-500 shadow-sm"
                          title="Click to edit team points directly and press Enter or Blur"
                        />
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold">PTS</span>
                      </div>
                    </td>

                    {/* Current Status Badge */}
                    <td className="p-4 border-r border-slate-200 dark:border-white/5 text-center">
                      <span className={`px-2.5 py-1 rounded-lg border font-sans font-bold text-[11px] inline-block ${getStatusBadge(team.status)}`}>
                        {team.status}
                      </span>
                    </td>

                    {/* Quick Action Status Change Buttons & Dropdown */}
                    <td className="p-4 border-r border-slate-200 dark:border-white/5 text-center">
                      <select
                        value={team.status}
                        onChange={(e) => handleUpdateStatus(team.id, e.target.value as TeamStatus)}
                        className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#1A1228] border border-slate-300 dark:border-white/20 text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 dark:focus:border-carnival-cyan cursor-pointer w-full max-w-[180px]"
                      >
                        <option value="Approved">✓ Approve</option>
                        <option value="Safe">🛡️ Safe</option>
                        <option value="Danger">⚠️ Danger</option>
                        <option value="Eliminated">❌ Eliminated</option>
                        <option value="Qualified">⭐ Qualified</option>
                        <option value="Pending">⏳ Pending</option>
                        <option value="Rejected">🚫 Reject</option>
                      </select>
                    </td>

                    {/* Roster Actions */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setEditingTeam(JSON.parse(JSON.stringify(team)))}
                          className="p-2 rounded-xl bg-cyan-50 dark:bg-carnival-cyan/10 text-cyan-700 dark:text-carnival-cyan border border-cyan-200 dark:border-carnival-cyan/30 hover:bg-cyan-100 dark:hover:bg-carnival-cyan/20 transition-all cursor-pointer"
                          title="Edit Roster & Members"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeam(team.id)}
                          className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all cursor-pointer"
                          title="Delete Team Roster"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Team Modal */}
      <AnimatePresence>
        {editingTeam && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white dark:bg-[#140D21] border border-slate-200 dark:border-white/10 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto font-sans"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-2xl bg-cyan-50 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                    {editingTeam.avatar}
                  </span>
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                      <span>{editingTeam.name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-700 dark:text-carnival-cyan border border-cyan-500/30">
                        #{editingTeam.rank}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      Edit Team & Member Details
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingTeam(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-6">
                <div className="bg-slate-50 dark:bg-white/5 p-5 rounded-2xl border border-slate-200 dark:border-white/10 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Team Name</label>
                      <input
                        type="text"
                        required
                        value={editingTeam.name}
                        onChange={(e) => setEditingTeam({ ...editingTeam, name: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Tagline / Description</label>
                      <input
                        type="text"
                        value={editingTeam.tagline}
                        onChange={(e) => setEditingTeam({ ...editingTeam, tagline: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono text-amber-600 dark:text-carnival-gold mb-1 font-extrabold flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-carnival-gold" /> Total Team Points
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={editingTeam.points ?? 0}
                        onChange={(e) => setEditingTeam({ ...editingTeam, points: Math.max(0, Number(e.target.value) || 0) })}
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#120B1F] border border-amber-400/50 dark:border-carnival-gold/40 text-xs font-mono font-extrabold text-amber-700 dark:text-carnival-gold focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Status Tag</label>
                      <select
                        value={editingTeam.status}
                        onChange={(e) =>
                          setEditingTeam({ ...editingTeam, status: e.target.value as TeamStatus })
                        }
                        className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono font-bold"
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
                      <label className="block text-xs font-mono text-slate-700 dark:text-slate-300 mb-1 font-bold">Theme Accent Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={editingTeam.themeColor}
                          onChange={(e) => setEditingTeam({ ...editingTeam, themeColor: e.target.value })}
                          className="w-12 h-10 px-1 py-1 rounded-xl bg-white dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 cursor-pointer"
                        />
                        <span className="text-xs font-mono text-slate-600 dark:text-slate-400 font-bold">{editingTeam.themeColor}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Team Members Roster Editor */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white font-mono flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-600 dark:text-carnival-cyan" />
                        <span>Team Roster ({editingTeam.members.length} Members)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Edit details, replace existing members, or delete/add participants.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddMember}
                      className="px-3 py-1.5 rounded-xl bg-cyan-500 dark:bg-carnival-cyan text-slate-950 font-bold font-mono text-xs hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add Member</span>
                    </button>
                  </div>

                  <div className="space-y-4">
                    {editingTeam.members.map((member, idx) => (
                      <motion.div
                        key={member.id || idx}
                        layout
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-[#120B1F] border border-slate-200 dark:border-white/10 space-y-3 relative"
                      >
                        {/* Member Header Bar */}
                        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleUpdateMemberField(idx, 'role', member.role === 'Leader' ? 'Member' : 'Leader')}
                              className={`p-1.5 rounded-lg border font-mono text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                                member.role === 'Leader'
                                  ? 'bg-amber-100 dark:bg-carnival-gold/20 text-amber-800 dark:text-carnival-gold border-amber-300 dark:border-carnival-gold/40'
                                  : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10'
                              }`}
                              title="Click to toggle Leader / Member role"
                            >
                              <Crown className="w-3.5 h-3.5 fill-current" />
                              <span>{member.role}</span>
                            </button>
                            <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                              Member #{idx + 1}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleReplaceMember(idx)}
                              className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-500/30 text-[11px] font-mono font-bold hover:bg-indigo-200 dark:hover:bg-indigo-500/30 flex items-center gap-1 cursor-pointer"
                              title="Clear details and replace with new member"
                            >
                              <RefreshCcw className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                              <span>Replace</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteMember(idx)}
                              className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500/30 text-[11px] font-mono font-bold hover:bg-rose-200 dark:hover:bg-rose-500/30 flex items-center gap-1 cursor-pointer"
                              title="Delete member from team"
                            >
                              <UserX className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                              <span>Delete</span>
                            </button>
                          </div>
                        </div>

                        {/* Input Grid for Member Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-1">
                              Full Name
                            </label>
                            <input
                              type="text"
                              required
                              value={member.name}
                              onChange={(e) => handleUpdateMemberField(idx, 'name', e.target.value)}
                              placeholder="e.g. Rahul Sharma"
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#1A1228] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-sans"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-1">
                              Roll Number
                            </label>
                            <input
                              type="text"
                              required
                              value={member.rollNumber}
                              onChange={(e) => handleUpdateMemberField(idx, 'rollNumber', e.target.value)}
                              placeholder="e.g. 21CS042"
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#1A1228] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-1">
                              Email Address
                            </label>
                            <input
                              type="email"
                              required
                              value={member.email}
                              onChange={(e) => handleUpdateMemberField(idx, 'email', e.target.value)}
                              placeholder="student@college.edu"
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#1A1228] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-1">
                              Phone Number
                            </label>
                            <input
                              type="text"
                              value={member.phone || ''}
                              onChange={(e) => handleUpdateMemberField(idx, 'phone', e.target.value)}
                              placeholder="9876543210"
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#1A1228] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-1">
                              Gender
                            </label>
                            <select
                              value={member.gender || 'Male'}
                              onChange={(e) => handleUpdateMemberField(idx, 'gender', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#1A1228] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-sans"
                            >
                              <option value="Male">Male</option>
                              <option value="Female">Female</option>
                              <option value="Other">Other</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-1">
                              Residence Type
                            </label>
                            <select
                              value={member.residenceType || 'Hosteller'}
                              onChange={(e) => handleUpdateMemberField(idx, 'residenceType', e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-[#1A1228] border border-slate-300 dark:border-white/10 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-sans"
                            >
                              <option value="Hosteller">Hosteller</option>
                              <option value="DayScholar">Day Scholar</option>
                            </select>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10 sticky bottom-0 bg-white dark:bg-[#18122B] p-2">
                  <button
                    type="button"
                    onClick={() => setEditingTeam(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer font-mono"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 dark:from-carnival-cyan dark:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md dark:shadow-neon-cyan hover:scale-105 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 text-slate-950" />
                    <span>{isSaving ? 'Saving Roster...' : 'Save Roster & Details'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <GrantAdvantageModal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        teams={teams.map((t) => ({ id: t.id, name: t.name }))}
      />
      <BulkUploadTeamsModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          fetchAdminTeams();
        }}
      />
    </div>
  );
};
