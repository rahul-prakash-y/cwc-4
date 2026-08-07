import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronDown, Search, ShieldCheck, AlertCircle } from 'lucide-react';
import { RuleCategory } from '../../types';

export const OFFICIAL_RULES: RuleCategory[] = [
  {
    id: 'eligibility',
    title: '1. Eligibility & Team Setup',
    iconName: '🎓',
    description: 'Participation guidelines, student verification, and team formation rules.',
    badgeText: 'Mandatory',
    rules: [
      {
        title: 'Student Status & ID Verification',
        content: 'Open to all currently enrolled undergraduate and graduate students. A valid student ID card must be verified during registration.',
        tag: 'Verification',
      },
      {
        title: 'Team Size Constraint',
        content: 'Teams must consist of 2 to 3 registered members. Solo entries or squads larger than 3 members are strictly prohibited.',
        tag: '2-3 Members',
      },
      {
        title: 'Roster Lock Date',
        content: 'Team rosters are locked after Team Selection day. No substitution of members is allowed during the 10 days of competition.',
        tag: 'Strict Lock',
      },
    ],
  },
  {
    id: 'attendance',
    title: '2. Attendance & Mandatory Presence',
    iconName: '📋',
    description: 'Attendance thresholds and danger flag policies for hostellers and day scholars.',
    badgeText: 'Faculty Rule',
    rules: [
      {
        title: 'Daily Minimum Presence',
        content: 'Each team must have at least 50% of its registered members present for each daily arena session. Falling below triggers a warning flag.',
        tag: '50% Minimum',
      },
      {
        title: '60% Cumulative Attendance Rule',
        content: 'Teams must maintain at least 60% overall attendance across the 10 days of CWC Season 4 to qualify for prize podium distribution.',
        tag: 'Danger Flag',
      },
      {
        title: 'Hosteller & Day Scholar Protocols',
        content: 'Hostellers must check in physically at the lab arena; Day Scholars verify presence digitally before 23:59 IST daily.',
        tag: 'Check-in',
      },
    ],
  },
  {
    id: 'scoring',
    title: '3. Scoring & Point System',
    iconName: '🏆',
    description: 'How points are aggregated, speed multipliers, and leaderboard ranks.',
    badgeText: 'Scoring',
    rules: [
      {
        title: 'Point Distribution',
        content: 'Daily tasks yield between 150 to 1000 points based on difficulty (Quiz: 150-250 PTS, Code Battle: 250-350 PTS, Boss Fight: 500-1000 PTS).',
        tag: 'Points Table',
      },
      {
        title: 'Speed Bonus Multiplier',
        content: 'Submissions within the first 60 minutes of task announcement earn a +15% Speed Bonus added to total points.',
        tag: '+15% Bonus',
      },
      {
        title: 'Tie-Breaker Metric',
        content: 'In case of equal points on Day 10, total time to completion across all rounds breaks the tie.',
        tag: 'Tie-Breaker',
      },
    ],
  },
  {
    id: 'elimination',
    title: '4. Elimination & Danger Status',
    iconName: '💀',
    description: 'Criteria for team status degradation, danger flags, and elimination.',
    badgeText: 'Elimination',
    rules: [
      {
        title: 'Danger Zone Trigger',
        content: 'Failing to submit 2 consecutive daily tasks or dropping below attendance thresholds places the team in "Danger Zone" status.',
        tag: 'Danger Warning',
      },
      {
        title: 'Permanent Elimination',
        content: 'Accumulating 3 unexcused missed tasks or severe plagiarism results in permanent elimination from the tournament ladder.',
        tag: 'Knockout',
      },
      {
        title: 'Re-entry Redemption Task',
        content: 'Teams in Danger Zone may attempt a 12-hour emergency bug fix to clear danger status if awarded by Ringmaster Admin.',
        tag: 'Redemption',
      },
    ],
  },
  {
    id: 'immunity',
    title: '5. Immunity Shield Regulations',
    iconName: '🛡️',
    description: 'How to acquire and activate Immunity Shields to protect against score deductions.',
    badgeText: 'Protection',
    rules: [
      {
        title: 'Immunity Shield Activation',
        content: 'An Immunity Shield prevents point loss from 1 failed or missed daily quiz. Must be activated prior to task deadline.',
        tag: 'Shield Active',
      },
      {
        title: 'Earning Immunity',
        content: 'Immunity Shields are awarded by achieving a 3-day consecutive flawless score streak or winning special bonus rounds.',
        tag: 'Streak Reward',
      },
    ],
  },
  {
    id: 'advantages',
    title: '6. Advantages & Power-Up Vault',
    iconName: '⚡',
    description: 'Carnival special cards: Double Points, Golden Hint Wheel, and Time Extension.',
    badgeText: 'Carnival Feature',
    rules: [
      {
        title: '2x Double Point Multiplier Card',
        content: 'Doubles all points earned in a selected daily task. Limit: 1 use per team per season.',
        tag: '2x Multiplier',
      },
      {
        title: 'Golden Hint Wheel',
        content: 'Reveals 1 architectural solution clue during Boss Fight tasks without point deduction.',
        tag: 'Golden Hint',
      },
      {
        title: '30-Minute Time Extension',
        content: 'Extends submission window by 30 minutes without incurring late submission penalties.',
        tag: 'Time Extend',
      },
    ],
  },
  {
    id: 'bonus',
    title: '7. Bonus Challenges & Speed Relays',
    iconName: '🎁',
    description: 'Flash challenges, bug hunts, and extra point opportunities.',
    badgeText: 'Extra Points',
    rules: [
      {
        title: 'Flash Bug Hunt',
        content: 'Surprise 1-hour bug finding sprints announced via live WebSocket alerts yield up to +200 instant bonus points.',
        tag: 'Flash Sprint',
      },
      {
        title: 'Community Choice Award',
        content: 'Peer voting on UI/UX presentation during Hackathon days yields a +100 point spectator bonus.',
        tag: 'Community',
      },
    ],
  },
  {
    id: 'finale',
    title: '8. Grand Finale & Champion Coronation',
    iconName: '👑',
    description: 'Finale presentation, live judge panel scoring, and trophy distribution.',
    badgeText: 'Grand Finale',
    rules: [
      {
        title: 'Live Pitching & Code Defense',
        content: 'Top 3 teams pitch their Day 10 full-stack project live to a panel of senior engineers and faculty judges.',
        tag: 'Live Pitch',
      },
      {
        title: 'Final Score Calculation',
        content: 'Final Rank = (Cumulative 10-Day Points * 70%) + (Grand Finale Judge Score * 30%).',
        tag: 'Crown Metric',
      },
      {
        title: 'Trophy & Prize Distribution',
        content: 'Winner claims the CWC Season 4 Golden Trophy, cash prize pool, and verified digital certificates.',
        tag: 'Champion Glory',
      },
    ],
  },
];

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
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-cwc-red/10 blur-[130px] pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-cwc-gold font-display text-xs uppercase tracking-widest mb-3 font-semibold px-4 py-1.5 rounded-full bg-cwc-gold/10 border border-cwc-gold/30">
          <BookOpen className="w-4 h-4 text-cwc-gold" />
          <span>8 Core Rule Categories • Official Codex</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight mb-4">
          Carnival <span className="bg-gradient-to-r from-cwc-gold via-yellow-200 to-cwc-gold bg-clip-text text-transparent">Rule Book</span>
        </h2>
        <p className="text-gray-300 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Interactive regulations across Eligibility, Attendance, Scoring, Elimination, Immunity, Advantages, Bonus, and Finale.
        </p>

        {/* Search Bar */}
        <div className="relative max-w-md mx-auto mt-6">
          <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search rules, power-ups, penalties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-cwc-bg/80 backdrop-blur-md text-sm text-white placeholder-gray-400 border border-white/10 focus:border-cwc-gold focus:outline-none transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
          />
        </div>
      </div>

      {/* Accordion List of 8 Rule Categories */}
      <div className="space-y-5 relative z-10">
        {OFFICIAL_RULES.map((category: RuleCategory) => {
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
              className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 hover:border-white/30 hover:shadow-glow-gold hover:-translate-y-0.5 overflow-hidden shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out"
            >
              {/* Category Accordion Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-6 text-left flex items-center justify-between gap-4 bg-cwc-surface/4 hover:bg-cwc-surface/8 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cwc-purple/20 border border-cwc-purple/40 flex items-center justify-center text-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                    {category.iconName}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold font-display text-xl text-white">{category.title}</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-display font-bold bg-cwc-gold/20 text-cwc-gold border border-cwc-gold/30">
                        {category.badgeText}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{category.description}</p>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="p-2 rounded-lg bg-white/5 text-gray-300"
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
                    <div className="p-6 space-y-3 bg-cwc-bg/60">
                      {rulesToDisplay.map((rule, idx) => {
                        const isRuleOpen = openRuleIndex === idx || searchQuery.length > 0;

                        return (
                          <div
                            key={idx}
                            className="rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition-all"
                          >
                            <button
                              onClick={() => toggleRule(idx)}
                              className="w-full p-4 text-left flex items-center justify-between gap-3 hover:bg-white/5 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <ShieldCheck className="w-5 h-5 text-cwc-gold flex-shrink-0" />
                                <span className="font-bold text-sm text-gray-100 font-display">{rule.title}</span>
                                {rule.tag && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-display uppercase bg-cwc-purple/20 text-cwc-purple border border-cwc-purple/30 font-semibold">
                                    {rule.tag}
                                  </span>
                                )}
                              </div>
                              <ChevronDown
                                className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${
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
                                  <div className="p-4 pt-0 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/5 bg-cwc-bg/40">
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
      <div className="mt-8 p-6 rounded-2xl bg-cwc-red/10 backdrop-blur-lg border border-cwc-red/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] flex items-start gap-3 text-xs text-gray-300">
        <AlertCircle className="w-5 h-5 text-cwc-red flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-white font-semibold font-display">Note on Code Integrity:</strong> Code submissions are checked automatically for originality. Disqualification occurs immediately if unapproved AI solvers or plagiarized code bases are identified.
        </div>
      </div>
    </section>
  );
};
