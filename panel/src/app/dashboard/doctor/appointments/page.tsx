'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, CheckCircle2, Clock, XCircle, Eye, Video, Building2, User, Phone,
  Search, MoreVertical, FileText, Pill, ClipboardList, CalendarClock, Printer,
  Download, Plus, Trash2, X, Mic, MicOff, VideoOff, PhoneOff, Activity, Heart,
  Thermometer, Weight, Check, Syringe, PhoneCall, Ticket, Share2, RefreshCw,
  Tag, Link2, Volume2, VolumeX, Radio, ShieldCheck, Info, Sparkles
} from 'lucide-react';

export type AppointmentMode = 'Clinic Visit' | 'Video Consult' | 'Phone Consult';
export type AppointmentStatus = 'Confirmed' | 'Pending' | 'Completed' | 'Cancelled' | 'Rescheduled';

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
  tokenNo?: number;
  chamberRoom?: string;
  arrivalStatus?: 'Waiting in Reception' | 'In Doctor Chamber' | 'Completed' | 'Not Arrived';
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
    mode: 'Clinic Visit',
    status: 'Confirmed',
    reason: 'Chest pain & breathlessness on exertion',
    fee: 1500,
    tokenNo: 14,
    chamberRoom: 'OPD Room 2B',
    arrivalStatus: 'Waiting in Reception',
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
    mode: 'Video Consult',
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
    mode: 'Phone Consult',
    status: 'Confirmed',
    reason: 'Hypertension management & routine BP review',
    fee: 1200,
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
    mode: 'Video Consult',
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
    mode: 'Clinic Visit',
    status: 'Completed',
    reason: 'Annual cardiac preventive check-up',
    fee: 1500,
    tokenNo: 8,
    chamberRoom: 'OPD Room 2B',
    arrivalStatus: 'Completed',
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
    mode: 'Phone Consult',
    status: 'Cancelled',
    reason: 'Shortness of breath - Patient requested schedule adjustment',
    fee: 1200
  }
];

const statusBadge = (s: string) => ({
  Confirmed:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
  Pending:     'bg-amber-500/15 text-amber-400 border border-amber-500/30',
  Completed:   'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30',
  Cancelled:   'bg-red-500/15 text-red-400 border border-red-500/30',
  Rescheduled: 'bg-sky-500/15 text-sky-400 border border-sky-500/30',
}[s] || 'bg-slate-500/15 text-slate-400');

const modeBadgeStyle = (m: AppointmentMode) => {
  if (m === 'Clinic Visit') return { color: '#25B89A', background: 'rgba(37,184,154,0.12)', border: '1px solid rgba(37,184,154,0.3)', leftBorder: 'border-l-4 border-emerald-500' };
  if (m === 'Video Consult') return { color: '#38BDF8', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.3)', leftBorder: 'border-l-4 border-sky-400' };
  return { color: '#C084FC', background: 'rgba(192,132,252,0.12)', border: '1px solid rgba(192,132,252,0.3)', leftBorder: 'border-l-4 border-purple-500' };
};

export default function DoctorAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modeFilter, setModeFilter] = useState('');
  
  // 3-dot dropdown menu state
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Active Modal & Target Appointment
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [activeModal, setActiveModal] = useState<'view' | 'prescription' | 'notes' | 'reschedule' | 'video' | 'phoneCall' | 'token' | 'switchMode' | null>(null);

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

  const clinicCount = appointments.filter(a => a.mode === 'Clinic Visit').length;
  const videoCount = appointments.filter(a => a.mode === 'Video Consult').length;
  const phoneCount = appointments.filter(a => a.mode === 'Phone Consult').length;

  const filtered = appointments.filter(a =>
    a.patient.toLowerCase().includes(search.toLowerCase()) &&
    (statusFilter ? a.status === statusFilter : true) &&
    (modeFilter ? a.mode === modeFilter : true)
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>My Appointments</h1>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Patient Preferred Modes: Clinic Visit, Video Consult, Phone Consult</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6 space-y-6">
        {/* 🌟 1. DEDICATED MODE IDENTIFICATION SUMMARY BAR */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Clinic Visit Card */}
          <div
            onClick={() => setModeFilter(modeFilter === 'Clinic Visit' ? '' : 'Clinic Visit')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between shadow-lg ${modeFilter === 'Clinic Visit' ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-500/40' : 'bg-slate-900/80 border-emerald-500/30 hover:bg-emerald-500/10'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-black">
                <Syringe className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white flex items-center gap-1.5">
                  Clinic Visits (In-Person)
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Patients coming to OPD Chamber</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-emerald-400">{clinicCount}</span>
              <p className="text-[9px] text-slate-400 uppercase font-bold">Patients</p>
            </div>
          </div>

          {/* Video Consult Card */}
          <div
            onClick={() => setModeFilter(modeFilter === 'Video Consult' ? '' : 'Video Consult')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between shadow-lg ${modeFilter === 'Video Consult' ? 'bg-sky-500/20 border-sky-400 ring-2 ring-sky-500/40' : 'bg-slate-900/80 border-sky-500/30 hover:bg-sky-500/10'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 font-black">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white flex items-center gap-1.5">
                  Video Consults (Online)
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Joining via HD Video link</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-sky-400">{videoCount}</span>
              <p className="text-[9px] text-slate-400 uppercase font-bold">Patients</p>
            </div>
          </div>

          {/* Phone Consult Card */}
          <div
            onClick={() => setModeFilter(modeFilter === 'Phone Consult' ? '' : 'Phone Consult')}
            className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between shadow-lg ${modeFilter === 'Phone Consult' ? 'bg-purple-500/20 border-purple-400 ring-2 ring-purple-500/40' : 'bg-slate-900/80 border-purple-500/30 hover:bg-purple-500/10'}`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 font-black">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black text-white flex items-center gap-1.5">
                  Phone Consults (Voice)
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Voice call on mobile number</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-purple-400">{phoneCount}</span>
              <p className="text-[9px] text-slate-400 uppercase font-bold">Patients</p>
            </div>
          </div>
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

            {/* Quick Mode Filter Tabs */}
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: 'All Modes', value: '', count: appointments.length },
                { label: '💉 Clinic Visit', value: 'Clinic Visit', count: clinicCount },
                { label: '📹 Video Consult', value: 'Video Consult', count: videoCount },
                { label: '📞 Phone Consult', value: 'Phone Consult', count: phoneCount },
              ].map(m => (
                <button key={m.value} onClick={() => setModeFilter(m.value)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5"
                  style={modeFilter === m.value
                    ? { background: 'rgba(37,184,154,0.25)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.4)' }
                    : { color: 'var(--text-muted)', background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)' }}>
                  <span>{m.label}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-full bg-white/10">{m.count}</span>
                </button>
              ))}
            </div>

            <span className="text-xs ml-auto font-medium" style={{ color: 'var(--text-muted)' }}>{filtered.length} records</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  {['Patient', 'Contact', 'Date & Time', 'Preferred Mode', 'Reason for Visit', 'Fee', 'Status', 'Action'].map(h => (
                    <th key={h} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((a, i) => {
                  const modeStyle = modeBadgeStyle(a.mode);
                  return (
                    <motion.tr
                      key={a.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.04 }}
                      className={`border-b transition-colors hover:bg-white/[0.03] ${modeStyle.leftBorder}`}
                      style={{ borderColor: 'var(--border-color)' }}
                    >
                      {/* Patient Name with Mode Tag */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center font-black text-xs border border-emerald-500/30">
                            {a.patient[0]}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white flex items-center gap-1.5">
                              {a.patient}
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                              <span>{a.age}y · {a.gender || 'N/A'}</span>
                              <span className="text-slate-500">|</span>
                              <span className="font-bold" style={{ color: modeStyle.color }}>
                                {a.mode === 'Clinic Visit' && '💉 In-Person'}
                                {a.mode === 'Video Consult' && '📹 Video Call'}
                                {a.mode === 'Phone Consult' && '📞 Voice Call'}
                              </span>
                            </p>
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

                      {/* Consultation Mode Column Badge */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-xl shadow-sm" style={modeStyle}>
                          {a.mode === 'Clinic Visit' && <Syringe className="w-3.5 h-3.5" />}
                          {a.mode === 'Video Consult' && <Video className="w-3.5 h-3.5" />}
                          {a.mode === 'Phone Consult' && <PhoneCall className="w-3.5 h-3.5" />}
                          {a.mode}
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
                          title="Actions for Mode"
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
                              className="absolute right-4 top-12 z-50 w-60 rounded-2xl p-2 shadow-2xl border backdrop-blur-2xl"
                              style={{
                                background: 'rgba(10, 18, 30, 0.97)',
                                borderColor: 'rgba(37, 184, 154, 0.3)',
                                boxShadow: '0 20px 40px rgba(0,0,0,0.6)'
                              }}
                            >
                              <div className="px-3 py-1 text-[9px] font-black uppercase tracking-widest text-slate-500 border-b border-white/10 mb-1 flex items-center justify-between">
                                <span>Mode Actions</span>
                                <span className="text-[9px] font-bold" style={{ color: modeStyle.color }}>{a.mode}</span>
                              </div>

                              {/* MODE 1: Clinic Visit Actions */}
                              {a.mode === 'Clinic Visit' && (
                                <>
                                  <button
                                    onClick={() => { setSelectedApt(a); setActiveModal('token'); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 transition-all text-left my-0.5 border border-emerald-500/30"
                                  >
                                    <Ticket className="w-4 h-4 text-emerald-400" /> Clinic Queue Token &amp; Chamber
                                  </button>
                                  <button
                                    onClick={() => { setSelectedApt(a); setActiveModal('prescription'); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all text-left"
                                  >
                                    <Printer className="w-4 h-4 text-emerald-400" /> Print OPD Prescription Slip
                                  </button>
                                </>
                              )}

                              {/* MODE 2: Video Consult Actions */}
                              {a.mode === 'Video Consult' && a.status !== 'Cancelled' && (
                                <>
                                  <button
                                    onClick={() => { setSelectedApt(a); setActiveModal('video'); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-sky-300 bg-sky-500/20 hover:bg-sky-500/30 border border-sky-500/30 transition-all text-left my-0.5"
                                  >
                                    <Video className="w-4 h-4 text-sky-400 animate-pulse" /> Start Video Consultation
                                  </button>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(`https://meet.indiacare.com/video/${a.id}`);
                                      setOpenMenuId(null);
                                      showToast(`Video meeting join link copied & sent to ${a.phone}`);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-sky-500/10 hover:text-sky-400 transition-all text-left"
                                  >
                                    <Share2 className="w-4 h-4 text-sky-400" /> Re-Send Video Join Link
                                  </button>
                                </>
                              )}

                              {/* MODE 3: Phone Consult Actions */}
                              {a.mode === 'Phone Consult' && a.status !== 'Cancelled' && (
                                <>
                                  <button
                                    onClick={() => { setSelectedApt(a); setActiveModal('phoneCall'); setOpenMenuId(null); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-purple-300 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 transition-all text-left my-0.5"
                                  >
                                    <PhoneCall className="w-4 h-4 text-purple-400 animate-bounce" /> Start Voice Tele-Consult
                                  </button>
                                  <a
                                    href={`tel:${a.phone}`}
                                    onClick={() => setOpenMenuId(null)}
                                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-purple-500/10 hover:text-purple-400 transition-all text-left"
                                  >
                                    <Phone className="w-4 h-4 text-purple-400" /> Instant Direct Dial
                                  </a>
                                </>
                              )}

                              <div className="h-[1px] my-1 bg-white/10" />
                              <p className="px-3 py-0.5 text-[9px] font-black uppercase tracking-widest text-slate-500">Universal Actions</p>

                              {/* Universal Option 1: View Details */}
                              <button
                                onClick={() => { setSelectedApt(a); setActiveModal('view'); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-emerald-500/15 hover:text-emerald-400 transition-all text-left group"
                              >
                                <Eye className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" /> View Medical Card
                              </button>

                              {/* Universal Option 2: Write/View Prescription */}
                              <button
                                onClick={() => { setSelectedApt(a); setActiveModal('prescription'); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-sky-500/15 hover:text-sky-400 transition-all text-left group"
                              >
                                <Pill className="w-4 h-4 text-sky-400 group-hover:scale-110 transition-transform" />
                                {a.prescription ? 'View Digital Rx' : 'Write Prescription (Rx)'}
                              </button>

                              {/* Universal Option 3: Add Clinical Notes */}
                              <button
                                onClick={() => { setSelectedApt(a); setActiveModal('notes'); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-200 hover:bg-indigo-500/15 hover:text-indigo-400 transition-all text-left group"
                              >
                                <ClipboardList className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" /> Clinical Notes &amp; Vitals
                              </button>

                              {/* Universal Option 4: Switch Mode */}
                              <button
                                onClick={() => { setSelectedApt(a); setActiveModal('switchMode'); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-purple-500/15 hover:text-purple-300 transition-all text-left group"
                              >
                                <RefreshCw className="w-4 h-4 text-purple-400 group-hover:rotate-180 transition-transform" /> Convert Mode
                              </button>

                              {/* Universal Option 5: Reschedule */}
                              <button
                                onClick={() => { setSelectedApt(a); setActiveModal('reschedule'); setOpenMenuId(null); }}
                                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-amber-500/15 hover:text-amber-400 transition-all text-left group"
                              >
                                <CalendarClock className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" /> Reschedule Date/Time
                              </button>

                              {/* Universal Option 6: Mark Completed */}
                              {a.status !== 'Completed' && a.status !== 'Cancelled' && (
                                <button
                                  onClick={() => handleUpdateStatus(a.id, 'Completed')}
                                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-emerald-500/15 transition-all text-left"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mark as Completed
                                </button>
                              )}

                              {/* Universal Option 7: Cancel Appointment */}
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
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ── MODALS SECTION ── */}

      {/* 1. VIEW PATIENT DETAILS MODAL WITH MODE GUIDANCE BANNER */}
      <AnimatePresence>
        {activeModal === 'view' && selectedApt && (
          <ModalOverlay onClose={() => setActiveModal(null)}>
            <div className="p-6 sm:p-7 space-y-6">
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
                      <span className="font-extrabold" style={{ color: modeBadgeStyle(selectedApt.mode).color }}>{selectedApt.mode}</span>
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-extrabold px-3.5 py-1 rounded-full ${statusBadge(selectedApt.status)}`}>
                  {selectedApt.status}
                </span>
              </div>

              {/* 🌟 EXPLICIT DOCTOR MODE GUIDANCE BANNER */}
              <div className="p-4 rounded-2xl border shadow-lg flex items-center gap-3" style={modeBadgeStyle(selectedApt.mode)}>
                <Info className="w-5 h-5 flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-extrabold text-white">Patient Preferred Mode: {selectedApt.mode}</p>
                  <p className="text-[11px] opacity-90 mt-0.5">
                    {selectedApt.mode === 'Clinic Visit' && `Patient will arrive in-person at OPD Chamber (${selectedApt.chamberRoom || 'OPD Room 2B'}). Token #${selectedApt.tokenNo || 14}.`}
                    {selectedApt.mode === 'Video Consult' && 'Patient will connect online via HD Video Meeting link at appointment time.'}
                    {selectedApt.mode === 'Phone Consult' && `Doctor will initiate voice call directly to patient's mobile ${selectedApt.phone}.`}
                  </p>
                </div>
              </div>

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
                  <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Fee Amount</p>
                  <p className="font-extrabold text-emerald-400 text-xs mt-1">₹{selectedApt.fee}</p>
                </div>
              </div>

              {/* Vitals */}
              {selectedApt.vitals && (
                <div className="space-y-2.5">
                  <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> Patient Vitals
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex flex-col items-center text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Blood Pressure</span>
                      <span className="font-black text-rose-300 text-sm mt-0.5">{selectedApt.vitals.bp}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col items-center text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Heart Rate</span>
                      <span className="font-black text-emerald-300 text-sm mt-0.5">{selectedApt.vitals.hr}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex flex-col items-center text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Temperature</span>
                      <span className="font-black text-amber-300 text-sm mt-0.5">{selectedApt.vitals.temp}</span>
                    </div>
                    <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex flex-col items-center text-center">
                      <span className="text-[9px] text-slate-400 uppercase font-bold">Weight</span>
                      <span className="font-black text-indigo-300 text-sm mt-0.5">{selectedApt.vitals.weight}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Reason */}
              <div className="space-y-2">
                <h3 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">Reason for Consultation</h3>
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/10 text-xs text-slate-200 leading-relaxed font-medium">
                  {selectedApt.reason}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                <button
                  onClick={() => setActiveModal('prescription')}
                  className="flex-1 py-3 rounded-2xl text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-500/40 hover:bg-sky-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Pill className="w-4 h-4" /> Digital Rx
                </button>
                <button
                  onClick={() => setActiveModal('notes')}
                  className="flex-1 py-3 rounded-2xl text-xs font-black bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <ClipboardList className="w-4 h-4" /> Edit Chart Notes
                </button>
              </div>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* 2. PRESCRIPTION (Rx) MODAL */}
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

      {/* 3. CLINICAL NOTES MODAL */}
      <AnimatePresence>
        {activeModal === 'notes' && selectedApt && (
          <ClinicalNotesModal
            appointment={selectedApt}
            onClose={() => setActiveModal(null)}
            onSave={(notesData) => {
              setAppointments(prev => prev.map(a => a.id === selectedApt.id ? { ...a, vitals: notesData.vitals, diagnosis: notesData.diagnosis, notes: notesData.notes } : a));
              setActiveModal(null);
              showToast(`Clinical chart saved for ${selectedApt.patient}`);
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

      {/* 6. PHONE CONSULT VOICE CALL MODAL */}
      <AnimatePresence>
        {activeModal === 'phoneCall' && selectedApt && (
          <PhoneCallModal
            appointment={selectedApt}
            onClose={() => setActiveModal(null)}
          />
        )}
      </AnimatePresence>

      {/* 7. CLINIC QUEUE TOKEN MODAL */}
      <AnimatePresence>
        {activeModal === 'token' && selectedApt && (
          <QueueTokenModal
            appointment={selectedApt}
            onClose={() => setActiveModal(null)}
            onUpdate={(tokenNo, chamber, arrival) => {
              setAppointments(prev => prev.map(a => a.id === selectedApt.id ? { ...a, tokenNo, chamberRoom: chamber, arrivalStatus: arrival } : a));
              setActiveModal(null);
              showToast(`Clinic token #${tokenNo} updated for ${selectedApt.patient}`);
            }}
          />
        )}
      </AnimatePresence>

      {/* 8. SWITCH CONSULTATION MODE MODAL */}
      <AnimatePresence>
        {activeModal === 'switchMode' && selectedApt && (
          <SwitchModeModal
            appointment={selectedApt}
            onClose={() => setActiveModal(null)}
            onSwitch={(newMode) => {
              setAppointments(prev => prev.map(a => a.id === selectedApt.id ? { ...a, mode: newMode } : a));
              setActiveModal(null);
              showToast(`Consultation mode converted to ${newMode}`);
            }}
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
/* PHONE CONSULT VOICE CALL MODAL */
/* ───────────────────────────────────────────────────────────── */
function PhoneCallModal({ appointment, onClose }: { appointment: Appointment; onClose: () => void }) {
  const [micOn, setMicOn] = useState(true);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [recording, setRecording] = useState(true);

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6 sm:p-8 space-y-6 text-center">
        <div className="flex items-center justify-between border-b pb-4 border-white/10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping" />
            <h2 className="font-extrabold text-sm text-white">Voice Tele-Consultation</h2>
          </div>
          <span className="text-xs text-purple-400 font-mono font-black bg-purple-500/10 px-3 py-1 rounded-lg border border-purple-500/20">03:42</span>
        </div>

        <div className="py-6 space-y-4">
          <div className="relative w-28 h-28 mx-auto">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-black text-4xl flex items-center justify-center border-4 border-purple-400 shadow-2xl shadow-purple-500/30">
              {appointment.patient[0]}
            </div>
            <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center text-slate-950">
              <PhoneCall className="w-3 h-3" />
            </span>
          </div>

          <div>
            <h3 className="font-black text-lg text-white">{appointment.patient}</h3>
            <p className="text-xs text-purple-400 font-semibold mt-0.5">{appointment.phone}</p>
            <p className="text-[10px] text-slate-400 mt-1">Audio Consult Active · Secure Virtual Line</p>
          </div>

          <div className="flex items-center justify-center gap-1.5 h-8 py-1">
            {[40, 75, 30, 90, 60, 100, 45, 80, 55, 35].map((h, idx) => (
              <motion.div
                key={idx}
                animate={{ height: [`${h}%`, `${(h * 0.4)}%`, `${h}%`] }}
                transition={{ repeat: Infinity, duration: 1 + (idx * 0.1) }}
                className="w-1.5 bg-purple-400 rounded-full"
              />
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2">
          <button
            onClick={() => setMicOn(!micOn)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${micOn ? 'bg-white/10 text-white border border-white/15' : 'bg-red-500/20 text-red-400 border border-red-500/40'}`}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setSpeakerOn(!speakerOn)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${speakerOn ? 'bg-white/10 text-white border border-white/15' : 'bg-white/5 text-slate-500 border border-white/10'}`}
          >
            {speakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            onClick={() => setRecording(!recording)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${recording ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/5 text-slate-500'}`}
            title="Toggle Call Recording"
          >
            <Radio className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="w-14 h-14 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white flex items-center justify-center shadow-xl shadow-red-500/30 transition-all border border-red-400"
            title="End Audio Consult"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ───────────────────────────────────────────────────────────── */
/* CLINIC QUEUE TOKEN & ROOM MODAL */
/* ───────────────────────────────────────────────────────────── */
function QueueTokenModal({ appointment, onClose, onUpdate }: { appointment: Appointment; onClose: () => void; onUpdate: (tokenNo: number, chamber: string, arrivalStatus: any) => void }) {
  const [tokenNo, setTokenNo] = useState(appointment.tokenNo || 14);
  const [chamber, setChamber] = useState(appointment.chamberRoom || 'OPD Room 2B');
  const [arrival, setArrival] = useState<any>(appointment.arrivalStatus || 'Waiting in Reception');

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6 sm:p-7 space-y-5">
        <div className="flex items-center gap-3 border-b pb-4 border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
            <Ticket className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-base text-white">Clinic Queue &amp; Token Manager</h2>
            <p className="text-xs text-slate-400">Patient: <strong className="text-white">{appointment.patient}</strong> (In-Person Clinic Visit)</p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/30 text-center space-y-1">
          <p className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Assigned OPD Token</p>
          <p className="text-3xl font-black text-white">#{tokenNo}</p>
          <p className="text-xs text-slate-300 font-semibold">{chamber}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 block">Token Number</label>
            <input
              type="number"
              value={tokenNo}
              onChange={e => setTokenNo(Number(e.target.value))}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900/90 border border-white/10"
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1 block">Chamber Room</label>
            <input
              type="text"
              value={chamber}
              onChange={e => setChamber(e.target.value)}
              placeholder="e.g. OPD Room 2B"
              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-900/90 border border-white/10"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1.5 block">Reception Arrival Status</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Waiting in Reception',
              'In Doctor Chamber',
              'Completed',
              'Not Arrived'
            ].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setArrival(st)}
                className={`p-2.5 rounded-xl text-xs font-bold border transition-all text-left flex items-center justify-between ${arrival === st ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300' : 'bg-slate-900/90 border-white/10 text-slate-400 hover:text-white'}`}
              >
                {st}
                {arrival === st && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-white/10">
          <button
            onClick={() => onUpdate(tokenNo, chamber, arrival)}
            className="flex-1 py-3.5 rounded-2xl font-black text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Save Token Info &amp; Notify Reception
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* ───────────────────────────────────────────────────────────── */
/* SWITCH CONSULTATION MODE MODAL */
/* ───────────────────────────────────────────────────────────── */
function SwitchModeModal({ appointment, onClose, onSwitch }: { appointment: Appointment; onClose: () => void; onSwitch: (newMode: AppointmentMode) => void }) {
  const [selectedMode, setSelectedMode] = useState<AppointmentMode>(appointment.mode);

  const modesList: { mode: AppointmentMode; desc: string; icon: any; color: string }[] = [
    { mode: 'Clinic Visit', desc: 'In-person clinic consultation at doctor chamber', icon: Syringe, color: 'text-emerald-400' },
    { mode: 'Video Consult', desc: 'Online HD 1080p video call consultation', icon: Video, color: 'text-sky-400' },
    { mode: 'Phone Consult', desc: 'Audio tele-consultation over virtual voice line', icon: PhoneCall, color: 'text-purple-400' },
  ];

  return (
    <ModalOverlay onClose={onClose}>
      <div className="p-6 sm:p-7 space-y-5">
        <div className="flex items-center gap-3 border-b pb-4 border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-base text-white">Convert Consultation Mode</h2>
            <p className="text-xs text-slate-400">Patient: <strong className="text-white">{appointment.patient}</strong></p>
          </div>
        </div>

        <div className="space-y-2.5">
          {modesList.map((m) => (
            <div
              key={m.mode}
              onClick={() => setSelectedMode(m.mode)}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${selectedMode === m.mode ? 'bg-purple-500/20 border-purple-400 shadow-lg shadow-purple-500/10' : 'bg-slate-900/90 border-white/10 hover:border-white/20'}`}
            >
              <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${m.color}`}>
                <m.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-extrabold text-sm text-white">{m.mode}</h3>
                <p className="text-[11px] text-slate-400">{m.desc}</p>
              </div>
              {selectedMode === m.mode && <Check className="w-5 h-5 text-purple-400" />}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 pt-3 border-t border-white/10">
          <button
            onClick={() => onSwitch(selectedMode)}
            className="flex-1 py-3.5 rounded-2xl font-black text-xs bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white transition-all shadow-xl shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" /> Convert Mode
          </button>
        </div>
      </div>
    </ModalOverlay>
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
        <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-500/15 via-emerald-500/10 to-transparent border border-sky-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30 font-black text-xl">
              Rx
            </div>
            <div>
              <h2 className="font-black text-base text-white flex items-center gap-2">
                Digital Prescription (Rx)
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

        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-1.5 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Clinical Diagnosis *
          </label>
          <input
            type="text"
            value={diagnosis}
            onChange={e => setDiagnosis(e.target.value)}
            placeholder="e.g. Essential Hypertension / Sinus Tachycardia"
            className="w-full px-4 py-3 rounded-2xl text-xs text-white bg-slate-900/90 border border-white/10 font-semibold"
          />
        </div>

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
                    className="flex-1 px-3.5 py-2 rounded-xl text-xs text-white bg-slate-950 border border-white/10 font-bold"
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

        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between text-xs">
          <span className="text-amber-300 font-bold">Current Slot:</span>
          <span className="text-white font-extrabold">{appointment.date} at {appointment.time}</span>
        </div>

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

          <div className="absolute bottom-4 right-4 w-28 h-20 rounded-2xl bg-slate-900/90 border border-sky-500/40 p-2 flex flex-col items-center justify-center shadow-xl">
            <span className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Doctor Cam</span>
            <span className="text-[10px] text-slate-400">Active</span>
          </div>
        </div>

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
