'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCog, Search, CheckCircle2, XCircle, Clock,
  Eye, ArrowRight, Stethoscope, Building2, MapPin,
} from 'lucide-react';

const CHANGE_REQUESTS = [
  {
    id: 'PCR001', doctor: 'Dr. Suresh Babu', docId: 'DR107', field: 'Speciality',
    from: 'General Physician', to: 'Orthopedic Surgeon', reason: 'Completed MS Orthopedic from AIIMS 2023', submitted: 'Jun 20, 2026', city: 'Bengaluru',
  },
  {
    id: 'PCR002', doctor: 'Dr. Nidhi Verma', docId: 'DR108', field: 'Hospital',
    from: 'Rainbow Children, Hyderabad', to: 'Apollo Hospitals, Delhi', reason: 'Relocated to Delhi', submitted: 'Jun 19, 2026', city: 'Hyderabad → Delhi',
  },
  {
    id: 'PCR003', doctor: 'Dr. Priya Patel', docId: 'DR102', field: 'Consultation Fee',
    from: '₹1,200', to: '₹1,800', reason: 'Annual fee revision as per market rate', submitted: 'Jun 18, 2026', city: 'Mumbai',
  },
  {
    id: 'PCR004', doctor: 'Dr. Vikranth Reddy', docId: 'DR104', field: 'Experience',
    from: '10 years', to: '12 years', reason: 'Updated work history with 2 new positions', submitted: 'Jun 18, 2026', city: 'Hyderabad',
  },
  {
    id: 'PCR005', doctor: 'Dr. Anjali Menon', docId: 'DR105', field: 'Profile Photo',
    from: 'Old photo (2020)', to: 'New professional photo (2026)', reason: 'Updated professional headshot', submitted: 'Jun 17, 2026', city: 'Mumbai',
  },
];

const fieldColor = (f: string) => ({
  'Speciality': 'bg-amber-400/10 text-amber-400',
  'Hospital': 'bg-violet-400/10 text-violet-400',
  'Consultation Fee': 'bg-emerald-400/10 text-emerald-400',
  'Experience': 'bg-sky-400/10 text-sky-400',
  'Profile Photo': 'bg-pink-400/10 text-pink-400',
}[f] || 'bg-slate-400/10 text-slate-400');

export default function ProfileChangesPage() {
  const [search, setSearch] = useState('');
  const filtered = CHANGE_REQUESTS.filter(r =>
    r.doctor.toLowerCase().includes(search.toLowerCase()) ||
    r.field.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Profile Change Requests</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Review doctor profile update requests before publishing</p>
          </div>
          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-sky-500/15 text-sky-400 border border-sky-500/20">{CHANGE_REQUESTS.length} Pending</span>
        </header>
        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Clock,        label: 'Pending Review', value: 5, color: 'bg-sky-500' },
              { icon: CheckCircle2, label: 'Approved Today', value: 2, color: 'bg-emerald-500' },
              { icon: XCircle,      label: 'Rejected',       value: 0, color: 'bg-red-500' },
              { icon: UserCog,      label: 'This Month',     value: 18, color: 'bg-indigo-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="panel-card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}><s.icon className="w-4 h-4 text-white" /></div>
                <div><p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p><p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p></div>
              </motion.div>
            ))}
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
              <input type="text" placeholder="Search change requests…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                style={{ background: 'var(--bg-surface)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {filtered.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="panel-card p-5">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/15 text-sky-400 flex items-center justify-center font-black text-sm flex-shrink-0">
                    {r.doctor.split(' ')[1][0]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{r.doctor}</span>
                      <span className="text-[10px] font-mono" style={{ color: '#25B89A' }}>{r.docId}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${fieldColor(r.field)}`}>{r.field}</span>
                      <span className="text-[10px]" style={{ color: '#64748B' }}>· {r.city} · {r.submitted}</span>
                    </div>
                    {/* Before → After comparison */}
                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <div className="flex-1 min-w-[120px] rounded-xl p-3" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-red-400">Before</p>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{r.from}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 flex-shrink-0" style={{ color: '#64748B' }} />
                      <div className="flex-1 min-w-[120px] rounded-xl p-3" style={{ background: 'rgba(37,184,154,0.05)', border: '1px solid rgba(37,184,154,0.15)' }}>
                        <p className="text-[9px] font-black uppercase tracking-widest mb-1 text-emerald-400">After</p>
                        <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{r.to}</p>
                      </div>
                    </div>
                    <p className="text-xs mt-2 flex items-start gap-1.5" style={{ color: '#94A3B8' }}>
                      <span className="text-[10px] font-black uppercase tracking-widest flex-shrink-0 mt-0.5" style={{ color: '#2D4150' }}>Reason:</span>
                      {r.reason}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-shrink-0 ml-2">
                    <button className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <CheckCircle2 className="w-3 h-3" /> Approve
                    </button>
                    <button className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </main>
      </div>
  );
}
