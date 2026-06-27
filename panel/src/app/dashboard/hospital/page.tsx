'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Stethoscope, Calendar, BarChart2, MapPin, Star,
  BadgeCheck, Bell, TrendingUp, Users, Clock, ArrowRight
} from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';

const DOCTORS_LIST = [
  { name: 'Dr. Ramesh Kumar',   speciality: 'Cardiology',   rating: 4.9, appointments: 12, status: 'Active' },
  { name: 'Dr. Sunita Sharma',  speciality: 'Neurology',    rating: 4.7, appointments: 8,  status: 'Active' },
  { name: 'Dr. Vikranth Reddy', speciality: 'ENT',          rating: 4.5, appointments: 5,  status: 'Active' },
  { name: 'Dr. Priya Patel',    speciality: 'Dermatology',  rating: 4.8, appointments: 10, status: 'Active' },
  { name: 'Dr. Arun Singh',     speciality: 'Orthopedics',  rating: 4.6, appointments: 7,  status: 'On Leave' },
];

const DEPARTMENTS = [
  { name: 'Cardiology',    beds: 48, occ: 82, doctors: 5 },
  { name: 'Neurology',     beds: 32, occ: 75, doctors: 4 },
  { name: 'Orthopedics',   beds: 36, occ: 68, doctors: 3 },
  { name: 'Dermatology',   beds: 20, occ: 90, doctors: 2 },
  { name: 'Gynecology',    beds: 28, occ: 71, doctors: 3 },
];

export default function HospitalDashboard() {
  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <PanelSidebar role="hospital" userName="Apollo Delhi" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
          <div>
            <h1 className="font-extrabold text-white text-lg">Hospital Dashboard</h1>
            <p className="text-[11px]" style={{ color: '#64748B' }}>Apollo Hospital, Delhi · NABH Accredited</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold"
              style={{ borderColor: 'rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.08)', color: '#22c55e' }}>
              <BadgeCheck className="w-3.5 h-3.5" /> NABH Verified
            </div>
            <button className="relative w-9 h-9 rounded-xl flex items-center justify-center border" style={{ borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
              <Bell className="w-4 h-4" style={{ color: '#64748B' }} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Hospital summary card */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            className="panel-card p-5 mb-6"
            style={{ background: 'linear-gradient(135deg,rgba(18,122,106,0.1) 0%,rgba(7,94,82,0.06) 100%)', border: '1px solid rgba(18,122,106,0.2)' }}>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl flex-shrink-0 shadow-lg"
                style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>A</div>
              <div>
                <h2 className="font-extrabold text-white text-base">Apollo Hospital</h2>
                <p className="text-xs" style={{ color: '#25B89A' }}>Premium Healthcare · Delhi</p>
                <div className="flex gap-3 mt-1 text-[10px]" style={{ color: '#64748B' }}>
                  <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />Sarita Vihar, Delhi</span>
                  <span className="flex items-center gap-1"><Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />4.8</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: 'Total Beds',      value: '450' },
                { label: 'Occupied',        value: '78%' },
                { label: 'Active Doctors',  value: '32' },
                { label: 'OPD Today',       value: '124' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-lg font-extrabold text-white">{s.value}</p>
                  <p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {/* Departments */}
            <div className="panel-card p-5">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 mb-4">
                <BarChart2 className="w-4 h-4" style={{ color: '#25B89A' }} /> Department Occupancy
              </h3>
              <div className="flex flex-col gap-3">
                {DEPARTMENTS.map((dept, i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-semibold text-white">{dept.name}</span>
                      <span className="text-[10px] font-bold" style={{ color: '#94A3B8' }}>
                        {Math.round(dept.beds * dept.occ / 100)}/{dept.beds} beds · {dept.doctors} doctors
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${dept.occ}%` }} transition={{ delay: 0.2 + i * 0.08, duration: 0.7 }}
                        className="h-full rounded-full"
                        style={{ background: dept.occ > 85 ? '#ef4444' : dept.occ > 70 ? '#f59e0b' : '#22c55e' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's appointments */}
            <div className="panel-card p-5">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4" style={{ color: '#25B89A' }} /> Today&apos;s OPD
              </h3>
              <div className="flex flex-col gap-2.5">
                {[
                  { time: '9:00 AM',  dept: 'Cardiology',   patient: 'Rahul Sharma', dr: 'Dr. Kumar' },
                  { time: '10:30 AM', dept: 'Dermatology',  patient: 'Priya Nair',   dr: 'Dr. Patel' },
                  { time: '11:00 AM', dept: 'Neurology',    patient: 'Arjun Patel',  dr: 'Dr. Sharma' },
                  { time: '2:00 PM',  dept: 'ENT',          patient: 'Kavya Reddy',  dr: 'Dr. Reddy' },
                ].map((a, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                    style={{ background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                    <span className="text-[10px] font-bold w-14 flex-shrink-0" style={{ color: '#25B89A' }}>{a.time}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white truncate">{a.patient}</p>
                      <p className="text-[10px] truncate" style={{ color: '#64748B' }}>{a.dept} · {a.dr}</p>
                    </div>
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#2D4150' }} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Doctors list */}
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
                    {['Doctor', 'Speciality', 'Rating', 'Today', 'Status'].map(h => (
                      <th key={h} className="pb-2.5 text-[10px] font-black uppercase tracking-widest pr-4" style={{ color: '#2D4150' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DOCTORS_LIST.map((doc, i) => (
                    <motion.tr key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 + i * 0.05 }}
                      className="text-xs border-b hover:bg-white/[0.01] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="py-3 pr-4 font-bold text-white">{doc.name}</td>
                      <td className="py-3 pr-4" style={{ color: '#94A3B8' }}>{doc.speciality}</td>
                      <td className="py-3 pr-4 text-yellow-400 font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400" />{doc.rating}
                      </td>
                      <td className="py-3 pr-4 text-white font-bold">{doc.appointments} apts</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${doc.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>
                          {doc.status}
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
    </div>
  );
}
