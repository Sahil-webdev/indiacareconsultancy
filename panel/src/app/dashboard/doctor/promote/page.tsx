'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Star, Eye, TrendingUp, CreditCard, Smartphone,
  Globe, CheckCircle2, Clock, Shield, Loader2, Zap,
  CalendarDays, X, BadgeCheck, ArrowRight, IndianRupee,
} from 'lucide-react';

const SPOTLIGHT_FEE = 999; // ₹/30 days — managed by super admin
const MOCK_DOCTOR = {
  name: 'Dr. Ramesh Kumar',
  speciality: 'Senior Cardiologist',
  experience: 18,
  city: 'New Delhi',
  fee: 1500,
  rating: 4.9,
  reviews: 127,
};

type PayMethod = 'upi' | 'card' | 'netbanking';
type Step = 'info' | 'payment' | 'success';

function HeroPreview({ tagline, active }: { tagline: string; active?: boolean }) {
  return (
    <div className="relative rounded-2xl overflow-hidden p-5"
      style={{ background: 'linear-gradient(135deg, rgba(18,122,106,0.25) 0%, rgba(7,94,82,0.3) 100%)', border: '1px solid rgba(37,184,154,0.25)' }}>
      {active && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
          <Sparkles className="w-3 h-3" /> LIVE ON HOMEPAGE
        </div>
      )}
      <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: '#25B89A' }}>Website Hero Preview</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0">
          R
        </div>
        <div>
          <p className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>{MOCK_DOCTOR.name}</p>
          <p className="text-[11px]" style={{ color: '#25B89A' }}>{MOCK_DOCTOR.speciality} · {MOCK_DOCTOR.experience} yrs exp · {MOCK_DOCTOR.city}</p>
          <p className="text-[11px] italic mt-0.5" style={{ color: '#94A3B8' }}>"{tagline}"</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
          <Star className="w-3 h-3 fill-amber-400" /> {MOCK_DOCTOR.rating} ({MOCK_DOCTOR.reviews} reviews)
        </span>
        <span className="text-[10px]" style={{ color: '#64748B' }}>₹{MOCK_DOCTOR.fee.toLocaleString('en-IN')} consultation fee</span>
        <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
      </div>
    </div>
  );
}

export default function DoctorPromotePage() {
  const [step, setStep] = useState<Step>('info');
  const [tagline, setTagline] = useState('Leading Senior Cardiologist · 18+ Years Expert · AIIMS Alumnus');
  const [payMethod, setPayMethod] = useState<PayMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [bank, setBank] = useState('SBI');
  const [processing, setProcessing] = useState(false);
  const [activePromo, setActivePromo] = useState<{ daysLeft: number; tagline: string } | null>(null);

  // Check if currently promoted (localStorage for demo)
  useEffect(() => {
    const promo = localStorage.getItem('icc_doctor_promoted');
    if (promo) {
      const data = JSON.parse(promo);
      const daysLeft = Math.max(0, 30 - Math.floor((Date.now() - data.paidAt) / (1000 * 60 * 60 * 24)));
      if (daysLeft > 0) setActivePromo({ daysLeft, tagline: data.tagline });
      else { localStorage.removeItem('icc_doctor_promoted'); }
    }
  }, []);

  const handlePay = async () => {
    if (payMethod === 'upi' && !upiId.trim()) return;
    if (payMethod === 'card' && (!card.number || !card.expiry || !card.cvv)) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2500));
    // Save to localStorage (in production: POST to API → super admin spotlight page updates)
    localStorage.setItem('icc_doctor_promoted', JSON.stringify({ paidAt: Date.now(), tagline }));
    setProcessing(false);
    setStep('success');
    setActivePromo({ daysLeft: 30, tagline });
  };

  const cancelPromo = () => {
    localStorage.removeItem('icc_doctor_promoted');
    setActivePromo(null);
  };

  // ── ACTIVE PROMO VIEW ────────────────────────────────────────────────────────
  if (activePromo) {
    const pct = Math.round((activePromo.daysLeft / 30) * 100);
    return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Homepage Spotlight</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Your profile is currently featured on the ICC website homepage</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Sparkles className="w-3.5 h-3.5" /> Active Spotlight
          </span>
        </header>
        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="max-w-2xl mx-auto space-y-5">

            {/* Live preview */}
            <HeroPreview tagline={activePromo.tagline} active />

            {/* Days remaining card */}
            <div className="panel-card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Spotlight Duration</p>
                <span className="text-xs font-extrabold" style={{ color: '#f59e0b' }}>{activePromo.daysLeft} days remaining</span>
              </div>
              <div className="w-full h-2 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #25B89A, #127A6A)' }} />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: '#64748B' }}>30-day spotlight · Expires in {activePromo.daysLeft} days</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Profile Views', value: '1,243', icon: Eye, color: 'text-sky-400 bg-sky-500/12' },
                { label: 'Lead Inquiries', value: '37', icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/12' },
                { label: 'Avg. Daily Reach', value: '~280', icon: Zap, color: 'text-amber-400 bg-amber-500/12' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  className="panel-card p-4 text-center">
                  <div className={`w-9 h-9 rounded-xl mx-auto flex items-center justify-center mb-2 ${s.color.split(' ')[1]}`}>
                    <s.icon className={`w-4 h-4 ${s.color.split(' ')[0]}`} />
                  </div>
                  <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#64748B' }}>{s.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Cancel */}
            <button onClick={cancelPromo} className="text-xs font-bold text-center w-full py-2" style={{ color: '#475569' }}>
              Remove from spotlight
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── STEP: INFO ───────────────────────────────────────────────────────────────
  if (step === 'info') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Homepage Spotlight</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Feature your profile on the ICC website homepage hero section</p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="max-w-2xl mx-auto space-y-5">

            {/* Hero illustration */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-6 text-center" style={{ background: 'linear-gradient(135deg, rgba(18,122,106,0.2), rgba(7,94,82,0.25))', border: '1px solid rgba(37,184,154,0.2)' }}>
              <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(37,184,154,0.15)', border: '1px solid rgba(37,184,154,0.3)' }}>
                <Sparkles className="w-8 h-8" style={{ color: '#25B89A' }} />
              </div>
              <h2 className="text-xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>
                Get Featured on the Homepage
              </h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: '#94A3B8' }}>
                Appear at the top of the ICC website's hero section — the first thing thousands of patients see. Drive more profile views, leads, and consultations.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>₹{SPOTLIGHT_FEE}</span>
                <div className="text-left">
                  <p className="text-xs font-semibold" style={{ color: '#64748B' }}>for 30 days</p>
                  <p className="text-[10px]" style={{ color: '#475569' }}>₹{Math.round(SPOTLIGHT_FEE/30)}/day</p>
                </div>
              </div>
            </motion.div>

            {/* What they get */}
            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#25B89A' }}>What You Get</p>
              <ul className="space-y-2.5">
                {[
                  { icon: Eye, text: 'Your profile in the homepage hero section — maximum visibility' },
                  { icon: TrendingUp, text: 'Reach 1000+ daily website visitors for 30 days' },
                  { icon: Star, text: 'Gold "Featured" badge on your public profile' },
                  { icon: CalendarDays, text: '30-day spotlight with daily performance stats' },
                  { icon: BadgeCheck, text: 'Priority listing above non-featured doctors in search' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs" style={{ color: '#94A3B8' }}>
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/12 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tagline editor */}
            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#25B89A' }}>Your Tagline</p>
              <p className="text-xs mb-3" style={{ color: '#64748B' }}>This will appear below your name in the hero section. Keep it concise and compelling.</p>
              <input value={tagline} onChange={e => setTagline(e.target.value)} maxLength={80}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40 mb-2"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              <p className="text-[10px] text-right" style={{ color: '#475569' }}>{tagline.length}/80</p>
            </div>

            {/* Preview */}
            <HeroPreview tagline={tagline} />

            {/* CTA */}
            <button onClick={() => setStep('payment')}
              className="w-full py-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 text-white"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 8px 24px rgba(245,158,11,0.3)' }}>
              <Sparkles className="w-4 h-4" /> Get Featured for ₹{SPOTLIGHT_FEE} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── STEP: PAYMENT ────────────────────────────────────────────────────────────
  if (step === 'payment') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('info')} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center" style={{ color: '#64748B' }}>
              <X className="w-4 h-4" />
            </button>
            <div>
              <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Complete Payment</h1>
              <p className="text-[11px]" style={{ color: '#64748B' }}>Homepage Spotlight · 30 days · ₹{SPOTLIGHT_FEE}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="max-w-md mx-auto space-y-5">

            {/* Order summary */}
            <div className="panel-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Homepage Spotlight</p>
                  <p className="text-[10px]" style={{ color: '#64748B' }}>30 days · Starts immediately</p>
                </div>
              </div>
              <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>₹{SPOTLIGHT_FEE}</p>
            </div>

            {/* Payment Method Tabs */}
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'upi', label: 'UPI', icon: Smartphone },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'netbanking', label: 'Net Banking', icon: Globe },
              ] as { id: PayMethod; label: string; icon: React.ElementType }[]).map(m => {
                const Icon = m.icon;
                const active = payMethod === m.id;
                return (
                  <button key={m.id} onClick={() => setPayMethod(m.id)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-[11px] font-bold border transition-all"
                    style={{
                      background: active ? 'rgba(37,184,154,0.15)' : 'rgba(255,255,255,0.04)',
                      borderColor: active ? 'rgba(37,184,154,0.4)' : 'rgba(255,255,255,0.08)',
                      color: active ? '#25B89A' : '#64748B',
                    }}>
                    <Icon className="w-5 h-5" /> {m.label}
                  </button>
                );
              })}
            </div>

            {/* UPI */}
            <AnimatePresence mode="wait">
              {payMethod === 'upi' && (
                <motion.div key="upi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>UPI ID</label>
                    <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@okaxis"
                      className="w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                  </div>
                  <p className="text-[10px]" style={{ color: '#475569' }}>Supported: GPay, PhonePe, Paytm, BHIM, Amazon Pay</p>
                </motion.div>
              )}

              {payMethod === 'card' && (
                <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div>
                    <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Cardholder Name</label>
                    <input value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))} placeholder="Dr. Ramesh Kumar"
                      className="w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Card Number</label>
                    <input value={card.number} onChange={e => setCard(c => ({ ...c, number: e.target.value.replace(/\D/,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim() }))}
                      placeholder="1234 5678 9012 3456" maxLength={19}
                      className="w-full px-3.5 py-3 rounded-xl text-sm font-mono focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Expiry (MM/YY)</label>
                      <input value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))} placeholder="09/27"
                        className="w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>CVV</label>
                      <input type="password" value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.slice(0,3) }))} placeholder="•••"
                        className="w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {payMethod === 'netbanking' && (
                <motion.div key="nb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <label className="text-[11px] font-semibold block" style={{ color: '#64748B' }}>Select Your Bank</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(b => (
                      <button key={b} onClick={() => setBank(b)}
                        className="py-2.5 rounded-xl text-xs font-bold border transition-all"
                        style={{
                          background: bank === b ? 'rgba(37,184,154,0.15)' : 'rgba(255,255,255,0.04)',
                          borderColor: bank === b ? 'rgba(37,184,154,0.4)' : 'rgba(255,255,255,0.08)',
                          color: bank === b ? '#25B89A' : '#94A3B8',
                        }}>
                        {b}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Pay Button */}
            <button onClick={handlePay} disabled={processing}
              className="w-full py-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all"
              style={{
                background: processing ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                boxShadow: processing ? 'none' : '0 8px 24px rgba(245,158,11,0.3)',
              }}>
              {processing
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
                : <><Shield className="w-4 h-4" /> Pay ₹{SPOTLIGHT_FEE} Securely</>
              }
            </button>
            <p className="text-[10px] text-center" style={{ color: '#475569' }}>🔒 Secure · 256-bit SSL encrypted</p>
          </div>
        </main>
      </div>
    );
  }

  // ── STEP: SUCCESS ────────────────────────────────────────────────────────────
  return (
    <div className="flex-1 flex items-center justify-center p-6 min-w-0">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center gap-5 max-w-sm">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 14 }}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(245,158,11,0.15)', border: '2px solid rgba(245,158,11,0.4)' }}>
          <Sparkles className="w-10 h-10 text-amber-400" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>You're Spotlighted! 🎉</h2>
          <p className="text-sm" style={{ color: '#94A3B8' }}>
            Your profile is now live in the ICC website hero section. Patients will see you first for the next <strong style={{ color: '#f59e0b' }}>30 days</strong>.
          </p>
        </div>
        <div className="w-full panel-card p-4 text-left space-y-2">
          {[
            { label: 'Spotlight started', value: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
            { label: 'Spotlight ends', value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) },
            { label: 'Amount paid', value: `₹${SPOTLIGHT_FEE}` },
          ].map((r, i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span style={{ color: '#64748B' }}>{r.label}</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{r.value}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setStep('info')}
          className="w-full py-3 rounded-xl text-sm font-bold"
          style={{ background: 'rgba(37,184,154,0.15)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.25)' }}>
          View Spotlight Dashboard
        </button>
      </motion.div>
    </div>
  );
}
