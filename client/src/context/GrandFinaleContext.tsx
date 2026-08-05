import React, { createContext, useContext, useState, useEffect } from 'react';

interface GrandFinaleContextType {
  isGrandFinale: boolean;
  setIsGrandFinale: (val: boolean) => void;
  toggleGrandFinale: () => Promise<void>;
  loading: boolean;
}

const GrandFinaleContext = createContext<GrandFinaleContextType>({
  isGrandFinale: false,
  setIsGrandFinale: () => {},
  toggleGrandFinale: async () => {},
  loading: false,
});

export const GrandFinaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isGrandFinale, setIsGrandFinaleState] = useState<boolean>(() => {
    return localStorage.getItem('cwc_isGrandFinale') === 'true';
  });
  const [loading, setLoading] = useState<boolean>(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/v1/settings/grand-finale');
      if (res.ok) {
        const data = await res.json();
        const active = Boolean(data.isGrandFinale);
        setIsGrandFinaleState(active);
        localStorage.setItem('cwc_isGrandFinale', String(active));
      }
    } catch {
      // Fallback to local storage state if server is offline
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // sync every 10 sec
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isGrandFinale) {
      document.documentElement.classList.add('grand-finale-gold');
    } else {
      document.documentElement.classList.remove('grand-finale-gold');
    }
  }, [isGrandFinale]);

  const setIsGrandFinale = (val: boolean) => {
    setIsGrandFinaleState(val);
    localStorage.setItem('cwc_isGrandFinale', String(val));
  };

  const toggleGrandFinale = async () => {
    setLoading(true);
    const nextVal = !isGrandFinale;
    setIsGrandFinale(nextVal);

    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/v1/admin/grand-finale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ isGrandFinale: nextVal }),
      });
    } catch (e) {
      console.warn('Backend update failed, local toggle maintained', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GrandFinaleContext.Provider value={{ isGrandFinale, setIsGrandFinale, toggleGrandFinale, loading }}>
      {children}
    </GrandFinaleContext.Provider>
  );
};

export const useGrandFinale = () => useContext(GrandFinaleContext);
