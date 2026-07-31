'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles, Eye, TrendingUp, Globe, Loader2, Zap, X, BadgeCheck, ArrowRight,
  Copy, Check, Upload, Image as ImageIcon, AlertCircle, CheckCircle2, TimerReset,
} from 'lucide-react';
import { useDoctorIdentity } from '@/lib/panelIdentity';
import { panelApi } from '@/lib/api';

const DEFAULT_SPOTLIGHT_FEE = 999;
const OFFICIAL_UPI_ID = '9024155604@ibl';

type Step = 'info' | 'payment' | 'success';
type PromoState = {
  daysLeft: number;
  tagline: string;
  startsAt: number;
  endsAt: number;
  paymentStatus?: string;
};

function HeroPreview({
  tagline,
  active,
  doctor,
  initial,
}: {
  tagline: string;
  active?: boolean;
  doctor: {
    name: string;
    speciality: string;
    experience: number;
    city: string;
  };
  initial: string;
}) {
  return (
    <div
      className="relative rounded-2xl overflow-hidden p-5"
      style={{ background: 'linear-gradient(135deg, rgba(18,122,106,0.25) 0%, rgba(7,94,82,0.3) 100%)', border: '1px solid rgba(37,184,154,0.25)' }}
    >
      {active && (
        <div
          className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}
        >
          <Sparkles className="w-3 h-3" /> LIVE ON HOMEPAGE
        </div>
      )}
      <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: '#25B89A' }}>Website Hero Preview</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
          {initial}
        </div>
        <div>
          <p className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>{doctor.name}</p>
          <p className="text-[11px]" style={{ color: '#25B89A' }}>{doctor.speciality} · {doctor.experience} yrs exp · {doctor.city}</p>
          <p className="text-[11px] italic mt-0.5" style={{ color: '#94A3B8' }}>&ldquo;{tagline}&rdquo;</p>
        </div>
      </div>
    </div>
  );
}

export default function DoctorPromotePage() {
  const { displayName, initial, profile } = useDoctorIdentity();
  const doctor = {
    id: profile?.id || 'me',
    name: displayName || 'Doctor',
    speciality: profile?.speciality || 'Specialist',
    experience: profile?.experience || 10,
    city: profile?.location || 'New Delhi',
  };

  const [step, setStep] = useState<Step>('info');
  const [tagline, setTagline] = useState('Top-rated specialist offering expert clinical care & priority consultations.');
  const [utrNumber, setUtrNumber] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [spotlightFee, setSpotlightFee] = useState(DEFAULT_SPOTLIGHT_FEE);
  const [loadingPromo, setLoadingPromo] = useState(true);
  const [activePromo, setActivePromo] = useState<PromoState | null>(null);

  const screenshotInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;

    async function loadCurrentSpotlight() {
      try {
        const response = await panelApi<{
          fee?: { amount: number; durationDays: number };
          spotlight: null | { tagline: string; startsAt: string; endsAt: string; isActive: boolean; paymentStatus?: string };
        }>('/api/promote/current');

        if (!mounted) return;

        if (response.fee?.amount) {
          setSpotlightFee(Number(response.fee.amount));
        }

        if (response.spotlight?.isActive) {
          const startsAt = new Date(response.spotlight.startsAt).getTime();
          const endsAt = new Date(response.spotlight.endsAt).getTime();
          setActivePromo({
            tagline: response.spotlight.tagline,
            startsAt,
            endsAt,
            paymentStatus: response.spotlight.paymentStatus || 'Paid',
            daysLeft: Math.max(0, Math.ceil((endsAt - Date.now()) / (1000 * 60 * 60 * 24))),
          });
          setTagline(response.spotlight.tagline);
        } else {
          setActivePromo(null);
        }
      } catch {
        if (mounted) setActivePromo(null);
      } finally {
        if (mounted) setLoadingPromo(false);
      }
    }

    loadCurrentSpotlight();
    return () => {
      mounted = false;
    };
  }, []);

  const copyUpiId = () => {
    navigator.clipboard.writeText(OFFICIAL_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  const handleScreenshotChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Receipt screenshot size should be less than 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const base64 = loadEvent.target?.result as string;
      if (base64) setScreenshotUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  const handlePay = async () => {
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMsg('Please enter a valid 12-digit UTR / UPI Reference Number from your payment app.');
      return;
    }

    setProcessing(true);
    setErrorMsg('');

    try {
      await panelApi('/api/subscriptions/request-activation', {
        method: 'POST',
        body: JSON.stringify({
          entityType: 'doctor',
          entityId: doctor.id,
          amount: spotlightFee,
          utrNumber: utrNumber.trim(),
          screenshotUrl,
        }),
      });
      setStep('success');
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : 'Failed to submit payment request.');
    } finally {
      setProcessing(false);
    }
  };

  const cancelPromo = () => {
    panelApi('/api/promote', {
      method: 'POST',
      body: JSON.stringify({ action: 'cancel' }),
    }).finally(() => setActivePromo(null));
  };

  if (loadingPromo) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (activePromo) {
    const pct = Math.round((activePromo.daysLeft / 30) * 100);

    return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0 page-header" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Homepage Spotlight</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Your doctor profile is confirmed and visible in Top Tier Health Care Experts</p>
          </div>
          <span
            className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}
          >
            <Sparkles className="w-3.5 h-3.5" /> Active Spotlight
          </span>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="max-w-2xl mx-auto space-y-5">
            <HeroPreview tagline={activePromo.tagline} active doctor={doctor} initial={initial} />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Homepage Status', value: 'Live on Homepage', icon: Globe },
                { label: 'Payment Status', value: activePromo.paymentStatus || 'Paid', icon: BadgeCheck },
                { label: 'Days Remaining', value: `${activePromo.daysLeft} days`, icon: TimerReset },
              ].map((item, index) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} className="panel-card p-4">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/12 flex items-center justify-center mb-2">
                    <item.icon className="w-4 h-4 text-emerald-400" />
                  </div>
                  <p className="text-[10px]" style={{ color: '#64748B' }}>{item.label}</p>
                  <p className="text-sm font-extrabold mt-1" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="panel-card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Spotlight Duration</p>
                <span className="text-xs font-extrabold text-amber-400">{activePromo.daysLeft} days remaining</span>
              </div>
              <div className="w-full h-2 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#10B981,#059669)' }} />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: '#64748B' }}>
                30-day spotlight · Ends on {new Date(activePromo.endsAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Profile Views', value: '1,964', icon: Eye, color: 'text-emerald-400 bg-emerald-500/12' },
                { label: 'Patient Leads', value: '57', icon: TrendingUp, color: 'text-sky-400 bg-sky-500/12' },
                { label: 'Daily Reach', value: '~430', icon: Zap, color: 'text-amber-400 bg-amber-500/12' },
              ].map((item, index) => (
                <motion.div key={item.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }} className="panel-card p-4 text-center">
                  <div className={`w-9 h-9 rounded-xl mx-auto flex items-center justify-center mb-2 ${item.color.split(' ')[1]}`}>
                    <item.icon className={`w-4 h-4 ${item.color.split(' ')[0]}`} />
                  </div>
                  <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#64748B' }}>{item.label}</p>
                </motion.div>
              ))}
            </div>

            <button onClick={cancelPromo} className="text-xs font-bold text-center w-full py-2" style={{ color: '#475569' }}>
              Remove from spotlight
            </button>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'info') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0 page-header" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Homepage Spotlight &amp; Subscription</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Promote your profile &amp; activate monthly subscription on India Care Consultancy</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="panel-card p-6 space-y-4 border-2 border-emerald-500/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-black text-base text-white">Monthly Doctor Subscription &amp; Spotlight</h2>
                  <p className="text-xs text-slate-400">Get verified, receive direct patient bookings, and feature on homepage</p>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">Custom Tagline / Clinical Highlights</label>
                <input
                  value={tagline}
                  onChange={(event) => setTagline(event.target.value)}
                  maxLength={80}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-medium"
                />
                <p className="text-[10px] text-right text-slate-500 mt-1">{tagline.length}/80</p>
              </div>

              <HeroPreview tagline={tagline} doctor={doctor} initial={initial} />

              <button
                onClick={() => setStep('payment')}
                className="w-full py-3.5 rounded-2xl text-xs font-black flex items-center justify-center gap-2 text-slate-950 transition-all shadow-lg shadow-emerald-500/20"
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
              >
                <Sparkles className="w-4 h-4" /> Pay ₹{spotlightFee} via QR / UPI <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (step === 'payment') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0 page-header" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('info')} className="w-8 h-8 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-extrabold text-lg text-white">Scan QR &amp; Pay via UPI</h1>
              <p className="text-[11px] text-slate-400">Monthly Subscription · 30 Days · ₹{spotlightFee}</p>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="max-w-md mx-auto space-y-5">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold bg-red-500/15 border border-red-500/30 text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
              </div>
            )}

            <div className="panel-card p-6 text-center space-y-4 border-2 border-emerald-500/30">
              <div className="inline-block p-3 bg-white rounded-2xl shadow-xl border border-white/20">
                <img src="/payment-qr.png" alt="India Care UPI Payment QR Code" className="w-52 h-52 object-contain mx-auto" />
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Official UPI ID</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono text-sm font-black text-emerald-400">{OFFICIAL_UPI_ID}</span>
                  <button
                    type="button"
                    onClick={copyUpiId}
                    className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1"
                  >
                    {copiedUpi ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedUpi ? 'Copied' : 'Copy UPI'}
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">Scan using PhonePe, Google Pay, Paytm, BHIM, or any UPI app</p>
              </div>
            </div>

            <div className="panel-card p-6 space-y-4">
              <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                <BadgeCheck className="w-4 h-4" /> Enter Payment UTR Details
              </h3>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">12-Digit UTR / UPI Ref Number *</label>
                <input
                  type="text"
                  value={utrNumber}
                  onChange={(event) => setUtrNumber(event.target.value)}
                  placeholder="e.g. 420198765432"
                  maxLength={20}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-mono font-bold"
                />
                <p className="text-[10px] text-slate-500 mt-1">Found on your UPI payment confirmation receipt screen</p>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Payment Receipt Screenshot (Optional)</label>
                <input
                  type="file"
                  ref={screenshotInputRef}
                  onChange={handleScreenshotChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => screenshotInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-white/10 text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5 text-emerald-400" />
                    {screenshotUrl ? 'Change Receipt' : 'Upload Receipt'}
                  </button>
                  {screenshotUrl && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5" /> Attached
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handlePay}
                disabled={processing}
                className="w-full py-3.5 rounded-2xl text-xs font-black text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
              >
                {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {processing ? 'Submitting Payment...' : 'Submit Payment for Verification'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full panel-card p-8 text-center space-y-4 border-2 border-emerald-500/30">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500/40 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-white">Payment Submitted for Approval</h2>
        <p className="text-xs text-slate-300 leading-relaxed font-medium">
          Your UTR number <span className="font-mono font-bold text-emerald-400">{utrNumber}</span> has been submitted to Super Admin for verification.
        </p>
        <p className="text-[11px] text-slate-400 bg-slate-900 p-3 rounded-2xl border border-white/10">
          Once verified and live on the homepage, this page will automatically show confirmed status and the exact remaining days.
        </p>
        <button
          onClick={() => setStep('info')}
          className="w-full py-3 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950"
        >
          Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
}
