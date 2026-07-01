'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Download, Search, Filter, Stethoscope, Building2, User, IndianRupee } from 'lucide-react';

const INVOICES = [
  { id: 'INV-2025-001', entity: 'Dr. Aryan Kapoor', type: 'Subscription', category: 'Doctor', amount: 300, status: 'Paid', date: '2025-07-01', month: 'Jul 2025' },
  { id: 'INV-2025-002', entity: 'Apollo Spectra Delhi', type: 'Subscription', category: 'Hospital', amount: 500, status: 'Paid', date: '2025-07-01', month: 'Jul 2025' },
  { id: 'INV-2025-003', entity: 'Ramesh Kumar', type: 'Consultation', category: 'Patient', amount: 199, status: 'Paid', date: '2025-06-30', month: 'Jun 2025' },
  { id: 'INV-2025-004', entity: 'Dr. Sheetal Patel', type: 'Spotlight', category: 'Doctor', amount: 999, status: 'Paid', date: '2025-06-28', month: 'Jun 2025' },
  { id: 'INV-2025-005', entity: 'Narayana Pune', type: 'Subscription', category: 'Hospital', amount: 500, status: 'Pending', date: '2025-07-01', month: 'Jul 2025' },
  { id: 'INV-2025-006', entity: 'Sunita Devi', type: 'Consultation', category: 'Patient', amount: 199, status: 'Refunded', date: '2025-06-27', month: 'Jun 2025' },
  { id: 'INV-2025-007', entity: 'Dr. Manish Kumar', type: 'Subscription', category: 'Doctor', amount: 300, status: 'Paid', date: '2025-07-01', month: 'Jul 2025' },
  { id: 'INV-2025-008', entity: 'Sunshine Clinic', type: 'Subscription', category: 'Hospital', amount: 500, status: 'Failed', date: '2025-07-01', month: 'Jul 2025' },
];

const STATUS_COLORS: Record<string, string> = { Paid: 'text-emerald-400 bg-emerald-500/12 border-emerald-500/20', Pending: 'text-amber-400 bg-amber-500/12 border-amber-500/20', Refunded: 'text-sky-400 bg-sky-500/12 border-sky-500/20', Failed: 'text-red-400 bg-red-500/12 border-red-500/20' };
const CAT_ICON: Record<string, React.ElementType> = { Doctor: Stethoscope, Hospital: Building2, Patient: User };
const CAT_COLOR: Record<string, string> = { Doctor: 'text-emerald-400 bg-emerald-500/15', Hospital: 'text-violet-400 bg-violet-500/15', Patient: 'text-sky-400 bg-sky-500/15' };

export default function InvoicesPage() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = INVOICES.filter(inv => {
    const matchSearch = inv.entity.toLowerCase().includes(search.toLowerCase()) || inv.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || inv.category === catFilter;
    const matchType = typeFilter === 'All' || inv.type === typeFilter;
    return matchSearch && matchCat && matchType;
  });

  const totalRevenue = filtered.filter(i => i.status === 'Paid').reduce((a, i) => a + i.amount, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Invoices</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>All payment records — subscriptions, consultations & spotlights</p>
        </div>
        <button className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>
          <Download className="w-3.5 h-3.5" /> Export CSV
        </button>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Revenue', value: `₹${INVOICES.filter(i => i.status === 'Paid').reduce((a, i) => a + i.amount, 0).toLocaleString('en-IN')}`, color: 'bg-emerald-500' },
            { label: 'Paid', value: INVOICES.filter(i => i.status === 'Paid').length, color: 'bg-sky-500' },
            { label: 'Pending', value: INVOICES.filter(i => i.status === 'Pending').length, color: 'bg-amber-500' },
            { label: 'Refunded', value: INVOICES.filter(i => i.status === 'Refunded').length, color: 'bg-slate-500' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}><IndianRupee className="w-4 h-4 text-white" /></div>
              <div><p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p><p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p></div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or invoice ID…"
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
          </div>
          {['All', 'Doctor', 'Hospital', 'Patient'].map(f => (
            <button key={f} onClick={() => setCatFilter(f)} className="text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all"
              style={{ background: catFilter === f ? 'rgba(37,184,154,0.15)' : 'rgba(255,255,255,0.04)', color: catFilter === f ? '#25B89A' : '#64748B', borderColor: catFilter === f ? 'rgba(37,184,154,0.3)' : 'rgba(255,255,255,0.08)' }}>
              {f}
            </button>
          ))}
          {['All', 'Subscription', 'Consultation', 'Spotlight'].map(f => (
            <button key={f} onClick={() => setTypeFilter(f)} className="text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all"
              style={{ background: typeFilter === f ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.04)', color: typeFilter === f ? '#f59e0b' : '#64748B', borderColor: typeFilter === f ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.08)' }}>
              {f}
            </button>
          ))}
        </div>

        <div className="panel-card overflow-hidden">
          <div className="grid grid-cols-[100px_1fr_100px_100px_80px_80px_60px] gap-3 px-4 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b" style={{ color: '#64748B', borderColor: 'rgba(255,255,255,0.05)' }}>
            <span>Invoice ID</span><span>Entity</span><span>Type</span><span>Date</span><span>Amount</span><span>Status</span><span></span>
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
            {filtered.map((inv, i) => {
              const Icon = CAT_ICON[inv.category];
              return (
                <motion.div key={inv.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-[100px_1fr_100px_100px_80px_80px_60px] gap-3 px-4 py-3 items-center hover:bg-white/[0.02] transition-colors">
                  <span className="text-[10px] font-mono" style={{ color: '#25B89A' }}>{inv.id}</span>
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${CAT_COLOR[inv.category]}`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{inv.entity}</span>
                  </div>
                  <span className="text-[10px]" style={{ color: '#94A3B8' }}>{inv.type}</span>
                  <span className="text-[10px]" style={{ color: '#64748B' }}>{inv.date}</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>₹{inv.amount}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[inv.status]}`}>{inv.status}</span>
                  <button className="w-7 h-7 rounded-lg hover:bg-white/5 flex items-center justify-center" style={{ color: '#64748B' }}><Download className="w-3.5 h-3.5" /></button>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
