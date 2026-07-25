'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Loader2,
  Mail,
  MoreVertical,
  Phone,
  RefreshCw,
  Search,
  ShieldAlert,
  Stethoscope,
  X,
  XCircle,
} from 'lucide-react';
import { panelApi } from '@/lib/api';

const APPOINTMENT_STATUSES = [
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

type AppointmentStatus = typeof APPOINTMENT_STATUSES[number];

type Appointment = {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  doctorId: string | null;
  doctorName: string;
  doctorSpeciality: string;
  doctorPhone: string;
  doctorEmail: string;
  doctorUserId: string | null;
  hospitalId: string | null;
  hospitalName: string;
  hospitalPhone: string;
  hospitalEmail: string;
  hospitalUserId: string | null;
  appointmentDate: string;
  timeSlot: string;
  concern: string;
  status: string;
  workflowStatus: string;
  adminNote: string;
  createdAt: string;
  updatedAt: string;
};

type AppointmentHistory = {
  id: string;
  action: string;
  actorName: string;
  actorRole: string | null;
  createdAt: string;
  details: string | null;
};

type AppointmentDetailResponse = {
  appointment: Appointment;
  history: AppointmentHistory[];
};

type ModalState =
  | { type: 'reschedule'; appointment: Appointment }
  | { type: 'refund'; appointment: Appointment }
  | { type: 'dispute'; appointment: Appointment }
  | null;

const APT_ACTIONS = [
  'View Appointment',
  'Confirm',
  'Reschedule',
  'Send Reminder',
  'Contact Patient',
  'Contact Doctor',
  'Mark Completed',
  'Mark No-show',
  'View History',
  'Initiate Refund',
  'Raise Dispute',
  'Cancel Appointment',
] as const;

const statusInfo: Record<string, { badge: string; dot: string }> = {
  Requested: { badge: 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20', dot: '#818cf8' },
  'Awaiting Doctor Confirmation': { badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/20', dot: '#f59e0b' },
  'Awaiting Patient Confirmation': { badge: 'bg-orange-500/15 text-orange-400 border border-orange-500/20', dot: '#f97316' },
  Confirmed: { badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20', dot: '#22c55e' },
  Rescheduled: { badge: 'bg-sky-500/15 text-sky-400 border border-sky-500/20', dot: '#38bdf8' },
  Completed: { badge: 'bg-teal-500/15 text-teal-400 border border-teal-500/20', dot: '#2dd4bf' },
  'Cancelled by Patient': { badge: 'bg-red-500/15 text-red-400 border border-red-500/20', dot: '#ef4444' },
  'Cancelled by Doctor': { badge: 'bg-rose-500/15 text-rose-400 border border-rose-500/20', dot: '#f43f5e' },
  'No-show': { badge: 'bg-slate-500/15 text-slate-400 border border-slate-500/20', dot: '#94a3b8' },
};

function formatDisplayDate(value: string) {
  if (!value) return 'Not set';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ThreeDotMenu({
  appointment,
  onAction,
}: {
  appointment: Appointment;
  onAction: (action: typeof APT_ACTIONS[number], appointment: Appointment) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    function handler(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }

    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;

    function updateMenuPosition() {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    }

    updateMenuPosition();
    window.addEventListener('resize', updateMenuPosition);
    window.addEventListener('scroll', updateMenuPosition, true);
    return () => {
      window.removeEventListener('resize', updateMenuPosition);
      window.removeEventListener('scroll', updateMenuPosition, true);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        ref={buttonRef}
        onClick={() => setOpen((current) => !current)}
        className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors"
        style={{ color: '#64748B' }}
      >
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              transition={{ duration: 0.13 }}
              className="fixed z-[9999] rounded-2xl border shadow-2xl overflow-hidden"
              style={{
                top: menuPosition.top,
                right: menuPosition.right,
                background: 'var(--bg-surface)',
                borderColor: 'var(--border-color)',
                minWidth: 220,
              }}
            >
              {APT_ACTIONS.map((action) => (
                <button
                  key={action}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-left transition-colors hover:bg-white/5"
                  style={{ color: ['Cancel Appointment'].includes(action) ? '#f87171' : 'var(--text-secondary)' }}
                  onClick={() => {
                    setOpen(false);
                    onAction(action, appointment);
                  }}
                >
                  {action}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function BaseModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} style={{ color: '#64748B' }}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [detail, setDetail] = useState<AppointmentDetailResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [modalState, setModalState] = useState<ModalState>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [actionNote, setActionNote] = useState('');

  async function loadAppointments() {
    try {
      setLoading(true);
      setError('');
      const response = await panelApi<{ appointments: Appointment[] }>('/api/appointments');
      setAppointments(response.appointments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointments');
    } finally {
      setLoading(false);
    }
  }

  async function openDetail(id: string) {
    try {
      const response = await panelApi<AppointmentDetailResponse>(`/api/appointments/${id}`);
      setDetail(response);
      setDetailOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load appointment details');
    }
  }

  useEffect(() => {
    loadAppointments();
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(''), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  const filtered = useMemo(() => {
    return appointments.filter((appointment) => {
      const haystack = [
        appointment.patientName,
        appointment.patientPhone,
        appointment.doctorName,
        appointment.hospitalName,
        appointment.concern,
        appointment.workflowStatus,
      ].join(' ').toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus = statusFilter ? appointment.workflowStatus === statusFilter : true;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const counts = useMemo(
    () => Object.fromEntries(APPOINTMENT_STATUSES.map((status) => [status, appointments.filter((item) => item.workflowStatus === status).length])),
    [appointments]
  );

  const summaryCards = [
    { icon: Calendar, label: 'Total Appointments', value: appointments.length, color: 'bg-indigo-500' },
    {
      icon: Clock,
      label: 'Awaiting Action',
      value: appointments.filter((item) => ['Requested', 'Awaiting Doctor Confirmation', 'Awaiting Patient Confirmation'].includes(item.workflowStatus)).length,
      color: 'bg-amber-500',
    },
    { icon: CheckCircle2, label: 'Confirmed', value: appointments.filter((item) => ['Confirmed', 'Rescheduled'].includes(item.workflowStatus)).length, color: 'bg-emerald-500' },
    {
      icon: XCircle,
      label: 'Closed Cases',
      value: appointments.filter((item) => ['Completed', 'Cancelled by Patient', 'Cancelled by Doctor', 'No-show'].includes(item.workflowStatus)).length,
      color: 'bg-rose-500',
    },
  ];

  async function patchAppointment(id: string, payload: Record<string, unknown>, message: string) {
    try {
      setSaving(true);
      await panelApi(`/api/appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      await loadAppointments();
      if (detail?.appointment.id === id) {
        const response = await panelApi<AppointmentDetailResponse>(`/api/appointments/${id}`);
        setDetail(response);
      }
      setSuccess(message);
      setModalState(null);
      setActionNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
    } finally {
      setSaving(false);
    }
  }

  async function runAction(id: string, action: 'send_reminder' | 'initiate_refund' | 'raise_dispute', note: string, message: string) {
    try {
      setSaving(true);
      await panelApi(`/api/appointments/${id}/actions`, {
        method: 'POST',
        body: JSON.stringify({ action, note }),
      });
      if (detail?.appointment.id === id) {
        const response = await panelApi<AppointmentDetailResponse>(`/api/appointments/${id}`);
        setDetail(response);
      }
      setSuccess(message);
      setModalState(null);
      setActionNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setSaving(false);
    }
  }

  function handleAction(action: typeof APT_ACTIONS[number], appointment: Appointment) {
    setError('');

    if (action === 'View Appointment' || action === 'View History') {
      openDetail(appointment.id);
      return;
    }

    if (action === 'Confirm') {
      patchAppointment(appointment.id, { workflowStatus: 'Confirmed' }, 'Appointment confirmed successfully');
      return;
    }

    if (action === 'Reschedule') {
      setRescheduleDate(appointment.appointmentDate || '');
      setRescheduleTime(appointment.timeSlot || '');
      setActionNote(appointment.adminNote || '');
      setModalState({ type: 'reschedule', appointment });
      return;
    }

    if (action === 'Send Reminder') {
      runAction(appointment.id, 'send_reminder', '', 'Reminder sent successfully');
      return;
    }

    if (action === 'Contact Patient') {
      window.location.href = `tel:${appointment.patientPhone}`;
      return;
    }

    if (action === 'Contact Doctor') {
      if (appointment.doctorPhone) {
        window.location.href = `tel:${appointment.doctorPhone}`;
        return;
      }
      if (appointment.doctorEmail) {
        window.location.href = `mailto:${appointment.doctorEmail}`;
        return;
      }
      setError('Doctor contact details are not available');
      return;
    }

    if (action === 'Mark Completed') {
      patchAppointment(appointment.id, { workflowStatus: 'Completed' }, 'Appointment marked as completed');
      return;
    }

    if (action === 'Mark No-show') {
      patchAppointment(appointment.id, { workflowStatus: 'No-show' }, 'Appointment marked as no-show');
      return;
    }

    if (action === 'Initiate Refund') {
      setActionNote('');
      setModalState({ type: 'refund', appointment });
      return;
    }

    if (action === 'Raise Dispute') {
      setActionNote('');
      setModalState({ type: 'dispute', appointment });
      return;
    }

    if (action === 'Cancel Appointment') {
      patchAppointment(appointment.id, { workflowStatus: 'Cancelled by Doctor' }, 'Appointment cancelled successfully');
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Appointments</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Live appointment requests and confirmed bookings from website and panel</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        {success && (
          <div className="mb-4 rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
            {success}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-2xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {summaryCards.map((item) => (
            <div key={item.label} className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="panel-card p-4 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#64748B' }}>Filter by Status</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
              style={!statusFilter
                ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              All ({appointments.length})
            </button>
            {APPOINTMENT_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status === statusFilter ? '' : status)}
                className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap"
                style={statusFilter === status
                  ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                  : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {status} ({counts[status] || 0})
              </button>
            ))}
          </div>
        </div>

        <div className="panel-card overflow-visible">
          <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
              <input
                type="text"
                placeholder="Search appointments..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              onClick={loadAppointments}
              disabled={loading}
              className="text-xs font-bold px-3 py-2 rounded-xl disabled:opacity-60"
              style={{ color: '#25B89A', background: 'rgba(37,184,154,0.10)', border: '1px solid rgba(37,184,154,0.18)' }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} appointments</span>
          </div>

          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No appointments found</p>
              <p className="text-xs mt-1" style={{ color: '#64748B' }}>Website se jo bhi bookings aayengi, yahi list me live dikhengi.</p>
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['ID', 'Patient', 'Contact', 'Doctor', 'Hospital', 'Concern', 'Date & Time', 'Status', 'Updated', 'Action'].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((appointment) => {
                    const info = statusInfo[appointment.workflowStatus] || statusInfo.Requested;
                    return (
                      <tr key={appointment.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-3.5 font-mono text-[10px]" style={{ color: '#25B89A' }}>APT-{appointment.id}</td>
                        <td className="px-4 py-3.5">
                          <p className="font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{appointment.patientName}</p>
                          <p className="text-[10px]" style={{ color: '#64748B' }}>{appointment.patientEmail || 'No email'}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1" style={{ color: '#94A3B8' }}>
                            <Phone className="w-3 h-3" />
                            {appointment.patientPhone}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{appointment.doctorName}</p>
                          <p className="text-[10px]" style={{ color: '#64748B' }}>{appointment.doctorSpeciality || 'Speciality pending'}</p>
                        </td>
                        <td className="px-4 py-3.5 max-w-[180px]">
                          <p className="truncate" style={{ color: 'var(--text-primary)' }}>{appointment.hospitalName}</p>
                          <p className="text-[10px] truncate" style={{ color: '#64748B' }}>{appointment.hospitalPhone || 'No hospital phone'}</p>
                        </td>
                        <td className="px-4 py-3.5 max-w-[180px]">
                          <p className="truncate" style={{ color: '#94A3B8' }}>{appointment.concern || 'No concern added'}</p>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{formatDisplayDate(appointment.appointmentDate)}</p>
                          <p style={{ color: '#64748B' }}>{appointment.timeSlot}</p>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: info.dot }} />
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${info.badge}`}>{appointment.workflowStatus}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#64748B' }}>{formatDateTime(appointment.updatedAt)}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1">
                            <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: '#25B89A' }} onClick={() => openDetail(appointment.id)}>
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <ThreeDotMenu appointment={appointment} onAction={handleAction} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {detailOpen && detail && (
          <BaseModal title={`Appointment · ${detail.appointment.patientName}`} onClose={() => setDetailOpen(false)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
              <div className="panel-card p-4">
                <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Patient</p>
                <div className="space-y-1" style={{ color: '#94A3B8' }}>
                  <p>{detail.appointment.patientName}</p>
                  <p>{detail.appointment.patientPhone}</p>
                  <p>{detail.appointment.patientEmail || 'No email available'}</p>
                </div>
              </div>
              <div className="panel-card p-4">
                <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Doctor & Hospital</p>
                <div className="space-y-1" style={{ color: '#94A3B8' }}>
                  <p>{detail.appointment.doctorName} {detail.appointment.doctorSpeciality ? `· ${detail.appointment.doctorSpeciality}` : ''}</p>
                  <p>{detail.appointment.doctorPhone || detail.appointment.doctorEmail || 'Doctor contact pending'}</p>
                  <p>{detail.appointment.hospitalName}</p>
                  <p>{detail.appointment.hospitalPhone || detail.appointment.hospitalEmail || 'Hospital contact pending'}</p>
                </div>
              </div>
              <div className="panel-card p-4">
                <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Schedule</p>
                <div className="space-y-1" style={{ color: '#94A3B8' }}>
                  <p>{formatDisplayDate(detail.appointment.appointmentDate)} · {detail.appointment.timeSlot}</p>
                  <p>Status: {detail.appointment.workflowStatus}</p>
                  <p>Created: {formatDateTime(detail.appointment.createdAt)}</p>
                  <p>Updated: {formatDateTime(detail.appointment.updatedAt)}</p>
                </div>
              </div>
              <div className="panel-card p-4">
                <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Concern & Admin Note</p>
                <div className="space-y-2" style={{ color: '#94A3B8' }}>
                  <p>{detail.appointment.concern || 'No concern added by patient.'}</p>
                  <p>{detail.appointment.adminNote || 'No admin note added yet.'}</p>
                </div>
              </div>
            </div>

            <div className="panel-card p-4 mt-4">
              <p className="font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                <FileText className="w-4 h-4" /> Activity History
              </p>
              <div className="space-y-3 max-h-72 overflow-y-auto">
                {detail.history.length === 0 ? (
                  <p style={{ color: '#64748B' }}>No appointment activity recorded yet.</p>
                ) : detail.history.map((item) => (
                  <div key={item.id} className="rounded-2xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.action}</p>
                    <p className="text-[11px] mt-1" style={{ color: '#94A3B8' }}>{item.actorName}{item.actorRole ? ` · ${item.actorRole}` : ''}</p>
                    <p className="text-[10px]" style={{ color: '#64748B' }}>{formatDateTime(item.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </BaseModal>
        )}

        {modalState?.type === 'reschedule' && (
          <BaseModal title={`Reschedule · ${modalState.appointment.patientName}`} onClose={() => setModalState(null)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="date"
                value={rescheduleDate}
                onChange={(event) => setRescheduleDate(event.target.value)}
                className="w-full rounded-xl px-3 py-2 text-sm"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              />
              <input
                type="text"
                value={rescheduleTime}
                onChange={(event) => setRescheduleTime(event.target.value)}
                placeholder="e.g. 11:30 AM"
                className="w-full rounded-xl px-3 py-2 text-sm"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              />
            </div>
            <textarea
              value={actionNote}
              onChange={(event) => setActionNote(event.target.value)}
              rows={4}
              placeholder="Add reschedule note for team"
              className="w-full rounded-xl px-3 py-2 text-sm resize-none mt-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={() => patchAppointment(modalState.appointment.id, {
                workflowStatus: 'Rescheduled',
                appointmentDate: rescheduleDate,
                timeSlot: rescheduleTime,
                adminNote: actionNote,
              }, 'Appointment rescheduled successfully')}
              disabled={saving || !rescheduleDate || !rescheduleTime}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}
            >
              {saving ? 'Saving...' : 'Save Reschedule'}
            </button>
          </BaseModal>
        )}

        {modalState?.type === 'refund' && (
          <BaseModal title={`Initiate Refund · ${modalState.appointment.patientName}`} onClose={() => setModalState(null)}>
            <textarea
              value={actionNote}
              onChange={(event) => setActionNote(event.target.value)}
              rows={5}
              placeholder="Add refund reason"
              className="w-full rounded-xl px-3 py-2 text-sm resize-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={() => runAction(modalState.appointment.id, 'initiate_refund', actionNote, 'Refund workflow started successfully')}
              disabled={saving || !actionNote.trim()}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}
            >
              {saving ? 'Saving...' : 'Start Refund'}
            </button>
          </BaseModal>
        )}

        {modalState?.type === 'dispute' && (
          <BaseModal title={`Raise Dispute · ${modalState.appointment.patientName}`} onClose={() => setModalState(null)}>
            <textarea
              value={actionNote}
              onChange={(event) => setActionNote(event.target.value)}
              rows={5}
              placeholder="Describe the issue"
              className="w-full rounded-xl px-3 py-2 text-sm resize-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={() => runAction(modalState.appointment.id, 'raise_dispute', actionNote, 'Dispute raised successfully')}
              disabled={saving || !actionNote.trim()}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}
            >
              {saving ? 'Saving...' : 'Raise Dispute'}
            </button>
          </BaseModal>
        )}
      </main>
    </div>
  );
}
