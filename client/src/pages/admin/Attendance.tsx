import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Calendar,
  Save,
  Users,
  Home,
  Bus,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';

export interface TeamMember {
  name: string;
  email: string;
  role?: string;
  phone?: string;
}

export interface TeamData {
  _id: string;
  teamName: string;
  leader: {
    name: string;
    email: string;
    phone?: string;
  };
  members: TeamMember[];
  residenceType?: 'Hosteller' | 'Day Scholar' | string;
  status: 'Pending' | 'Approved' | 'Eliminated' | 'Safe' | 'Danger' | 'Qualified' | string;
  themeColor?: string;
}

export interface AttendanceRecord {
  _id?: string;
  teamId: string | { _id: string; teamName: string };
  dayNumber: number;
  memberIdsPresent: string[];
  isTeamPresent?: boolean;
  timestamp?: string;
}

export const Attendance: React.FC = () => {
  const [teams, setTeams] = useState<TeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [residenceFilter, setResidenceFilter] = useState<'All' | 'Hosteller' | 'Day Scholar'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceState, setAttendanceState] = useState<Record<string, string[]>>({});
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, [selectedDay]);

  const fetchInitialData = async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};

      // Fetch teams and attendance for selected day in parallel
      const [teamsRes, attendanceRes] = await Promise.all([
        fetch('/api/admin/teams', { headers }),
        fetch(`/api/admin/attendance?dayNumber=${selectedDay}`, { headers }),
      ]);

      let fetchedTeams: TeamData[] = [];
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json();
        fetchedTeams = teamsData.teams || [];
      } else {
        // High fidelity fallback dataset
        fetchedTeams = [
          {
            _id: 't1',
            teamName: 'Cyber Circus Kings',
            leader: { name: 'Aarav Sharma', email: 'aarav@cwc.org', phone: '+91 98765 43210' },
            members: [
              { name: 'Priya Patel', email: 'priya@cwc.org', role: 'Frontend Lead' },
              { name: 'Rohan Gupta', email: 'rohan@cwc.org', role: 'Backend Lead' },
            ],
            residenceType: 'Hosteller',
            status: 'Approved',
            themeColor: '#FF0055',
          },
          {
            _id: 't2',
            teamName: 'Neon Code Strikers',
            leader: { name: 'Vikram Singh', email: 'vikram@cwc.org', phone: '+91 98765 43220' },
            members: [
              { name: 'Ananya Roy', email: 'ananya@cwc.org', role: 'ML Engineer' },
            ],
            residenceType: 'Day Scholar',
            status: 'Approved',
            themeColor: '#00F0FF',
          },
          {
            _id: 't3',
            teamName: 'Quantum Jargons',
            leader: { name: 'Sneha Verma', email: 'sneha@cwc.org', phone: '+91 98765 43230' },
            members: [
              { name: 'Devansh Mehta', email: 'devansh@cwc.org', role: 'Security Architect' },
              { name: 'Kavya Nair', email: 'kavya@cwc.org', role: 'DevOps Lead' },
            ],
            residenceType: 'Hosteller',
            status: 'Approved',
            themeColor: '#FFD700',
          },
          {
            _id: 't4',
            teamName: 'Algo Gladiators',
            leader: { name: 'Kabir Das', email: 'kabir@cwc.org', phone: '+91 98765 43240' },
            members: [
              { name: 'Isha Seth', email: 'isha@cwc.org', role: 'Algorithm Specialist' },
            ],
            residenceType: 'Day Scholar',
            status: 'Danger',
            themeColor: '#A855F7',
          },
        ];
      }

      setTeams(fetchedTeams);

      let fetchedAttendance: AttendanceRecord[] = [];
      if (attendanceRes.ok) {
        const attData = await attendanceRes.json();
        fetchedAttendance = attData.attendance || [];
      }

      // Map attendance into teamId -> memberIdsPresent record
      const attMap: Record<string, string[]> = {};
      fetchedTeams.forEach((t) => {
        const record = fetchedAttendance.find((a) => {
          const recTeamId = typeof a.teamId === 'object' ? a.teamId._id : a.teamId;
          return recTeamId === t._id;
        });

        if (record) {
          attMap[t._id] = record.memberIdsPresent || [];
        } else {
          // By default, mark all members present if no attendance saved yet for this day
          const allMemberNames = [t.leader.name, ...(t.members || []).map((m) => m.name)];
          attMap[t._id] = allMemberNames;
        }
      });

      setAttendanceState(attMap);
    } catch (e) {
      console.error('Failed to fetch attendance data:', e);
      setFeedback({ message: 'Error loading attendance data. Using offline state.', type: 'warning' });
    } finally {
      setLoading(false);
    }
  };

  // Toggle individual member presence
  const toggleMemberPresence = (teamId: string, memberIdentifier: string) => {
    setAttendanceState((prev) => {
      const currentList = prev[teamId] || [];
      const exists = currentList.includes(memberIdentifier);
      const updated = exists
        ? currentList.filter((m) => m !== memberIdentifier)
        : [...currentList, memberIdentifier];

      return { ...prev, [teamId]: updated };
    });
  };

  // Mark all members present for a specific team
  const markTeamAllPresent = (team: TeamData) => {
    const allMembers = [team.leader.name, ...(team.members || []).map((m) => m.name)];
    setAttendanceState((prev) => ({ ...prev, [team._id]: allMembers }));
  };

  // Clear all members for a specific team
  const clearTeamAttendance = (team: TeamData) => {
    setAttendanceState((prev) => ({ ...prev, [team._id]: [] }));
  };

  // Save Attendance for single team
  const saveTeamAttendance = async (team: TeamData) => {
    setSaving(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('token');
      const memberIdsPresent = attendanceState[team._id] || [];

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          teamId: team._id,
          dayNumber: selectedDay,
          memberIdsPresent,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        let msg = `Saved attendance for ${team.teamName}! (${memberIdsPresent.length} present)`;
        let type: 'success' | 'warning' = 'success';

        if (resData.ruleEnforcement?.statusChanged) {
          msg += ` ⚠️ Flagged status as 'Danger' due to rule book policy (< 2 members present)!`;
          type = 'warning';
        }

        setFeedback({ message: msg, type });
        fetchInitialData(); // Refresh to reflect updated statuses
      } else {
        setFeedback({ message: `Failed to save attendance for ${team.teamName}.`, type: 'error' });
      }
    } catch (e) {
      console.error(e);
      setFeedback({ message: `Network error saving attendance for ${team.teamName}.`, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Save Day Attendance for ALL teams in batch
  const saveAllDayAttendance = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const token = localStorage.getItem('token');
      const batchPayload = teams.map((team) => ({
        teamId: team._id,
        memberIdsPresent: attendanceState[team._id] || [],
      }));

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch('/api/admin/attendance', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          dayNumber: selectedDay,
          attendanceBatch: batchPayload,
        }),
      });

      if (res.ok) {
        const resData = await res.json();
        const flaggedCount = resData.flaggedCount || 0;
        let msg = `Successfully saved Day ${selectedDay} Attendance for all ${teams.length} teams! 📋`;
        if (flaggedCount > 0) {
          msg += ` ⚠️ ${flaggedCount} team(s) auto-flagged as 'Danger' for having < 2 members present.`;
        }

        setFeedback({ message: msg, type: flaggedCount > 0 ? 'warning' : 'success' });
        fetchInitialData();
      } else {
        setFeedback({ message: 'Failed to batch save attendance.', type: 'error' });
      }
    } catch (e) {
      console.error(e);
      setFeedback({ message: 'Network error submitting day attendance batch.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Filter teams by Search & Residence Filter
  const filteredTeams = teams.filter((team) => {
    const matchesSearch =
      team.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.leader.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.members || []).some((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesResidence =
      residenceFilter === 'All' ||
      (residenceFilter === 'Hosteller' && (team.residenceType === 'Hosteller' || !team.residenceType)) ||
      (residenceFilter === 'Day Scholar' && team.residenceType === 'Day Scholar');

    return matchesSearch && matchesResidence;
  });

  const hostellerTeams = filteredTeams.filter((t) => t.residenceType === 'Hosteller' || !t.residenceType);
  const dayScholarTeams = filteredTeams.filter((t) => t.residenceType === 'Day Scholar');

  // Attendance metrics summary
  const totalStudents = teams.reduce((acc, t) => acc + 1 + (t.members?.length || 0), 0);
  const presentStudentsCount = teams.reduce((acc, t) => acc + (attendanceState[t._id]?.length || 0), 0);
  const dangerTeamsCount = teams.filter((t) => (attendanceState[t._id]?.length || 0) < 2).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-carnival-gold/20 text-amber-700 dark:text-carnival-gold border border-amber-300 dark:border-carnival-gold/30 text-xs font-mono font-bold mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Task 2 & 3: Daily Attendance & Rule Book Engine</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Daily Attendance & Rule Book Manager
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Categorized by Hosteller and Day Scholar. Auto-enforces <span className="text-amber-700 dark:text-carnival-gold font-bold">2-Member Minimum Presence</span> to flag 'Danger' status.
          </p>
        </div>

        <button
          onClick={saveAllDayAttendance}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-rose-600 dark:from-carnival-gold dark:via-amber-400 dark:to-yellow-500 text-slate-950 font-black text-sm hover:brightness-110 transition-all shadow-md dark:shadow-neon-gold btn-gold-pulse disabled:opacity-50 cursor-pointer"
        >
          {saving ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          <span>Save Day {selectedDay} Attendance</span>
        </button>
      </div>

      {/* Feedback Toast / Alert Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center justify-between gap-3 text-sm font-medium animate-in fade-in duration-200 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-500/15 border-emerald-300 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300'
              : feedback.type === 'warning'
              ? 'bg-amber-50 dark:bg-amber-500/15 border-amber-300 dark:border-amber-500/40 text-amber-800 dark:text-amber-300'
              : 'bg-rose-50 dark:bg-rose-500/15 border-rose-300 dark:border-rose-500/40 text-rose-800 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
            {feedback.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 animate-pulse" />}
            {feedback.type === 'error' && <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-xs opacity-70 hover:opacity-100 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Day Selector & Category Filters */}
      <div className="bg-white dark:bg-[#18122B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Day Selector Buttons 1-10 */}
          <div>
            <label className="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 uppercase mb-2 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-amber-600 dark:text-carnival-gold" />
              <span>Select Festival Day Number (1 - 10):</span>
            </label>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                    selectedDay === day
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 dark:from-carnival-gold dark:to-carnival-amber text-slate-950 shadow-md dark:shadow-neon-gold font-black scale-105'
                      : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
                  }`}
                >
                  Day {day}
                </button>
              ))}
            </div>
          </div>

          {/* Residence Filter Tabs */}
          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              onClick={() => setResidenceFilter('All')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                residenceFilter === 'All'
                  ? 'bg-cyan-500 dark:bg-carnival-cyan text-slate-950 shadow-sm dark:shadow-neon-cyan'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
              }`}
            >
              All Teams ({teams.length})
            </button>
            <button
              onClick={() => setResidenceFilter('Hosteller')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                residenceFilter === 'Hosteller'
                  ? 'bg-emerald-500 dark:bg-emerald-400 text-slate-950 shadow-sm dark:shadow-neon-emerald'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Hostellers ({teams.filter((t) => t.residenceType === 'Hosteller' || !t.residenceType).length})</span>
            </button>
            <button
              onClick={() => setResidenceFilter('Day Scholar')}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                residenceFilter === 'Day Scholar'
                  ? 'bg-purple-600 dark:bg-carnival-purple text-white shadow-sm dark:shadow-neon-purple'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Day Scholars ({teams.filter((t) => t.residenceType === 'Day Scholar').length})</span>
            </button>
          </div>
        </div>

        {/* Search Bar & Telemetry Overview Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-white/10 items-center">
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search team or member name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-[#13112a] border border-slate-300 dark:border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-carnival-gold"
            />
          </div>

          <div className="bg-slate-50 dark:bg-[#15132d] p-3 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-mono">Present Rate:</span>
            <span className="font-extrabold text-amber-700 dark:text-carnival-gold font-mono">
              {presentStudentsCount} / {totalStudents} ({totalStudents > 0 ? Math.round((presentStudentsCount / totalStudents) * 100) : 0}%)
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-[#15132d] p-3 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400 font-mono">Danger Warning:</span>
            <span className={`font-extrabold font-mono flex items-center gap-1 ${dangerTeamsCount > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
              <ShieldAlert className="w-3.5 h-3.5" />
              {dangerTeamsCount} Team(s) &lt; 2 Present
            </span>
          </div>
        </div>
      </div>

      {/* Teams Categorized Display */}
      {loading ? (
        <div className="text-center py-20 bg-white dark:bg-[#18122B] rounded-3xl border border-slate-200 dark:border-white/10">
          <RefreshCw className="w-10 h-10 animate-spin text-amber-500 dark:text-carnival-gold mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-300 font-mono text-sm">Loading Team Roster & Attendance Matrix...</p>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#18122B] rounded-3xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 font-mono text-sm">
          No matching teams found for selected criteria.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section 1: Hostellers */}
          {(residenceFilter === 'All' || residenceFilter === 'Hosteller') && hostellerTeams.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white px-2">
                <Home className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>🏡 Hosteller Teams ({hostellerTeams.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hostellerTeams.map((team) => renderTeamAttendanceCard(team))}
              </div>
            </div>
          )}

          {/* Section 2: Day Scholars */}
          {(residenceFilter === 'All' || residenceFilter === 'Day Scholar') && dayScholarTeams.length > 0 && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white px-2">
                <Bus className="w-5 h-5 text-purple-600 dark:text-carnival-purple" />
                <span>🚌 Day Scholar Teams ({dayScholarTeams.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dayScholarTeams.map((team) => renderTeamAttendanceCard(team))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Helper render for individual team card checklist
  function renderTeamAttendanceCard(team: TeamData) {
    const presentMembers = attendanceState[team._id] || [];
    const allMembersList = [
      { name: team.leader.name, email: team.leader.email, role: 'Leader' },
      ...(team.members || []).map((m) => ({ name: m.name, email: m.email, role: m.role || 'Member' })),
    ];
    const isDangerRuleTriggered = presentMembers.length < 2;

    return (
      <div
        key={team._id}
        className={`p-6 rounded-3xl border transition-all relative overflow-hidden flex flex-col justify-between shadow-sm dark:shadow-xl ${
          isDangerRuleTriggered
            ? 'border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-gradient-to-b dark:from-rose-950/20 dark:to-[#120F24]/95 dark:shadow-neon-crimson'
            : 'border-slate-200 dark:border-white/10 hover:border-amber-400 dark:hover:border-carnival-gold/40 bg-white dark:bg-gradient-to-b dark:from-[#1C172B]/90 dark:to-[#120F24]/90'
        }`}
      >
        <div className="space-y-4">
          {/* Card Header */}
          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-lg tracking-tight">{team.teamName}</h3>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    team.residenceType === 'Day Scholar'
                      ? 'bg-purple-100 dark:bg-carnival-purple/20 text-purple-700 dark:text-carnival-purple border border-purple-300 dark:border-carnival-purple/40'
                      : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40'
                  }`}
                >
                  {team.residenceType || 'Hosteller'}
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">Leader: {team.leader.name}</p>
            </div>

            {/* Team Status Badge */}
            <div className="flex flex-col items-end gap-1">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1 ${
                  team.status === 'Danger' || isDangerRuleTriggered
                    ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/40 animate-pulse'
                    : team.status === 'Eliminated'
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700'
                    : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/40'
                }`}
              >
                {isDangerRuleTriggered ? <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                {isDangerRuleTriggered ? 'Danger (< 2 Present)' : team.status || 'Safe'}
              </span>
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {presentMembers.length} / {allMembersList.length} Present
              </span>
            </div>
          </div>

          {/* Member Checklist */}
          <div className="space-y-2 py-1">
            <div className="text-[11px] font-mono font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Member Checklist (Toggle Day {selectedDay})</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => markTeamAllPresent(team)}
                  className="text-[10px] text-cyan-600 dark:text-carnival-cyan hover:underline font-mono cursor-pointer"
                >
                  All Present
                </button>
                <span className="text-slate-400 dark:text-slate-600">•</span>
                <button
                  onClick={() => clearTeamAttendance(team)}
                  className="text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-mono cursor-pointer"
                >
                  Clear
                </button>
              </div>
            </div>

            {allMembersList.map((mem) => {
              const isPresent = presentMembers.includes(mem.name);
              return (
                <div
                  key={mem.name}
                  onClick={() => toggleMemberPresence(team._id, mem.name)}
                  className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    isPresent
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-slate-900 dark:text-white'
                      : 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                        isPresent ? 'bg-emerald-500 text-white dark:text-slate-950 shadow-sm dark:shadow-neon-emerald' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-white/10'
                      }`}
                    >
                      {isPresent ? '✓' : ''}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>{mem.name}</span>
                        {mem.role === 'Leader' && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-100 dark:bg-carnival-gold/20 text-amber-800 dark:text-carnival-gold text-[9px] font-mono font-bold border border-amber-300 dark:border-carnival-gold/30">
                            LEADER
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{mem.email}</div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                      isPresent ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300' : 'bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    {isPresent ? 'Present' : 'Absent'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card Action Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-3 mt-4">
          <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            {isDangerRuleTriggered ? (
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Auto-Danger Trigger Active
              </span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Rule Compliant (≥ 2 Present)</span>
            )}
          </div>

          <button
            onClick={() => saveTeamAttendance(team)}
            disabled={saving}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 dark:from-carnival-gold dark:to-amber-500 text-slate-950 font-black text-xs hover:brightness-110 transition-all shadow-sm dark:shadow-neon-gold flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Team</span>
          </button>
        </div>
      </div>
    );
  }
};
