'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Clock, Edit2, CheckCircle2, Plus, Trash2, X, Loader2, AlertCircle,
  Stethoscope, Calendar, Save, Check
} from 'lucide-react';
import { panelApi } from '@/lib/api';

interface OPDSlot {
  id: string | number;
  dept: string;
  doctor: string;
  days: string;
  start: string;
  end: string;
  slots: number;
  booked: number;
  status: 'Open' | 'Full' | 'Closed';
}

const DEFAULT_OPD_SLOTS: OPDSlot[] = [
  { id: 1, dept: 'Cardiology',      doctor: 'Dr. Kiran Mehta',    days: 'Mon–Fri',     start: '09:00 AM', end: '05:00 PM', slots: 20, booked: 14, status: 'Open' },
  { id: 2, dept: 'Gynecology',      doctor: 'Dr. Anjali Gupta',   days: 'Mon–Fri',     start: '09:00 AM', end: '03:00 PM', slots: 15, booked: 10, status: 'Open' },
  { id: 3, dept: 'Orthopedics',     doctor: 'Dr. Rohit Sharma',   days: 'Tue–Sat',     start: '11:00 AM', end: '06:00 PM', slots: 18, booked: 18, status: 'Full' },
  { id: 4, dept: 'Neurology',       doctor: 'Dr. Suresh Iyer',    days: 'Mon,Wed,Fri', start: '10:00 AM', end: '02:00 PM', slots: 10, booked: 6,  status: 'Open' },
  { id: 5, dept: 'Dermatology',     doctor: 'Dr. Priya Nair',     days: 'Mon–Sat',     start: '10:00 AM', end: '04:00 PM', slots: 16, booked: 9,  status: 'Open' },
  { id: 6, dept: 'Pediatrics',      doctor: 'Dr. Nidhi Verma',    days: 'Daily',       start: '09:00 AM', end: '01:00 PM', slots: 12, booked: 7,  status: 'Open' },
];

const statusBadge = (s: string) => ({
  Open:   'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
  Full:   'bg-red-500/15 text-red-500 border border-red-500/30',
  Closed: 'bg-slate-500/15 text-slate-400 border border-slate-500/30',
}[s] || 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30');

export default function HospitalOPDPage() {
  const [opdList, setOpdList] = useState<OPDSlot[]>(DEFAULT_OPD_SLOTS);
  const [doctorsList, setDoctorsList] = useState<{ id: string | number; name: string; speciality: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal States
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<OPDSlot | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState<{
    dept: string;
    doctor: string;
    days: string;
    start: string;
    end: string;
    slots: number;
    booked: number;
    status: 'Open' | 'Full' | 'Closed';
  }>({
    dept: 'Cardiology',
    doctor: '',
    days: 'Mon–Fri',
    start: '09:00 AM',
    end: '05:00 PM',
    slots: 20,
    booked: 0,
    status: 'Open',
  });

  // Fetch hospital doctors & existing OPD configuration from backend if available
  useEffect(() => {
    panelApi<{ success: boolean; doctors: { id: string | number; name: string; speciality: string }[] }>('/api/hospitals/me/doctors')
      .then(res => {
        if (res.success && Array.isArray(res.doctors) && res.doctors.length > 0) {
          setDoctorsList(res.doctors);
        }
      })
      .catch(() => {});
  }, []);

  const handleOpenAddModal = () => {
    setError('');
    setEditingSlot(null);
    setForm({
      dept: 'Cardiology',
      doctor: doctorsList.length > 0 ? doctorsList[0].name : '',
      days: 'Mon–Fri',
      start: '09:00 AM',
      end: '05:00 PM',
      slots: 20,
      booked: 0,
      status: 'Open',
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (slot: OPDSlot) => {
    setError('');
    setEditingSlot(slot);
    setForm({
      dept: slot.dept,
      doctor: slot.doctor,
      days: slot.days,
      start: slot.start,
      end: slot.end,
      slots: slot.slots,
      booked: slot.booked,
      status: slot.status,
    });
    setModalOpen(true);
  };

  const handleDeleteSlot = (id: string | number, dept: string) => {
    if (!confirm(`Are you sure you want to remove the OPD timing schedule for ${dept}?`)) return;
    setOpdList(prev => prev.filter(item => item.id !== id));
    setSuccess(`OPD schedule for ${dept} deleted successfully.`);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.dept.trim() || !form.days.trim()) {
      setError('Please fill in department name and OPD operating days.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let docName = form.doctor.trim();
      if (!docName) {
        docName = `${form.dept} Specialist Team`;
      } else if (!/^Dr\.\s*/i.test(docName) && !docName.toLowerCase().includes('team')) {
        docName = `Dr. ${docName.replace(/\b(\w)/g, (ch) => ch.toUpperCase())}`;
      }

      if (editingSlot) {
        setOpdList(prev => prev.map(item => item.id === editingSlot.id ? { ...item, ...form, doctor: docName } : item));
        setSuccess(`OPD schedule for ${form.dept} updated successfully!`);
      } else {
        const newSlot: OPDSlot = {
          id: Date.now(),
          ...form,
          doctor: docName,
        };
        setOpdList(prev => [newSlot, ...prev]);
        setSuccess(`New OPD schedule for ${form.dept} added!`);
      }
      setModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save OPD schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const totalSlots = opdList.reduce((acc, curr) => acc + curr.slots, 0);
  const totalBooked = opdList.reduce((acc, curr) => acc + curr.booked, 0);
  const openCount = opdList.filter(item => item.status === 'Open').length;
  const fullCount = opdList.filter(item => item.status === 'Full').length;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0" style={{ background: 'var(--bg-app)', color: 'var(--text-primary)' }}>
      
      {/* ── HEADER ── */}
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="font-black text-xl tracking-tight flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Clock className="w-5 h-5" style={{ color: '#25B89A' }} /> OPD Timings &amp; Schedules
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Manage outpatient department schedules, operating hours, and daily slots</p>
        </div>
        <button
          type="button"
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 text-xs font-black text-white px-4 py-2.5 rounded-xl shadow-lg transition-all cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #127A6A 0%, #075E52 100%)' }}
        >
          <Plus className="w-4 h-4 text-white" /> Add OPD Slot
        </button>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 overflow-y-auto panel-scroll p-6 space-y-6">
        
        {/* Alerts */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between p-3.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e' }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                {success}
              </div>
              <button onClick={() => setSuccess('')} className="hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-between p-3.5 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                {error}
              </div>
              <button onClick={() => setError('')} className="hover:opacity-70">
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── STATS CARDS ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: FileText,     label: 'OPD Departments', value: opdList.length, color: 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/20' },
            { icon: CheckCircle2, label: 'Open OPDs',       value: openCount,      color: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20' },
            { icon: Clock,        label: 'Full / At Cap',   value: fullCount,      color: 'bg-red-500/15 text-red-500 border border-red-500/20' },
            { icon: Calendar,     label: 'Daily Slots',     value: `${totalBooked} / ${totalSlots}`, color: 'bg-amber-500/15 text-amber-500 border border-amber-500/20' },
          ].map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="panel-card p-4 flex items-center gap-3.5"
            >
              <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-[11px] font-medium" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── OPD SCHEDULES LIST ── */}
        <div className="flex flex-col gap-4">
          {opdList.length === 0 ? (
            <div className="panel-card p-12 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No OPD schedules added yet. Click <strong>Add OPD Slot</strong> to configure operating hours for departments.
            </div>
          ) : (
            opdList.map((opd, i) => {
              const fillPct = opd.slots > 0 ? Math.round((opd.booked / opd.slots) * 100) : 0;
              return (
                <motion.div
                  key={opd.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="panel-card p-5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-black text-sm" style={{ color: 'var(--text-primary)' }}>{opd.dept} Department</h3>
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${statusBadge(opd.status)}`}>
                          {opd.status}
                        </span>
                      </div>
                      <p className="text-xs font-semibold flex items-center gap-1.5" style={{ color: '#25B89A' }}>
                        <Stethoscope className="w-3.5 h-3.5" /> {opd.doctor}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(opd)}
                        className="p-2 rounded-xl transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                        style={{ color: '#25B89A' }}
                        title="Edit Schedule"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteSlot(opd.id, opd.dept)}
                        className="p-2 rounded-xl text-red-500 transition-colors hover:bg-red-500/10"
                        title="Delete Schedule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Grid details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: 'Operating Days', value: opd.days },
                      { label: 'Start Time',     value: opd.start },
                      { label: 'End Time',       value: opd.end },
                      { label: 'Daily Capacity', value: `${opd.booked} / ${opd.slots} Slots` },
                    ].map((f, j) => (
                      <div key={j} className="rounded-xl p-3" style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)' }}>
                        <p className="text-[9px] font-black uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                        <p className="text-xs font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{f.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* Capacity Fill Rate Indicator */}
                  <div>
                    <div className="flex justify-between mb-1.5 text-[11px]">
                      <span style={{ color: 'var(--text-muted)' }}>Booked Slots Capacity</span>
                      <span className="font-extrabold" style={{ color: fillPct >= 100 ? '#ef4444' : 'var(--text-primary)' }}>{fillPct}%</span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-surface-3)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(fillPct, 100)}%` }}
                        transition={{ delay: 0.2 + i * 0.05, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ background: fillPct >= 100 ? '#ef4444' : 'linear-gradient(90deg, #127A6A, #25B89A)' }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>

      {/* ── ADD / EDIT OPD SLOT MODAL ── */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold" style={{ background: 'rgba(37,184,154,0.15)', color: '#25B89A' }}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>
                      {editingSlot ? 'Edit OPD Schedule' : 'Add OPD Schedule Slot'}
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Configure OPD timings and capacity</p>
                  </div>
                </div>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto panel-scroll space-y-4 text-xs">
                
                {/* Department */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Department Name *</label>
                  <input
                    type="text"
                    value={form.dept}
                    onChange={e => setForm({ ...form, dept: e.target.value })}
                    placeholder="e.g. Cardiology, Neurology, Orthopedics"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                {/* Attending Doctor */}
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Attending Specialist Doctor</label>
                  {doctorsList.length > 0 ? (
                    <select
                      value={form.doctor}
                      onChange={e => setForm({ ...form, doctor: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40 mb-2"
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <option value="">Select Affiliated Doctor or Enter Custom Name</option>
                      {doctorsList.map(d => (
                        <option key={d.id} value={d.name}>{d.name} ({d.speciality})</option>
                      ))}
                    </select>
                  ) : null}
                  <input
                    type="text"
                    value={form.doctor}
                    onChange={e => setForm({ ...form, doctor: e.target.value })}
                    placeholder="e.g. Dr. Kiran Mehta"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                    style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Operating Days */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Operating Days *</label>
                    <input
                      type="text"
                      value={form.days}
                      onChange={e => setForm({ ...form, days: e.target.value })}
                      placeholder="e.g. Mon–Fri, Mon–Sat, Daily"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>OPD Status</label>
                    <select
                      value={form.status}
                      onChange={e => setForm({ ...form, status: e.target.value as 'Open' | 'Full' | 'Closed' })}
                      className="w-full px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    >
                      <option value="Open">Open</option>
                      <option value="Full">Full</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Start Time */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Start Time</label>
                    <input
                      type="text"
                      value={form.start}
                      onChange={e => setForm({ ...form, start: e.target.value })}
                      placeholder="09:00 AM"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  {/* End Time */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>End Time</label>
                    <input
                      type="text"
                      value={form.end}
                      onChange={e => setForm({ ...form, end: e.target.value })}
                      placeholder="05:00 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Slots */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Total Daily Capacity Slots</label>
                    <input
                      type="number"
                      min={1}
                      value={form.slots}
                      onChange={e => setForm({ ...form, slots: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>

                  {/* Booked Slots */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider mb-1 block" style={{ color: '#25B89A' }}>Currently Booked</label>
                    <input
                      type="number"
                      min={0}
                      value={form.booked}
                      onChange={e => setForm({ ...form, booked: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                    />
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t" style={{ borderColor: 'var(--border-color)' }}>
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold transition-colors hover:opacity-80"
                    style={{ background: 'var(--bg-surface-3)', color: 'var(--text-secondary)' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 rounded-xl text-xs font-black text-white shadow-lg flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #127A6A 0%, #075E52 100%)' }}
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save className="w-4 h-4 text-white" />}
                    {editingSlot ? 'Save Schedule Changes' : 'Add OPD Schedule Slot'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
