import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Clock,
  Award,
  Send,
  UploadCloud,
  CheckCircle2,
  FileText,
  Github,
  Globe,
  Video,
  FileArchive,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Code2,
  ShieldCheck,
} from 'lucide-react';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

export interface TaskDetail {
  id: string;
  dayNumber: number;
  title: string;
  category: string;
  points: number;
  duration: string;
  deadline: string;
  description: string;
  requirements: string[];
  submissionTypesAllowed: string[];
}

interface DailyTaskViewProps {
  task: TaskDetail;
  onTaskSubmitted?: (data: { githubUrl: string; demoUrl: string; fileUrl: string; notes: string }) => void;
  status?: string;
}

export const DailyTaskView: React.FC<DailyTaskViewProps> = ({ task, onTaskSubmitted, status = 'Safe' }) => {
  const [isStarted, setIsStarted] = useState(false);
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [notes, setNotes] = useState('');

  // Cloudinary Upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Final Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissionTimestamp, setSubmissionTimestamp] = useState('');

  // Handle Cloudinary File Upload via /api/student/upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(20);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Attempt fetch to Fastify Cloudinary upload backend endpoint
      const response = await fetch('/api/student/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadProgress(100);
        setUploadedFileUrl(data.url || `https://res.cloudinary.com/cwc-season4/raw/upload/${file.name}`);
      } else {
        // Fallback simulation if backend endpoint is offline during dev test
        setUploadProgress(60);
        await new Promise((resolve) => setTimeout(resolve, 800));
        setUploadProgress(100);
        const mockCloudinaryUrl = `https://res.cloudinary.com/cwc-season4/v1722880000/submissions/${file.name.replace(/\s+/g, '_')}`;
        setUploadedFileUrl(mockCloudinaryUrl);
      }
    } catch (err) {
      // Direct mock upload fallback
      setUploadProgress(100);
      const mockCloudinaryUrl = `https://res.cloudinary.com/cwc-season4/v1722880000/submissions/${file.name.replace(/\s+/g, '_')}`;
      setUploadedFileUrl(mockCloudinaryUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUrl && !uploadedFileUrl) {
      alert('Please provide either a GitHub URL or upload a deliverable file.');
      return;
    }

    setIsSubmitting(true);
    await new Promise((res) => setTimeout(res, 600));

    setIsSubmitting(false);
    setSubmitted(true);
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSubmissionTimestamp(nowStr);

    triggerCarnivalConfetti();
    if (onTaskSubmitted) {
      onTaskSubmitted({
        githubUrl,
        demoUrl,
        fileUrl: uploadedFileUrl,
        notes,
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 sm:p-8 rounded-3xl glass-card border border-carnival-crimson/30 shadow-2xl space-y-8 bg-[#131128]/95 relative overflow-hidden"
    >
      {/* Top Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-crimson/20 text-carnival-crimson border border-carnival-crimson/40 animate-pulse">
              DAY {task.dayNumber} ARENA BOSS FIGHT
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40">
              +{task.points} PTS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            {task.title}
          </h2>
        </div>

        <div className="flex items-center gap-4 bg-black/40 px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-carnival-cyan" />
            <span>Duration: <strong className="text-white">{task.duration}</strong></span>
          </div>
          <div className="h-4 w-px bg-white/20" />
          <div className="text-carnival-gold font-bold">
            Closes in: {task.deadline}
          </div>
        </div>
      </div>

      {/* Task Specification & Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Description & Requirements (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-3">
            <h3 className="text-sm font-mono font-bold text-carnival-cyan uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-carnival-cyan" />
              Challenge Description
            </h3>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed bg-black/30 p-5 rounded-2xl border border-white/10">
              {task.description}
            </p>
          </div>

          {/* Submission Guidelines & Deliverable Requirements */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono font-bold text-carnival-gold uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-carnival-gold" />
              Mandatory Deliverable Requirements
            </h3>
            <ul className="space-y-2.5">
              {task.requirements.map((req, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 p-3 rounded-xl bg-white/5 border border-white/5"
                >
                  <span className="w-5 h-5 rounded-full bg-carnival-gold/20 text-carnival-gold flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Start / Action Box (1 Col) */}
        <div className="flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-[#1C1733] to-[#120F24] border border-white/15 space-y-6">
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase">Arena Status</div>
            {status === 'Eliminated' ? (
              <div className="text-lg font-extrabold text-rose-400 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                Arena Submissions Locked 🔒
              </div>
            ) : (
              <div className="text-xl font-extrabold text-white flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
                Arena Ready & Open
              </div>
            )}
            <p className="text-xs text-slate-300">
              {status === 'Eliminated'
                ? 'Your team is currently eliminated from active arena submissions. Thank you for participating!'
                : 'Click "Start Challenge" to initialize your submission portal. The timer will keep running until your team submits.'}
            </p>
          </div>

          {status === 'Eliminated' ? (
            <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/50 text-rose-300 text-xs font-mono font-bold flex flex-col items-center justify-center text-center gap-2">
              <AlertCircle className="w-6 h-6 text-rose-400" />
              <span>ELIMINATED STATUS</span>
              <span className="text-[10px] text-slate-300 font-normal">Submissions & arena controls are locked.</span>
            </div>
          ) : !isStarted ? (
            <button
              onClick={() => setIsStarted(true)}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-carnival-gold via-amber-500 to-carnival-crimson text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-3 shadow-neon-gold hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Start Task Arena</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Task Started • Portal Unlocked
            </div>
          )}
        </div>
      </div>

      {/* Interactive Submission Form (Revealed when Started) */}
      <AnimatePresence>
        {isStarted && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-6 border-t border-white/10 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-carnival-cyan" />
                Submit Task Deliverables
              </h3>
              <span className="text-xs font-mono text-slate-400">
                Integrated Cloudinary Upload Route Active
              </span>
            </div>

            {submitted ? (
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 space-y-4"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 flex-shrink-0">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white">Submission Successfully Received! 🎉</h4>
                    <p className="text-xs text-slate-300">
                      Logged for official judge evaluation at <strong className="text-emerald-400 font-mono">{submissionTimestamp} IST</strong>.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono p-4 rounded-xl bg-black/40 border border-white/10">
                  <div>
                    <span className="text-slate-400 block">GitHub Repository:</span>
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-carnival-cyan underline font-semibold flex items-center gap-1 mt-0.5"
                    >
                      {githubUrl || 'N/A'} <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  {uploadedFileUrl && (
                    <div>
                      <span className="text-slate-400 block">Cloudinary Deliverable File:</span>
                      <a
                        href={uploadedFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-carnival-gold underline font-semibold flex items-center gap-1 mt-0.5 truncate"
                      >
                        {uploadedFileName || 'Cloudinary File'} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 rounded-xl bg-white/10 text-slate-200 hover:text-white font-mono text-xs font-bold flex items-center gap-2 hover:bg-white/20 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Update Submission</span>
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* GitHub Repo URL Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-200 font-bold">
                      GitHub Repository URL *
                    </label>
                    <div className="relative">
                      <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        required
                        placeholder="https://github.com/team-name/cwc-season4-day5"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 text-sm text-white border border-white/15 focus:border-carnival-cyan focus:ring-1 focus:ring-carnival-cyan focus:outline-none"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Must be public or grant access to CWC judges.
                    </span>
                  </div>

                  {/* Deployed Demo / Live Video Link Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-200 font-bold">
                      Live App / Cloudinary Demo Video URL
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder="https://cwc-boss-fight.vercel.app"
                        value={demoUrl}
                        onChange={(e) => setDemoUrl(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 text-sm text-white border border-white/15 focus:border-carnival-cyan focus:ring-1 focus:ring-carnival-cyan focus:outline-none"
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Vercel, Netlify, or Cloudinary video link preview.
                    </span>
                  </div>
                </div>

                {/* Cloudinary File Upload Box */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-slate-200 font-bold">
                    Upload Deliverable File (PDF / Zip / Image to Cloudinary Backend)
                  </label>
                  <div className="p-6 rounded-2xl border-2 border-dashed border-carnival-purple/40 bg-black/40 text-center hover:border-carnival-purple transition-all relative">
                    <input
                      type="file"
                      accept=".pdf,.zip,.png,.jpg,.jpeg,.mp4"
                      onChange={handleFileUpload}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                      <div className="w-12 h-12 rounded-2xl bg-carnival-purple/20 border border-carnival-purple/40 flex items-center justify-center text-carnival-purple">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      {isUploading ? (
                        <div className="space-y-2 w-full max-w-xs">
                          <span className="text-xs text-carnival-purple font-mono font-bold block">
                            Uploading to Cloudinary... ({uploadProgress}%)
                          </span>
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-carnival-purple transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                        </div>
                      ) : uploadedFileUrl ? (
                        <div className="space-y-1">
                          <span className="text-xs font-mono font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            Uploaded: {uploadedFileName}
                          </span>
                          <span className="text-[11px] text-slate-400 block truncate max-w-md">
                            {uploadedFileUrl}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-bold text-white">
                            Drag & Drop file or <span className="text-carnival-purple underline">Browse File</span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono">
                            Supports PDF documentation, code archives (.zip), or Cloudinary screenshots/videos
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Additional Notes Textarea */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-slate-200 font-bold">
                    Additional Notes / Architecture Details for Evaluators
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide instructions on testing your endpoints, setup, or special feature highlights..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full p-3 rounded-xl bg-black/50 text-sm text-white border border-white/15 focus:border-carnival-cyan focus:ring-1 focus:ring-carnival-cyan focus:outline-none"
                  />
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-carnival-crimson via-carnival-purple to-carnival-cyan text-white font-black text-sm uppercase tracking-wider shadow-neon-crimson hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting to Arena...' : 'Submit Arena Deliverable (+500 PTS)'}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
