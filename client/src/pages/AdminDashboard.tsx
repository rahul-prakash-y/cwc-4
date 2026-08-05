import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Users, CheckCircle2, AlertTriangle, Zap, Plus, Award, Megaphone, Shield } from 'lucide-react';
import { MOCK_TEAMS, MOCK_TIMELINE } from '../data/mockData';
import { triggerCarnivalConfetti } from '../components/hero/ConfettiEffect';

export const AdminDashboard: React.FC = () => {
  const [teams, setTeams] = useState(MOCK_TEAMS);
  const [announcementText, setAnnouncementText] = useState('');
  const [broadcastLog, setBroadcastLog] = useState<string[]>([
    '🎪 Ringmaster Notice: Day 5 Arena Boss Fight is officially LIVE!',
    '⚡ Power-Up Granted: Cyber Circus Kings unlocked 2x Multiplier Card.',
  ]);

  const handleApproveTeam = (id: string) => {
    setTeams(teams.map((t) => (t.id === id ? { ...t, status: 'Approved' } : t)));
  };

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (announcementText) {
      setBroadcastLog([`📢 ${announcementText}`, ...broadcastLog]);
      setAnnouncementText('');
      triggerCarnivalConfetti();
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Admin Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl glass-card border border-carnival-crimson/40 shadow-neon-crimson relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-carnival-crimson/20 text-carnival-crimson text-xs font-mono font-bold border border-carnival-crimson/30">
            <Crown className="w-4 h-4 text-carnival-gold" />
            <span>RINGMASTER COMMAND CENTER</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            CWC Season 4 <span className="text-gradient-carnival">Admin Dashboard</span>
          </h2>
          <p className="text-slate-300 text-sm max-w-xl">
            Oversee carnival battle events, approve team registrations, broadcast live announcements, and grant power-up advantages.
          </p>
        </div>

        <button
          onClick={triggerCarnivalConfetti}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-carnival-gold to-carnival-amber text-slate-950 font-black text-sm shadow-neon-gold hover:scale-105 transition-all"
        >
          Pop Global Celebration 🎊
        </button>
      </div>

      {/* Admin Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border-white/10">
          <div className="text-xs text-slate-400 font-mono uppercase mb-1">Registered Teams</div>
          <div className="text-3xl font-extrabold text-white font-mono">12 Teams</div>
          <div className="text-xs text-emerald-400 mt-1">✓ All 12 Approved</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-white/10">
          <div className="text-xs text-slate-400 font-mono uppercase mb-1">Active Phase</div>
          <div className="text-3xl font-extrabold text-carnival-crimson font-mono">Day 05</div>
          <div className="text-xs text-carnival-gold mt-1">Boss Fight Challenge</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-white/10">
          <div className="text-xs text-slate-400 font-mono uppercase mb-1">Submissions Received</div>
          <div className="text-3xl font-extrabold text-carnival-cyan font-mono">48 Repo Links</div>
          <div className="text-xs text-slate-400 mt-1">100% evaluated</div>
        </div>

        <div className="glass-card p-5 rounded-2xl border-white/10">
          <div className="text-xs text-slate-400 font-mono uppercase mb-1">Advantages Distributed</div>
          <div className="text-3xl font-extrabold text-carnival-gold font-mono">18 Cards</div>
          <div className="text-xs text-emerald-400 mt-1">Double PTS & Shields</div>
        </div>
      </div>

      {/* Broadcast Announcement Bar */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
        <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-carnival-gold" />
          Broadcast Live Carnival Announcement
        </h3>

        <form onSubmit={handleBroadcast} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Type live announcement for student dashboards..."
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-sm text-white border border-white/10 focus:border-carnival-gold focus:outline-none"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-carnival-crimson text-white font-bold text-sm shadow-neon-crimson hover:scale-105 transition-all"
          >
            Broadcast Now
          </button>
        </form>

        <div className="space-y-2 pt-2">
          <div className="text-xs font-mono text-slate-400 uppercase">Recent Broadcast Feed:</div>
          {broadcastLog.map((log, idx) => (
            <div key={idx} className="p-3 rounded-lg bg-black/40 text-xs font-mono text-slate-200 border border-white/5">
              {log}
            </div>
          ))}
        </div>
      </div>

      {/* Team Management Grid */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 shadow-xl space-y-4">
        <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-carnival-cyan" />
          Team Roster & Points Management
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase">
                <th className="p-3">Rank</th>
                <th className="p-3">Team Name</th>
                <th className="p-3">Leader</th>
                <th className="p-3">Points</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {teams.map((t) => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-3 font-bold text-carnival-gold">#{t.rank}</td>
                  <td className="p-3 font-bold text-white flex items-center gap-2">
                    <span>{t.avatar}</span>
                    <span>{t.name}</span>
                  </td>
                  <td className="p-3 text-slate-300">{t.members[0]?.name}</td>
                  <td className="p-3 text-carnival-cyan font-bold">{t.points} PTS</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-sans font-bold text-[10px]">
                      {t.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => alert(`Granted +100 bonus PTS to ${t.name}`)}
                      className="px-2.5 py-1 rounded bg-carnival-gold/20 text-carnival-gold hover:bg-carnival-gold hover:text-black font-sans font-bold"
                    >
                      +100 PTS
                    </button>
                    <button
                      onClick={() => alert(`Granted Advantage Card to ${t.name}`)}
                      className="px-2.5 py-1 rounded bg-carnival-purple/20 text-carnival-purple hover:bg-carnival-purple hover:text-white font-sans font-bold"
                    >
                      +Card
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
