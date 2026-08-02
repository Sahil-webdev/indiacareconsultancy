'use client';

import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Loader2,
  MessageSquare,
  RefreshCw,
  Video,
  Building2,
  XCircle,
} from 'lucide-react';
import { panelApi } from '@/lib/api';
import { HospitalAnalyticsAppointment, useHospitalAnalytics } from '@/lib/hospitalAnalytics';

const STATUS_OPTIONS = [
  'Requested',
  'Awaiting Doctor Confirmation',
  'Awaiting Patient Confirmation',
  'Confirmed',
  'Rescheduled',
  'Completed',
  'Cancelled by Patient',
  'Cancelled by Doctor',
  'No-show',
] as const;

const statusBadge = (s: string) => ({
  Confirmed: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  Requested: 'bg-sky-500/15 text-sky-400 border border-sky-500/20',
  'Awaiting Doctor Confirmation': 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  'Awaiting Patient Confirmation': 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  Rescheduled: 'bg-violet-500/15 text-violet-400 border border-violet-500/20',
  Completed: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
  'Cancelled by Patient': 'bg-red-500/15 text-red-400 border border-red-500/20',
  'Cancelled by Doctor': 'bg-red-500/15 text-red-400 border border-red-500/20',
  'No-show': 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
}[s] || 'bg-slate-500/15 text-slate-400 border border-slate-500/20');

export default function HospitalAppointmentsPage() {
  const { analytics, loading, error, reload } = useHospitalAnalytics();
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState<HospitalAnalyticsAppointment | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const appointments = analytics?.appointments || [];
  const filtered = useMemo(
    () => appointments.filter((item) => (statusFilter ? item.status === statusFilter : true)),
    [appointments, statusFilter]
  );

  const updateStatus = async (appointmentId: string, workflowStatus: string) => {
    try {
      setUpdatingId(appointmentId);
      setActionError('');
      await panelApi(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ workflowStatus }),
      });
      await reload();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to update appointment');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!analytics) {
    return <div className="flex-1 p-6 text-sm text-red-400">{error || 'Appointments not found.'}</div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Appointments</h1>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Live booked consultations assigned to your hospital</p>
        </div>
        <button
          onClick={() => reload()}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl"
          style={{ color: '#25B89A', background: 'rgba(37,184,154,0.1)', border: '1px solid rgba(37,184,154,0.2)' }}
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        {actionError && (
          <div className="mb-4 rounded-2xl px-4 py-3 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {actionError}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: CheckCircle2, label: 'Confirmed', value: analytics.stats.confirmedAppointments, color: 'bg-emerald-500' },
            { icon: Clock, label: 'Pending', value: analytics.stats.pendingAppointments, color: 'bg-amber-500' },
            { icon: Calendar, label: 'Completed', value: analytics.stats.completedAppointments, color: 'bg-indigo-500' },
            { icon: XCircle, label: 'Cancelled', value: analytics.stats.cancelledAppointments, color: 'bg-red-500' },
          ].map((item, index) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="panel-card p-4 flex items-center gap-3 cursor-pointer"
              onClick={() => setStatusFilter(item.label === statusFilter ? '' : item.label)}>
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="panel-card overflow-hidden">
          <div className="flex flex-wrap items-center gap-2 p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <button
              onClick={() => setStatusFilter('')}
              className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
              style={!statusFilter ? { background: 'rgba(18,122,106,0.25)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' } : { color: 'var(--text-muted)', background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)' }}
            >
              All
            </button>
            {STATUS_OPTIONS.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                style={statusFilter === status ? { background: 'rgba(18,122,106,0.25)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' } : { color: 'var(--text-muted)', background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)' }}
              >
                {status}
              </button>
            ))}
            <span className="text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>{filtered.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['ID', 'Patient', 'Doctor', 'Speciality', 'Date & Time', 'Mode', 'Fee', 'Status', 'Actions'].map((heading) => (
                    <th key={heading} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((appointment, index) => (
                  <motion.tr key={appointment.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.03 }}
                    className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-3.5" style={{ color: '#25B89A' }}>{appointment.id}</td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{appointment.patient}</p>
                      <p style={{ color: 'var(--text-muted)' }}>{appointment.patientPhone}</p>
                    </td>
                    <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{appointment.doctor}</td>
                    <td className="px-4 py-3.5" style={{ color: 'var(--text-secondary)' }}>{appointment.speciality}</td>
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{appointment.dateLabel}</p>
                      <p style={{ color: 'var(--text-muted)' }}>{appointment.time}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={appointment.mode === 'Video' ? { color: '#38BDF8', background: 'rgba(56,189,248,0.1)' } : { color: '#94A3B8', background: 'rgba(148,163,184,0.1)' }}>
                        {appointment.mode === 'Video' ? <Video className="w-3 h-3" /> : <Building2 className="w-3 h-3" />} {appointment.mode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>₹{appointment.fee}</td>
                    <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(appointment.status)}`}>{appointment.status}</span></td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(appointment)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: '#25B89A' }}>
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <select
                          value={appointment.status}
                          disabled={updatingId === appointment.id}
                          onChange={(e) => updateStatus(appointment.id, e.target.value)}
                          className="px-2 py-1 rounded-lg text-[10px] bg-slate-900 border border-white/10 text-white"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {selected && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setSelected(null)}>
            <div className="panel-card w-full max-w-2xl p-6 space-y-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-lg">Appointment Details</h3>
                  <p className="text-xs text-slate-400">Hospital-side live appointment record</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="panel-card p-4">
                  <p className="text-slate-400 mb-1">Patient</p>
                  <p className="font-bold text-white">{selected.patient}</p>
                  <p className="text-slate-400 mt-1">{selected.patientPhone}</p>
                  <p className="text-slate-400">{selected.patientEmail || 'No email'}</p>
                </div>
                <div className="panel-card p-4">
                  <p className="text-slate-400 mb-1">Doctor</p>
                  <p className="font-bold text-white">{selected.doctor}</p>
                  <p className="text-slate-400 mt-1">{selected.speciality}</p>
                  <p className="text-slate-400">{selected.dateLabel} · {selected.time}</p>
                </div>
                <div className="panel-card p-4">
                  <p className="text-slate-400 mb-1">Concern</p>
                  <p className="text-white leading-relaxed">{selected.concern || 'No concern added'}</p>
                </div>
                <div className="panel-card p-4">
                  <p className="text-slate-400 mb-1">Admin Note</p>
                  <p className="text-white leading-relaxed">{selected.adminNote || 'No internal note'}</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(selected.status)}`}>{selected.status}</span>
                <button
                  onClick={async () => {
                    await panelApi(`/api/appointments/${selected.id}/actions`, {
                      method: 'POST',
                      body: JSON.stringify({ action: 'send_reminder' }),
                    });
                    setSelected(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Send Reminder
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
