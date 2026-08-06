import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles } from 'lucide-react';

export const FirstLoginGuard: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0A16] flex flex-col items-center justify-center text-white">
        <div className="w-12 h-12 border-4 border-carnival-crimson border-t-carnival-gold rounded-full animate-spin mb-4" />
        <div className="flex items-center gap-2 font-mono text-sm text-carnival-gold">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Verifying Ticket Credentials...</span>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If user is a student and isFirstLogin is true, block access and force redirect to /student/setup-password
  if (user?.role === 'student' && user?.isFirstLogin === true) {
    if (location.pathname !== '/student/setup-password') {
      return <Navigate to="/student/setup-password" replace />;
    }
  }

  // If user has already completed setup and tries to visit setup page, redirect to dashboard
  if (user?.role === 'student' && !user?.isFirstLogin && location.pathname === '/student/setup-password') {
    return <Navigate to="/student" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default FirstLoginGuard;
