import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Users,
  ShieldCheck,
  Eye,
  Trash2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiClient } from '../../api/axios';

interface BulkUploadTeamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export interface ParsedMemberPreview {
  index: number;
  role: 'Leader' | 'Member';
  name: string;
  email: string;
  rollNo: string;
  phone: string;
  gender: string;
  residenceType: string;
}

export interface ParsedTeamPreview {
  rowIndex: number;
  teamName: string;
  tagline: string;
  themeColor: string;
  residenceType: string;
  members: ParsedMemberPreview[];
  isValid: boolean;
  validationError?: string;
}

export const BulkUploadTeamsModal: React.FC<BulkUploadTeamsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedTeams, setParsedTeams] = useState<ParsedTeamPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTeamIndex, setExpandedTeamIndex] = useState<number | null>(0);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const handleDownloadTemplate = () => {
    try {
      const sampleData = [
        {
          'Team Name': 'Cyber Knights',
          Tagline: 'Hackers of Season 4',
          'Theme Color': '#FF0055',
          'Residence Type': 'Hosteller',
          'Member 1 Name (Leader)': 'Alex Vance',
          'Member 1 Email': 'alex.vance@cwc.edu',
          'Member 1 Roll No': '21CS001',
          'Member 1 Phone': '9876543210',
          'Member 1 Gender': 'Male',
          'Member 1 Residence': 'Hosteller',
          'Member 2 Name': 'Sarah Connor',
          'Member 2 Email': 'sarah.c@cwc.edu',
          'Member 2 Roll No': '21CS002',
          'Member 2 Phone': '9876543211',
          'Member 2 Gender': 'Female',
          'Member 2 Residence': 'DayScholar',
          'Member 3 Name': 'Bruce Wayne',
          'Member 3 Email': 'bruce.w@cwc.edu',
          'Member 3 Roll No': '21CS003',
          'Member 3 Phone': '9876543212',
          'Member 3 Gender': 'Male',
          'Member 3 Residence': 'Hosteller',
          'Member 4 Name': 'Diana Prince',
          'Member 4 Email': 'diana.p@cwc.edu',
          'Member 4 Roll No': '21CS004',
          'Member 4 Phone': '9876543213',
          'Member 4 Gender': 'Female',
          'Member 4 Residence': 'DayScholar',
        },
      ];

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Teams Import Template');
      XLSX.writeFile(workbook, 'CWC_Season4_Teams_Import_Template.xlsx');
    } catch (err) {
      console.error('Failed to download template:', err);
    }
  };

  const processFile = (file: File) => {
    setSelectedFile(file);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheet];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet);

        const structuredTeams: ParsedTeamPreview[] = jsonRows.map((row, idx) => {
          const getVal = (keys: string[]) => {
            for (const k of keys) {
              if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== '') {
                return String(row[k]).trim();
              }
            }
            return '';
          };

          const rawTeamName = getVal(['Team Name', 'teamName', 'Team', 'Name']);
          const tagline = getVal(['Tagline', 'tagline', 'Description', 'description']) || 'Carnival contender';
          const themeColor = getVal(['Theme Color', 'themeColor', 'Color']) || '#FF0055';
          const residenceTypeStr = getVal(['Residence Type', 'residenceType']);
          const residenceType =
            residenceTypeStr === 'DayScholar' || residenceTypeStr === 'Day Scholar'
              ? 'DayScholar'
              : 'Hosteller';

          const members: ParsedMemberPreview[] = [];
          for (let i = 1; i <= 4; i++) {
            const mName = getVal([
              `Member ${i} Name (Leader)`,
              `Member ${i} Name`,
              `m${i}_name`,
              `member${i}Name`,
            ]);
            const mEmail = getVal([`Member ${i} Email`, `m${i}_email`, `member${i}Email`]);
            const mRoll = getVal([
              `Member ${i} Roll No`,
              `Member ${i} Roll Number`,
              `m${i}_roll`,
              `member${i}RollNo`,
            ]);
            const mPhone = getVal([`Member ${i} Phone`, `m${i}_phone`, `member${i}Phone`]);
            const mGenderStr = getVal([`Member ${i} Gender`, `m${i}_gender`]);
            const mResStr = getVal([
              `Member ${i} Residence`,
              `Member ${i} Residence Type`,
              `m${i}_residence`,
            ]);

            const gender = mGenderStr === 'Male' || mGenderStr === 'Female' ? mGenderStr : 'Other';
            const resType = mResStr === 'DayScholar' || mResStr === 'Day Scholar' ? 'DayScholar' : 'Hosteller';

            members.push({
              index: i,
              role: i === 1 ? 'Leader' : 'Member',
              name: mName || (i === 1 ? `${rawTeamName || 'Team'} Leader` : `${rawTeamName || 'Team'} Member ${i}`),
              email: mEmail || `${(rawTeamName || 'team').toLowerCase().replace(/[^a-z0-9]/g, '')}.m${i}@cwc.edu`,
              rollNo: mRoll || `ROLL-${i}`,
              phone: mPhone || 'N/A',
              gender,
              residenceType: resType,
            });
          }

          let isValid = true;
          let validationError = '';

          if (!rawTeamName) {
            isValid = false;
            validationError = 'Missing Team Name';
          }

          return {
            rowIndex: idx + 1,
            teamName: rawTeamName || `Unnamed Team #${idx + 1}`,
            tagline,
            themeColor,
            residenceType,
            members,
            isValid,
            validationError,
          };
        });

        setParsedTeams(structuredTeams);
        setExpandedTeamIndex(structuredTeams.length > 0 ? 0 : null);
      } catch (err) {
        setErrorMsg('Failed to parse Excel file. Please ensure it is a valid .xlsx or .csv document.');
        setParsedTeams([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setParsedTeams([]);
    setErrorMsg(null);
    setSuccessMsg(null);
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile || parsedTeams.length === 0) {
      setErrorMsg('Please select an Excel sheet containing team rows.');
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await apiClient.post('/admin/teams/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const data = res.data;
      setSuccessMsg(data.message || `Successfully imported ${data.importedCount} approved teams!`);
      setSelectedFile(null);
      setParsedTeams([]);
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload teams.';
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const filteredTeams = parsedTeams.filter(
    (t) =>
      t.teamName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.members.some(
        (m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  const validTeamsCount = parsedTeams.filter((t) => t.isValid).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-[#18122B] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-carnival-cyan/40 max-w-4xl w-full shadow-2xl space-y-6 relative max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-700 dark:text-carnival-cyan border border-cyan-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Excel Batch Team Import & Preview</span>
                {parsedTeams.length > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-carnival-cyan text-xs font-mono font-bold">
                    {parsedTeams.length} Teams Detected
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Inspect details of every team and roster before confirming creation of approved accounts.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Top Actions: Template Download & File Picker */}
        {!selectedFile ? (
          <div className="space-y-4 shrink-0">
            {/* Download Template Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                  <FileText className="w-4 h-4 text-amber-500 dark:text-carnival-gold" />
                  <span>Need the Official Excel Import Template?</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Download the template with pre-configured headers for team names, tags, and 4 member rosters.
                </p>
              </div>

              <button
                onClick={handleDownloadTemplate}
                type="button"
                className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-carnival-gold border border-amber-500/30 hover:bg-amber-500 hover:text-slate-950 text-xs font-mono font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download Template</span>
              </button>
            </div>

            {/* Drag & Drop File Container */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]'
                  : 'border-slate-300 dark:border-white/20 hover:border-cyan-500/50 dark:hover:border-carnival-cyan/50 bg-slate-50 dark:bg-white/5'
              }`}
            >
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
              />

              <div className="space-y-3">
                <UploadCloud className="w-12 h-12 text-cyan-600 dark:text-carnival-cyan mx-auto animate-bounce" />
                <div className="text-base font-extrabold text-slate-900 dark:text-white">
                  Drag and drop your Excel sheet here, or click to browse
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Supports .xlsx, .xls, and .csv formats containing bulk team entries
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* File Loaded Header & Controls */
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="w-8 h-8 text-cyan-600 dark:text-carnival-cyan shrink-0" />
              <div>
                <div className="font-extrabold text-slate-900 dark:text-white text-sm font-mono flex items-center gap-2">
                  <span>{selectedFile.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-700 dark:text-carnival-cyan">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {validTeamsCount} of {parsedTeams.length} teams ready for import
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleClearFile}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-mono font-bold hover:bg-rose-500 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Change File</span>
              </button>
            </div>
          </div>
        )}

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-center gap-2 shrink-0">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-mono flex items-center gap-2 shrink-0">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Parsed Roster Detail Preview Area */}
        {parsedTeams.length > 0 && (
          <div className="flex-1 min-h-0 flex flex-col space-y-3 overflow-hidden">
            {/* Preview Toolbar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-500 dark:text-carnival-gold" />
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Roster Verification ({filteredTeams.length})
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Search in preview */}
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter preview..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                  />
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center p-0.5 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 text-[11px] font-mono">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      viewMode === 'cards'
                        ? 'bg-amber-500 dark:bg-carnival-gold text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Cards
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      viewMode === 'table'
                        ? 'bg-amber-500 dark:bg-carnival-gold text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Table
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Preview Roster Body */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {viewMode === 'cards' ? (
                filteredTeams.map((team, idx) => {
                  const isExpanded = expandedTeamIndex === idx;

                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border transition-all ${
                        isExpanded
                          ? 'bg-slate-50 dark:bg-white/5 border-cyan-500/40 shadow-lg'
                          : 'bg-white dark:bg-[#151226] border-slate-200 dark:border-white/10 hover:border-white/20'
                      }`}
                    >
                      {/* Card Header */}
                      <div
                        onClick={() => setExpandedTeamIndex(isExpanded ? null : idx)}
                        className="p-4 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                            style={{ backgroundColor: team.themeColor }}
                            title={`Theme Color: ${team.themeColor}`}
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                              <span>Row #{team.rowIndex}: {team.teamName}</span>
                              {!team.isValid && (
                                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 text-[10px] font-mono">
                                  ⚠️ {team.validationError}
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5 flex items-center gap-3">
                              <span>Tagline: "{team.tagline}"</span>
                              <span>•</span>
                              <span>Category: {team.residenceType}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-amber-600 dark:text-carnival-gold bg-amber-500/10 px-2.5 py-1 rounded-xl">
                            {team.members.length} Members
                          </span>
                          <button className="p-1 rounded-lg text-slate-400 hover:text-white">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Roster Details */}
                      {isExpanded && (
                        <div className="p-4 pt-0 border-t border-slate-200 dark:border-white/10 space-y-3 mt-1">
                          <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold tracking-wider pt-2">
                            Team Roster Details (4 Members)
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {team.members.map((m) => (
                              <div
                                key={m.index}
                                className={`p-3 rounded-xl border text-xs font-mono space-y-1 ${
                                  m.role === 'Leader'
                                    ? 'bg-amber-500/10 border-amber-500/30 dark:bg-carnival-gold/10 dark:border-carnival-gold/30'
                                    : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10'
                                }`}
                              >
                                <div className="flex items-center justify-between font-bold">
                                  <span className="text-slate-900 dark:text-white flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5 text-amber-500 dark:text-carnival-gold" />
                                    <span>{m.name}</span>
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[9px] uppercase ${
                                      m.role === 'Leader'
                                        ? 'bg-amber-500 text-slate-950 font-black'
                                        : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    {m.role}
                                  </span>
                                </div>

                                <div className="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                                  ✉️ {m.email}
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-1">
                                  <span>Roll: {m.rollNo}</span>
                                  <span>Phone: {m.phone}</span>
                                  <span>{m.gender} • {m.residenceType}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                /* Compact Table View */
                <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-[#151226]">
                  <table className="w-full text-left border-collapse text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-[10px] uppercase text-slate-500 font-bold">
                        <th className="p-3">#</th>
                        <th className="p-3">Team Name</th>
                        <th className="p-3">Leader Name & Email</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-right">Roster Count</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                      {filteredTeams.map((team, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5">
                          <td className="p-3 font-bold text-slate-400">{team.rowIndex}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">
                            {team.teamName}
                          </td>
                          <td className="p-3">
                            <div className="font-bold text-slate-800 dark:text-slate-200">
                              {team.members[0]?.name}
                            </div>
                            <div className="text-[10px] text-slate-500">{team.members[0]?.email}</div>
                          </td>
                          <td className="p-3">{team.residenceType}</td>
                          <td className="p-3 text-right font-bold text-amber-500">
                            {team.members.length} Members
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Controls */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-200 dark:border-white/10 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer font-mono"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={isUploading || !selectedFile || parsedTeams.length === 0 || validTeamsCount === 0}
            className="px-8 py-2.5 rounded-xl bg-cyan-500 dark:bg-carnival-cyan text-slate-950 font-black text-xs shadow-md dark:shadow-neon-cyan hover:scale-105 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Importing Teams...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4 text-slate-950" />
                <span>Confirm & Create Approved Teams ({validTeamsCount})</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
