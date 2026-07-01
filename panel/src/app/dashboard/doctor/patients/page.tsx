'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Eye, Phone, MapPin, Calendar, Heart, FileText } from 'lucide-react';

const PATIENTS = [
  { id: 1, name: 'Rahul Sharma',  age: 34, gender: 'Male',   phone: '+91 98765 43299', city: 'Delhi',     lastVisit: 'Jun 18, 2026', visits: 4,  diagnosis: 'Hypertension',     status: 'Active' },
  { id: 2, name: 'Kavya Reddy',   age: 28, gender: 'Female', phone: '+91 65432 10098', city: 'Bengaluru', lastVisit: 'Jun 15, 2026', visits: 2,  diagnosis: 'Arrhythmia',       status: 'Active' },
  { id: 3, name: 'Mohan Verma',   age: 52, gender: 'Male',   phone: '+91 54321 00987', city: 'Hyderabad', lastVisit: 'Jun 12, 2026', visits: 7,  diagnosis: 'Coronary Artery',  status: 'Critical' },
  { id: 4, name: 'Sunita Joshi',  age: 40, gender: 'Female', phone: '+91 43210 09876', city: 'Jaipur',    lastVisit: 'Jun 10, 2026', visits: 1,  diagnosis: 'Palpitations',     status: 'Active' },
  { id: 5, name: 'Deepak Singh',  age: 45, gender: 'Male',   phone: '+91 32100 98765', city: 'Chennai',   lastVisit: 'Jun 8, 2026',  visits: 3,  diagnosis: 'Heart Failure',    status: 'Monitoring' },
  { id: 6, name: 'Anita Mehta',   age: 37, gender: 'Female', phone: '+91 21009 87654', city: 'Delhi',     lastVisit: 'Jun 5, 2026',  visits: 5,  diagnosis: 'Valve Disorder',   status: 'Stable' },
];

const statusBadge = (s: string) => ({
  Active:     'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  Critical:   'bg-red-500/15 text-red-400 border border-red-500/20',
  Monitoring: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  Stable:     'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
}[s] || '');

export default function DoctorPatientsPage() {
  const [search, setSearch] = useState('');
  const filtered = PATIENTS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.diagnosis.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>My Patients</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>All patients under your care</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Users,    label: 'Total Patients', value: PATIENTS.length,                                    color: 'bg-indigo-500' },
              { icon: Heart,    label: 'Active',         value: PATIENTS.filter(p=>p.status==='Active').length,     color: 'bg-emerald-500' },
              { icon: Heart,    label: 'Critical',       value: PATIENTS.filter(p=>p.status==='Critical').length,   color: 'bg-red-500' },
              { icon: Calendar, label: 'Avg. Visits',    value: Math.round(PATIENTS.reduce((a,p)=>a+p.visits,0)/PATIENTS.length), color: 'bg-amber-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="panel-card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="panel-card overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Search patients or diagnosis…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                  style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{filtered.length} patients</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Patient', 'Contact', 'City', 'Diagnosis', 'Visits', 'Last Visit', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b transition-colors" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs">{p.name[0]}</div>
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{p.name}</p>
                            <p style={{ color: 'var(--text-muted)' }}>{p.age}y · {p.gender}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><Phone className="w-3 h-3" />{p.phone}</span></td>
                      <td className="px-4 py-3.5"><span className="flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><MapPin className="w-3 h-3" />{p.city}</span></td>
                      <td className="px-4 py-3.5 font-semibold" style={{ color: 'var(--text-primary)' }}>{p.diagnosis}</td>
                      <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>{p.visits}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{p.lastVisit}</td>
                      <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(p.status)}`}>{p.status}</span></td>
                      <td className="px-4 py-3.5">
                        <div className="flex gap-1">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: '#25B89A' }}><Eye className="w-3.5 h-3.5" /></button>
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: 'var(--text-muted)' }}><FileText className="w-3.5 h-3.5" /></button>
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
