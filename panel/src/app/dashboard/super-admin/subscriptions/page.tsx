'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Search, Eye, Edit2, CheckCircle2, XCircle,
  Crown, Star, Shield, Clock, DollarSign, Building2,
  MoreVertical, RefreshCw, Download, AlertCircle,
  Tag, Pause,
} from 'lucide-react';

/* ── Doctor Subscription Plans ── */
const DOCTOR_PLANS = [
  {
    id: 'doc_elite', name: 'Elite', price: 4999, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: Crown,
    features: ['Verified badge', 'Multiple clinic locations', 'Availability calendar', 'Performance analytics', 'Advanced analytics', 'Dedicated account manager', 'Multiple staff accounts', 'Priority support 24/7'],
  },
  {
    id: 'doc_premium', name: 'Premium', price: 2499, color: 'text-violet-400', bg: 'bg-violet-400/10', border: 'border-violet-400/20', icon: Star,
    features: ['Verified badge', 'Up to 3 clinic locations', 'Availability calendar', 'Performance analytics', 'Priority support', 'Profile enhancement tools'],
  },
  {
    id: 'doc_basic', name: 'Basic', price: 999, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: Shield,
    features: ['Verified profile', 'Single clinic location', 'Lead inbox', 'Appointment requests', 'Basic support'],
  },
];

/* ── Hospital Partnership Plans ── */
const HOSPITAL_PLANS = [
  {
    id: 'hosp_platinum', name: 'Platinum', price: 9999, color: 'text-sky-400', bg: 'bg-sky-400/10', border: 'border-sky-400/20', icon: Crown,
    features: ['Multiple branches', 'Multiple admins', 'Doctor roster management', 'Department management', 'Package listing', 'Lead routing', 'Detailed analytics', 'Dedicated relationship manager'],
  },
  {
    id: 'hosp_gold', name: 'Gold', price: 5999, color: 'text-amber-400', bg: 'bg-amber-400/10', border: 'border-amber-400/20', icon: Star,
    features: ['Up to 3 branches', '2 admin accounts', 'Doctor roster', 'Basic analytics', 'Priority support'],
  },
  {
    id: 'hosp_silver', name: 'Silver', price: 2999, color: 'text-slate-400', bg: 'bg-slate-400/10', border: 'border-slate-400/20', icon: Shield,
    features: ['Single location', '1 admin account', 'Doctor listing', 'Basic lead routing', 'Email support'],
  },
];

const SUBSCRIPTIONS = [
  { id: 'SUB001', subscriber: 'Dr. Ramesh Kumar',  type: 'Doctor',   plan: 'Elite',    started: 'Jun 1, 2026',  renews: 'Jul 1, 2026',  amount: 4999, status: 'Active' },
  { id: 'SUB002', subscriber: 'Apollo Hospitals',  type: 'Hospital', plan: 'Platinum', started: 'May 15, 2026', renews: 'Jun 15, 2026', amount: 9999, status: 'Grace Period' },
  { id: 'SUB003', subscriber: 'Dr. Priya Patel',   type: 'Doctor',   plan: 'Premium',  started: 'Jun 5, 2026',  renews: 'Jul 5, 2026',  amount: 2499, status: 'Active' },
  { id: 'SUB004', subscriber: 'Fortis Healthcare', type: 'Hospital', plan: 'Gold',     started: 'May 1, 2026',  renews: 'Jun 1, 2026',  amount: 5999, status: 'Expired' },
  { id: 'SUB005', subscriber: 'Dr. Kiran Sharma',  type: 'Doctor',   plan: 'Elite',    started: 'Apr 1, 2026',  renews: 'Jul 1, 2026',  amount: 4999, status: 'Active' },
  { id: 'SUB006', subscriber: 'Dr. Sanjay Gupta',  type: 'Doctor',   plan: 'Basic',    started: 'Jun 10, 2026', renews: 'Jul 10, 2026', amount: 999,  status: 'Trial' },
  { id: 'SUB007', subscriber: 'KIMS Hospital',     type: 'Hospital', plan: 'Platinum', started: 'Mar 1, 2026',  renews: 'Jun 1, 2026',  amount: 9999, status: 'Payment Failed' },
  { id: 'SUB008', subscriber: 'Dr. Nidhi Verma',   type: 'Doctor',   plan: 'Basic',    started: 'Jun 12, 2026', renews: 'Jul 12, 2026', amount: 999,  status: 'Active' },
];

const planBadge = (p: string) => {
  const map: Record<string, string> = {
    'Elite':   'bg-amber-400/15 text-amber-400 border border-amber-400/20',
    'Premium': 'bg-violet-400/15 text-violet-400 border border-violet-400/20',
    'Basic':   'bg-slate-400/15 text-slate-400 border border-slate-400/20',
    'Platinum':'bg-sky-400/15 text-sky-400 border border-sky-400/20',
    'Gold':    'bg-amber-400/15 text-amber-400 border border-amber-400/20',
    'Silver':  'bg-slate-400/15 text-slate-400 border border-slate-400/20',
  };
  return map[p] ?? '';
};

const statusInfo: Record<string, { badge: string; dot: string }> = {
  'Active':        { badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20', dot: '#22c55e' },
  'Trial':         { badge: 'bg-sky-500/15 text-sky-400 border border-sky-500/20',            dot: '#38bdf8' },
  'Grace Period':  { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',      dot: '#f59e0b' },
  'Payment Failed':{ badge: 'bg-red-500/15 text-red-400 border border-red-500/20',            dot: '#ef4444' },
  'Paused':        { badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',      dot: '#94a3b8' },
  'Expired':       { badge: 'bg-red-500/15 text-red-400 border border-red-500/20',            dot: '#ef4444' },
  'Cancelled':     { badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',      dot: '#94a3b8' },
};

const SUB_ACTIONS = [
  { label: 'View Subscription', icon: Eye,         divider: false, danger: false },
  { label: 'View Invoice',      icon: Download,    divider: false, danger: false },
  { label: 'Renew',             icon: RefreshCw,   divider: false, danger: false },
  { label: 'Upgrade',           icon: Zap,         divider: false, danger: false },
  { label: 'Downgrade',         icon: AlertCircle, divider: false, danger: false },
  { label: 'Apply Discount',    icon: Tag,         divider: false, danger: false },
  { label: 'Extend Grace Period',icon: Clock,      divider: false, danger: false },
  { label: 'View Payment History',icon: DollarSign,divider: true,  danger: false },
  { label: 'Pause',             icon: Pause,       divider: false, danger: true  },
  { label: 'Cancel',            icon: XCircle,     divider: false, danger: true  },
  { label: 'Initiate Refund',   icon: AlertCircle, divider: false, danger: true  },
];

function ThreeDotMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function h(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(v => !v)}
        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors"
        style={{ color: '#64748B' }}>
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 4 }}
            transition={{ duration: 0.13 }}
            className="absolute right-0 top-full mt-1 z-50 rounded-2xl border shadow-2xl overflow-hidden"
            style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)', minWidth: 200 }}
          >
            {SUB_ACTIONS.map((action, i) => {
              const Icon = action.icon;
              return (
                <React.Fragment key={i}>
                  {action.divider && <div className="my-1 mx-2 border-t" style={{ borderColor: 'var(--border-color)' }} />}
                  <button
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-left transition-colors hover:bg-white/5"
                    style={{ color: action.danger ? '#f87171' : 'var(--text-secondary)' }}
                    onClick={() => setOpen(false)}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" /> {action.label}
                  </button>
                </React.Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SubscriptionsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = SUBSCRIPTIONS.filter(s =>
    (s.subscriber.toLowerCase().includes(search.toLowerCase()) ||
     s.plan.toLowerCase().includes(search.toLowerCase())) &&
    (typeFilter === 'All' || s.type === typeFilter)
  );

  const mrr = SUBSCRIPTIONS.filter(s => s.status === 'Active').reduce((a, s) => a + s.amount, 0);
  const active = SUBSCRIPTIONS.filter(s => s.status === 'Active').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Subscriptions</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Doctor & Hospital plan management</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">

          {/* ── Doctor Subscription Plans ── */}
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#64748B' }}>
              Doctor Subscription Plans
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {DOCTOR_PLANS.map((plan, i) => {
                const Icon = plan.icon;
                const count = SUBSCRIPTIONS.filter(s => s.plan === plan.name && s.type === 'Doctor' && s.status === 'Active').length;
                return (
                  <motion.div key={plan.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                    className={`panel-card p-5 border ${plan.border} flex flex-col gap-3`}>
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-2xl ${plan.bg} border ${plan.border} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${plan.color}`} />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${plan.bg} ${plan.color} border ${plan.border}`}>{count} active</span>
                    </div>
                    <div>
                      <p className={`text-lg font-extrabold ${plan.color}`}>{plan.name}</p>
                      <p className="text-xl font-extrabold mt-1" style={{ color: 'var(--text-primary)' }}>
                        ₹{plan.price.toLocaleString()}<span className="text-xs font-semibold" style={{ color: '#64748B' }}>/mo</span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {plan.features.map((f, j) => (
                        <p key={j} className="text-[11px] flex items-center gap-1.5" style={{ color: '#64748B' }}>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />{f}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── Hospital Partnership Plans ── */}
          <div className="mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#64748B' }}>
              Hospital Partnership Plans
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {HOSPITAL_PLANS.map((plan, i) => {
                const Icon = plan.icon;
                const count = SUBSCRIPTIONS.filter(s => s.plan === plan.name && s.type === 'Hospital' && s.status === 'Active').length;
                return (
                  <motion.div key={plan.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }}
                    className={`panel-card p-5 border ${plan.border} flex flex-col gap-3`}>
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-2xl ${plan.bg} border ${plan.border} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${plan.color}`} />
                      </div>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${plan.bg} ${plan.color} border ${plan.border}`}>{count} active</span>
                    </div>
                    <div>
                      <p className={`text-lg font-extrabold ${plan.color}`}>{plan.name}</p>
                      <p className="text-xl font-extrabold mt-1" style={{ color: 'var(--text-primary)' }}>
                        ₹{plan.price.toLocaleString()}<span className="text-xs font-semibold" style={{ color: '#64748B' }}>/mo</span>
                      </p>
                    </div>
                    <div className="flex flex-col gap-1 pt-2 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                      {plan.features.map((f, j) => (
                        <p key={j} className="text-[11px] flex items-center gap-1.5" style={{ color: '#64748B' }}>
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />{f}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Zap,        label: 'Total Subscriptions', value: SUBSCRIPTIONS.length,                color: 'bg-indigo-500' },
              { icon: CheckCircle2,label:'Active',              value: active,                               color: 'bg-emerald-500' },
              { icon: AlertCircle, label:'Expired / Failed',    value: SUBSCRIPTIONS.filter(s => ['Expired','Payment Failed'].includes(s.status)).length, color: 'bg-red-500' },
              { icon: DollarSign,  label:'Active MRR',          value: `₹${mrr.toLocaleString()}`,          color: 'bg-amber-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.07 }}
                className="panel-card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
                  <s.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                  <p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Subscriptions table */}
          <div className="panel-card overflow-hidden">
            <div className="flex flex-wrap items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                <input type="text" placeholder="Search subscriptions…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <div className="flex gap-1.5">
                {['All', 'Doctor', 'Hospital'].map(t => (
                  <button key={t} onClick={() => setTypeFilter(t)}
                    className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                    style={typeFilter === t
                      ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                      : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    {t}
                  </button>
                ))}
              </div>
              <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['ID', 'Subscriber', 'Type', 'Plan', 'Started', 'Renews', 'Amount', 'Status', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => {
                    const si = statusInfo[s.status] ?? { badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/20', dot: '#94a3b8' };
                    return (
                      <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-3.5 font-mono text-[10px]" style={{ color: '#25B89A' }}>{s.id}</td>
                        <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{s.subscriber}</td>
                        <td className="px-4 py-3.5">
                          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md"
                            style={s.type === 'Doctor'
                              ? { color: '#38BDF8', background: 'rgba(56,189,248,0.1)' }
                              : { color: '#A78BFA', background: 'rgba(167,139,250,0.1)' }}>
                            {s.type === 'Doctor' ? <Zap className="w-3 h-3" /> : <Building2 className="w-3 h-3" />} {s.type}
                          </span>
                        </td>
                        <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${planBadge(s.plan)}`}>{s.plan}</span></td>
                        <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#94A3B8' }}>{s.started}</td>
                        <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#94A3B8' }}>{s.renews}</td>
                        <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>₹{s.amount.toLocaleString()}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: si.dot }} />
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${si.badge}`}>{s.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: '#25B89A' }}>
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <ThreeDotMenu />
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
  );
}
