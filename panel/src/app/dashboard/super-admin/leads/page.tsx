'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Archive,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Clock,
  Eye,
  FileText,
  Flag,
  Loader2,
  MapPin,
  MessageSquare,
  MoreVertical,
  Phone,
  PhoneCall,
  Search,
  Send,
  Stethoscope,
  UserCheck,
  X,
  XCircle,
} from 'lucide-react';
import { panelApi } from '@/lib/api';

const PIPELINE_STAGES = [
  'New',
  'Contact Attempted',
  'Contacted',
  'Qualified',
  'Matching in Progress',
  'Doctor Options Sent',
  'Patient Decision Pending',
  'Appointment Requested',
  'Appointment Confirmed',
  'Follow-up',
  'Converted',
  'Lost',
  'Spam',
] as const;

type PipelineStage = typeof PIPELINE_STAGES[number];

type Lead = {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  patientPhone: string;
  patientWhatsapp: string;
  patientEmail: string;
  patientCity: string;
  patientArea: string;
  mainProblem: string;
  symptoms: string;
  duration: string;
  preferredSpeciality: string;
  preferredLocation: string;
  budgetRange: string;
  preferredDoctorGender: string;
  preferredHospital: string;
  preferredDateTime: string;
  status: string;
  pipelineStage: string;
  assignedConsultantId: string | null;
  assignedConsultantName: string;
  priority: 'High' | 'Medium' | 'Low';
  isSpam: boolean;
  isArchived: boolean;
  followUpAt: string | null;
  lastContactedAt: string | null;
  noteCount: number;
  recommendedDoctorCount: number;
  recommendedHospitalCount: number;
  createdAt: string;
  updatedAt: string;
};

type LeadNote = {
  id: string;
  note: string;
  authorName: string;
  createdAt: string;
};

type LeadDetailResponse = {
  lead: Lead;
  notes: LeadNote[];
  recommendedDoctors: MetaDoctor[];
  recommendedHospitals: MetaHospital[];
};

type MetaConsultant = { id: string; name: string; email: string };
type MetaDoctor = { id: string; name: string; speciality: string; city: string };
type MetaHospital = { id: string; name: string; city: string };

type ModalAction =
  | { type: 'assign'; lead: Lead }
  | { type: 'stage'; lead: Lead }
  | { type: 'note'; lead: Lead }
  | { type: 'recommend'; lead: Lead }
  | { type: 'followup'; lead: Lead }
  | { type: 'appointment'; lead: Lead }
  | null;

const stageColor: Record<string, string> = {
  'New': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
  'Contact Attempted': 'bg-sky-500/15 text-sky-400 border-sky-500/20',
  'Contacted': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/20',
  'Qualified': 'bg-teal-500/15 text-teal-400 border-teal-500/20',
  'Matching in Progress': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  'Doctor Options Sent': 'bg-violet-500/15 text-violet-400 border-violet-500/20',
  'Patient Decision Pending': 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  'Appointment Requested': 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  'Appointment Confirmed': 'bg-green-500/15 text-green-400 border-green-500/20',
  'Follow-up': 'bg-pink-500/15 text-pink-400 border-pink-500/20',
  'Converted': 'bg-emerald-600/20 text-emerald-300 border-emerald-600/30',
  'Lost': 'bg-red-500/15 text-red-400 border-red-500/20',
  'Spam': 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

const budgetBadge = (value: string) => ({
  High: 'bg-violet-500/10 text-violet-400',
  Medium: 'bg-sky-500/10 text-sky-400',
  Low: 'bg-slate-500/10 text-slate-400',
}[value] || 'bg-slate-500/10 text-slate-400');

const priorityColor: Record<string, string> = {
  High: 'text-red-400',
  Medium: 'text-amber-400',
  Low: 'text-slate-400',
};

const LEAD_ACTIONS = [
  'View Lead',
  'Assign Consultant',
  'Change Stage',
  'Add Note',
  'Suggest Doctors',
  'Send Options to Patient',
  'Schedule Follow-up',
  'Call Patient',
  'Send WhatsApp',
  'Create Appointment',
  'Mark Converted',
  'Mark Lost',
  'Mark Spam',
  'Archive',
] as const;

function formatTimeAgo(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const mins = Math.max(1, Math.floor(diffMs / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function ThreeDotMenu({ lead, onAction }: { lead: Lead; onAction: (action: typeof LEAD_ACTIONS[number], lead: Lead) => void }) {
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
      const viewportWidth = window.innerWidth;
      setMenuPosition({
        top: rect.bottom + 8,
        right: Math.max(16, viewportWidth - rect.right),
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
                minWidth: 230,
              }}
            >
              {LEAD_ACTIONS.map((action) => (
                <button
                  key={action}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-left transition-colors hover:bg-white/5"
                  style={{ color: ['Mark Lost', 'Mark Spam', 'Archive'].includes(action) ? '#f87171' : 'var(--text-secondary)' }}
                  onClick={() => {
                    setOpen(false);
                    onAction(action, lead);
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
      className="fixed inset-0 z-[70] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [modalAction, setModalAction] = useState<ModalAction>(null);
  const [detail, setDetail] = useState<LeadDetailResponse | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [consultants, setConsultants] = useState<MetaConsultant[]>([]);
  const [doctors, setDoctors] = useState<MetaDoctor[]>([]);
  const [hospitals, setHospitals] = useState<MetaHospital[]>([]);
  const [assignConsultantId, setAssignConsultantId] = useState('');
  const [selectedStage, setSelectedStage] = useState<PipelineStage>('New');
  const [noteText, setNoteText] = useState('');
  const [selectedDoctorIds, setSelectedDoctorIds] = useState<string[]>([]);
  const [selectedHospitalIds, setSelectedHospitalIds] = useState<string[]>([]);
  const [followUpAt, setFollowUpAt] = useState('');
  const [appointmentDoctorId, setAppointmentDoctorId] = useState('');
  const [appointmentHospitalId, setAppointmentHospitalId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');

  async function loadLeads() {
    try {
      setLoading(true);
      setError('');
      const response = await panelApi<{ leads: Lead[] }>('/api/leads');
      setLeads(response.leads || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leads');
    } finally {
      setLoading(false);
    }
  }

  async function loadOptions() {
    try {
      const response = await panelApi<{
        consultants: MetaConsultant[];
        doctors: MetaDoctor[];
        hospitals: MetaHospital[];
      }>('/api/leads/meta/options');
      setConsultants(response.consultants || []);
      setDoctors(response.doctors || []);
      setHospitals(response.hospitals || []);
    } catch {}
  }

  useEffect(() => {
    loadLeads();
    loadOptions();
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(''), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  const filtered = useMemo(() => {
    return leads.filter((lead) => {
      const haystack = `${lead.patientName} ${lead.preferredSpeciality} ${lead.patientCity} ${lead.mainProblem}`.toLowerCase();
      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStage = stageFilter ? lead.pipelineStage === stageFilter : true;
      return matchesSearch && matchesStage;
    });
  }, [leads, search, stageFilter]);

  const stageCounts = useMemo(
    () => Object.fromEntries(PIPELINE_STAGES.map((stage) => [stage, leads.filter((lead) => lead.pipelineStage === stage).length])),
    [leads]
  );

  const unassigned = leads.filter((lead) => !lead.assignedConsultantId).length;
  const active = leads.filter((lead) => !['Converted', 'Lost', 'Spam'].includes(lead.pipelineStage) && !lead.isArchived).length;
  const converted = leads.filter((lead) => lead.pipelineStage === 'Converted').length;

  async function openLeadDetail(lead: Lead) {
    try {
      const response = await panelApi<LeadDetailResponse>(`/api/leads/${lead.id}`);
      setDetail(response);
      setDetailOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open lead');
    }
  }

  async function patchLead(leadId: string, payload: Record<string, unknown>, message: string) {
    try {
      setSaving(true);
      await panelApi(`/api/leads/${leadId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });
      await loadLeads();
      if (detail?.lead.id === leadId) {
        const response = await panelApi<LeadDetailResponse>(`/api/leads/${leadId}`);
        setDetail(response);
      }
      setSuccess(message);
      setModalAction(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  async function addNote(leadId: string, note: string) {
    try {
      setSaving(true);
      await panelApi(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      });
      await loadLeads();
      if (detail?.lead.id === leadId) {
        const response = await panelApi<LeadDetailResponse>(`/api/leads/${leadId}`);
        setDetail(response);
      }
      setSuccess('Note added successfully');
      setModalAction(null);
      setNoteText('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add note');
    } finally {
      setSaving(false);
    }
  }

  async function saveRecommendations(leadId: string, sendToPatient: boolean) {
    try {
      setSaving(true);
      await panelApi(`/api/leads/${leadId}/recommendations`, {
        method: 'POST',
        body: JSON.stringify({
          doctorIds: selectedDoctorIds,
          hospitalIds: selectedHospitalIds,
          note: noteText,
          sendToPatient,
        }),
      });
      await loadLeads();
      if (detail?.lead.id === leadId) {
        const response = await panelApi<LeadDetailResponse>(`/api/leads/${leadId}`);
        setDetail(response);
      }
      setSuccess(sendToPatient ? 'Options sent to patient workflow started' : 'Doctor and hospital recommendations saved');
      setModalAction(null);
      setNoteText('');
      setSelectedDoctorIds([]);
      setSelectedHospitalIds([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save recommendations');
    } finally {
      setSaving(false);
    }
  }

  async function createAppointmentFromLead(leadId: string) {
    try {
      setSaving(true);
      await panelApi(`/api/leads/${leadId}/appointment`, {
        method: 'POST',
        body: JSON.stringify({
          doctorId: appointmentDoctorId || null,
          hospitalId: appointmentHospitalId || null,
          appointmentDate,
          timeSlot: appointmentTime,
          note: noteText,
        }),
      });
      await loadLeads();
      setSuccess('Appointment created successfully');
      setModalAction(null);
      setNoteText('');
      setAppointmentDoctorId('');
      setAppointmentHospitalId('');
      setAppointmentDate('');
      setAppointmentTime('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
    } finally {
      setSaving(false);
    }
  }

  function handleAction(action: typeof LEAD_ACTIONS[number], lead: Lead) {
    setError('');
    if (action === 'View Lead') return openLeadDetail(lead);
    if (action === 'Call Patient') {
      window.location.href = `tel:${lead.patientPhone}`;
      return;
    }
    if (action === 'Send WhatsApp') {
      const phone = (lead.patientWhatsapp || lead.patientPhone).replace(/\D/g, '');
      window.open(`https://wa.me/${phone}`, '_blank', 'noopener,noreferrer');
      return;
    }
    if (action === 'Mark Converted') {
      return patchLead(lead.id, { pipelineStage: 'Converted' }, 'Lead marked as converted');
    }
    if (action === 'Mark Lost') {
      return patchLead(lead.id, { pipelineStage: 'Lost' }, 'Lead marked as lost');
    }
    if (action === 'Mark Spam') {
      return patchLead(lead.id, { pipelineStage: 'Spam', isSpam: true }, 'Lead marked as spam');
    }
    if (action === 'Archive') {
      return patchLead(lead.id, { isArchived: true }, 'Lead archived successfully');
    }
    if (action === 'Send Options to Patient') {
      setModalAction({ type: 'recommend', lead });
      setSelectedDoctorIds(detail?.recommendedDoctors?.map((item) => item.id) || []);
      setSelectedHospitalIds(detail?.recommendedHospitals?.map((item) => item.id) || []);
      return;
    }
    if (action === 'Assign Consultant') {
      setAssignConsultantId(lead.assignedConsultantId || '');
      setModalAction({ type: 'assign', lead });
      return;
    }
    if (action === 'Change Stage') {
      setSelectedStage((PIPELINE_STAGES.includes(lead.pipelineStage as PipelineStage) ? lead.pipelineStage : 'New') as PipelineStage);
      setModalAction({ type: 'stage', lead });
      return;
    }
    if (action === 'Add Note') {
      setNoteText('');
      setModalAction({ type: 'note', lead });
      return;
    }
    if (action === 'Suggest Doctors') {
      setSelectedDoctorIds(detail?.recommendedDoctors?.map((item) => item.id) || []);
      setSelectedHospitalIds(detail?.recommendedHospitals?.map((item) => item.id) || []);
      setNoteText('');
      setModalAction({ type: 'recommend', lead });
      return;
    }
    if (action === 'Schedule Follow-up') {
      setFollowUpAt(lead.followUpAt ? lead.followUpAt.slice(0, 16) : '');
      setNoteText('');
      setModalAction({ type: 'followup', lead });
      return;
    }
    if (action === 'Create Appointment') {
      setAppointmentDoctorId('');
      setAppointmentHospitalId('');
      setAppointmentDate('');
      setAppointmentTime('');
      setNoteText('');
      setModalAction({ type: 'appointment', lead });
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Consultation Leads</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Live patient intake requests from website with working action workflow</p>
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
          {[
            { icon: ClipboardList, label: 'Total Leads', value: leads.length, color: 'bg-indigo-500' },
            { icon: AlertCircle, label: 'Unassigned', value: unassigned, color: 'bg-rose-500' },
            { icon: Clock, label: 'Active / In Work', value: active, color: 'bg-amber-500' },
            { icon: CheckCircle2, label: 'Converted', value: converted, color: 'bg-emerald-500' },
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

        <div className="panel-card p-4 mb-4">
          <p className="text-[10px] font-black uppercase tracking-widest mb-3" style={{ color: '#64748B' }}>Filter by Stage</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStageFilter('')}
              className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
              style={!stageFilter
                ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              All ({leads.length})
            </button>
            {PIPELINE_STAGES.map((stage) => (
              <button
                key={stage}
                onClick={() => setStageFilter(stage === stageFilter ? '' : stage)}
                className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                style={stageFilter === stage
                  ? { background: 'rgba(18,122,106,0.3)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                  : { color: '#64748B', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {stage} ({stageCounts[stage] || 0})
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
                placeholder="Search leads..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              />
            </div>
            <button
              onClick={loadLeads}
              disabled={loading}
              className="text-xs font-bold px-3 py-2 rounded-xl disabled:opacity-60"
              style={{ color: '#25B89A', background: 'rgba(37,184,154,0.10)', border: '1px solid rgba(37,184,154,0.18)' }}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} leads</span>
          </div>

          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['ID', 'Patient', 'Contact', 'City', 'Speciality', 'Budget', 'Priority', 'Assigned', 'Stage', 'Notes', 'Time', 'Action'].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((lead) => (
                    <tr key={lead.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3.5 font-mono text-[10px]" style={{ color: '#25B89A' }}>L{lead.id}</td>
                      <td className="px-4 py-3.5 font-semibold whitespace-nowrap" style={{ color: 'var(--text-primary)' }}>{lead.patientName}</td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1" style={{ color: '#94A3B8' }}>
                          <Phone className="w-3 h-3" />
                          {lead.patientPhone}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="flex items-center gap-1" style={{ color: '#94A3B8' }}>
                          <MapPin className="w-3 h-3" />
                          {lead.patientCity}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#94A3B8' }}>{lead.preferredSpeciality}</td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${budgetBadge(lead.budgetRange)}`}>{lead.budgetRange}</span>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-[10px]">
                        <span className={priorityColor[lead.priority]}>{lead.priority}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-semibold ${!lead.assignedConsultantId ? 'text-rose-400' : ''}`} style={{ color: !lead.assignedConsultantId ? undefined : 'var(--text-secondary)' }}>
                          {lead.assignedConsultantName}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border whitespace-nowrap ${stageColor[lead.pipelineStage] ?? ''}`}>
                          {lead.pipelineStage}
                        </span>
                      </td>
                      <td className="px-4 py-3.5" style={{ color: '#64748B' }}>{lead.noteCount}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#64748B' }}>{formatTimeAgo(lead.createdAt)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5" style={{ color: '#25B89A' }} onClick={() => openLeadDetail(lead)}>
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <ThreeDotMenu lead={lead} onAction={handleAction} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {detailOpen && detail && (
          <BaseModal title={`Lead Details · ${detail.lead.patientName}`} onClose={() => setDetailOpen(false)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm">
              <div className="panel-card p-4">
                <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Patient</p>
                <div className="space-y-1" style={{ color: '#94A3B8' }}>
                  <p>{detail.lead.patientName} · {detail.lead.patientAge} · {detail.lead.patientGender}</p>
                  <p>{detail.lead.patientPhone} · {detail.lead.patientEmail}</p>
                  <p>{detail.lead.patientCity}, {detail.lead.patientArea}</p>
                </div>
              </div>
              <div className="panel-card p-4">
                <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Medical Need</p>
                <div className="space-y-1" style={{ color: '#94A3B8' }}>
                  <p>{detail.lead.preferredSpeciality}</p>
                  <p>{detail.lead.mainProblem}</p>
                  <p>{detail.lead.symptoms}</p>
                </div>
              </div>
              <div className="panel-card p-4">
                <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Preferences</p>
                <div className="space-y-1" style={{ color: '#94A3B8' }}>
                  <p>Location: {detail.lead.preferredLocation}</p>
                  <p>Budget: {detail.lead.budgetRange}</p>
                  <p>Date/Time: {detail.lead.preferredDateTime}</p>
                  <p>Hospital: {detail.lead.preferredHospital || 'Not specified'}</p>
                </div>
              </div>
              <div className="panel-card p-4">
                <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Workflow</p>
                <div className="space-y-1" style={{ color: '#94A3B8' }}>
                  <p>Assigned: {detail.lead.assignedConsultantName}</p>
                  <p>Stage: {detail.lead.pipelineStage}</p>
                  <p>Priority: {detail.lead.priority}</p>
                  <p>Follow-up: {detail.lead.followUpAt ? new Date(detail.lead.followUpAt).toLocaleString('en-IN') : 'Not scheduled'}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="panel-card p-4">
                <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Notes</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {detail.notes.length === 0 ? <p style={{ color: '#64748B' }}>No notes yet.</p> : detail.notes.map((note) => (
                    <div key={note.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <p style={{ color: '#94A3B8' }}>{note.note}</p>
                      <p className="text-[10px] mt-1" style={{ color: '#64748B' }}>{note.authorName} · {formatTimeAgo(note.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel-card p-4">
                <p className="font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Recommendations</p>
                <div className="space-y-2" style={{ color: '#94A3B8' }}>
                  <div>
                    <p className="text-xs font-semibold mb-1">Doctors</p>
                    {detail.recommendedDoctors.length === 0 ? <p>No doctors suggested yet.</p> : detail.recommendedDoctors.map((item) => <p key={item.id}>{item.name} · {item.speciality}</p>)}
                  </div>
                  <div>
                    <p className="text-xs font-semibold mb-1">Hospitals</p>
                    {detail.recommendedHospitals.length === 0 ? <p>No hospitals suggested yet.</p> : detail.recommendedHospitals.map((item) => <p key={item.id}>{item.name} · {item.city}</p>)}
                  </div>
                </div>
              </div>
            </div>
          </BaseModal>
        )}

        {modalAction?.type === 'assign' && (
          <BaseModal title={`Assign Consultant · ${modalAction.lead.patientName}`} onClose={() => setModalAction(null)}>
            <div className="space-y-4">
              <select value={assignConsultantId} onChange={(event) => setAssignConsultantId(event.target.value)} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}>
                <option value="">Unassigned</option>
                {consultants.map((consultant) => (
                  <option key={consultant.id} value={consultant.id}>{consultant.name}</option>
                ))}
              </select>
              <button onClick={() => patchLead(modalAction.lead.id, { assignedConsultantId: assignConsultantId || null }, 'Consultant updated successfully')} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
                {saving ? 'Saving...' : 'Save Assignment'}
              </button>
            </div>
          </BaseModal>
        )}

        {modalAction?.type === 'stage' && (
          <BaseModal title={`Change Stage · ${modalAction.lead.patientName}`} onClose={() => setModalAction(null)}>
            <div className="space-y-4">
              <select value={selectedStage} onChange={(event) => setSelectedStage(event.target.value as PipelineStage)} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}>
                {PIPELINE_STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
              </select>
              <button onClick={() => patchLead(modalAction.lead.id, { pipelineStage: selectedStage, touchLead: true }, 'Stage updated successfully')} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
                {saving ? 'Saving...' : 'Update Stage'}
              </button>
            </div>
          </BaseModal>
        )}

        {modalAction?.type === 'note' && (
          <BaseModal title={`Add Note · ${modalAction.lead.patientName}`} onClose={() => setModalAction(null)}>
            <div className="space-y-4">
              <textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} rows={5} className="w-full rounded-xl px-3 py-2 text-sm resize-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              <button onClick={() => addNote(modalAction.lead.id, noteText)} disabled={saving || !noteText.trim()} className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
                {saving ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </BaseModal>
        )}

        {modalAction?.type === 'recommend' && (
          <BaseModal title={`Suggest Doctors & Hospitals · ${modalAction.lead.patientName}`} onClose={() => setModalAction(null)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Doctors</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {doctors.filter((item) => item.speciality.toLowerCase().includes(modalAction.lead.preferredSpeciality.toLowerCase())).map((doctor) => (
                    <label key={doctor.id} className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
                      <input type="checkbox" checked={selectedDoctorIds.includes(doctor.id)} onChange={() => setSelectedDoctorIds((current) => current.includes(doctor.id) ? current.filter((id) => id !== doctor.id) : [...current, doctor.id])} />
                      {doctor.name} · {doctor.city}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Hospitals</p>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {hospitals.filter((item) => item.city.toLowerCase().includes(modalAction.lead.preferredLocation.toLowerCase()) || modalAction.lead.preferredLocation.toLowerCase().includes(item.city.toLowerCase())).map((hospital) => (
                    <label key={hospital.id} className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
                      <input type="checkbox" checked={selectedHospitalIds.includes(hospital.id)} onChange={() => setSelectedHospitalIds((current) => current.includes(hospital.id) ? current.filter((id) => id !== hospital.id) : [...current, hospital.id])} />
                      {hospital.name} · {hospital.city}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} rows={4} className="w-full rounded-xl px-3 py-2 text-sm resize-none mt-4" placeholder="Optional note for this recommendation..." style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            <div className="flex gap-3 mt-4">
              <button onClick={() => saveRecommendations(modalAction.lead.id, false)} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold text-white" style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
                {saving ? 'Saving...' : 'Save Suggestions'}
              </button>
              <button onClick={() => saveRecommendations(modalAction.lead.id, true)} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'rgba(37,184,154,0.10)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}>
                Send Options to Patient
              </button>
            </div>
          </BaseModal>
        )}

        {modalAction?.type === 'followup' && (
          <BaseModal title={`Schedule Follow-up · ${modalAction.lead.patientName}`} onClose={() => setModalAction(null)}>
            <div className="space-y-4">
              <input type="datetime-local" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              <textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} rows={4} className="w-full rounded-xl px-3 py-2 text-sm resize-none" placeholder="Optional follow-up note..." style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              <div className="flex gap-3">
                <button onClick={() => patchLead(modalAction.lead.id, { pipelineStage: 'Follow-up', followUpAt, touchLead: true }, 'Follow-up scheduled successfully')} disabled={saving || !followUpAt} className="px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
                  {saving ? 'Saving...' : 'Schedule Follow-up'}
                </button>
                <button onClick={() => addNote(modalAction.lead.id, noteText)} disabled={saving || !noteText.trim()} className="px-4 py-2 rounded-xl text-sm font-bold" style={{ background: 'rgba(37,184,154,0.10)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}>
                  Save Note Only
                </button>
              </div>
            </div>
          </BaseModal>
        )}

        {modalAction?.type === 'appointment' && (
          <BaseModal title={`Create Appointment · ${modalAction.lead.patientName}`} onClose={() => setModalAction(null)}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <select value={appointmentDoctorId} onChange={(event) => setAppointmentDoctorId(event.target.value)} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}>
                <option value="">Select doctor</option>
                {doctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name} · {doctor.speciality}</option>)}
              </select>
              <select value={appointmentHospitalId} onChange={(event) => setAppointmentHospitalId(event.target.value)} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}>
                <option value="">Select hospital</option>
                {hospitals.map((hospital) => <option key={hospital.id} value={hospital.id}>{hospital.name} · {hospital.city}</option>)}
              </select>
              <input type="date" value={appointmentDate} onChange={(event) => setAppointmentDate(event.target.value)} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              <input type="text" value={appointmentTime} onChange={(event) => setAppointmentTime(event.target.value)} placeholder="e.g. 11:00 AM" className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            </div>
            <textarea value={noteText} onChange={(event) => setNoteText(event.target.value)} rows={4} className="w-full rounded-xl px-3 py-2 text-sm resize-none mt-4" placeholder="Appointment note..." style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            <button onClick={() => createAppointmentFromLead(modalAction.lead.id)} disabled={saving || !appointmentDate || !appointmentTime} className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
              {saving ? 'Creating...' : 'Create Appointment'}
            </button>
          </BaseModal>
        )}
      </main>
    </div>
  );
}
