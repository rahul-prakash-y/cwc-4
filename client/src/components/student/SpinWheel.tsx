import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Trophy, Gift, AlertCircle, X, Check, Flame, Users, Dices } from 'lucide-react';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

export interface TeamSlice {
  teamId: string;
  teamName: string;
  avatar?: string;
  color?: string;
}

export const CARNIVAL_SLICE_COLORS = [
  '#F59E0B', // Gold
  '#EF4444', // Crimson Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#10B981', // Emerald
  '#EC4899', // Pink
  '#6366F1', // Indigo
  '#F97316', // Orange
];

export interface SpinWheelProps {
  teams?: TeamSlice[];
  dayNumber?: number;
  advantageName?: string;
  onOutcomeGranted?: (winningTeamName: string, advantage: string, winningTeamId?: string) => void;
  onClose?: () => void;
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  teams: initialTeams,
  dayNumber = 1,
  advantageName = '+5 Mins Extra Time',
  onOutcomeGranted,
  onClose,
}) => {
  const [activeTeams, setActiveTeams] = useState<TeamSlice[]>(initialTeams || []);
  const [selectedAdvantage, setSelectedAdvantage] = useState<string>(advantageName);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [winningTeam, setWinningTeam] = useState<{ teamId: string; teamName: string; advantage: string } | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentRounds, setCurrentRounds] = useState(0);
  const [loadingTeams, setLoadingTeams] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Fetch non-eliminated teams from backend if not passed in props
  useEffect(() => {
    if (!initialTeams || initialTeams.length === 0) {
      const fetchTeams = async () => {
        setLoadingTeams(true);
        try {
          const token = localStorage.getItem('cwc_token');
          const res = await fetch('/api/student/spin-wheel/teams', {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          if (res.ok) {
            const data = await res.json();
            if (data.teams && data.teams.length > 0) {
              setActiveTeams(data.teams);
            }
          }
        } catch (e) {
          // Fallback mock active teams if network fails
          setActiveTeams([
            { teamId: 'team-1', teamName: 'Cyber Circus Kings', avatar: '🎪', color: '#F59E0B' },
            { teamId: 'team-2', teamName: 'Neon Ringmasters', avatar: '🦁', color: '#EF4444' },
            { teamId: 'team-3', teamName: 'Jesters of Java', avatar: '🃏', color: '#8B5CF6' },
            { teamId: 'team-4', teamName: 'High Wire Hackers', avatar: '🚀', color: '#06B6D4' },
            { teamId: 'team-5', teamName: 'Firebreather Code', avatar: '🔥', color: '#10B981' },
          ]);
        } finally {
          setLoadingTeams(false);
        }
      };
      fetchTeams();
    } else {
      setActiveTeams(initialTeams);
    }
  }, [initialTeams]);

  // Web Audio API Sound Synthesizer for Authentic Carnival Wheel Ticks
  const playTickSound = () => {
    try {
      if (!audioCtxRef.current) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx();
        }
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      if (audioCtxRef.current) {
        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(450 + Math.random() * 300, audioCtxRef.current.currentTime);
        gain.gain.setValueAtTime(0.15, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.04);
      }
    } catch (e) {
      // Audio fallback
    }
  };

  const handleSpinClick = async () => {
    if (isSpinning || activeTeams.length === 0) return;
    setErrorMsg(null);
    setIsSpinning(true);

    try {
      const token = localStorage.getItem('cwc_token');
      const response = await fetch('/api/student/spin-wheel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          dayNumber,
          advantageName: selectedAdvantage,
          customTeamIds: activeTeams.map((t) => t.teamId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setIsSpinning(false);
        setErrorMsg(data.message || 'Unable to spin the wheel right now.');
        return;
      }

      const winningIndex = typeof data.winningIndex === 'number' ? data.winningIndex : 0;
      const winningTeamName = data.winningTeamName || activeTeams[winningIndex]?.teamName || 'Winner';
      const grantedAdvantage = data.advantage || selectedAdvantage;

      // Calculate Rotation Angle so wheel physically stops on the WINNING TEAM SLICE
      // Slices count N = activeTeams.length. Angle per slice = 360° / N
      // Pointer is at top (12 o'clock / 0°). To land winningIndex at top:
      // Target Angle = 360° - (winningIndex * sliceAngle + sliceAngle / 2)
      const numSlices = activeTeams.length;
      const sliceAngle = 360 / numSlices;
      const targetSliceOffset = 360 - (winningIndex * sliceAngle + sliceAngle / 2);
      const extraSpins = (currentRounds + 6) * 360;
      const newTotalRotation = extraSpins + targetSliceOffset;

      setCurrentRounds((prev) => prev + 6);
      setRotationAngle(newTotalRotation);

      // Play Sound Ticks during rotation animation (4.5s duration)
      let tickCount = 0;
      const tickInterval = setInterval(() => {
        tickCount++;
        playTickSound();
        if (tickCount > 35) clearInterval(tickInterval);
      }, 120);

      // Finish animation after 4.5s
      setTimeout(() => {
        clearInterval(tickInterval);
        setIsSpinning(false);
        setWinningTeam({
          teamId: data.winningTeamId || activeTeams[winningIndex]?.teamId,
          teamName: winningTeamName,
          advantage: grantedAdvantage,
        });
        setShowModal(true);
        triggerCarnivalConfetti();

        if (onOutcomeGranted) {
          onOutcomeGranted(winningTeamName, grantedAdvantage, data.winningTeamId);
        }
      }, 4600);
    } catch (err: any) {
      setIsSpinning(false);
      setErrorMsg(err.message || 'Server connection error during spin.');
    }
  };

  const numSlices = activeTeams.length;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-900/95 border border-carnival-gold/40 shadow-2xl backdrop-blur-2xl text-white max-w-xl mx-auto font-sans overflow-hidden">
      {/* Background Aura */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-purple-600/10 to-pink-500/10 pointer-events-none" />

      {/* Header */}
      <div className="text-center space-y-2 z-10 mb-2 w-full">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 text-carnival-gold font-mono text-xs font-bold border border-carnival-gold/40">
          <Trophy className="w-3.5 h-3.5" />
          <span>TEAM ADVANTAGE WHEEL • DAY {dayNumber}</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-purple-300">
          Which Team Wins the Advantage?
        </h2>

        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Spin the wheel containing all <span className="text-amber-400 font-bold font-mono">{numSlices} Active Teams</span>. The team landed on wins today's advantage!
        </p>

        {/* Selectable Advantage up for grabs */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="text-[11px] font-mono font-bold text-slate-400">Prize up for grabs:</span>
          <select
            value={selectedAdvantage}
            onChange={(e) => setSelectedAdvantage(e.target.value)}
            disabled={isSpinning}
            className="bg-slate-950 text-amber-400 border border-carnival-gold/50 rounded-lg px-2.5 py-1 text-xs font-mono font-bold focus:outline-none cursor-pointer"
          >
            <option value="+5 Mins Extra Time">+5 Mins Extra Time (+25 Pts)</option>
            <option value="+10 Mins Extra Time">+10 Mins Extra Time (+50 Pts)</option>
            <option value="Double Points Multiplier">Double Points Multiplier (2x)</option>
            <option value="Unlock Question Hint">Unlock Question Hint (+25 Pts)</option>
            <option value="Skip Question Pass">Skip Question Pass (+30 Pts)</option>
            <option value="Golden Coin (+100 Pts)">Golden Coin (+100 Pts)</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-3 p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2 z-10 w-full">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {loadingTeams ? (
        <div className="py-16 text-center text-slate-400 font-mono text-xs z-10 flex flex-col items-center gap-2">
          <Sparkles className="w-8 h-8 text-amber-400 animate-spin" />
          <span>Loading Active Non-Eliminated Teams...</span>
        </div>
      ) : numSlices === 0 ? (
        <div className="py-12 text-center text-rose-400 font-mono text-xs z-10 space-y-2">
          <Users className="w-8 h-8 mx-auto" />
          <p>No active non-eliminated teams found.</p>
        </div>
      ) : (
        /* Wheel Container */
        <div className="relative w-72 h-72 sm:w-84 sm:h-84 flex items-center justify-center my-4 z-10">
          {/* Animated Rim LED Lights */}
          <div className="absolute inset-0 rounded-full border-8 border-amber-500/80 shadow-[0_0_25px_rgba(245,158,11,0.6)] z-20 pointer-events-none flex items-center justify-center">
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 360) / 16;
              const rad = (angle * Math.PI) / 180;
              const r = 146; // radius
              const x = r * Math.cos(rad);
              const y = r * Math.sin(rad);
              return (
                <div
                  key={i}
                  style={{
                    transform: `translate(${x}px, ${y}px)`,
                  }}
                  className={`absolute w-3 h-3 rounded-full border border-slate-900 shadow-md ${
                    i % 2 === 0
                      ? 'bg-amber-300 animate-pulse shadow-amber-400'
                      : 'bg-white shadow-cyan-300 animate-ping'
                  }`}
                />
              );
            })}
          </div>

          {/* Top Pointer Arrow */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
            <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-[0_4px_10px_rgba(0,0,0,0.8)]" />
          </div>

          {/* Rotating Wheel Disk with TEAM NAMES */}
          <motion.div
            animate={{ rotate: rotationAngle }}
            transition={{
              duration: 4.5,
              ease: [0.15, 0.9, 0.2, 1], // Ease-out spin deceleration
            }}
            className="w-full h-full rounded-full overflow-hidden relative shadow-2xl border-4 border-slate-950"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {activeTeams.map((teamItem, i) => {
                const anglePerSlice = 360 / numSlices;
                const startAngle = i * anglePerSlice;
                const endAngle = (i + 1) * anglePerSlice;

                const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);

                const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                const sliceColor = teamItem.color || CARNIVAL_SLICE_COLORS[i % CARNIVAL_SLICE_COLORS.length];

                // Text positioning angle
                const midAngle = startAngle + anglePerSlice / 2;
                const textRad = (midAngle * Math.PI) / 180;
                const tx = 50 + 31 * Math.cos(textRad);
                const ty = 50 + 31 * Math.sin(textRad);

                // Shorten team name if long
                const displayName = teamItem.teamName.length > 14 ? teamItem.teamName.substring(0, 12) + '..' : teamItem.teamName;

                return (
                  <g key={teamItem.teamId || i}>
                    <path d={pathData} fill={sliceColor} stroke="#0f172a" strokeWidth="0.7" />
                    <g transform={`translate(${tx}, ${ty}) rotate(${midAngle + 90})`}>
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fill="#FFFFFF"
                        fontSize={numSlices > 8 ? "2.6" : "3.1"}
                        fontWeight="black"
                        fontFamily="sans-serif"
                      >
                        {(teamItem.avatar || '🎪') + ' ' + displayName}
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </motion.div>

          {/* Center SPIN Button */}
          <button
            onClick={handleSpinClick}
            disabled={isSpinning}
            className="absolute z-30 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-rose-600 border-4 border-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.8)] text-slate-950 font-black text-xs sm:text-sm tracking-wider uppercase flex flex-col items-center justify-center hover:scale-110 active:scale-95 transition-transform disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSpinning ? (
              <Sparkles className="w-6 h-6 animate-spin text-slate-950" />
            ) : (
              <>
                <Dices className="w-4 h-4 text-slate-950" />
                <span>SPIN 🎡</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Prize Outcome Modal Popup */}
      <AnimatePresence>
        {showModal && winningTeam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <div className="relative p-6 sm:p-8 rounded-3xl bg-slate-900 border-2 border-carnival-gold shadow-2xl text-center max-w-md w-full space-y-4 font-sans">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-carnival-gold flex items-center justify-center mx-auto text-3xl shadow-lg shadow-amber-500/30">
                🏆
              </div>

              <div className="space-y-1">
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono text-xs font-bold uppercase border border-amber-400/30">
                  🎉 ADVANTAGE WHEEL WINNER!
                </span>

                <h3 className="text-2xl font-black text-white pt-2">
                  {winningTeam.teamName}
                </h3>

                <p className="text-slate-300 text-sm">Won Today's Advantage:</p>

                <div className="text-xl font-extrabold text-amber-400 py-1 font-mono">
                  [{winningTeam.advantage}]
                </div>
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setShowModal(false);
                    if (onClose) onClose();
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg hover:scale-105 transition-transform flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                  <span>Apply Advantage to Score Sheet</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SpinWheel;
