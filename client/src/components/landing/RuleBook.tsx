import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, Search, ShieldCheck, AlertCircle } from 'lucide-react';
import { MOCK_RULES } from '../../data/mockData';
import { RuleCategory } from '../../types';

export const RuleBook: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategory, setOpenCategory] = useState<string>('eligibility');
  const [openRuleIndex, setOpenRuleIndex] = useState<number | null>(0);

  const toggleCategory = (id: string) => {
    setOpenCategory(openCategory === id ? '' : id);
    setOpenRuleIndex(0);
  };

  const toggleRule = (index: number) => {
    setOpenRuleIndex(openRuleIndex === index ? null : index);
  };

  return (
    <section id="rules" className="py-20 px-4 max-w-5xl mx-auto relative">
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-carnival-crimson/10 blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-carnival-crimson font-mono text-xs uppercase tracking-widest mb-2 font-semibold px-4 py-1.5 rounded-full bg-carnival-crimson/10 border border-carnival-crimson/30">
          <BookOpen className="w-4 h-4 text-carnival-crimson" />
          <span>8 Core Rule Categories • Official Codex</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight mb-4">
          Carnival <span className="text-gradient-carnival">Rule Book</span>
        </h2>
        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
          Interactive regulations across Eligibility, Attendance, Scoring, Elimination, Immunity, Advantages, Bonus, and Finale.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mt-6">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rules, power-ups, penalties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl glass-card text-sm text-white placeholder-slate-400 border border-white/10 focus:border-carnival-gold/50 focus:outline-none transition-all shadow-lg"
          />
        </div>
      </div>

      {/* Accordion List of 8 Rule Categories */}
      <div className="space-y-4 relative z-10">
        {MOCK_RULES.map((category: RuleCategory) => {
          const isOpen = openCategory === category.id || searchQuery.length > 0;

          // Filter rules if searching
          const matchingRules = category.rules.filter(
            (r) =>
              r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.content.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (searchQuery.length > 0 && matchingRules.length === 0) {
            return null;
          }

          const rulesToDisplay = searchQuery.length > 0 ? matchingRules : category.rules;

          return (
            <div
              key={category.id}
              className="glass-card rounded-2xl border border-white/10 hover:border-carnival-gold/40 overflow-hidden shadow-xl transition-all"
            >
              {/* Category Accordion Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 bg-carnival-card/80 hover:bg-carnival-card transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-carnival-purple/20 border border-carnival-purple/40 flex items-center justify-center text-2xl shadow-inner">
                    {category.iconName}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-xl text-white">{category.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/30">
                        {category.badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{category.description}</p>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-2 rounded-lg bg-white/5 text-slate-300"
                >
                  <ChevronDown className="w-5 h-5" />
                </motion.div>
              </button>

              {/* Category Rules Content Accordion */}
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden border-t border-white/10"
                  >
                    <div className="p-6 space-y-3 bg-black/30">
                      {rulesToDisplay.map((rule, idx) => {
                        const isRuleOpen = openRuleIndex === idx || searchQuery.length > 0;

                        return (
                          <div
                            key={idx}
                            className="rounded-xl border border-white/5 bg-white/5 overflow-hidden hover:border-carnival-gold/30 transition-all"
                          >
                            <button
                              onClick={() => toggleRule(idx)}
                              className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-white/5 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-carnival-cyan flex-shrink-0" />
                                <span className="font-bold text-sm text-slate-100">{rule.title}</span>
                                {rule.tag && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-carnival-cyan/20 text-carnival-cyan border border-carnival-cyan/30">
                                    {rule.tag}
                                  </span>
                                )}
                              </div>
                              <ChevronDown
                                className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${
                                  isRuleOpen ? 'rotate-180' : ''
                                }`}
                              />
                            </button>

                            <AnimatePresence>
                              {isRuleOpen && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.25 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-4 pt-0 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 bg-black/20">
                                    {rule.content}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Disqualification Warning Note */}
      <div className="mt-8 p-4 rounded-xl glass-card border border-carnival-crimson/30 flex items-start gap-3 text-xs text-slate-300">
        <AlertCircle className="w-5 h-5 text-carnival-crimson flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white font-semibold">Note on Code Integrity:</strong> Code submissions are checked automatically for originality. Disqualification occurs immediately if unapproved AI solvers or plagiarized code bases are identified.
        </div>
      </div>
    </section>
  );
};
