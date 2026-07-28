'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, CheckCircle2, Clock, XCircle, Eye, Video, Building2, User, Phone,
  Search, MoreVertical, FileText, Pill, ClipboardList, CalendarClock, Printer,
  Download, Plus, Trash2, X, Mic, MicOff, VideoOff, PhoneOff, Activity, Heart,
  Thermometer, Weight, AlertCircle, Check
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
    reason: 'Chest pain & breathlessness',
    fee: 1500,
    vitals: { bp: '130/85', hr: '78 bpm', temp: '98.4 °F', weight: '72 kg' },
    diagnosis: 'Mild Angina / Stress Induced Exertion',
    notes: 'Patient reports intermittent tightness in chest after climbing stairs.'
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
    reason: 'Follow-up - ECG report review',
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
      instructions: 'Avoid caffeine and maintain regular sleep schedule.'
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
    reason: 'Hypertension management & routine review',
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
    reason: 'Palpitations & anxiety symptoms',
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
    reason: 'Annual cardiac check-up',
    fee: 1500,
    vitals: { bp: '118/78', hr: '68 bpm', temp: '98.4 °F', weight: '76 kg' },
    diagnosis: 'Normal Cardiac Evaluation',
    notes: 'ECHO and TMT normal. Advised annual follow-up.'
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
    reason: 'Shortness of breath - Patient requested reschedule',
    fee: 1500
  }
];

const statusBadge = (s: string) => ({
  Confirmed:  'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
  Pending:    'bg-amber-500/15 text-amber-400 border border-amber-500/20',
  Completed:  'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20',
  Cancelled:  'bg-red-500/15 text-red-400 border border-red-500/20',
  Rescheduled:'bg-sky-500/15 text-sky-400 border border-sky-500/20',
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

  // Close 3-dot menu on outside click
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
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>My Appointments</h1>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Upcoming &amp; past patient consultations with full clinical controls</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Calendar,     label: 'Today',      value: appointments.filter(a => a.status === 'Confirmed').length, color: 'bg-indigo-500' },
            { icon: CheckCircle2, label: 'Confirmed',  value: appointments.filter(a => a.status === 'Confirmed').length, color: 'bg-emerald-500' },
            { icon: Clock,        label: 'Pending',    value: appointments.filter(a => a.status === 'Pending').length,   color: 'bg-amber-500' },
            { icon: XCircle,      label: 'Cancelled',  value: appointments.filter(a => a.status === 'Cancelled').length, color: 'bg-red-500' },
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
                    
                    {/* Patient Name & Age */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-extrabold text-xs">
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
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={a.mode === 'Video' ? { color: '#38BDF8', background: 'rgba(56,189,248,0.12)' } : { color: '#94A3B8', background: 'rgba(148,163,184,0.12)' }}>
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

                    {/* 3-DOT ACTION MENU */}
                    <td className="px-4 py-3.5 relative dot-menu-container">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === a.id ? null : a.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                        style={{ color: 'var(--text-primary)', background: openMenuId === a.id ? 'rgba(37,184,154,0.15)' : 'transparent' }}
                        title="Doctor Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {/* Dropdown Menu */}
                      <AnimatePresence>
                        {openMenuId === a.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-4 top-12 z-50 w-52 rounded-2xl p-1.5 shadow-2xl border backdrop-blur-xl"
                            style={{
                              background: 'rgba(15, 23, 42, 0.96)',
                              borderColor: 'rgba(37, 184, 154, 0.25)',
                              boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                            }}
                          >
                            {/* Option 1: View Details */}
                            <button
                              onClick={() => { setSelectedApt(a); setActiveModal('view'); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all text-left"
                            >
                              <Eye className="w-3.5 h-3.5 text-emerald-400" /> View Patient &amp; Details
                            </button>

                            {/* Option 2: Write/View Prescription */}
                            <button
                              onClick={() => { setSelectedApt(a); setActiveModal('prescription'); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-sky-500/10 hover:text-sky-400 transition-all text-left"
                            >
                              <Pill className="w-3.5 h-3.5 text-sky-400" />
                              {a.prescription ? 'View / Edit Prescription' : 'Write Prescription (Rx)'}
                            </button>

                            {/* Option 3: Add Clinical Notes */}
                            <button
                              onClick={() => { setSelectedApt(a); setActiveModal('notes'); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all text-left"
                            >
                              <ClipboardList className="w-3.5 h-3.5 text-indigo-400" /> Clinical Notes &amp; Vitals
                            </button>

                            {/* Option 4: Start Video Call (if Video mode or Confirmed) */}
                            {a.mode === 'Video' && a.status !== 'Cancelled' && (
                              <button
                                onClick={() => { setSelectedApt(a); setActiveModal('video'); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-sky-300 bg-sky-500/15 hover:bg-sky-500/25 transition-all text-left my-0.5"
                              >
                                <Video className="w-3.5 h-3.5 text-sky-400 animate-pulse" /> Start Video Consultation
                              </button>
                            )}

                            <div className="h-[1px] my-1 bg-white/10" />

                            {/* Option 5: Reschedule */}
                            <button
                              onClick={() => { setSelectedApt(a); setActiveModal('reschedule'); setOpenMenuId(null); }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-amber-500/10 hover:text-amber-400 transition-all text-left"
                            >
                              <CalendarClock className="w-3.5 h-3.5 text-amber-400" /> Reschedule Appointment
                            </button>

                            {/* Option 6: Mark Completed */}
                            {a.status !== 'Completed' && a.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(a.id, 'Completed')}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-500/15 transition-all text-left"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mark as Completed
                              </button>
                            )}

                            {/* Option 7: Cancel Appointment */}
                            {a.status !== 'Cancelled' && (
                              <button
                                onClick={() => handleUpdateStatus(a.id, 'Cancelled')}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-all text-left"
                              >
                                <XCircle className="w-3.5 h-3.5 text-red-400" /> Cancel Appointment
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

      {/* 1. VIEW DETAILS MODAL */}
      <AnimatePresence>
        {activeModal === 'view' && selectedApt && (
          <ModalOverlay onClose={() => setActiveModal(null)}>
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between border-b pb-4 border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg">
                    {selectedApt.patient[0]}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base text-white">{selectedApt.patient}</h2>
                    <p className="text-xs text-slate-400">{selectedApt.age} yrs · {selectedApt.gender || 'N/A'} · ID: {selectedApt.id}</p>
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusBadge(selectedApt.status)}`}>
                  {selectedApt.status}
                </span>
              </div>

              {/* Consultation Details */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Date &amp; Time</p>
                  <p className="font-bold text-white mt-0.5">{selectedApt.date} at {selectedApt.time}</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Consultation Mode</p>
                  <p className="font-bold text-sky-400 mt-0.5">{selectedApt.mode} Consultation</p>
                </div>
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Consultation Fee</p>
                  <p className="font-bold text-emerald-400 mt-0.5">₹{selectedApt.fee}</p>
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Patient Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <p className="text-slate-300 flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-emerald-400" /> {selectedApt.phone}</p>
                  {selectedApt.email && <p className="text-slate-300 flex items-center gap-2"><User className="w-3.5 h-3.5 text-emerald-400" /> {selectedApt.email}</p>}
                </div>
              </div>

              {/* Reason & Vitals */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Chief Complaint / Reason</h3>
                <p className="text-xs p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-slate-200">{selectedApt.reason}</p>
              </div>

              {selectedApt.vitals && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Vitals Recorded</h3>
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300">
                      <p className="text-[9px] uppercase font-bold">BP</p>
                      <p className="font-extrabold mt-0.5">{selectedApt.vitals.bp}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
                      <p className="text-[9px] uppercase font-bold">Heart Rate</p>
                      <p className="font-extrabold mt-0.5">{selectedApt.vitals.hr}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300">
                      <p className="text-[9px] uppercase font-bold">Temp</p>
                      <p className="font-extrabold mt-0.5">{selectedApt.vitals.temp}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300">
                      <p className="text-[9px] uppercase font-bold">Weight</p>
                      <p className="font-extrabold mt-0.5">{selectedApt.vitals.weight}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons inside drawer */}
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <button
                  onClick={() => setActiveModal('prescription')}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 hover:bg-sky-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Pill className="w-4 h-4" /> Open Prescription (Rx)
                </button>
                <button
                  onClick={() => setActiveModal('notes')}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" /> Clinical Notes
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
              showToast(`Prescription saved and generated for ${selectedApt.patient}`);
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
              showToast(`Clinical notes updated for ${selectedApt.patient}`);
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
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-2xl"
          >
            <CheckCircle2 className="w-4 h-4" />
            {toastMsg}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

/* ───────────────────────────────────────────────────────────── */
/* MODAL OVERLAY COMPONENT */
/* ───────────────────────────────────────────────────────────── */
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="w-full max-w-xl max-h-[90vh] overflow-y-auto panel-scroll rounded-3xl border shadow-2xl relative"
        style={{ background: 'var(--bg-surface)', borderColor: 'rgba(37,184,154,0.3)' }}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-10"
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
      { id: '1', name: 'Tab Pan-40mg', dosage: '1-0-0', frequency: 'Once daily', timing: 'Before Food', duration: '5 Days' }
    ]
  );
  const [tests, setTests] = useState(appointment.prescription?.tests || '');
  const [followUp, setFollowUp] = useState(appointment.prescription?.followUp || '1 Week');
  const [instructions, setInstructions] = useState(appointment.prescription?.instructions || '');

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
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3 border-b pb-4 border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">Digital Prescription (Rx)</h2>
            <p className="text-xs text-slate-400">Patient: <strong className="text-white">{appointment.patient}</strong> ({appointment.age}y)</p>
          </div>
        </div>

        {/* Diagnosis */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 block">Clinical Diagnosis *</label>
          <input
            type="text"
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            placeholder="e.g. Hypertension / Upper Respiratory Tract Infection"
            className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-white/[0.04] border border-white/[0.1] focus:outline-none focus:border-emerald-500/50"
          />
        </div>

        {/* Medicines Section */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Prescribed Medicines</label>
            <button
              onClick={addMedicine}
              className="text-[11px] font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20"
            >
              <Plus className="w-3 h-3" /> Add Medicine
            </button>
          </div>

          <div className="space-y-2.5">
            {medicines.map((m, index) => (
              <div key={m.id} className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-500 w-4">{index + 1}.</span>
                  <input
                    type="text"
                    value={m.name}
                    onChange={e => updateMedicine(m.id, 'name', e.target.value)}
                    placeholder="Medicine Name (e.g. Tab Paracetamol 500mg)"
                    className="flex-1 px-3 py-1.5 rounded-lg text-xs text-white bg-slate-900 border border-white/[0.1] focus:outline-none focus:border-sky-500/50"
                  />
                  {medicines.length > 1 && (
                    <button onClick={() => removeMedicine(m.id)} className="text-red-400 hover:text-red-300 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-0.5">Dosage</span>
                    <input
                      type="text"
                      value={m.dosage}
                      onChange={e => updateMedicine(m.id, 'dosage', e.target.value)}
                      placeholder="1-0-1"
                      className="w-full px-2.5 py-1 rounded-lg text-[11px] text-white bg-slate-900 border border-white/[0.1]"
                    />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-0.5">Timing</span>
                    <select
                      value={m.timing}
                      onChange={e => updateMedicine(m.id, 'timing', e.target.value)}
                      className="w-full px-2 py-1 rounded-lg text-[11px] text-white bg-slate-900 border border-white/[0.1]"
                    >
                      <option value="After Food">After Food</option>
                      <option value="Before Food">Before Food</option>
                      <option value="With Food">With Food</option>
                    </select>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 block mb-0.5">Duration</span>
                    <input
                      type="text"
                      value={m.duration}
                      onChange={e => updateMedicine(m.id, 'duration', e.target.value)}
                      placeholder="5 Days"
                      className="w-full px-2.5 py-1 rounded-lg text-[11px] text-white bg-slate-900 border border-white/[0.1]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tests & Instructions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 block">Recommended Tests</label>
            <input
              type="text"
              value={tests}
              onChange={e => setTests(e.target.value)}
              placeholder="e.g. Blood Sugar, Lipid Profile"
              className="w-full px-3 py-2 rounded-xl text-xs text-white bg-white/[0.04] border border-white/[0.1]"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 block">Follow-up Advice</label>
            <input
              type="text"
              value={followUp}
              onChange={e => setFollowUp(e.target.value)}
              placeholder="e.g. After 7 days"
              className="w-full px-3 py-2 rounded-xl text-xs text-white bg-white/[0.04] border border-white/[0.1]"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 block">Special Instructions</label>
          <textarea
            value={instructions}
            onChange={e => setInstructions(e.target.value)}
            rows={2}
            placeholder="Dietary instructions, precautions, etc..."
            className="w-full px-3 py-2 rounded-xl text-xs text-white bg-white/[0.04] border border-white/[0.1] resize-none"
          />
        </div>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-3 border-t border-white/10">
          <button
            onClick={() => {
              onSave({ diagnosis, medicines, tests, followUp, instructions });
            }}
            className="flex-1 py-3 rounded-2xl font-extrabold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Save &amp; Generate Prescription
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
  const [bp, setBp] = useState(appointment.vitals?.bp || '120/80');
  const [hr, setHr] = useState(appointment.vitals?.hr || '72 bpm');
  const [temp, setTemp] = useState(appointment.vitals?.temp || '98.6 °F');
  const [weight, setWeight] = useState(appointment.vitals?.weight || '70 kg');
  const [diagnosis, setDiagnosis] = useState(appointment.diagnosis || '');
  const [notes, setNotes] = useState(appointment.notes || '');

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 border-b pb-4 border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">Clinical Encounter Notes</h2>
            <p className="text-xs text-slate-400">Patient: <strong className="text-white">{appointment.patient}</strong></p>
          </div>
        </div>

        {/* Vitals Record */}
        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-2 block">Patient Vitals</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <span className="text-[9px] text-slate-400 block mb-1">Blood Pressure</span>
              <input type="text" value={bp} onChange={e => setBp(e.target.value)} className="w-full px-3 py-1.5 rounded-xl text-xs text-white bg-white/[0.04] border border-white/[0.1]" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block mb-1">Heart Rate</span>
              <input type="text" value={hr} onChange={e => setHr(e.target.value)} className="w-full px-3 py-1.5 rounded-xl text-xs text-white bg-white/[0.04] border border-white/[0.1]" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block mb-1">Temperature</span>
              <input type="text" value={temp} onChange={e => setTemp(e.target.value)} className="w-full px-3 py-1.5 rounded-xl text-xs text-white bg-white/[0.04] border border-white/[0.1]" />
            </div>
            <div>
              <span className="text-[9px] text-slate-400 block mb-1">Weight</span>
              <input type="text" value={weight} onChange={e => setWeight(e.target.value)} className="w-full px-3 py-1.5 rounded-xl text-xs text-white bg-white/[0.04] border border-white/[0.1]" />
            </div>
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 block">Clinical Diagnosis</label>
          <input
            type="text"
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            placeholder="Primary Diagnosis / Assessment"
            className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-white/[0.04] border border-white/[0.1]"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 block">Internal Doctor Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
            placeholder="Write examination findings, patient progress, lab observations..."
            className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-white/[0.04] border border-white/[0.1] resize-none"
          />
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-white/10">
          <button
            onClick={() => onSave({ vitals: { bp, hr, temp, weight }, diagnosis, notes })}
            className="flex-1 py-3 rounded-2xl font-extrabold text-xs bg-indigo-500 hover:bg-indigo-400 text-white transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Save Clinical Notes
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
  const [time, setTime] = useState('11:00 AM');

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6 space-y-5">
        <div className="flex items-center gap-3 border-b pb-4 border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-white">Reschedule Appointment</h2>
            <p className="text-xs text-slate-400">Patient: <strong className="text-white">{appointment.patient}</strong></p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 block">New Date</label>
            <input
              type="text"
              value={date}
              onChange={e => setDate(e.target.value)}
              placeholder="e.g. Jun 25, 2026"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-white/[0.04] border border-white/[0.1]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 mb-1 block">New Time Slot</label>
            <select
              value={time}
              onChange={e => setTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/[0.1]"
            >
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
              <option value="11:00 AM">11:00 AM</option>
              <option value="02:00 PM">02:00 PM</option>
              <option value="04:00 PM">04:00 PM</option>
              <option value="06:00 PM">06:00 PM</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-white/10">
          <button
            onClick={() => onSave(date, time)}
            className="flex-1 py-3 rounded-2xl font-extrabold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Confirm Reschedule
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
          </div>
          <span className="text-xs text-sky-400 font-mono font-bold">04:12</span>
        </div>

        {/* Video Frame Mockup */}
        <div className="relative w-full h-64 rounded-2xl bg-slate-950 overflow-hidden border border-white/10 flex items-center justify-center">
          {videoOn ? (
            <div className="text-center space-y-2">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 font-black text-2xl mx-auto flex items-center justify-center border-2 border-emerald-500/40">
                {appointment.patient[0]}
              </div>
              <p className="text-sm font-bold text-white">{appointment.patient}</p>
              <p className="text-[10px] text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">Connected · High Definition</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Camera Paused</p>
          )}

          {/* Self View Floating Box */}
          <div className="absolute bottom-3 right-3 w-24 h-18 rounded-xl bg-slate-900 border border-white/20 p-2 text-center flex flex-col items-center justify-center">
            <span className="text-[10px] font-bold text-sky-400">Dr. View</span>
          </div>
        </div>

        {/* Call Control Toolbar */}
        <div className="flex items-center justify-center gap-4 py-2">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${micOn ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setVideoOn(!videoOn)}
            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${videoOn ? 'bg-white/10 text-white' : 'bg-red-500/20 text-red-400 border border-red-500/30'}`}
          >
            {videoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
          </button>

          <button
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg transition-all"
            title="End Consultation"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}
