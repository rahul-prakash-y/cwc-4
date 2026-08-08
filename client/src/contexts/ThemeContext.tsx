import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import apiClient from '@/api/axios';

export type EventMode = 'standard' | 'carnival' | 'finale';
export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
  eventMode: EventMode;
  setEventMode: (mode: EventMode) => void;
  isGrandFinale: boolean;
  setIsGrandFinale: (val: boolean) => void;
  toggleGrandFinale: () => Promise<void>;
  triggerFireworks: () => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  setTheme: async () => {},
  toggleTheme: async () => {},
  eventMode: 'standard',
  setEventMode: () => {},
  isGrandFinale: false,
  setIsGrandFinale: () => {},
  toggleGrandFinale: async () => {},
  triggerFireworks: () => {},
  loading: false,
});

export const triggerGrandFinaleFireworks = () => {
  const duration = 5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 35, spread: 360, ticks: 70, zIndex: 99999 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval: any = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 60 * (timeLeft / duration);

    // Fire golden confetti fireworks burst from left and right
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#FFD700', '#FFA500', '#FFFFFF', '#F59E0B', '#FBBF24'],
    });

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#FFD700', '#FFA500', '#FFFFFF', '#F59E0B', '#FBBF24'],
    });
  }, 250);
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser } = useAuth();
  const { socket } = useSocket();

  // 1. Authenticated User's theme preference (database-driven + localStorage persistence)
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cwc_theme') as ThemeMode;
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return user?.themePreference || 'dark';
  });

  // 2. Global Event Mode (from Global Settings API / WebSockets)
  const [eventMode, setEventModeState] = useState<EventMode>('standard');
  const [loading, setLoading] = useState<boolean>(false);

  const isGrandFinale = eventMode === 'finale';

  // Sync state when user object updates from DB (only if localStorage is not explicitly set)
  useEffect(() => {
    if (user?.themePreference && ['light', 'dark'].includes(user.themePreference)) {
      const saved = localStorage.getItem('cwc_theme');
      if (!saved) {
        setThemeState(user.themePreference);
        localStorage.setItem('cwc_theme', user.themePreference);
      }
    }
  }, [user?.themePreference]);

  // Task 3: Listen to theme & manually add/remove 'dark' and 'light' class on <html> element and sync to localStorage
  useEffect(() => {
    const root = window.document.documentElement;
    localStorage.setItem('cwc_theme', theme);
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  // Task 3: Listen to global eventMode to swap out CSS textures
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('mode-standard', 'mode-carnival', 'mode-finale', 'grand-finale-gold');
    root.removeAttribute('data-event-mode');
    root.removeAttribute('data-theme');

    root.classList.add(`mode-${eventMode}`);
    root.setAttribute('data-event-mode', eventMode);

    if (eventMode === 'finale') {
      root.classList.add('grand-finale-gold');
      root.setAttribute('data-theme', 'gold');
    }
  }, [eventMode]);

  const triggerFireworks = useCallback(() => {
    triggerGrandFinaleFireworks();
  }, []);

  // Fetch global event mode settings from backend DB
  const fetchGlobalSettings = useCallback(async () => {
    try {
      const endpoints = [
        '/api/settings/global',
        '/api/v1/settings/global',
        '/api/settings/grand-finale',
        '/api/v1/settings/grand-finale',
      ];
      for (const endpoint of endpoints) {
        try {
          const res = await apiClient.get(endpoint);
          const data = res.data;
          let mode: EventMode | null = null;

          if (data?.eventMode && ['standard', 'carnival', 'finale'].includes(data.eventMode)) {
            mode = data.eventMode as EventMode;
          } else if (data?.isGrandFinale || data?.data?.isGrandFinale) {
            mode = 'finale';
          } else if (data?.eventMode === undefined && data?.isGrandFinale === false) {
            mode = 'carnival';
          }

          if (mode) {
            setEventModeState(mode);
            break;
          }
        } catch {
          // Continue trying fallback endpoints
        }
      }
    } catch (e) {
      console.warn('Failed to fetch global event mode settings:', e);
    }
  }, []);

  useEffect(() => {
    fetchGlobalSettings();
  }, [fetchGlobalSettings]);

  // WebSocket listeners for real-time Event Mode & Grand Finale updates
  useEffect(() => {
    if (!socket) return;

    const handleFinaleTriggered = (data: { isGrandFinale: boolean; eventMode?: EventMode }) => {
      const active = Boolean(data.isGrandFinale);
      const newMode = data.eventMode || (active ? 'finale' : 'carnival');
      setEventModeState(newMode);
      if (active || newMode === 'finale') {
        triggerGrandFinaleFireworks();
      }
    };

    const handleEventModeChanged = (data: { eventMode: EventMode }) => {
      if (data.eventMode && ['standard', 'carnival', 'finale'].includes(data.eventMode)) {
        setEventModeState(data.eventMode);
        if (data.eventMode === 'finale') {
          triggerGrandFinaleFireworks();
        }
      }
    };

    socket.on('FINALE_TRIGGERED', handleFinaleTriggered);
    socket.on('EVENT_MODE_CHANGED', handleEventModeChanged);

    return () => {
      socket.off('FINALE_TRIGGERED', handleFinaleTriggered);
      socket.off('EVENT_MODE_CHANGED', handleEventModeChanged);
    };
  }, [socket]);

  // Persistent Theme Toggle with background DB sync
  const toggleTheme = async () => {
    const nextTheme: ThemeMode = theme === 'dark' ? 'light' : 'dark';

    // 1. Permanently update local UI & localStorage
    setThemeState(nextTheme);
    localStorage.setItem('cwc_theme', nextTheme);

    const root = window.document.documentElement;
    if (nextTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    if (!user) return;

    updateUser({ themePreference: nextTheme });

    // 2. Background API call to sync preference if user is authenticated
    try {
      const res = await apiClient.patch('/auth/theme', { theme: nextTheme });
      if (res.data?.user) {
        updateUser(res.data.user);
      }
    } catch (err) {
      console.warn('Backend theme preference sync skipped or failed:', err);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    if (newTheme === theme) return;

    setThemeState(newTheme);
    localStorage.setItem('cwc_theme', newTheme);

    const root = window.document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    if (!user) return;

    updateUser({ themePreference: newTheme });

    try {
      const res = await apiClient.patch('/auth/theme', { theme: newTheme });
      if (res.data?.user) {
        updateUser(res.data.user);
      }
    } catch (err) {
      console.warn('Backend theme preference sync skipped or failed:', err);
    }
  };

  const setEventMode = (mode: EventMode) => {
    setEventModeState(mode);
    if (mode === 'finale') {
      triggerGrandFinaleFireworks();
    }
  };

  const setIsGrandFinale = (val: boolean) => {
    const mode: EventMode = val ? 'finale' : 'carnival';
    setEventMode(mode);
  };

  const toggleGrandFinale = async () => {
    setLoading(true);
    const nextVal = !isGrandFinale;
    setIsGrandFinale(nextVal);

    try {
      await apiClient.patch('/admin/settings/finale', { isGrandFinale: nextVal });
    } catch (e) {
      console.warn('Backend update failed, local toggle maintained', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        eventMode,
        setEventMode,
        isGrandFinale,
        setIsGrandFinale,
        toggleGrandFinale,
        triggerFireworks,
        loading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export const useGrandFinaleTheme = () => useContext(ThemeContext);
