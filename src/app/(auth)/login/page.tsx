'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, LogIn, Lock, Mail, Eye, EyeOff, BadgeCheck,
  Building2, MessageSquare, Clock, ArrowRight, Phone,
  ShieldCheck, ExternalLink, AlertCircle, CheckCircle2
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

/* ─── Mock auth — patient only ─── */
const MOCK_PATIENT = { email: 'patient@indiacare.com', phone: '+91 98765 43210', password: 'password123' };

/* ─── Floating brand card ─── */
function BrandCard({ delay, icon: Icon, color, label, sub, className }: {
  delay: number; icon: React.ElementType; color: string; label: string; sub: string; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6 }}
      className={`absolute flex items-center gap-3 bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-4 py-3 shadow-xl ${className}`}
    >
      <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut' }}>
        <div className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
      </motion.div>
      <div>
        <p className="text-white font-extrabold text-xs leading-tight">{label}</p>
        <p className="text-white/70 text-[10px] mt-0.5">{sub}</p>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) {
      setError('Please enter your email / phone and password.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const isMatch =
        (identifier === MOCK_PATIENT.email || identifier === MOCK_PATIENT.phone) &&
        password === MOCK_PATIENT.password;

      if (isMatch) {
        setSuccess(true);
        toast('success', 'Welcome Back!', 'Redirecting to your patient dashboard…');
        setTimeout(() => router.push('/'), 1200);
      } else {
        setError('Invalid credentials. Use patient@indiacare.com / password123 to demo.');
      }
    }, 1100);
  };

  const handleOtpSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier) { setError('Please enter your mobile number.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setOtpSent(true);
      toast('info', 'OTP Sent', `A 6-digit OTP has been sent to ${identifier}`);
    }, 900);
  };

  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp !== '123456') { setError('Invalid OTP. Use 123456 for demo.'); return; }
    setSuccess(true);
    toast('success', 'OTP Verified!', 'Redirecting to your dashboard…');
    setTimeout(() => router.push('/dashboard/patient'), 1200);
  };

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT BRANDING PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden flex-col justify-between p-10 xl:p-14"
        style={{ background: 'linear-gradient(145deg, #0A5C4E 0%, #127A6A 45%, #1A9A83 100%)' }}>
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        {/* Blobs */}
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-black/10 blur-3xl pointer-events-none" />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center shadow-lg">
            <Heart className="w-5.5 h-5.5 text-white fill-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg text-white tracking-wider leading-tight">INDIA CARE</span>
            <span className="text-[10px] font-bold text-white/70 tracking-[0.2em] leading-none">CONSULTANCY</span>
          </div>
        </motion.div>

        {/* Hero Text */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.6 }}
          className="relative z-10 my-auto">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight">
            Your Healthcare<br />Guidance Partner
          </h1>
          <p className="text-white/75 text-sm sm:text-base mt-4 leading-relaxed max-w-sm">
            Login to manage your consultation requests, doctor suggestions, appointments, and medical reports.
          </p>

          {/* Floating cards — positioned relative to this container */}
          <div className="relative mt-12 h-48">
            <BrandCard delay={0.4} icon={BadgeCheck}  color="bg-emerald-500"  label="100+ Verified Doctors"    sub="NMC Certified Network"     className="top-0 left-0" />
            <BrandCard delay={0.6} icon={Building2}   color="bg-indigo-500"   label="30+ Partner Hospitals"    sub="NABH Accredited"           className="top-14 right-0" />
            <BrandCard delay={0.8} icon={MessageSquare} color="bg-violet-500" label="Personal Guidance"        sub="Free for patients"         className="bottom-0 left-8" />
            <BrandCard delay={1.0} icon={Clock}        color="bg-amber-500"   label="Fast Appointments"        sub="Same day coordination"     className="bottom-6 right-4" />
          </div>
        </motion.div>

        {/* Bottom disclaimer */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="relative z-10 flex items-start gap-2 bg-white/10 border border-white/15 rounded-2xl px-4 py-3">
          <ShieldCheck className="w-4 h-4 text-white/80 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-white/70 leading-relaxed">
            This portal is exclusively for patients. Doctors, hospitals, and consultants should use the
            {' '}<a href={`${process.env.NEXT_PUBLIC_PANEL_URL}/login`} target="_blank" rel="noopener noreferrer"
              className="text-white font-bold underline underline-offset-2 hover:text-white/90">Panel App ↗</a>.
          </p>
        </motion.div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-12 bg-white relative overflow-hidden">
        {/* Top-right soft gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-primary-green/4 blur-3xl pointer-events-none" />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
            <Heart className="w-4.5 h-4.5 text-white fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-dark-navy tracking-wider leading-tight block">INDIA CARE</span>
            <span className="text-[9px] font-bold text-primary-green tracking-widest leading-none block">CONSULTANCY</span>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
          className="w-full max-w-[400px] relative z-10">

          {/* Mode toggle */}
          <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl mb-7">
            <button onClick={() => { setOtpMode(false); setError(''); setOtpSent(false); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${!otpMode ? 'bg-white text-primary-green shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Password Login
            </button>
            <button onClick={() => { setOtpMode(true); setError(''); setPassword(''); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${otpMode ? 'bg-white text-primary-green shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              Login with OTP
            </button>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-dark-navy tracking-tight">
              {otpMode ? 'Login with OTP' : 'Welcome Back'}
            </h2>
            <p className="text-xs text-text-grey mt-1.5">
              {otpMode ? 'Enter your mobile number to receive a one-time password.' : 'Login to access your patient dashboard.'}
            </p>
          </div>

          {/* Error banner */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-5 text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Success banner */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-4 py-3 mb-5 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Login successful! Redirecting…
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── PASSWORD FORM ── */}
          {!otpMode && (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              {/* Email / Phone */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-dark-navy uppercase tracking-wide px-1">Email or Mobile</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={identifier} onChange={e => { setIdentifier(e.target.value); setError(''); }}
                    placeholder="email@example.com or +91 XXXXX XXXXX"
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-sm text-dark-navy placeholder-slate-400 focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10 transition-all" />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[11px] font-bold text-dark-navy uppercase tracking-wide">Password</label>
                  <button type="button" onClick={() => toast('info', 'Forgot Password', 'Password reset link sent to your registered email/phone.')}
                    className="text-[10px] font-bold text-primary-green hover:text-dark-green transition-colors">
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-10 py-3 rounded-2xl text-sm text-dark-navy placeholder-slate-400 focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10 transition-all" />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <motion.button type="submit" disabled={loading || success} whileTap={{ scale: 0.98 }}
                className="w-full gradient-primary text-white font-bold py-3.5 rounded-2xl shadow-lg glow-green flex items-center justify-center gap-2 mt-1 disabled:opacity-60 transition-all">
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" /> Login
                  </>
                )}
              </motion.button>
            </form>
          )}

          {/* ── OTP FORM ── */}
          {otpMode && (
            <form onSubmit={otpSent ? handleOtpVerify : handleOtpSend} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-dark-navy uppercase tracking-wide px-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="tel" value={identifier} onChange={e => { setIdentifier(e.target.value); setError(''); }} disabled={otpSent}
                    placeholder="+91 XXXXX XXXXX"
                    className="w-full bg-slate-50 border border-slate-200 pl-10 pr-4 py-3 rounded-2xl text-sm text-dark-navy placeholder-slate-400 focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10 disabled:opacity-60 transition-all" />
                </div>
              </div>
              <AnimatePresence>
                {otpSent && (
                  <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-dark-navy uppercase tracking-wide px-1">Enter OTP</label>
                    <input type="text" maxLength={6} value={otp} onChange={e => { setOtp(e.target.value); setError(''); }}
                      placeholder="6-digit OTP"
                      className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-2xl text-sm text-center font-bold tracking-widest text-dark-navy focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10" />
                    <p className="text-[10px] text-text-grey text-center">Demo OTP: <span className="font-bold text-dark-navy">123456</span></p>
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }}
                className="w-full gradient-primary text-white font-bold py-3.5 rounded-2xl shadow-lg glow-green flex items-center justify-center gap-2 mt-1 disabled:opacity-60 transition-all">
                {loading
                  ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Processing…</>
                  : otpSent ? <><CheckCircle2 className="w-4 h-4" /> Verify & Login</> : <><Phone className="w-4 h-4" /> Send OTP</>
                }
              </motion.button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">New to ICC?</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Sign up link */}
          <Link href="/signup"
            className="w-full flex items-center justify-center gap-2 border-2 border-primary-green/20 text-primary-green font-bold text-sm py-3.5 rounded-2xl bg-soft-green hover:bg-light-mint transition-colors">
            Create Patient Account <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Demo hint */}
          <div className="mt-6 p-4 bg-slate-50 border border-slate-100 rounded-2xl">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Demo Credentials</p>
            <p className="text-[11px] text-text-grey">
              Email: <span className="font-mono text-slate-700 font-bold">patient@indiacare.com</span><br />
              Password: <span className="font-mono text-slate-700 font-bold">password123</span>
            </p>
          </div>

          {/* Panel access link */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-text-grey">
            <span>Doctor / Hospital / Admin?</span>
            <a href={`${process.env.NEXT_PUBLIC_PANEL_URL}/login`} target="_blank" rel="noopener noreferrer"
              className="font-bold text-primary-green hover:text-dark-green flex items-center gap-1 transition-colors">
              Panel Access <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
