import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, Code2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white/80 dark:bg-black/90 border-t border-slate-200 dark:border-white/10 relative overflow-hidden text-slate-600 dark:text-slate-400 text-sm transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-carnival-crimson to-carnival-gold p-0.5">
                <div className="w-full h-full rounded-[10px] bg-slate-100 dark:bg-[#0B0A16] flex items-center justify-center font-mono font-bold text-amber-600 dark:text-carnival-gold text-sm">
                  CWC
                </div>
              </div>
              <span className="font-extrabold text-slate-900 dark:text-white text-xl">Code With Curious</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed max-w-md">
              Code With Curious (CWC) Season 4 is the premier full-stack competitive coding carnival where student teams battle through 10 days of algorithms, speed sprints, power-ups, and grand hackathons.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-amber-600 dark:text-carnival-gold">
              <Sparkles className="w-4 h-4 text-amber-500 dark:text-carnival-gold" />
              <span>Carnival Edition 2026 • Live Arena</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider font-mono">Carnival Arena</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#about" className="hover:text-amber-600 dark:hover:text-carnival-gold transition-colors">About CWC</a></li>
              <li><a href="#timeline" className="hover:text-amber-600 dark:hover:text-carnival-gold transition-colors">10-Day Timeline</a></li>
              <li><a href="#prizes" className="hover:text-amber-600 dark:hover:text-carnival-gold transition-colors">Prize Pool & Honors</a></li>
              <li><a href="#teams" className="hover:text-amber-600 dark:hover:text-carnival-gold transition-colors">Registered Teams</a></li>
              <li><a href="#sponsors" className="hover:text-amber-600 dark:hover:text-carnival-gold transition-colors">Official Sponsors</a></li>
              <li><a href="#contact" className="hover:text-amber-600 dark:hover:text-carnival-gold transition-colors">Contact & Venue</a></li>
              <li><Link to="/login" className="hover:text-amber-600 dark:hover:text-carnival-gold transition-colors text-cyan-600 dark:text-carnival-cyan font-bold">Login Portal</Link></li>
            </ul>
          </div>

          {/* Technology Stack */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wider font-mono">Tech Infrastructure</h4>
            <ul className="space-y-2 text-xs font-mono text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-1.5"><Code2 className="w-3.5 h-3.5 text-cyan-600 dark:text-carnival-cyan" /> React 18 + Vite</li>
              <li className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-rose-600 dark:text-carnival-crimson" /> Fastify Backend API</li>
              <li className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-carnival-gold" /> Framer Motion + Tailwind</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div>
            © 2026 Code With Curious (CWC) Season 4. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-600 dark:text-carnival-crimson fill-rose-600 dark:fill-carnival-crimson animate-pulse" />
            <span>for Code Curious Students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
