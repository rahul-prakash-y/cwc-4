import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { StudentLayout } from './layouts/StudentLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { LandingPage } from './pages/LandingPage';
import { RuleBookPage } from './pages/RuleBookPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { AdminDashboard } from './pages/AdminDashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Carnival Layout */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="rules" element={<RuleBookPage />} />
        </Route>

        {/* Student Dashboard Layout */}
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="tasks" element={<StudentDashboard />} />
          <Route path="advantages" element={<StudentDashboard />} />
          <Route path="leaderboard" element={<StudentDashboard />} />
        </Route>

        {/* Admin Command Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="teams" element={<AdminDashboard />} />
          <Route path="tasks" element={<AdminDashboard />} />
          <Route path="advantages" element={<AdminDashboard />} />
          <Route path="broadcasts" element={<AdminDashboard />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
