import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { User, Shield, Lock, Ticket, ArrowRight, Eye, EyeOff, Sparkles, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import { triggerCarnivalConfetti } from '../components/hero/ConfettiEffect';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';

// Task 2: Zod Schema Validation to prevent silent validation failures
const loginFormSchema = z.object({
  email: z.string().min(1, 'Email, Username or Ticket Code is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginFormSchema>;

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { login: authContextLogin } = useAuth();

  // Active mode: 'student' or 'admin'
  const isPathAdmin = location.pathname.includes('/admin');
  const initialRole = isPathAdmin || searchParams.get('role') === 'admin' ? 'admin' : 'student';
  const [activeRole, setActiveRole] = useState<'student' | 'admin'>(initialRole);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Task 1 & Task 2: Setup react-hook-form with Zod validation
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: initialRole === 'admin' ? 'admin@cwc.com' : 'leader@alpha.com',
      password: initialRole === 'admin' ? 'adminpass123' : 'carnival2026',
    },
  });

  useEffect(() => {
    if (location.pathname.includes('/admin') || searchParams.get('role') === 'admin') {
      setActiveRole('admin');
      setValue('email', 'admin@cwc.com');
      setValue('password', 'adminpass123');
    } else if (location.pathname.includes('/student') || searchParams.get('role') === 'student') {
      setActiveRole('student');
      setValue('email', 'leader@alpha.com');
      setValue('password', 'carnival2026');
    }
  }, [location.pathname, searchParams, setValue]);

  // Task 1 & Task 4: Form Submit Handler with API Call & console.log verification
  const onSubmit = async (data: LoginFormData) => {
    // Task 1: Verify submit button click is registering
    console.log("Form submitted", data);
    setIsSubmitting(true);

    try {
      // Task 4: Wire Axios API call to POST /api/auth/login wrapped in try/catch
      const response = await apiClient.post('/v1/auth/login', {
        email: data.email,
        password: data.password,
      });

      const resData = response.data;
      console.log('Login API response:', resData);

      if (resData.token && resData.user) {
        authContextLogin(resData.token, resData.user);
      }

      // Display Toast notification on success
      toast.success(resData.message || '🎉 Authentication Successful!');
      triggerCarnivalConfetti();

      // Route to correct portal based on role & isFirstLogin flag
      if (resData.user?.role === 'student' && resData.user?.isFirstLogin) {
        setTimeout(() => navigate('/student/setup-password'), 800);
      } else if (resData.user?.role === 'student') {
        setTimeout(() => navigate('/student'), 800);
      } else {
        setTimeout(() => navigate('/admin'), 800);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Login failed. Please check your credentials.';

      // Task 4: Display error using Toast notification so we don't have to check console
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Task 2: Invalid validation callback to fire toast notification on validation error
  const onValidationError = (formErrors: typeof errors) => {
    console.warn('Form validation failed:', formErrors);
    const firstErrorMessage =
      formErrors.email?.message || formErrors.password?.message || 'Please fill in all required fields properly.';
    toast.error(`⚠️ Validation Error: ${firstErrorMessage}`);
  };

  // Demo credential autofill helper
  const handleAutofillDemo = () => {
    if (activeRole === 'student') {
      setValue('email', 'leader@alpha.com');
      setValue('password', 'carnival2026');
      toast.success('Autofilled Student Demo Credentials!');
    } else {
      setValue('email', 'admin@cwc.com');
      setValue('password', 'adminpass123');
      toast.success('Autofilled Admin Demo Credentials!');
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center relative overflow-hidden bg-slate-50 dark:bg-[#0B0A16]">
      {/* Background Decorative Carnival Elements */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-carnival-crimson/10 dark:bg-carnival-crimson/15 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-carnival-cyan/10 dark:bg-carnival-cyan/15 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-xl space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-card bg-white/80 dark:bg-transparent border border-amber-500/40 dark:border-carnival-gold/40 text-amber-700 dark:text-carnival-gold text-xs font-mono font-bold tracking-widest uppercase">
            <Ticket className="w-4 h-4 text-amber-600 dark:text-carnival-gold" />
            <span>Carnival Gate Authentication</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Enter <span className="text-gradient-carnival">CWC Season 4</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Select your entrance portal pass below to log in.
          </p>
        </div>

        {/* Role Toggle Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2 rounded-3xl glass-card bg-white/90 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-lg dark:shadow-2xl">
          {/* Student Login Button */}
          <button
            type="button"
            onClick={() => {
              setActiveRole('student');
              navigate('/login/student', { replace: true });
            }}
            className={`relative group overflow-hidden p-5 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer ${
              activeRole === 'student'
                ? 'bg-gradient-to-r from-cyan-100/90 via-indigo-100/50 to-purple-100/90 dark:from-carnival-cyan/20 dark:via-indigo-900/60 dark:to-carnival-purple/30 border-cyan-500 dark:border-carnival-cyan shadow-md dark:shadow-[0_0_30px_rgba(0,240,255,0.35)] scale-[1.02]'
                : 'bg-slate-100/80 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-cyan-400 dark:hover:border-carnival-cyan/50 hover:bg-slate-200/50 dark:hover:bg-white/10 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3.5 z-10">
              <div
                className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                  activeRole === 'student'
                    ? 'bg-cyan-500 text-white dark:bg-carnival-cyan dark:text-black font-bold shadow-sm dark:shadow-neon-cyan'
                    : 'bg-slate-200/80 dark:bg-white/10 text-cyan-700 dark:text-carnival-cyan'
                }`}
              >
                <User className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-carnival-cyan transition-colors">
                  Student Portal
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Team & Tasks Dashboard</div>
              </div>
            </div>

            {activeRole === 'student' && (
              <div className="w-3 h-3 rounded-full bg-cyan-500 dark:bg-carnival-cyan shadow-[0_0_12px_#00F0FF] animate-pulse" />
            )}
          </button>

          {/* Admin Login Button */}
          <button
            type="button"
            onClick={() => {
              setActiveRole('admin');
              navigate('/login/admin', { replace: true });
            }}
            className={`relative group overflow-hidden p-5 rounded-2xl border transition-all duration-300 text-left flex items-center justify-between cursor-pointer ${
              activeRole === 'admin'
                ? 'bg-gradient-to-r from-rose-100/90 via-pink-100/50 to-amber-100/90 dark:from-carnival-crimson/20 dark:via-rose-950/60 dark:to-carnival-gold/20 border-rose-500 dark:border-carnival-crimson shadow-md dark:shadow-[0_0_30px_rgba(255,0,85,0.35)] scale-[1.02]'
                : 'bg-slate-100/80 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-rose-400 dark:hover:border-carnival-crimson/50 hover:bg-slate-200/50 dark:hover:bg-white/10 opacity-80 hover:opacity-100'
            }`}
          >
            <div className="flex items-center gap-3.5 z-10">
              <div
                className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                  activeRole === 'admin'
                    ? 'bg-rose-600 text-white dark:bg-carnival-crimson dark:text-white font-bold shadow-sm dark:shadow-neon-crimson'
                    : 'bg-slate-200/80 dark:bg-white/10 text-rose-700 dark:text-carnival-crimson'
                }`}
              >
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <div className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-carnival-crimson transition-colors">
                  Admin Portal
                </div>
                <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">Command Center Access</div>
              </div>
            </div>

            {activeRole === 'admin' && (
              <div className="w-3 h-3 rounded-full bg-rose-600 dark:bg-carnival-crimson shadow-[0_0_12px_#FF0055] animate-pulse" />
            )}
          </button>
        </div>

        {/* Dynamic Authentication Form */}
        <div className="glass-card bg-white/95 dark:bg-slate-900/90 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-2xl relative">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2">
              {activeRole === 'student' ? (
                <Ticket className="w-5 h-5 text-cyan-600 dark:text-carnival-cyan" />
              ) : (
                <Lock className="w-5 h-5 text-rose-600 dark:text-carnival-crimson" />
              )}
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {activeRole === 'student' ? 'Student Portal Authentication' : 'Admin Security Access'}
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 uppercase">
              {activeRole === 'student' ? 'Student Mode' : 'Admin Mode'}
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit, onValidationError)} className="space-y-5">
            {/* Email / Username Input */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">
                {activeRole === 'student' ? 'Student Email / Ticket Code' : 'Admin Master Email'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  {...register('email')}
                  placeholder={activeRole === 'student' ? 'e.g. leader@alpha.com' : 'e.g. admin@cwc.com'}
                  className={`w-full bg-slate-50 dark:bg-white/5 border ${
                    errors.email ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                  } rounded-xl px-4 py-3 pl-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-carnival-gold focus:bg-white dark:focus:bg-black/40 transition-all font-mono`}
                />
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
              {errors.email && (
                <p className="text-red-500 dark:text-red-400 text-xs font-mono mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 inline" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 uppercase mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  placeholder="••••••••"
                  className={`w-full bg-slate-50 dark:bg-white/5 border ${
                    errors.password ? 'border-red-500' : 'border-slate-300 dark:border-white/10'
                  } rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-amber-500 dark:focus:border-carnival-gold focus:bg-white dark:focus:bg-black/40 transition-all font-mono`}
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 dark:text-red-400 text-xs font-mono mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 inline" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeRole === 'student'
                  ? 'bg-gradient-to-r from-cyan-500 via-indigo-500 to-purple-600 text-white dark:text-black shadow-md dark:shadow-neon-cyan hover:scale-[1.02]'
                  : 'bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 text-white shadow-md dark:shadow-neon-crimson hover:scale-[1.02]'
              } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{activeRole === 'student' ? 'Access Student Portal' : 'Launch Admin Command'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Autofill Helper */}
          <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400">
            <span>Need immediate test access?</span>
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="text-amber-600 dark:text-carnival-gold hover:underline flex items-center gap-1 font-bold cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autofill Demo Credentials</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
