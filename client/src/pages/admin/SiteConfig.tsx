import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Sliders,
  Calendar,
  Layers,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
  Sparkles,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Trophy,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export interface GlobalSettings {
  eventStartDate: string;
  currentSeason: number;
  isRegistrationOpen: boolean;
  isLeaderboardVisible: boolean;
  heroBannerText: string;
  isGrandFinale: boolean;
  isTaskPortalApproved: boolean;
}

export const SiteConfig: React.FC = () => {
  const { apiFetch } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GlobalSettings>({
    eventStartDate: '2026-08-15T10:00',
    currentSeason: 4,
    isRegistrationOpen: true,
    isLeaderboardVisible: true,
    heroBannerText: 'Welcome to Code With Curious Season 4! The Ultimate Coding Carnival.',
    isGrandFinale: false,
    isTaskPortalApproved: true,
  });

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/settings/global');
      if (res.ok) {
        const data = await res.json();
        let formattedDate = '2026-08-15T10:00';
        if (data.eventStartDate) {
          const d = new Date(data.eventStartDate);
          formattedDate = d.toISOString().slice(0, 16);
        }
        setSettings({
          eventStartDate: formattedDate,
          currentSeason: data.currentSeason ?? 4,
          isRegistrationOpen: data.isRegistrationOpen ?? true,
          isLeaderboardVisible: data.isLeaderboardVisible ?? true,
          heroBannerText:
            data.heroBannerText ||
            'Welcome to Code With Curious Season 4! The Ultimate Coding Carnival.',
          isGrandFinale: data.isGrandFinale ?? false,
          isTaskPortalApproved: data.isTaskPortalApproved ?? true,
        });
      }
    } catch (err: any) {
      console.error('Failed to fetch global settings:', err);
      toast.error('Failed to load global site configuration.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...settings,
        eventStartDate: new Date(settings.eventStartDate).toISOString(),
      };
      const res = await apiFetch('/api/superadmin/settings/global', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('⚙️ Site Configuration updated & synchronized live across all portals!');
        if (data.settings) {
          const d = new Date(data.settings.eventStartDate);
          setSettings({
            ...data.settings,
            eventStartDate: d.toISOString().slice(0, 16),
          });
        }
      } else {
        const errData = await res.json();
        toast.error(errData.message || 'Failed to update settings');
      }
    } catch (err: any) {
      console.error('Error saving site settings:', err);
      toast.error('An error occurred while updating site configuration.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400 font-mono flex items-center justify-center gap-3">
        <RefreshCw className="w-5 h-5 animate-spin text-carnival-gold" />
        <span>Loading Site Configuration CMS...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 dark:bg-carnival-gold/20 text-amber-800 dark:text-carnival-gold border border-amber-300 dark:border-carnival-gold/40 flex items-center gap-1.5 shadow-sm dark:shadow-neon-gold">
              <Sliders className="w-3.5 h-3.5" />
              <span>SUPER ADMIN CMS ENGINE</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40 text-[10px] font-mono font-bold">
              REAL-TIME SYNC
            </span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Site Configuration (CMS) ⚙️</h1>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
            Manage global portal flags, event start timers, registration status, and leaderboard visibility.
          </p>
        </div>

        <button
          onClick={fetchSettings}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white font-mono text-xs flex items-center gap-2 border border-slate-300 dark:border-white/10 transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Reload Config</span>
        </button>
      </div>

      {/* Main CMS Form Container */}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Event Countdown & Season */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18122B] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-carnival-gold/20 border border-amber-300 dark:border-carnival-gold/40 flex items-center justify-center text-amber-600 dark:text-carnival-gold">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Event Countdown & Season</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure launch timer and season number</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Event Start Date */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-amber-500 dark:text-carnival-gold" />
                  <span>Event Start Date & Time *</span>
                </label>
                <input
                  type="datetime-local"
                  value={settings.eventStartDate}
                  onChange={(e) => setSettings({ ...settings, eventStartDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/60 text-slate-900 dark:text-white text-xs font-mono border border-slate-300 dark:border-white/15 focus:border-amber-500 dark:focus:border-carnival-gold focus:outline-none transition"
                  required
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  This timestamp drives the mechanical flip-clock countdown timer on the Hero section.
                </p>
              </div>

              {/* Current Season */}
              <div className="space-y-2">
                <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-3.5 h-3.5 text-amber-500 dark:text-carnival-gold" />
                  <span>Current Season Number *</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={settings.currentSeason}
                  onChange={(e) => setSettings({ ...settings, currentSeason: parseInt(e.target.value, 10) || 4 })}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/60 text-slate-900 dark:text-white text-xs font-mono border border-slate-300 dark:border-white/15 focus:border-amber-500 dark:focus:border-carnival-gold focus:outline-none transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 2: Feature Toggles */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#18122B] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl space-y-6 relative overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-carnival-cyan/20 border border-cyan-300 dark:border-carnival-cyan/40 flex items-center justify-center text-cyan-600 dark:text-carnival-cyan">
                <Sliders className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Feature Control Switches</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Toggle public portal access and visibility</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Registration Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10">
                <div className="space-y-1 pr-4">
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {settings.isRegistrationOpen ? (
                      <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <UserX className="w-4 h-4 text-red-600 dark:text-carnival-crimson" />
                    )}
                    <span>Registration Gate</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {settings.isRegistrationOpen
                      ? 'Student squad registrations are OPEN.'
                      : 'Student registrations are CLOSED.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, isRegistrationOpen: !settings.isRegistrationOpen })}
                  className={`w-14 h-8 rounded-full p-1 transition duration-300 border cursor-pointer ${
                    settings.isRegistrationOpen
                      ? 'bg-emerald-500/30 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      : 'bg-slate-200 dark:bg-black/60 border-slate-300 dark:border-white/20'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full transition duration-300 transform ${
                      settings.isRegistrationOpen ? 'translate-x-6 bg-emerald-500 dark:bg-emerald-400' : 'translate-x-0 bg-slate-400 dark:bg-slate-500'
                    }`}
                  />
                </button>
              </div>

              {/* Leaderboard Visibility Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10">
                <div className="space-y-1 pr-4">
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    {settings.isLeaderboardVisible ? (
                      <Eye className="w-4 h-4 text-amber-500 dark:text-carnival-gold" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    )}
                    <span>Public Leaderboard</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {settings.isLeaderboardVisible
                      ? 'Live ranking table is VISIBLE to students.'
                      : 'Leaderboard is HIDDEN from students (Admins still view).'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, isLeaderboardVisible: !settings.isLeaderboardVisible })}
                  className={`w-14 h-8 rounded-full p-1 transition duration-300 border cursor-pointer ${
                    settings.isLeaderboardVisible
                      ? 'bg-amber-500/30 border-amber-500 shadow-[0_0_10px_rgba(255,215,0,0.5)]'
                      : 'bg-slate-200 dark:bg-black/60 border-slate-300 dark:border-white/20'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full transition duration-300 transform ${
                      settings.isLeaderboardVisible ? 'translate-x-6 bg-amber-500 dark:bg-carnival-gold' : 'translate-x-0 bg-slate-400 dark:bg-slate-500'
                    }`}
                  />
                </button>
              </div>

              {/* Grand Finale Mode Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10">
                <div className="space-y-1 pr-4">
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Trophy className={`w-4 h-4 ${settings.isGrandFinale ? 'text-amber-500 dark:text-amber-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>Grand Finale Gold Mode</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {settings.isGrandFinale
                      ? 'GRAND FINALE ACTIVE - Gold theme & victory overlays enabled.'
                      : 'Standard Carnival Mode.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, isGrandFinale: !settings.isGrandFinale })}
                  className={`w-14 h-8 rounded-full p-1 transition duration-300 border cursor-pointer ${
                    settings.isGrandFinale
                      ? 'bg-amber-400/30 border-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                      : 'bg-slate-200 dark:bg-black/60 border-slate-300 dark:border-white/20'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full transition duration-300 transform ${
                      settings.isGrandFinale ? 'translate-x-6 bg-amber-500 dark:bg-amber-400' : 'translate-x-0 bg-slate-400 dark:bg-slate-500'
                    }`}
                  />
                </button>
              </div>

              {/* Task Portal SuperAdmin Approval Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10">
                <div className="space-y-1 pr-4">
                  <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className={`w-4 h-4 ${settings.isTaskPortalApproved ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    <span>Task Portal SuperAdmin Approval Gate</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {settings.isTaskPortalApproved
                      ? 'GLOBAL APPROVAL ACTIVE - Task Portal button is ENABLED for all students.'
                      : 'PORTAL LOCKED - Task Portal button is DISABLED for all students until approved.'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, isTaskPortalApproved: !settings.isTaskPortalApproved })}
                  className={`w-14 h-8 rounded-full p-1 transition duration-300 border cursor-pointer ${
                    settings.isTaskPortalApproved
                      ? 'bg-emerald-500/30 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      : 'bg-slate-200 dark:bg-black/60 border-slate-300 dark:border-white/20'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full transition duration-300 transform ${
                      settings.isTaskPortalApproved ? 'translate-x-6 bg-emerald-500 dark:bg-emerald-400' : 'translate-x-0 bg-slate-400 dark:bg-slate-500'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 3: Hero Banner Custom Text */}
        <div className="p-6 rounded-3xl bg-white dark:bg-[#18122B] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl space-y-4 relative overflow-hidden">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-carnival-purple/20 border border-purple-300 dark:border-carnival-purple/40 flex items-center justify-center text-purple-600 dark:text-carnival-purple">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hero Announcement Banner</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Headline announcement text displayed on landing hero section</p>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              rows={3}
              value={settings.heroBannerText}
              onChange={(e) => setSettings({ ...settings, heroBannerText: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-black/60 text-slate-900 dark:text-white text-xs font-sans border border-slate-300 dark:border-white/15 focus:border-amber-500 dark:focus:border-carnival-gold focus:outline-none transition leading-relaxed"
              placeholder="Enter announcement text..."
            />
          </div>
        </div>

        {/* Save Configuration Action Bar */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-rose-600 text-white font-black text-sm uppercase tracking-wider shadow-lg hover:brightness-110 transition duration-300 flex items-center gap-3 cursor-pointer disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Broadcasting Configuration Updates...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save & Broadcast Site Config 🚀</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SiteConfig;
