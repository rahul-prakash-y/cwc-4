import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
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
} from 'lucide-react';
import apiClient from '../../api/axios';

// Task 2: Zod Schema Definition with strict validations
const registerSchema = z
  .object({
    teamName: z
      .string()
      .trim()
      .min(2, 'Team name must be at least 2 characters')
      .max(50, 'Team name cannot exceed 50 characters'),
    themeColor: z.string().min(1, 'Please select a theme color'),
    residenceType: z.enum(['Hosteller', 'Day Scholar'], {
      required_error: 'Please select residence type',
    }),
    leader: z.object({
      name: z.string().trim().min(2, 'Team leader name is required'),
      rollNumber: z.string().trim().min(2, 'Leader roll number is required'),
      department: z.string().trim().min(2, 'Department is required'),
      phone: z
        .string()
        .trim()
        .min(10, 'Phone number must be at least 10 digits')
        .max(15, 'Invalid phone number'),
      email: z
        .string()
        .trim()
        .toLowerCase()
        .email('Invalid leader email address format'),
    }),
    members: z
      .array(
        z.object({
          name: z.string().trim().min(2, 'Member name is required'),
          rollNumber: z.string().trim().min(2, 'Member roll number is required'),
        })
      )
      .length(3, 'Exactly 3 team members are required (Total squad of 4)'),
    acceptRules: z.boolean().refine((val) => val === true, {
      message: 'You must read and accept the rulebook to submit your application',
    }),
  })
  .superRefine((data, ctx) => {
    // Collect all provided roll numbers
    const rollEntries = [
      { roll: data.leader.rollNumber.trim().toLowerCase(), path: ['leader', 'rollNumber'] },
      { roll: data.members[0]?.rollNumber?.trim().toLowerCase(), path: ['members', 0, 'rollNumber'] },
      { roll: data.members[1]?.rollNumber?.trim().toLowerCase(), path: ['members', 1, 'rollNumber'] },
      { roll: data.members[2]?.rollNumber?.trim().toLowerCase(), path: ['members', 2, 'rollNumber'] },
    ];

    const seenRolls = new Map<string, number>();

    rollEntries.forEach((entry, idx) => {
      if (entry.roll) {
        if (seenRolls.has(entry.roll)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Duplicate Roll Number "${entry.roll.toUpperCase()}". Each student must have a unique roll number.`,
            path: entry.path,
          });
        } else {
          seenRolls.set(entry.roll, idx);
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
  const [registeredData, setRegisteredData] = useState<{
    teamName: string;
    leaderEmail: string;
  } | null>(null);

  const defaultPassword = 'CWC4-Student-2026';

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      teamName: '',
      themeColor: '#FF0055',
      residenceType: 'Hosteller',
      leader: {
        name: '',
        rollNumber: '',
        department: '',
        phone: '',
        email: '',
      },
      members: [
        { name: '', rollNumber: '' },
        { name: '', rollNumber: '' },
        { name: '', rollNumber: '' },
      ],
      acceptRules: false,
    },
  });

  const selectedColor = watch('themeColor');
  const selectedResidence = watch('residenceType');

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

  // Task 3: Submit Handler & API Call
  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      // Map members into payload
      const payload = {
        teamName: data.teamName.trim(),
        themeColor: data.themeColor,
        residenceType: data.residenceType,
        leader: {
          name: data.leader.name.trim(),
          rollNumber: data.leader.rollNumber.trim(),
          department: data.leader.department.trim(),
          phone: data.leader.phone.trim(),
          email: data.leader.email.trim().toLowerCase(),
        },
        members: data.members.map((m, index) => ({
          name: m.name.trim(),
          rollNumber: m.rollNumber.trim(),
          role: `Member ${index + 2}`,
        })),
      };

      const response = await apiClient.post('/auth/register', payload);

      if (response.status === 201 || response.status === 200) {
        setRegisteredData({
          teamName: data.teamName,
          leaderEmail: data.leader.email,
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
      <div className="max-w-4xl mx-auto space-y-8">
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
            className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase font-heading"
          >
            Student <span className="text-gradient-carnival">Self-Registration</span>
          </motion.h1>

          <p className="text-sm text-slate-300 max-w-xl mx-auto font-sans">
            Fill out your 4-member squad details to request your official CWC Season 4 Carnival Admission Ticket.
          </p>
        </div>

        {/* TASK 1: THE CARNIVAL ADMISSION TICKET FORM */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="relative bg-gradient-to-b from-[#141226] via-[#100E20] to-[#0D0B1A] border-2 border-carnival-gold/50 rounded-3xl p-6 sm:p-10 shadow-[0_0_50px_rgba(255,184,0,0.15)] overflow-hidden"
        >
          {/* Ticket Notched Side Circles (Authentic Physical Ticket Look) */}
          <div className="absolute top-1/4 -left-6 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0B0A16] border-r-2 border-carnival-gold/60" />
          <div className="absolute top-1/4 -right-6 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0B0A16] border-l-2 border-carnival-gold/60" />
          <div className="absolute top-3/4 -left-6 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0B0A16] border-r-2 border-carnival-gold/60" />
          <div className="absolute top-3/4 -right-6 -translate-y-1/2 w-10 h-10 rounded-full bg-[#0B0A16] border-l-2 border-carnival-gold/60" />

          {/* Golden Ticket Stub Header */}
          <div className="border-b-2 border-dashed border-carnival-gold/30 pb-6 mb-8 relative">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-carnival-crimson via-carnival-gold to-carnival-cyan p-0.5 shadow-neon-gold">
                  <div className="w-full h-full rounded-[14px] bg-[#0B0A16] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-carnival-gold" />
                  </div>
                </div>
                <div>
                  <h2 className="text-lg font-black text-white tracking-wide uppercase font-heading">
                    Official Squad Entry Ticket
                  </h2>
                  <p className="text-xs text-carnival-gold font-mono tracking-widest">
                    CWC-S4 • SEASON 4 CARNIVAL EDITION
                  </p>
                </div>
              </div>

              <div className="text-center sm:text-right font-mono">
                <span className="inline-block px-3 py-1 rounded-md bg-carnival-gold/10 text-carnival-gold border border-carnival-gold/30 text-xs font-bold">
                  SERIAL: #CWC4-2026-REG
                </span>
                <p className="text-[10px] text-slate-400 mt-1">STATUS: STAGING • PENDING APPROVAL</p>
              </div>
            </div>

            {/* Scissor Cut Indicator */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-4 py-0.5 rounded-full bg-[#100E20] border border-carnival-gold/30 text-[10px] font-mono text-slate-400 flex items-center gap-1">
              <span>✂</span>
              <span>TEAR ALONG DASHES FOR APPLICATION</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* SECTION 1: TEAM IDENTITY */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-carnival-cyan font-bold font-mono text-sm uppercase tracking-wider">
                <Ticket className="w-4 h-4 text-carnival-cyan" />
                <span>Section 1: Team & Theme Identity</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold text-slate-200 uppercase">
                    Team Name <span className="text-carnival-crimson">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. Cyber Samurai"
                      {...register('teamName')}
                      className={`w-full px-4 py-3 rounded-xl bg-black/40 border text-white placeholder-slate-500 font-sans focus:outline-none focus:ring-2 focus:ring-carnival-cyan transition-all ${
                        errors.teamName ? 'border-rose-500' : 'border-white/10'
                      }`}
                    />
                  </div>
                  {errors.teamName && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.teamName.message}</span>
                    </p>
                  )}
                </div>

                {/* Theme Color Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-mono font-bold text-slate-200 uppercase">
                    Team Theme Color <span className="text-carnival-crimson">*</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {PRESET_COLORS.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setValue('themeColor', c.value, { shouldValidate: true })}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                          selectedColor === c.value
                            ? 'ring-4 ring-white/50 scale-110 shadow-lg'
                            : 'opacity-70 hover:opacity-100 hover:scale-105'
                        }`}
                        style={{ backgroundColor: c.value }}
                        title={c.name}
                      >
                        {selectedColor === c.value && (
                          <Check className="w-5 h-5 text-white drop-shadow" />
                        )}
                      </button>
                    ))}
                    <div className="flex items-center gap-2 ml-2">
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => setValue('themeColor', e.target.value)}
                        className="w-9 h-9 rounded-xl bg-transparent border-0 cursor-pointer"
                        title="Custom Color Picker"
                      />
                      <span
                        className="text-xs font-mono px-2.5 py-1 rounded-lg border border-white/20 font-bold"
                        style={{ color: selectedColor }}
                      >
                        {selectedColor}
                      </span>
                    </div>
                  </div>
                  {errors.themeColor && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.themeColor.message}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: TEAM LEADER DETAILS */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-carnival-gold font-bold font-mono text-sm uppercase tracking-wider">
                  <User className="w-4 h-4 text-carnival-gold" />
                  <span>Section 2: Team Leader (Primary Contact)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Creates Portal Account</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Leader Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-slate-200 uppercase">
                    Leader Full Name <span className="text-carnival-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    {...register('leader.name')}
                    className={`w-full px-4 py-2.5 rounded-xl bg-black/40 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-carnival-gold ${
                      errors.leader?.name ? 'border-rose-500' : 'border-white/10'
                    }`}
                  />
                  {errors.leader?.name && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.leader.name.message}</span>
                    </p>
                  )}
                </div>

                {/* Leader Roll Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-slate-200 uppercase">
                    Leader Roll Number <span className="text-carnival-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 22CSE014"
                    {...register('leader.rollNumber')}
                    className={`w-full px-4 py-2.5 rounded-xl bg-black/40 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-carnival-gold ${
                      errors.leader?.rollNumber ? 'border-rose-500' : 'border-white/10'
                    }`}
                  />
                  {errors.leader?.rollNumber && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.leader.rollNumber.message}</span>
                    </p>
                  )}
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-slate-200 uppercase">
                    Department <span className="text-carnival-crimson">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Computer Science Engineering"
                    {...register('leader.department')}
                    className={`w-full px-4 py-2.5 rounded-xl bg-black/40 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-carnival-gold ${
                      errors.leader?.department ? 'border-rose-500' : 'border-white/10'
                    }`}
                  />
                  {errors.leader?.department && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.leader.department.message}</span>
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-slate-200 uppercase">
                    Phone Number <span className="text-carnival-crimson">*</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 9876543210"
                    {...register('leader.phone')}
                    className={`w-full px-4 py-2.5 rounded-xl bg-black/40 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-carnival-gold ${
                      errors.leader?.phone ? 'border-rose-500' : 'border-white/10'
                    }`}
                  />
                  {errors.leader?.phone && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.leader.phone.message}</span>
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-mono font-bold text-slate-200 uppercase">
                    Leader Email Address <span className="text-carnival-crimson">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder="e.g. leader@student.edu"
                    {...register('leader.email')}
                    className={`w-full px-4 py-2.5 rounded-xl bg-black/40 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-carnival-gold ${
                      errors.leader?.email ? 'border-rose-500' : 'border-white/10'
                    }`}
                  />
                  {errors.leader?.email && (
                    <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errors.leader.email.message}</span>
                    </p>
                  )}
                </div>

                {/* Residence Type Toggle */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="block text-xs font-mono font-bold text-slate-200 uppercase">
                    Residence Type <span className="text-carnival-crimson">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setValue('residenceType', 'Hosteller', { shouldValidate: true })}
                      className={`py-3 px-4 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer flex items-center justify-center gap-2 ${
                        selectedResidence === 'Hosteller'
                          ? 'bg-carnival-gold text-black border-carnival-gold shadow-neon-gold'
                          : 'bg-black/40 text-slate-300 border-white/10 hover:border-carnival-gold/40'
                      }`}
                    >
                      <span>🏠 Hosteller</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('residenceType', 'Day Scholar', { shouldValidate: true })}
                      className={`py-3 px-4 rounded-xl text-xs font-bold font-mono transition-all border cursor-pointer flex items-center justify-center gap-2 ${
                        selectedResidence === 'Day Scholar'
                          ? 'bg-carnival-cyan text-black border-carnival-cyan shadow-neon-cyan'
                          : 'bg-black/40 text-slate-300 border-white/10 hover:border-carnival-cyan/40'
                      }`}
                    >
                      <span>🚌 Day Scholar</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 3: SQUAD MEMBERS (MEMBERS 2, 3, 4) */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-carnival-purple font-bold font-mono text-sm uppercase tracking-wider">
                  <Users className="w-4 h-4 text-carnival-purple" />
                  <span>Section 3: Squad Teammates (Members 2, 3 & 4)</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">Total Squad = Leader + 3 Members</span>
              </div>

              <div className="space-y-4">
                {[1, 2, 3].map((num, idx) => (
                  <div
                    key={num}
                    className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3"
                  >
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-carnival-cyan uppercase">
                      <span className="w-5 h-5 rounded-full bg-carnival-cyan/20 border border-carnival-cyan/40 flex items-center justify-center text-[10px]">
                        {num + 1}
                      </span>
                      <span>Member {num + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono text-slate-300">
                          Full Name <span className="text-carnival-crimson">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder={`Member ${num + 1} Name`}
                          {...register(`members.${idx}.name` as const)}
                          className={`w-full px-3.5 py-2 rounded-xl bg-black/40 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-carnival-cyan ${
                            errors.members?.[idx]?.name ? 'border-rose-500' : 'border-white/10'
                          }`}
                        />
                        {errors.members?.[idx]?.name && (
                          <p className="text-xs text-rose-500 font-medium mt-1">
                            {errors.members[idx]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-mono text-slate-300">
                          Roll Number <span className="text-carnival-crimson">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder={`e.g. 22CSE0${idx + 20}`}
                          {...register(`members.${idx}.rollNumber` as const)}
                          className={`w-full px-3.5 py-2 rounded-xl bg-black/40 border text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-carnival-cyan ${
                            errors.members?.[idx]?.rollNumber ? 'border-rose-500' : 'border-white/10'
                          }`}
                        />
                        {errors.members?.[idx]?.rollNumber && (
                          <p className="text-xs text-rose-500 font-medium mt-1">
                            {errors.members[idx]?.rollNumber?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 4: RULEBOOK ACCEPTANCE */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  {...register('acceptRules')}
                  className="mt-1 w-4 h-4 rounded bg-black/40 border-white/20 text-carnival-gold focus:ring-carnival-gold"
                />
                <span className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  I agree to the{' '}
                  <Link
                    to="/rules"
                    target="_blank"
                    className="text-carnival-gold underline font-semibold hover:text-white"
                  >
                    CWC Season 4 Carnival Rulebook
                  </Link>
                  . I verify that all member roll numbers are unique and correct.
                </span>
              </label>
              {errors.acceptRules && (
                <p className="text-xs text-rose-500 font-medium flex items-center gap-1 pl-7">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.acceptRules.message}</span>
                </p>
              )}
            </div>

            {/* SECTION 5: SUBMIT TICKET STUB */}
            <div className="pt-6 border-t-2 border-dashed border-carnival-gold/30 space-y-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-carnival-crimson via-carnival-gold to-carnival-cyan text-black font-black text-base uppercase tracking-wider shadow-[0_0_30px_rgba(255,184,0,0.4)] hover:shadow-[0_0_50px_rgba(255,184,0,0.7)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin text-black" />
                    <span>Punching Registration Ticket...</span>
                  </>
                ) : (
                  <>
                    <Ticket className="w-6 h-6 text-black" />
                    <span>Submit Carnival Ticket Application 🎟️</span>
                  </>
                )}
              </button>

              <p className="text-center text-[11px] font-mono text-slate-400">
                🔒 Protected by CWC Security • Assigned Default Password: <code className="text-carnival-gold">{defaultPassword}</code>
              </p>
            </div>
          </form>
        </motion.div>
      </div>

      {/* TASK 5: POST-REGISTRATION CELEBRATORY SUCCESS MODAL */}
      <AnimatePresence>
        {isSuccessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-full max-w-lg bg-gradient-to-b from-[#1E1938] via-[#141029] to-[#0D0A1C] border-2 border-carnival-gold rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(255,184,0,0.5)] overflow-hidden text-center space-y-6"
            >
              {/* Ticket Punched Stamp Graphic Banner */}
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-carnival-gold/20 rounded-full blur-2xl pointer-events-none" />

              <div className="inline-flex p-4 rounded-3xl bg-carnival-gold/20 border-2 border-carnival-gold text-carnival-gold shadow-neon-gold animate-bounce">
                <Ticket className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <div className="inline-block px-3 py-1 rounded-full bg-carnival-crimson/20 text-carnival-crimson border border-carnival-crimson/40 text-xs font-mono font-bold uppercase tracking-widest">
                  STAMP: APPROVED FOR REVIEW
                </div>
                <h2 className="text-3xl font-black text-white uppercase tracking-tight font-heading">
                  🎟️ Ticket Punched!
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-left space-y-3">
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
                  Your team application for <strong className="text-carnival-cyan font-bold">{registeredData?.teamName}</strong> has been submitted and is awaiting <strong className="text-carnival-gold">Admin Approval</strong>.
                </p>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Once approved, log in using your email (<code className="text-carnival-gold">{registeredData?.leaderEmail}</code>) and the default password below. You will be asked to change it on your first login.
                </p>
              </div>

              {/* Default Password Callout Box */}
              <div className="p-4 rounded-2xl bg-carnival-gold/10 border border-carnival-gold/40 flex items-center justify-between gap-3 text-left">
                <div>
                  <span className="block text-[10px] font-mono text-carnival-gold font-bold uppercase">
                    Assigned Default Password
                  </span>
                  <span className="font-mono text-lg font-black text-white tracking-widest">
                    {defaultPassword}
                  </span>
                </div>
                <button
                  onClick={handleCopyPassword}
                  className="px-3.5 py-2 rounded-xl bg-carnival-gold text-black font-bold text-xs flex items-center gap-1.5 hover:scale-105 transition-transform cursor-pointer"
                >
                  {copiedPassword ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPassword ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>

              {/* Navigation Action Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => navigate('/login/student')}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-carnival-cyan to-carnival-purple text-black font-extrabold text-xs uppercase tracking-wider shadow-neon-cyan hover:scale-[1.02] transition-transform cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Go to Student Login</span>
                </button>
                <button
                  onClick={() => navigate('/')}
                  className="w-full py-3 px-4 rounded-xl glass-card text-slate-200 border border-white/20 font-bold text-xs uppercase tracking-wider hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  <span>Return to Home</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Register;
