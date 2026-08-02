'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, CreditCard, Download, Loader2, TrendingUp } from 'lucide-react';
import { useHospitalAnalytics } from '@/lib/hospitalAnalytics';

const statusBadge = (s: string) => ({
  Settled: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  Pending: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  Refunded: 'bg-red-500/15 text-red-400 border border-red-500/20',
}[s] || 'bg-slate-500/15 text-slate-400 border border-slate-500/20');

export default function HospitalPaymentsPage() {
  const { analytics, loading, error } = useHospitalAnalytics();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!analytics) {
    return <div className="flex-1 p-6 text-sm text-red-400">{error || 'Payments not found.'}</div>;
  }

  const paymentRows = analytics.payments;
  const totalEarned = paymentRows.filter((item) => item.status === 'Settled').reduce((sum, item) => sum + item.hospital, 0);
  const pending = paymentRows.filter((item) => item.status === 'Pending').reduce((sum, item) => sum + item.hospital, 0);
  const platformRevenue = paymentRows.reduce((sum, item) => sum + item.platform, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Payments</h1>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Live hospital payment and consultation revenue history</p>
        </div>
        <button className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl"
          style={{ color: '#25B89A', background: 'rgba(37,184,154,0.1)', border: '1px solid rgba(37,184,154,0.2)' }}>
          <Download className="w-3.5 h-3.5" /> Export
        </button>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: TrendingUp, label: 'Net Earned', value: `₹${totalEarned.toLocaleString()}`, color: 'bg-emerald-500' },
            { icon: CheckCircle2, label: 'Settled', value: paymentRows.filter((item) => item.status === 'Settled').length, color: 'bg-indigo-500' },
            { icon: Clock, label: 'Pending', value: `₹${pending.toLocaleString()}`, color: 'bg-amber-500' },
            { icon: CreditCard, label: 'Platform Fee', value: `₹${platformRevenue.toLocaleString()}`, color: 'bg-violet-500' },
          ].map((item, index) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
              className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-lg font-extrabold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="panel-card overflow-hidden">
          <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <h3 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>Transaction History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['ID', 'Source', 'Doctor/Entity', 'Dept', 'Date', 'Total', 'Platform', 'Hospital Net', 'Method', 'Status'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paymentRows.map((payment, index) => (
                  <motion.tr key={payment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}
                    className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-3.5" style={{ color: '#25B89A' }}>{payment.id}</td>
                    <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{payment.patient}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{payment.doctor}</td>
                    <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{payment.dept}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{payment.dateLabel}</td>
                    <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>₹{payment.amount.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-red-400">₹{payment.platform.toLocaleString()}</td>
                    <td className="px-4 py-3.5 font-extrabold text-emerald-400">₹{payment.hospital.toLocaleString()}</td>
                    <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{payment.method || 'N/A'}</td>
                    <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(payment.status)}`}>{payment.status}</span></td>
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
