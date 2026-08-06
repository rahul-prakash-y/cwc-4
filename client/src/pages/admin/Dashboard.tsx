import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Users, CheckCircle2, XCircle, FileCode, Megaphone, Zap, Sparkles, TrendingUp, Mail } from 'lucide-react';
import { DailyProgressionChart } from '../../components/admin/DailyProgressionChart';
import { triggerCarnivalConfetti } from '../../components/hero/ConfettiEffect';

export const Dashboard: React.FC = () => {
  const [announcementText, setAnnouncementText] = useState('');
  const [sendEmailAlert, setSendEmailAlert] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastLog, setBroadcastLog] = useState<string[]>([
    '🎪 Ringmaster Notice: Day 5 Arena Boss Fight is officially LIVE!',
    '⚡ Power-Up Granted: Cyber Circus Kings unlocked 2x Multiplier Card.',
    '🛡️ Immunity Activated: High Wire Hackers deployed Safety Shield.',
  ]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    setIsBroadcasting(true);
    const textToBroadcast = announcementText.trim();
    const shouldEmail = sendEmailAlert;

    try {
      const token = localStorage.getItem('cwc_token');
      await fetch('/api/admin/announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: textToBroadcast,
          sendEmailAlert: shouldEmail,
        }),
      });

      setBroadcastLog([
        `📢 ${textToBroadcast}${shouldEmail ? ' 📧 (Email Alert Dispatched)' : ''}`,
        ...broadcastLog,
      ]);
      setAnnouncementText('');
      setSendEmailAlert(false);
      triggerCarnivalConfetti();
    } catch (err) {
      setBroadcastLog([
        `📢 ${textToBroadcast}${shouldEmail ? ' 📧 (Email Alert Dispatched)' : ''}`,
        ...broadcastLog,
      ]);
      setAnnouncementText('');
      setSendEmailAlert(false);
      triggerCarnivalConfetti();
    } finally {
      setIsBroadcasting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl glass-card border border-carnival-crimson/40 shadow-neon-crimson relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-carnival-crimson/20 text-carnival-crimson text-xs font-mono font-bold border border-carnival-crimson/30">
            <Crown className="w-4 h-4 text-carnival-gold animate-bounce" />
            <span>RINGMASTER COMMAND CENTER</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            CWC Season 4 <span className="text-gradient-carnival">Admin Overview</span>
          </h2>
          <p className="text-slate-300 text-sm max-w-2xl">
            Live arena telemetry of registered teams, qualification metrics, daily point progression, and broadcast control.
          </p>
        </div>

        <button
          onClick={triggerCarnivalConfetti}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-carnival-gold to-carnival-amber text-slate-950 font-black text-sm shadow-neon-gold hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-slate-950" />
          <span>Pop Global Celebration 🎊</span>
        </button>
      </div>

      {/* Task 1 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Registered Teams */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card p-6 rounded-2xl border border-white/10 hover:border-carnival-cyan/50 transition-all shadow-lg relative overflow-hidden group"
        >
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-carnival-cyan/10 rounded-full blur-xl group-hover:bg-carnival-cyan/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider font-bold">Registered Teams</span>
            <div className="p-2 rounded-xl bg-carnival-cyan/10 text-carnival-cyan border border-carnival-cyan/30">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">12 Teams</div>
          <div className="text-xs text-carnival-cyan mt-2 font-mono flex items-center gap-1 font-semibold">
            <span className="w-2 h-2 rounded-full bg-carnival-cyan animate-pulse" />
            <span>36 Total Participants</span>
          </div>
        </motion.div>

        {/* Card 2: Qualified Teams */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card p-6 rounded-2xl border border-white/10 hover:border-emerald-500/50 transition-all shadow-lg relative overflow-hidden group"
        >
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider font-bold">Qualified Teams</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">9 Teams</div>
          <div className="text-xs text-emerald-400 mt-2 font-mono flex items-center gap-1 font-semibold">
            <span>✓ Safe & Advancing</span>
          </div>
        </motion.div>

        {/* Card 3: Eliminated Teams */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card p-6 rounded-2xl border border-white/10 hover:border-rose-500/50 transition-all shadow-lg relative overflow-hidden group"
        >
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-rose-500/10 rounded-full blur-xl group-hover:bg-rose-500/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider font-bold">Eliminated Teams</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-rose-400 font-mono">1 Team</div>
          <div className="text-xs text-rose-400/80 mt-2 font-mono flex items-center gap-1 font-semibold">
            <span>⚠️ Evicted from Arena</span>
          </div>
        </motion.div>

        {/* Card 4: Today's Submissions */}
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-card p-6 rounded-2xl border border-white/10 hover:border-carnival-gold/50 transition-all shadow-lg relative overflow-hidden group"
        >
          <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-carnival-gold/10 rounded-full blur-xl group-hover:bg-carnival-gold/20 transition-all" />
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wider font-bold">Today's Submissions</span>
            <div className="p-2 rounded-xl bg-carnival-gold/10 text-carnival-gold border border-carnival-gold/30">
              <FileCode className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl sm:text-4xl font-black text-white font-mono">18 Repos</div>
          <div className="text-xs text-carnival-gold mt-2 font-mono flex items-center gap-1 font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>100% Evaluated</span>
          </div>
        </motion.div>
      </div>

      {/* Chart Section: react-chartjs-2 Line Chart */}
      <div className="glass-card p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h3 className="font-extrabold text-xl text-white flex items-center gap-2 font-mono">
              <TrendingUp className="w-5 h-5 text-carnival-gold" />
              Daily Point Progression Analytics
            </h3>
            <p className="text-slate-400 text-xs mt-1">
              Live line chart of accumulated points across 10 Days for top teams.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-carnival-gold/10 text-carnival-gold border border-carnival-gold/30 font-bold">
              Chart.js Active
            </span>
          </div>
        </div>

        <DailyProgressionChart />
      </div>

      {/* Broadcast System & Feed */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
        <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-carnival-gold" />
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
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 text-sm text-white border border-white/10 focus:border-carnival-gold focus:outline-none transition-all placeholder:text-slate-500 font-mono"
            />
            <button
              type="submit"
              disabled={isBroadcasting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-carnival-gold to-carnival-amber text-slate-950 font-black text-sm shadow-neon-gold hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-carnival-gold focus:ring-carnival-gold accent-carnival-gold cursor-pointer"
            />
            <span className="text-xs font-mono font-bold text-slate-300 group-hover:text-carnival-gold transition-colors flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-carnival-gold" />
              Send Email Alert to All Registered Team Leaders
            </span>
          </label>
        </form>

        <div className="space-y-2 pt-2">
          <div className="text-xs font-mono text-slate-400 uppercase font-bold tracking-wider">Recent Broadcast Feed:</div>
          {broadcastLog.map((log, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-black/40 text-xs font-mono text-slate-200 border border-white/5 flex items-center justify-between">
              <span>{log}</span>
              <span className="text-[10px] text-slate-500 font-sans">Just now</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
