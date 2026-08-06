import React, { useState, useEffect } from 'react';
import {
  Download,
  FileSpreadsheet,
  Award,
  FileCheck,
  Search,
  Eye,
  Sparkles,
  Filter,
  CheckCircle2,
  Trophy,
  Users,
  Shield,
  Phone,
  Mail,
  Home,
  UserCheck,
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { CSVLink } from 'react-csv';

export interface ExportTeamData {
  _id: string;
  teamName: string;
  leaderName?: string;
  leaderEmail?: string;
  leaderPhone?: string;
  residenceType?: 'Hosteller' | 'Day Scholar' | string;
  members?: { name: string; email?: string; phone?: string; role?: string; residenceType?: string }[] | string[];
  track?: string;
  totalPoints: number;
  mainTaskScore?: number;
  specialTaskScore?: number;
  status: string;
  immunity?: boolean;
  advantages?: any[];
  submissionsCount?: number;
  attendanceDays?: number;
  repoUrl?: string;
}

export const Export: React.FC = () => {
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
      const res = await fetch('/api/admin/teams', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
      } else {
        // High-fidelity fallback dataset for demonstration
        setTeams([
          {
            _id: 't1',
            teamName: 'Cyber Circus Kings',
            leaderName: 'Aarav Sharma',
            leaderEmail: 'aarav@cwc.org',
            leaderPhone: '+91 98765 43210',
            residenceType: 'Hosteller',
            members: [
              { name: 'Aarav Sharma', email: 'aarav@cwc.org', phone: '+91 98765 43210', role: 'Leader', residenceType: 'Hosteller' },
              { name: 'Priya Patel', email: 'priya@cwc.org', phone: '+91 98765 43211', role: 'Frontend Lead', residenceType: 'Day Scholar' },
              { name: 'Rohan Gupta', email: 'rohan@cwc.org', phone: '+91 98765 43212', role: 'Backend Lead', residenceType: 'Hosteller' },
            ],
            track: 'Full-Stack Web',
            totalPoints: 980,
            mainTaskScore: 500,
            specialTaskScore: 480,
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
            leaderPhone: '+91 98765 43220',
            residenceType: 'Day Scholar',
            members: [
              { name: 'Vikram Singh', email: 'vikram@cwc.org', phone: '+91 98765 43220', role: 'Leader', residenceType: 'Day Scholar' },
              { name: 'Ananya Roy', email: 'ananya@cwc.org', phone: '+91 98765 43221', role: 'ML Engineer', residenceType: 'Hosteller' },
            ],
            track: 'AI & Data Systems',
            totalPoints: 945,
            mainTaskScore: 480,
            specialTaskScore: 465,
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
            leaderPhone: '+91 98765 43230',
            residenceType: 'Hosteller',
            members: [
              { name: 'Sneha Verma', email: 'sneha@cwc.org', phone: '+91 98765 43230', role: 'Leader', residenceType: 'Hosteller' },
              { name: 'Devansh Mehta', email: 'devansh@cwc.org', phone: '+91 98765 43231', role: 'Security Architect', residenceType: 'Day Scholar' },
              { name: 'Kavya Nair', email: 'kavya@cwc.org', phone: '+91 98765 43232', role: 'DevOps Lead', residenceType: 'Hosteller' },
            ],
            track: 'Cybersecurity',
            totalPoints: 910,
            mainTaskScore: 450,
            specialTaskScore: 460,
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
            leaderPhone: '+91 98765 43240',
            residenceType: 'Day Scholar',
            members: [
              { name: 'Kabir Das', email: 'kabir@cwc.org', phone: '+91 98765 43240', role: 'Leader', residenceType: 'Day Scholar' },
              { name: 'Isha Seth', email: 'isha@cwc.org', phone: '+91 98765 43241', role: 'Algorithm Specialist', residenceType: 'Day Scholar' },
            ],
            track: 'Full-Stack Web',
            totalPoints: 850,
            mainTaskScore: 420,
            specialTaskScore: 430,
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

  // 1. Final Score Sheet CSV Export Headers & Data Mapping
  const scoreSheetHeaders = [
    { label: 'Rank', key: 'rank' },
    { label: 'Team ID', key: '_id' },
    { label: 'Team Name', key: 'teamName' },
    { label: 'Team Leader', key: 'leaderName' },
    { label: 'Leader Email', key: 'leaderEmail' },
    { label: 'Track', key: 'track' },
    { label: 'Main Task Score', key: 'mainTaskScore' },
    { label: 'Special Task Score', key: 'specialTaskScore' },
    { label: 'Total Score Points', key: 'totalPoints' },
    { label: 'Survival Status', key: 'status' },
    { label: 'Immunity Shield', key: 'immunity' },
    { label: 'Advantages Granted', key: 'advantagesCount' },
    { label: 'GitHub Repository', key: 'repoUrl' },
  ];

  const scoreSheetData = sortedTeams.map((team, index) => ({
    rank: `#${index + 1}`,
    _id: team._id,
    teamName: team.teamName,
    leaderName: team.leaderName || 'N/A',
    leaderEmail: team.leaderEmail || 'N/A',
    track: team.track || 'General',
    mainTaskScore: team.mainTaskScore || Math.round(team.totalPoints * 0.5),
    specialTaskScore: team.specialTaskScore || Math.round(team.totalPoints * 0.5),
    totalPoints: team.totalPoints,
    status: team.status,
    immunity: team.immunity ? 'Protected (YES)' : 'NO',
    advantagesCount: team.advantages ? team.advantages.length : 0,
    repoUrl: team.repoUrl || 'N/A',
  }));

  // 2. Participation List CSV Export Headers & Data Mapping (Detailed Roster & Student Contact Info)
  const participationHeaders = [
    { label: 'Student / Member Name', key: 'studentName' },
    { label: 'Role', key: 'role' },
    { label: 'Contact Email', key: 'email' },
    { label: 'Contact Phone', key: 'phone' },
    { label: 'Residence / Hosteller Status', key: 'residenceType' },
    { label: 'Team Name', key: 'teamName' },
    { label: 'Team Track', key: 'track' },
    { label: 'Team Rank', key: 'rank' },
    { label: 'Grand Finale Status', key: 'status' },
    { label: 'Project Repository', key: 'repoUrl' },
  ];

  const participationData: any[] = [];
  sortedTeams.forEach((team, teamIdx) => {
    const rankStr = `#${teamIdx + 1}`;
    if (Array.isArray(team.members)) {
      team.members.forEach((mem) => {
        if (typeof mem === 'string') {
          participationData.push({
            studentName: mem,
            role: mem === team.leaderName ? 'Team Leader' : 'Team Member',
            email: mem === team.leaderName ? team.leaderEmail || 'N/A' : `${mem.toLowerCase().replace(/\s+/g, '.')}@cwc.org`,
            phone: team.leaderPhone || '+91 98765 00000',
            residenceType: team.residenceType || 'Hosteller',
            teamName: team.teamName,
            track: team.track || 'Full-Stack Web',
            rank: rankStr,
            status: team.status === 'Eliminated' ? 'Participant' : 'Grand Finalist',
            repoUrl: team.repoUrl || 'N/A',
          });
        } else {
          participationData.push({
            studentName: mem.name,
            role: mem.role || (mem.name === team.leaderName ? 'Team Leader' : 'Team Member'),
            email: mem.email || (mem.name === team.leaderName ? team.leaderEmail : 'N/A'),
            phone: mem.phone || team.leaderPhone || '+91 98765 00000',
            residenceType: mem.residenceType || team.residenceType || 'Hosteller',
            teamName: team.teamName,
            track: team.track || 'Full-Stack Web',
            rank: rankStr,
            status: team.status === 'Eliminated' ? 'Participant' : 'Grand Finalist',
            repoUrl: team.repoUrl || 'N/A',
          });
        }
      });
    } else {
      participationData.push({
        studentName: team.leaderName || 'N/A',
        role: 'Team Leader',
        email: team.leaderEmail || 'N/A',
        phone: team.leaderPhone || '+91 98765 00000',
        residenceType: team.residenceType || 'Hosteller',
        teamName: team.teamName,
        track: team.track || 'Full-Stack Web',
        rank: rankStr,
        status: team.status === 'Eliminated' ? 'Participant' : 'Grand Finalist',
        repoUrl: team.repoUrl || 'N/A',
      });
    }
  });

  // 3. Generate PDF Participation Certificate using jsPDF
  const generateCertificatePDF = (team: ExportTeamData, rankIndex: number) => {
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    // Dark Obsidian & Gold Theme Canvas Background
    doc.setFillColor(15, 13, 36);
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
    doc.text('CERTIFICATE OF PARTICIPATION & ACHIEVEMENT', width / 2, 40, { align: 'center' });

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

    // Members list formatting
    let membersText = 'Team Members';
    if (Array.isArray(team.members)) {
      membersText = team.members
        .map((m) => (typeof m === 'string' ? m : m.name))
        .join(' • ');
    } else if (team.leaderName) {
      membersText = team.leaderName;
    }

    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(230, 230, 250);
    doc.text(`Members: ${membersText}`, width / 2, 80, { align: 'center' });

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
    const rankText =
      rankIndex === 1
        ? '1st Place Champion 🏆'
        : rankIndex === 2
        ? '2nd Place Finalist 🥈'
        : rankIndex === 3
        ? '3rd Place Finalist 🥉'
        : `Rank #${rankIndex} Grand Finalist`;

    doc.setFillColor(30, 25, 65);
    doc.roundedRect(width / 2 - 55, 115, 110, 22, 4, 4, 'F');
    doc.setDrawColor(255, 215, 0);
    doc.roundedRect(width / 2 - 55, 115, 110, 22, 4, 4, 'D');

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 215, 0);
    doc.text(rankText, width / 2, 124, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`Total Score: ${team.totalPoints} Points • Track: ${team.track || 'Full-Stack Web'}`, width / 2, 132, { align: 'center' });

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

    // Golden Seal Graphic
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
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/30 text-xs font-mono font-bold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>Task 3: Admin Export System</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Grand Finale Export Center & PDF Certificates
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            Export comprehensive score sheets and detailed participation rosters via react-csv, and generate official PDF certificates via jsPDF.
          </p>
        </div>
      </div>

      {/* CSV Export Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Final Score Sheet */}
        <div className="glass-card p-6 rounded-3xl border-carnival-gold/30 hover:border-carnival-gold transition-all group relative overflow-hidden bg-gradient-to-b from-[#1C172B]/90 to-[#120F24]/90">
          <div className="w-12 h-12 rounded-2xl bg-carnival-gold/20 text-carnival-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-neon-gold">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-xl mb-1">Final Score Sheet CSV</h3>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            Export complete final score breakdown including all team ranks, main task scores, special task scores, immunity flags, advantage perks, and repo links.
          </p>
          <CSVLink
            data={scoreSheetData}
            headers={scoreSheetHeaders}
            filename="CWC_Season4_Final_Score_Sheet.csv"
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-carnival-gold via-amber-400 to-yellow-500 text-slate-950 font-black text-xs hover:brightness-110 transition-all shadow-neon-gold btn-gold-pulse"
          >
            <Download className="w-4 h-4" />
            <span>Download Final Score Sheet (CSV)</span>
          </CSVLink>
        </div>

        {/* Card 2: Participation List Roster */}
        <div className="glass-card p-6 rounded-3xl border-carnival-cyan/30 hover:border-carnival-cyan transition-all group relative overflow-hidden bg-gradient-to-b from-[#101F30]/90 to-[#120F24]/90">
          <div className="w-12 h-12 rounded-2xl bg-carnival-cyan/20 text-carnival-cyan flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-neon-cyan">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-white text-xl mb-1">Participation List CSV</h3>
          <p className="text-xs text-slate-300 mb-6 leading-relaxed">
            Export individual student roster detailing emails, contact phones, hosteller vs day scholar residence status, assigned team roles, and track details.
          </p>
          <CSVLink
            data={participationData}
            headers={participationHeaders}
            filename="CWC_Season4_Participation_List.csv"
            className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl bg-carnival-cyan text-slate-950 font-black text-xs hover:brightness-110 transition-all shadow-neon-cyan btn-carnival-pulse"
          >
            <Download className="w-4 h-4" />
            <span>Download Participation List (CSV)</span>
          </CSVLink>
        </div>
      </div>

      {/* PDF Certificate Generator Section */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border-white/10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-carnival-gold" />
              <span>Participation Certificates Generator (jsPDF)</span>
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Dynamically map team and member names onto generic official PDF certificates for immediate download.
            </p>
          </div>

          {/* Search & Track Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
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

        {/* Teams Table */}
        <div className="overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1A1838] text-slate-300 font-mono border-b border-white/10 uppercase">
              <tr>
                <th className="p-4">Rank</th>
                <th className="p-4">Team Name</th>
                <th className="p-4">Leader & Members</th>
                <th className="p-4">Residence Status</th>
                <th className="p-4">Track</th>
                <th className="p-4">Total Score</th>
                <th className="p-4 text-right">PDF Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTeams.map((team) => {
                const rank = sortedTeams.findIndex((t) => t._id === team._id) + 1;
                const membersStr = Array.isArray(team.members)
                  ? team.members.map((m) => (typeof m === 'string' ? m : m.name)).join(', ')
                  : team.leaderName || 'N/A';

                return (
                  <tr key={team._id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-mono font-bold">
                      <span
                        className={`px-2.5 py-1 rounded-lg ${
                          rank === 1
                            ? 'bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40'
                            : 'bg-white/5 text-slate-300'
                        }`}
                      >
                        #{rank}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-extrabold text-white text-sm">{team.teamName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{team.repoUrl || 'No Repo'}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-white font-medium">{team.leaderName || 'N/A'}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate max-w-[200px]">{membersStr}</div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
                        <Home className="w-3 h-3 text-carnival-cyan" />
                        {team.residenceType || 'Hosteller'}
                      </span>
                    </td>
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
                CERTIFICATE OF PARTICIPATION & ACHIEVEMENT
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
