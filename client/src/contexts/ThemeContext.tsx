import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useSocket } from '../context/SocketContext';

interface ThemeContextType {
  isGrandFinale: boolean;
  setIsGrandFinale: (val: boolean) => void;
  toggleGrandFinale: () => Promise<void>;
  triggerFireworks: () => void;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
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
  const [isGrandFinale, setIsGrandFinaleState] = useState<boolean>(() => {
    return localStorage.getItem('cwc_isGrandFinale') === 'true';
  });
  const [loading, setLoading] = useState<boolean>(false);
  const { socket } = useSocket();

  const triggerFireworks = useCallback(() => {
    triggerGrandFinaleFireworks();
  }, []);

  const fetchFinaleSettings = useCallback(async () => {
    try {
      const endpoints = [
        '/api/admin/settings/finale',
        '/api/v1/settings/grand-finale',
        '/api/v1/admin/grand-finale',
      ];
      for (const endpoint of endpoints) {
        const res = await fetch(endpoint);
        if (res.ok) {
          const data = await res.json();
          const active = Boolean(data.isGrandFinale);
          setIsGrandFinaleState(active);
          localStorage.setItem('cwc_isGrandFinale', String(active));
          break;
        }
      }
    } catch {
      // Retain localStorage state if offline
    }
  }, []);

  useEffect(() => {
    fetchFinaleSettings();
  }, [fetchFinaleSettings]);

  // Listen for FINALE_TRIGGERED WebSocket event
  useEffect(() => {
    if (!socket) return;

    const handleFinaleTriggered = (data: { isGrandFinale: boolean }) => {
      const active = Boolean(data.isGrandFinale);
      setIsGrandFinaleState(active);
      localStorage.setItem('cwc_isGrandFinale', String(active));

      if (active) {
        triggerGrandFinaleFireworks();
      }
    };

    socket.on('FINALE_TRIGGERED', handleFinaleTriggered);

    return () => {
      socket.off('FINALE_TRIGGERED', handleFinaleTriggered);
    };
  }, [socket]);

  // Apply Theme CSS Class to document body/html globally
  useEffect(() => {
    if (isGrandFinale) {
      document.documentElement.classList.add('grand-finale-gold');
      document.documentElement.setAttribute('data-theme', 'gold');
    } else {
      document.documentElement.classList.remove('grand-finale-gold');
      document.documentElement.removeAttribute('data-theme');
    }
  }, [isGrandFinale]);

  const setIsGrandFinale = (val: boolean) => {
    setIsGrandFinaleState(val);
    localStorage.setItem('cwc_isGrandFinale', String(val));
    if (val) triggerGrandFinaleFireworks();
  };

  const toggleGrandFinale = async () => {
    setLoading(true);
    const nextVal = !isGrandFinale;
    setIsGrandFinale(nextVal);

    try {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      await fetch('/api/admin/settings/finale', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ isGrandFinale: nextVal }),
      });
    } catch (e) {
      console.warn('Backend update failed, local toggle maintained', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
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
