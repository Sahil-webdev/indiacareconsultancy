'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  Archive,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Eye,
  FileText,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  MoreVertical,
  Phone,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
} from 'lucide-react';
import { panelApi } from '@/lib/api';

type Patient = {
  id: string;
  name: string;
  age: number | null;
  gender: string;
  phone: string;
  email: string;
  city: string;
  concern: string;
  status: string;
  consultantId: string | null;
  consultant: string;
  lastContact: string | null;
  nextFollowup: string | null;
  source: string;
  joined: string;
  internalNotes: string;
};

type PatientLead = {
  id: string;
  concern: string;
  stage: string;
  createdAt: string;
  followUpAt: string | null;
};

type PatientAppointment = {
  id: string;
  appointmentDate: string;
  timeSlot: string;
  status: string;
  createdAt: string;
};

type PatientDetailResponse = {
  patient: Patient;
  leads: PatientLead[];
  appointments: PatientAppointment[];
};

type ConsultantOption = { id: string; name: string; email: string };
type DoctorOption = { id: string; name: string; speciality: string };

type ModalState =
  | { type: 'view'; patientId: string }
  | { type: 'edit'; patient: Patient }
  | { type: 'assign'; patient: Patient }
  | { type: 'appointment'; patient: Patient }
  | { type: 'note'; patient: Patient }
  | null;

const STATUS_FILTERS = ['All', 'Active', 'Inactive', 'Blocked', 'Archived', 'Deletion Requested'] as const;
const PATIENT_ACTIONS = [
  'View Full Profile',
  'Edit Details',
  'Create Consultation Lead',
  'Book Appointment',
  'Assign Consultant',
  'Send WhatsApp',
  'Send Email',
  'Add Internal Note',
  'Block Account',
  'Archive Patient',
  'Request Permanent Deletion',
] as const;

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    Active: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20',
    Inactive: 'bg-slate-500/15 text-slate-400 border border-slate-500/20',
    Blocked: 'bg-red-500/15 text-red-400 border border-red-500/20',
    Archived: 'bg-amber-500/15 text-amber-400 border border-amber-500/20',
    'Deletion Requested': 'bg-rose-500/15 text-rose-400 border border-rose-500/20',
  };
  return styles[status] || styles.Active;
}

function formatDateTime(value: string | null) {
  if (!value) return 'Not available';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ThreeDotMenu({
  patient,
  onAction,
}: {
  patient: Patient;
  onAction: (action: typeof PATIENT_ACTIONS[number], patient: Patient) => void;
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
    function updatePosition() {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    }
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
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
              style={{ top: menuPosition.top, right: menuPosition.right, background: 'var(--bg-surface)', borderColor: 'var(--border-color)', minWidth: 220 }}
            >
              {PATIENT_ACTIONS.map((action) => (
                <button
                  key={action}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-left transition-colors hover:bg-white/5"
                  style={{ color: ['Block Account', 'Archive Patient', 'Request Permanent Deletion'].includes(action) ? '#f87171' : 'var(--text-secondary)' }}
                  onClick={() => {
                    setOpen(false);
                    onAction(action, patient);
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

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [detail, setDetail] = useState<PatientDetailResponse | null>(null);
  const [consultants, setConsultants] = useState<ConsultantOption[]>([]);
  const [doctors, setDoctors] = useState<DoctorOption[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalState, setModalState] = useState<ModalState>(null);
  const [editForm, setEditForm] = useState<Partial<Patient>>({});
  const [appointmentForm, setAppointmentForm] = useState({ doctorId: '', appointmentDate: '', timeSlot: '' });
  const [noteText, setNoteText] = useState('');
  const [assignConsultantId, setAssignConsultantId] = useState('');

  async function loadPatients() {
    try {
      setLoading(true);
      setError('');
      const response = await panelApi<{ patients: Patient[] }>('/api/patients');
      setPatients(response.patients || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patients');
    } finally {
      setLoading(false);
    }
  }

  async function loadOptions() {
    try {
      const response = await panelApi<{ consultants: ConsultantOption[]; doctors: DoctorOption[] }>('/api/patients/meta/options');
      setConsultants(response.consultants || []);
      setDoctors(response.doctors || []);
    } catch {}
  }

  useEffect(() => {
    loadPatients();
    loadOptions();
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(''), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  const filtered = useMemo(() => {
    return patients.filter((patient) => {
      const haystack = `${patient.name} ${patient.city} ${patient.concern} ${patient.id}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || patient.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [patients, search, statusFilter]);

  const activeCount = patients.filter((item) => item.status === 'Active').length;
  const followUpDue = patients.filter((item) => item.nextFollowup && new Date(item.nextFollowup).getTime() <= Date.now()).length;
  const inactiveCount = patients.filter((item) => item.status === 'Inactive').length;

  async function openDetail(patientId: string) {
    try {
      const response = await panelApi<PatientDetailResponse>(`/api/patients/${patientId}`);
      setDetail(response);
      setModalState({ type: 'view', patientId });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load patient details');
    }
  }

  async function patchPatient(patientId: string, payload: Record<string, unknown>, message: string) {
    try {
      setSaving(true);
      const response = await panelApi<{ patient: Patient }>(`/api/patients/${patientId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      setPatients((prev) => prev.map((item) => item.id === patientId ? response.patient : item));
      if (detail?.patient.id === patientId) {
        const refreshed = await panelApi<PatientDetailResponse>(`/api/patients/${patientId}`);
        setDetail(refreshed);
      }
      setSuccess(message);
      setModalState(null);
      setNoteText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update patient');
    } finally {
      setSaving(false);
    }
  }

  async function runPatientAction(patientId: string, payload: Record<string, unknown>, message: string) {
    try {
      setSaving(true);
      await panelApi(`/api/patients/${patientId}/actions`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      await loadPatients();
      if (detail?.patient.id === patientId) {
        const refreshed = await panelApi<PatientDetailResponse>(`/api/patients/${patientId}`);
        setDetail(refreshed);
      }
      setSuccess(message);
      setModalState(null);
      setNoteText('');
      setAppointmentForm({ doctorId: '', appointmentDate: '', timeSlot: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete action');
    } finally {
      setSaving(false);
    }
  }

  function handleAction(action: typeof PATIENT_ACTIONS[number], patient: Patient) {
    setError('');
    if (action === 'View Full Profile') return openDetail(patient.id);
    if (action === 'Edit Details') {
      setEditForm(patient);
      setModalState({ type: 'edit', patient });
      return;
    }
    if (action === 'Create Consultation Lead') {
      return runPatientAction(patient.id, { action: 'create_lead' }, 'Consultation lead created successfully');
    }
    if (action === 'Book Appointment') {
      setAppointmentForm({ doctorId: '', appointmentDate: '', timeSlot: '' });
      setModalState({ type: 'appointment', patient });
      return;
    }
    if (action === 'Assign Consultant') {
      setAssignConsultantId(patient.consultantId || '');
      setModalState({ type: 'assign', patient });
      return;
    }
    if (action === 'Send WhatsApp') {
      const phone = patient.phone.replace(/\D/g, '');
      window.open(`https://wa.me/${phone}`, '_blank', 'noopener,noreferrer');
      return;
    }
    if (action === 'Send Email') {
      window.location.href = `mailto:${patient.email}`;
      return;
    }
    if (action === 'Add Internal Note') {
      setNoteText('');
      setModalState({ type: 'note', patient });
      return;
    }
    if (action === 'Block Account') {
      return patchPatient(patient.id, { status: 'Blocked' }, 'Patient blocked successfully');
    }
    if (action === 'Archive Patient') {
      return patchPatient(patient.id, { status: 'Archived' }, 'Patient archived successfully');
    }
    if (action === 'Request Permanent Deletion') {
      return patchPatient(patient.id, { status: 'Deletion Requested' }, 'Deletion request marked successfully');
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Patients</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>All registered patients synced from leads and appointments</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        {success && <div className="mb-4 rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>{success}</div>}
        {error && <div className="mb-4 rounded-2xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>{error}</div>}

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { icon: Users, label: 'Total Patients', value: patients.length, color: 'bg-indigo-500' },
            { icon: CheckCircle2, label: 'Active', value: activeCount, color: 'bg-emerald-500' },
            { icon: ClipboardList, label: 'Open Cases', value: patients.filter((item) => item.status === 'Active').length, color: 'bg-amber-500' },
            { icon: Calendar, label: 'Follow-ups Due', value: followUpDue, color: 'bg-violet-500' },
            { icon: AlertCircle, label: 'Inactive / Blocked', value: inactiveCount + patients.filter((item) => item.status === 'Blocked').length, color: 'bg-slate-500' },
          ].map((item) => (
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

        <div className="panel-card overflow-visible">
          <div className="flex flex-wrap items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
              <input
                type="text"
                placeholder="Search patients, ID, city..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              />
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                  style={statusFilter === status
                    ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                    : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                >
                  {status}
                </button>
              ))}
            </div>
            <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} patients</span>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['ID', 'Patient', 'Contact', 'City', 'Concern', 'Consultant', 'Last Contact', 'Next Follow-up', 'Status', 'Joined', 'Actions'].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((patient) => (
                    <tr key={patient.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3.5 font-mono text-[10px]" style={{ color: '#25B89A' }}>P{patient.id}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xs flex-shrink-0">
                            {patient.name[0]}
                          </div>
                          <div>
                            <p className="font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{patient.name}</p>
                            <p style={{ color: '#64748B' }}>{patient.age ?? 'NA'}y · {patient.gender || 'Not set'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="flex items-center gap-1" style={{ color: '#94A3B8' }}><Phone className="w-3 h-3" />{patient.phone}</p>
                        <p className="flex items-center gap-1 mt-0.5" style={{ color: '#64748B' }}><Mail className="w-3 h-3" />{patient.email || 'No email'}</p>
                      </td>
                      <td className="px-4 py-3.5"><span className="flex items-center gap-1 whitespace-nowrap" style={{ color: '#94A3B8' }}><MapPin className="w-3 h-3" />{patient.city || 'Unknown'}</span></td>
                      <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{patient.concern || 'General'}</td>
                      <td className="px-4 py-3.5"><span className={`text-[10px] font-semibold ${patient.consultant === 'Unassigned' ? 'text-rose-400' : ''}`} style={{ color: patient.consultant === 'Unassigned' ? undefined : 'var(--text-secondary)' }}>{patient.consultant}</span></td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#64748B' }}>{formatDateTime(patient.lastContact)}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: patient.nextFollowup ? '#25B89A' : '#64748B' }}>{formatDateTime(patient.nextFollowup)}</td>
                      <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusBadge(patient.status)}`}>{patient.status}</span></td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#64748B' }}>{formatDateTime(patient.joined)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors" style={{ color: '#25B89A' }} onClick={() => openDetail(patient.id)}>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <ThreeDotMenu patient={patient} onAction={handleAction} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {modalState?.type === 'view' && detail && (
          <BaseModal title={`Patient Profile · ${detail.patient.name}`} onClose={() => setModalState(null)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
              <div className="panel-card p-4">
                <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Patient Details</p>
                <div className="space-y-1" style={{ color: '#94A3B8' }}>
                  <p>{detail.patient.name} · {detail.patient.age ?? 'NA'} · {detail.patient.gender || 'Not set'}</p>
                  <p>{detail.patient.phone} · {detail.patient.email || 'No email'}</p>
                  <p>{detail.patient.city || 'Unknown city'}</p>
                  <p>Status: {detail.patient.status}</p>
                </div>
              </div>
              <div className="panel-card p-4">
                <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Case Summary</p>
                <div className="space-y-1" style={{ color: '#94A3B8' }}>
                  <p>Concern: {detail.patient.concern || 'General'}</p>
                  <p>Consultant: {detail.patient.consultant}</p>
                  <p>Last contact: {formatDateTime(detail.patient.lastContact)}</p>
                  <p>Next follow-up: {formatDateTime(detail.patient.nextFollowup)}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="panel-card p-4">
                <p className="font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><ClipboardList className="w-4 h-4" /> Leads</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {detail.leads.length === 0 ? <p style={{ color: '#64748B' }}>No leads linked yet.</p> : detail.leads.map((lead) => (
                    <div key={lead.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ color: 'var(--text-primary)' }}>L{lead.id} · {lead.concern}</p>
                      <p className="text-[11px]" style={{ color: '#94A3B8' }}>{lead.stage}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel-card p-4">
                <p className="font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><Calendar className="w-4 h-4" /> Appointments</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {detail.appointments.length === 0 ? <p style={{ color: '#64748B' }}>No appointments linked yet.</p> : detail.appointments.map((appointment) => (
                    <div key={appointment.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ color: 'var(--text-primary)' }}>APT-{appointment.id}</p>
                      <p className="text-[11px]" style={{ color: '#94A3B8' }}>{formatDateTime(appointment.appointmentDate)} · {appointment.timeSlot}</p>
                      <p className="text-[11px]" style={{ color: '#64748B' }}>{appointment.status}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="panel-card p-4 mt-4">
              <p className="font-bold mb-2 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}><FileText className="w-4 h-4" /> Internal Notes</p>
              <div className="whitespace-pre-line text-sm" style={{ color: '#94A3B8' }}>{detail.patient.internalNotes || 'No internal notes added yet.'}</div>
            </div>
          </BaseModal>
        )}

        {modalState?.type === 'edit' && (
          <BaseModal title={`Edit Patient · ${modalState.patient.name}`} onClose={() => setModalState(null)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                ['name', 'Full name'],
                ['phone', 'Phone'],
                ['email', 'Email'],
                ['city', 'City'],
                ['concern', 'Concern'],
                ['gender', 'Gender'],
              ].map(([key, label]) => (
                <input
                  key={key}
                  value={String((editForm as Record<string, unknown>)[key] ?? '')}
                  onChange={(event) => setEditForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  placeholder={label}
                  className="w-full rounded-xl px-3 py-2 text-sm"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
                />
              ))}
              <input
                value={String(editForm.age ?? '')}
                onChange={(event) => setEditForm((prev) => ({ ...prev, age: Number(event.target.value) }))}
                placeholder="Age"
                type="number"
                className="w-full rounded-xl px-3 py-2 text-sm"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              />
              <select
                value={String(editForm.status ?? 'Active')}
                onChange={(event) => setEditForm((prev) => ({ ...prev, status: event.target.value }))}
                className="w-full rounded-xl px-3 py-2 text-sm"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              >
                {STATUS_FILTERS.filter((item) => item !== 'All').map((status) => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <button
              onClick={() => patchPatient(modalState.patient.id, editForm, 'Patient details updated successfully')}
              disabled={saving}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </BaseModal>
        )}

        {modalState?.type === 'assign' && (
          <BaseModal title={`Assign Consultant · ${modalState.patient.name}`} onClose={() => setModalState(null)}>
            <select
              value={assignConsultantId}
              onChange={(event) => setAssignConsultantId(event.target.value)}
              className="w-full rounded-xl px-3 py-2 text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            >
              <option value="">Unassigned</option>
              {consultants.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <button
              onClick={() => patchPatient(modalState.patient.id, { consultantId: assignConsultantId || null }, 'Consultant assigned successfully')}
              disabled={saving}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white"
              style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}
            >
              {saving ? 'Saving...' : 'Save Assignment'}
            </button>
          </BaseModal>
        )}

        {modalState?.type === 'appointment' && (
          <BaseModal title={`Book Appointment · ${modalState.patient.name}`} onClose={() => setModalState(null)}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <select
                value={appointmentForm.doctorId}
                onChange={(event) => setAppointmentForm((prev) => ({ ...prev, doctorId: event.target.value }))}
                className="w-full rounded-xl px-3 py-2 text-sm"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              >
                <option value="">Select doctor</option>
                {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name} · {doctor.speciality}</option>)}
              </select>
              <input
                type="date"
                value={appointmentForm.appointmentDate}
                onChange={(event) => setAppointmentForm((prev) => ({ ...prev, appointmentDate: event.target.value }))}
                className="w-full rounded-xl px-3 py-2 text-sm"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              />
              <input
                type="text"
                value={appointmentForm.timeSlot}
                onChange={(event) => setAppointmentForm((prev) => ({ ...prev, timeSlot: event.target.value }))}
                placeholder="e.g. 11:00 AM"
                className="w-full rounded-xl px-3 py-2 text-sm"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              onClick={() => runPatientAction(modalState.patient.id, { action: 'book_appointment', ...appointmentForm }, 'Appointment booked successfully')}
              disabled={saving || !appointmentForm.appointmentDate || !appointmentForm.timeSlot}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}
            >
              {saving ? 'Saving...' : 'Create Appointment'}
            </button>
          </BaseModal>
        )}

        {modalState?.type === 'note' && (
          <BaseModal title={`Add Internal Note · ${modalState.patient.name}`} onClose={() => setModalState(null)}>
            <textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              rows={5}
              className="w-full rounded-xl px-3 py-2 text-sm resize-none"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
            />
            <button
              onClick={() => runPatientAction(modalState.patient.id, { action: 'add_note', note: noteText }, 'Internal note saved successfully')}
              disabled={saving || !noteText.trim()}
              className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </BaseModal>
        )}
      </main>
    </div>
  );
}
