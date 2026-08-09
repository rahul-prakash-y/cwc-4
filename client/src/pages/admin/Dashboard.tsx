import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Users, CheckCircle2, XCircle, FileCode, Megaphone, Zap, Sparkles, TrendingUp, Mail, RefreshCw } from 'lucide-react';
import { DailyProgressionChart } from '../../components/admin/DailyProgressionChart';
import { triggerCarnivalConfetti } from '../../components/hero/ConfettiEffect';
import { useAuth } from '../../context/AuthContext';

export const Dashboard: React.FC = () => {
  const { apiFetch } = useAuth();
  const [announcementText, setAnnouncementText] = useState('');
  const [sendEmailAlert, setSendEmailAlert] = useState(true);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastLog, setBroadcastLog] = useState<string[]>([
    '🎪 Ringmaster Notice: Day 5 Arena Boss Fight is officially LIVE!',
    '⚡ Power-Up Granted: Cyber Circus Kings unlocked 2x Multiplier Card.',
    '🛡️ Immunity Activated: High Wire Hackers deployed Safety Shield.',
  ]);

  // Live Database Stats State
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [statsData, setStatsData] = useState<{
    cards: {
      totalTeams: number;
      totalParticipants: number;
      qualifiedTeams: number;
      eliminatedTeams: number;
      todaySubmissions: number;
      totalSubmissions: number;
      evaluatedSubmissions: number;
      evaluationPercentage: number;
    };
    progressionChart: {
      labels: string[];
      datasets: any[];
    };
  } | null>(null);

  const fetchOverviewStats = async () => {
    setStatsLoading(true);
    try {
      const res = await apiFetch('/admin/overview-stats');
      if (res.ok) {
        const data = await res.json();
        setStatsData(data);
      }
    } catch (e) {
      console.error('Failed to fetch overview DB stats:', e);
    } finally {
      setStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverviewStats();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setIsBroadcasting(true);
    const textToBroadcast = announcementText.trim();
    const shouldEmail = sendEmailAlert;

    try {
      const res = await apiFetch('/admin/announcements', {
        method: 'POST',
        body: JSON.stringify({
          message: textToBroadcast,
          sendEmailAlert: shouldEmail,
        }),
      });

      if (res.ok) {
        setBroadcastLog([
          `📢 ${textToBroadcast}${shouldEmail ? ' 📧 (Email Alert Dispatched)' : ''}`,
          ...broadcastLog,
        ]);
        setAnnouncementText('');
        setSendEmailAlert(true);
        triggerCarnivalConfetti();
      }
    } catch (err) {
      console.error('Failed to broadcast announcement:', err);
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-[#18122B] border border-slate-200 dark:border-carnival-crimson/40 shadow-lg dark:shadow-neon-crimson relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 dark:bg-carnival-crimson/20 text-rose-700 dark:text-carnival-crimson text-xs font-mono font-bold border border-rose-500/30 dark:border-carnival-crimson/30">
            <Crown className="w-4 h-4 text-amber-500 dark:text-carnival-gold animate-bounce" />
            <span>RINGMASTER COMMAND CENTER</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white">
            CWC Season 4 <span className="text-gradient-carnival">Admin Overview</span>
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm max-w-2xl">
            Live arena telemetry of registered teams, qualification metrics, daily point progression, and broadcast control.
          </p>
        </div>

        <button
          onClick={triggerCarnivalConfetti}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 dark:from-carnival-gold dark:to-carnival-amber text-slate-950 font-black text-sm shadow-md dark:shadow-neon-gold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Pop Global Celebration 🎊</span>
        </button>
      </div>

      {/* DB-Driven Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Registered Teams */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-[#18122B] p-6 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-cyan-500/50 dark:hover:border-carnival-cyan/50 transition-all shadow-sm dark:shadow-lg relative overflow-hidden group"
        >
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-cyan-500/10 dark:bg-carnival-cyan/10 rounded-full blur-xl group-hover:bg-cyan-500/20 dark:group-hover:bg-carnival-cyan/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider font-bold">Registered Teams</span>
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-carnival-cyan/10 text-cyan-700 dark:text-carnival-cyan border border-cyan-200 dark:border-carnival-cyan/30">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono flex items-center gap-2">
            {statsLoading ? <RefreshCw className="w-6 h-6 animate-spin text-cyan-500" /> : `${statsData?.cards?.totalTeams ?? 0} Teams`}
          </div>
          <div className="text-xs text-cyan-700 dark:text-carnival-cyan mt-2 font-mono flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-500 dark:bg-carnival-cyan animate-pulse" />
            <span>{statsData?.cards?.totalParticipants ?? 0} Total Participants</span>
          </div>
        </motion.div>

        {/* Card 2: Qualified Teams */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-[#18122B] p-6 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-all shadow-sm dark:shadow-lg relative overflow-hidden group"
        >
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider font-bold">Qualified Teams</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono flex items-center gap-2">
            {statsLoading ? <RefreshCw className="w-6 h-6 animate-spin text-emerald-500" /> : `${statsData?.cards?.qualifiedTeams ?? 0} Teams`}
          </div>
          <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-2 font-mono flex items-center gap-1 font-semibold">
            <span>✓ Safe & Advancing</span>
          </div>
        </motion.div>

        {/* Card 3: Eliminated Teams */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-[#18122B] p-6 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-rose-500/50 transition-all shadow-sm dark:shadow-lg relative overflow-hidden group"
        >
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider font-bold">Eliminated Teams</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-rose-600 dark:text-rose-400 font-mono flex items-center gap-2">
            {statsLoading ? <RefreshCw className="w-6 h-6 animate-spin text-rose-500" /> : `${statsData?.cards?.eliminatedTeams ?? 0} Teams`}
          </div>
          <div className="text-xs text-rose-700 dark:text-rose-400/80 mt-2 font-mono flex items-center gap-1 font-semibold">
            <span>⚠️ Evicted from Arena</span>
          </div>
        </motion.div>

        {/* Card 4: Submissions Metric */}
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-white dark:bg-[#18122B] p-6 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-amber-500/50 dark:hover:border-carnival-gold/50 transition-all shadow-sm dark:shadow-lg relative overflow-hidden group"
        >
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-amber-500/10 dark:bg-carnival-gold/10 rounded-full blur-xl group-hover:bg-amber-500/20 dark:group-hover:bg-carnival-gold/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider font-bold">Today's Submissions</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-carnival-gold/10 text-amber-700 dark:text-carnival-gold border border-amber-200 dark:border-carnival-gold/30">
              <FileCode className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white font-mono flex items-center gap-2">
            {statsLoading ? <RefreshCw className="w-6 h-6 animate-spin text-amber-500" /> : `${statsData?.cards?.todaySubmissions ?? 0} Submissions`}
          </div>
          <div className="text-xs text-amber-700 dark:text-carnival-gold mt-2 font-mono flex items-center gap-1 font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>{statsData?.cards?.evaluationPercentage ?? 100}% Evaluated ({statsData?.cards?.totalSubmissions ?? 0} Total)</span>
          </div>
        </motion.div>
      </div>

      {/* Chart Section: DB-Driven Line Chart */}
      <div className="bg-white dark:bg-[#18122B] p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10">
          <div>
            <h3 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2 font-mono">
              <TrendingUp className="w-5 h-5 text-amber-600 dark:text-carnival-gold" />
              Daily Point Progression Analytics
            </h3>
            <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Live line chart of accumulated points across 10 Days from database score records.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={fetchOverviewStats}
              disabled={statsLoading}
              className="px-3 py-1 rounded-full bg-amber-500/10 dark:bg-carnival-gold/10 text-amber-700 dark:text-carnival-gold border border-amber-300 dark:border-carnival-gold/30 font-bold flex items-center gap-1.5 hover:brightness-110 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${statsLoading ? 'animate-spin' : ''}`} />
              <span>Live Sync DB</span>
            </button>
          </div>
        </div>

        {statsLoading ? (
          <div className="w-full h-[360px] flex items-center justify-center font-mono text-xs text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin text-amber-500 mr-2" />
            <span>Fetching DB progression telemetry...</span>
          </div>
        ) : (
          <DailyProgressionChart chartData={statsData?.progressionChart} />
        )}
      </div>

      {/* Broadcast System & Feed */}
      <div className="bg-white dark:bg-[#18122B] p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl space-y-4">
        <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-amber-600 dark:text-carnival-gold" />
          Broadcast Live Carnival Announcement
        </h3>

        <form onSubmit={handleBroadcast} className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              required
              placeholder="Type live announcement for student dashboards..."
              value={announcementText}
              onChange={(e) => setAnnouncementText(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 text-sm text-slate-900 dark:text-white border border-slate-300 dark:border-white/10 focus:border-amber-500 dark:focus:border-carnival-gold focus:outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 font-mono"
            />
            <button
              type="submit"
              disabled={isBroadcasting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 dark:from-carnival-gold dark:to-carnival-amber text-slate-950 font-black text-sm shadow-md dark:shadow-neon-gold hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Megaphone className="w-4 h-4 text-slate-950" />
              <span>{isBroadcasting ? 'Broadcasting...' : 'Broadcast Now'}</span>
            </button>
          </div>

          <label className="flex items-center gap-2 cursor-pointer self-start group pt-1">
            <input
              type="checkbox"
              checked={sendEmailAlert}
              onChange={(e) => setSendEmailAlert(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/10 text-amber-600 dark:text-carnival-gold focus:ring-amber-500 dark:focus:ring-carnival-gold accent-amber-500 dark:accent-carnival-gold cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 group-hover:text-amber-600 dark:group-hover:text-carnival-gold transition-colors flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-amber-600 dark:text-carnival-gold" />
              Send Email Broadcast to All Students & Team Members 📧
            </span>
          </label>
        </form>

        <div className="space-y-2 pt-2">
          <div className="text-xs font-mono text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Recent Broadcast Feed:</div>
          {broadcastLog.map((log, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-100 dark:bg-black/40 text-xs font-mono text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-white/5 flex items-center justify-between">
              <span>{log}</span>
              <span className="text-[10px] text-slate-500 font-sans">Just now</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
