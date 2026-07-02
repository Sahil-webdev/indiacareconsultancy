'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Star, Eye, TrendingUp, CreditCard, Smartphone,
  Globe, Shield, Loader2, Zap,
  CalendarDays, X, BadgeCheck, ArrowRight, Building2,
} from 'lucide-react';
import { useHospitalIdentity } from '@/lib/panelIdentity';

const SPOTLIGHT_FEE = 1499; // ₹/30 days — managed by super admin

type PayMethod = 'upi' | 'card' | 'netbanking';
type Step = 'info' | 'payment' | 'success';
type PromoState = {
  daysLeft: number;
  tagline: string;
  paidAt: number;
  endsAt: number;
};

function getStoredHospitalPromo(): PromoState | null {
  if (typeof window === 'undefined') return null;
  const promo = localStorage.getItem('icc_hospital_promoted');
  if (!promo) return null;

  const data = JSON.parse(promo) as { paidAt: number; tagline: string };
  const paidAt = Number(data.paidAt || Date.now());
  const endsAt = paidAt + 30 * 24 * 60 * 60 * 1000;
  const daysLeft = Math.max(0, 30 - Math.floor((Date.now() - paidAt) / (1000 * 60 * 60 * 24)));

  if (daysLeft <= 0) {
    localStorage.removeItem('icc_hospital_promoted');
    return null;
  }

  return { daysLeft, tagline: data.tagline, paidAt, endsAt };
}

function HeroPreview({
  tagline,
  active,
  hospital,
}: {
  tagline: string;
  active?: boolean;
  hospital: {
    name: string;
    type: string;
    departments: number;
    city: string;
    rating: number;
    beds: number;
  };
}) {
  return (
    <div className="relative rounded-2xl overflow-hidden p-5"
      style={{ background: 'linear-gradient(135deg, rgba(109,40,217,0.2) 0%, rgba(139,92,246,0.15) 100%)', border: '1px solid rgba(139,92,246,0.25)' }}>
      {active && (
        <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-full"
          style={{ background: 'rgba(245,158,11,0.2)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>
          <Sparkles className="w-3 h-3" /> LIVE ON HOMEPAGE
        </div>
      )}
      <p className="text-[9px] font-bold uppercase tracking-wider mb-2" style={{ color: '#a78bfa' }}>Website Hero Preview</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center flex-shrink-0">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>{hospital.name}</p>
          <p className="text-[11px]" style={{ color: '#a78bfa' }}>{hospital.type} · {hospital.departments} Departments · {hospital.city}</p>
          <p className="text-[11px] italic mt-0.5" style={{ color: '#94A3B8' }}>&ldquo;{tagline}&rdquo;</p>
        </div>
      </div>
      <div className="flex items-center gap-3 mt-3">
        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400"><Star className="w-3 h-3 fill-amber-400" /> {hospital.rating.toFixed(1)} (312 reviews)</span>
        <span className="text-[10px]" style={{ color: '#64748B' }}>{hospital.beds} beds · 24/7 Emergency</span>
        <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
      </div>
    </div>
  );
}

export default function HospitalPromotePage() {
  const { profile, displayName } = useHospitalIdentity();
  const [step, setStep] = useState<Step>('info');
  const [tagline, setTagline] = useState('World-Class Multispeciality Care & Premier Clinical Excellence');
  const [payMethod, setPayMethod] = useState<PayMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [bank, setBank] = useState('SBI');
  const [processing, setProcessing] = useState(false);
  const [activePromo, setActivePromo] = useState<PromoState | null>(() => getStoredHospitalPromo());
  const hospital = {
    name: displayName,
    type: profile?.hospitalType || 'Hospital',
    departments: profile?.departments.length || 0,
    city: profile?.location || 'Location pending',
    rating: profile?.rating || 0,
    beds: profile?.totalBeds || 0,
  };

  const handlePay = async () => {
    if (payMethod === 'upi' && !upiId.trim()) return;
    if (payMethod === 'card' && (!card.number || !card.expiry || !card.cvv)) return;
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2500));
    const paidAt = Date.now();
    const endsAt = paidAt + 30 * 24 * 60 * 60 * 1000;
    localStorage.setItem('icc_hospital_promoted', JSON.stringify({ paidAt, tagline }));
    setProcessing(false);
    setStep('success');
    setActivePromo({ daysLeft: 30, tagline, paidAt, endsAt });
  };

  // ── ACTIVE VIEW ──
  if (activePromo) {
    const pct = Math.round((activePromo.daysLeft / 30) * 100);
    return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Homepage Spotlight</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Your hospital is featured on the ICC website homepage</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-extrabold px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
            <Sparkles className="w-3.5 h-3.5" /> Active Spotlight
          </span>
        </header>
        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="max-w-2xl mx-auto space-y-5">
            <HeroPreview tagline={activePromo.tagline} active hospital={hospital} />
            <div className="panel-card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>Spotlight Duration</p>
                <span className="text-xs font-extrabold text-amber-400">{activePromo.daysLeft} days remaining</span>
              </div>
              <div className="w-full h-2 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#8B5CF6,#6D28D9)' }} />
              </div>
              <p className="text-[10px] mt-1.5" style={{ color: '#64748B' }}>30-day spotlight · Expires in {activePromo.daysLeft} days</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Hospital Views', value: '2,891', icon: Eye, color: 'text-violet-400 bg-violet-500/12' },
                { label: 'Patient Leads', value: '84', icon: TrendingUp, color: 'text-emerald-400 bg-emerald-500/12' },
                { label: 'Avg. Daily Reach', value: '~620', icon: Zap, color: 'text-amber-400 bg-amber-500/12' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="panel-card p-4 text-center">
                  <div className={`w-9 h-9 rounded-xl mx-auto flex items-center justify-center mb-2 ${s.color.split(' ')[1]}`}>
                    <s.icon className={`w-4 h-4 ${s.color.split(' ')[0]}`} />
                  </div>
                  <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                  <p className="text-[10px] mt-0.5" style={{ color: '#64748B' }}>{s.label}</p>
                </motion.div>
              ))}
            </div>
            <button onClick={() => { localStorage.removeItem('icc_hospital_promoted'); setActivePromo(null); }}
              className="text-xs font-bold text-center w-full py-2" style={{ color: '#475569' }}>
              Remove from spotlight
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── INFO ──
  if (step === 'info') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Homepage Spotlight</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Feature your hospital on the ICC website homepage hero section</p>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="max-w-2xl mx-auto space-y-5">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl p-6 text-center" style={{ background: 'linear-gradient(135deg,rgba(109,40,217,0.2),rgba(139,92,246,0.15))', border: '1px solid rgba(139,92,246,0.2)' }}>
              <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
                <Sparkles className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>Get Your Hospital Featured</h2>
              <p className="text-sm max-w-md mx-auto" style={{ color: '#94A3B8' }}>
                Appear at the top of the ICC website&apos;s hero section - the first thing thousands of patients see. Drive more inquiries, admissions, and OPD visits.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="text-3xl font-extrabold" style={{ color: 'var(--text-primary)' }}>₹{SPOTLIGHT_FEE}</span>
                <div className="text-left">
                  <p className="text-xs font-semibold" style={{ color: '#64748B' }}>for 30 days</p>
                  <p className="text-[10px]" style={{ color: '#475569' }}>₹{Math.round(SPOTLIGHT_FEE/30)}/day</p>
                </div>
              </div>
            </motion.div>

            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: '#a78bfa' }}>What You Get</p>
              <ul className="space-y-2.5">
                {[
                  { icon: Eye, text: 'Hospital featured in homepage hero — maximum patient visibility' },
                  { icon: TrendingUp, text: 'Reach 2000+ daily website visitors for 30 days' },
                  { icon: Star, text: 'Gold "Featured Hospital" badge on your listing' },
                  { icon: CalendarDays, text: '30-day spotlight with daily performance analytics' },
                  { icon: BadgeCheck, text: 'Priority placement above non-featured hospitals in search' },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs" style={{ color: '#94A3B8' }}>
                    <div className="w-7 h-7 rounded-xl bg-violet-500/12 flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>

            <div className="panel-card p-5">
              <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#a78bfa' }}>Your Tagline</p>
              <p className="text-xs mb-3" style={{ color: '#64748B' }}>This will appear below your hospital name in the hero section.</p>
              <input value={tagline} onChange={e => setTagline(e.target.value)} maxLength={80}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/40 mb-1"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              <p className="text-[10px] text-right" style={{ color: '#475569' }}>{tagline.length}/80</p>
            </div>

            <HeroPreview tagline={tagline} hospital={hospital} />

            <button onClick={() => setStep('payment')}
              className="w-full py-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 text-white"
              style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)', boxShadow: '0 8px 24px rgba(139,92,246,0.3)' }}>
              <Sparkles className="w-4 h-4" /> Get Featured for ₹{SPOTLIGHT_FEE} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </main>
      </div>
    );
  }

  // ── PAYMENT ──
  if (step === 'payment') {
    return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-3">
            <button onClick={() => setStep('info')} className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center" style={{ color: '#64748B' }}><X className="w-4 h-4" /></button>
            <div>
              <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Complete Payment</h1>
              <p className="text-[11px]" style={{ color: '#64748B' }}>Hospital Spotlight · 30 days · ₹{SPOTLIGHT_FEE}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="max-w-md mx-auto space-y-5">
            <div className="panel-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-violet-500/15 flex items-center justify-center"><Sparkles className="w-4 h-4 text-violet-400" /></div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Hospital Homepage Spotlight</p>
                  <p className="text-[10px]" style={{ color: '#64748B' }}>30 days · Starts immediately</p>
                </div>
              </div>
              <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>₹{SPOTLIGHT_FEE}</p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {([
                { id: 'upi', label: 'UPI', icon: Smartphone },
                { id: 'card', label: 'Card', icon: CreditCard },
                { id: 'netbanking', label: 'Net Banking', icon: Globe },
              ] as { id: PayMethod; label: string; icon: React.ElementType }[]).map(m => {
                const Icon = m.icon; const active = payMethod === m.id;
                return (
                  <button key={m.id} onClick={() => setPayMethod(m.id)}
                    className="flex flex-col items-center gap-1.5 py-3 rounded-xl text-[11px] font-bold border transition-all"
                    style={{ background: active ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)', borderColor: active ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)', color: active ? '#a78bfa' : '#64748B' }}>
                    <Icon className="w-5 h-5" />{m.label}
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {payMethod === 'upi' && (
                <motion.div key="upi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <label className="text-[11px] font-semibold block" style={{ color: '#64748B' }}>UPI ID</label>
                  <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="hospital@okaxis"
                    className="w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                </motion.div>
              )}
              {payMethod === 'card' && (
                <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <div><label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Cardholder Name</label>
                    <input value={card.name} onChange={e => setCard(c=>({...c,name:e.target.value}))} placeholder="Apollo Hospitals"
                      className="w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} /></div>
                  <div><label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Card Number</label>
                    <input value={card.number} onChange={e => setCard(c=>({...c,number:e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim()}))}
                      placeholder="1234 5678 9012 3456" maxLength={19}
                      className="w-full px-3.5 py-3 rounded-xl text-sm font-mono focus:outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Expiry</label>
                      <input value={card.expiry} onChange={e => setCard(c=>({...c,expiry:e.target.value}))} placeholder="MM/YY"
                        className="w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} /></div>
                    <div><label className="text-[11px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>CVV</label>
                      <input type="password" value={card.cvv} onChange={e => setCard(c=>({...c,cvv:e.target.value.slice(0,3)}))} placeholder="•••"
                        className="w-full px-3.5 py-3 rounded-xl text-sm focus:outline-none" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} /></div>
                  </div>
                </motion.div>
              )}
              {payMethod === 'netbanking' && (
                <motion.div key="nb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                  <label className="text-[11px] font-semibold block" style={{ color: '#64748B' }}>Select Bank</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['SBI','HDFC','ICICI','Axis','Kotak','PNB'].map(b => (
                      <button key={b} onClick={() => setBank(b)}
                        className="py-2.5 rounded-xl text-xs font-bold border transition-all"
                        style={{ background: bank===b ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)', borderColor: bank===b ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)', color: bank===b ? '#a78bfa' : '#94A3B8' }}>
                        {b}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={handlePay} disabled={processing}
              className="w-full py-4 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2"
              style={{ background: processing ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg,#8B5CF6,#6D28D9)', color:'#fff', boxShadow: processing ? 'none' : '0 8px 24px rgba(139,92,246,0.3)' }}>
              {processing ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</> : <><Shield className="w-4 h-4" /> Pay ₹{SPOTLIGHT_FEE} Securely</>}
            </button>
            <p className="text-[10px] text-center" style={{ color: '#475569' }}>🔒 Secure · 256-bit SSL encrypted</p>
          </div>
        </main>
      </div>
    );
  }

  // ── SUCCESS ──
  const promoDetails = activePromo ?? { daysLeft: 0, tagline, paidAt: 0, endsAt: 0 };

  return (
    <div className="flex-1 flex items-center justify-center p-6 min-w-0">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center gap-5 max-w-sm">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 14 }}
          className="w-20 h-20 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(139,92,246,0.15)', border: '2px solid rgba(139,92,246,0.4)' }}>
          <Sparkles className="w-10 h-10 text-violet-400" />
        </motion.div>
        <div>
          <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>Hospital Spotlighted! 🎉</h2>
          <p className="text-sm" style={{ color: '#94A3B8' }}>Your hospital is now live in the ICC website hero section for the next <strong style={{ color: '#a78bfa' }}>30 days</strong>.</p>
        </div>
        <div className="w-full panel-card p-4 text-left space-y-2">
          {[
            { label: 'Spotlight started', value: new Date(promoDetails.paidAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) },
            { label: 'Spotlight ends', value: new Date(promoDetails.endsAt).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}) },
            { label: 'Amount paid', value: `₹${SPOTLIGHT_FEE}` },
          ].map((r,i) => (
            <div key={i} className="flex items-center justify-between text-xs">
              <span style={{ color: '#64748B' }}>{r.label}</span>
              <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{r.value}</span>
            </div>
          ))}
        </div>
        <button onClick={() => setStep('info')} className="w-full py-3 rounded-xl text-sm font-bold"
          style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.25)' }}>
          View Spotlight Dashboard
        </button>
      </motion.div>
    </div>
  );
}
