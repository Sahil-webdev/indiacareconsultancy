'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  BarChart2,
  Building2,
  Calendar,
  Clock,
  Loader2,
  MapPin,
  Star,
  Stethoscope,
  Users,
} from 'lucide-react';
import NotificationBell from '@/components/NotificationBell';
import { useHospitalAnalytics } from '@/lib/hospitalAnalytics';

export default function HospitalDashboard() {
  const { analytics, loading, error } = useHospitalAnalytics();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!analytics) {
    return <div className="flex-1 p-6 text-sm text-red-400">{error || 'Hospital analytics not found.'}</div>;
  }

  const { profile, stats, todayAppointments, departments, doctors } = analytics;
  const subtitle = [profile.name, profile.accreditations[0] || profile.hospitalType].filter(Boolean).join(' · ');
  const locationLabel = profile.address || profile.location || 'Address pending';

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
          <NotificationBell />
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
              <h2 className="font-extrabold text-white text-base">{profile.name}</h2>
              <p className="text-xs" style={{ color: '#25B89A' }}>{profile.hospitalType} · {profile.location}</p>
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
              { label: 'Active Doctors', value: String(stats.activeDoctors) },
              { label: 'Patients Served', value: String(stats.patientsServed) },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-lg font-extrabold text-white">{stat.value}</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { icon: Calendar, label: 'Total Appointments', value: stats.totalAppointments, color: 'bg-indigo-500' },
            { icon: Clock, label: 'Pending', value: stats.pendingAppointments, color: 'bg-amber-500' },
            { icon: BadgeCheck, label: 'Completed', value: stats.completedAppointments, color: 'bg-emerald-500' },
            { icon: Users, label: 'Avg Rating', value: stats.averageRating.toFixed(2), color: 'bg-violet-500' },
          ].map((item, index) => (
            <div key={item.label} className="panel-card p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center`}>
                <item.icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold text-white">{item.value}</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="panel-card p-5">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2 mb-4">
              <BarChart2 className="w-4 h-4" style={{ color: '#25B89A' }} /> Department Performance
            </h3>
            <div className="flex flex-col gap-3">
              {(departments.length ? departments : profile.departments.map((name) => ({ name, appointments: 0, doctorCount: 0, fillRate: 0 }))).slice(0, 5).map((department) => (
                <div key={department.name}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white">{department.name}</span>
                    <span className="text-[10px] font-bold" style={{ color: '#94A3B8' }}>
                      {department.appointments} apts · {department.doctorCount || 0} doctors
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${department.fillRate || 0}%` }}
                      transition={{ duration: 0.7 }}
                      className="h-full rounded-full"
                      style={{ background: department.fillRate > 85 ? '#ef4444' : department.fillRate > 70 ? '#f59e0b' : '#22c55e' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="panel-card p-5">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2 mb-4">
              <Calendar className="w-4 h-4" style={{ color: '#25B89A' }} /> Today&apos;s OPD
            </h3>
            <div className="flex flex-col gap-2.5">
              {todayAppointments.length === 0 ? (
                <div className="px-3 py-6 rounded-xl border text-center text-xs" style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
                  Aaj ke liye koi hospital appointment nahi hai.
                </div>
              ) : (
                todayAppointments.slice(0, 6).map((appointment) => (
                  <div key={`${appointment.id}-${appointment.time}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-[10px] font-bold w-16 flex-shrink-0" style={{ color: '#25B89A' }}>{appointment.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{appointment.patient}</p>
                      <p className="text-[10px] truncate" style={{ color: '#64748B' }}>{appointment.dept} · {appointment.doctor}</p>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md" style={{ color: '#cbd5e1', background: 'rgba(148,163,184,0.12)' }}>
                      {appointment.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="panel-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
              <Stethoscope className="w-4 h-4" style={{ color: '#25B89A' }} /> Affiliated Doctors
            </h3>
            <span className="text-[11px] font-bold flex items-center gap-1" style={{ color: '#25B89A' }}>
              Live Sync <ArrowRight className="w-3 h-3" />
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Doctor', 'Speciality', 'Rating', 'Shift', 'Status'].map((heading) => (
                    <th key={heading} className="pb-2.5 text-[10px] font-black uppercase tracking-widest pr-4" style={{ color: '#2D4150' }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {doctors.slice(0, 6).map((doctor, index) => (
                  <motion.tr key={`${doctor.id}-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="text-xs border-b hover:bg-white/[0.01] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                    <td className="py-3 pr-4 font-bold text-white">{doctor.name}</td>
                    <td className="py-3 pr-4" style={{ color: '#94A3B8' }}>{doctor.speciality}</td>
                    <td className="py-3 pr-4 text-yellow-400 font-bold flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400" />{Number(doctor.rating || 0).toFixed(1)}
                    </td>
                    <td className="py-3 pr-4 text-white font-bold">{doctor.shifts || 'Schedule pending'}</td>
                    <td className="py-3">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                        doctor.status === 'Active' ? 'badge-success' : doctor.status === 'Pending Verification' ? 'badge-warning' : 'badge-default'
                      }`}>
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
