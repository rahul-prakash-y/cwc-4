import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2, AlertTriangle, Shield, UserCheck, UserX, Sparkles, Filter, RefreshCw, Home, Bus, Zap, FileSpreadsheet } from 'lucide-react';

export interface AttendanceTeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  isPresent: boolean;
}

export interface AttendanceTeam {
  id: string;
  name: string;
  residenceType: 'Hosteller' | 'Day Scholar';
  status: 'Safe' | 'Danger' | 'Eliminated' | 'Qualified' | 'Approved' | 'Pending';
  avatar: string;
  themeColor: string;
  members: AttendanceTeamMember[];
  isTeamPresent: boolean;
}

export const DailyAttendanceView: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [residenceFilter, setResidenceFilter] = useState<'All' | 'Hosteller' | 'Day Scholar'>('All');
  const [autoChecking, setAutoChecking] = useState<boolean>(false);
  const [autoCheckMessage, setAutoCheckMessage] = useState<string | null>(null);
  const [saveStatusMessage, setSaveStatusMessage] = useState<string | null>(null);

  // Initialize Team Attendance state with live data
  const [teams, setTeams] = useState<AttendanceTeam[]>([]);

  useEffect(() => {
    const fetchAttendanceTeams = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/admin/teams', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          const rawTeams = data.teams || data;
          if (Array.isArray(rawTeams)) {
            const mapped: AttendanceTeam[] = rawTeams.map((t: any, idx: number) => {
              const isHosteller = idx % 2 === 0;
              const roster: AttendanceTeamMember[] = Array.isArray(t.members)
                ? t.members.map((m: any, mIdx: number) => ({
                    id: m._id || m.id || `${t._id || t.id}-m${mIdx}`,
                    name: typeof m === 'string' ? m : m.name || 'Member',
                    role: m.role || (mIdx === 0 ? 'Leader' : 'Member'),
                    email: m.email || 'student@cwc.io',
                    isPresent: true,
                  }))
                : [
                    {
                      id: `${t._id || t.id}-m0`,
                      name: t.leaderName || 'Team Leader',
                      role: 'Leader',
                      email: t.leaderEmail || 'leader@cwc.io',
                      isPresent: true,
                    },
                  ];

              return {
                id: t._id || t.id || `team-${idx + 1}`,
                name: t.name || t.teamName,
                residenceType: t.residenceType || (isHosteller ? 'Hosteller' : 'Day Scholar'),
                status: t.status || 'Safe',
                avatar: t.avatar || '🎪',
                themeColor: t.themeColor || '#FFD700',
                members: roster,
                isTeamPresent: true,
              };
            });
            setTeams(mapped);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch attendance teams:', err);
      }
    };

    fetchAttendanceTeams();
  }, []);

  // Track attendance state per day e.g. { [dayNumber]: { [teamId]: AttendanceTeam } }
  const [dailyAttendanceRecords, setDailyAttendanceRecords] = useState<Record<number, Record<string, AttendanceTeam>>>({});

  // Synchronize team states when selectedDay changes
  useEffect(() => {
    if (dailyAttendanceRecords[selectedDay]) {
      const dayData = dailyAttendanceRecords[selectedDay];
      setTeams((prev) =>
        prev.map((t) => (dayData[t.id] ? { ...t, ...dayData[t.id] } : t))
      );
    }
  }, [selectedDay]);

  // Filtered teams based on residence type
  const filteredTeams = teams.filter((t) => {
    if (residenceFilter === 'All') return true;
    return t.residenceType === residenceFilter;
  });

  // Toggle individual member attendance
  const handleToggleMember = (teamId: string, memberId: string) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id !== teamId) return team;
        const updatedMembers = team.members.map((m) =>
          m.id === memberId ? { ...m, isPresent: !m.isPresent } : m
        );
        const presentCount = updatedMembers.filter((m) => m.isPresent).length;
        const isTeamPresent = presentCount > 0;
        return {
          ...team,
          members: updatedMembers,
          isTeamPresent,
        };
      })
    );
  };

  // Mark Team as "Present for Day X"
  const handleMarkTeamPresent = (teamId: string) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id !== teamId) return team;
        const updatedMembers = team.members.map((m) => ({ ...m, isPresent: true }));
        return {
          ...team,
          members: updatedMembers,
          isTeamPresent: true,
        };
      })
    );
    showToast(`Marked ${teams.find((t) => t.id === teamId)?.name} as FULLY PRESENT for Day ${selectedDay}!`);
  };

  // Toggle Team Residence Category (Hosteller <-> Day Scholar)
  const handleToggleResidence = (teamId: string) => {
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id !== teamId) return team;
        const newRes = team.residenceType === 'Hosteller' ? 'Day Scholar' : 'Hosteller';
        return { ...team, residenceType: newRes };
      })
    );
  };

  // Save Attendance to Backend / Local State
  const handleSaveAttendance = async (team: AttendanceTeam) => {
    const presentMemberIds = team.members.filter((m) => m.isPresent).map((m) => m.email);

    // Save to local daily state cache
    setDailyAttendanceRecords((prev) => ({
      ...prev,
      [selectedDay]: {
        ...(prev[selectedDay] || {}),
        [team.id]: team,
      },
    }));

    try {
      const token = localStorage.getItem('token');
      await fetch('/api/admin/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          teamId: team.id,
          dayNumber: selectedDay,
          memberIdsPresent: presentMemberIds,
          isTeamPresent: team.isTeamPresent,
        }),
      });
    } catch (err) {
      console.warn('Backend sync failed, state preserved locally:', err);
    }

    showToast(`Saved Day ${selectedDay} attendance for ${team.name}`);
  };

  // Task 3: Auto-checker that flags teams who fail minimum attendance rules
  const handleRunAutoChecker = async () => {
    setAutoChecking(true);
    setAutoCheckMessage(null);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/admin/attendance/auto-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const data = await res.json();
        const flaggedNames = data.flaggedTeams?.map((t: any) => t.name) || [];
        
        // Update local team statuses if flagged
        if (flaggedNames.length > 0) {
          setTeams((prev) =>
            prev.map((t) => (flaggedNames.includes(t.name) ? { ...t, status: 'Danger' } : t))
          );
        }

        setAutoCheckMessage(
          `Auto-Checker Result: ${data.flaggedCount || 0} teams flagged as "In Danger" due to minimum attendance violations.`
        );
      } else {
        // Local evaluation fallback
        runLocalAutoCheck();
      }
    } catch (e) {
      runLocalAutoCheck();
    } finally {
      setAutoChecking(false);
    }
  };

  const runLocalAutoCheck = () => {
    const newlyFlagged: string[] = [];

    setTeams((prevTeams) =>
      prevTeams.map((t) => {
        const presentCount = t.members.filter((m) => m.isPresent).length;
        const total = t.members.length;
        const ratio = total > 0 ? presentCount / total : 1;

        // Rule Book Check: Less than 50% member presence flags team as 'Danger'
        if (ratio < 0.5 && t.status !== 'Eliminated') {
          newlyFlagged.push(t.name);
          return { ...t, status: 'Danger' };
        }
        return t;
      })
    );

    if (newlyFlagged.length > 0) {
      setAutoCheckMessage(
        `Auto-Checker Alert: ${newlyFlagged.length} team(s) [${newlyFlagged.join(', ')}] failed the 50% minimum member attendance rule and marked 'In Danger'.`
      );
    } else {
      setAutoCheckMessage('Auto-Checker Complete: All active teams meet the minimum 50% attendance requirement!');
    }
  };

  const showToast = (msg: string) => {
    setSaveStatusMessage(msg);
    setTimeout(() => setSaveStatusMessage(null), 3500);
  };

  const hostellerCount = teams.filter((t) => t.residenceType === 'Hosteller').length;
  const dayScholarCount = teams.filter((t) => t.residenceType === 'Day Scholar').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      <AnimatePresence>
        {saveStatusMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center justify-between shadow-lg"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{saveStatusMessage}</span>
            </div>
            <button onClick={() => setSaveStatusMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Auto-checker Alert Banner */}
      <AnimatePresence>
        {autoCheckMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="p-4 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold flex items-center justify-between shadow-neon-gold"
          >
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>{autoCheckMessage}</span>
            </div>
            <button onClick={() => setAutoCheckMessage(null)} className="text-amber-400 hover:text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Header Panel */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#18122B] border border-slate-200 dark:border-carnival-gold/30 shadow-sm dark:shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-carnival-gold/20 text-amber-700 dark:text-carnival-gold text-xs font-mono font-bold border border-amber-300 dark:border-carnival-gold/30 mb-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>FACULTY DAILY ATTENDANCE & RULE ENGINE</span>
            </div>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Daily Attendance Controller</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
              Toggle member-level daily attendance, categorize teams by Hosteller/Day Scholar, and run auto-checker rule validation.
            </p>
          </div>

          {/* Task 3 Auto-Checker Button */}
          <button
            onClick={handleRunAutoChecker}
            disabled={autoChecking}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-rose-600 dark:from-carnival-gold dark:via-amber-400 dark:to-carnival-crimson text-slate-950 font-black text-xs uppercase tracking-wider shadow-md dark:shadow-neon-gold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Zap className={`w-4 h-4 text-slate-950 ${autoChecking ? 'animate-spin' : ''}`} />
            <span>{autoChecking ? 'Running Auto-Checker...' : 'Run Attendance Auto-Checker ⚡'}</span>
          </button>
        </div>

        {/* Day Selector Ribbon (Day 1 to Day 10) */}
        <div className="space-y-2">
          <div className="text-xs font-mono text-slate-600 dark:text-slate-400 font-bold uppercase tracking-wider">Select Carnival Arena Day:</div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-all flex-shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  selectedDay === day
                    ? 'bg-amber-500 dark:bg-carnival-gold text-slate-950 shadow-md dark:shadow-neon-gold scale-105'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Day {day}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Categorization Tabs (Hosteller / Day Scholar / All) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400 flex items-center gap-1 font-bold">
              <Filter className="w-3.5 h-3.5" /> Category Filter:
            </span>

            <button
              onClick={() => setResidenceFilter('All')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                residenceFilter === 'All'
                  ? 'bg-cyan-500 dark:bg-carnival-cyan text-slate-950 shadow-sm dark:shadow-neon-cyan'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All Teams ({teams.length})
            </button>

            <button
              onClick={() => setResidenceFilter('Hosteller')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                residenceFilter === 'Hosteller'
                  ? 'bg-amber-400 text-slate-950 shadow-sm dark:shadow-neon-gold'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Hostellers ({hostellerCount})</span>
            </button>

            <button
              onClick={() => setResidenceFilter('Day Scholar')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                residenceFilter === 'Day Scholar'
                  ? 'bg-purple-600 dark:bg-purple-400 text-white dark:text-slate-950 shadow-sm dark:shadow-neon-purple'
                  : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Bus className="w-3.5 h-3.5" />
              <span>Day Scholars ({dayScholarCount})</span>
            </button>
          </div>

          <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
            Active Day: <span className="text-amber-700 dark:text-carnival-gold font-bold">Day {selectedDay}</span>
          </div>
        </div>
      </div>

      {/* Team Attendance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTeams.map((team) => {
          const presentMembersCount = team.members.filter((m) => m.isPresent).length;
          const totalMembersCount = team.members.length;
          const attendancePercentage = Math.round((presentMembersCount / totalMembersCount) * 100);
          const isDangerRatio = attendancePercentage < 50;

          return (
            <div
              key={team.id}
              className={`p-6 rounded-2xl border transition-all space-y-4 shadow-sm dark:shadow-lg ${
                team.status === 'Danger'
                  ? 'border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-950/10 dark:shadow-neon-crimson'
                  : isDangerRatio
                  ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/10'
                  : 'border-slate-200 dark:border-white/10 hover:border-cyan-400 dark:hover:border-carnival-cyan/40 bg-white dark:bg-[#151226]'
              }`}
            >
              {/* Team Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">{team.avatar}</span>
                  <div>
                    <h4 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
                      {team.name}
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: team.themeColor }}
                      />
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      {/* Residence Category Badge */}
                      <button
                        onClick={() => handleToggleResidence(team.id)}
                        title="Click to toggle category (Hosteller / Day Scholar)"
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                          team.residenceType === 'Hosteller'
                            ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40 hover:bg-amber-200 dark:hover:bg-amber-500/30'
                            : 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-500/40 hover:bg-purple-200 dark:hover:bg-purple-500/30'
                        }`}
                      >
                        {team.residenceType === 'Hosteller' ? <Home className="w-3 h-3" /> : <Bus className="w-3 h-3" />}
                        <span>{team.residenceType}</span>
                      </button>

                      {/* Status Tag */}
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          team.status === 'Danger'
                            ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30 animate-pulse'
                            : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30'
                        }`}
                      >
                        {team.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Live Attendance Ratio Badge */}
                <div className="text-right">
                  <div
                    className={`text-sm font-extrabold font-mono ${
                      isDangerRatio ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}
                  >
                    {presentMembersCount}/{totalMembersCount} Present ({attendancePercentage}%)
                  </div>
                  {isDangerRatio && (
                    <div className="text-[10px] text-rose-600 dark:text-rose-400 font-mono flex items-center gap-1 justify-end mt-0.5">
                      <AlertTriangle className="w-3 h-3" /> Below 50% Rule
                    </div>
                  )}
                </div>
              </div>

              {/* Members Roster List with Attendance Toggles */}
              <div className="space-y-2">
                <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 uppercase tracking-wider font-bold">
                  Team Members Attendance for Day {selectedDay}:
                </div>
                <div className="space-y-2">
                  {team.members.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => handleToggleMember(team.id, member.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        member.isPresent
                          ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                          : 'bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 hover:bg-rose-100 dark:hover:bg-rose-500/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                            member.isPresent
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                              : 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300'
                          }`}
                        >
                          {member.isPresent ? <UserCheck className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                            {member.name}
                            <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300">
                              {member.role}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{member.email}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[11px] font-mono font-bold ${
                            member.isPresent ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                          }`}
                        >
                          {member.isPresent ? 'PRESENT' : 'ABSENT'}
                        </span>
                        <input
                          type="checkbox"
                          checked={member.isPresent}
                          onChange={() => {}} // Handled by parent div onClick
                          className="w-4 h-4 accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Actions: "Mark Team Present for Day X" & "Save Attendance" */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                <button
                  onClick={() => handleMarkTeamPresent(team.id)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 font-mono font-bold text-xs hover:bg-emerald-500 hover:text-white dark:hover:text-slate-950 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mark Team Present for Day {selectedDay}</span>
                </button>

                <button
                  onClick={() => handleSaveAttendance(team)}
                  className="px-4 py-2 rounded-xl bg-cyan-500 dark:bg-carnival-cyan text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm dark:shadow-neon-cyan hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Save Record</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
