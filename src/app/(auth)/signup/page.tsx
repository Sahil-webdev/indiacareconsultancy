'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, UserPlus, Lock, Mail, Eye, EyeOff, Phone, User,
  MapPin, ChevronDown, AlertCircle, CheckCircle2, ShieldCheck,
  BadgeCheck, ArrowRight, ExternalLink, Stethoscope
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { mockDB } from '@/lib/mockData';

interface PatientForm {
  name: string; mobile: string; email: string;
  password: string; confirmPassword: string;
  city: string; gender: string;
  agreeTerms: boolean; agreePrivacy: boolean; agreeDisclaimer: boolean;
}

const CITIES = ['Delhi', 'Mumbai', 'Bengaluru', 'Hyderabad', 'Chennai', 'Kolkata', 'Gurugram', 'Pune', 'Ahmedabad', 'Jaipur', 'Other'];

function InputField({ label, icon: Icon, error, children }: {
  label: string; icon: React.ElementType; error?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-dark-navy uppercase tracking-wide px-1 flex items-center gap-1">
        <Icon className="w-3 h-3 text-primary-green" /> {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-[10px] text-red-500 font-semibold px-1">{error}</motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [form, setForm] = useState<PatientForm>({
    name: '', mobile: '', email: '', password: '', confirmPassword: '',
    city: '', gender: '', agreeTerms: false, agreePrivacy: false, agreeDisclaimer: false,
  });
  const [showPwd, setShowPwd] = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof PatientForm | 'form', string>>>({});

  const set = (k: keyof PatientForm, v: string | boolean) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '', form: '' }));
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.mobile.trim()) e.mobile = 'Mobile number is required.';
    if (!form.email.trim()) e.email = 'Email address is required.';
    if (!form.password) e.password = 'Password is required.';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    if (!form.city) e.city = 'Please select your city.';
    if (!form.agreeTerms) e.agreeTerms = 'You must agree to the Terms & Conditions.';
    if (!form.agreePrivacy) e.agreePrivacy = 'You must agree to the Privacy Policy.';
    if (!form.agreeDisclaimer) e.agreeDisclaimer = 'You must acknowledge the healthcare disclaimer.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      mockDB.registerUser({ name: form.name, email: form.email, phone: form.mobile, role: 'patient' });
      setSuccess(true);
      toast('success', 'Account Created!', 'Welcome to India Care Consultancy. Redirecting…');
      setTimeout(() => router.push('/'), 1500);
    }, 1400);
  };

  const inputClass = (field: keyof PatientForm) =>
    `w-full bg-slate-50 border ${errors[field] ? 'border-red-300 focus:border-red-400' : 'border-slate-200 focus:border-primary-green'} rounded-2xl text-sm text-dark-navy placeholder-slate-400 focus:outline-none focus:ring-2 ${errors[field] ? 'focus:ring-red-100' : 'focus:ring-primary-green/10'} transition-all`;

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT BRANDING PANEL ── */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col justify-between p-10 xl:p-14"
        style={{ background: 'linear-gradient(145deg, #0A5C4E 0%, #127A6A 45%, #1A9A83 100%)' }}>
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center shadow-lg">
            <Heart className="w-5.5 h-5.5 text-white fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-wider block leading-tight">INDIA CARE</span>
            <span className="text-[10px] font-bold text-white/70 tracking-[0.2em] block">CONSULTANCY</span>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="relative z-10 my-auto">
          <h2 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Start Your Health Journey Today
          </h2>
          <p className="text-white/75 text-sm leading-relaxed mb-8 max-w-xs">
            Create your patient account and get personalised doctor and hospital recommendations matched to your specific needs.
          </p>
          <div className="flex flex-col gap-3">
            {[
              { icon: BadgeCheck, text: 'Verified doctors matched to your requirements' },
              { icon: ShieldCheck, text: 'NABH-accredited hospital recommendations' },
              { icon: Stethoscope, text: 'Free healthcare guidance from consultants' },
              { icon: MapPin, text: 'Location-based care options near you' },
            ].map((item, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl px-4 py-3">
                <item.icon className="w-4 h-4 text-white flex-shrink-0" />
                <p className="text-white/85 text-xs font-medium">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="relative z-10 flex items-start gap-2 bg-white/10 border border-white/15 rounded-2xl px-4 py-3">
          <ShieldCheck className="w-4 h-4 text-white/80 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-white/70 leading-relaxed">
            This signup is for patients only. Doctors & hospitals should use the{' '}
            <a href={`${process.env.NEXT_PUBLIC_PANEL_URL}/login`} target="_blank" rel="noopener noreferrer"
              className="text-white font-bold underline underline-offset-2">Panel App ↗</a>
          </p>
        </motion.div>
      </div>

      {/* ── RIGHT FORM PANEL ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-10 bg-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-primary-green/4 blur-3xl pointer-events-none" />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md">
            <Heart className="w-4.5 h-4.5 text-white fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-dark-navy tracking-wider block leading-tight">INDIA CARE</span>
            <span className="text-[9px] font-bold text-primary-green tracking-widest block">CONSULTANCY</span>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}
          className="w-full max-w-[460px] relative z-10">

          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-dark-navy tracking-tight">Create Patient Account</h1>
            <p className="text-xs text-text-grey mt-1.5">Join India Care Consultancy and discover the right healthcare for you.</p>
          </div>

          {/* Success state */}
          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-4 py-3 mb-5 text-xs font-bold">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Account created! Redirecting to your dashboard…
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Name */}
            <InputField label="Full Name" icon={User} error={errors.name}>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Your full name" className={`${inputClass('name')} pl-4 pr-4 py-3`} />
            </InputField>

            {/* Mobile + Email row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Mobile Number" icon={Phone} error={errors.mobile}>
                <input type="tel" value={form.mobile} onChange={e => set('mobile', e.target.value)}
                  placeholder="+91 XXXXX XXXXX" className={`${inputClass('mobile')} pl-4 pr-4 py-3`} />
              </InputField>
              <InputField label="Email Address" icon={Mail} error={errors.email}>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="you@example.com" className={`${inputClass('email')} pl-4 pr-4 py-3`} />
              </InputField>
            </div>

            {/* Password row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="Password" icon={Lock} error={errors.password}>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)}
                    placeholder="Min. 8 characters" className={`${inputClass('password')} pl-4 pr-10 py-3`} />
                  <button type="button" onClick={() => setShowPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </InputField>
              <InputField label="Confirm Password" icon={Lock} error={errors.confirmPassword}>
                <div className="relative">
                  <input type={showCPwd ? 'text' : 'password'} value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Re-enter password" className={`${inputClass('confirmPassword')} pl-4 pr-10 py-3`} />
                  <button type="button" onClick={() => setShowCPwd(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showCPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </InputField>
            </div>

            {/* City + Gender row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField label="City" icon={MapPin} error={errors.city}>
                <div className="relative">
                  <select value={form.city} onChange={e => set('city', e.target.value)}
                    className={`${inputClass('city')} pl-4 pr-8 py-3 appearance-none`}>
                    <option value="">Select city</option>
                    {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </InputField>
              <InputField label="Gender (Optional)" icon={User}>
                <div className="relative">
                  <select value={form.gender} onChange={e => set('gender', e.target.value)}
                    className={`${inputClass('gender')} pl-4 pr-8 py-3 appearance-none`}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </InputField>
            </div>

            {/* Consent checkboxes */}
            <div className="flex flex-col gap-3 pt-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Consent & Agreements</p>
              {[
                { key: 'agreeTerms' as const, text: <>I agree to the <Link href="/terms" className="text-primary-green font-bold hover:underline">Terms & Conditions</Link></> },
                { key: 'agreePrivacy' as const, text: <>I agree to the <Link href="/privacy" className="text-primary-green font-bold hover:underline">Privacy Policy</Link></> },
                { key: 'agreeDisclaimer' as const, text: <>I understand that <strong>INDIA CARE CONSULTANCY</strong> provides healthcare guidance only and does not provide medical treatment</> },
              ].map(item => (
                <div key={item.key}>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="flex-shrink-0 mt-0.5">
                      <input type="checkbox" checked={form[item.key] as boolean} onChange={e => set(item.key, e.target.checked)} className="sr-only" />
                      <div onClick={() => set(item.key, !(form[item.key] as boolean))}
                        className={`w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center transition-all cursor-pointer ${form[item.key] ? 'bg-primary-green border-primary-green' : 'border-slate-300 hover:border-primary-green/50'}`}>
                        {form[item.key] && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                    <span className="text-[11px] text-text-grey leading-relaxed">{item.text}</span>
                  </label>
                  {errors[item.key] && (
                    <p className="text-[10px] text-red-500 font-semibold pl-7 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors[item.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={loading || success} whileTap={{ scale: 0.98 }}
              className="w-full gradient-primary text-white font-bold py-3.5 rounded-2xl shadow-lg glow-green flex items-center justify-center gap-2 mt-1 disabled:opacity-60 transition-all">
              {loading ? (
                <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating Account…</>
              ) : (
                <><UserPlus className="w-4 h-4" /> Create Patient Account</>
              )}
            </motion.button>
          </form>

          {/* Sign in link */}
          <div className="mt-5 flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] text-slate-400 font-bold">Already have an account?</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
          <Link href="/login"
            className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-primary-green/20 text-primary-green font-bold text-sm py-3 rounded-2xl bg-soft-green hover:bg-light-mint transition-colors">
            Login to Dashboard <ArrowRight className="w-4 h-4" />
          </Link>

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
