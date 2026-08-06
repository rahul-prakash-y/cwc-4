import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ForcePasswordChange: React.FC = () => {
  const navigate = useNavigate();
  const { user, apiFetch, updateUser } = useAuth();

  const [oldPassword, setOldPassword] = useState('CWC4-Student-2026');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!oldPassword) {
      setError('Please enter your default old password.');
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

    if (newPassword === oldPassword) {
      setError('Your new password must be different from your default password.');
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
        throw new Error(data.message || 'Failed to update password');
      }

      setSuccessMsg(data.message || 'Password updated successfully! Welcome to the Arena!');
      
      // Update local auth context state
      updateUser({ isFirstLogin: false }, data.token);

      // Redirect to student dashboard after brief celebration delay
      setTimeout(() => {
        navigate('/student', { replace: true });
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'An error occurred while changing your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0A16] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-carnival-crimson/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-carnival-cyan/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Ticket Header Badge */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-carnival-gold/10 border border-carnival-gold/30 text-carnival-gold text-xs font-mono font-bold mb-3 shadow-lg">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>FIRST LOGIN SECURITY CHECKPOINT</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
            <span>Security Arena Setup</span>
            <span className="text-carnival-crimson">🎪</span>
          </h1>
          <p className="mt-2 text-slate-300 text-sm max-w-md mx-auto leading-relaxed">
            Welcome to CWC Season 4! For security, you must change your default password before entering the arena.
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-[#151329]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          {/* User welcome bar */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-carnival-crimson to-carnival-purple flex items-center justify-center font-bold text-white text-sm font-mono shadow-md">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'ST'}
            </div>
            <div>
              <div className="text-xs text-slate-400 font-mono">Logged in as</div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{user?.name || 'Student Arena Participant'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-carnival-cyan/20 text-carnival-cyan border border-carnival-cyan/30">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2.5 font-medium"
            >
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 font-medium"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Old Password (Default) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                Old Password (Default)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Default: CWC4-Student-2026"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-carnival-gold focus:ring-1 focus:ring-carnival-gold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Default password given at registration: <span className="font-mono text-carnival-gold">CWC4-Student-2026</span>
              </p>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter custom new password"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-carnival-crimson focus:ring-1 focus:ring-carnival-crimson transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider font-mono">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Shield className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password to confirm"
                  required
                  minLength={6}
                  className="w-full pl-10 pr-10 py-2.5 bg-black/40 border border-white/15 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-carnival-crimson focus:ring-1 focus:ring-carnival-crimson transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-carnival-crimson to-carnival-purple text-white font-extrabold text-sm shadow-neon-crimson hover:opacity-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating Arena Security...</span>
                </>
              ) : (
                <>
                  <span>Confirm Password & Enter Arena</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default ForcePasswordChange;
