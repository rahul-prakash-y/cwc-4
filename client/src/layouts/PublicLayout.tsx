import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';

export const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0B0A16] text-slate-100 flex flex-col font-sans selection:bg-carnival-crimson selection:text-white">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};
