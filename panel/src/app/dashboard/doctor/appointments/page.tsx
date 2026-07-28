'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, CheckCircle2, Clock, XCircle, Eye, Video, Building2, User, Phone,
  Search, MoreVertical, FileText, Pill, ClipboardList, CalendarClock, Printer,
  Download, Plus, Trash2, X, Mic, MicOff, VideoOff, PhoneOff, Activity, Heart,
  Thermometer, Weight, Check, Sparkles, FileSpreadsheet, ShieldAlert,
  ArrowRight, Tag, Share2
} from 'lucide-react';

type AppointmentMode = 'Clinic' | 'Video';
type AppointmentStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'Rescheduled';

interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  duration: string;
}

interface Appointment {
  id: string;
  patient: string;
  age: number;
  gender?: string;
  phone: string;
  email?: string;
  date: string;
  time: string;
  mode: AppointmentMode;
  status: AppointmentStatus;
  reason: string;
  fee: number;
  vitals?: { bp: string; hr: string; temp: string; weight: string };
  diagnosis?: string;
  notes?: string;
  prescription?: {
    diagnosis: string;
    medicines: PrescriptionItem[];
    tests: string;
    followUp: string;
    instructions: string;
  };
}

const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT001',
    patient: 'Rahul Sharma',
    age: 34,
    gender: 'Male',
    phone: '+91 98765 43299',
    email: 'rahul.sharma@example.com',
    date: 'Jun 20, 2026',
    time: '10:00 AM',
    mode: 'Clinic',
    status: 'Confirmed',
    reason: 'Chest pain & breathlessness on exertion',
    fee: 1500,
    vitals: { bp: '130/85', hr: '78 bpm', temp: '98.4 °F', weight: '72 kg' },
    diagnosis: 'Mild Angina / Stress Induced Exertion',
    notes: 'Patient reports intermittent tightness in chest after climbing stairs. Recommended Resting ECG & Lipid Profile.'
  },
  {
    id: 'APT002',
    patient: 'Kavya Reddy',
    age: 28,
    gender: 'Female',
    phone: '+91 65432 10098',
    email: 'kavya.reddy@example.com',
    date: 'Jun 20, 2026',
    time: '11:30 AM',
    mode: 'Video',
    status: 'Confirmed',
    reason: 'Follow-up - ECG report & blood test review',
    fee: 1500,
    vitals: { bp: '120/80', hr: '72 bpm', temp: '98.6 °F', weight: '58 kg' },
    diagnosis: 'Sinus Tachycardia - Recovering',
    prescription: {
      diagnosis: 'Sinus Tachycardia',
      medicines: [
        { id: '1', name: 'Tab Metoprolol 25mg', dosage: '1-0-0', frequency: 'Once daily', timing: 'After Food', duration: '14 Days' },
        { id: '2', name: 'Tab Pan 40mg', dosage: '1-0-0', frequency: 'Once daily', timing: 'Before Food', duration: '7 Days' }
      ],
      tests: 'Lipid Profile, HbA1c',
      followUp: '2 Weeks',
      instructions: 'Avoid caffeine, maintain regular sleep, and log daily pulse.'
    }
  },
  {
    id: 'APT003',
    patient: 'Mohan Verma',
    age: 52,
    gender: 'Male',
    phone: '+91 54321 00987',
    email: 'mohan.verma@example.com',
    date: 'Jun 20, 2026',
    time: '02:00 PM',
    mode: 'Clinic',
    status: 'Pending',
    reason: 'Hypertension management & routine blood pressure check',
    fee: 1500,
    vitals: { bp: '145/92', hr: '84 bpm', temp: '98.2 °F', weight: '81 kg' }
  },
  {
    id: 'APT004',
    patient: 'Sunita Joshi',
    age: 40,
    gender: 'Female',
    phone: '+91 43210 09876',
    email: 'sunita.joshi@example.com',
    date: 'Jun 21, 2026',
    time: '09:30 AM',
    mode: 'Video',
    status: 'Confirmed',
    reason: 'Palpitations & mild anxiety symptoms',
    fee: 1500,
    vitals: { bp: '124/82', hr: '88 bpm', temp: '98.6 °F', weight: '64 kg' }
  },
  {
    id: 'APT005',
    patient: 'Deepak Singh',
    age: 45,
    gender: 'Male',
    phone: '+91 32100 98765',
    email: 'deepak.singh@example.com',
    date: 'Jun 21, 2026',
    time: '12:00 PM',
    mode: 'Clinic',
    status: 'Completed',
    reason: 'Annual cardiac preventive check-up',
    fee: 1500,
    vitals: { bp: '118/78', hr: '68 bpm', temp: '98.4 °F', weight: '76 kg' },
    diagnosis: 'Normal Cardiac Evaluation',
    notes: '2D ECHO and TMT normal. Advised annual preventive follow-up.'
  },
  {
    id: 'APT006',
    patient: 'Anita Mehta',
    age: 37,
    gender: 'Female',
    phone: '+91 21009 87654',
    email: 'anita.mehta@example.com',
    date: 'Jun 22, 2026',
    time: '04:00 PM',
    mode: 'Clinic',
    status: 'Cancelled',
    reason: 'Shortness of breath - Patient requested schedule adjustment',
    fee: 1500
  }
];

const statusBadge = (s: string) => ({
  Confirmed:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  Pending:     'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  Completed:   'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
  Cancelled:   'bg-red-500/15 text-red-400 border border-red-500/30',
  Rescheduled: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
}[s] || 'bg-slate-500/15 text-slate-400');

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // 3-dot dropdown menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Active Modal & Target Appointment
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [activeModal, setActiveModal] = useState<'view' | 'prescription' | 'notes' | 'reschedule' | 'video' | null>(null);

  // Toast State
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Close 3-dot menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.dot-menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleUpdateStatus = (id: string, newStatus: AppointmentStatus) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
    setOpenMenuId(null);
    showToast(`Appointment status updated to ${newStatus}`);
  };

  const filtered = appointments.filter(a =>
    a.patient.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter ? a.status === statusFilter : true)
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>My Appointments</h1>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Upcoming &amp; past patient consultations with clinical controls</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Calendar,     label: 'Today Consultations', value: appointments.filter(a => a.status === 'Confirmed').length, color: 'bg-indigo-500' },
            { icon: CheckCircle2, label: 'Confirmed Appointments', value: appointments.filter(a => a.status === 'Confirmed').length, color: 'bg-emerald-500' },
            { icon: Clock,        label: 'Pending Approval',    value: appointments.filter(a => a.status === 'Pending').length,   color: 'bg-amber-500' },
            { icon: XCircle,      label: 'Cancelled / Missed',  value: appointments.filter(a => a.status === 'Cancelled').length, color: 'bg-red-500' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center shadow-lg shadow-black/20`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Table Card */}
        <div className="panel-card overflow-visible">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search patient name or ID…" value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
                style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['', 'Confirmed', 'Pending', 'Completed', 'Cancelled'].map(s => (
                <button key={s} onClick={() => setStatusFilter(s)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                  style={statusFilter === s
                    ? { background: 'rgba(18,122,106,0.25)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                    : { color: 'var(--text-muted)', background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)' }}>
                  {s || 'All'}
                </button>
              ))}
            </div>
            <span className="text-xs ml-auto font-medium" style={{ color: 'var(--text-muted)' }}>{filtered.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Patient', 'Contact', 'Date & Time', 'Mode', 'Reason for Visit', 'Fee', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => (
                  <motion.tr key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b transition-colors hover:bg-white/[0.02]" style={{ borderColor: 'var(--border-color)' }}>
                    
                    {/* Patient Name */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/30">
                          {a.patient[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{a.patient}</p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{a.age} yrs · {a.gender || 'N/A'}</p>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="px-4 py-3.5">
                      <span className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}><Phone className="w-3 h-3 text-emerald-500/70" />{a.phone}</span>
                    </td>

                    {/* Date & Time */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{a.date}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{a.time}</p>
                    </td>

                    {/* Mode */}
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg"
                        style={a.mode === 'Video' ? { color: '#38BDF8', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)' } : { color: '#94A3B8', background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.2)' }}>
                        {a.mode === 'Video' ? <Video className="w-3 h-3" /> : <Building2 className="w-3 h-3" />} {a.mode}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="px-4 py-3.5 max-w-[180px] truncate" style={{ color: 'var(--text-secondary)' }} title={a.reason}>{a.reason}</td>

                    {/* Fee */}
                    <td className="px-4 py-3.5 font-bold" style={{ color: 'var(--text-primary)' }}>₹{a.fee}</td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(a.status)}`}>{a.status}</span>
                    </td>

                    {/* 3-DOT ACTION MENU BUTTON */}
                    <td className="px-4 py-3.5 relative dot-menu-container">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === a.id ? null : a.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all hover:bg-white/10"
                        style={{ color: 'var(--text-primary)', background: openMenuId === a.id ? 'rgba(37,184,154,0.2)' : 'transparent', border: openMenuId === a.id ? '1px solid rgba(37,184,154,0.4)' : '1px solid transparent' }}
                        title="Clinical Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {openMenuId === a.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.94, y: -6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.94, y: -6 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-4 top-12 z-50 w-56 rounded-2xl p-2 shadow-2xl border backdrop-blur-2xl"
                            style={{
                              background: 'rgba(10, 18, 30, 0.97)',
                              borderColor: 'rgba(37, 184, 154, 0.3)',
                              boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                            }}
                          >
                            <p className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-white/10 mb-1">
                              Doctor Actions
                            </p>

                            {/* Option 1: View Details */}
                            <button
                              onClick={() => { setSelectedApt(a); setActiveModal('view'); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-emerald-500/15 hover:text-emerald-400 transition-all text-left group"
                            >
                              <Eye className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" /> View Medical Card
                            </button>

                            {/* Option 2: Write/View Prescription */}
                            <button
                              onClick={() => { setSelectedApt(a); setActiveModal('prescription'); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-sky-500/15 hover:text-sky-400 transition-all text-left group"
                            >
                              <Pill className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                              {a.prescription ? 'View Digital Rx' : 'Write Prescription (Rx)'}
                            </button>

                            {/* Option 3: Add Clinical Notes */}
                            <button
                              onClick={() => { setSelectedApt(a); setActiveModal('notes'); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-indigo-500/15 hover:text-indigo-400 transition-all text-left group"
                            >
                              <ClipboardList className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" /> Clinical Notes &amp; Vitals
                            </button>

                            {/* Option 4: Start Video Call (if Video mode or Confirmed) */}
                            {a.mode === 'Video' && a.status !== 'Cancelled' && (
                              <button
                                onClick={() => { setSelectedApt(a); setActiveModal('video'); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-sky-300 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 transition-all text-left my-1 group"
                              >
                                <Video className="w-4 h-4 text-sky-400 animate-pulse" /> Start Telehealth Video Call
                              </button>
                            )}

                            <div className="h-[1px] my-1 bg-white/10" />

                            {/* Option 5: Reschedule */}
                            <button
                              onClick={() => { setSelectedApt(a); setActiveModal('reschedule'); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-amber-500/15 hover:text-amber-400 transition-all text-left group"
                            >
                              <CalendarClock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" /> Reschedule Date/Time
                            </button>

                            {/* Option 6: Mark Completed */}
                            {a.status !== 'Completed' && a.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(a.id, 'Completed')}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-500/15 transition-all text-left"
                              >
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mark as Completed
                              </button>
                            )}

                            {/* Option 7: Cancel Appointment */}
                            {a.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(a.id, 'Cancelled')}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/15 transition-all text-left"
                              >
                                <XCircle className="w-4 h-4 text-red-400" /> Cancel Appointment
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </td>

                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── MODALS SECTION ── */}

      {/* 1. VIEW PATIENT DETAILS MODAL */}
      <AnimatePresence>
        {activeModal === 'view' && selectedApt && (
          <ModalOverlay onClose={() => setActiveModal(null)}>
            <div className="p-6 sm:p-7 space-y-6">
              {/* Header Profile Badge */}
              <div className="flex items-start justify-between border-b pb-5 border-white/10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/20 border-2 border-emerald-300">
                    {selectedApt.patient[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-black text-lg text-white tracking-tight">{selectedApt.patient}</h2>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/10 text-slate-300 border border-white/15">
                        ID: {selectedApt.id}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                      <span>{selectedApt.age} Years</span> ·
                      <span>{selectedApt.gender || 'N/A'}</span> ·
                      <span className="text-emerald-400 font-semibold">{selectedApt.mode} Consultation</span>
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-extrabold px-3.5 py-1 rounded-full ${statusBadge(selectedApt.status)}`}>
                  {selectedApt.status}
                </span>
              </div>

              {/* Consultation Stats Banner */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Scheduled Date</p>
                  <p className="font-extrabold text-white text-xs mt-1">{selectedApt.date}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Time Slot</p>
                  <p className="font-extrabold text-sky-400 text-xs mt-1">{selectedApt.time}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-center">
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Consultation Fee</p>
                  <p className="font-extrabold text-emerald-400 text-xs mt-1">₹{selectedApt.fee}</p>
                </div>
              </div>

              {/* Patient Vitals Dashboard Cards */}
              {selectedApt.vitals && (
                <div className="space-y-2.5">
                  <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Recorded Patient Vitals
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-col items-center text-center">
                      <div className="w-7 h-7 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-1">
                        <Activity className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Blood Pressure</span>
                      <span className="font-black text-rose-300 text-sm mt-0.5">{selectedApt.vitals.bp}</span>
                      <span className="text-[9px] text-rose-400/80">mmHg</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col items-center text-center">
                      <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-1">
                        <Heart className="w-4 h-4 animate-pulse" />
                      </div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Heart Rate</span>
                      <span className="font-black text-emerald-300 text-sm mt-0.5">{selectedApt.vitals.hr}</span>
                      <span className="text-[9px] text-emerald-400/80">Beats/Min</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col items-center text-center">
                      <div className="w-7 h-7 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-1">
                        <Thermometer className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Body Temp</span>
                      <span className="font-black text-amber-300 text-sm mt-0.5">{selectedApt.vitals.temp}</span>
                      <span className="text-[9px] text-amber-400/80">Fahrenheit</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex flex-col items-center text-center">
                      <div className="w-7 h-7 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-1">
                        <Weight className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Weight</span>
                      <span className="font-black text-indigo-300 text-sm mt-0.5">{selectedApt.vitals.weight}</span>
                      <span className="text-[9px] text-indigo-400/80">Kilograms</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Chief Reason & Clinical Summary */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Reason for Visit</h3>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-xs text-slate-200 leading-relaxed relative overflow-hidden">
                  <p className="relative z-10 font-medium">{selectedApt.reason}</p>
                </div>
              </div>

              {selectedApt.notes && (
                <div className="space-y-2">
                  <h3 className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Clinical Notes</h3>
                  <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-slate-300 leading-relaxed">
                    {selectedApt.notes}
                  </div>
                </div>
              )}

              {/* Patient Contact Cards */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Patient Contact</p>
                  <p className="text-xs font-bold text-white mt-0.5">{selectedApt.phone}</p>
                  {selectedApt.email && <p className="text-[11px] text-slate-400">{selectedApt.email}</p>}
                </div>
                <a
                  href={`tel:${selectedApt.phone}`}
                  className="px-4 py-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs hover:bg-emerald-500/30 transition-all flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Patient
                </a>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => setActiveModal('prescription')}
                  className="flex-1 py-3 rounded-2xl text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10"
                >
                  <Pill className="w-4 h-4" /> Open Digital Rx
                </button>
                <button
                  onClick={() => setActiveModal('notes')}
                  className="flex-1 py-3 rounded-2xl text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
                >
                  <ClipboardList className="w-4 h-4" /> Edit Notes
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* 2. WRITE / VIEW PRESCRIPTION (Rx) MODAL */}
      <AnimatePresence>
        {activeModal === 'prescription' && selectedApt && (
          <PrescriptionModal
            appointment={selectedApt}
            onClose={() => setActiveModal(null)}
            onSave={(rxData) => {
              setAppointments(prev => prev.map(a => a.id === selectedApt.id ? { ...a, prescription: rxData } : a));
              setActiveModal(null);
              showToast(`Prescription saved & generated for ${selectedApt.patient}`);
            }}
          />
        )}
      </AnimatePresence>

      {/* 3. ADD CLINICAL NOTES MODAL */}
      <AnimatePresence>
        {activeModal === 'notes' && selectedApt && (
          <ClinicalNotesModal
            appointment={selectedApt}
            onClose={() => setActiveModal(null)}
            onSave={(notesData) => {
              setAppointments(prev => prev.map(a => a.id === selectedApt.id ? { ...a, vitals: notesData.vitals, diagnosis: notesData.diagnosis, notes: notesData.notes } : a));
              setActiveModal(null);
              showToast(`Clinical notes saved for ${selectedApt.patient}`);
            }}
          />
        )}
      </AnimatePresence>

      {/* 4. RESCHEDULE MODAL */}
      <AnimatePresence>
        {activeModal === 'reschedule' && selectedApt && (
          <RescheduleModal
            appointment={selectedApt}
            onClose={() => setActiveModal(null)}
            onSave={(newDate, newTime) => {
              setAppointments(prev => prev.map(a => a.id === selectedApt.id ? { ...a, date: newDate, time: newTime, status: 'Rescheduled' } : a));
              setActiveModal(null);
              showToast(`Appointment rescheduled to ${newDate} at ${newTime}`);
            }}
          />
        )}
      </AnimatePresence>

      {/* 5. VIDEO CONSULTATION MODAL */}
      <AnimatePresence>
        {activeModal === 'video' && selectedApt && (
          <VideoCallModal
            appointment={selectedApt}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>

      {/* TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs shadow-2xl shadow-emerald-500/30 border border-emerald-300"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

/* ───────────────────────────────────────────────────────────── */
/* MODAL OVERLAY CONTAINER */
/* ───────────────────────────────────────────────────────────── */
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(4, 9, 15, 0.85)', backdropFilter: 'blur(16px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto panel-scroll rounded-3xl border shadow-2xl relative"
        style={{
          background: 'linear-gradient(165deg, rgba(13,24,38,0.98) 0%, rgba(8,16,27,0.99) 100%)',
          borderColor: 'rgba(37, 184, 154, 0.3)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-20 border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>
        {children}
      </motion.div>
    </motion.div>
  );
}

/* ───────────────────────────────────────────────────────────── */
/* PRESCRIPTION (Rx) MODAL COMPONENT */
/* ───────────────────────────────────────────────────────────── */
function PrescriptionModal({ appointment, onClose, onSave }: { appointment: Appointment; onClose: () => void; onSave: (rx: any) => void }) {
  const [diagnosis, setDiagnosis] = useState(appointment.prescription?.diagnosis || appointment.diagnosis || '');
  const [medicines, setMedicines] = useState<PrescriptionItem[]>(
    appointment.prescription?.medicines || [
      { id: '1', name: 'Tab Metoprolol 25mg', dosage: '1-0-0', frequency: 'Once daily', timing: 'After Food', duration: '14 Days' },
      { id: '2', name: 'Tab Pan 40mg', dosage: '1-0-0', frequency: 'Once daily', timing: 'Before Food', duration: '7 Days' }
    ]
  );
  const [tests, setTests] = useState(appointment.prescription?.tests || '');
  const [followUp, setFollowUp] = useState(appointment.prescription?.followUp || '2 Weeks');
  const [instructions, setInstructions] = useState(appointment.prescription?.instructions || 'Avoid caffeine, maintain regular sleep schedule.');

  const addMedicine = () => {
    setMedicines([...medicines, { id: String(Date.now()), name: '', dosage: '1-0-1', frequency: 'Twice daily', timing: 'After Food', duration: '5 Days' }]);
  };

  const removeMedicine = (id: string) => {
    setMedicines(medicines.filter(m => m.id !== id));
  };

  const updateMedicine = (id: string, field: keyof PrescriptionItem, val: string) => {
    setMedicines(medicines.map(m => m.id === id ? { ...m, [field]: val } : m));
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6 sm:p-7 space-y-6">
        {/* Official Medical Rx Header Stamp */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/15 via-emerald-500/10 to-transparent border border-sky-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 font-black text-xl">
              Rx
            </div>
            <div>
              <h2 className="font-black text-base text-white flex items-center gap-2">
                Digital Medical Prescription
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">Verified</span>
              </h2>
              <p className="text-xs text-slate-400">Patient: <strong className="text-white">{appointment.patient}</strong> ({appointment.age}y · {appointment.gender || 'N/A'})</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-400 font-mono">Date: {appointment.date}</p>
            <p className="text-[10px] text-sky-400 font-mono">Rx ID: RX-{appointment.id}</p>
          </div>
        </div>

        {/* Diagnosis Input */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1.5 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Clinical Diagnosis *
          </label>
          <input
            type="text"
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            placeholder="e.g. Essential Hypertension / Sinus Tachycardia"
            className="w-full px-4 py-3 rounded-2xl text-xs text-white bg-slate-900/90 border border-white/10 focus:outline-none focus:border-emerald-500/60 font-semibold"
          />
        </div>

        {/* Medication Builder */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1">
              <Pill className="w-3 h-3 text-sky-400" /> Prescribed Medications ({medicines.length})
            </label>
            <button
              onClick={addMedicine}
              className="text-xs font-extrabold text-sky-300 hover:text-white flex items-center gap-1.5 bg-sky-500/20 hover:bg-sky-500/30 px-3 py-1.5 rounded-xl border border-sky-500/30 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Drug
            </button>
          </div>

          <div className="space-y-3">
            {medicines.map((m, index) => (
              <div key={m.id} className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 space-y-3 relative group">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 text-[10px] font-black flex items-center justify-center flex-shrink-0">
                    {index + 1}
                  </span>
                  <input
                    type="text"
                    value={m.name}
                    onChange={e => updateMedicine(m.id, 'name', e.target.value)}
                    placeholder="Medicine Name (e.g. Tab Metoprolol 25mg)"
                    className="flex-1 px-3.5 py-2 rounded-xl text-xs text-white bg-slate-950 border border-white/10 focus:outline-none focus:border-sky-500/50 font-bold"
                  />
                  {medicines.length > 1 && (
                    <button onClick={() => removeMedicine(m.id)} className="text-red-400 hover:text-red-300 p-1.5 rounded-lg hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Dosage Tag</span>
                    <div className="flex items-center gap-1">
                      {['1-0-0', '1-0-1', '1-1-1', '0-0-1'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => updateMedicine(m.id, 'dosage', tag)}
                          className={`text-[9px] font-bold px-2 py-1 rounded-md border transition-all ${m.dosage === tag ? 'bg-sky-500/25 border-sky-400 text-sky-300' : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Food Timing</span>
                    <select
                      value={m.timing}
                      onChange={e => updateMedicine(m.id, 'timing', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-slate-950 border border-white/10"
                    >
                      <option value="After Food">After Food</option>
                      <option value="Before Food">Before Food</option>
                      <option value="With Food">With Food</option>
                    </select>
                  </div>

                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Duration</span>
                    <input
                      type="text"
                      value={m.duration}
                      onChange={e => updateMedicine(m.id, 'duration', e.target.value)}
                      placeholder="e.g. 7 Days"
                      className="w-full px-3 py-1.5 rounded-xl text-[11px] font-bold text-white bg-slate-950 border border-white/10"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Tests & Follow-Up */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 block">Recommended Lab Tests</label>
            <input
              type="text"
              value={tests}
              onChange={e => setTests(e.target.value)}
              placeholder="e.g. Lipid Profile, HbA1c"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900/90 border border-white/10"
            />
          </div>
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 block">Follow-Up Date</label>
            <input
              type="text"
              value={followUp}
              onChange={e => setFollowUp(e.target.value)}
              placeholder="e.g. 2 Weeks"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900/90 border border-white/10"
            />
          </div>
        </div>

        {/* Special Instructions */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 block">Special Patient Advice</label>
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            rows={2}
            placeholder="Precautions, lifestyle advice, diet restrictions..."
            className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900/90 border border-white/10 resize-none"
          />
        </div>

        {/* Actions Footer */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => {
              onSave({ diagnosis, medicines, tests, followUp, instructions });
            }}
            className="flex-1 py-3.5 rounded-2xl font-black text-xs bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Save &amp; Issue Rx
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ───────────────────────────────────────────────────────────── */
/* CLINICAL NOTES MODAL COMPONENT */
/* ───────────────────────────────────────────────────────────── */
function ClinicalNotesModal({ appointment, onClose, onSave }: { appointment: Appointment; onClose: () => void; onSave: (data: any) => void }) {
  const [bp, setBp] = useState(appointment.vitals?.bp || '130/85');
  const [hr, setHr] = useState(appointment.vitals?.hr || '78 bpm');
  const [temp, setTemp] = useState(appointment.vitals?.temp || '98.4 °F');
  const [weight, setWeight] = useState(appointment.vitals?.weight || '72 kg');
  const [diagnosis, setDiagnosis] = useState(appointment.diagnosis || '');
  const [notes, setNotes] = useState(appointment.notes || '');

  const appendTag = (tag: string) => {
    setNotes(prev => prev ? `${prev} ${tag}` : tag);
  };

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6 sm:p-7 space-y-5">
        <div className="flex items-center gap-3 border-b pb-4 border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <ClipboardList className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-base text-white">Clinical Encounter Chart</h2>
            <p className="text-xs text-slate-400">Patient: <strong className="text-white">{appointment.patient}</strong> ({appointment.age}y)</p>
          </div>
        </div>

        {/* Vitals Recording Grid */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2 block">Vitals Assessment</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10">
              <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                <Activity className="w-3 h-3 text-rose-400" /> BP (mmHg)
              </span>
              <input type="text" value={bp} onChange={e => setBp(e.target.value)} className="w-full px-3 py-1.5 rounded-xl text-xs font-extrabold text-white bg-slate-950 border border-white/10" />
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10">
              <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                <Heart className="w-3 h-3 text-emerald-400" /> Heart Rate
              </span>
              <input type="text" value={hr} onChange={e => setHr(e.target.value)} className="w-full px-3 py-1.5 rounded-xl text-xs font-extrabold text-white bg-slate-950 border border-white/10" />
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10">
              <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                <Thermometer className="w-3 h-3 text-amber-400" /> Temp (°F)
              </span>
              <input type="text" value={temp} onChange={e => setTemp(e.target.value)} className="w-full px-3 py-1.5 rounded-xl text-xs font-extrabold text-white bg-slate-950 border border-white/10" />
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/90 border border-white/10">
              <span className="text-[9px] font-bold text-slate-400 uppercase flex items-center gap-1 mb-1">
                <Weight className="w-3 h-3 text-indigo-400" /> Weight (kg)
              </span>
              <input type="text" value={weight} onChange={e => setWeight(e.target.value)} className="w-full px-3 py-1.5 rounded-xl text-xs font-extrabold text-white bg-slate-950 border border-white/10" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 block">Assessment / Diagnosis</label>
          <input
            type="text"
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            placeholder="Primary Clinical Assessment"
            className="w-full px-4 py-3 rounded-2xl text-xs text-white bg-slate-900/90 border border-white/10 font-bold"
          />
        </div>

        {/* Quick Clinical Tag Chips */}
        <div>
          <label className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 block">Quick Tags</label>
          <div className="flex flex-wrap gap-1.5">
            {['#Hypertension', '#NormalECG', '#FollowUpIn2Weeks', '#DietControl', '#LabTestsOrdered'].map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => appendTag(tag)}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-500/25 transition-all"
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 block">Clinical Observation Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Write examination findings, symptoms, and treatment plan details..."
            className="w-full px-4 py-3 rounded-2xl text-xs text-white bg-slate-900/90 border border-white/10 resize-none font-medium"
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => onSave({ vitals: { bp, hr, temp, weight }, diagnosis, notes })}
            className="flex-1 py-3.5 rounded-2xl font-black text-xs bg-indigo-500 hover:bg-indigo-400 text-white transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Save Clinical Chart
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ───────────────────────────────────────────────────────────── */
/* RESCHEDULE MODAL COMPONENT */
/* ───────────────────────────────────────────────────────────── */
function RescheduleModal({ appointment, onClose, onSave }: { appointment: Appointment; onClose: () => void; onSave: (date: string, time: string) => void }) {
  const [date, setDate] = useState('Jun 25, 2026');
  const [selectedTime, setSelectedTime] = useState('11:30 AM');

  const timeSlots = ['09:00 AM', '10:00 AM', '11:30 AM', '02:00 PM', '04:00 PM', '05:30 PM'];

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6 sm:p-7 space-y-5">
        <div className="flex items-center gap-3 border-b pb-4 border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <CalendarClock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-base text-white">Reschedule Appointment</h2>
            <p className="text-xs text-slate-400">Patient: <strong className="text-white">{appointment.patient}</strong></p>
          </div>
        </div>

        {/* Current Callout */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
          <span className="text-amber-300 font-bold">Current Slot:</span>
          <span className="text-white font-extrabold">{appointment.date} at {appointment.time}</span>
        </div>

        {/* New Date */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1.5 block">Select New Date</label>
          <input
            type="text"
            value={date}
            onChange={e => setDate(e.target.value)}
            placeholder="e.g. Jun 25, 2026"
            className="w-full px-4 py-3 rounded-2xl text-xs text-white bg-slate-900/90 border border-white/10 font-bold"
          />
        </div>

        {/* Time Slots Grid */}
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-2 block">Select Available Time Slot</label>
          <div className="grid grid-cols-3 gap-2">
            {timeSlots.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setSelectedTime(t)}
                className={`py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${selectedTime === t ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10' : 'bg-slate-900/90 border-white/10 text-slate-400 hover:text-white'}`}
              >
                {selectedTime === t && <Check className="w-3.5 h-3.5 text-amber-400" />}
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <button
            onClick={() => onSave(date, selectedTime)}
            className="flex-1 py-3.5 rounded-2xl font-black text-xs bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 transition-all shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Confirm &amp; Update Slot
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ───────────────────────────────────────────────────────────── */
/* VIDEO CALL MODAL COMPONENT */
/* ───────────────────────────────────────────────────────────── */
function VideoCallModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const [micOn, setMicOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b pb-3 border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="font-extrabold text-sm text-white">Live Tele-Consultation</h2>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">HD 1080p</span>
          </div>
          <span className="text-xs text-sky-400 font-mono font-black bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">04:12</span>
        </div>

        {/* Video Viewport */}
        <div className="relative w-full h-72 rounded-3xl bg-slate-950 overflow-hidden border border-white/15 flex items-center justify-center shadow-2xl">
          {videoOn ? (
            <div className="text-center space-y-3">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 font-black text-3xl mx-auto flex items-center justify-center border-4 border-emerald-300 shadow-xl shadow-emerald-500/20">
                {appointment.patient[0]}
              </div>
              <div>
                <p className="text-base font-extrabold text-white">{appointment.patient}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Connected Patient Stream</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <VideoOff className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-500 font-semibold">Camera Stream Paused</p>
            </div>
          )}

          {/* PiP Doctor Camera Window */}
          <div className="absolute bottom-4 right-4 w-28 h-20 rounded-2xl bg-slate-900/90 border border-sky-500/40 p-2 flex flex-col items-center justify-center shadow-xl">
            <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Doctor Cam</span>
            <span className="text-[10px] text-slate-400">Active</span>
          </div>
        </div>

        {/* Call Toolbar */}
        <div className="flex items-center justify-center gap-4 py-3">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${micOn ? 'bg-white/10 text-white border border-white/15 hover:bg-white/20' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all shadow-lg ${videoOn ? 'bg-white/10 text-white border border-white/15 hover:bg-white/20' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}
          >
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="w-14 h-14 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center justify-center shadow-xl shadow-red-500/30 transition-all border border-red-400"
            title="End Tele-Consultation"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
