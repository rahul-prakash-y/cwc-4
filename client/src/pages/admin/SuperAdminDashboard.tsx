import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  RefreshCw,
  Ban,
  KeyRound,
  UserPlus,
  Trash2,
  Lock,
  UserCheck,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Activity,
  FileText,
  Sparkles,
  X,
  CheckCircle,
  Sliders,
  Zap,
  LogOut,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SiteConfig } from './SiteConfig';
import { TimelineCMS } from './TimelineCMS';
import { CoordinatorsCMS } from '../../components/admin/CoordinatorsCMS';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { EmptyState } from '../../components/ui/EmptyState';

interface AuditLog {
  _id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetId?: string;
  targetType?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  timestamp: string;
}

interface TargetUserOrTeam {
  _id: string;
  name?: string;
  teamName?: string;
  email?: string;
  role?: string;
  status?: string;
  isBlocked?: boolean;
  isFirstLogin?: boolean;
  leader?: { name: string; email: string };
  type: 'user' | 'team';
}

interface AdminAccount {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'superadmin';
  createdAt: string;
}

export const SuperAdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'security';

  const { apiFetch, user: currentUser, isSuperAdmin } = useAuth();

  // Audit Logs State
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState<boolean>(false);
  const [logsPage, setLogsPage] = useState<number>(1);
  const [totalLogsPages, setTotalLogsPages] = useState<number>(1);
  const [totalLogsCount, setTotalLogsCount] = useState<number>(0);
  const [logSearch, setLogSearch] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Security Center State
  const [securityQuery, setSecurityQuery] = useState<string>('');
  const [securityTargets, setSecurityTargets] = useState<TargetUserOrTeam[]>([]);
  const [securityLoading, setSecurityLoading] = useState<boolean>(false);

  // Admin Management State
  const [adminList, setAdminList] = useState<AdminAccount[]>([]);
  const [adminsLoading, setAdminsLoading] = useState<boolean>(false);
  const [showCreateAdminModal, setShowCreateAdminModal] = useState<boolean>(false);
  const [newAdminName, setNewAdminName] = useState<string>('');
  const [newAdminEmail, setNewAdminEmail] = useState<string>('');
  const [newAdminPassword, setNewAdminPassword] = useState<string>('');
  const [newAdminRole, setNewAdminRole] = useState<'admin' | 'superadmin'>('admin');
  const [createAdminSubmitting, setCreateAdminSubmitting] = useState<boolean>(false);

  // Destructive Action Modal State
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionType: 'block' | 'reset-password' | 'revoke-admin' | 'force-logout' | 'delete-user';
    targetId: string;
    targetName: string;
    targetType?: 'user' | 'team';
    isBlockedState?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionType: 'block',
    targetId: '',
    targetName: '',
  });

  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Helper notice alert
  const showNotice = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch Audit Logs
  const fetchAuditLogs = async () => {
    setLogsLoading(true);
    try {
      const params = new URLSearchParams({
        page: logsPage.toString(),
        limit: '15',
        search: logSearch,
        action: actionFilter,
      });
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await apiFetch(`/superadmin/audit-logs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalLogsPages(data.totalPages || 1);
        setTotalLogsCount(data.total || 0);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  // Fetch Security Targets (Students & Teams)
  const fetchSecurityTargets = async () => {
    setSecurityLoading(true);
    try {
      const res = await apiFetch(`/superadmin/targets?search=${encodeURIComponent(securityQuery)}`);
      if (res.ok) {
        const data = await res.json();
        const formatted: TargetUserOrTeam[] = [
          ...(data.students || []).map((s: any) => ({ ...s, type: 'user' as const })),
          ...(data.teams || []).map((t: any) => ({ ...t, type: 'team' as const })),
        ];
        setSecurityTargets(formatted);
      }
    } catch (err) {
      console.error('Error fetching security targets:', err);
    } finally {
      setSecurityLoading(false);
    }
  };

  // Fetch Admins List
  const fetchAdmins = async () => {
    setAdminsLoading(true);
    try {
      const res = await apiFetch('/superadmin/manage-admins');
      if (res.ok) {
        const data = await res.json();
        setAdminList(data.admins || []);
      }
    } catch (err) {
      console.error('Error fetching admins:', err);
    } finally {
      setAdminsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'logs') fetchAuditLogs();
    if (activeTab === 'security') fetchSecurityTargets();
    if (activeTab === 'admins') fetchAdmins();
  }, [activeTab, logsPage, actionFilter]);

  // Execute Destructive Action after Modal Confirmation
  const executeConfirmedAction = async () => {
    const { actionType, targetId, targetType, isBlockedState } = confirmModalState;
    setConfirmModalState((prev) => ({ ...prev, isOpen: false }));

    try {
      if (actionType === 'block') {
        const res = await apiFetch(`/superadmin/users/${targetId}/block`, {
          method: 'PATCH',
          body: JSON.stringify({ isBlocked: !isBlockedState, targetType }),
        });
        const data = await res.json();
        if (res.ok) {
          showNotice('success', data.message || 'Account block status updated successfully.');
          fetchSecurityTargets();
        } else {
          showNotice('error', data.message || 'Failed to update block status.');
        }
      } else if (actionType === 'reset-password') {
        const res = await apiFetch(`/superadmin/users/${targetId}/reset-password`, {
          method: 'POST',
        });
        const data = await res.json();
        if (res.ok) {
          showNotice(
            'success',
            `Password force-reset! Default Passcode: ${data.defaultPassword} (FirstLogin: TRUE)`
          );
          fetchSecurityTargets();
        } else {
          showNotice('error', data.message || 'Failed to reset password.');
        }
      } else if (actionType === 'force-logout') {
        const route = targetType === 'team' ? `/superadmin/teams/${targetId}/force-logout` : `/superadmin/users/${targetId}/force-logout`;
        const res = await apiFetch(route, { method: 'PATCH' });
        const data = await res.json();
        if (res.ok) {
          showNotice('success', data.message || 'User logged out across all devices! Session version incremented.');
          fetchSecurityTargets();
        } else {
          showNotice('error', data.message || 'Failed to force logout user.');
        }
      } else if (actionType === 'delete-user') {
        const route = targetType === 'team' ? `/superadmin/teams/${targetId}` : `/superadmin/users/${targetId}`;
        const res = await apiFetch(route, { method: 'DELETE' });
        const data = await res.json();
        if (res.ok) {
          showNotice('success', data.message || 'Account and associated records deleted permanently.');
          fetchSecurityTargets();
        } else {
          showNotice('error', data.message || 'Failed to delete account.');
        }
      } else if (actionType === 'revoke-admin') {
        const res = await apiFetch(`/superadmin/manage-admins/${targetId}`, {
          method: 'DELETE',
        });
        const data = await res.json();
        if (res.ok) {
          showNotice('success', data.message || 'Admin privileges revoked successfully.');
          fetchAdmins();
        } else {
          showNotice('error', data.message || 'Failed to revoke admin.');
        }
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Action failed');
    }
  };

  // Create Admin Submission
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminName || !newAdminEmail) return;

    setCreateAdminSubmitting(true);
    try {
      const res = await apiFetch('/superadmin/manage-admins', {
        method: 'POST',
        body: JSON.stringify({
          name: newAdminName,
          email: newAdminEmail,
          password: newAdminPassword || 'CWC4-Admin-2026',
          role: newAdminRole,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotice('success', data.message || 'Admin created successfully!');
        setShowCreateAdminModal(false);
        setNewAdminName('');
        setNewAdminEmail('');
        setNewAdminPassword('');
        fetchAdmins();
      } else {
        showNotice('error', data.message || 'Failed to create admin');
      }
    } catch (err: any) {
      showNotice('error', err.message || 'Server error');
    } finally {
      setCreateAdminSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gradient-to-r dark:from-[#1E112A] dark:via-[#2D1B36] dark:to-[#170E28] p-6 sm:p-8 border border-slate-200 dark:border-purple-500/30 shadow-sm dark:shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-500/20 border border-purple-300 dark:border-purple-400/40 text-purple-800 dark:text-purple-300 text-xs font-mono font-bold">
              <ShieldAlert className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>TIERED SUPERADMIN SECURITY HUB</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              <span>SuperAdmin Control Center</span>
              <Sparkles className="w-6 h-6 text-amber-500 dark:text-carnival-gold animate-spin-slow" />
            </h2>
            <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl font-sans">
              Absolute governance for CWC Season 4. Manage admin privileges, audit security events, force password resets, and instantly block compromised student/team accounts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-2xl bg-slate-50 dark:bg-white/5 border border-purple-300 dark:border-purple-400/30 font-mono text-xs text-right">
              <div className="text-[10px] text-purple-600 dark:text-purple-400 uppercase font-bold">Active Role</div>
              <div className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>SUPERADMIN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 border-t border-slate-200 dark:border-white/10 pt-4">
          <button
            onClick={() => setSearchParams({ tab: 'security' })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-[0_0_20px_rgba(225,29,72,0.4)] font-black'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Security Center & Account Locking</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'logs' })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'logs'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-neon-purple font-black'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Audit Logs & Security Trail</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'admins' })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'admins'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-neon-gold font-black'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Admin Management</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'cms' })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'cms'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-neon-cyan font-black'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Site Configuration (CMS)</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'timeline' })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-lg font-black'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Timeline CMS</span>
          </button>

          <button
            onClick={() => setSearchParams({ tab: 'coordinators' })}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'coordinators'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg font-black'
                : 'bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Coordinators CMS</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-2xl flex items-center justify-between shadow-xl border font-mono text-xs font-bold ${
              notification.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-300 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-sm dark:shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                : 'bg-rose-50 dark:bg-rose-950/80 border-rose-300 dark:border-rose-500 text-rose-800 dark:text-rose-300 shadow-sm dark:shadow-[0_0_20px_rgba(244,63,94,0.3)]'
            }`}
          >
            <div className="flex items-center gap-3">
              {notification.type === 'success' ? (
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              )}
              <span>{notification.message}</span>
            </div>
            <button onClick={() => setNotification(null)} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* TAB 1: SECURITY CENTER */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          {/* Search Bar & Action Header */}
          <div className="bg-white dark:bg-[#18122B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                  <span>Student & Team Account Controls</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Search accounts to toggle Block status (instant WebSocket disconnect) or Force Password Reset.
                </p>
              </div>

              <div className="w-full sm:w-auto flex items-center gap-3">
                <div className="relative flex-1 sm:w-80">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={securityQuery}
                    onChange={(e) => setSecurityQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchSecurityTargets()}
                    placeholder="Search student name, email, team..."
                    className="w-full bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition-all font-mono"
                  />
                </div>
                <button
                  onClick={fetchSecurityTargets}
                  disabled={securityLoading}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-mono text-xs font-bold hover:brightness-110 transition-all shadow-sm dark:shadow-[0_0_15px_rgba(225,29,72,0.3)] flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${securityLoading ? 'animate-spin' : ''}`} />
                  <span>Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {securityLoading ? (
            <div className="p-12 text-center text-slate-600 dark:text-slate-400 font-mono text-xs bg-white dark:bg-[#18122B] rounded-3xl border border-slate-200 dark:border-white/10">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-rose-500 dark:text-rose-400" />
              <span>Scanning Arena Accounts...</span>
            </div>
          ) : securityTargets.length === 0 ? (
            <div className="p-12 text-center text-slate-600 dark:text-slate-400 font-mono text-xs bg-white dark:bg-[#18122B] rounded-3xl border border-slate-200 dark:border-white/10">
              <span>No matching student or team accounts found. Try a different query.</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {securityTargets.map((target) => {
                const displayName = target.type === 'team' ? target.teamName : target.name;
                const email = target.type === 'team' ? target.leader?.email : target.email;
                const isBlocked = Boolean(target.isBlocked);

                return (
                  <motion.div
                    key={`${target.type}-${target._id}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 shadow-sm dark:shadow-lg ${
                      isBlocked
                        ? 'border-rose-300 dark:border-rose-500/50 bg-rose-50 dark:bg-rose-950/20 dark:shadow-[0_0_15px_rgba(225,29,72,0.2)]'
                        : 'border-slate-200 dark:border-white/10 hover:border-purple-400 dark:hover:border-purple-500/40 bg-white dark:bg-[#18122B]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                            target.type === 'team'
                              ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/40'
                              : 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/40'
                          }`}
                        >
                          {target.type === 'team' ? '🎪 TEAM' : '👤 STUDENT'}
                        </span>

                        <span
                          className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                            isBlocked
                              ? 'bg-rose-100 dark:bg-rose-500/30 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-500'
                              : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/40'
                          }`}
                        >
                          {isBlocked ? (
                            <>
                              <Ban className="w-3 h-3 text-rose-600 dark:text-rose-400" /> BLOCKED
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> ACTIVE
                            </>
                          )}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base font-mono truncate">{displayName}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate">{email || 'No email associated'}</p>

                      {target.isFirstLogin && (
                        <div className="mt-2 text-[10px] text-amber-700 dark:text-amber-400 font-mono bg-amber-100 dark:bg-amber-500/10 border border-amber-300 dark:border-amber-500/20 px-2 py-1 rounded-lg inline-block">
                          ⚠️ First Login Pending
                        </div>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          setConfirmModalState({
                            isOpen: true,
                            title: isBlocked ? 'Unblock Account' : 'Block Account & Terminate Session',
                            description: isBlocked
                              ? `Are you sure you want to restore access for ${displayName}?`
                              : `WARNING: Blocking ${displayName} will INSTANTLY terminate their active WebSocket session and prevent any future login.`,
                            actionType: 'block',
                            targetId: target._id,
                            targetName: displayName || '',
                            targetType: target.type,
                            isBlockedState: isBlocked,
                          })
                        }
                        className={`py-2 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isBlocked
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-sm dark:shadow-[0_0_15px_rgba(225,29,72,0.3)]'
                        }`}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        <span>{isBlocked ? 'Unblock' : 'Block'}</span>
                      </button>

                      <button
                        onClick={() =>
                          setConfirmModalState({
                            isOpen: true,
                            title: 'Force Logout (Single Device Reset)',
                            description: `Are you sure you want to force log out ${displayName}? This will increment their sessionVersion and invalidate their active JWT cookie across all devices.`,
                            actionType: 'force-logout',
                            targetId: target._id,
                            targetName: displayName || '',
                            targetType: target.type,
                          })
                        }
                        className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-purple-300 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-500/20 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                        <span>Force Logout</span>
                      </button>

                      {target.type === 'user' && (
                        <button
                          onClick={() =>
                            setConfirmModalState({
                              isOpen: true,
                              title: 'Force Password Reset',
                              description: `Force reset ${displayName}'s password to default ('CWC4-Student-2026') and require password change on next login?`,
                              actionType: 'reset-password',
                              targetId: target._id,
                              targetName: displayName || '',
                            })
                          }
                          className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-500/20 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          <span>Reset Pass</span>
                        </button>
                      )}

                      <button
                        onClick={() =>
                          setConfirmModalState({
                            isOpen: true,
                            title: 'PERMANENT DELETE ACCOUNT',
                            description: `CRITICAL CAUTION: Deleting ${displayName} will PERMANENTLY remove this record and cascade delete all associated scores, submissions, and attendance logs. This action CANNOT BE UNDONE!`,
                            actionType: 'delete-user',
                            targetId: target._id,
                            targetName: displayName || '',
                            targetType: target.type,
                          })
                        }
                        className="py-2 px-3 rounded-xl bg-rose-100 dark:bg-red-950/80 hover:bg-rose-200 dark:hover:bg-red-900 border border-rose-300 dark:border-red-500/50 text-rose-800 dark:text-red-300 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-red-400" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: AUDIT LOGS VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-[#18122B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                  <span>Administrative Audit Trail</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Immutable log recording critical administrative operations across score updates, advantages, and security actions.
                </p>
              </div>

              <button
                onClick={fetchAuditLogs}
                disabled={logsLoading}
                className="px-4 py-2.5 rounded-xl bg-purple-600 text-white font-mono text-xs font-bold hover:bg-purple-500 transition-all flex items-center gap-2 self-end sm:self-auto cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Logs</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  value={logSearch}
                  onChange={(e) => setLogSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchAuditLogs()}
                  placeholder="Filter by admin email / target..."
                  className="w-full bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setLogsPage(1);
                }}
                className="bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-mono"
              >
                <option value="ALL">All Actions</option>
                <option value="BLOCK_ACCOUNT">BLOCK_ACCOUNT</option>
                <option value="UNBLOCK_ACCOUNT">UNBLOCK_ACCOUNT</option>
                <option value="FORCE_RESET_PASSWORD">FORCE_RESET_PASSWORD</option>
                <option value="CREATE_ADMIN">CREATE_ADMIN</option>
                <option value="REVOKE_ADMIN">REVOKE_ADMIN</option>
                <option value="SCORE_UPDATE">SCORE_UPDATE</option>
                <option value="ADVANTAGE_GRANT">ADVANTAGE_GRANT</option>
              </select>

              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-mono"
              />

              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>
          </div>

          {/* Audit Logs Data Table */}
          {logsLoading ? (
            <TableSkeleton rows={5} cols={5} className="min-h-[380px]" />
          ) : logs.length === 0 ? (
            <EmptyState
              title="No Audit Logs Found"
              description="No audit log records match the specified filter criteria."
              icon={FileText}
            />
          ) : (
            <div className="bg-white dark:bg-[#18122B] rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-slate-100 dark:bg-[#1A1228] text-slate-700 dark:text-slate-300 uppercase border-b border-slate-200 dark:border-white/10 text-[10px] tracking-wider">
                    <tr>
                      <th className="py-3.5 px-4">Timestamp</th>
                      <th className="py-3.5 px-4">Admin Executer</th>
                      <th className="py-3.5 px-4">Action</th>
                      <th className="py-3.5 px-4">Target ID / Type</th>
                      <th className="py-3.5 px-4">Operation Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-800 dark:text-slate-200">
                    {logs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            <span>{new Date(log.timestamp).toLocaleString()}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-bold text-purple-700 dark:text-purple-300">
                          {log.adminEmail || log.adminId || 'System'}
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              log.action.includes('BLOCK') || log.action.includes('REVOKE')
                                ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-500/40'
                                : log.action.includes('RESET')
                                ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
                                : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40'
                            }`}
                          >
                            {log.action}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-slate-800 dark:text-slate-300">
                          <div className="font-bold">{log.targetType || 'N/A'}</div>
                          <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{log.targetId || '-'}</div>
                        </td>

                        <td className="py-3 px-4 text-slate-800 dark:text-slate-300">
                          <pre className="text-[10px] bg-slate-100 dark:bg-[#0E0817] text-slate-800 dark:text-slate-300 p-2 rounded-lg border border-slate-200 dark:border-white/10 max-w-xs overflow-x-auto whitespace-pre-wrap">
                            {JSON.stringify(log.details || {}, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="p-4 bg-slate-50 dark:bg-[#140D24] border-t border-slate-200 dark:border-white/10 flex items-center justify-between font-mono text-xs text-slate-600 dark:text-slate-400">
              <div>
                Showing page <span className="text-slate-900 dark:text-white font-bold">{logsPage}</span> of{' '}
                <span className="text-slate-900 dark:text-white font-bold">{totalLogsPages}</span> ({totalLogsCount} total logs)
              </div>

              <div className="flex items-center gap-2">
                <button
                  disabled={logsPage <= 1}
                  onClick={() => setLogsPage((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>

                <button
                  disabled={logsPage >= totalLogsPages}
                  onClick={() => setLogsPage((prev) => Math.min(prev + 1, totalLogsPages))}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ADMIN MANAGEMENT VIEW */}
      {/* ========================================================================= */}
      {activeTab === 'admins' && (
        <div className="space-y-6">
          {/* Header & Create Admin Button */}
          <div className="bg-white dark:bg-[#18122B] p-6 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                <span>Ringmaster Admin Management</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Grant or revoke standard 'admin' and 'superadmin' roles to control staff access.
              </p>
            </div>

            <button
              onClick={() => setShowCreateAdminModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-mono text-xs font-black shadow-sm dark:shadow-neon-gold hover:brightness-110 transition-all flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Admin Account</span>
            </button>
          </div>

          {/* Admin List Grid */}
          {adminsLoading ? (
            <div className="p-12 text-center text-slate-600 dark:text-slate-400 font-mono text-xs bg-white dark:bg-[#18122B] rounded-3xl border border-slate-200 dark:border-white/10">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500 dark:text-amber-400" />
              <span>Loading Admin Directory...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminList.map((admin) => (
                <div
                  key={admin._id}
                  className="bg-white dark:bg-[#18122B] p-5 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col justify-between space-y-4 hover:border-amber-400 dark:hover:border-amber-500/40 transition-all shadow-sm dark:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-yellow-500 flex items-center justify-center font-bold text-slate-950 font-mono text-base shadow-sm dark:shadow-neon-gold">
                        {admin.role === 'superadmin' ? '⚡' : '👑'}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm font-mono">{admin.name}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">{admin.email}</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        admin.role === 'superadmin'
                          ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500'
                          : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-500'
                      }`}
                    >
                      {admin.role}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">
                      Added: {new Date(admin.createdAt || Date.now()).toLocaleDateString()}
                    </span>

                    {admin._id !== currentUser?.id && admin.role !== 'superadmin' && (
                      <button
                        onClick={() =>
                          setConfirmModalState({
                            isOpen: true,
                            title: 'Revoke Admin Privileges',
                            description: `Are you sure you want to revoke admin access for ${admin.name} (${admin.email})? Account will be demoted to standard student.`,
                            actionType: 'revoke-admin',
                            targetId: admin._id,
                            targetName: admin.name,
                          })
                        }
                        className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-all cursor-pointer"
                        title="Revoke Admin Access"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SITE CONFIGURATION (CMS) */}
      {/* ========================================================================= */}
      {activeTab === 'cms' && <SiteConfig />}

      {/* ========================================================================= */}
      {/* TAB 5: TIMELINE CMS */}
      {/* ========================================================================= */}
      {activeTab === 'timeline' && <TimelineCMS />}

      {/* ========================================================================= */}
      {/* TAB 6: COORDINATORS CMS */}
      {/* ========================================================================= */}
      {activeTab === 'coordinators' && <CoordinatorsCMS />}

      {/* ========================================================================= */}
      {/* MODAL 1: CONFIRM DESTRUCTIVE ACTION MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {confirmModalState.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-3xl border border-rose-300 dark:border-rose-500/50 shadow-2xl bg-white dark:bg-[#170E28] space-y-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/20 border border-rose-300 dark:border-rose-500 flex items-center justify-center text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-mono">
                    {confirmModalState.title}
                  </h3>
                  <p className="text-xs text-rose-700 dark:text-rose-300 font-mono font-bold">
                    Target: {confirmModalState.targetName}
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
                {confirmModalState.description}
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setConfirmModalState((prev) => ({ ...prev, isOpen: false }))}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-mono text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={executeConfirmedAction}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 text-white font-mono text-xs font-extrabold shadow-[0_0_20px_rgba(225,29,72,0.4)] hover:brightness-110 transition-all cursor-pointer"
                >
                  Confirm & Execute
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* MODAL 2: CREATE NEW ADMIN ACCOUNT */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showCreateAdminModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-md w-full p-6 rounded-3xl border border-amber-300 dark:border-amber-500/40 shadow-2xl bg-white dark:bg-[#170E28] space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <h3 className="font-extrabold text-slate-900 dark:text-white text-base font-mono flex items-center gap-2">
                  <span>Create Admin Account</span>
                </h3>
                <button
                  onClick={() => setShowCreateAdminModal(false)}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAdmin} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="e.g. John Ringmaster"
                    className="w-full bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@cwcseason4.com"
                    className="w-full bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Initial Password (Optional)</label>
                  <input
                    type="password"
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="Default: CWC4-Admin-2026"
                    className="w-full bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1">Role Tier</label>
                  <select
                    value={newAdminRole}
                    onChange={(e) => setNewAdminRole(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-[#120B1F] border border-slate-300 dark:border-white/15 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="admin">Standard Admin (Manage data, tasks, scores)</option>
                    <option value="superadmin">SuperAdmin (Absolute control & logs)</option>
                  </select>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateAdminModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createAdminSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-sm dark:shadow-neon-gold hover:brightness-110 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {createAdminSubmitting ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SuperAdminDashboard;
