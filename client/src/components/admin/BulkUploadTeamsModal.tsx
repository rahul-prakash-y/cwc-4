import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileSpreadsheet, Download, UploadCloud, X, CheckCircle, AlertCircle, RefreshCw, FileText } from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiClient } from '../../api/axios';

interface BulkUploadTeamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const BulkUploadTeamsModal: React.FC<BulkUploadTeamsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDownloadTemplate = () => {
    try {
      const sampleData = [
        {
          "Team Name": "Cyber Knights",
          "Tagline": "Hackers of Season 4",
          "Theme Color": "#FF0055",
          "Residence Type": "Hosteller",
          "Member 1 Name (Leader)": "Alex Vance",
          "Member 1 Email": "alex.vance@cwc.edu",
          "Member 1 Roll No": "21CS001",
          "Member 1 Phone": "9876543210",
          "Member 1 Gender": "Male",
          "Member 1 Residence": "Hosteller",
          "Member 2 Name": "Sarah Connor",
          "Member 2 Email": "sarah.c@cwc.edu",
          "Member 2 Roll No": "21CS002",
          "Member 2 Phone": "9876543211",
          "Member 2 Gender": "Female",
          "Member 2 Residence": "DayScholar",
          "Member 3 Name": "Bruce Wayne",
          "Member 3 Email": "bruce.w@cwc.edu",
          "Member 3 Roll No": "21CS003",
          "Member 3 Phone": "9876543212",
          "Member 3 Gender": "Male",
          "Member 3 Residence": "Hosteller",
          "Member 4 Name": "Diana Prince",
          "Member 4 Email": "diana.p@cwc.edu",
          "Member 4 Roll No": "21CS004",
          "Member 4 Phone": "9876543213",
          "Member 4 Gender": "Female",
          "Member 4 Residence": "DayScholar"
        }
      ];

      const worksheet = XLSX.utils.json_to_sheet(sampleData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Teams Import Template");
      XLSX.writeFile(workbook, "CWC_Season4_Teams_Import_Template.xlsx");
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
        const jsonRows = XLSX.utils.sheet_to_json(worksheet);
        setParsedRows(jsonRows);
      } catch (err) {
        setErrorMsg('Failed to parse Excel file. Please ensure it is a valid .xlsx or .csv document.');
        setParsedRows([]);
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

  const handleUploadSubmit = async () => {
    if (!selectedFile || parsedRows.length === 0) {
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
      setParsedRows([]);
      onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload teams.';
      setErrorMsg(msg);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-[#18122B] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-carnival-cyan/40 max-w-2xl w-full shadow-2xl space-y-6 relative max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/20 text-cyan-700 dark:text-carnival-cyan border border-cyan-500/30">
              <FileSpreadsheet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Excel Batch Team Import
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload single or multiple teams via Excel sheet to create approved team tickets
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

        {/* Action Banner: Download Template */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
              <FileText className="w-4 h-4 text-amber-500 dark:text-carnival-gold" />
              <span>Need the Standard Format Excel Sheet?</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Download the official template with pre-configured column headers for 4 team members.
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

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 text-xs font-mono flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-700 dark:text-rose-300 text-xs font-mono flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Drag & Drop File Container */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
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

          {selectedFile ? (
            <div className="space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-cyan-600 dark:text-carnival-cyan mx-auto" />
              <div className="font-extrabold text-slate-900 dark:text-white text-sm font-mono">{selectedFile.name}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {(selectedFile.size / 1024).toFixed(1)} KB • {parsedRows.length} team row(s) detected
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <UploadCloud className="w-10 h-10 text-cyan-600 dark:text-carnival-cyan mx-auto" />
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">
                Drag and drop your Excel sheet here, or click to browse
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Supports .xlsx, .xls, and .csv format
              </div>
            </div>
          )}
        </div>

        {/* Parsed Rows Preview */}
        {parsedRows.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Detected Teams Preview ({parsedRows.length})</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-[11px]">Will be created as Approved</span>
            </div>
            <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10 divide-y divide-slate-200 dark:divide-white/5 font-mono text-xs">
              {parsedRows.slice(0, 10).map((row, i) => (
                <div key={i} className="p-2.5 flex items-center justify-between bg-slate-50 dark:bg-white/5">
                  <span className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                    {row['Team Name'] || row['teamName'] || row['Team'] || `Row #${i + 1}`}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Leader: {row['Member 1 Name (Leader)'] || row['Member 1 Name'] || row['m1_name'] || 'Leader'}
                  </span>
                </div>
              ))}
              {parsedRows.length > 10 && (
                <div className="p-2 text-center text-slate-500 text-[11px] italic">
                  + {parsedRows.length - 10} more rows...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modal Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-white/10 cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleUploadSubmit}
            disabled={isUploading || !selectedFile || parsedRows.length === 0}
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
                <span>Create Approved Teams ({parsedRows.length})</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
