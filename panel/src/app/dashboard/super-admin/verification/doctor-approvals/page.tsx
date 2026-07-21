'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Search, Eye, CheckCircle2, XCircle,
  Clock, AlertCircle, FileText, Download,
  MapPin, Calendar, Phone, X, Globe,
  Loader2, Stethoscope, RefreshCw, Trash2, ShieldCheck,
} from 'lucide-react';
import { panelApi } from '@/lib/api';

type Doctor = {
  id: string;
  name: string;
  speciality: string;
  hospital: string;
  exp: number;
  city: string;
  submitted: string;
  phone: string;
  email: string;
  qualification: string;
  fee: number;
  gender: string;
  consultationType: string;
  availability: string[];
  clinicAddress: string;
  languages: string[];
  bio: string;
  services: string[];
  awards: string[];
  regNo: string;
};

function Toast({ message, type, onDone }: { message: string; type: 'success' | 'error'; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-bold border"
      style={{
        background: type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        borderColor: type === 'success' ? 'rgba(34,197,94,0.35)' : 'rgba(239,68,68,0.35)',
        color: type === 'success' ? '#22c55e' : '#f87171',
        backdropFilter: 'blur(16px)',
        whiteSpace: 'nowrap',
      }}
    >
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      {message}
    </motion.div>
  );
}

function ConfirmModal({
  doctorName, action, onConfirm, onCancel, loading
}: {
  doctorName: string;
  action: 'approve' | 'reject';
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget && !loading) onCancel(); }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="w-full max-w-sm rounded-3xl p-6 shadow-2xl flex flex-col gap-4 mx-4"
        style={{
          background: 'var(--bg-surface)',
          border: action === 'approve' ? '1px solid rgba(34,197,94,0.25)' : '1px solid rgba(239,68,68,0.25)',
        }}
      >
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${action === 'approve' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
          {action === 'approve' ? <ShieldCheck className="w-6 h-6" /> : <Trash2 className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>
            {action === 'approve' ? 'Approve Registration' : 'Reject & Delete'}
          </h3>
          <p className="text-xs mt-1.5 leading-relaxed" style={{ color: '#94A3B8' }}>
            {action === 'approve'
              ? `Approve the registration for "${doctorName}"? They will receive a subscription payment prompt after logging in.`
              : `Permanently reject and delete the registration for "${doctorName}"? This cannot be undone.`
            }
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-all disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50 ${
              action === 'approve' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-rose-600'
            }`}>
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {action === 'approve' ? 'Yes, Approve' : 'Yes, Reject'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProfileModal({
  doctor, onClose, onApprove, onReject, rowLoading
}: {
  doctor: Doctor;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  rowLoading: 'approve' | 'reject' | undefined;
}) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="h-full w-full max-w-2xl overflow-y-auto flex flex-col" style={{ background: 'var(--bg-surface)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>

        <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black text-sm">
              {doctor.name.split(' ')[1]?.[0] || doctor.name[0]}
            </div>
            <div>
              <h2 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>{doctor.name}</h2>
              <p className="text-[10px]" style={{ color: '#64748B' }}>DR-{doctor.id} · Submitted {doctor.submitted}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-white/8 flex items-center justify-center" style={{ color: '#64748B' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-5">
          <section className="panel-card p-4 space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Basic Information</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              {[
                { label: 'Qualification', value: doctor.qualification },
                { label: 'Speciality', value: doctor.speciality },
                { label: 'Experience', value: `${doctor.exp} years` },
                { label: 'Gender', value: doctor.gender },
                { label: 'Consultation Fee', value: `₹${doctor.fee}` },
                { label: 'Consultation Type', value: doctor.consultationType },
                { label: 'MCI Reg. No', value: doctor.regNo },
                { label: 'Hospital', value: doctor.hospital || '—' },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[10px]" style={{ color: '#64748B' }}>{item.label}</p>
                  <p className="font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{item.value || '—'}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="panel-card p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Contact & Location</p>
            <p className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Phone className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />{doctor.phone}</p>
            <p className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Globe className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />{doctor.email}</p>
            <p className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}><MapPin className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400 mt-0.5" />{doctor.clinicAddress ? `${doctor.clinicAddress}, ` : ''}{doctor.city}</p>
          </section>

          {doctor.bio && (
            <section className="panel-card p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Professional Bio</p>
              <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>{doctor.bio}</p>
            </section>
          )}

          {doctor.availability && doctor.availability.length > 0 && (
            <section className="panel-card p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Availability</p>
              <div className="flex flex-wrap gap-2">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <span key={d} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${doctor.availability.includes(d) ? 'text-emerald-400 bg-emerald-500/12 border-emerald-500/20' : 'border-white/5'}`}
                    style={!doctor.availability.includes(d) ? { color: '#334155' } : {}}>{d}</span>
                ))}
              </div>
            </section>
          )}

          <section className="panel-card p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Submitted Documents</p>
            <div className="flex flex-wrap gap-2">
              {['MCI Certificate', 'ID Proof', 'Degree Certificate'].map((d, i) => (
                <button key={i} className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1.5 rounded-xl"
                  style={{ background: 'rgba(37,184,154,0.08)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.15)' }}>
                  <FileText className="w-3 h-3" />{d} <Download className="w-2.5 h-2.5 opacity-60" />
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 p-4 border-t flex gap-3" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--bg-surface)' }}>
          <button onClick={onApprove} disabled={!!rowLoading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
            {rowLoading === 'approve' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Approve Doctor
          </button>
          <button onClick={onReject} disabled={!!rowLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-60"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            {rowLoading === 'reject' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            Reject
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DoctorApprovalsPage() {
  const [search, setSearch] = useState('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [profileOpen, setProfileOpen] = useState<Doctor | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ doctorId: string; doctorName: string; action: 'approve' | 'reject' } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rowLoading, setRowLoading] = useState<Record<string, 'approve' | 'reject'>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => setToast({ message, type });

  const loadPendingDoctors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await panelApi<{ success: boolean; doctors: any[] }>('/api/doctors?approval=pending');
      if (res.success && Array.isArray(res.doctors)) {
        const mapped = res.doctors.map((d): Doctor => ({
          id: String(d.id),
          name: d.name,
          speciality: d.speciality,
          hospital: d.hospitalName || '',
          exp: d.experience || 0,
          city: d.location,
          submitted: new Date(d.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
          phone: d.phone,
          email: d.email,
          qualification: d.qualification,
          fee: Number(d.consultationFee),
          gender: d.gender,
          consultationType: d.consultationType,
          availability: d.availability || [],
          clinicAddress: d.clinicAddress || '',
          languages: d.languages || [],
          bio: d.bio || '',
          services: d.services || [],
          awards: d.awards || [],
          regNo: d.medicalRegistrationNumber,
        }));
        setDoctors(mapped);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load pending doctors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPendingDoctors();
  }, [loadPendingDoctors]);

  const requestAction = (doctorId: string, doctorName: string, action: 'approve' | 'reject') => {
    setConfirmAction({ doctorId, doctorName, action });
  };

  const executeAction = async () => {
    if (!confirmAction) return;
    const { doctorId, doctorName, action } = confirmAction;
    setActionLoading(true);
    setRowLoading(prev => ({ ...prev, [doctorId]: action }));
    try {
      if (action === 'approve') {
        await panelApi(`/api/doctors/${doctorId}`, {
          method: 'PATCH',
          body: JSON.stringify({ isApproved: true }),
        });
        setDoctors(prev => prev.filter(d => d.id !== doctorId));
        if (profileOpen?.id === doctorId) setProfileOpen(null);
        showToast(`${doctorName} approved successfully.`, 'success');
      } else {
        await panelApi(`/api/doctors/${doctorId}`, { method: 'DELETE' });
        setDoctors(prev => prev.filter(d => d.id !== doctorId));
        if (profileOpen?.id === doctorId) setProfileOpen(null);
        showToast(`${doctorName}'s registration rejected and deleted.`, 'error');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : `${action === 'approve' ? 'Approval' : 'Rejection'} failed. Try again.`, 'error');
    } finally {
      setActionLoading(false);
      setRowLoading(prev => { const n = { ...prev }; delete n[doctorId]; return n; });
      setConfirmAction(null);
    }
  };

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.speciality.toLowerCase().includes(search.toLowerCase()) ||
    d.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Doctor Approvals</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Review and verify new doctor partner registrations</p>
        </div>
        <div className="flex items-center gap-3">
          {!loading && (
            <span className="text-xs font-black px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
              {doctors.length} Pending
            </span>
          )}
          <button onClick={loadPendingDoctors} disabled={loading}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/8 transition-all disabled:opacity-40"
            style={{ color: '#64748B', border: '1px solid rgba(255,255,255,0.08)' }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Clock, label: 'Awaiting Review', value: loading ? '…' : doctors.length, color: 'bg-amber-500' },
            { icon: UserCheck, label: 'Approved Doctors', value: 'Active List', color: 'bg-emerald-500' },
            { icon: XCircle, label: 'Rejected', value: 'Deleted', color: 'bg-red-500' },
            { icon: Stethoscope, label: 'MCI Verification', value: 'Online', color: 'bg-orange-500' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}><s.icon className="w-4 h-4 text-white" /></div>
              <div><p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p><p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p></div>
            </motion.div>
          ))}
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        )}

        {error && (
          <div className="flex items-center gap-3 text-sm text-red-400 panel-card p-4 rounded-2xl">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Failed to load approvals</p>
              <p className="text-xs mt-0.5" style={{ color: '#94A3B8' }}>{error}</p>
            </div>
            <button onClick={loadPendingDoctors} className="ml-auto text-xs font-bold text-emerald-400 hover:underline">Retry</button>
          </div>
        )}

        {!loading && !error && (
          <div className="panel-card overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                <input type="text" placeholder="Search by name, speciality, city…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {filtered.length === 0 && (
                <div className="flex flex-col items-center py-14 gap-3 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>No Pending Approvals</p>
                  <p className="text-xs" style={{ color: '#64748B' }}>All doctor registrations have been reviewed.</p>
                </div>
              )}
              {filtered.map((d, i) => {
                const rl = rowLoading[d.id];
                return (
                  <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black text-sm flex-shrink-0">
                      {d.name.split(' ')[1]?.[0] || d.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                        <span className="text-[10px] font-mono" style={{ color: '#25B89A' }}>DR-{d.id}</span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-amber-500/12 text-amber-400 border border-amber-500/20">Pending</span>
                      </div>
                      <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#94A3B8' }}>
                        <Stethoscope className="w-3 h-3 flex-shrink-0" />{d.speciality} · {d.exp}y exp · {d.qualification}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><MapPin className="w-3 h-3" />{d.city}</span>
                        <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><Phone className="w-3 h-3" />{d.phone}</span>
                        <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><Calendar className="w-3 h-3" />Submitted {d.submitted}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setProfileOpen(d)} disabled={!!rl}
                        className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all disabled:opacity-40"
                        style={{ background: 'rgba(37,184,154,0.12)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}>
                        <Eye className="w-3 h-3" /> View
                      </button>
                      <button onClick={() => requestAction(d.id, d.name, 'approve')} disabled={!!rl}
                        className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all disabled:opacity-40"
                        style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                        {rl === 'approve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                        Approve
                      </button>
                      <button onClick={() => requestAction(d.id, d.name, 'reject')} disabled={!!rl}
                        className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl transition-all disabled:opacity-40"
                        style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                        {rl === 'reject' ? <Loader2 className="w-3 h-3 animate-spin" /> : <XCircle className="w-3 h-3" />}
                        Reject
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <AnimatePresence>
        {profileOpen && (
          <ProfileModal
            doctor={profileOpen}
            onClose={() => setProfileOpen(null)}
            onApprove={() => requestAction(profileOpen.id, profileOpen.name, 'approve')}
            onReject={() => requestAction(profileOpen.id, profileOpen.name, 'reject')}
            rowLoading={rowLoading[profileOpen.id]}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmAction && (
          <ConfirmModal
            doctorName={confirmAction.doctorName}
            action={confirmAction.action}
            onConfirm={executeAction}
            onCancel={() => setConfirmAction(null)}
            loading={actionLoading}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
