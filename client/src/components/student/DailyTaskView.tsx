import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Clock,
  Award,
  Send,
  UploadCloud,
  CheckCircle2,
  Github,
  Globe,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Code2,
  ShieldCheck,
  Save,
  FileText,
} from 'lucide-react';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';
import { useDraftSave } from '../../hooks/useDraftSave';
import { useJitterSubmit } from '../../hooks/useJitterSubmit';
import { AdvantageAction } from './AdvantageAction';
import { InteractiveTask, TaskType, TestCase } from './InteractiveTask';

export interface TaskDetail {
  id: string;
  dayNumber: number;
  title: string;
  category: string;
  type?: TaskType;
  points: number;
  duration: string;
  startTime: string;
  endTime: string;
  deadline: string;
  description: string;
  constraints?: string[];
  requirements: string[];
  submissionTypesAllowed?: string[];
  mcqOptions?: string[];
  interactiveTimeLimit?: number;
  testCases?: TestCase[];
}

interface DailyTaskViewProps {
  task: TaskDetail;
  onTaskSubmitted?: (data: any) => void;
  status?: string;
}

export const DailyTaskView: React.FC<DailyTaskViewProps> = ({ task, onTaskSubmitted, status = 'Safe' }) => {
  const [isStarted, setIsStarted] = useState(false);

  // Hook 1: Draft Saving (auto 30s + localStorage)
  const { draft, updateDraft, lastSavedTime, isSaving } = useDraftSave(task.id, {
    codeResponse: '',
    githubUrl: '',
    fileUrl: '',
    notes: '',
  });

  // Hook 2: Jitter Submission (0-5000ms delay for Render free tier protection)
  const { submitWithJitter, isSubmitting, jitterDelay, submitSuccess } = useJitterSubmit();

  // Cloudinary Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  // Submission Timestamp State
  const [submissionTimestamp, setSubmissionTimestamp] = useState('');

  // Handle Cloudinary Upload via /api/student/upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(25);
    setUploadedFileName(file.name);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/student/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setUploadProgress(100);
        updateDraft({ fileUrl: data.url || `https://res.cloudinary.com/cwc-season4/raw/upload/${file.name}` });
      } else {
        setUploadProgress(70);
        await new Promise((res) => setTimeout(res, 600));
        setUploadProgress(100);
        const mockUrl = `https://res.cloudinary.com/cwc-season4/v1722880000/submissions/${file.name.replace(/\s+/g, '_')}`;
        updateDraft({ fileUrl: mockUrl });
      }
    } catch (err) {
      setUploadProgress(100);
      const mockUrl = `https://res.cloudinary.com/cwc-season4/v1722880000/submissions/${file.name.replace(/\s+/g, '_')}`;
      updateDraft({ fileUrl: mockUrl });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!draft.codeResponse && !draft.githubUrl && !draft.fileUrl) {
      alert('Please provide a Code response, GitHub repository link, or upload a deliverable file.');
      return;
    }

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setSubmissionTimestamp(nowStr);

    await submitWithJitter({
      taskId: task.id,
      codeResponse: draft.codeResponse,
      githubUrl: draft.githubUrl,
      fileUrl: draft.fileUrl,
      notes: draft.notes,
    }, (resData) => {
      triggerCarnivalConfetti();
      if (onTaskSubmitted) {
        onTaskSubmitted({ ...draft, ...resData });
      }
    });
  };

  // Render markdown line breaks & bold formatting
  const renderMarkdownDescription = (text: string) => {
    return text.split('\n\n').map((paragraph, pIdx) => (
      <p key={pIdx} className="text-slate-200 text-sm sm:text-base leading-relaxed mb-3">
        {paragraph.split('**').map((chunk, cIdx) =>
          cIdx % 2 === 1 ? (
            <strong key={cIdx} className="text-carnival-gold font-bold">
              {chunk}
            </strong>
          ) : (
            chunk
          )
        )}
      </p>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 sm:p-8 rounded-3xl glass-card border border-carnival-crimson/30 shadow-2xl space-y-8 bg-[#131128]/95 relative overflow-hidden"
    >
      {/* Top Header & Metadata */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-crimson/20 text-carnival-crimson border border-carnival-crimson/40 animate-pulse">
              DAY {task.dayNumber} ARENA TASK
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/40">
              Point Weight: +{task.points} PTS
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
            {task.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-4 bg-black/40 px-4 py-2.5 rounded-2xl border border-white/10 text-xs font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock className="w-4 h-4 text-carnival-cyan" />
            <span>Duration: <strong className="text-white">{task.duration}</strong></span>
          </div>
          <div className="h-4 w-px bg-white/20 hidden sm:block" />
          <div className="text-slate-300">
            Window: <strong className="text-white">{task.startTime} - {task.endTime}</strong>
          </div>
        </div>
      </div>

      {/* Grid: Markdown Problem Statement & Constraints */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Markdown Problem Statement & Requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Markdown Problem Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-mono font-bold text-carnival-cyan uppercase tracking-wider flex items-center gap-2">
              <Code2 className="w-4 h-4 text-carnival-cyan" />
              Markdown Problem Statement
            </h3>
            <div className="bg-black/40 p-5 rounded-2xl border border-white/10 space-y-2">
              {renderMarkdownDescription(task.description)}
            </div>
          </div>

          {/* Constraints & Requirements */}
          {task.constraints && task.constraints.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-mono font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-400" />
                Task Constraints
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {task.constraints.map((c, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-orange-950/20 border border-orange-500/30 text-xs text-orange-200 font-mono flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-orange-400" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-mono font-bold text-carnival-gold uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-carnival-gold" />
              Evaluation Guidelines
            </h3>
            <ul className="space-y-2">
              {task.requirements.map((req, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 p-2.5 rounded-xl bg-white/5 border border-white/5">
                  <span className="w-5 h-5 rounded-full bg-carnival-gold/20 text-carnival-gold font-mono font-bold flex items-center justify-center text-[10px]">
                    {idx + 1}
                  </span>
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Arena Control Card & Draft Indicator */}
        <div className="flex flex-col justify-between p-6 rounded-2xl bg-gradient-to-b from-[#1C1733] to-[#120F24] border border-white/15 space-y-6">
          <div className="space-y-4">
            <div className="text-xs font-mono font-bold text-slate-400 uppercase">Arena Portal Status</div>

            {status === 'Eliminated' ? (
              <div className="p-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold text-center">
                🔒 ELIMINATED STATUS • SUBMISSIONS LOCKED
              </div>
            ) : !isStarted ? (
              <button
                onClick={() => setIsStarted(true)}
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-carnival-gold via-amber-500 to-carnival-crimson text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-neon-gold hover:scale-[1.02] active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>Initialize Task Portal</span>
              </button>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Portal Active & Unlocked</span>
              </div>
            )}

            {/* Auto-Draft Saving Status Pills */}
            <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1.5 font-mono text-[11px]">
              <div className="flex items-center justify-between text-slate-300 font-bold">
                <span className="flex items-center gap-1.5 text-carnival-cyan">
                  <Save className="w-3.5 h-3.5 text-carnival-cyan" /> Auto-Draft Sync
                </span>
                {isSaving ? (
                  <span className="text-carnival-gold animate-pulse">Syncing...</span>
                ) : (
                  <span className="text-emerald-400">Active (30s)</span>
                )}
              </div>
              <div className="text-slate-400 text-[10px]">
                {lastSavedTime ? `Last saved at: ${lastSavedTime}` : 'Saving changes automatically to localStorage & API...'}
              </div>
            </div>

            {/* Task 3: Apply Advantage Menu Component */}
            {status !== 'Eliminated' && (
              <AdvantageAction taskId={task.id} />
            )}
          </div>
        </div>
      </div>

      {/* Interactive Task Widget Renderer (MCQ, Rapid Fire, Code Completion, Treasure Hunt, Puzzle) */}
      {task.type &&
        ['MCQ', 'Rapid Fire', 'Code Completion', 'Output Prediction', 'Treasure Hunt', 'Puzzle'].includes(task.type) && (
          <div className="pt-4 border-t border-white/10">
            <InteractiveTask
              id={task.id}
              title={task.title}
              description={task.description}
              type={task.type}
              points={task.points}
              mcqOptions={task.mcqOptions}
              interactiveTimeLimit={task.interactiveTimeLimit}
              testCases={task.testCases}
              status={status}
              onSuccessSubmitted={onTaskSubmitted}
            />
          </div>
        )}

      {/* Code & Submission Input Form */}
      <AnimatePresence>
        {(isStarted || draft.codeResponse || draft.githubUrl) && status !== 'Eliminated' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="pt-6 border-t border-white/10 space-y-6"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-carnival-cyan" />
                Code & Answer Deliverables Area
              </h3>
              <span className="text-xs font-mono text-carnival-gold">
                Render Jitter Protection Enabled ⚡
              </span>
            </div>

            {submitSuccess ? (
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
                    <h4 className="text-lg font-bold text-white">Deliverable Submitted Successfully! 🎉</h4>
                    <p className="text-xs text-slate-300">
                      Logged into evaluation server at <strong className="text-emerald-400 font-mono">{submissionTimestamp} IST</strong>.
                    </p>
                    {jitterDelay !== null && (
                      <p className="text-[11px] font-mono text-carnival-cyan">
                        ⚡ Applied client-side jitter delay: {jitterDelay}ms (Render Free-Tier Server Shielded).
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono p-4 rounded-xl bg-black/40 border border-white/10">
                  <div>
                    <span className="text-slate-400 block">GitHub Repo:</span>
                    <span className="text-carnival-cyan font-semibold">{draft.githubUrl || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Cloudinary Deliverable:</span>
                    <span className="text-carnival-gold font-semibold">{draft.fileUrl || 'N/A'}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Text/Code Response Textarea */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono text-slate-200 font-bold">
                    Text / Code Response Input Area
                  </label>
                  <textarea
                    rows={6}
                    placeholder="// Type or paste your code snippet, solution explanation, or text response here..."
                    value={draft.codeResponse || ''}
                    onChange={(e) => updateDraft({ codeResponse: e.target.value })}
                    className="w-full p-4 rounded-2xl bg-black/60 font-mono text-xs sm:text-sm text-emerald-300 border border-white/15 focus:border-carnival-cyan focus:ring-1 focus:ring-carnival-cyan focus:outline-none leading-relaxed"
                  />
                </div>

                {/* Form Fields: GitHub URL & Demo URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-200 font-bold">
                      GitHub Repository URL
                    </label>
                    <div className="relative">
                      <Github className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="url"
                        placeholder="https://github.com/your-team/cwc-season4-task"
                        value={draft.githubUrl || ''}
                        onChange={(e) => updateDraft({ githubUrl: e.target.value })}
                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/50 text-sm text-white border border-white/15 focus:border-carnival-cyan focus:ring-1 focus:ring-carnival-cyan focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Cloudinary File Upload Form */}
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-200 font-bold">
                      Cloudinary File Upload (PDF / Screenshots / Video)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.zip,.png,.jpg,.jpeg,.mp4"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full px-4 py-3 rounded-xl bg-black/50 text-xs text-slate-300 border border-white/15 flex items-center justify-between">
                        <span>{isUploading ? `Uploading... (${uploadProgress}%)` : draft.fileUrl ? `Uploaded: ${uploadedFileName || 'Cloudinary File'}` : 'Click to Upload PDF/Screenshot to Cloudinary API'}</span>
                        <UploadCloud className="w-4 h-4 text-carnival-purple" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Action Button with Jitter Info */}
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-carnival-crimson via-carnival-purple to-carnival-cyan text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-neon-crimson hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-carnival-gold" />
                      <span>Auto-Submitting with Jitter Delay ({jitterDelay}ms)...</span>
                    </>
                  ) : (
                    <span>Submit Arena Task Deliverable (+{task.points} PTS)</span>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
