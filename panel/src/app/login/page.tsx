'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { panelApi } from '@/lib/api';
import { saveSession } from '@/lib/session';
import {
  Heart, Lock, Mail, Eye, EyeOff, ShieldCheck,
  ChevronDown, LogIn, AlertCircle, CheckCircle2,
  Users, Stethoscope, Building2, Crown, ExternalLink
} from 'lucide-react';

type Role = 'super_admin' | 'consultant' | 'doctor' | 'hospital';

const ROLES: { value: Role; label: string; icon: React.ElementType; color: string; email: string; desc: string }[] = [
  { value: 'super_admin', label: 'Super Admin',  icon: Crown,       color: 'text-amber-400',   email: 'admin@indiacare.com',      desc: 'Full platform control & analytics' },
  { value: 'consultant',  label: 'Consultant',   icon: Users,       color: 'text-violet-400',  email: 'consultant@indiacare.com', desc: 'Patient management & referrals' },
  { value: 'doctor',      label: 'Doctor',       icon: Stethoscope, color: 'text-sky-400',     email: 'ramesh.kumar@indiacare.com', desc: 'Appointments & patient care' },
  { value: 'hospital',    label: 'Hospital',     icon: Building2,   color: 'text-emerald-400', email: 'contact@apollo-delhi.com', desc: 'Department & doctor management' },
];

export default function PanelLoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('super_admin');
  const [email, setEmail] = useState('admin@indiacare.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const selectedRole = ROLES.find(r => r.value === role)!;

  const handleRoleSelect = (r: typeof ROLES[0]) => {
    setRole(r.value);
    setEmail(r.email);
    setRoleOpen(false);
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter your email and password.'); return; }

    setLoading(true);
    try {
      const login = await panelApi<{ success: boolean; token: string; user: { id: string; name: string; email: string; role: Role } }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      const me = await panelApi<{ success: boolean; user: { id: string; name: string; email: string; role: Role; profile?: { entityId: string; isSubscribed: boolean; isApproved: boolean } | null } }>('/api/auth/me', {
        headers: { Authorization: `Bearer ${login.token}` },
      });
      saveSession(login.token, me.user);
      setSuccess(true);
      setTimeout(() => {
        if (me.user.role === 'super_admin') router.push('/dashboard/super-admin');
        else if (me.user.role === 'consultant') router.push('/dashboard/consultant');
        else if (me.user.role === 'doctor') router.push('/dashboard/doctor');
        else if (me.user.role === 'hospital') router.push('/dashboard/hospital');
      }, 800);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #060C14 0%, #0E1623 50%, #0A1620 100%)' }}>

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col justify-between p-12 xl:p-16 overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #071510 0%, #0A2218 50%, #0F2E24 100%)' }}>
        <div className="dot-grid absolute inset-0 pointer-events-none" />
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-brand/5 blur-3xl pointer-events-none" style={{ backgroundColor: 'rgba(18,122,106,0.08)' }} />
        <div className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-3xl pointer-events-none" style={{ backgroundColor: 'rgba(18,122,106,0.05)' }} />

        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #127A6A, #075E52)' }}>
            <Heart className="w-5.5 h-5.5 text-white fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-wider block leading-tight">INDIA CARE</span>
            <span className="text-[10px] font-bold tracking-[0.2em] block" style={{ color: '#25B89A' }}>CONSULTANCY</span>
          </div>
        </motion.div>

        {/* Hero text */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative z-10 my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border mb-6 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: 'rgba(18,122,106,0.1)', borderColor: 'rgba(18,122,106,0.25)', color: '#25B89A' }}>
            <ShieldCheck className="w-3.5 h-3.5" /> Secure Panel Access
          </div>
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            INDIA CARE CONSULTANCY<br />
            <span style={{ color: '#25B89A' }}>Panel Access</span>
          </h1>
          <p className="text-sm leading-relaxed mb-8 max-w-sm" style={{ color: '#64748B' }}>
            Secure access for Super Admin, Consultants, Doctors, and Hospital partners to manage the platform.
          </p>

          {/* Role cards */}
          <div className="grid grid-cols-2 gap-3">
            {ROLES.map((r, i) => {
              const Icon = r.icon;
              return (
                <motion.div key={r.value} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 + i * 0.08 }}
                  className={`glass-dark rounded-2xl p-4 flex items-start gap-3 border transition-all duration-200 cursor-pointer ${role === r.value ? 'border-brand/30' : ''}`}
                  style={{ borderColor: role === r.value ? 'rgba(18,122,106,0.4)' : undefined,
                           background: role === r.value ? 'rgba(18,122,106,0.1)' : undefined }}
                  onClick={() => handleRoleSelect(r)}>
                  <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${r.color}`} />
                  <div>
                    <p className="text-white font-bold text-xs">{r.label}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#64748B' }}>{r.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
          className="relative z-10 p-4 rounded-2xl border text-[11px] leading-relaxed"
          style={{ background: 'rgba(239,68,68,0.06)', borderColor: 'rgba(239,68,68,0.15)', color: '#94A3B8' }}>
          <span className="text-red-400 font-bold block mb-1">⚠ Restricted Access</span>
          This panel is exclusively for authorised ICC staff. Patient login is available at the{' '}
          <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/login`} target="_blank" rel="noopener noreferrer"
            className="font-bold underline underline-offset-2" style={{ color: '#25B89A' }}>
            Website ↗
          </a>
        </motion.div>
      </div>

      {/* ── RIGHT FORM ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-5 sm:px-8 py-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(18,122,106,0.08) 0%, transparent 70%)' }} />

        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #127A6A, #075E52)' }}>
            <Heart className="w-4.5 h-4.5 text-white fill-white" />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-wider block">INDIA CARE</span>
            <span className="text-[9px] font-bold tracking-widest block" style={{ color: '#25B89A' }}>PANEL ACCESS</span>
          </div>
        </div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="w-full max-w-[400px] relative z-10">

          <div className="mb-7">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Panel Login</h2>
            <p className="text-xs mt-1.5" style={{ color: '#64748B' }}>Select your role and enter credentials to access the dashboard.</p>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-start gap-2 rounded-2xl px-4 py-3 mb-5 text-xs font-medium border"
                style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {success && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-5 text-xs font-bold border"
                style={{ background: 'rgba(34,197,94,0.1)', borderColor: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                Login successful! Redirecting to {selectedRole.label} dashboard…
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">

            {/* Role selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Role</label>
              <div className="relative">
                <button type="button" onClick={() => setRoleOpen(o => !o)}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-bold text-white transition-all"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: roleOpen ? 'rgba(18,122,106,0.5)' : 'rgba(255,255,255,0.08)' }}>
                  <span className="flex items-center gap-2">
                    <selectedRole.icon className={`w-4 h-4 ${selectedRole.color}`} />
                    {selectedRole.label}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${roleOpen ? 'rotate-180' : ''}`} style={{ color: '#64748B' }} />
                </button>
                <AnimatePresence>
                  {roleOpen && (
                    <motion.div initial={{ opacity: 0, y: -6, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6 }}
                      className="absolute top-full left-0 right-0 mt-2 z-20 rounded-2xl border shadow-xl overflow-hidden"
                      style={{ background: '#141E2E', borderColor: 'rgba(255,255,255,0.08)' }}>
                      {ROLES.map(r => {
                        const Icon = r.icon;
                        return (
                          <button type="button" key={r.value} onClick={() => handleRoleSelect(r)}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all hover:text-white"
                            style={{ background: role === r.value ? 'rgba(18,122,106,0.15)' : 'transparent', color: role === r.value ? '#fff' : '#94A3B8' }}>
                            <Icon className={`w-4 h-4 flex-shrink-0 ${r.color}`} />
                            <div>
                              <p className="text-xs font-bold">{r.label}</p>
                              <p className="text-[10px]" style={{ color: '#64748B' }}>{r.desc}</p>
                            </div>
                            {role === r.value && <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-emerald-400" />}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4B5563' }} />
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="role@indiacare.com"
                  className="w-full pl-10 pr-4 py-3 rounded-2xl text-sm text-white placeholder-[#4B5563] border transition-all focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(18,122,106,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wide px-1" style={{ color: '#25B89A' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#4B5563' }} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError(''); }}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl text-sm text-white placeholder-[#4B5563] border transition-all focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(18,122,106,0.5)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                <button type="button" onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:text-white transition-colors" style={{ color: '#4B5563' }}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button type="submit" disabled={loading || success} whileTap={{ scale: 0.98 }}
              className="w-full btn-brand text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 mt-1 disabled:opacity-50 transition-all shadow-lg">
              {loading
                ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Authenticating…</>
                : <><LogIn className="w-4 h-4" /> Login to Panel</>
              }
            </motion.button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 rounded-2xl border" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.06)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#4B5563' }}>Demo Credentials</p>
            <p className="text-[11px] leading-relaxed" style={{ color: '#64748B' }}>
              Use password: <span className="font-mono font-bold text-white">password123</span> with any of the pre-filled emails above.
            </p>
          </div>

          {/* Patient link */}
          <div className="mt-5 flex items-center justify-center gap-2 text-[11px]" style={{ color: '#4B5563' }}>
            <span>Patient? Login at</span>
            <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/login`} target="_blank" rel="noopener noreferrer"
              className="font-bold flex items-center gap-1 transition-colors" style={{ color: '#25B89A' }}>
              Website <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
