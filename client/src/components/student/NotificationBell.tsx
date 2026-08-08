import React, { useState, useEffect, useRef } from 'react';
import { Bell, CheckCircle2, Zap, Megaphone, X } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'announcement' | 'advantage' | 'info';
  read: boolean;
}

export const NotificationBell: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const { apiFetch } = useAuth();

  // Load initial notifications (e.g., public announcements)
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      try {
        const metaEnv = (import.meta as any).env || {};
        const backendUrl =
          metaEnv.VITE_API_URL ||
          (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);

        const res = await fetch(`${backendUrl}/api/v1/public/announcements`);
        if (res.ok) {
          const data = await res.json();
          const items: NotificationItem[] = (data.announcements || data || []).slice(0, 5).map((a: any) => ({
            id: a._id || Math.random().toString(),
            title: a.title || 'New Announcement',
            message: a.content || a.message || '',
            timestamp: a.createdAt || new Date().toISOString(),
            type: 'announcement',
            read: false,
          }));
          setNotifications(items);
          setUnreadCount(items.filter((i) => !i.read).length);
        }
      } catch (err) {
        console.error('Failed to load initial notifications:', err);
      }
    };

    fetchInitialNotifications();
  }, []);

  // Listen to WebSocket events for real-time notifications
  useEffect(() => {
    if (!socket) return;

    const handleNewAnnouncement = (payload: any) => {
      const newNotif: NotificationItem = {
        id: payload._id || Math.random().toString(),
        title: payload.title || '📢 New Announcement',
        message: payload.content || payload.message || 'Check the announcement board for details.',
        timestamp: payload.timestamp || new Date().toISOString(),
        type: 'announcement',
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    const handleAdvantageGranted = (payload: any) => {
      const newNotif: NotificationItem = {
        id: payload._id || Math.random().toString(),
        title: payload.title || '⚡ Power-Up Advantage Granted!',
        message: payload.message || `Advantage "${payload.advantageType || 'Power-Up'}" has been awarded to your squad!`,
        timestamp: payload.timestamp || new Date().toISOString(),
        type: 'advantage',
        read: false,
      };

      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((prev) => prev + 1);
    };

    socket.on('NEW_ANNOUNCEMENT', handleNewAnnouncement);
    socket.on('ADVANTAGE_GRANTED', handleAdvantageGranted);

    return () => {
      socket.off('NEW_ANNOUNCEMENT', handleNewAnnouncement);
      socket.off('ADVANTAGE_GRANTED', handleAdvantageGranted);
    };
  }, [socket]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen((prev) => {
      const nextState = !prev;
      if (nextState) {
        // Mark all as read when opening dropdown
        setUnreadCount(0);
        setNotifications((items) => items.map((i) => ({ ...i, read: true })));
      }
      return nextState;
    });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="p-2 rounded-xl glass-card text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white relative transition-all duration-200 border border-slate-200 dark:border-white/10 hover:border-amber-500 dark:hover:border-carnival-gold/40"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 dark:bg-carnival-crimson text-white font-mono text-[10px] font-bold flex items-center justify-center shadow-md dark:shadow-[0_0_10px_rgba(255,0,85,0.8)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-card border border-slate-200 dark:border-carnival-gold/30 shadow-xl dark:shadow-2xl bg-white dark:bg-[#140E26] backdrop-blur-2xl z-50 overflow-hidden font-sans">
          {/* Dropdown Header */}
          <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-black/40">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-600 dark:text-carnival-gold" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm font-mono">Arena Broadcast Alerts</h3>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 font-mono text-xs space-y-2">
                <Bell className="w-6 h-6 mx-auto text-slate-400 dark:text-slate-600" />
                <p>No new arena notifications</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors flex items-start gap-3 relative"
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${
                      notif.type === 'advantage'
                        ? 'bg-amber-100 dark:bg-amber-500/20 border-amber-300 dark:border-amber-500/40 text-amber-700 dark:text-amber-400'
                        : 'bg-purple-100 dark:bg-carnival-purple/20 border-purple-200 dark:border-carnival-purple/40 text-purple-700 dark:text-carnival-purple'
                    }`}
                  >
                    {notif.type === 'advantage' ? <Zap className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-xs truncate">{notif.title}</h4>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono shrink-0">
                        {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 dark:bg-black/40 border-t border-slate-200 dark:border-white/10 text-center">
            <button
              onClick={() => {
                setNotifications((items) => items.map((i) => ({ ...i, read: true })));
                setUnreadCount(0);
              }}
              className="text-[11px] font-mono font-bold text-amber-600 dark:text-carnival-gold hover:underline"
            >
              Clear Badge Counter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
