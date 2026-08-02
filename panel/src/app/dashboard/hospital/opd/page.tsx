'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle2, Clock, Edit3, FileText, Loader2, Save, Stethoscope, X } from 'lucide-react';
import { useHospitalAnalytics } from '@/lib/hospitalAnalytics';
import { panelApi } from '@/lib/api';

const statusBadge = (s: string) => ({
  Open: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
  Full: 'bg-red-500/15 text-red-500 border border-red-500/30',
  Closed: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
}[s] || 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30');

export default function HospitalOPDPage() {
  const { analytics, loading, error } = useHospitalAnalytics();
  const [editing, setEditing] = React.useState<null | { id: string; doctor: string; opdTimings: string; consultationFee: number }>(null);
  const [saving, setSaving] = React.useState(false);
  const [actionError, setActionError] = React.useState('');

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!analytics) {
    return <div className="flex-1 p-6 text-sm text-red-400">{error || 'OPD schedule not found.'}</div>;
  }

  const opdList = analytics.opdSchedules;
  const totalSlots = opdList.reduce((acc, curr) => acc + curr.slots, 0);
  const totalBooked = opdList.reduce((acc, curr) => acc + curr.booked, 0);
  const openCount = opdList.filter((item) => item.status === 'Open').length;
  const fullCount = opdList.filter((item) => item.status === 'Full').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0" style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="font-black text-xl tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Clock className="w-5 h-5" style={{ color: '#25B89A' }} /> OPD Timings &amp; Schedules
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Live OPD overview derived from affiliated doctors and active hospital appointments</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6 space-y-6">
        {actionError && (
          <div className="rounded-2xl px-4 py-3 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {actionError}
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: FileText, label: 'OPD Doctors', value: opdList.length, color: 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/20' },
            { icon: CheckCircle2, label: 'Open OPDs', value: openCount, color: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' },
            { icon: Clock, label: 'Full / At Cap', value: fullCount, color: 'bg-red-500/15 text-red-500 border border-red-500/20' },
            { icon: Calendar, label: 'Booked Slots', value: `${totalBooked} / ${totalSlots}`, color: 'bg-amber-500/15 text-amber-500 border border-amber-500/20' },
          ].map((item, index) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}
              className="panel-card p-4 flex items-center gap-3.5">
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {opdList.length === 0 ? (
            <div className="panel-card p-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No doctor schedules are available for this hospital yet.
            </div>
          ) : (
            opdList.map((slot, index) => (
              <motion.div key={slot.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}
                className="panel-card p-5">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-extrabold text-sm text-white">{slot.dept}</h3>
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(slot.status)}`}>{slot.status}</span>
                    </div>
                    <p className="text-xs mt-1" style={{ color: '#94A3B8' }}>{slot.doctor}</p>
                    <p className="text-[11px] mt-1" style={{ color: '#64748B' }}>{slot.days}</p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0">
                    {[
                      { label: 'Shift', value: slot.days },
                      { label: 'Timings', value: slot.start === slot.end ? slot.start : `${slot.start} - ${slot.end}` },
                      { label: 'Booked', value: String(slot.booked) },
                      { label: 'Capacity', value: String(slot.slots) },
                    ].map((item) => (
                      <div key={item.label} className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-[10px]" style={{ color: '#64748B' }}>{item.label}</p>
                        <p className="text-xs font-bold text-white mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex justify-between text-[10px] mb-1.5" style={{ color: '#94A3B8' }}>
                    <span>Current booking load</span>
                    <span>{slot.booked}/{slot.slots}</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${slot.slots ? Math.min(100, (slot.booked / slot.slots) * 100) : 0}%`,
                        background: slot.status === 'Full' ? '#ef4444' : slot.status === 'Closed' ? '#64748b' : '#22c55e',
                      }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                  <p className="text-[11px]" style={{ color: '#94A3B8' }}>
                    {slot.isHospitalManaged
                      ? 'Ye hospital-managed doctor hai. Iska OPD yahin hospital panel se manage hoga.'
                      : 'Independent affiliated doctor schedule overview'}
                  </p>
                  {slot.isHospitalManaged && (
                    <button
                      type="button"
                      onClick={() => {
                        setActionError('');
                        setEditing({
                          id: slot.id,
                          doctor: slot.doctor,
                          opdTimings: slot.days || slot.start || '',
                          consultationFee: Number(slot.consultationFee || 0),
                        });
                      }}
                      className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950 flex items-center gap-2"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit OPD Timing
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>

        <div className="panel-card p-5">
          <h3 className="font-extrabold text-sm mb-3 text-white flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-emerald-400" /> OPD Insight
          </h3>
          <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>
            Ye page ab live affiliated doctor timings aur hospital appointment load se auto-generate ho raha hai.
            Agar kisi doctor ka `opdTimings` ya appointment load change hota hai, toh yahan updated schedule aur booking pressure reflect hoga.
          </p>
        </div>

        {editing && (
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => !saving && setEditing(null)}>
            <div className="panel-card w-full max-w-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-extrabold text-white text-lg">Edit Hospital Managed Doctor</h3>
                  <p className="text-xs text-slate-400">{editing.doctor}</p>
                </div>
                <button onClick={() => !saving && setEditing(null)} className="text-slate-400 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">OPD Timings / Shift Label</label>
                <input
                  value={editing.opdTimings}
                  onChange={(e) => setEditing({ ...editing, opdTimings: e.target.value })}
                  placeholder="e.g. Mon-Sat 9:00 AM - 5:00 PM"
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Consultation Fee</label>
                <input
                  type="number"
                  value={editing.consultationFee}
                  onChange={(e) => setEditing({ ...editing, consultationFee: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10"
                />
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  try {
                    setSaving(true);
                    setActionError('');
                    await panelApi(`/api/hospitals/me/doctors/${editing.id}`, {
                      method: 'PATCH',
                      body: JSON.stringify({
                        opdTimings: editing.opdTimings,
                        consultationFee: editing.consultationFee,
                      }),
                    });
                    setEditing(null);
                    window.location.reload();
                  } catch (err) {
                    setActionError(err instanceof Error ? err.message : 'Failed to update OPD timing');
                  } finally {
                    setSaving(false);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
