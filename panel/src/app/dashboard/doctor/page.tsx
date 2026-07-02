'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, Users, Star, DollarSign, Clock, CheckCircle2, MapPin, Video, Loader2,
} from 'lucide-react';
import { useDoctorIdentity } from '@/lib/panelIdentity';

const APPOINTMENTS = [
  { id: 1, patient: 'Rahul Sharma', age: 32, concern: 'Chest pain evaluation', date: 'Jun 18, 2026', time: '10:30 AM', type: 'In-Person', status: 'Confirmed' },
  { id: 2, patient: 'Sunita Devi', age: 58, concern: 'Cardiac follow-up', date: 'Jun 18, 2026', time: '12:00 PM', type: 'Video', status: 'Confirmed' },
  { id: 3, patient: 'Mohan Gupta', age: 45, concern: 'Hypertension management', date: 'Jun 19, 2026', time: '9:00 AM', type: 'In-Person', status: 'Pending' },
  { id: 4, patient: 'Kavya Nair', age: 28, concern: 'Echo cardiogram review', date: 'Jun 20, 2026', time: '2:30 PM', type: 'Video', status: 'Confirmed' },
];

const statusCls = (status: string) => ({
  Confirmed: 'badge-success',
  Pending: 'badge-warning',
  Cancelled: 'badge-danger',
}[status] || '');

function formatCurrency(value: number) {
  return `₹${value.toLocaleString('en-IN')}`;
}

export default function DoctorDashboard() {
  const [filter, setFilter] = useState<'All' | 'Today' | 'Upcoming'>('All');
  const { profile, displayName, initial, loading, error } = useDoctorIdentity();

  const filtered = useMemo(() => APPOINTMENTS.filter((appointment) => {
    if (filter === 'Today') return appointment.date === 'Jun 18, 2026';
    if (filter === 'Upcoming') return appointment.date !== 'Jun 18, 2026';
    return true;
  }), [filter]);

  const subtitle = [displayName, profile?.speciality, profile?.hospitalName || profile?.location].filter(Boolean).join(' · ');
  const experienceLabel = `${profile?.experience || 0} Years Experience`;
  const profileMeta = [profile?.qualification, profile?.speciality, experienceLabel].filter(Boolean).join(' · ');
  const locationLabel = profile?.hospitalName || profile?.location || profile?.clinicAddress || 'Profile location pending';

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!profile) {
    return <div className="flex-1 p-6 text-sm text-red-400">{error || 'Doctor profile not found.'}</div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-white text-lg">Doctor Dashboard</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold text-emerald-400"
            style={{ borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.08)' }}>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {profile.isSubscribed ? 'Subscription Active' : 'Available Today'}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="panel-card p-5 mb-6 flex items-center gap-5"
          style={{ background: 'linear-gradient(135deg, rgba(18,122,106,0.12) 0%, rgba(7,94,82,0.08) 100%)', border: '1px solid rgba(18,122,106,0.2)' }}>
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg"
            style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>{initial}</div>
          <div className="flex-1 min-w-0">
            <h2 className="font-extrabold text-white text-base">{displayName}</h2>
            <p className="text-xs" style={{ color: '#25B89A' }}>{profileMeta}</p>
            <div className="flex flex-wrap gap-3 mt-2 text-[10px]" style={{ color: '#64748B' }}>
              <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{locationLabel}</span>
              <span className="flex items-center gap-1"><Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />{profile.rating.toFixed(1)} Rating</span>
              <span className="flex items-center gap-1"><DollarSign className="w-2.5 h-2.5" />{formatCurrency(profile.consultationFee)} Fee</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 flex-shrink-0">
            <div className="text-center p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-lg font-extrabold text-white">4</p>
              <p className="text-[10px]" style={{ color: '#64748B' }}>Today</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Calendar, label: 'Total Appointments', value: '18', color: 'bg-indigo-500' },
            { icon: Users, label: 'My Patients', value: '124', color: 'bg-violet-500' },
            { icon: CheckCircle2, label: 'Completed Today', value: '6', color: 'bg-emerald-500' },
            { icon: DollarSign, label: 'Consultation Fee', value: formatCurrency(profile.consultationFee), color: 'bg-amber-500' },
          ].map((stat, index) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
              className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className="w-4.5 h-4.5 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-white">{stat.value}</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="panel-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4" style={{ color: '#25B89A' }} /> Appointments
            </h3>
            <div className="flex gap-1 p-0.5 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {(['All', 'Today', 'Upcoming'] as const).map((item) => (
                <button key={item} onClick={() => setFilter(item)}
                  className={`text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all ${filter === item ? 'text-white' : 'text-[#64748B] hover:text-white'}`}
                  style={{ background: filter === item ? 'linear-gradient(135deg,#127A6A,#075E52)' : 'transparent' }}>
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <AnimatePresence>
              {filtered.map((appointment, index) => (
                <motion.div key={appointment.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:border-brand/20"
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)' }}>{appointment.patient[0]}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white">{appointment.patient}</p>
                    <p className="text-[10px] truncate" style={{ color: '#64748B' }}>{appointment.concern} · Age {appointment.age}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-bold text-white">{appointment.date}</p>
                    <p className="text-[10px] flex items-center gap-1 justify-end mt-0.5" style={{ color: '#64748B' }}>
                      <Clock className="w-2.5 h-2.5" />{appointment.time}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {appointment.type === 'Video' ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ color: '#6366f1', background: 'rgba(99,102,241,0.12)' }}>
                        <Video className="w-2.5 h-2.5 inline mr-0.5" />Video
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ color: '#25B89A', background: 'rgba(37,184,154,0.12)' }}>
                        <MapPin className="w-2.5 h-2.5 inline mr-0.5" />In-Person
                      </span>
                    )}
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${statusCls(appointment.status)}`}>{appointment.status}</span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
}
