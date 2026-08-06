import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, KeyRound, Lock, Shield, CheckCircle2, AlertCircle, User as UserIcon, Building, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose }) => {
  const { user, apiFetch, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('password');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!oldPassword) {
      setError('Current password is required.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New Password and Confirm Password do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({
          oldPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to update password.');
      }

      setSuccessMsg(data.message || 'Password changed successfully!');
      
      // Update token and user state
      updateUser({ isFirstLogin: false }, data.token);

      // Reset form
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'An error occurred while changing your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25 }}
            className="w-full max-w-lg bg-[#151329] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-carnival-crimson/20 border border-carnival-crimson/30 flex items-center justify-center text-carnival-crimson">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white font-mono">Account Settings & Security</h3>
                  <p className="text-xs text-slate-400">Manage your CWC Season 4 credentials</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 px-5 pt-3 bg-black/20 gap-4">
              <button
                onClick={() => setActiveTab('password')}
                className={`pb-2.5 text-xs font-bold font-mono transition-all relative ${
                  activeTab === 'password'
                    ? 'text-carnival-gold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5" />
                  Change Password
                </span>
                {activeTab === 'password' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-carnival-gold"
                  />
                )}
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`pb-2.5 text-xs font-bold font-mono transition-all relative ${
                  activeTab === 'profile'
                    ? 'text-carnival-gold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5" />
                  Arena Profile
                </span>
                {activeTab === 'profile' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-carnival-gold"
                  />
                )}
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {activeTab === 'password' && (
                <div>
                  {error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>{error}</span>
                    </div>
                  )}

                  {successMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 font-medium">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>{successMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="space-y-4">
                    {/* Old Password */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Current Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <KeyRound className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          value={oldPassword}
                          onChange={(e) => setOldPassword(e.target.value)}
                          placeholder="Enter your current password"
                          required
                          className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-carnival-gold transition-all"
                        />
                      </div>
                    </div>

                    {/* New Password */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="At least 6 characters"
                          required
                          minLength={6}
                          className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-carnival-crimson transition-all"
                        />
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                      <label className="block text-xs font-mono font-bold text-slate-300 mb-1">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Shield className="w-4 h-4" />
                        </div>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          required
                          minLength={6}
                          className="w-full pl-9 pr-3 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-carnival-crimson transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-carnival-crimson to-carnival-purple text-white font-bold text-xs shadow-neon-crimson hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : (
                        <span>Update Password</span>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-carnival-purple/30 text-carnival-gold flex items-center justify-center font-bold text-sm">
                      {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
                    </div>
                    <div>
                      <div className="text-xs font-extrabold text-white">{user?.name}</div>
                      <div className="text-[11px] text-slate-400">{user?.email}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                      <span className="text-[10px] text-slate-400 font-mono block mb-0.5">ROLE</span>
                      <span className="font-bold text-carnival-cyan uppercase">{user?.role}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-black/30 border border-white/10">
                      <span className="text-[10px] text-slate-400 font-mono block mb-0.5">TEAM</span>
                      <span className="font-bold text-carnival-gold">{user?.teamName || 'Cyber Circus Kings'}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-black/30 border border-white/10 flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-mono">Default Password Security Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user?.isFirstLogin
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {user?.isFirstLogin ? 'Default Password Active' : 'Custom Password Set'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Settings;
