import React from 'react';
import { ThemeProvider, useTheme } from '../contexts/ThemeContext';

export const GrandFinaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ThemeProvider>{children}</ThemeProvider>;
};

export const useGrandFinale = () => {
  const theme = useTheme();
  return {
    isGrandFinale: theme.isGrandFinale,
    setIsGrandFinale: theme.setIsGrandFinale,
    toggleGrandFinale: theme.toggleGrandFinale,
    triggerFireworks: theme.triggerFireworks,
    loading: theme.loading,
  };
};
