'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Users, Calendar, Star, Stethoscope, ArrowUpRight } from 'lucide-react';

const SPECIALITY = [
  { name: 'Cardiology',  apts: 84, revenue: 126000, pct: 95, rating: 4.9 },
  { name: 'Orthopedic',  apts: 72, revenue: 86400,  pct: 82, rating: 4.6 },
  { name: 'Gynecology',  apts: 60, revenue: 66000,  pct: 76, rating: 4.8 },
  { name: 'Neurology',   apts: 42, revenue: 75600,  pct: 60, rating: 4.9 },
  { name: 'Dermatology', apts: 55, revenue: 55000,  pct: 70, rating: 4.7 },
  { name: 'Pediatrics',  apts: 48, revenue: 33600,  pct: 64, rating: 4.8 },
];

const MONTHLY = [
  { m: 'Jan', apts: 48, revenue: 68000 },
  { m: 'Feb', apts: 62, revenue: 87000 },
  { m: 'Mar', apts: 74, revenue: 105000 },
  { m: 'Apr', apts: 67, revenue: 94000 },
  { m: 'May', apts: 89, revenue: 128000 },
  { m: 'Jun', apts: 21, revenue: 31000 },
];

const maxApts = Math.max(...MONTHLY.map(m => m.apts));

export default function HospitalReportsPage() {
  return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Reports</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Hospital performance metrics and analytics</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* KPI */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { icon: Calendar,    label: 'Total Appointments', value: '361',  change: '+22%', color: 'bg-indigo-500' },
              { icon: Users,       label: 'Patients Served',    value: '284',  change: '+18%', color: 'bg-emerald-500' },
              { icon: Stethoscope, label: 'Active Doctors',     value: '6',    change: '+1',   color: 'bg-violet-500' },
              { icon: Star,        label: 'Avg. Rating',        value: '4.78', change: '+0.1', color: 'bg-amber-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="panel-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-8 h-8 rounded-xl ${s.color} flex items-center justify-center`}>
                    <s.icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-[10px] font-bold flex items-center gap-0.5 text-emerald-400">
                    <ArrowUpRight className="w-3 h-3" />{s.change}
                  </span>
                </div>
                <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Monthly appointments bar chart */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="panel-card p-5">
              <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Monthly Appointments
              </h3>
              <div className="flex items-end gap-3" style={{ height: '120px' }}>
                {MONTHLY.map((m, i) => {
                  const pct = (m.apts / maxApts) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                      <p className="text-[9px] font-bold" style={{ color: '#25B89A' }}>{m.apts}</p>
                      <div className="w-full rounded-t-xl relative" style={{ height: '80px', background: 'var(--bg-surface-3)' }}>
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: `${pct}%` }}
                          transition={{ delay: 0.3 + i * 0.08, duration: 0.7 }}
                          className="absolute bottom-0 left-0 right-0 rounded-t-xl"
                          style={{ background: 'linear-gradient(180deg,#25B89A,#127A6A)' }}
                        />
                      </div>
                      <p className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>{m.m}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Rating by dept */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="panel-card p-5">
              <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <Star className="w-4 h-4 text-amber-400" /> Department Ratings
              </h3>
              <div className="flex flex-col gap-3">
                {SPECIALITY.map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{s.name}</span>
                      <span className="text-xs font-bold text-amber-400">{s.rating}★</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-surface-3)' }}>
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${((s.rating - 4) / 1) * 100}%` }}
                        transition={{ delay: 0.4 + i * 0.07, duration: 0.7 }}
                        className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg,#f59e0b,#fbbf24)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Speciality table */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="panel-card overflow-hidden">
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
              <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <BarChart2 className="w-4 h-4 text-emerald-400" /> Performance by Department
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    {['Department', 'Appointments', 'Revenue', 'Rating', 'Fill Rate'].map(h => (
                      <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SPECIALITY.map((s, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                      className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                      <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>{s.name}</td>
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{s.apts}</td>
                      <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>₹{s.revenue.toLocaleString()}</td>
                      <td className="px-4 py-3.5 text-amber-400 font-bold">{s.rating}★</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--bg-surface-3)', maxWidth: 80 }}>
                            <motion.div initial={{ width: 0 }} animate={{ width: `${s.pct}%` }}
                              transition={{ delay: 0.5 + i * 0.06, duration: 0.7 }}
                              className="h-full rounded-full" style={{ background: '#25B89A' }} />
                          </div>
                          <span className="text-emerald-400 font-bold">{s.pct}%</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>
    );
}
