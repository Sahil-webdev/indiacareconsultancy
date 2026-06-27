'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileWarning, Search, CheckCircle2, AlertCircle,
  Clock, Stethoscope, Calendar, Eye, Mail, Download, MoreVertical,
} from 'lucide-react';

const EXPIRING_DOCS = [
  { id: 'ED001', doctor: 'Dr. Nidhi Verma',     docId: 'DR108', type: 'Medical Registration', expiresOn: 'Jun 28, 2026', daysLeft: 7,  status: 'Critical' },
  { id: 'ED002', doctor: 'Dr. Sanjay Gupta',    docId: 'DR103', type: 'MBBS Certificate',     expiresOn: 'Jul 2, 2026',  daysLeft: 11, status: 'Warning' },
  { id: 'ED003', doctor: 'Dr. Aryan Kapoor',    docId: 'DR201', type: 'Medical Registration', expiresOn: 'Jul 5, 2026',  daysLeft: 14, status: 'Warning' },
  { id: 'ED004', doctor: 'Dr. Sheetal Patel',   docId: 'DR202', type: 'Speciality Certificate',expiresOn: 'Jul 10, 2026', daysLeft: 19, status: 'Moderate' },
  { id: 'ED005', doctor: 'Dr. Suresh Babu',     docId: 'DR107', type: 'Medical Registration', expiresOn: 'Jul 15, 2026', daysLeft: 24, status: 'Moderate' },
  { id: 'ED006', doctor: 'Dr. Manish Kumar',    docId: 'DR203', type: 'NABH Accreditation',   expiresOn: 'Jul 20, 2026', daysLeft: 29, status: 'Moderate' },
  { id: 'ED007', doctor: 'Dr. Ritu Singh',      docId: 'DR204', type: 'Practice License',     expiresOn: 'Jul 25, 2026', daysLeft: 34, status: 'Low' },
];

const statusInfo: Record<string, { badge: string; bar: string }> = {
  Critical: { badge: 'bg-red-500/15 text-red-400 border border-red-500/20',       bar: '#ef4444' },
  Warning:  { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/20', bar: '#f59e0b' },
  Moderate: { badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/20', bar: '#f97316' },
  Low:      { badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20', bar: '#22c55e' },
};

export default function ExpiringDocsPage() {
  const [search, setSearch] = useState('');
  const filtered = EXPIRING_DOCS.filter(d =>
    d.doctor.toLowerCase().includes(search.toLowerCase()) ||
    d.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Expiring Documents</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Doctor certifications and licenses expiring in the next 45 days</p>
          </div>
          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-orange-500/15 text-orange-400 border border-orange-500/20">{EXPIRING_DOCS.length} Expiring</span>
        </header>
        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: AlertCircle, label: 'Critical (≤7 days)',  value: EXPIRING_DOCS.filter(d => d.status === 'Critical').length, color: 'bg-red-500' },
              { icon: FileWarning, label: 'Warning (8–14 days)', value: EXPIRING_DOCS.filter(d => d.status === 'Warning').length,  color: 'bg-amber-500' },
              { icon: Clock,       label: 'Moderate (15–30d)',   value: EXPIRING_DOCS.filter(d => d.status === 'Moderate').length, color: 'bg-orange-500' },
              { icon: CheckCircle2,label: 'Low (31–45 days)',    value: EXPIRING_DOCS.filter(d => d.status === 'Low').length,      color: 'bg-emerald-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="panel-card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}><s.icon className="w-4 h-4 text-white" /></div>
                <div><p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p><p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p></div>
              </motion.div>
            ))}
          </div>

          <div className="panel-card overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                <input type="text" placeholder="Search by doctor or document type…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} documents</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['ID', 'Doctor', 'Document Type', 'Expires On', 'Days Left', 'Urgency', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, i) => {
                    const si = statusInfo[d.status];
                    return (
                      <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                        className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-3.5 font-mono text-[10px]" style={{ color: '#25B89A' }}>{d.id}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{d.doctor}</p>
                          <p className="text-[10px] font-mono" style={{ color: '#64748B' }}>{d.docId}</p>
                        </td>
                        <td className="px-4 py-3.5" style={{ color: '#94A3B8' }}>{d.type}</td>
                        <td className="px-4 py-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>{d.expiresOn}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                              <div className="h-full rounded-full" style={{ background: si.bar, width: `${Math.max(8, 100 - (d.daysLeft / 45) * 100)}%` }} />
                            </div>
                            <span className="font-bold" style={{ color: si.bar }}>{d.daysLeft}d</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${si.badge}`}>{d.status}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button className="flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-lg"
                              style={{ background: 'rgba(37,184,154,0.1)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}>
                              <Mail className="w-3 h-3" /> Remind
                            </button>
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: '#64748B' }}>
                              <Eye className="w-3.5 h-3.5" />
                            </button>
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
