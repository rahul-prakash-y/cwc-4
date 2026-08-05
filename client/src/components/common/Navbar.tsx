import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Shield, User, Lock, Menu, X, Compass, BookOpen, PartyPopper } from 'lucide-react';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Timeline', path: '/#timeline' },
    { label: 'Teams', path: '/#teams' },
    { label: 'Rule Book', path: '/rules' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0B0A16]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-carnival-crimson via-carnival-gold to-carnival-cyan p-0.5 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-[10px] bg-[#0B0A16] flex items-center justify-center">
              <span className="font-extrabold text-gradient-carnival font-mono text-lg">CWC</span>
            </div>
          </div>
          <div>
            <div className="font-black text-white text-lg tracking-tight flex items-center gap-1.5">
              <span>Code With Curious</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-carnival-crimson/20 text-carnival-crimson font-bold border border-carnival-crimson/30">
                S4
              </span>
            </div>
            <div className="text-[10px] text-carnival-gold font-mono tracking-widest uppercase">
              Carnival Edition 🎪
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 glass-card px-4 py-1.5 rounded-full border-white/10">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <a
                key={link.label}
                href={link.path}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-carnival-crimson text-white shadow-neon-crimson'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </a>
            );
          })}
        </nav>

        {/* Action Portal Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={triggerCarnivalConfetti}
            className="p-2.5 rounded-xl glass-card text-carnival-gold hover:border-carnival-gold/50 transition-all"
            title="Pop Confetti Celebration!"
          >
            <PartyPopper className="w-4 h-4" />
          </button>

          <Link
            to="/student"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl glass-card text-slate-100 hover:text-white font-semibold text-xs border border-white/10 hover:border-carnival-cyan/50 transition-all"
          >
            <User className="w-4 h-4 text-carnival-cyan" />
            <span>Student Portal</span>
          </Link>

          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-carnival-crimson to-carnival-purple text-white font-bold text-xs shadow-neon-crimson hover:scale-105 transition-all"
          >
            <Lock className="w-4 h-4" />
            <span>Admin Command</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl glass-card text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-card border-t border-white/10 p-4 space-y-3 bg-[#0B0A16]/95 backdrop-blur-2xl">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-200 hover:bg-white/5"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link
              to="/student"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 rounded-xl glass-card text-slate-100 text-xs font-semibold border border-carnival-cyan/40"
            >
              Student Portal Dashboard
            </Link>
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-2.5 rounded-xl bg-carnival-crimson text-white text-xs font-bold"
            >
              Admin Command Center
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
