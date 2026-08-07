import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import {
  Ticket,
  User,
  Users,
  Shield,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Home,
  LogIn,
  Copy,
  Check,
  Palette,
  Phone,
  Mail,
  Building,
  Hash,
  HelpCircle,
  BookOpen,
  Crown,
  Grid,
  Layers,
} from 'lucide-react';
import apiClient from '../../api/axios';

// Task 2: Member profile Zod Schema with all required fields
const memberProfileSchema = z.object({
  name: z.string().trim().min(2, 'Full Name is required'),
  rollNo: z.string().trim().min(2, 'Roll Number is required'),
  deptMailId: z.string().trim().toLowerCase().email('Valid Department Mail ID is required'),
  phone: z
    .string()
    .trim()
    .min(10, 'Valid 10-digit Phone Number is required')
    .max(15, 'Phone Number cannot exceed 15 digits'),
  gender: z.enum(['Male', 'Female', 'Other'], {
    required_error: 'Select Gender',
  }),
  residenceType: z.enum(['Hosteller', 'DayScholar'], {
    required_error: 'Select Residence Type',
  }),
});

// Task 2: Team Registration Schema with exactly 4 Member Profiles
const registerSchema = z
  .object({
    teamName: z
      .string()
      .trim()
      .min(2, 'Team name must be at least 2 characters')
      .max(50, 'Team name cannot exceed 50 characters'),
    themeColor: z.string().min(1, 'Please select a theme color'),
    members: z
      .array(memberProfileSchema)
      .length(4, 'Every team MUST contain exactly 4 complete member profile objects'),
    acceptRules: z.boolean().refine((val) => val === true, {
      message: 'You must read and accept the rulebook to submit your application',
    }),
  })
  .superRefine((data, ctx) => {
    // Check for duplicate Roll Numbers across all 4 members
    const seenRolls = new Map<string, number>();
    data.members.forEach((m, idx) => {
      const roll = m.rollNo?.trim().toLowerCase();
      if (roll) {
        if (seenRolls.has(roll)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate Roll Number "${roll.toUpperCase()}". Each member must have a unique roll number.`,
            path: ['members', idx, 'rollNo'],
          });
        } else {
          seenRolls.set(roll, idx);
        }
      }
    });

    // Check for duplicate Dept Mail IDs across all 4 members
    const seenMails = new Map<string, number>();
    data.members.forEach((m, idx) => {
      const mail = m.deptMailId?.trim().toLowerCase();
      if (mail) {
        if (seenMails.has(mail)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate Dept Mail ID "${mail}". Each member must have a unique department mail.`,
            path: ['members', idx, 'deptMailId'],
          });
        } else {
          seenMails.set(mail, idx);
        }
      }
    });
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const PRESET_COLORS = [
  { name: 'Carnival Crimson', value: '#FF0055' },
  { name: 'Cyber Cyan', value: '#00F0FF' },
  { name: 'Golden Circus', value: '#FFB800' },
  { name: 'Neon Purple', value: '#9D00FF' },
  { name: 'Emerald Glow', value: '#00FF66' },
  { name: 'Electric Pink', value: '#FF00A0' },
];

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0); // 0, 1, 2, 3 for 4 members
  const [layoutMode, setLayoutMode] = useState<'tabs' | 'grid'>('tabs');
  const [teamNameError, setTeamNameError] = useState<string | null>(null);
  const [isCheckingTeamName, setIsCheckingTeamName] = useState(false);
  const [registeredData, setRegisteredData] = useState<{
    teamName: string;
    leaderEmail: string;
  } | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState<boolean>(true);
  const [currentSeason, setCurrentSeason] = useState<number>(4);
  const { socket } = useSocket();

  useEffect(() => {
    const fetchGlobalSettings = async () => {
      try {
        const metaEnv = (import.meta as any).env || {};
        const backendUrl =
          metaEnv.VITE_API_URL ||
          (window.location.hostname === 'localhost' ? 'http://localhost:5000' : window.location.origin);

        const res = await fetch(`${backendUrl}/api/v1/settings/global`);
        if (res.ok) {
          const data = await res.json();
          if (data.isRegistrationOpen !== undefined) setIsRegistrationOpen(Boolean(data.isRegistrationOpen));
          if (data.currentSeason) setCurrentSeason(data.currentSeason);
        }
      } catch (err) {
        console.error('Failed to fetch settings in Register page:', err);
      }
    };

    fetchGlobalSettings();
  }, []);

  useEffect(() => {
    if (!socket) return;
    const handleSettingsUpdated = (data: any) => {
      if (data.isRegistrationOpen !== undefined) setIsRegistrationOpen(Boolean(data.isRegistrationOpen));
      if (data.currentSeason) setCurrentSeason(data.currentSeason);
    };

    socket.on('SETTINGS_UPDATED', handleSettingsUpdated);
    return () => {
      socket.off('SETTINGS_UPDATED', handleSettingsUpdated);
    };
  }, [socket]);

  const defaultPassword = 'CWC4-Student-2026';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      teamName: '',
      themeColor: '#FF0055',
      members: [
        { name: '', rollNo: '', deptMailId: '', phone: '', gender: 'Male', residenceType: 'Hosteller' },
        { name: '', rollNo: '', deptMailId: '', phone: '', gender: 'Male', residenceType: 'Hosteller' },
        { name: '', rollNo: '', deptMailId: '', phone: '', gender: 'Male', residenceType: 'Hosteller' },
        { name: '', rollNo: '', deptMailId: '', phone: '', gender: 'Male', residenceType: 'Hosteller' },
      ],
      acceptRules: false,
    },
  });

  const selectedColor = watch('themeColor');
  const currentTeamName = watch('teamName');
  const membersWatch = watch('members');

  // Real-time team name duplicate check on blur or change
  const handleCheckTeamName = async (nameToCheck: string) => {
    if (!nameToCheck || nameToCheck.trim().length < 2) {
      setTeamNameError(null);
      return;
    }
    setIsCheckingTeamName(true);
    try {
      const res = await apiClient.get(`/auth/check-team-name?teamName=${encodeURIComponent(nameToCheck.trim())}`);
      if (res.data?.available) {
        setTeamNameError(null);
        clearErrors('teamName');
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Team Name is already taken. Please choose a unique name for your team.';
      setTeamNameError(msg);
      setError('teamName', { type: 'manual', message: msg });
    } finally {
      setIsCheckingTeamName(false);
    }
  };

  // Trigger Confetti effect on success
  const triggerCelebrationConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) {
        return clearInterval(interval);
      }
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: 0.2, y: 0.5 } });
      confetti({ ...defaults, particleCount, origin: { x: 0.8, y: 0.5 } });
    }, 250);
  };

  // Submit Handler & API Call
  const onSubmit = async (data: RegisterFormData) => {
    if (teamNameError) {
      toast.error('Please fix the team name error before submitting.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        teamName: data.teamName.trim(),
        themeColor: data.themeColor,
        residenceType: data.members[0].residenceType === 'DayScholar' ? 'Day Scholar' : 'Hosteller',
        leader: {
          name: data.members[0].name.trim(),
          email: data.members[0].deptMailId.trim().toLowerCase(),
          phone: data.members[0].phone.trim(),
          rollNumber: data.members[0].rollNo.trim(),
        },
        members: data.members.map((m) => ({
          name: m.name.trim(),
          rollNo: m.rollNo.trim(),
          deptMailId: m.deptMailId.trim().toLowerCase(),
          phone: m.phone.trim(),
          gender: m.gender,
          residenceType: m.residenceType,
          email: m.deptMailId.trim().toLowerCase(),
          rollNumber: m.rollNo.trim(),
        })),
      };

      const response = await apiClient.post('/auth/register', payload);

      if (response.status === 201 || response.status === 200) {
        setRegisteredData({
          teamName: data.teamName,
          leaderEmail: data.members[0].deptMailId,
        });
        setIsSuccessModalOpen(true);
        triggerCelebrationConfetti();
        toast.success('🎪 Registration Ticket Punched Successfully!');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to submit registration application. Please check your details.';

      if (errorMessage.toLowerCase().includes('team name')) {
        setTeamNameError(errorMessage);
        setError('teamName', { type: 'manual', message: errorMessage });
      }

      toast.error(errorMessage, {
        duration: 5000,
        style: {
          background: '#1A0B1A',
          color: '#FF0055',
          border: '1px solid #FF0055',
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(defaultPassword);
    setCopiedPassword(true);
    toast.success('Default password copied to clipboard!');
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-[#0B0A16]">
      {/* Background Decorative Neon Orbs */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-carnival-crimson/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-carnival-cyan/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-carnival-gold/5 rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Main Ticket Form Container */}
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card border border-carnival-gold/40 text-carnival-gold text-xs font-mono font-bold uppercase tracking-widest shadow-neon-gold"
          >
            <Ticket className="w-4 h-4 text-carnival-gold" />
            <span>🎪 Code With Curious Season 4 Admission Gate 🎪</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight"
          >
            Carnival Ticket <span className="text-gradient-carnival">Squad Registration</span>
          </motion.h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto">
            Register your 4-member team to enter the CWC Season 4 Coding Arena. Fill in complete member profiles below!
          </p>
        </div>

        {/* Ticket Registration Form Card or Closed Message */}
        {!isRegistrationOpen ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl glass-card border border-carnival-crimson/40 shadow-2xl p-10 text-center space-y-6 bg-gradient-to-b from-[#180E22] via-[#120B1F] to-[#0E0B1A] relative overflow-hidden"
          >
            <div className="w-20 h-20 rounded-full bg-carnival-crimson/20 border border-carnival-crimson/50 flex items-center justify-center mx-auto text-3xl shadow-neon-crimson">
              🚫
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white">
                Registrations for Season {currentSeason} are currently closed.
              </h2>
              <p className="text-sm text-slate-300 max-w-lg mx-auto font-sans leading-relaxed">
                The carnival arena gates have closed for squad entry. Stay tuned for live event updates, leaderboard action, and upcoming power-up rounds!
              </p>
            </div>
            <div className="pt-4 flex justify-center">
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-cwc-surface backdrop-blur-lg border border-white/15 text-white font-bold text-sm hover:border-cwc-gold/50 hover:text-cwc-gold transition duration-300"
              >
                <Home className="w-4 h-4 text-cwc-gold" />
                <span>Return to Landing Page</span>
              </Link>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl glass-card border border-carnival-gold/30 shadow-2xl p-6 sm:p-10 bg-gradient-to-b from-[#161226]/95 via-[#120E22]/95 to-[#0E0B1A]/95 relative overflow-hidden"
          >
            {/* Top Ticket Punch Strip */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-carnival-crimson via-carnival-gold to-carnival-cyan" />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">
            {/* SECTION 1: Team Details & Theme Color */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-3">
                <div className="w-10 h-10 rounded-xl bg-carnival-gold/20 border border-carnival-gold/40 flex items-center justify-center text-carnival-gold font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Shield className="w-5 h-5 text-carnival-gold" />
                    Team Identity & Theme
                  </h2>
                  <p className="text-xs text-slate-400">Choose your carnival team name and badge color</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team Name Input */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                    <span>Carnival Team Name *</span>
                    {isCheckingTeamName && (
                      <span className="text-[10px] text-carnival-cyan flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Checking availability...
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <input
                      {...register('teamName')}
                      type="text"
                      placeholder="e.g. Cyber Circus Kings"
                      onBlur={(e) => handleCheckTeamName(e.target.value)}
                      className={`w-full px-4 py-3.5 rounded-xl bg-black/50 text-white text-sm border focus:outline-none transition ${
                        errors.teamName || teamNameError
                          ? 'border-carnival-crimson focus:border-carnival-crimson'
                          : 'border-white/15 focus:border-carnival-gold'
                      }`}
                    />
                    <Users className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  </div>
                  {/* Real-time inline error message */}
                  {(errors.teamName || teamNameError) && (
                    <motion.p
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-carnival-crimson flex items-center gap-1 font-semibold"
                    >
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{errors.teamName?.message || teamNameError}</span>
                    </motion.p>
                  )}
                </div>

                {/* Theme Color Picker */}
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-carnival-gold" />
                    <span>Squad Theme Color</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setValue('themeColor', color.value)}
                        className={`w-9 h-9 rounded-xl transition-all duration-200 flex items-center justify-center border-2 ${
                          selectedColor === color.value
                            ? 'scale-110 border-white shadow-[0_0_15px_rgba(255,255,255,0.5)]'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {selectedColor === color.value && <Check className="w-4 h-4 text-slate-950 font-bold" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: 4 Team Members Profiles */}
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-carnival-cyan/20 border border-carnival-cyan/40 flex items-center justify-center text-carnival-cyan font-bold">
                    2
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-carnival-cyan" />
                      4 Squad Member Profiles
                    </h2>
                    <p className="text-xs text-slate-400">
                      Member 1 is designated as Team Leader • All 4 profiles required
                    </p>
                  </div>
                </div>

                {/* View Switcher: Tabs vs Grid */}
                <div className="flex items-center p-1 rounded-xl bg-black/40 border border-white/10 text-xs">
                  <button
                    type="button"
                    onClick={() => setLayoutMode('tabs')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                      layoutMode === 'tabs' ? 'bg-carnival-cyan/30 text-carnival-cyan border border-carnival-cyan/40' : 'text-slate-400'
                    }`}
                  >
                    <Layers className="w-3.5 h-3.5" /> Tabbed View
                  </button>
                  <button
                    type="button"
                    onClick={() => setLayoutMode('grid')}
                    className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                      layoutMode === 'grid' ? 'bg-carnival-cyan/30 text-carnival-cyan border border-carnival-cyan/40' : 'text-slate-400'
                    }`}
                  >
                    <Grid className="w-3.5 h-3.5" /> 4-Grid View
                  </button>
                </div>
              </div>

              {/* Tab Navigation Buttons */}
              {layoutMode === 'tabs' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[0, 1, 2, 3].map((idx) => {
                    const hasError = errors.members?.[idx];
                    const isLeader = idx === 0;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveTab(idx)}
                        className={`p-3 rounded-xl border text-left transition relative overflow-hidden flex items-center gap-2.5 ${
                          activeTab === idx
                            ? 'bg-gradient-to-r from-carnival-cyan/20 to-carnival-purple/20 border-carnival-cyan text-white shadow-neon-cyan'
                            : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/30'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                            isLeader
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                              : 'bg-white/10 text-white'
                          }`}
                        >
                          {isLeader ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : idx + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold truncate">
                            {membersWatch[idx]?.name || (isLeader ? 'Leader' : `Member ${idx + 1}`)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono uppercase">
                            {isLeader ? 'Leader' : `Member ${idx + 1}`}
                          </div>
                        </div>
                        {hasError && <AlertCircle className="w-4 h-4 text-carnival-crimson shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Members Content Container */}
              <div className="space-y-6">
                {[0, 1, 2, 3].map((idx) => {
                  if (layoutMode === 'tabs' && activeTab !== idx) return null;
                  const isLeader = idx === 0;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`p-5 sm:p-6 rounded-2xl border space-y-5 bg-black/40 relative ${
                        isLeader
                          ? 'border-amber-400/40 shadow-[0_0_20px_rgba(251,191,36,0.15)]'
                          : 'border-white/10'
                      }`}
                    >
                      {/* Card Member Header */}
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`px-3 py-1 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 ${
                              isLeader
                                ? 'bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-neon-gold'
                                : 'bg-carnival-cyan/20 text-carnival-cyan border border-carnival-cyan/40'
                            }`}
                          >
                            {isLeader ? <Crown className="w-3.5 h-3.5 text-amber-400" /> : <User className="w-3.5 h-3.5" />}
                            <span>{isLeader ? 'MEMBER 1 (TEAM LEADER)' : `MEMBER ${idx + 1}`}</span>
                          </div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">Profile {idx + 1} of 4</span>
                      </div>

                      {/* Card Inputs Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Member Full Name */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-slate-300 flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-slate-400" /> Full Name *
                          </label>
                          <input
                            {...register(`members.${idx}.name`)}
                            type="text"
                            placeholder="e.g. Aarav Sharma"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 text-white text-xs border border-white/15 focus:border-carnival-cyan focus:outline-none"
                          />
                          {errors.members?.[idx]?.name && (
                            <p className="text-[11px] text-carnival-crimson font-semibold">
                              {errors.members[idx]?.name?.message}
                            </p>
                          )}
                        </div>

                        {/* Member Roll Number */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-slate-300 flex items-center gap-1">
                            <Hash className="w-3.5 h-3.5 text-slate-400" /> Roll Number *
                          </label>
                          <input
                            {...register(`members.${idx}.rollNo`)}
                            type="text"
                            placeholder="e.g. 22CSE042"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 text-white text-xs border border-white/15 focus:border-carnival-cyan focus:outline-none font-mono"
                          />
                          {errors.members?.[idx]?.rollNo && (
                            <p className="text-[11px] text-carnival-crimson font-semibold">
                              {errors.members[idx]?.rollNo?.message}
                            </p>
                          )}
                        </div>

                        {/* Department Mail ID */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-slate-300 flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-400" /> Department Mail ID *
                          </label>
                          <input
                            {...register(`members.${idx}.deptMailId`)}
                            type="email"
                            placeholder="e.g. student@college.edu"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 text-white text-xs border border-white/15 focus:border-carnival-cyan focus:outline-none"
                          />
                          {errors.members?.[idx]?.deptMailId && (
                            <p className="text-[11px] text-carnival-crimson font-semibold">
                              {errors.members[idx]?.deptMailId?.message}
                            </p>
                          )}
                        </div>

                        {/* Phone Number */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-slate-300 flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number *
                          </label>
                          <input
                            {...register(`members.${idx}.phone`)}
                            type="tel"
                            placeholder="e.g. +91 9876543210"
                            className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 text-white text-xs border border-white/15 focus:border-carnival-cyan focus:outline-none font-mono"
                          />
                          {errors.members?.[idx]?.phone && (
                            <p className="text-[11px] text-carnival-crimson font-semibold">
                              {errors.members[idx]?.phone?.message}
                            </p>
                          )}
                        </div>

                        {/* Gender selection */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-slate-300">Gender *</label>
                          <div className="grid grid-cols-3 gap-2">
                            {(['Male', 'Female', 'Other'] as const).map((g) => {
                              const isSelected = membersWatch[idx]?.gender === g;
                              return (
                                <button
                                  key={g}
                                  type="button"
                                  onClick={() => setValue(`members.${idx}.gender`, g)}
                                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                                    isSelected
                                      ? 'bg-carnival-cyan/20 border-carnival-cyan text-carnival-cyan'
                                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {g}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Residence Type selection */}
                        <div className="space-y-1.5">
                          <label className="text-xs font-mono text-slate-300">Residence Type *</label>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              { label: '🏠 Hosteller', val: 'Hosteller' },
                              { label: '🚌 Day Scholar', val: 'DayScholar' },
                            ].map((r) => {
                              const isSelected = membersWatch[idx]?.residenceType === r.val;
                              return (
                                <button
                                  key={r.val}
                                  type="button"
                                  onClick={() => setValue(`members.${idx}.residenceType`, r.val as any)}
                                  className={`py-2 rounded-xl text-xs font-bold transition border ${
                                    isSelected
                                      ? 'bg-carnival-gold/20 border-carnival-gold text-carnival-gold'
                                      : 'bg-black/40 border-white/10 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {r.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* SECTION 3: Rulebook Terms & Submit Action */}
            <div className="space-y-6 border-t border-white/10 pt-6">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    {...register('acceptRules')}
                    type="checkbox"
                    className="mt-1 w-4 h-4 rounded border-white/20 text-carnival-crimson focus:ring-carnival-crimson bg-black/60"
                  />
                  <div className="text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-white block">Accept Carnival Rules & Regulations</span>
                    <span>
                      I certify that all 4 member details provided are accurate and belong to enrolled students.
                    </span>
                  </div>
                </label>
                {errors.acceptRules && (
                  <p className="text-xs text-carnival-crimson font-semibold pl-7 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.acceptRules.message}</span>
                  </p>
                )}
              </div>

              {/* Submit Ticket Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-carnival-crimson via-carnival-gold to-carnival-cyan text-slate-950 font-black text-base uppercase tracking-wider shadow-neon-crimson hover:brightness-110 transition duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Punching Carnival Ticket...</span>
                  </>
                ) : (
                  <>
                    <Ticket className="w-5 h-5" />
                    <span>Submit Squad Registration Ticket 🎟️</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
        )}
      </div>

      {/* Celebratory Post-Submission Modal */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="p-8 sm:p-10 rounded-3xl glass-card border-2 border-carnival-gold/60 shadow-2xl max-w-lg w-full text-center space-y-6 bg-gradient-to-b from-[#1E1730] to-[#120F24] relative overflow-hidden"
            >
              <div className="w-20 h-20 rounded-3xl bg-carnival-gold/20 border border-carnival-gold/40 flex items-center justify-center mx-auto text-4xl shadow-neon-gold">
                🎟️
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl sm:text-3xl font-black text-white">Ticket Punched! 🎉</h3>
                <p className="text-sm text-slate-300">
                  Team <strong className="text-carnival-gold">{registeredData?.teamName}</strong> has been registered with 4 complete member profiles. Status: <span className="text-amber-400 font-bold font-mono">Pending Approval</span>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 space-y-3 text-left">
                <div className="text-xs text-slate-400 font-mono">Default Student Credentials</div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-200">
                  <span>Leader Email:</span>
                  <span className="text-white font-bold">{registeredData?.leaderEmail}</span>
                </div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-200">
                  <span>Default Password:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-carnival-gold font-bold">{defaultPassword}</span>
                    <button
                      onClick={handleCopyPassword}
                      className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300"
                      title="Copy Password"
                    >
                      {copiedPassword ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate('/login')}
                  className="flex-1 py-3 rounded-xl bg-carnival-gold text-slate-950 font-extrabold text-sm hover:brightness-110 transition flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Proceed to Student Login</span>
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="py-3 px-4 rounded-xl bg-white/10 text-white font-bold text-sm hover:bg-white/20 transition flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
