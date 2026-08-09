import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  AlertTriangle,
  Lock,
  Activity,
  Search,
  RefreshCw,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Terminal,
  Globe,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Server
} from 'lucide-react';
import api from '../../api/axios';
import { TableSkeleton } from '../../components/ui/Skeletons';
import { EmptyState } from '../../components/ui/EmptyState';

interface AuditLogItem {
  _id: string;
  actorId?: string | { _id: string; name?: string; email?: string };
  actorRole: string;
  action: string;
  resource?: string;
  ipAddress: string;
  userAgent?: string;
  details?: Record<string, any>;
  timestamp: string;
  adminEmail?: string;
  adminId?: string;
  targetId?: string;
  targetType?: string;
}

export const Threats: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(15);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [actionFilter, setActionFilter] = useState<string>('ALL');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [copiedIp, setCopiedIp] = useState<string | null>(null);

  // Statistics counters
  const [stats, setStats] = useState({
    threatsCount: 0,
    rateLimitCount: 0,
    loginFailedCount: 0,
    loginSuccessCount: 0,
  });

  const fetchThreatLogs = useCallback(async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });

      if (search.trim()) queryParams.append('search', search.trim());
      if (actionFilter !== 'ALL') queryParams.append('action', actionFilter);

      const res = await api.get(`/superadmin/threats?${queryParams.toString()}`);
      const data = res.data;

      const fetchedLogs: AuditLogItem[] = data.logs || [];
      setLogs(fetchedLogs);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);

      // Aggregate high-level stats from current page and general sample
      const threats = fetchedLogs.filter((l) => l.action === 'SECURITY_THREAT').length;
      const rateLimits = fetchedLogs.filter((l) => l.action === 'RATE_LIMIT_EXCEEDED').length;
      const loginFails = fetchedLogs.filter((l) => l.action === 'LOGIN_FAILED').length;
      const loginSuccess = fetchedLogs.filter((l) => l.action === 'LOGIN_SUCCESS').length;

      setStats({
        threatsCount: threats,
        rateLimitCount: rateLimits,
        loginFailedCount: loginFails,
        loginSuccessCount: loginSuccess,
      });
    } catch (error) {
      console.error('Failed to fetch security threat logs:', error);
    } finally {
      setLoading(false);
    }
  }, [page, limit, search, actionFilter]);

  useEffect(() => {
    fetchThreatLogs();
  }, [fetchThreatLogs]);

  // Auto-refresh interval every 10 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchThreatLogs();
    }, 10000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchThreatLogs]);

  const handleCopyIp = (ip: string) => {
    navigator.clipboard.writeText(ip);
    setCopiedIp(ip);
    setTimeout(() => setCopiedIp(null), 2000);
  };

  const isThreatAction = (action: string) => {
    return ['SECURITY_THREAT', 'LOGIN_FAILED', 'RATE_LIMIT_EXCEEDED', 'MALICIOUS_PAYLOAD'].includes(action);
  };

  const getBadgeStyle = (action: string) => {
    switch (action) {
      case 'SECURITY_THREAT':
        return 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'RATE_LIMIT_EXCEEDED':
        return 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'LOGIN_FAILED':
        return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      case 'LOGIN_SUCCESS':
        return 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'TASK_CREATED':
      case 'TASK_UPDATED':
      case 'TASK_DELETED':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'SCORE_ALTERED':
      case 'SCORE_UPDATED':
      case 'ADVANTAGE_GRANTED':
        return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'USER_BLOCKED':
      case 'USER_DELETED':
      case 'BLOCK_ACCOUNT':
        return 'bg-rose-600/20 text-rose-500 dark:text-rose-300 border-rose-600/40';
      default:
        return 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/10';
    }
  };

  const formatTimestamp = (ts: string) => {
    try {
      const d = new Date(ts);
      return {
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
    } catch {
      return { date: ts, time: '' };
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner Header */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#18122B] border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  SuperAdmin Threat & Security Telemetry
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Real-time Anti-DDoS rate-limit tracking, access control audits, and threat event forensicator.
                </p>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
                autoRefresh
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-100 dark:bg-black/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-white/10'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              {autoRefresh ? 'Auto Live (10s)' : 'Live Off'}
            </button>

            <button
              onClick={() => fetchThreatLogs()}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-white transition border border-slate-200 dark:border-white/10 disabled:opacity-50"
              title="Refresh Telemetry Logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Security Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#18122B] border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Audit Events</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{total}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#18122B] border border-rose-500/30 dark:border-rose-500/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-rose-500 uppercase tracking-wider">Security Threats</p>
            <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.threatsCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
            <Lock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#18122B] border border-amber-500/30 dark:border-amber-500/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-500 uppercase tracking-wider">Rate Limit Hits</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.rateLimitCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#18122B] border border-red-500/30 dark:border-red-500/30 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider">Failed Logins</p>
            <p className="text-2xl font-black text-red-600 dark:text-red-400 mt-1">{stats.loginFailedCount}</p>
          </div>
          <div className="p-3 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#18122B] border border-slate-200 dark:border-white/10 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search IP, Action, Actor, URI..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 dark:focus:border-rose-500 transition"
          />
        </div>

        {/* Action filter dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <Filter className="w-4 h-4" />
            <span>Action:</span>
          </div>
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 transition"
          >
            <option value="ALL">All Event Types</option>
            <option value="SECURITY_THREAT">🚨 SECURITY_THREAT</option>
            <option value="RATE_LIMIT_EXCEEDED">⚡ RATE_LIMIT_EXCEEDED</option>
            <option value="LOGIN_FAILED">❌ LOGIN_FAILED</option>
            <option value="LOGIN_SUCCESS">✅ LOGIN_SUCCESS</option>
            <option value="LOGOUT">🚪 LOGOUT</option>
            <option value="TASK_CREATED">🎯 TASK_CREATED</option>
            <option value="TASK_UPDATED">✏️ TASK_UPDATED</option>
            <option value="SCORE_ALTERED">📊 SCORE_ALTERED</option>

            <option value="ADVANTAGE_GRANTED">🎁 ADVANTAGE_GRANTED</option>
            <option value="USER_BLOCKED">🚫 USER_BLOCKED</option>
            <option value="USER_DELETED">🗑️ USER_DELETED</option>
            <option value="SETTINGS_UPDATED">⚙️ SETTINGS_UPDATED</option>
          </select>

          {(search || actionFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearch('');
                setActionFilter('ALL');
                setPage(1);
              }}
              className="text-xs text-rose-500 font-semibold hover:underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Audit Telemetry Table */}
      {loading && logs.length === 0 ? (
        <TableSkeleton rows={5} cols={6} className="min-h-[380px]" />
      ) : !loading && logs.length === 0 ? (
        <EmptyState
          title="No Security Logs Found"
          description="No security threat logs match the current filter parameters."
          icon={ShieldAlert}
        />
      ) : (
        <div className="bg-white dark:bg-[#18122B] border border-slate-200 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Client IP</th>
                  <th className="py-3.5 px-4">Action Event</th>
                  <th className="py-3.5 px-4">Actor / Role</th>
                  <th className="py-3.5 px-4">Resource Endpoint</th>
                  <th className="py-3.5 px-4 text-right">Details & Payload</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-xs font-mono">
                {logs.map((log) => {
                  const isThreat = isThreatAction(log.action);
                  const { date, time } = formatTimestamp(log.timestamp);
                  const actorEmail =
                    log.adminEmail ||
                    (typeof log.actorId === 'object' ? log.actorId?.email : '') ||
                    log.details?.email ||
                    log.details?.attemptedEmail ||
                    'Anonymous';

                  return (
                    <tr
                      key={log._id}
                      className={`transition ${
                        isThreat
                          ? 'bg-rose-500/10 dark:bg-rose-950/20 text-rose-950 dark:text-rose-100 hover:bg-rose-500/20'
                          : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div>
                            <p className="font-bold">{date}</p>
                            <p className="text-[10px] text-slate-400 font-sans">{time}</p>
                          </div>
                        </div>
                      </td>

                      {/* IP Address */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 font-bold">
                          <Globe className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.ipAddress}</span>
                          <button
                            onClick={() => handleCopyIp(log.ipAddress)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
                            title="Copy IP"
                          >
                            {copiedIp === log.ipAddress ? (
                              <Check className="w-3 h-3 text-emerald-500" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Action Event */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black border uppercase tracking-wider ${getBadgeStyle(
                            log.action
                          )}`}
                        >
                          {isThreat && <AlertTriangle className="w-3 h-3 shrink-0" />}
                          {log.action}
                        </span>
                      </td>

                      {/* Actor / Role */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div>
                            <p className="font-bold truncate max-w-[160px]" title={actorEmail}>
                              {actorEmail}
                            </p>
                            <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-semibold uppercase">
                              {log.actorRole}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Resource Endpoint */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 max-w-[180px] truncate" title={log.resource}>
                          <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate">
                            {log.resource || 'N/A'}
                          </span>
                        </div>
                      </td>

                      {/* Details & Payload button */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-900 dark:text-white transition font-sans text-xs font-semibold inline-flex items-center gap-1.5 border border-slate-200 dark:border-white/10"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspect Payload
                        </button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {/* Table Footer & Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/40 flex items-center justify-between font-sans text-xs text-slate-500 dark:text-slate-400">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{logs.length}</strong> of{' '}
            <strong className="text-slate-900 dark:text-white">{total}</strong> telemetry entries
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-semibold">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-white/10 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Forensic Details Modal */}
      <AnimatePresence>
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl bg-white dark:bg-[#18122B] border border-slate-200 dark:border-white/20 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">
                      Security Event Forensic Details
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{selectedLog._id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1 rounded-lg text-lg"
                >
                  ✕
                </button>
              </div>

              {/* Event Properties */}
              <div className="grid grid-cols-2 gap-3 mb-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10">
                  <span className="text-slate-400 font-sans block text-[10px] uppercase font-bold">Action</span>
                  <span className="font-bold text-rose-500">{selectedLog.action}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10">
                  <span className="text-slate-400 font-sans block text-[10px] uppercase font-bold">Client IP</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLog.ipAddress}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10">
                  <span className="text-slate-400 font-sans block text-[10px] uppercase font-bold">Actor Role</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedLog.actorRole}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10">
                  <span className="text-slate-400 font-sans block text-[10px] uppercase font-bold">Timestamp</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* User Agent */}
              {selectedLog.userAgent && (
                <div className="mb-4">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                    Client User Agent Header
                  </label>
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-black/50 text-slate-700 dark:text-slate-300 font-mono text-xs border border-slate-200 dark:border-white/10 break-all">
                    {selectedLog.userAgent}
                  </div>
                </div>
              )}

              {/* JSON Details Body */}
              <div>
                <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                  Details / Body Diff Payload (JSON)
                </label>
                <pre className="p-4 rounded-xl bg-slate-900 text-emerald-400 font-mono text-xs max-h-60 overflow-y-auto border border-white/10 leading-relaxed">
                  {JSON.stringify(selectedLog.details || {}, null, 2)}
                </pre>
              </div>

              <div className="mt-6 text-right">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition shadow-lg"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Threats;
