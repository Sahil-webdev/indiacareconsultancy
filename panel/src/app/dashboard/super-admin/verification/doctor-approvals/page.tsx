'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Search, Eye, CheckCircle2, XCircle,
  Clock, AlertCircle, FileText, MessageSquare, Download,
  MapPin, Calendar, Phone, X, Globe, Award,
  Loader2, Stethoscope,
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
  docs: string[];
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

function ProfileModal({ doctor, onClose, onApprove, onReject }: { doctor: Doctor; onClose: () => void; onApprove: () => void; onReject: () => void }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-start justify-end"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="h-full w-full max-w-2xl overflow-y-auto flex flex-col" style={{ background: 'var(--bg-surface)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>

        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b sticky top-0 z-10" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--bg-surface)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black">
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

          {/* Basic Info */}
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
                { label: 'Reg. Number', value: doctor.regNo },
                { label: 'Hospital', value: doctor.hospital || '—' },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-[10px]" style={{ color: '#64748B' }}>{item.label}</p>
                  <p className="font-semibold mt-0.5" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Contact & Location */}
          <section className="panel-card p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Contact & Location</p>
            <p className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Phone className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />{doctor.phone}</p>
            <p className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}><Globe className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400" />{doctor.email}</p>
            <p className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}><MapPin className="w-3.5 h-3.5 flex-shrink-0 text-emerald-400 mt-0.5" />{doctor.clinicAddress}</p>
          </section>

          {/* Availability */}
          {doctor.availability && doctor.availability.length > 0 && (
            <section className="panel-card p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Availability</p>
              <div className="flex flex-wrap gap-2">
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                  <span key={d} className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${doctor.availability.includes(d) ? 'text-emerald-400 bg-emerald-500/12 border-emerald-500/20' : 'border-white/5'}`} style={!doctor.availability.includes(d) ? { color: '#334155' } : {}}>
                    {d}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Bio */}
          {doctor.bio && (
            <section className="panel-card p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>About / Bio</p>
              <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>{doctor.bio}</p>
            </section>
          )}

          {/* Languages */}
          {doctor.languages && doctor.languages.length > 0 && (
            <section className="panel-card p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Languages Spoken</p>
              <div className="flex flex-wrap gap-2">
                {doctor.languages.map((l, i) => (
                  <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>{l}</span>
                ))}
              </div>
            </section>
          )}

          {/* Services */}
          {doctor.services && doctor.services.length > 0 && (
            <section className="panel-card p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Services Offered</p>
              <div className="flex flex-wrap gap-2">
                {doctor.services.map((s, i) => (
                  <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(37,184,154,0.08)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.15)' }}>{s}</span>
                ))}
              </div>
            </section>
          )}

          {/* Awards */}
          {doctor.awards && doctor.awards.length > 0 && (
            <section className="panel-card p-4 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Awards & Recognition</p>
              {doctor.awards.map((a, i) => (
                <p key={i} className="text-xs flex items-center gap-2" style={{ color: '#94A3B8' }}><Award className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />{a}</p>
              ))}
            </section>
          )}

          {/* Documents */}
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

        {/* Sticky Action Footer */}
        <div className="sticky bottom-0 p-4 border-t flex gap-3" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'var(--bg-surface)' }}>
          <button onClick={onApprove} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
            <CheckCircle2 className="w-4 h-4" /> Approve Doctor
          </button>
          <button onClick={onReject} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
            <XCircle className="w-4 h-4" /> Reject
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

  const loadPendingDoctors = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await panelApi<{ success: boolean; doctors: any[] }>('/api/doctors?approval=pending');
      if (res.success && Array.isArray(res.doctors)) {
        // Map backend model to page structure
        const mapped = res.doctors.map((d): Doctor => ({
          id: String(d.id),
          name: d.name,
          speciality: d.speciality,
          hospital: d.hospitalName || '',
          exp: d.experience || 0,
          city: d.location,
          submitted: new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          phone: d.phone,
          email: d.email,
          docs: ['MCI Registration', 'Qualification Certificate'],
          qualification: d.qualification,
          fee: Number(d.consultationFee),
          gender: d.gender,
          consultationType: d.consultationType,
          availability: d.availability || [],
          clinicAddress: d.clinicAddress,
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

  const approveDoctor = async (id: string) => {
    try {
      await panelApi(`/api/doctors/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isApproved: true }),
      });
      setDoctors(prev => prev.filter(d => d.id !== id));
      setProfileOpen(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Approval failed');
    }
  };

  const rejectDoctor = async (id: string) => {
    const confirm = window.confirm('Are you sure you want to reject and delete this doctor registration request?');
    if (!confirm) return;

    try {
      await panelApi(`/api/doctors/${id}`, {
        method: 'DELETE',
      });
      setDoctors(prev => prev.filter(d => d.id !== id));
      setProfileOpen(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Rejection failed');
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
          <p className="text-[11px]" style={{ color: '#64748B' }}>Review and verify new doctor registrations</p>
        </div>
        {!loading && (
          <span className="text-xs font-black px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
            {doctors.length} Pending
          </span>
        )}
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Clock, label: 'Awaiting Review', value: loading ? '…' : doctors.length, color: 'bg-amber-500' },
            { icon: CheckCircle2, label: 'Approved', value: 'Active list', color: 'bg-emerald-500' },
            { icon: XCircle, label: 'Rejected', value: 'Deleted', color: 'bg-red-500' },
            { icon: AlertCircle, label: 'Verified Checks', value: 'MCI Online', color: 'bg-orange-500' },
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
          <div className="flex items-center gap-2 text-sm text-red-400 py-6">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {!loading && !error && (
          <div className="panel-card overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
                <input type="text" placeholder="Search pending approvals…" value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </div>
              <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} pending</span>
            </div>
            <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
              {filtered.length === 0 && (
                <p className="text-xs text-center py-10" style={{ color: '#64748B' }}>No pending doctor approvals</p>
              )}
              {filtered.map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black text-sm flex-shrink-0">
                    {d.name.split(' ')[1]?.[0] || d.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                      <span className="text-[10px] font-mono" style={{ color: '#25B89A' }}>DR-{d.id}</span>
                    </div>
                    <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#94A3B8' }}>
                      <Stethoscope className="w-3 h-3" />{d.speciality} · {d.exp}y exp · {d.hospital || 'Private Clinic'}
                    </p>
                    <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                      <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><MapPin className="w-3 h-3" />{d.city}</span>
                      <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><Phone className="w-3 h-3" />{d.phone}</span>
                      <span className="text-[10px] flex items-center gap-1" style={{ color: '#64748B' }}><Calendar className="w-3 h-3" />Submitted {d.submitted}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => setProfileOpen(d)}
                      className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(37,184,154,0.12)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.2)' }}>
                      <Eye className="w-3 h-3" /> View Profile
                    </button>
                    <button onClick={() => approveDoctor(d.id)}
                      className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(34,197,94,0.12)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                      <CheckCircle2 className="w-3 h-3" /> Approve
                    </button>
                    <button onClick={() => rejectDoctor(d.id)}
                      className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                      style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                      <XCircle className="w-3 h-3" /> Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* View Full Profile Modal */}
      <AnimatePresence>
        {profileOpen && (
          <ProfileModal
            doctor={profileOpen}
            onClose={() => setProfileOpen(null)}
            onApprove={() => approveDoctor(profileOpen.id)}
            onReject={() => rejectDoctor(profileOpen.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
