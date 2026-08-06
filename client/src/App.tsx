import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GrandFinaleProvider } from './context/GrandFinaleContext';
import { SocketProvider } from './context/SocketContext';
import { GrandFinaleFX } from './components/common/GrandFinaleFX';
import { PublicLayout } from './layouts/PublicLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { LandingPage } from './pages/LandingPage';
import { RuleBookPage } from './pages/RuleBookPage';
import { LoginPage } from './pages/LoginPage';
import { LoginSelection } from './pages/public/LoginSelection';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { FirstLoginGuard } from './components/auth/FirstLoginGuard';
import { ForcePasswordChange } from './pages/student/ForcePasswordChange';

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <GrandFinaleProvider>
          <GrandFinaleFX />
          <BrowserRouter>
            <Routes>
              {/* Public Carnival Layout */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<LandingPage />} />
                <Route path="rules" element={<RuleBookPage />} />
                <Route path="login" element={<LoginSelection />} />
                <Route path="login/student" element={<LoginPage />} />
                <Route path="login/admin" element={<LoginPage />} />
              </Route>

              {/* Force Password Change (Distraction-free screen for First Login) */}
              <Route
                path="/student/setup-password"
                element={
                  <FirstLoginGuard>
                    <ForcePasswordChange />
                  </FirstLoginGuard>
                }
              />

              {/* Student Dashboard Layout (Protected by FirstLoginGuard) */}
              <Route
                path="/student"
                element={
                  <FirstLoginGuard>
                    <StudentLayout />
                  </FirstLoginGuard>
                }
              >
                <Route index element={<StudentDashboard />} />
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="tasks" element={<StudentDashboard />} />
                <Route path="advantages" element={<StudentDashboard />} />
                <Route path="leaderboard" element={<StudentDashboard />} />
              </Route>

              {/* Admin Command Layout (Protected) */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="superadmin" element={<AdminDashboard />} />
                <Route path="attendance" element={<AdminDashboard />} />
                <Route path="media" element={<AdminDashboard />} />
                <Route path="teams" element={<AdminDashboard />} />
                <Route path="tasks" element={<AdminDashboard />} />
                <Route path="scores" element={<AdminDashboard />} />
                <Route path="export" element={<AdminDashboard />} />
                <Route path="advantages" element={<AdminDashboard />} />
                <Route path="broadcasts" element={<AdminDashboard />} />
              </Route>

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </GrandFinaleProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

