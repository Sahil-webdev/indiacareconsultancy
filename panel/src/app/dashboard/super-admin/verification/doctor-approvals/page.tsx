'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Search, Eye, CheckCircle2, XCircle,
  Clock, AlertCircle, FileText, MessageSquare,
  MoreVertical, MapPin, Star, Stethoscope, Download,
  Building2, Calendar, Phone, X, Globe, Award, Languages,
  IndianRupee, BadgeCheck,
} from 'lucide-react';

const PENDING_DOCTORS = [
  {
    id: 'DR201', name: 'Dr. Aryan Kapoor', speciality: 'Cardiology', hospital: 'Max Hospital Delhi', exp: 9, city: 'Delhi',
    submitted: 'Jun 19, 2026', phone: '+91 98100 21111', email: 'aryan.kapoor@email.com',
    docs: ['MBBS', 'MD Cardiology', 'MCI Registration'],
    qualification: 'MBBS, MD (Cardiology)', fee: 800, gender: 'Male',
    consultationType: 'Both', availability: ['Mon', 'Wed', 'Fri', 'Sat'],
    clinicAddress: 'A-14, Safdarjung Enclave, New Delhi – 110029',
    languages: ['Hindi', 'English'],
    bio: 'Dr. Aryan Kapoor is a highly experienced cardiologist with 9+ years in interventional cardiology. He specialises in heart failure management, angioplasty, and preventive cardiology. AIIMS graduate with fellowship from UK.',
    services: ['Echocardiography', 'Angiography', 'Holter Monitoring', 'Pacemaker Implantation'],
    awards: ['Best Cardiologist Award 2023', 'Young Doctor of the Year 2021'],
    regNo: 'DMC/R/2015/12345',
  },
  {
    id: 'DR202', name: 'Dr. Sheetal Patel', speciality: 'Gynecology', hospital: 'Cloudnine Bengaluru', exp: 6, city: 'Bengaluru',
    submitted: 'Jun 18, 2026', phone: '+91 98100 22222', email: 'sheetal.patel@email.com',
    docs: ['MBBS', 'DGO', 'Registration'],
    qualification: 'MBBS, DGO', fee: 600, gender: 'Female',
    consultationType: 'Offline', availability: ['Tue', 'Thu', 'Sat'],
    clinicAddress: '45, Indiranagar Main Road, Bengaluru – 560038',
    languages: ['Kannada', 'Hindi', 'English'],
    bio: 'Dr. Sheetal Patel is a dedicated gynecologist with expertise in high-risk pregnancies, laparoscopic surgeries, and women\'s wellness.',
    services: ['Prenatal Care', 'Laparoscopy', 'PCOS Treatment', 'Hysteroscopy'],
    awards: ['Excellence in Women\'s Health 2022'],
    regNo: 'KMC/R/2018/56789',
  },
  {
    id: 'DR203', name: 'Dr. Manish Kumar', speciality: 'Neurology', hospital: 'KIMS Hyderabad', exp: 14, city: 'Hyderabad',
    submitted: 'Jun 18, 2026', phone: '+91 98100 23333', email: 'manish.kumar@email.com',
    docs: ['MBBS', 'MD', 'DM Neurology', 'Registration'],
    qualification: 'MBBS, MD, DM (Neurology)', fee: 1200, gender: 'Male',
    consultationType: 'Both', availability: ['Mon', 'Tue', 'Thu', 'Fri'],
    clinicAddress: '1-8-31/1, PG Road, Begumpet, Hyderabad – 500003',
    languages: ['Telugu', 'Hindi', 'English'],
    bio: 'Senior neurologist with 14 years of experience managing stroke, epilepsy, Parkinson\'s disease, and complex headache disorders.',
    services: ['EEG', 'EMG/NCV', 'Botox for Migraine', 'Deep Brain Stimulation'],
    awards: ['Best Neurologist 2023', 'Research Excellence Award 2020'],
    regNo: 'TSMC/R/2010/99012',
  },
  { id: 'DR204', name: 'Dr. Ritu Singh', speciality: 'Dermatology', hospital: 'Fortis Noida', exp: 5, city: 'Noida', submitted: 'Jun 17, 2026', phone: '+91 98100 24444', email: 'ritu.singh@email.com', docs: ['MBBS', 'MD Derm'], qualification: 'MBBS, MD (Dermatology)', fee: 500, gender: 'Female', consultationType: 'Online', availability: ['Mon', 'Wed', 'Sat'], clinicAddress: 'B-50, Sector 41, Noida – 201303', languages: ['Hindi', 'English'], bio: 'Experienced dermatologist specialising in acne, eczema, hair loss, and cosmetic dermatology.', services: ['Chemical Peel', 'PRP Therapy', 'Laser Treatment', 'Hair Transplant Consultation'], awards: [], regNo: 'UPSMC/R/2019/34512' },
];

type Doctor = typeof PENDING_DOCTORS[0];

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
              {doctor.name.split(' ')[1][0]}
            </div>
            <div>
              <h2 className="font-extrabold text-sm" style={{ color: 'var(--text-primary)' }}>{doctor.name}</h2>
              <p className="text-[10px]" style={{ color: '#64748B' }}>{doctor.id} · Submitted {doctor.submitted}</p>
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
                { label: 'Hospital', value: doctor.hospital },
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

          {/* Bio */}
          <section className="panel-card p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>About / Bio</p>
            <p className="text-xs leading-relaxed" style={{ color: '#94A3B8' }}>{doctor.bio}</p>
          </section>

          {/* Languages */}
          <section className="panel-card p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Languages Spoken</p>
            <div className="flex flex-wrap gap-2">
              {doctor.languages.map((l, i) => (
                <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: '#94A3B8', border: '1px solid rgba(255,255,255,0.08)' }}>{l}</span>
              ))}
            </div>
          </section>

          {/* Services */}
          <section className="panel-card p-4 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#25B89A' }}>Services Offered</p>
            <div className="flex flex-wrap gap-2">
              {doctor.services.map((s, i) => (
                <span key={i} className="text-[10px] font-semibold px-2.5 py-1 rounded-lg" style={{ background: 'rgba(37,184,154,0.08)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.15)' }}>{s}</span>
              ))}
            </div>
          </section>

          {/* Awards */}
          {doctor.awards.length > 0 && (
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
              {doctor.docs.map((d, i) => (
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
          <button onClick={() => {}} className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
            <MessageSquare className="w-4 h-4" /> Request Changes
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
  const [doctors, setDoctors] = useState<Doctor[]>(PENDING_DOCTORS);
  const [profileOpen, setProfileOpen] = useState<Doctor | null>(null);

  const filtered = doctors.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.speciality.toLowerCase().includes(search.toLowerCase()) ||
    d.city.toLowerCase().includes(search.toLowerCase())
  );

  const approveDoctor = (id: string) => { setDoctors(prev => prev.filter(d => d.id !== id)); setProfileOpen(null); };
  const rejectDoctor = (id: string) => { setDoctors(prev => prev.filter(d => d.id !== id)); setProfileOpen(null); };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Doctor Approvals</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Review and verify new doctor registrations</p>
        </div>
        <span className="text-xs font-black px-3 py-1.5 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
          {doctors.length} Pending
        </span>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Clock, label: 'Awaiting Review', value: doctors.length, color: 'bg-amber-500' },
            { icon: CheckCircle2, label: 'Approved Today', value: 3, color: 'bg-emerald-500' },
            { icon: XCircle, label: 'Rejected This Week', value: 1, color: 'bg-red-500' },
            { icon: AlertCircle, label: 'Changes Requested', value: 2, color: 'bg-orange-500' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}><s.icon className="w-4 h-4 text-white" /></div>
              <div><p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p><p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p></div>
            </motion.div>
          ))}
        </div>

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
            {filtered.map((d, i) => (
              <motion.div key={d.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                className="flex items-start gap-4 p-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-black text-sm flex-shrink-0">
                  {d.name.split(' ')[1][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{d.name}</span>
                    <span className="text-[10px] font-mono" style={{ color: '#25B89A' }}>{d.id}</span>
                  </div>
                  <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: '#94A3B8' }}>
                    <Stethoscope className="w-3 h-3" />{d.speciality} · {d.exp}y exp · {d.hospital}
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
                  <button className="flex items-center gap-1.5 text-[10px] font-bold px-3 py-1.5 rounded-xl"
                    style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                    <MessageSquare className="w-3 h-3" /> Changes
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
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
