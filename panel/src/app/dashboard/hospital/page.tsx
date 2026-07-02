'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Stethoscope, Calendar, BarChart2, MapPin, Star, BadgeCheck, Bell, Clock, ArrowRight, Building2, Loader2,
} from 'lucide-react';
import { useHospitalIdentity } from '@/lib/panelIdentity';

const DOCTORS_LIST = [
  { name: 'Cardiology Team', speciality: 'Cardiology', rating: 4.9, appointments: 12, status: 'Active' },
  { name: 'Neurology Team', speciality: 'Neurology', rating: 4.7, appointments: 8, status: 'Active' },
  { name: 'ENT Team', speciality: 'ENT', rating: 4.5, appointments: 5, status: 'Active' },
  { name: 'Dermatology Team', speciality: 'Dermatology', rating: 4.8, appointments: 10, status: 'Active' },
  { name: 'Orthopedics Team', speciality: 'Orthopedics', rating: 4.6, appointments: 7, status: 'On Leave' },
];

export default function HospitalDashboard() {
  const { profile, displayName, loading, error } = useHospitalIdentity();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!profile) {
    return <div className="flex-1 p-6 text-sm text-red-400">{error || 'Hospital profile not found.'}</div>;
  }

  const subtitle = [displayName, profile.accreditations[0] || profile.hospitalType].filter(Boolean).join(' · ');
  const tagline = [profile.hospitalType, profile.location].filter(Boolean).join(' · ');
  const locationLabel = profile.address || profile.location || 'Address pending';
  const departments = profile.departments.length ? profile.departments : ['General Medicine', 'Diagnostics', 'Emergency'];

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-white text-lg">Hospital Dashboard</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold"
            style={{ borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.08)', color: '#22c55e' }}>
            <BadgeCheck className="w-3.5 h-3.5" /> {profile.accreditations[0] || 'Verified Listing'}
          </div>
          <button className="relative w-9 h-9 rounded-xl flex items-center justify-center border" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
            <Bell className="w-4 h-4" style={{ color: '#64748B' }} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="panel-card p-5 mb-6"
          style={{ background: 'linear-gradient(135deg,rgba(18,122,106,0.1) 0%,rgba(7,94,82,0.06) 100%)', border: '1px solid rgba(18,122,106,0.2)' }}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg"
              style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
              <Building2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="font-extrabold text-white text-base">{displayName}</h2>
              <p className="text-xs" style={{ color: '#25B89A' }}>{tagline}</p>
              <div className="flex gap-3 mt-1 text-[10px] flex-wrap" style={{ color: '#64748B' }}>
                <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{locationLabel}</span>
                <span className="flex items-center gap-1"><Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />{profile.rating.toFixed(1)}</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total Beds', value: String(profile.totalBeds) },
              { label: 'Departments', value: String(profile.departments.length) },
              { label: 'Active Doctors', value: String(profile.doctorCount) },
              { label: 'City', value: profile.location || 'N/A' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-lg font-extrabold text-white">{stat.value}</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="panel-card p-5">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4" style={{ color: '#25B89A' }} /> Department Occupancy
            </h3>
            <div className="flex flex-col gap-3">
              {departments.slice(0, 5).map((department, index) => {
                const beds = Math.max(10, Math.round(profile.totalBeds / Math.max(departments.length, 1)));
                const occupancy = Math.min(95, 55 + index * 8);
                const doctors = Math.max(1, Math.round(profile.doctorCount / Math.max(departments.length, 1)));

                return (
                  <div key={department}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-semibold text-white">{department}</span>
                      <span className="text-[10px] font-bold" style={{ color: '#94A3B8' }}>
                        {Math.round((beds * occupancy) / 100)}/{beds} beds · {doctors} doctors
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${occupancy}%` }} transition={{ delay: 0.2 + index * 0.08, duration: 0.7 }}
                        className="h-full rounded-full"
                        style={{ background: occupancy > 85 ? '#ef4444' : occupancy > 70 ? '#f59e0b' : '#22c55e' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="panel-card p-5">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4" style={{ color: '#25B89A' }} /> Today&apos;s OPD
            </h3>
            <div className="flex flex-col gap-2.5">
              {[
                { time: '9:00 AM', dept: departments[0] || 'General Medicine', patient: 'Rahul Sharma', doctor: displayName },
                { time: '10:30 AM', dept: departments[1] || 'Diagnostics', patient: 'Priya Nair', doctor: displayName },
                { time: '11:00 AM', dept: departments[2] || 'Emergency', patient: 'Arjun Patel', doctor: displayName },
                { time: '2:00 PM', dept: departments[0] || 'General Medicine', patient: 'Kavya Reddy', doctor: displayName },
              ].map((appointment) => (
                <div key={`${appointment.time}-${appointment.patient}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                  style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-[10px] font-bold w-14 flex-shrink-0" style={{ color: '#25B89A' }}>{appointment.time}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-white truncate">{appointment.patient}</p>
                    <p className="text-[10px] truncate" style={{ color: '#64748B' }}>{appointment.dept} · {appointment.doctor}</p>
                  </div>
                  <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#2D4150' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="panel-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Stethoscope className="w-4 h-4" style={{ color: '#25B89A' }} /> My Doctors
            </h3>
            <button className="text-[11px] font-bold flex items-center gap-1" style={{ color: '#25B89A' }}>
              Manage All <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Doctor', 'Speciality', 'Rating', 'Today', 'Status'].map((heading) => (
                    <th key={heading} className="pb-2.5 text-[10px] font-black uppercase tracking-widest pr-4" style={{ color: '#2D4150' }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {DOCTORS_LIST.map((doctor, index) => (
                  <motion.tr key={`${doctor.name}-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + index * 0.05 }}
                    className="text-xs border-b hover:bg-white/[0.01] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <td className="py-3 pr-4 font-bold text-white">{doctor.name}</td>
                    <td className="py-3 pr-4" style={{ color: '#94A3B8' }}>{doctor.speciality}</td>
                    <td className="py-3 pr-4 text-yellow-400 font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400" />{doctor.rating}
                    </td>
                    <td className="py-3 pr-4 text-white font-bold">{doctor.appointments} apts</td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${doctor.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                        {doctor.status}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
