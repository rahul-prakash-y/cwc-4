import React, { useState, useEffect } from 'react';
import { Download, FileSpreadsheet, Award, FileCheck, Search, Eye, Sparkles, Filter, CheckCircle2, Trophy, Users, Shield } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { CSVLink } from 'react-csv';

interface ExportTeamData {
  _id: string;
  teamName: string;
  leaderName?: string;
  leaderEmail?: string;
  members?: string[];
  track?: string;
  totalPoints: number;
  status: string;
  immunity?: boolean;
  advantages?: any[];
  submissionsCount?: number;
  attendanceDays?: number;
  repoUrl?: string;
}

export const ExportModuleView: React.FC = () => {
  const [teams, setTeams] = useState<ExportTeamData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [previewTeam, setPreviewTeam] = useState<ExportTeamData | null>(null);

  useEffect(() => {
    fetchExportData();
  }, []);

  const fetchExportData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/v1/admin/teams', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
      } else {
        // Fallback demo dataset if API is loading
        setTeams([
          {
            _id: 't1',
            teamName: 'Cyber Circus Kings',
            leaderName: 'Aarav Sharma',
            leaderEmail: 'aarav@cwc.org',
            members: ['Aarav Sharma', 'Priya Patel', 'Rohan Gupta'],
            track: 'Full-Stack Web',
            totalPoints: 980,
            status: 'Approved',
            immunity: true,
            advantages: [{ advantage: 'Double Points' }],
            submissionsCount: 10,
            attendanceDays: 10,
            repoUrl: 'https://github.com/cwc/cyber-kings',
          },
          {
            _id: 't2',
            teamName: 'Neon Code Strikers',
            leaderName: 'Vikram Singh',
            leaderEmail: 'vikram@cwc.org',
            members: ['Vikram Singh', 'Ananya Roy'],
            track: 'AI & Data Systems',
            totalPoints: 945,
            status: 'Approved',
            immunity: false,
            advantages: [{ advantage: 'Extra Time' }],
            submissionsCount: 9,
            attendanceDays: 10,
            repoUrl: 'https://github.com/cwc/neon-strikers',
          },
          {
            _id: 't3',
            teamName: 'Quantum Jargons',
            leaderName: 'Sneha Verma',
            leaderEmail: 'sneha@cwc.org',
            members: ['Sneha Verma', 'Devansh Mehta', 'Kavya Nair'],
            track: 'Cybersecurity',
            totalPoints: 910,
            status: 'Approved',
            immunity: true,
            advantages: [],
            submissionsCount: 8,
            attendanceDays: 9,
            repoUrl: 'https://github.com/cwc/quantum-jargons',
          },
          {
            _id: 't4',
            teamName: 'Algo Gladiators',
            leaderName: 'Kabir Das',
            leaderEmail: 'kabir@cwc.org',
            members: ['Kabir Das', 'Isha Seth'],
            track: 'Full-Stack Web',
            totalPoints: 850,
            status: 'Danger',
            immunity: false,
            advantages: [],
            submissionsCount: 7,
            attendanceDays: 8,
            repoUrl: 'https://github.com/cwc/algo-gladiators',
          },
        ]);
      }
    } catch (e) {
      console.error('Failed to load export data', e);
    } finally {
      setLoading(false);
    }
  };

  // Sort teams by points for ranking
  const sortedTeams = [...teams].sort((a, b) => b.totalPoints - a.totalPoints);

  const filteredTeams = sortedTeams.filter((t) => {
    const matchesSearch =
      t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.leaderName && t.leaderName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTrack = selectedTrack === 'All' || t.track === selectedTrack;
    return matchesSearch && matchesTrack;
  });

  // Prepare CSV Data Sets for react-csv
  const scoreSheetHeaders = [
    { label: 'Rank', key: 'rank' },
    { label: 'Team ID', key: '_id' },
    { label: 'Team Name', key: 'teamName' },
    { label: 'Leader Name', key: 'leaderName' },
    { label: 'Leader Email', key: 'leaderEmail' },
    { label: 'Track', key: 'track' },
    { label: 'Total Score Points', key: 'totalPoints' },
    { label: 'Status', key: 'status' },
    { label: 'Immunity Status', key: 'immunity' },
    { label: 'Advantages Granted', key: 'advantagesCount' },
    { label: 'Repo URL', key: 'repoUrl' },
  ];

  const scoreSheetData = sortedTeams.map((team, index) => ({
    rank: `#${index + 1}`,
    _id: team._id,
    teamName: team.teamName,
    leaderName: team.leaderName || 'N/A',
    leaderEmail: team.leaderEmail || 'N/A',
    track: team.track || 'General',
    totalPoints: team.totalPoints,
    status: team.status,
    immunity: team.immunity ? 'Protected (YES)' : 'NO',
    advantagesCount: team.advantages ? team.advantages.length : 0,
    repoUrl: team.repoUrl || 'N/A',
  }));

  const attendanceHeaders = [
    { label: 'Team ID', key: '_id' },
    { label: 'Team Name', key: 'teamName' },
    { label: 'Leader', key: 'leaderName' },
    { label: 'Email', key: 'leaderEmail' },
    { label: 'Days Attended (out of 10)', key: 'attendanceDays' },
    { label: 'Submissions Count', key: 'submissionsCount' },
    { label: 'Attendance Rate', key: 'attendanceRate' },
    { label: 'Status', key: 'status' },
  ];

  const attendanceData = sortedTeams.map((team) => {
    const days = team.attendanceDays || 10;
    const rate = Math.round((days / 10) * 100);
    return {
      _id: team._id,
      teamName: team.teamName,
      leaderName: team.leaderName || 'N/A',
      leaderEmail: team.leaderEmail || 'N/A',
      attendanceDays: `${days} Days`,
      submissionsCount: team.submissionsCount || 10,
      attendanceRate: `${rate}%`,
      status: team.status,
    };
  });

  const participationHeaders = [
    { label: 'Registration ID', key: '_id' },
    { label: 'Team Name', key: 'teamName' },
    { label: 'Track', key: 'track' },
    { label: 'Team Leader', key: 'leaderName' },
    { label: 'Contact Email', key: 'leaderEmail' },
    { label: 'Member Roster', key: 'members' },
    { label: 'Project Repository', key: 'repoUrl' },
    { label: 'Grand Finale Status', key: 'status' },
  ];

  const participationData = sortedTeams.map((team) => ({
    _id: team._id,
    teamName: team.teamName,
    track: team.track || 'Full-Stack Web',
    leaderName: team.leaderName || 'N/A',
    leaderEmail: team.leaderEmail || 'N/A',
    members: team.members ? team.members.join('; ') : team.leaderName || 'N/A',
    repoUrl: team.repoUrl || 'N/A',
    status: team.status === 'Eliminated' ? 'Participant' : 'Finalist',
  }));

  // Generate PDF Certificate using jsPDF
  const generateCertificatePDF = (team: ExportTeamData, rankIndex: number) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Dark Obsidian & Gold Theme Canvas Background
    doc.setFillColor(15, 13, 36); // #0F0D24
    doc.rect(0, 0, width, height, 'F');

    // Outer Decorative Double Gold Border
    doc.setLineWidth(2);
    doc.setDrawColor(255, 215, 0); // Golden #FFD700
    doc.rect(8, 8, width - 16, height - 16);

    doc.setLineWidth(0.8);
    doc.setDrawColor(218, 165, 32);
    doc.rect(11, 11, width - 22, height - 22);

    // Header Stamp Badge
    doc.setTextColor(255, 215, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('CODE WITH CURIOUS • SEASON 4 CARNIVAL', width / 2, 24, { align: 'center' });

    // Main Certificate Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(26);
    doc.text('CERTIFICATE OF ACHIEVEMENT', width / 2, 40, { align: 'center' });

    // Subtitle Line
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 220);
    doc.text('THIS IS PROUDLY PRESENTED TO THE TEAM', width / 2, 52, { align: 'center' });

    // Team Name Highlight
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 215, 0);
    doc.text(team.teamName.toUpperCase(), width / 2, 68, { align: 'center' });

    // Members list string
    const membersList = team.members ? team.members.join(' • ') : team.leaderName || 'Team Members';
    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(230, 230, 250);
    doc.text(`Members: ${membersList}`, width / 2, 80, { align: 'center' });

    // Citation Body Text
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(200, 200, 220);
    doc.text(
      `For demonstrating exceptional technical mastery, outstanding innovation, and collaborative excellence`,
      width / 2,
      95,
      { align: 'center' }
    );
    doc.text(
      `during the 10-day Code With Curious (CWC) Season 4 Carnival & Grand Finale Arena.`,
      width / 2,
      102,
      { align: 'center' }
    );

    // Rank & Score Badge Box
    const rankText = rankIndex === 1 ? '1st Place Champion 🏆' : rankIndex === 2 ? '2nd Place Finalist 🥈' : rankIndex === 3 ? '3rd Place Finalist 🥉' : `Rank #${rankIndex} Finalist`;
    doc.setFillColor(30, 25, 65);
    doc.roundedRect(width / 2 - 50, 115, 100, 22, 4, 4, 'F');
    doc.setDrawColor(255, 215, 0);
    doc.roundedRect(width / 2 - 50, 115, 100, 22, 4, 4, 'D');

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 215, 0);
    doc.text(rankText, width / 2, 124, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Total Score: ${team.totalPoints} Points • Track: ${team.track || 'Full-Stack'}`, width / 2, 132, { align: 'center' });

    // Signatures & Verification Seal
    const sigY = 162;
    doc.setDrawColor(255, 215, 0);
    doc.line(40, sigY, 90, sigY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Carnival Director', 65, sigY + 6, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 200);
    doc.text('CWC Season 4 Board', 65, sigY + 11, { align: 'center' });

    // Golden Seal Graphic Representation
    doc.setFillColor(255, 215, 0);
    doc.circle(width / 2, sigY - 2, 12, 'F');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL', width / 2, sigY - 4, { align: 'center' });
    doc.text('SEAL', width / 2, sigY, { align: 'center' });
    doc.text('2026', width / 2, sigY + 4, { align: 'center' });

    doc.setDrawColor(255, 215, 0);
    doc.line(width - 90, sigY, width - 40, sigY);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('Lead Jury & Convener', width - 65, sigY + 6, { align: 'center' });
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 200);
    doc.text('Code With Curious', width - 65, sigY + 11, { align: 'center' });

    // Save File
    doc.save(`CWC_Certificate_${team.teamName.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/30 text-xs font-mono font-bold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Task 3: Export & Reports Center</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            System Exports & Official Certificates
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Generate official downloadable PDF certificates via jsPDF and export CSV spreadsheets via react-csv.
          </p>
        </div>
      </div>

      {/* CSV Export Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Final Score Sheet */}
        <div className="glass-card p-6 rounded-2xl border-carnival-gold/30 hover:border-carnival-gold transition-all group">
          <div className="w-12 h-12 rounded-xl bg-carnival-gold/20 text-carnival-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-lg mb-1">Final Score Sheet</h3>
          <p className="text-xs text-slate-300 mb-6">
            Export comprehensive score breakdown, task points, advantages used, immunity flags, and final team rankings.
          </p>
          <CSVLink
            data={scoreSheetData}
            headers={scoreSheetHeaders}
            filename="CWC_Season4_Final_Score_Sheet.csv"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-carnival-gold to-amber-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-neon-gold"
          >
            <Download className="w-4 h-4" />
            <span>Export Score Sheet (CSV)</span>
          </CSVLink>
        </div>

        {/* Card 2: Attendance List */}
        <div className="glass-card p-6 rounded-2xl border-carnival-cyan/30 hover:border-carnival-cyan transition-all group">
          <div className="w-12 h-12 rounded-xl bg-carnival-cyan/20 text-carnival-cyan flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileCheck className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-lg mb-1">Attendance Log</h3>
          <p className="text-xs text-slate-300 mb-6">
            Download daily arena check-in history, total active days out of 10, submission counts, and attendance rates.
          </p>
          <CSVLink
            data={attendanceData}
            headers={attendanceHeaders}
            filename="CWC_Season4_Attendance_Log.csv"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-carnival-cyan text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-neon-cyan"
          >
            <Download className="w-4 h-4" />
            <span>Export Attendance List (CSV)</span>
          </CSVLink>
        </div>

        {/* Card 3: Participation List */}
        <div className="glass-card p-6 rounded-2xl border-carnival-purple/30 hover:border-carnival-purple transition-all group">
          <div className="w-12 h-12 rounded-xl bg-carnival-purple/20 text-carnival-purple flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-lg mb-1">Participation List</h3>
          <p className="text-xs text-slate-300 mb-6">
            Export full student roster, contact emails, member names, project GitHub URLs, and Grand Finale eligibility.
          </p>
          <CSVLink
            data={participationData}
            headers={participationHeaders}
            filename="CWC_Season4_Participation_List.csv"
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-carnival-purple text-white font-bold text-xs hover:brightness-110 transition-all shadow-neon-purple"
          >
            <Download className="w-4 h-4" />
            <span>Export Participation Roster (CSV)</span>
          </CSVLink>
        </div>
      </div>

      {/* PDF Certificate Generator Section */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-carnival-gold" />
              <span>Official Certificates Generator (jsPDF)</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Select team records to generate high-resolution official PDF certificates of achievement.
            </p>
          </div>

          {/* Search & Track Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search team or leader..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#151329] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-carnival-gold"
              />
            </div>

            <div className="relative">
              <select
                value={selectedTrack}
                onChange={(e) => setSelectedTrack(e.target.value)}
                className="bg-[#151329] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-carnival-gold appearance-none pr-8 cursor-pointer"
              >
                <option value="All">All Tracks</option>
                <option value="Full-Stack Web">Full-Stack Web</option>
                <option value="AI & Data Systems">AI & Data Systems</option>
                <option value="Cybersecurity">Cybersecurity</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Teams Certificate Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1838] text-slate-300 font-mono border-b border-white/10 uppercase">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Team Name</th>
                <th className="p-4">Team Leader</th>
                <th className="p-4">Track</th>
                <th className="p-4">Score Points</th>
                <th className="p-4 text-right">Certificate Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTeams.map((team, idx) => {
                const rank = sortedTeams.findIndex((t) => t._id === team._id) + 1;
                return (
                  <tr key={team._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold">
                      <span className={`px-2.5 py-1 rounded-lg ${
                        rank === 1 ? 'bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40' : 'bg-white/5 text-slate-300'
                      }`}>
                        #{rank}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-white text-sm">{team.teamName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {team.members ? team.members.join(', ') : 'Members roster'}
                      </div>
                    </td>
                    <td className="p-4 text-slate-200">{team.leaderName || 'N/A'}</td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-carnival-purple/20 text-carnival-purple border border-carnival-purple/30 text-[10px] font-mono">
                        {team.track || 'Full-Stack Web'}
                      </span>
                    </td>
                    <td className="p-4 font-mono font-bold text-carnival-gold text-sm">
                      {team.totalPoints} PTS
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setPreviewTeam(team)}
                          className="px-3 py-1.5 rounded-xl glass-card text-slate-300 hover:text-white hover:border-carnival-gold text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Eye className="w-3.5 h-3.5 text-carnival-gold" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => generateCertificatePDF(team, rank)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-carnival-gold to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 hover:brightness-110 transition-all shadow-neon-gold"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download PDF</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Certificate Preview Modal */}
      {previewTeam && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-2xl w-full rounded-3xl border-carnival-gold/50 p-6 sm:p-8 space-y-6 relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setPreviewTeam(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center font-bold"
            >
              ✕
            </button>

            <div className="text-center space-y-2 border-b border-white/10 pb-4">
              <div className="inline-flex items-center gap-1 text-carnival-gold text-xs font-mono font-bold">
                <Sparkles className="w-4 h-4" /> OFFICIAL CERTIFICATE PREVIEW
              </div>
              <h3 className="text-2xl font-black text-white">Code With Curious Season 4</h3>
            </div>

            {/* Certificate Mockup Visual */}
            <div className="p-8 rounded-2xl bg-[#0F0D24] border-2 border-carnival-gold text-center space-y-4 shadow-2xl relative overflow-hidden">
              <div className="text-xs font-mono font-bold text-carnival-gold uppercase tracking-widest">
                CERTIFICATE OF ACHIEVEMENT
              </div>
              <div className="text-xs text-slate-400">PROUDLY PRESENTED TO</div>
              <div className="text-2xl font-black text-gradient-gold uppercase">
                {previewTeam.teamName}
              </div>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                For demonstrating outstanding technical brilliance and innovation in the CWC Season 4 Grand Finale with a total of <span className="text-carnival-gold font-bold">{previewTeam.totalPoints} points</span>.
              </p>
              <div className="pt-4 flex items-center justify-between text-[10px] font-mono text-slate-400 border-t border-white/10">
                <span>Date: August 2026</span>
                <span className="text-carnival-gold font-bold">Verified Stamp #CWC-2026-CERT</span>
                <span>Convener: CWC Board</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setPreviewTeam(null)}
                className="px-4 py-2 rounded-xl glass-card text-xs font-bold text-slate-300 hover:text-white"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  const rank = sortedTeams.findIndex((t) => t._id === previewTeam._id) + 1;
                  generateCertificatePDF(previewTeam, rank);
                }}
                className="px-5 py-2 rounded-xl bg-carnival-gold text-slate-950 font-extrabold text-xs flex items-center gap-2 hover:brightness-110 shadow-neon-gold"
              >
                <Download className="w-4 h-4" />
                <span>Download PDF Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
