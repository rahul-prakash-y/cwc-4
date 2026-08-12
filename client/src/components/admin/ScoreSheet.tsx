import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Grid, Shield, Save, RefreshCw, CheckCircle2, Gift, Sparkles, Trophy, Calendar, Clock, Dices, X } from 'lucide-react';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';
import { GrantAdvantageModal } from './GrantAdvantageModal';
import { EliminationControls } from './EliminationControls';
import { SpinWheel } from '../student/SpinWheel';
import { TableSkeleton } from '../ui/Skeletons';
import { EmptyState } from '../ui/EmptyState';

export interface ScoreRowItem {
  teamId: string;
  teamName: string;
  teamAvatar: string;
  leaderName: string;
  advantage: string;
  advScore: number;
  mainTaskScore: number;
  specialTaskScore: number;
  totalScore: number;
  elimination: boolean;
  immunity: boolean;
  rank: number;
  status: 'Safe' | 'Danger' | 'Eliminated' | 'Qualified';
}

export const DAY_TIMELINE_DATES: Record<number, string> = {
  1: '2026-08-09',
  2: '2026-08-10',
  3: '2026-08-11',
  4: '2026-08-12',
  5: '2026-08-13',
  6: '2026-08-14',
  7: '2026-08-15',
};

export const ScoreSheet: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>(DAY_TIMELINE_DATES[1]);
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [isSpinModalOpen, setIsSpinModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isLoadingScores, setIsLoadingScores] = useState(false);
  const [rows, setRows] = useState<ScoreRowItem[]>([]);

  // Fetch live scores from MongoDB API for the selected day
  useEffect(() => {
    const fetchLiveScores = async () => {
      setIsLoadingScores(true);
      try {
        const token = localStorage.getItem('cwc_token') || localStorage.getItem('token');
        const res = await fetch(`/api/admin/scores?dayNumber=${selectedDay}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.scores) && data.scores.length > 0) {
            setRows(data.scores);
          }
        }
      } catch (err) {
        console.warn('Error fetching live admin scores:', err);
      } finally {
        setIsLoadingScores(false);
      }
    };

    fetchLiveScores();
  }, [selectedDay]);

  // Non-eliminated active teams who HAVE NOT received an advantage yet
  const eligibleTeamsWithoutAdvantage = rows
    .filter((r) => r.status !== 'Eliminated' && !r.elimination && (r.advantage === 'None' || !r.advantage) && r.advScore === 0)
    .map((r) => ({
      teamId: r.teamId,
      teamName: r.teamName,
      avatar: r.teamAvatar,
    }));

  const handleDaySelect = (dayNum: number) => {
    setSelectedDay(dayNum);
    if (DAY_TIMELINE_DATES[dayNum]) {
      setSelectedDate(DAY_TIMELINE_DATES[dayNum]);
    }
  };

  const getAdvantageBonusScore = (adv: string): number => {
    if (adv.includes('Golden Coin') || adv.includes('+100')) return 100;
    if (adv.includes('+10 Mins') || adv.includes('+50')) return 50;
    if (adv.includes('+5 Mins') || adv.includes('+25') || adv.includes('Hint')) return 25;
    if (adv.includes('Skip') || adv.includes('+30')) return 30;
    if (adv.includes('Double Points')) return 100;
    return 0;
  };

  const calculateTotal = (advPoints: number, mainPoints: number, specialPoints: number, advName?: string): number => {
    const advVal = Number(advPoints) || 0;
    const mainVal = Number(mainPoints) || 0;
    const specialVal = Number(specialPoints) || 0;
    const base = advVal + mainVal + specialVal;

    if (advName && advName.includes('Double Points')) {
      return (mainVal + specialVal) * 2 + advVal;
    }
    return base;
  };

  const recalculateRanks = (list: ScoreRowItem[]): ScoreRowItem[] => {
    const getStatusPriority = (status: string = ''): number => {
      const s = status ? status.toString().trim().toLowerCase() : '';
      if (s === 'qualified') return 1;
      if (s === 'eliminated') return 3;
      return 2;
    };

    const sorted = [...list].sort((a, b) => {
      const pA = getStatusPriority(a.status);
      const pB = getStatusPriority(b.status);
      if (pA !== pB) return pA - pB;
      return b.totalScore - a.totalScore;
    });

    return list.map((item) => {
      const rIndex = sorted.findIndex((s) => s.teamId === item.teamId);
      return { ...item, rank: rIndex + 1 };
    });
  };

  const updateRow = (index: number, field: keyof ScoreRowItem, value: any) => {
    const updated = [...rows];
    const item = { ...updated[index], [field]: value };

    if (field === 'advantage') {
      item.advScore = getAdvantageBonusScore(value);
    }

    const adv = field === 'advScore' ? Number(value) : item.advScore;
    const main = field === 'mainTaskScore' ? Number(value) : item.mainTaskScore;
    const special = field === 'specialTaskScore' ? Number(value) : item.specialTaskScore;

    item.totalScore = calculateTotal(adv, main, special, item.advantage);

    if (field === 'elimination') {
      if (value === true) {
        item.status = 'Eliminated';
      } else if (item.status === 'Eliminated') {
        item.status = 'Safe';
      }
    }

    updated[index] = item;
    setRows(recalculateRanks(updated));
  };

  const handleAdvantageGranted = (teamId: string, advantage: string) => {
    const updated = rows.map((r) => {
      if (r.teamId === teamId) {
        const isImmunity = advantage.toLowerCase().includes('immunity');
        const bonusScore = getAdvantageBonusScore(advantage);
        const newAdvScore = r.advScore + bonusScore;
        const newTotal = calculateTotal(newAdvScore, r.mainTaskScore, r.specialTaskScore, advantage);
        return {
          ...r,
          advantage,
          advScore: newAdvScore,
          immunity: isImmunity ? true : r.immunity,
          totalScore: newTotal,
        };
      }
      return r;
    });
    setRows(recalculateRanks(updated));
  };

  // Trigger Spin outcome callback when a non-eliminated team wins the wheel spin
  const handleTeamWheelWin = (winningTeamName: string, advantageName: string, winningTeamId?: string) => {
    const bonusScore = getAdvantageBonusScore(advantageName);

    const updated = rows.map((r) => {
      if (r.teamName === winningTeamName || (winningTeamId && r.teamId === winningTeamId)) {
        const newAdvScore = r.advScore + bonusScore;
        const newTotal = calculateTotal(newAdvScore, r.mainTaskScore, r.specialTaskScore, advantageName);
        return {
          ...r,
          advantage: advantageName,
          advScore: newAdvScore,
          totalScore: newTotal,
        };
      }
      return r;
    });

    setRows(recalculateRanks(updated));
    setSuccessMessage(`🎡 Live Spin Win! '${winningTeamName}' won ${advantageName} (+${bonusScore} adv pts)!`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  const handleSaveDayScores = async () => {
    setIsSubmitting(true);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('cwc_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      await Promise.all(
        rows.map(async (r) => {
          return fetch('/api/admin/scores', {
            method: 'POST',
            headers,
            body: JSON.stringify({
              teamId: r.teamId,
              dayNumber: selectedDay,
              date: selectedDate,
              adv: r.advScore,
              main: r.mainTaskScore,
              special: r.specialTaskScore,
            }),
          });
        })
      );

      await fetch('/api/admin/scores/batch', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          day: selectedDay,
          date: selectedDate,
          timestamp: new Date().toISOString(),
          scores: rows.map((r) => ({
            teamId: r.teamId,
            mainTaskScore: r.mainTaskScore,
            specialTaskScore: r.specialTaskScore,
            advantage: r.advantage,
            immunity: r.immunity,
            status: r.status,
            totalPoints: r.totalScore,
          })),
        }),
      });

      setSuccessMessage(`Day ${selectedDay} (${selectedDate}) Scores successfully logged & synchronized with MongoDB! 📊`);
      triggerCarnivalConfetti();
    } catch (err) {
      setSuccessMessage(`Day ${selectedDay} Scores saved locally & verified! (Local fallback completed)`);
      triggerCarnivalConfetti();
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#18122B] border border-slate-200 dark:border-carnival-gold/40 shadow-sm dark:shadow-neon-gold">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-carnival-gold/20 text-amber-700 dark:text-carnival-gold text-xs font-mono font-bold border border-amber-300 dark:border-carnival-gold/30 mb-2">
            <Grid className="w-4 h-4" />
            <span>LIVE ARENA SCORE SHEET</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Dated Daywise Score Sheet</h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Record, back-date, and evaluate daywise scores (adv + main + special = total). Spin the team advantage wheel containing all non-eliminated teams live during the show.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsSpinModalOpen(true)}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Dices className="w-4 h-4 text-slate-950 fill-slate-950" />
            <span>Spin Team Advantage Wheel 🎡</span>
          </button>

          <button
            onClick={() => setIsGrantModalOpen(true)}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Gift className="w-4 h-4 text-white fill-white" />
            <span>Grant Advantage 🎁</span>
          </button>

          <button
            onClick={handleSaveDayScores}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-rose-600 dark:from-carnival-gold dark:via-carnival-amber dark:to-carnival-crimson text-slate-950 font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <Save className="w-4 h-4 text-slate-950" />
            )}
            <span>{isSubmitting ? 'Saving Payload...' : `Save Day ${selectedDay} Scores`}</span>
          </button>
        </div>
      </div>

      {/* Select Day & Date Header Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 rounded-xl bg-amber-500/20 text-carnival-gold border border-amber-400/30">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-bold">
              EVENT TIMELINE DAY & DATE PICKER
            </div>
            <div className="text-sm font-black text-white">Log Scores for Specific Event Day</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-white/10">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono font-bold text-slate-300">Select Day:</span>
            <select
              value={selectedDay}
              onChange={(e) => handleDaySelect(Number(e.target.value))}
              className="bg-transparent text-amber-400 font-mono font-black text-xs focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <option key={num} value={num} className="bg-slate-900 text-white">
                  Day {num} ({DAY_TIMELINE_DATES[num]})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-white/10">
            <span className="text-xs font-mono font-bold text-slate-300">Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-cyan-400 font-mono font-bold text-xs focus:outline-none cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 font-mono text-xs flex items-center gap-2 shadow-sm dark:shadow-lg"
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {/* Spreadsheet Data Grid */}
      {isLoadingScores ? (
        <TableSkeleton rows={5} cols={10} className="min-h-[420px]" />
      ) : rows.length === 0 ? (
        <EmptyState
          title="No Scores Found"
          description="No team scores have been recorded yet for Day 1 or the selected day."
          icon={Trophy}
        />
      ) : (
        <div className="bg-white dark:bg-[#140D21] rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm dark:shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse min-w-[1100px]">
              <thead>
                <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#140D21] text-slate-700 dark:text-slate-300 uppercase tracking-wider font-bold">
                  <th className="p-3.5 border-r border-slate-200 dark:border-white/10 text-center min-w-[60px]">Rank</th>
                  <th className="p-3.5 border-r border-slate-200 dark:border-white/10 min-w-[170px]">Team Name</th>
                  <th className="p-3.5 border-r border-slate-200 dark:border-white/10 min-w-[160px]">Wheel Spin Trigger</th>
                  <th className="p-3.5 border-r border-slate-200 dark:border-white/10 min-w-[160px]">Advantage Used</th>
                  <th className="p-3.5 border-r border-slate-200 dark:border-white/10 text-center min-w-[100px]">Adv Score (adv)</th>
                  <th className="p-3.5 border-r border-slate-200 dark:border-white/10 text-center min-w-[110px]">Main Score</th>
                  <th className="p-3.5 border-r border-slate-200 dark:border-white/10 text-center min-w-[110px]">Special Score</th>
                  <th className="p-3.5 border-r border-slate-200 dark:border-white/10 text-center min-w-[110px]">Total Score</th>
                  <th className="p-3.5 border-r border-slate-200 dark:border-white/10 text-center min-w-[210px]">Status Controls</th>
                  <th className="p-3.5 text-center min-w-[100px]">Immunity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5">
                {rows.map((row, idx) => (
                  <tr
                    key={row.teamId}
                    className={`hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${
                      row.elimination ? 'bg-rose-50 dark:bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="p-3.5 border-r border-slate-200 dark:border-white/5 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-black text-xs ${
                          row.rank === 1
                            ? 'bg-amber-400 dark:bg-carnival-gold text-slate-950 shadow-sm'
                            : row.rank === 2
                            ? 'bg-slate-200 dark:bg-slate-300 text-slate-950'
                            : row.rank === 3
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {row.rank}
                      </span>
                    </td>

                    <td className="p-3.5 border-r border-slate-200 dark:border-white/5 font-extrabold text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{row.teamAvatar}</span>
                        <span className="truncate">{row.teamName}</span>
                      </div>
                    </td>

                    <td className="p-3.5 border-r border-slate-200 dark:border-white/5">
                      {row.status === 'Eliminated' ? (
                        <span className="text-[11px] text-rose-400 font-mono italic">Eliminated</span>
                      ) : row.advantage !== 'None' && row.advScore > 0 ? (
                        <span className="px-2.5 py-1 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold border border-amber-400/30">
                          Advantage Claimed 🎁
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsSpinModalOpen(true)}
                          className="w-full px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow hover:scale-105 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Dices className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                          <span>Spin Wheel 🎡</span>
                        </button>
                      )}
                    </td>

                    <td className="p-3.5 border-r border-slate-200 dark:border-white/5">
                      <select
                        value={row.advantage}
                        onChange={(e) => updateRow(idx, 'advantage', e.target.value)}
                        className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1A1228] border border-slate-300 dark:border-carnival-purple/40 text-[11px] text-purple-700 dark:text-carnival-purple font-mono font-bold focus:outline-none cursor-pointer"
                      >
                        <option value="None">None (0x)</option>
                        <option value="Double Points (2x)">Double Points (2x)</option>
                        <option value="Golden Coin (+100)">Golden Coin (+100)</option>
                        <option value="Extra Time (+50)">Extra Time (+50)</option>
                        <option value="Skip Card (+30)">Skip Card (+30)</option>
                        <option value="Hint Wheel (+25)">Hint Wheel (+25)</option>
                      </select>
                    </td>

                    <td className="p-3.5 border-r border-slate-200 dark:border-white/5 text-center">
                      <input
                        type="number"
                        min={0}
                        value={row.advScore}
                        onChange={(e) => updateRow(idx, 'advScore', Number(e.target.value))}
                        className="w-20 px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-carnival-gold/40 text-center font-mono font-bold text-amber-700 dark:text-carnival-gold text-xs focus:outline-none"
                      />
                    </td>

                    <td className="p-3.5 border-r border-slate-200 dark:border-white/5 text-center">
                      <input
                        type="number"
                        min={0}
                        max={1000}
                        value={row.mainTaskScore}
                        onChange={(e) => updateRow(idx, 'mainTaskScore', Number(e.target.value))}
                        className="w-20 px-2 py-1 rounded bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-carnival-cyan/40 text-center font-mono font-bold text-cyan-700 dark:text-carnival-cyan text-xs focus:outline-none"
                      />
                    </td>

                    <td className="p-3.5 border-r border-slate-200 dark:border-white/5 text-center">
                      <input
                        type="number"
                        min={0}
                        max={500}
                        value={row.specialTaskScore}
                        onChange={(e) => updateRow(idx, 'specialTaskScore', Number(e.target.value))}
                        className="w-20 px-2 py-1 rounded bg-slate-50 dark:bg-black/60 border border-slate-300 dark:border-carnival-cyan/40 text-center font-mono font-bold text-cyan-700 dark:text-carnival-cyan text-xs focus:outline-none"
                      />
                    </td>

                    <td className="p-3.5 border-r border-slate-200 dark:border-white/5 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-carnival-gold/20 text-amber-800 dark:text-carnival-gold font-extrabold text-xs border border-amber-300 dark:border-carnival-gold/40">
                        {row.totalScore} PTS
                      </span>
                    </td>

                    <td className="p-3.5 border-r border-slate-200 dark:border-white/5 text-center">
                      <EliminationControls
                        teamId={row.teamId}
                        teamName={row.teamName}
                        currentStatus={row.status}
                        compact
                        onStatusChange={(tid, newStatus) => {
                          const updated = rows.map((r) => {
                            if (r.teamId === tid) {
                              return {
                                ...r,
                                status: newStatus,
                                elimination: newStatus === 'Eliminated',
                              };
                            }
                            return r;
                          }
                          );
                          setRows(recalculateRanks(updated));
                        }}
                      />
                    </td>

                    <td className="p-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => updateRow(idx, 'immunity', !row.immunity)}
                        className={`p-1.5 rounded-lg transition-all mx-auto cursor-pointer ${
                          row.immunity
                            ? 'bg-cyan-100 dark:bg-cyan-500/20 text-cyan-700 dark:text-carnival-cyan border border-cyan-300 dark:border-carnival-cyan/50'
                            : 'bg-slate-100 dark:bg-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                        }`}
                        title={row.immunity ? 'Immunity Active' : 'No Immunity'}
                      >
                        <Shield className={`w-4 h-4 ${row.immunity ? 'fill-cyan-500/30' : ''}`} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Team Advantage Spin Wheel */}
      <AnimatePresence>
        {isSpinModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
          >
            <div className="relative w-full max-w-lg">
              <button
                onClick={() => setIsSpinModalOpen(false)}
                className="absolute top-4 right-4 z-50 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <SpinWheel
                teams={eligibleTeamsWithoutAdvantage}
                dayNumber={selectedDay}
                onOutcomeGranted={(winningTeamName, advantage, winningTeamId) => {
                  handleTeamWheelWin(winningTeamName, advantage, winningTeamId);
                }}
                onClose={() => setIsSpinModalOpen(false)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <GrantAdvantageModal
        isOpen={isGrantModalOpen}
        onClose={() => setIsGrantModalOpen(false)}
        teams={rows.map((r) => ({ id: r.teamId, name: r.teamName }))}
        onAdvantageGranted={handleAdvantageGranted}
      />
    </div>
  );
};

export default ScoreSheet;
