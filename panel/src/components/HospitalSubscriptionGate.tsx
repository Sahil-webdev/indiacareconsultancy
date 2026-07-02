'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  CheckCircle2, CreditCard, Smartphone,
  Globe, Loader2, ShieldCheck, Lock,
} from 'lucide-react';
import { panelApi } from '@/lib/api';
import { getSessionToken, getSessionUser, saveSession } from '@/lib/session';

const PLAN_AMOUNT = 500;

const PLAN_FEATURES = [
  'Verified hospital listing on ICC website',
  'Department & doctor roster management',
  'Lead routing from patients',
  'Gallery & media uploads',
  'Appointment management dashboard',
  'Analytics & performance reports',
  'Priority support from ICC team',
];

type PayMethod = 'upi' | 'card' | 'netbanking';

export default function HospitalSubscriptionGate({ children }: { children: React.ReactNode }) {
  const [subscribed, setSubscribed] = useState<boolean | null>(null);
  const [payMethod, setPayMethod] = useState<PayMethod>('upi');
  const [upiId, setUpiId] = useState('');
  const [card, setCard] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [bank, setBank] = useState('SBI');
  const [processing, setProcessing] = useState(false);
  const [paid, setPaid] = useState(false);
  const [planAmount, setPlanAmount] = useState(PLAN_AMOUNT);

  useEffect(() => {
    async function loadStatus() {
      const user = getSessionUser();
      if (!user?.profile?.entityId) {
        setSubscribed(false);
        return;
      }
      setSubscribed(user.profile.isSubscribed);
      try {
        const plans = await panelApi<{ plans: Array<{ plan_key: string; amount: number }> }>('/api/subscriptions');
        const hospitalPlan = plans.plans.find((plan) => plan.plan_key === 'hospital');
        if (hospitalPlan) setPlanAmount(Number(hospitalPlan.amount));
      } catch {}
    }
    loadStatus();
  }, []);

  const handlePay = async () => {
    if (payMethod === 'upi' && !upiId.trim()) return;
    if (payMethod === 'card' && (!card.number || !card.expiry || !card.cvv)) return;
    setProcessing(true);
    try {
      const user = getSessionUser();
      const token = getSessionToken();
      if (!user?.profile?.entityId || !token) throw new Error('Please login again');
      await panelApi('/api/subscriptions/activate', {
        method: 'POST',
        body: JSON.stringify({
          entityType: 'hospital',
          entityId: user.profile.entityId,
          amount: planAmount,
          paymentMethod: payMethod.toUpperCase(),
          transactionRef: `${payMethod}-${Date.now()}`,
        }),
      });
      const updatedUser = { ...user, profile: { ...user.profile, isSubscribed: true } };
      saveSession(token, updatedUser);
      setPaid(true);
      await new Promise((r) => setTimeout(r, 1200));
      setSubscribed(true);
    } finally {
      setProcessing(false);
    }
  };

  if (subscribed === null) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-app)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#25B89A' }} />
      </div>
    );
  }

  if (subscribed) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-app)' }}>
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(37,184,154,0.08) 0%, transparent 70%)' }} />

      <AnimatePresence mode="wait">
        {paid ? (
          <motion.div key="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center gap-4 max-w-sm">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
              className="w-20 h-20 rounded-full bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" />
            </motion.div>
            <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Hospital Panel Activated!</h2>
            <p className="text-sm" style={{ color: '#94A3B8' }}>Your subscription is active. Opening your dashboard…</p>
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
          </motion.div>
        ) : (
          <motion.div key="paywall" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-2xl"
            style={{ border: '1px solid rgba(255,255,255,0.08)' }}>

            {/* LEFT — Plan details */}
            <div className="p-8 flex flex-col gap-6"
              style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.18) 0%, rgba(109,40,217,0.12) 100%)', borderRight: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden bg-white flex items-center justify-center p-1">
                  <Image src="/logo.png" alt="ICC" width={36} height={36} className="object-contain" />
                </div>
                <div>
                  <p className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>India Care Consultancy</p>
                  <p className="text-[10px]" style={{ color: '#a78bfa' }}>Hospital Partner Panel</p>
                </div>
              </div>

              <div>
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-4xl font-extrabold" style={{ color: 'var(--text-primary)' }}>₹{planAmount}</span>
                  <span className="text-sm font-semibold mb-1.5" style={{ color: '#64748B' }}>/month</span>
                </div>
                <p className="text-xs" style={{ color: '#94A3B8' }}>Hospital Partnership Plan · Billed monthly</p>
              </div>

              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-3" style={{ color: '#a78bfa' }}>What&apos;s Included</p>
                <ul className="space-y-2.5">
                  {PLAN_FEATURES.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs" style={{ color: '#94A3B8' }}>
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-violet-400 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-2 text-[10px] px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
                <Lock className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                Your hospital panel is locked until subscription is activated
              </div>
            </div>

            {/* RIGHT — Payment form */}
            <div className="p-8 flex flex-col gap-5" style={{ background: 'var(--bg-surface)' }}>
              <div>
                <h2 className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>Activate Hospital Panel</h2>
                <p className="text-xs mt-1" style={{ color: '#64748B' }}>Pay ₹{planAmount} to unlock your dashboard</p>
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
                      className="flex flex-col items-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold border transition-all"
                      style={{
                        background: active ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                        borderColor: active ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)',
                        color: active ? '#a78bfa' : '#64748B',
                      }}>
                      <Icon className="w-4 h-4" />{m.label}
                    </button>
                  );
                })}
              </div>

              {payMethod === 'upi' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>UPI ID</label>
                    <input value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="hospital@upi"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-violet-500/40"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                  </div>
                  <p className="text-[10px]" style={{ color: '#475569' }}>Supported: GPay, PhonePe, Paytm, BHIM</p>
                </motion.div>
              )}

              {payMethod === 'card' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <div>
                    <label className="text-[10px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Cardholder Name</label>
                    <input value={card.name} onChange={e => setCard(c => ({ ...c, name: e.target.value }))} placeholder="Apollo Hospitals"
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Card Number</label>
                    <input value={card.number} onChange={e => setCard(c => ({ ...c, number: e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim() }))}
                      placeholder="1234 5678 9012 3456" maxLength={19}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm font-mono focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>Expiry</label>
                      <input value={card.expiry} onChange={e => setCard(c => ({ ...c, expiry: e.target.value }))} placeholder="MM/YY"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold block mb-1.5" style={{ color: '#64748B' }}>CVV</label>
                      <input value={card.cvv} onChange={e => setCard(c => ({ ...c, cvv: e.target.value.slice(0,3) }))} placeholder="•••" maxLength={3} type="password"
                        className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {payMethod === 'netbanking' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                  <label className="text-[10px] font-semibold block" style={{ color: '#64748B' }}>Select Bank</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['SBI', 'HDFC', 'ICICI', 'Axis', 'Kotak', 'PNB'].map(b => (
                      <button key={b} onClick={() => setBank(b)}
                        className="py-2 rounded-xl text-xs font-bold border transition-all"
                        style={{
                          background: bank === b ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.04)',
                          borderColor: bank === b ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.08)',
                          color: bank === b ? '#a78bfa' : '#94A3B8',
                        }}>
                        {b}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              <button onClick={handlePay} disabled={processing}
                className="w-full py-3.5 rounded-2xl text-sm font-extrabold flex items-center justify-center gap-2 transition-all"
                style={{
                  background: processing ? 'rgba(139,92,246,0.5)' : 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
                  color: '#fff',
                  boxShadow: processing ? 'none' : '0 8px 24px rgba(139,92,246,0.3)',
                }}>
                {processing
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing Payment…</>
                  : <><ShieldCheck className="w-4 h-4" /> Pay ₹{PLAN_AMOUNT} Securely</>
                }
              </button>
              <p className="text-[10px] text-center" style={{ color: '#475569' }}>🔒 256-bit SSL encrypted · Cancel anytime</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
