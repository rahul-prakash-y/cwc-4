import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Sparkles,
  User,
  Lock,
  Menu,
  X,
  PartyPopper,
  LogIn,
  Ticket,
} from "lucide-react";
import { triggerCarnivalConfetti } from "../hero/ConfettiEffect";
import { ThemeToggle } from "../layout/ThemeToggle";

export const Navbar: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", path: "/" },
    // { label: "About", path: "/about" },
    { label: "Gallery", path: "/gallery" },
    // { label: "Prizes", path: "/prizes" },
    { label: "Teams", path: "/teams" },
    // { label: "Sponsors", path: "/sponsors" },
    { label: "Contact", path: "/contact" },
    // { label: "Rule Book", path: "/rules" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#05050A]/85 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-2xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cwc-red via-cwc-gold to-cwc-purple p-0.5 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full rounded-full bg-white dark:bg-cwc-bg flex items-center justify-center">
              <img
                src="https://res.cloudinary.com/dsz2br3qg/image/upload/v1756912823/codecirclelogo_excanr.png"
                alt="cwc logo"
                className="w-10 h-10 object-contain rounded-full"
                crossOrigin="anonymous"
              />
            </div>
          </div>
          <div>
            <div className="font-black font-display text-gray-900 dark:text-white text-lg tracking-tight flex items-center gap-1.5">
              <span>Code With Curious</span>
              <span className="text-[10px] text-center size-9  font-display px-2 py-0.5 rounded-full bg-cwc-red/20 text-cwc-red font-bold border border-cwc-red/30">
                S4
              </span>
            </div>
            <div className="text-[10px] text-cwc-gold font-display tracking-widest uppercase font-semibold">
              Carnival Edition 🎪
            </div>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 bg-white/70 dark:bg-cwc-surface backdrop-blur-xl px-4 py-1.5 rounded-full border border-gray-200 dark:border-white/10 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.label}
                to={link.path}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold font-display transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-cwc-red to-rose-900 text-white shadow-glow-red border border-white/20"
                    : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/50 dark:hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Portal Buttons & Theme Toggle */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />

          <button
            onClick={triggerCarnivalConfetti}
            className="p-2.5 rounded-xl bg-white/80 dark:bg-cwc-surface backdrop-blur-lg text-cwc-gold border border-amber-300/40 dark:border-cwc-gold/30 hover:-translate-y-1 hover:border-cwc-gold/60 hover:shadow-glow-gold transition-all duration-300 ease-out cursor-pointer"
            title="Pop Confetti Celebration!"
          >
            <PartyPopper className="w-4 h-4 text-amber-500 dark:text-cwc-gold" />
          </button>

          {/* <Link
            to="/register"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cwc-red to-[#9F1239] text-white font-bold font-display text-xs tracking-wide border border-white/15 shadow-sm dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_15px_rgba(225,29,72,0.3)] hover:-translate-y-1 hover:border-white/30 hover:shadow-glow-red transition-all duration-300 ease-out"
          >
            <Ticket className="w-3.5 h-3.5 fill-current" />
            <span>Register Team</span>
          </Link> */}

          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 dark:bg-cwc-surface backdrop-blur-lg text-amber-600 dark:text-cwc-gold font-bold font-display text-xs tracking-wide border border-amber-300/40 dark:border-cwc-gold/30 hover:-translate-y-1 hover:border-cwc-gold/60 hover:shadow-glow-gold transition-all duration-300 ease-out"
          >
            <LogIn className="w-3.5 h-3.5 text-amber-500 dark:text-cwc-gold" />
            <span>Login Gate</span>
          </Link>
        </div>

        {/* Mobile Controls */}
        <div className="xl:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-white/80 dark:bg-cwc-surface backdrop-blur-lg text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-white/10"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white/95 dark:bg-[#05050A]/95 backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 p-5 space-y-3 shadow-lg">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-bold font-display text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-cwc-red dark:hover:text-cwc-gold transition-all"
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-slate-200 dark:border-white/10 flex flex-col gap-2.5">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-3 rounded-xl bg-cwc-surface border border-cwc-gold/40 text-cwc-gold text-xs font-bold font-display tracking-wide shadow-glow-gold/20"
            >
              Carnival Login Gate
            </Link>
            <Link
              to="/login/student"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-3 rounded-xl bg-white/5 text-gray-100 text-xs font-bold font-display border border-white/10"
            >
              Student Portal
            </Link>
            <Link
              to="/login/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center px-4 py-3 rounded-xl bg-gradient-to-r from-cwc-red to-[#9F1239] text-white text-xs font-bold font-display tracking-wide"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
