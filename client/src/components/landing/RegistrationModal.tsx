import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Ticket, Sparkles, User, Mail, Shield, CheckCircle2, Send, ArrowRight } from 'lucide-react';
import { triggerCarnivalConfetti } from '../hero/ConfettiEffect';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<number>(1);
  const [teamName, setTeamName] = useState('');
  const [tagline, setTagline] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderGithub, setLeaderGithub] = useState('');
  const [member2Name, setMember2Name] = useState('');
  const [member2Role, setMember2Role] = useState('Fullstack');
  const [ticketId, setTicketId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const generatedId = `CWC4-${Math.floor(1000 + Math.random() * 9000)}`;
      setTicketId(generatedId);
      setIsSubmitting(false);
      setIsSuccess(true);
      triggerCarnivalConfetti();
    }, 1200);
  };

  const resetForm = () => {
    setStep(1);
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-xl glass-card rounded-3xl border border-carnival-gold/40 p-6 sm:p-8 shadow-[0_0_50px_rgba(255,215,0,0.3)] overflow-hidden"
        >
          {/* Close button */}
          <button
            onClick={resetForm}
            className="absolute top-4 right-4 p-2 rounded-full glass-card text-slate-400 hover:text-white hover:border-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {!isSuccess ? (
            <div>
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-carnival-crimson via-carnival-gold to-carnival-purple p-0.5 shadow-neon-gold flex items-center justify-center">
                  <div className="w-full h-full rounded-[14px] bg-[#0B0A16] flex items-center justify-center text-xl">
                    🎟️
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>Carnival Entry Ticket</span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-carnival-gold/20 text-carnival-gold border border-carnival-gold/30 font-mono">
                      SEASON 4
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400 font-mono">Register your 2-3 member team for the Grand Coding Arena</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex items-center gap-2 mb-6">
                <div className={`flex-1 h-1.5 rounded-full ${step >= 1 ? 'bg-carnival-gold' : 'bg-white/10'}`} />
                <div className={`flex-1 h-1.5 rounded-full ${step >= 2 ? 'bg-carnival-crimson' : 'bg-white/10'}`} />
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {step === 1 ? (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-1.5">
                        Team Name *
                      </label>
                      <div className="relative">
                        <Shield className="w-4 h-4 text-carnival-gold absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={teamName}
                          onChange={(e) => setTeamName(e.target.value)}
                          placeholder="e.g. Cyber Circus Kings"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:border-carnival-gold focus:outline-none text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-1.5">
                        Team Motto / Tagline
                      </label>
                      <input
                        type="text"
                        value={tagline}
                        onChange={(e) => setTagline(e.target.value)}
                        placeholder="Defying gravity and strict typing since Day 1"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:border-carnival-gold focus:outline-none text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-1.5">
                        Team Leader Name *
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-carnival-cyan absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={leaderName}
                          onChange={(e) => setLeaderName(e.target.value)}
                          placeholder="Aarav Sharma"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:border-carnival-gold focus:outline-none text-sm transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-1.5">
                        Leader Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-carnival-cyan absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={leaderEmail}
                          onChange={(e) => setLeaderEmail(e.target.value)}
                          placeholder="aarav@college.edu"
                          className="w-full pl-10 pr-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:border-carnival-gold focus:outline-none text-sm transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={!teamName || !leaderName || !leaderEmail}
                      onClick={() => setStep(2)}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-carnival-gold to-carnival-amber text-black font-extrabold text-sm shadow-neon-gold hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <span>Next: Member Roster</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-1.5">
                        Leader GitHub Username
                      </label>
                      <input
                        type="text"
                        value={leaderGithub}
                        onChange={(e) => setLeaderGithub(e.target.value)}
                        placeholder="aarav-cwc"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:border-carnival-gold focus:outline-none text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-1.5">
                        Member #2 Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={member2Name}
                        onChange={(e) => setMember2Name(e.target.value)}
                        placeholder="Rhea Kapoor"
                        className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 focus:border-carnival-gold focus:outline-none text-sm transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 font-mono mb-1.5">
                        Member #2 Specialty
                      </label>
                      <select
                        value={member2Role}
                        onChange={(e) => setMember2Role(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-[#151329] border border-white/10 text-white focus:border-carnival-gold focus:outline-none text-sm transition-all"
                      >
                        <option value="Fullstack">Fullstack Developer</option>
                        <option value="Frontend">Frontend Specialist</option>
                        <option value="Backend">Backend Engineer</option>
                        <option value="UI/UX">UI/UX Designer</option>
                      </select>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="py-3.5 px-5 rounded-xl glass-card text-slate-300 hover:text-white font-semibold text-sm transition-all"
                      >
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-carnival-crimson via-carnival-purple to-carnival-cyan text-white font-extrabold text-sm shadow-neon-crimson hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <Sparkles className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Claim Admission Ticket</span>
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </form>
            </div>
          ) : (
            /* Ticket Confirmation View */
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h3 className="text-2xl font-black text-white mb-1">Registration Confirmed!</h3>
              <p className="text-xs text-slate-300 font-mono mb-6">Welcome to Code With Curious Season 4 Arena</p>

              {/* Admission Ticket Badge */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1C173B] to-[#151329] border border-carnival-gold/60 shadow-neon-gold relative overflow-hidden mb-6 text-left">
                <div className="absolute top-0 right-0 px-3 py-1 bg-carnival-gold text-black font-extrabold font-mono text-[10px] uppercase rounded-bl-xl">
                  VALID TICKET
                </div>

                <div className="text-[10px] text-carnival-gold uppercase font-mono font-bold tracking-widest mb-1">
                  OFFICIAL ADMISSION TICKET
                </div>
                <div className="text-xl font-black text-white mb-2">{teamName}</div>

                <div className="grid grid-cols-2 gap-3 text-xs border-t border-white/10 pt-3 font-mono">
                  <div>
                    <span className="text-slate-400 block text-[10px]">TICKET ID</span>
                    <span className="text-carnival-cyan font-bold">{ticketId}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">LEADER</span>
                    <span className="text-white font-bold">{leaderName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">STATUS</span>
                    <span className="text-emerald-400 font-bold">APPROVED</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">ARENA PASS</span>
                    <span className="text-carnival-gold font-bold">VIP ACCESS</span>
                  </div>
                </div>
              </div>

              <button
                onClick={resetForm}
                className="w-full py-3.5 rounded-xl bg-carnival-gold text-black font-extrabold text-sm shadow-neon-gold hover:scale-[1.02] transition-all"
              >
                Close & Enter Arena
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
