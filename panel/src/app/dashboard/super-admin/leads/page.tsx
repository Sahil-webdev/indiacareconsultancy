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
  User,
  X,
  XCircle,
  Copy,
  Check,
  Sparkles,
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
  utrNumber?: string | null;
  paymentStatus?: string;
  consultationFee?: number;
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
      className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-6"
      style={{ background: 'rgba(3, 7, 18, 0.85)', backdropFilter: 'blur(10px)' }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl rounded-3xl border border-white/15 shadow-2xl shadow-emerald-950/20 overflow-hidden flex flex-col max-h-[92vh] bg-slate-950 text-slate-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900/90 flex-shrink-0">
          <h3 className="font-black text-base tracking-tight text-white">{title}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto panel-scroll flex-1 space-y-6 bg-slate-950">{children}</div>
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

  const [utrEditVal, setUtrEditVal] = useState('');

  async function openLeadDetail(lead: Lead) {
    try {
      setUtrEditVal(lead.utrNumber || '');
      const response = await panelApi<LeadDetailResponse>(`/api/leads/${lead.id}`);
      setDetail(response);
      setUtrEditVal(response.lead.utrNumber || lead.utrNumber || '');
      setDetailOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to open lead');
    }
  }

  async function handleVerifyPayment(leadId: string, action: 'approve' | 'reject', utrNumberInput?: string) {
    try {
      await panelApi(`/api/leads/${leadId}/verify-payment`, {
        method: 'PATCH',
        body: JSON.stringify({ action, utrNumber: utrNumberInput }),
      });
      setSuccess(`Payment ${action === 'approve' ? 'verified' : 'rejected'} for Lead #L${leadId}`);
      await loadLeads();
      if (detail?.lead.id === leadId) {
        const response = await panelApi<LeadDetailResponse>(`/api/leads/${leadId}`);
        setDetail(response);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify payment');
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
          <p className="text-[11px]" style={{ color: '#64748B' }}>Live patient intake requests from website with ₹9 UPI UTR Verification</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        {success && (
          <div className="mb-4 rounded-2xl px-4 py-3 text-sm font-semibold flex items-center justify-between" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
            <span>{success}</span>
            <button onClick={() => setSuccess('')}><X className="w-4 h-4" /></button>
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-2xl px-4 py-3 text-sm flex items-center justify-between" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
            <span>{error}</span>
            <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
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
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#64748B' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by patient name, phone, city, problem..."
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none"
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
                    {['ID', 'Patient', 'Contact', 'City', 'Speciality', '₹9 UPI / UTR', 'Priority', 'Assigned', 'Stage', 'Time', 'Action'].map((heading) => (
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
                      
                      {/* ₹9 UPI Payment / UTR Column */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {lead.paymentStatus === 'Paid' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> ₹9 Paid &amp; Verified
                          </span>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              {lead.utrNumber ? `₹9 Pending (UTR: ${lead.utrNumber})` : '₹9 Payment Pending'}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleVerifyPayment(lead.id, 'approve', lead.utrNumber || undefined)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-1 shadow hover:bg-emerald-400 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3 h-3" /> Verify
                            </button>
                          </div>
                        )}
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
            <div className="space-y-5">

              {/* 🌟 1. HERO PAYMENT VERIFICATION ACTION BANNER */}
              <div
                className="p-5 rounded-2xl border transition-all space-y-4 shadow-xl"
                style={
                  detail.lead.paymentStatus === 'Paid'
                    ? { background: 'linear-gradient(135deg, rgba(16,185,129,0.18) 0%, rgba(5,150,105,0.12) 100%)', borderColor: 'rgba(16,185,129,0.4)' }
                    : { background: 'linear-gradient(135deg, rgba(245,158,11,0.2) 0%, rgba(180,83,9,0.15) 100%)', borderColor: 'rgba(245,158,11,0.45)' }
                }
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold flex-shrink-0 shadow-inner ${
                      detail.lead.paymentStatus === 'Paid' ? 'bg-emerald-500/25 text-emerald-400 border border-emerald-500/50' : 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                    }`}>
                      {detail.lead.paymentStatus === 'Paid' ? <CheckCircle2 className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h4 className="font-black text-base text-white tracking-tight">
                          {detail.lead.paymentStatus === 'Paid' ? '₹9 Consultation Payment Verified & Approved' : '₹9 Consultation Fee Payment Pending Verification'}
                        </h4>
                        <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                          detail.lead.paymentStatus === 'Paid' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/30 text-amber-200 border border-amber-500/50'
                        }`}>
                          {detail.lead.paymentStatus || 'Pending Verification'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 font-semibold mt-1">
                        Token Consultation Fee: <strong className="text-white font-extrabold">₹{detail.lead.consultationFee || 9}</strong>
                      </p>
                    </div>
                  </div>

                  {/* APPROVE / REJECT BUTTONS */}
                  {detail.lead.paymentStatus !== 'Paid' && (
                    <div className="flex items-center gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleVerifyPayment(detail.lead.id, 'approve', utrEditVal || detail.lead.utrNumber || undefined)}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
                      >
                        <CheckCircle2 className="w-4.5 h-4.5" /> Approve ₹9 Payment
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerifyPayment(detail.lead.id, 'reject')}
                        className="px-4 py-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-red-500/30 transition-all cursor-pointer"
                      >
                        <XCircle className="w-4 h-4 text-red-400" /> Reject
                      </button>
                    </div>
                  )}
                </div>

                {/* UTR Reference Edit & Copy Row */}
                <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 flex-1 max-w-md">
                    <span className="text-slate-300 font-bold uppercase text-[10px] flex-shrink-0">12-Digit UTR Ref:</span>
                    <input
                      type="text"
                      value={utrEditVal}
                      onChange={(e) => setUtrEditVal(e.target.value)}
                      placeholder="Enter / verify 12-digit UTR..."
                      maxLength={20}
                      className="w-full font-mono font-bold text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/15 focus:outline-none focus:border-emerald-500/50 text-xs"
                    />
                  </div>

                  {utrEditVal && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(utrEditVal);
                        setSuccess('UTR copied to clipboard');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 text-emerald-300 hover:text-white border border-white/15 text-[11px] font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" /> Copy UTR
                    </button>
                  )}
                </div>
              </div>

              {/* 🌟 2. GRID INFO CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Patient Credentials Card */}
                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-white/10 pb-2">
                    <User className="w-4 h-4 text-emerald-400" /> Patient Credentials
                  </h4>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Full Name:</span>
                      <span className="font-extrabold text-white text-sm">{detail.lead.patientName}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Age / Gender:</span>
                      <span className="font-bold text-white bg-slate-800/60 px-2.5 py-0.5 rounded-md border border-white/10">{detail.lead.patientAge} yrs · {detail.lead.patientGender}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Mobile Phone:</span>
                      <div className="flex items-center gap-2 font-mono font-bold text-white">
                        <span>{detail.lead.patientPhone}</span>
                        <a href={`tel:${detail.lead.patientPhone}`} className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a href={`https://wa.me/91${detail.lead.patientPhone}`} target="_blank" rel="noreferrer" className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Email Address:</span>
                      <span className="font-semibold text-slate-200">{detail.lead.patientEmail || 'Not provided'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">City / Area:</span>
                      <span className="font-bold text-white">{detail.lead.patientCity}, {detail.lead.patientArea || 'General'}</span>
                    </div>
                  </div>
                </div>

                {/* Medical Need Card */}
                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-white/10 pb-2">
                    <Stethoscope className="w-4 h-4 text-emerald-400" /> Medical Need &amp; Problem
                  </h4>
                  <div className="space-y-2 text-slate-300">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 font-medium">Speciality:</span>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold text-[11px] border border-emerald-500/40">
                        {detail.lead.preferredSpeciality}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium block mb-1">Primary Problem:</span>
                      <p className="font-bold text-white bg-slate-950 p-3 rounded-xl border border-white/10 text-xs leading-relaxed">
                        {detail.lead.mainProblem}
                      </p>
                    </div>
                    {detail.lead.symptoms && (
                      <div>
                        <span className="text-slate-400 font-medium block mb-0.5">Symptoms &amp; Duration:</span>
                        <p className="text-slate-300 italic">{detail.lead.symptoms} ({detail.lead.duration || 'N/A'})</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Patient Preferences Card */}
                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-white/10 pb-2">
                    <MapPin className="w-4 h-4 text-emerald-400" /> Consultation Preferences
                  </h4>
                  <div className="space-y-1.5 text-slate-300">
                    <p className="flex justify-between"><span className="text-slate-400">Preferred Location:</span> <strong className="text-white">{detail.lead.preferredLocation}</strong></p>
                    <p className="flex justify-between"><span className="text-slate-400">Budget Range:</span> <strong className="text-white">{detail.lead.budgetRange}</strong></p>
                    <p className="flex justify-between"><span className="text-slate-400">Preferred Date/Time:</span> <strong className="text-white">{detail.lead.preferredDateTime || 'ASAP'}</strong></p>
                    <p className="flex justify-between"><span className="text-slate-400">Doctor Gender Preference:</span> <strong className="text-white">{detail.lead.preferredDoctorGender}</strong></p>
                    <p className="flex justify-between"><span className="text-slate-400">Hospital / Clinic:</span> <strong className="text-white">{detail.lead.preferredHospital || 'ICC Suggestion'}</strong></p>
                  </div>
                </div>

                {/* Workflow & Assignment Card */}
                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-white/10 pb-2">
                    <UserCheck className="w-4 h-4 text-emerald-400" /> Workflow &amp; Assignment
                  </h4>
                  <div className="space-y-1.5 text-slate-300">
                    <p className="flex justify-between"><span className="text-slate-400">Assigned Consultant:</span> <strong className="text-white">{detail.lead.assignedConsultantName}</strong></p>
                    <p className="flex justify-between"><span className="text-slate-400">Pipeline Stage:</span> <strong className="text-emerald-400">{detail.lead.pipelineStage}</strong></p>
                    <p className="flex justify-between"><span className="text-slate-400">Priority Level:</span> <strong className="text-amber-400">{detail.lead.priority}</strong></p>
                    <p className="flex justify-between"><span className="text-slate-400">Scheduled Follow-up:</span> <strong className="text-white">{detail.lead.followUpAt ? new Date(detail.lead.followUpAt).toLocaleString('en-IN') : 'Not scheduled'}</strong></p>
                  </div>
                </div>
              </div>

              {/* 🌟 3. NOTES & RECOMMENDATIONS SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-3">
                  <h4 className="font-black text-white text-xs uppercase tracking-wider border-b border-white/10 pb-2">Internal Notes ({detail.notes.length})</h4>
                  <div className="space-y-2 max-h-44 overflow-y-auto">
                    {detail.notes.length === 0 ? <p className="text-slate-500 italic">No notes recorded yet.</p> : detail.notes.map((note) => (
                      <div key={note.id} className="rounded-xl p-3 bg-slate-950 border border-white/10">
                        <p className="text-slate-200">{note.note}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{note.authorName} · {formatTimeAgo(note.createdAt)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 space-y-3">
                  <h4 className="font-black text-white text-xs uppercase tracking-wider border-b border-white/10 pb-2">Doctor &amp; Hospital Recommendations</h4>
                  <div className="space-y-2 text-slate-300">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Recommended Doctors</p>
                      {detail.recommendedDoctors.length === 0 ? (
                        <p className="text-slate-500 italic">No doctors suggested yet.</p>
                      ) : (
                        detail.recommendedDoctors.map((item) => (
                          <div key={item.id} className="text-xs font-bold text-emerald-400 bg-slate-950 px-3 py-1.5 rounded-xl border border-white/10 mb-1">
                            {item.name} · {item.speciality} ({item.city})
                          </div>
                        ))
                      )}
                    </div>
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
