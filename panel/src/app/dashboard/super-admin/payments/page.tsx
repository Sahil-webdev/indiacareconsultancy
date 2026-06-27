'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign, Search, Eye, Download, CheckCircle2,
  Clock, XCircle, TrendingUp, CreditCard, Building2, Zap,
  MoreVertical, AlertCircle, RefreshCw, FileText, Flag,
} from 'lucide-react';

const PAYMENTS = [
  { id: 'PAY001', payer: 'Dr. Ramesh Kumar',  type: 'Doctor',   plan: 'Elite',    amount: 4999,  gst: 900,  discount: 0,   final: 5899,  date: 'Jun 1, 2026',  method: 'UPI',         status: 'Success',  txnId: 'TXN8821A', refund: 0 },
  { id: 'PAY002', payer: 'Apollo Hospitals',  type: 'Hospital', plan: 'Platinum', amount: 9999,  gst: 1800, discount: 500, final: 11299, date: 'May 15, 2026', method: 'Net Banking', status: 'Success',  txnId: 'TXN7712B', refund: 0 },
  { id: 'PAY003', payer: 'Dr. Priya Patel',   type: 'Doctor',   plan: 'Premium',  amount: 2499,  gst: 450,  discount: 0,   final: 2949,  date: 'Jun 5, 2026',  method: 'Card',        status: 'Success',  txnId: 'TXN6603C', refund: 0 },
  { id: 'PAY004', payer: 'Fortis Healthcare', type: 'Hospital', plan: 'Gold',     amount: 5999,  gst: 1080, discount: 0,   final: 7079,  date: 'May 1, 2026',  method: 'Net Banking', status: 'Refunded', txnId: 'TXN5594D', refund: 7079 },
  { id: 'PAY005', payer: 'Dr. Kiran Sharma',  type: 'Doctor',   plan: 'Elite',    amount: 4999,  gst: 900,  discount: 0,   final: 5899,  date: 'Apr 1, 2026',  method: 'UPI',         status: 'Success',  txnId: 'TXN4485E', refund: 0 },
  { id: 'PAY006', payer: 'Dr. Sanjay Gupta',  type: 'Doctor',   plan: 'Basic',    amount: 999,   gst: 180,  discount: 0,   final: 1179,  date: 'Jun 10, 2026', method: 'UPI',         status: 'Success',  txnId: 'TXN3376F', refund: 0 },
  { id: 'PAY007', payer: 'KIMS Hospital',     type: 'Hospital', plan: 'Platinum', amount: 9999,  gst: 1800, discount: 0,   final: 11799, date: 'Mar 1, 2026',  method: 'Card',        status: 'Refunded', txnId: 'TXN2267G', refund: 11799 },
  { id: 'PAY008', payer: 'Dr. Nidhi Verma',   type: 'Doctor',   plan: 'Basic',    amount: 999,   gst: 180,  discount: 0,   final: 1179,  date: 'Jun 12, 2026', method: 'UPI',         status: 'Pending',  txnId: 'TXN1158H', refund: 0 },
];

const statusBadge = (s: string) => ({
  'Success':  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  'Pending':  'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  'Refunded': 'bg-red-500/15 text-red-400 border border-red-500/20',
  'Failed':   'bg-red-500/15 text-red-400 border border-red-500/20',
}[s] || '');

const planBadge = (p: string) => ({
  'Elite':    'bg-amber-400/15 text-amber-400',
  'Premium':  'bg-violet-400/15 text-violet-400',
  'Basic':    'bg-slate-400/15 text-slate-400',
  'Platinum': 'bg-sky-400/15 text-sky-400',
  'Gold':     'bg-amber-400/15 text-amber-400',
  'Silver':   'bg-slate-400/15 text-slate-400',
}[p] || '');

const PAY_ACTIONS = [
  { label: 'View Transaction',     icon: Eye,         divider: false, danger: false },
  { label: 'Download Invoice',     icon: Download,    divider: false, danger: false },
  { label: 'Download Receipt',     icon: FileText,    divider: false, danger: false },
  { label: 'Reconcile',           icon: CheckCircle2,divider: false, danger: false },
  { label: 'Retry Payment',       icon: RefreshCw,   divider: false, danger: false },
  { label: 'View Gateway Response',icon: Zap,         divider: false, danger: false },
  { label: 'View Webhook Logs',   icon: AlertCircle, divider: true,  danger: false },
  { label: 'Initiate Refund',     icon: XCircle,     divider: false, danger: true  },
  { label: 'Flag Transaction',    icon: Flag,        divider: false, danger: true  },
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
            {PAY_ACTIONS.map((action, i) => {
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

export default function PaymentsPage() {
  const [search, setSearch] = useState('');
  const filtered = PAYMENTS.filter(p =>
    p.payer.toLowerCase().includes(search.toLowerCase()) ||
    p.txnId.toLowerCase().includes(search.toLowerCase())
  );

  const grossCollection = PAYMENTS.filter(p => p.status === 'Success').reduce((a, p) => a + p.final, 0);
  const totalRefunds    = PAYMENTS.filter(p => p.status === 'Refunded').reduce((a, p) => a + p.refund, 0);
  const netCollection   = grossCollection - totalRefunds;
  const pendingCount    = PAYMENTS.filter(p => p.status === 'Pending').length;
  const successCount    = PAYMENTS.filter(p => p.status === 'Success').length;
  const gstCollected    = PAYMENTS.filter(p => p.status === 'Success').reduce((a, p) => a + p.gst, 0);

  const chartData = [
    { month: 'Jan', amount: 38000 },
    { month: 'Feb', amount: 52000 },
    { month: 'Mar', amount: 61000 },
    { month: 'Apr', amount: 55000 },
    { month: 'May', amount: 78000 },
    { month: 'Jun', amount: 92000 },
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Payments</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>All subscription and service payment transactions</p>
        </div>
        <button className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl"
          style={{ color: '#25B89A', background: 'rgba(37,184,154,0.1)', border: '1px solid rgba(37,184,154,0.2)' }}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        {/* Revenue summary */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {[
            { icon: TrendingUp,   label: 'Gross Collection',    value: `₹${grossCollection.toLocaleString()}`, color: 'bg-emerald-500', tooltip: 'Sum of all successful payments (incl. GST)' },
            { icon: CheckCircle2, label: 'Successful Payments', value: successCount,                            color: 'bg-indigo-500',  tooltip: undefined },
            { icon: XCircle,      label: 'Refunds',             value: `₹${totalRefunds.toLocaleString()}`,    color: 'bg-red-500',     tooltip: 'Total amount refunded to payers' },
            { icon: DollarSign,   label: 'Net Collection',      value: `₹${netCollection.toLocaleString()}`,   color: 'bg-teal-500',    tooltip: 'Gross Collection − Refunds' },
            { icon: Clock,        label: 'Pending',             value: pendingCount,                           color: 'bg-amber-500',   tooltip: undefined },
            { icon: Building2,    label: 'GST Collected',       value: `₹${gstCollected.toLocaleString()}`,   color: 'bg-violet-500',  tooltip: 'Total GST included in successful payments' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="panel-card p-4 flex items-center gap-3" title={s.tooltip}>
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-base font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Revenue chart */}
        <div className="panel-card p-5 mb-6">
          <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp className="w-4 h-4" style={{ color: '#25B89A' }} /> Revenue Trend · Last 6 Months (Gross Collection)
          </h3>
          <div className="flex items-end gap-3 h-28">
            {chartData.map((m, i) => {
              const maxAmt = 92000;
              const pct = (m.amount / maxAmt) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <p className="text-[9px] font-bold" style={{ color: '#25B89A' }}>₹{(m.amount / 1000).toFixed(0)}k</p>
                  <div className="w-full rounded-t-xl relative" style={{ background: 'rgba(255,255,255,0.04)', height: '96px' }}>
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: `${pct}%` }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.7 }}
                      className="absolute bottom-0 left-0 right-0 rounded-t-xl"
                      style={{ background: 'linear-gradient(180deg,#25B89A,#127A6A)' }}
                    />
                  </div>
                  <p className="text-[9px] font-semibold" style={{ color: '#2D4150' }}>{m.month}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Transactions table */}
        <div className="panel-card overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
              <input type="text" placeholder="Search by name or TXN ID…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            </div>
            <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} transactions</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Txn ID', 'Payer', 'Type', 'Plan', 'Base Amt', 'GST', 'Discount', 'Final Amt', 'Date', 'Method', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <td className="px-4 py-3.5 font-mono text-[10px]" style={{ color: '#25B89A' }}>{p.txnId}</td>
                    <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{p.payer}</td>
                    <td className="px-4 py-3.5">
                      <span className="text-[10px] font-bold" style={{ color: p.type === 'Doctor' ? '#38BDF8' : '#A78BFA' }}>{p.type}</span>
                    </td>
                    <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${planBadge(p.plan)}`}>{p.plan}</span></td>
                    <td className="px-4 py-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>₹{p.amount.toLocaleString()}</td>
                    <td className="px-4 py-3.5" style={{ color: '#94A3B8' }}>₹{p.gst}</td>
                    <td className="px-4 py-3.5" style={{ color: '#64748B' }}>{p.discount ? `−₹${p.discount}` : '—'}</td>
                    <td className="px-4 py-3.5 font-extrabold" style={{ color: 'var(--text-primary)' }}>₹{p.final.toLocaleString()}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#94A3B8' }}>{p.date}</td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1 text-[10px] font-bold" style={{ color: '#64748B' }}>
                        <CreditCard className="w-3 h-3" /> {p.method}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(p.status)}`}>{p.status}</span>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
