'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Stethoscope, Search, Eye, Star, CheckCircle2, Clock, Plus, MapPin, Phone } from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';

const DOCTORS = [
  { id: 1, name: 'Dr. Kiran Mehta',    speciality: 'Cardiology',    exp: 14, fee: 1500, rating: 4.9, status: 'Active',  shifts: 'Mon-Fri, 9AM-5PM', phone: '+91 98001 11111' },
  { id: 2, name: 'Dr. Priya Nair',     speciality: 'Dermatology',   exp: 8,  fee: 1000, rating: 4.7, status: 'Active',  shifts: 'Mon-Sat, 10AM-4PM', phone: '+91 98001 22222' },
  { id: 3, name: 'Dr. Rohit Sharma',   speciality: 'Orthopedic',    exp: 12, fee: 1200, rating: 4.6, status: 'On Leave',shifts: 'Tue-Sat, 11AM-6PM', phone: '+91 98001 33333' },
  { id: 4, name: 'Dr. Anjali Gupta',   speciality: 'Gynecology',    exp: 10, fee: 1100, rating: 4.8, status: 'Active',  shifts: 'Mon-Fri, 9AM-3PM',  phone: '+91 98001 44444' },
  { id: 5, name: 'Dr. Suresh Iyer',    speciality: 'Neurology',     exp: 18, fee: 1800, rating: 4.9, status: 'Active',  shifts: 'Mon,Wed,Fri',        phone: '+91 98001 55555' },
  { id: 6, name: 'Dr. Nidhi Verma',    speciality: 'Pediatrics',    exp: 7,  fee: 700,  rating: 4.8, status: 'Active',  shifts: 'Daily, 9AM-1PM',    phone: '+91 98001 66666' },
];

const statusBadge = (s: string) => ({
  'Active':   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  'On Leave': 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  'Inactive': 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
}[s] || '');

export default function HospitalDoctorsPage() {
  const [search, setSearch] = useState('');
  const filtered = DOCTORS.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.speciality.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <PanelSidebar role="hospital" userName="Apollo Hospitals" />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Our Doctors</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Doctors affiliated with your hospital</p>
          </div>
          <button className="flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-xl"
            style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
            <Plus className="w-3.5 h-3.5" /> Add Doctor
          </button>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Stethoscope, label: 'Total Doctors', value: DOCTORS.length,                               color: 'bg-emerald-500' },
              { icon: CheckCircle2,label: 'Active',        value: DOCTORS.filter(d=>d.status==='Active').length, color: 'bg-indigo-500' },
              { icon: Clock,       label: 'On Leave',      value: DOCTORS.filter(d=>d.status==='On Leave').length,color: 'bg-amber-500' },
              { icon: Star,        label: 'Avg Rating',    value: (DOCTORS.reduce((a,d)=>a+d.rating,0)/DOCTORS.length).toFixed(1), color: 'bg-violet-500' },
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
                <input type="text" placeholder="Search doctors…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                  style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
              </div>
              <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{filtered.length} doctors</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Doctor', 'Speciality', 'Experience', 'Fee', 'Rating', 'Shift', 'Status', 'Action'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d, i) => (
                    <motion.tr key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-xs">{d.name.split(' ')[1][0]}</div>
                          <div>
                            <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{d.name}</p>
                            <p style={{ color: 'var(--text-muted)' }}><Phone className="w-3 h-3 inline mr-0.5" />{d.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{d.speciality}</td>
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{d.exp}y</td>
                      <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>₹{d.fee}</td>
                      <td className="px-4 py-3.5"><span className="flex items-center gap-1 text-amber-400 font-bold"><Star className="w-3 h-3 fill-amber-400" />{d.rating}</span></td>
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{d.shifts}</td>
                      <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(d.status)}`}>{d.status}</span></td>
                      <td className="px-4 py-3.5">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: '#25B89A' }}><Eye className="w-3.5 h-3.5" /></button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
