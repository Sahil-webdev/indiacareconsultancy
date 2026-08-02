'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, BarChart2, Calendar, Loader2, Star, Stethoscope, TrendingUp, Users } from 'lucide-react';
import { useHospitalAnalytics } from '@/lib/hospitalAnalytics';

export default function HospitalReportsPage() {
  const { analytics, loading, error } = useHospitalAnalytics();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!analytics) {
    return <div className="flex-1 p-6 text-sm text-red-400">{error || 'Reports not available.'}</div>;
  }

  const monthly = analytics.monthly;
  const departments = analytics.departments;
  const maxApts = Math.max(...monthly.map((item) => item.appointments), 1);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Reports</h1>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Live hospital performance metrics and analytics</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Calendar, label: 'Total Appointments', value: analytics.stats.totalAppointments, change: `+${analytics.stats.todayAppointments} today`, color: 'bg-indigo-500' },
            { icon: Users, label: 'Patients Served', value: analytics.stats.patientsServed, change: `${analytics.stats.activeDoctors} active doctors`, color: 'bg-emerald-500' },
            { icon: Stethoscope, label: 'Departments', value: analytics.profile.departments.length, change: `${analytics.stats.pendingAppointments} pending`, color: 'bg-violet-500' },
            { icon: Star, label: 'Avg. Rating', value: analytics.stats.averageRating.toFixed(2), change: `${analytics.profile.rating.toFixed(1)} profile`, color: 'bg-amber-500' },
          ].map((item, index) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
              className="panel-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center`}>
                  <item.icon className="w-4 h-4 text-white" />
                </div>
                <span className="text-[10px] font-bold flex items-center gap-0.5 text-emerald-400">
                  <ArrowUpRight className="w-3 h-3" />{item.change}
                </span>
              </div>
              <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel-card p-5">
            <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <TrendingUp className="w-4 h-4 text-emerald-400" /> Monthly Appointments
            </h3>
            <div className="flex items-end gap-3" style={{ height: '120px' }}>
              {monthly.map((item, index) => {
                const pct = (item.appointments / maxApts) * 100;
                return (
                  <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                    <p className="text-[9px] font-bold" style={{ color: '#25B89A' }}>{item.appointments}</p>
                    <div className="w-full rounded-t-xl relative" style={{ height: '80px', background: 'var(--bg-surface-3)' }}>
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${pct}%` }}
                        transition={{ delay: 0.2 + index * 0.08, duration: 0.7 }}
                        className="absolute bottom-0 left-0 right-0 rounded-t-xl"
                        style={{ background: 'linear-gradient(180deg,#25B89A,#127A6A)' }}
                      />
                    </div>
                    <p className="text-[9px] font-semibold" style={{ color: 'var(--text-muted)' }}>{item.month.split(' ')[0]}</p>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel-card p-5">
            <h3 className="font-extrabold text-sm mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Star className="w-4 h-4 text-amber-400" /> Department Ratings
            </h3>
            <div className="flex flex-col gap-3">
              {departments.slice(0, 6).map((item, index) => (
                <div key={item.name}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                    <span className="text-xs font-bold text-amber-400">{item.rating.toFixed(1)}★</span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'var(--bg-surface-3)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, ((item.rating - 3.5) / 1.5) * 100)}%` }}
                      transition={{ delay: 0.2 + index * 0.07, duration: 0.7 }}
                      className="h-full rounded-full"
                      style={{ background: 'linear-gradient(90deg,#f59e0b,#fbbf24)' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel-card overflow-hidden">
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <BarChart2 className="w-4 h-4 text-emerald-400" /> Performance by Department
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Department', 'Appointments', 'Revenue', 'Rating', 'Fill Rate'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {departments.map((item, index) => (
                  <motion.tr key={item.name} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.04 }}
                    className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>{item.name}</td>
                    <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{item.appointments}</td>
                    <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>₹{item.revenue.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-amber-400 font-bold">{item.rating.toFixed(1)}★</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--bg-surface-3)', maxWidth: 80 }}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${item.fillRate}%` }}
                            transition={{ delay: 0.2 + index * 0.06, duration: 0.7 }}
                            className="h-full rounded-full" style={{ background: '#25B89A' }} />
                        </div>
                        <span className="text-emerald-400 font-bold">{item.fillRate}%</span>
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
