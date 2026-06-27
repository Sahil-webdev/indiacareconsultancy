'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Heart, LogIn, UserPlus, Mail, Lock, Eye, EyeOff, Phone, User,
  MapPin, ChevronDown, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck,
  BadgeCheck, ExternalLink,
} from 'lucide-react';
import { usePatientAuth, MOCK_PATIENTS, MOCK_PASSWORD, PatientProfile } from '@/lib/patientAuth';

const CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Gurugram', 'Pune', 'Ahmedabad', 'Jaipur', 'Other'];

/* ─────────────────────────────────────────
   AuthModal
───────────────────────────────────────── */
export default function AuthModal() {
  const router = useRouter();
  const { authModalOpen, authModalTab, closeAuthModal, login } = usePatientAuth();
  const [tab, setTab] = useState<'login' | 'signup'>(authModalTab);

  // Sync tab when modal opens
  useEffect(() => { if (authModalOpen) setTab(authModalTab); }, [authModalOpen, authModalTab]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = authModalOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [authModalOpen]);

  const handleLoginSuccess = (p: PatientProfile) => {
    login(p);
    closeAuthModal();
    router.push('/my-health');
  };

  return (
    <AnimatePresence>
      {authModalOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeAuthModal}
            className="fixed inset-0 z-[200] bg-dark-navy/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden pointer-events-auto max-h-[92vh] flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              {/* Top stripe */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-green via-accent-green to-primary-green" />

              {/* Close */}
              <button
                onClick={closeAuthModal}
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>

              {/* Header */}
              <div className="px-6 pt-7 pb-5 flex-shrink-0">
                {/* Logo */}
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
                    <Heart className="w-4 h-4 fill-white text-white" />
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-dark-navy tracking-wider block leading-tight">INDIA CARE</span>
                    <span className="text-[9px] font-bold text-primary-green tracking-widest block">CONSULTANCY</span>
                  </div>
                </div>

                {/* Tab switcher */}
                <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl">
                  <button
                    onClick={() => setTab('login')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'login' ? 'bg-white text-primary-green shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <LogIn className="w-3.5 h-3.5" /> Sign In
                  </button>
                  <button
                    onClick={() => setTab('signup')}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${tab === 'signup' ? 'bg-white text-primary-green shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Create Account
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-6 pb-6">
                <AnimatePresence mode="wait">
                  {tab === 'login' ? (
                    <motion.div key="login" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}>
                      <LoginForm onSuccess={handleLoginSuccess} onSwitchTab={() => setTab('signup')} />
                    </motion.div>
                  ) : (
                    <motion.div key="signup" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}>
                      <SignupForm onSuccess={handleLoginSuccess} onSwitchTab={() => setTab('login')} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   Login Form
───────────────────────────────────────── */
function LoginForm({ onSuccess, onSwitchTab }: { onSuccess: (p: PatientProfile) => void; onSwitchTab: () => void }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!identifier || !password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const p = MOCK_PATIENTS.find(p => p.email === identifier || p.mobile === identifier);
      if (p && password === MOCK_PASSWORD) {
        onSuccess(p);
      } else {
        setError('Invalid credentials. Demo: patient@indiacare.com / password123');
      }
    }, 900);
  };

  return (
    <form onSubmit={handle} className="flex flex-col gap-4 pt-1">
      <div>
        <h2 className="text-xl font-extrabold text-dark-navy">Welcome Back 👋</h2>
        <p className="text-xs text-text-grey mt-1">Sign in to access your health dashboard.</p>
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-3.5 py-2.5 text-xs font-medium">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" /> {error}
        </div>
      )}

      <Field label="Email or Mobile" icon={Mail}>
        <input
          type="text" value={identifier} onChange={e => { setIdentifier(e.target.value); setError(''); }}
          placeholder="patient@indiacare.com"
          className="w-full bg-slate-50 border border-slate-200 pl-9 pr-4 py-2.5 rounded-xl text-sm text-dark-navy placeholder-slate-400 focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10 transition-all"
        />
      </Field>

      <Field label="Password" icon={Lock}>
        <div className="relative">
          <input
            type={showPwd ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
            placeholder="••••••••"
            className="w-full bg-slate-50 border border-slate-200 pl-9 pr-10 py-2.5 rounded-xl text-sm text-dark-navy placeholder-slate-400 focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10 transition-all"
          />
          <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </Field>

      <button
        type="submit" disabled={loading}
        className="w-full gradient-primary text-white font-bold py-3 rounded-xl shadow-md glow-green flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
      >
        {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Signing in…</> : <><LogIn className="w-4 h-4" /> Sign In</>}
      </button>

      {/* Demo hint */}
      <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Demo</p>
        <p className="text-[11px] text-text-grey">
          Email: <span className="font-mono text-slate-700 font-bold">patient@indiacare.com</span><br />
          Password: <span className="font-mono text-slate-700 font-bold">password123</span>
        </p>
      </div>

      <p className="text-center text-xs text-text-grey">
        New patient?{' '}
        <button type="button" onClick={onSwitchTab} className="text-primary-green font-bold hover:text-dark-green transition-colors">
          Create account →
        </button>
      </p>

      <div className="flex items-center justify-center gap-2 text-[11px] text-text-grey pt-1">
        <span>Doctor / Hospital?</span>
        <a href="http://localhost:3001/login" target="_blank" rel="noopener noreferrer"
          className="font-bold text-primary-green hover:text-dark-green flex items-center gap-0.5">
          Panel Access <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </form>
  );
}

/* ─────────────────────────────────────────
   Signup Form
───────────────────────────────────────── */
interface SignupData {
  name: string; mobile: string; email: string;
  password: string; confirmPassword: string;
  city: string; gender: string;
  agreeTerms: boolean; agreePrivacy: boolean; agreeDisclaimer: boolean;
}

function SignupForm({ onSuccess, onSwitchTab }: { onSuccess: (p: PatientProfile) => void; onSwitchTab: () => void }) {
  const [form, setForm] = useState<SignupData>({
    name: '', mobile: '', email: '', password: '', confirmPassword: '',
    city: '', gender: '', agreeTerms: false, agreePrivacy: false, agreeDisclaimer: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof SignupData, string>>>({});
  const [loading, setLoading] = useState(false);

  const set = (k: keyof SignupData, v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Required';
    if (!form.mobile.trim()) e.mobile = 'Required';
    if (!form.email.trim()) e.email = 'Required';
    if (!form.password || form.password.length < 8) e.password = 'Min. 8 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.city) e.city = 'Required';
    if (!form.agreeTerms) e.agreeTerms = 'Required';
    if (!form.agreePrivacy) e.agreePrivacy = 'Required';
    if (!form.agreeDisclaimer) e.agreeDisclaimer = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const newPatient: PatientProfile = {
        id: `patient_${Date.now()}`,
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        city: form.city,
        gender: form.gender,
        profileComplete: false,
        createdAt: new Date().toISOString(),
      };
      onSuccess(newPatient);
    }, 1000);
  };

  const inp = (k: keyof SignupData) =>
    `w-full bg-slate-50 border ${errors[k] ? 'border-red-300' : 'border-slate-200 focus:border-primary-green'} rounded-xl text-sm text-dark-navy placeholder-slate-400 focus:outline-none focus:ring-2 ${errors[k] ? 'focus:ring-red-100' : 'focus:ring-primary-green/10'} transition-all`;

  return (
    <form onSubmit={handle} className="flex flex-col gap-3.5 pt-1">
      <div>
        <h2 className="text-xl font-extrabold text-dark-navy">Create Account 🏥</h2>
        <p className="text-xs text-text-grey mt-1">Join India Care — free for patients.</p>
      </div>

      {/* Name */}
      <Field label="Full Name" icon={User} error={errors.name}>
        <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
          placeholder="Your full name" className={`${inp('name')} pl-9 pr-4 py-2.5`} />
      </Field>

      {/* Mobile + Email */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Mobile" icon={Phone} error={errors.mobile}>
          <input type="tel" value={form.mobile} onChange={e => set('mobile', e.target.value)}
            placeholder="+91 XXXXX" className={`${inp('mobile')} pl-9 pr-3 py-2.5`} />
        </Field>
        <Field label="Email" icon={Mail} error={errors.email}>
          <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
            placeholder="you@email.com" className={`${inp('email')} pl-9 pr-3 py-2.5`} />
        </Field>
      </div>

      {/* Password */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Password" icon={Lock} error={errors.password}>
          <div className="relative">
            <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
              placeholder="Min 8 chars" className={`${inp('password')} pl-9 pr-9 py-2.5`} />
            <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
              {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </Field>
        <Field label="Confirm" icon={Lock} error={errors.confirmPassword}>
          <input type="password" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
            placeholder="Re-enter" className={`${inp('confirmPassword')} pl-9 pr-3 py-2.5`} />
        </Field>
      </div>

      {/* City + Gender */}
      <div className="grid grid-cols-2 gap-3">
        <Field label="City" icon={MapPin} error={errors.city}>
          <div className="relative">
            <select value={form.city} onChange={e => set('city', e.target.value)}
              className={`${inp('city')} pl-9 pr-7 py-2.5 appearance-none`}>
              <option value="">Select city</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </Field>
        <Field label="Gender" icon={User}>
          <div className="relative">
            <select value={form.gender} onChange={e => set('gender', e.target.value)}
              className={`${inp('gender')} pl-9 pr-7 py-2.5 appearance-none`}>
              <option value="">Optional</option>
              <option>Male</option><option>Female</option><option>Other</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          </div>
        </Field>
      </div>

      {/* Consents */}
      <div className="flex flex-col gap-2 pt-1">
        {([
          { k: 'agreeTerms' as const, label: <>I agree to the <Link href="/terms" className="text-primary-green font-bold hover:underline" target="_blank">Terms & Conditions</Link></> },
          { k: 'agreePrivacy' as const, label: <>I agree to the <Link href="/privacy" className="text-primary-green font-bold hover:underline" target="_blank">Privacy Policy</Link></> },
          { k: 'agreeDisclaimer' as const, label: <>I understand ICC provides guidance only, not medical treatment</> },
        ]).map(({ k, label }) => (
          <div key={k}>
            <label className="flex items-start gap-2.5 cursor-pointer">
              <div
                onClick={() => set(k, !form[k])}
                className={`flex-shrink-0 mt-0.5 w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${form[k] ? 'bg-primary-green border-primary-green' : 'border-slate-300 hover:border-primary-green/50'}`}
              >
                {form[k] && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className="text-[11px] text-text-grey leading-relaxed">{label}</span>
            </label>
            {errors[k] && <p className="text-[10px] text-red-500 font-semibold pl-6 mt-0.5">{errors[k]}</p>}
          </div>
        ))}
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full gradient-primary text-white font-bold py-3 rounded-xl shadow-md glow-green flex items-center justify-center gap-2 disabled:opacity-60 transition-all"
      >
        {loading ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />Creating…</> : <><UserPlus className="w-4 h-4" />Create Account</>}
      </button>

      <p className="text-center text-xs text-text-grey">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchTab} className="text-primary-green font-bold hover:text-dark-green">
          Sign in →
        </button>
      </p>
    </form>
  );
}

/* ─────────────────────────────────────────
   Field helper
───────────────────────────────────────── */
function Field({ label, icon: Icon, error, children }: {
  label: string; icon: React.ElementType; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold text-dark-navy uppercase tracking-wide px-0.5 flex items-center gap-1">
        <Icon className="w-2.5 h-2.5 text-primary-green" /> {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        {children}
      </div>
      {error && <p className="text-[10px] text-red-500 font-semibold px-0.5">{error}</p>}
    </div>
  );
}
