'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Camera, Edit2, CheckCircle2, Star, BadgeCheck, MapPin, Phone, Mail, Award, Clock } from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';

export default function DoctorProfilePage() {
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'Dr. Ramesh Kumar',
    speciality: 'Cardiology',
    experience: '18',
    fee: '1500',
    phone: '+91 98100 11111',
    email: 'dr.ramesh@apollo.com',
    hospital: 'Apollo Hospitals, Delhi',
    city: 'New Delhi',
    bio: 'Senior cardiologist with 18+ years of clinical expertise in interventional cardiology, heart failure management, and advanced cardiac imaging. Trained at AIIMS Delhi and fellowship from Cleveland Clinic, USA.',
    languages: 'Hindi, English',
    education: 'MBBS, MD (Cardiology) – AIIMS Delhi',
    registrationNo: 'MCI-2005-DL-12345',
  });

  const set = (k: string, v: string) => setProfile(p => ({ ...p, [k]: v }));

  const inputCls = `w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all`;

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <PanelSidebar role="doctor" userName={profile.name} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Manage your public listing and credentials</p>
          </div>
          <button onClick={() => setEditing(e => !e)}
            className="flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-xl"
            style={{ background: editing ? 'rgba(239,68,68,0.8)' : 'linear-gradient(135deg,#127A6A,#075E52)' }}>
            <Edit2 className="w-3.5 h-3.5" /> {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Avatar + quick stats */}
            <div className="flex flex-col gap-5">
              {/* Avatar card */}
              <div className="panel-card p-6 flex flex-col items-center gap-4">
                <div className="relative">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-3xl shadow-xl">
                    R
                  </div>
                  {editing && (
                    <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center border-2 border-white">
                      <Camera className="w-4 h-4 text-slate-600" />
                    </button>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>{profile.name}</p>
                  <p className="text-sm" style={{ color: '#25B89A' }}>{profile.speciality}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-amber-400/15 text-amber-400 border border-amber-400/20 px-2.5 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-amber-400" /> 4.9 Rating
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <BadgeCheck className="w-3 h-3" /> MCI Verified
                  </span>
                </div>
              </div>

              {/* Quick info */}
              <div className="panel-card p-5 flex flex-col gap-3">
                {[
                  { icon: Award,   label: 'Registration', value: profile.registrationNo },
                  { icon: MapPin,  label: 'Location',     value: profile.city },
                  { icon: Phone,   label: 'Phone',        value: profile.phone },
                  { icon: Mail,    label: 'Email',        value: profile.email },
                  { icon: Clock,   label: 'Experience',   value: `${profile.experience} years` },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{item.label}</p>
                      <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Editable fields */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div className="panel-card p-6">
                <h3 className="font-extrabold text-sm mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Professional Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'name' },
                    { label: 'Speciality', key: 'speciality' },
                    { label: 'Experience (years)', key: 'experience' },
                    { label: 'Consultation Fee (₹)', key: 'fee' },
                    { label: 'Hospital / Clinic', key: 'hospital' },
                    { label: 'City', key: 'city' },
                    { label: 'Languages', key: 'languages' },
                    { label: 'Education', key: 'education' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                      {editing ? (
                        <input type="text" value={(profile as Record<string, string>)[f.key]} onChange={e => set(f.key, e.target.value)}
                          className={inputCls} style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                      ) : (
                        <p className="text-sm font-semibold py-2.5 px-3.5 rounded-xl" style={{ background: 'var(--bg-surface-3)', color: 'var(--text-primary)' }}>
                          {(profile as Record<string, string>)[f.key]}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <label className="text-[10px] font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>Professional Bio</label>
                  {editing ? (
                    <textarea rows={4} value={profile.bio} onChange={e => set('bio', e.target.value)}
                      className={`${inputCls} resize-none`}
                      style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} />
                  ) : (
                    <p className="text-sm leading-relaxed py-2.5 px-3.5 rounded-xl" style={{ background: 'var(--bg-surface-3)', color: 'var(--text-secondary)' }}>{profile.bio}</p>
                  )}
                </div>

                {editing && (
                  <button onClick={() => setEditing(false)}
                    className="mt-5 flex items-center gap-2 text-sm font-bold text-white px-6 py-3 rounded-xl"
                    style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
                    <CheckCircle2 className="w-4 h-4" /> Save Changes
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
