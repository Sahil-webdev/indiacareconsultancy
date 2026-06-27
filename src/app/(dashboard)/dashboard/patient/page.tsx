'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, User, MessageSquare, Star, Building2, Calendar,
  FileText, HelpCircle, ChevronRight, BadgeCheck, Stethoscope,
  MapPin, Phone, Bell, Settings, LogOut, ArrowRight,
  Clock, CheckCircle2, Upload, Shield, Zap
} from 'lucide-react';
import { INITIAL_DOCTORS, INITIAL_HOSPITALS } from '@/lib/mockData';

/* ─── Mock patient session ─── */
const PATIENT = {
  name: 'Rahul Sharma',
  email: 'patient@indiacare.com',
  phone: '+91 98765 43210',
  city: 'Delhi',
  age: 32,
  gender: 'Male',
  avatar: 'R',
  consultations: 3,
  appointmentsBooked: 2,
  reportsUploaded: 1,
};

/* ─── Nav items ─── */
const NAV = [
  { id: 'profile',         label: 'My Profile',             icon: User },
  { id: 'consultations',   label: 'My Consultations',        icon: MessageSquare },
  { id: 'doctors',         label: 'Recommended Doctors',     icon: Stethoscope },
  { id: 'hospitals',       label: 'Recommended Hospitals',   icon: Building2 },
  { id: 'appointments',    label: 'My Appointments',         icon: Calendar },
  { id: 'reports',         label: 'Medical Reports',         icon: FileText },
  { id: 'support',         label: 'Support',                 icon: HelpCircle },
];

/* ─── Small stat card ─── */
function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className={`flex items-center gap-3 bg-white rounded-2xl border border-slate-100 p-4 shadow-sm`}>
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xl font-extrabold text-dark-navy leading-none">{value}</p>
        <p className="text-[11px] text-text-grey mt-0.5 font-medium">{label}</p>
      </div>
    </div>
  );
}

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState('profile');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const recommendedDoctors = INITIAL_DOCTORS.filter(d => d.isApproved).slice(0, 3);
  const recommendedHospitals = INITIAL_HOSPITALS.slice(0, 2);

  const mockConsultations = [
    { id: 1, type: 'Cardiologist Needed', status: 'In Progress', date: 'Jun 13, 2026', consultant: 'ICC Consultant', note: 'Looking for a top cardiologist in Delhi under ₹1,500 fee.' },
    { id: 2, type: 'Orthopedic Surgeon', status: 'Completed',   date: 'May 28, 2026', consultant: 'ICC Consultant', note: 'Knee replacement surgery for my father in Mumbai.' },
    { id: 3, type: 'General Health Check', status: 'New',        date: 'Jun 15, 2026', consultant: 'Pending',         note: 'Annual preventive health checkup in Delhi.' },
  ];

  const mockAppointments = [
    { id: 1, doctor: 'Dr. Ramesh Kumar', speciality: 'Cardiology',   date: 'Jun 18, 2026', time: '10:30 AM', hospital: 'Apollo Hospital', status: 'Confirmed' },
    { id: 2, doctor: 'Dr. Priya Nair',   speciality: 'Dermatology',  date: 'Jun 22, 2026', time: '2:00 PM',  hospital: 'Fortis Memorial', status: 'Pending' },
  ];

  const statusBadge = (s: string) => ({
    'In Progress': 'bg-amber-50 text-amber-600 border-amber-200',
    'Completed':   'bg-emerald-50 text-emerald-600 border-emerald-200',
    'New':         'bg-blue-50 text-blue-600 border-blue-200',
    'Confirmed':   'bg-emerald-50 text-emerald-600 border-emerald-200',
    'Pending':     'bg-amber-50 text-amber-600 border-amber-200',
  }[s] || 'bg-slate-50 text-slate-600 border-slate-200');

  return (
    <div className="min-h-screen bg-light-grey flex">

      {/* ── SIDEBAR ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-dark-navy flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shadow-md flex-shrink-0">
              <Heart className="w-4.5 h-4.5 text-white fill-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white tracking-wider block leading-tight">INDIA CARE</span>
              <span className="text-[9px] font-bold text-accent-green tracking-widest block">CONSULTANCY</span>
            </div>
          </Link>
        </div>

        {/* Patient info */}
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-green to-accent-green flex items-center justify-center text-white font-black text-base shadow-md flex-shrink-0">
              {PATIENT.avatar}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-bold leading-tight truncate">{PATIENT.name}</p>
              <p className="text-slate-400 text-[10px] truncate">{PATIENT.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest px-2 mb-3">Patient Menu</p>
          {NAV.map(item => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all mb-1 text-left cursor-pointer ${
                  active ? 'bg-primary-green text-white shadow-md' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-white/10">
          <Link href="/login"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
      )}

      {/* ── MAIN CONTENT ── */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">

        {/* Top bar */}
        <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-slate-100">
              <div className="w-4 h-0.5 bg-slate-600 mb-1 rounded" />
              <div className="w-4 h-0.5 bg-slate-600 mb-1 rounded" />
              <div className="w-4 h-0.5 bg-slate-600 rounded" />
            </button>
            <div>
              <h2 className="font-extrabold text-dark-navy text-sm sm:text-base capitalize">
                {NAV.find(n => n.id === activeTab)?.label ?? 'Dashboard'}
              </h2>
              <p className="text-[10px] text-text-grey">Patient Dashboard · India Care Consultancy</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative w-9 h-9 rounded-xl border border-slate-100 bg-white flex items-center justify-center hover:bg-slate-50">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-red-500 text-white text-[8px] font-black flex items-center justify-center">2</span>
            </button>
            <Link href="/" className="w-9 h-9 rounded-xl border border-slate-100 bg-white flex items-center justify-center hover:bg-slate-50" title="Back to website">
              <ChevronRight className="w-4 h-4 text-slate-600 rotate-180" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>

              {/* ── PROFILE ── */}
              {activeTab === 'profile' && (
                <div className="flex flex-col gap-6">
                  {/* Welcome banner */}
                  <div className="gradient-primary rounded-3xl p-6 sm:p-8 relative overflow-hidden">
                    <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
                    <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                        {PATIENT.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="text-white/75 text-xs font-bold uppercase tracking-widest">Welcome Back</p>
                        <h3 className="text-2xl font-extrabold text-white mt-0.5">{PATIENT.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="flex items-center gap-1 bg-white/15 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                            <MapPin className="w-2.5 h-2.5" /> {PATIENT.city}
                          </span>
                          <span className="flex items-center gap-1 bg-white/15 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                            <User className="w-2.5 h-2.5" /> {PATIENT.gender} · {PATIENT.age} yrs
                          </span>
                          <span className="flex items-center gap-1 bg-emerald-400/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                            <BadgeCheck className="w-2.5 h-2.5" /> Verified Patient
                          </span>
                        </div>
                      </div>
                      <Link href="/book-consultation"
                        className="flex items-center gap-2 bg-white text-primary-green text-xs font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-soft-green transition-colors">
                        <MessageSquare className="w-3.5 h-3.5" /> New Consultation
                      </Link>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard icon={MessageSquare} label="Consultations"   value={PATIENT.consultations}    color="gradient-primary" />
                    <StatCard icon={Calendar}     label="Appointments"    value={PATIENT.appointmentsBooked} color="bg-indigo-500" />
                    <StatCard icon={FileText}     label="Reports Uploaded" value={PATIENT.reportsUploaded}  color="bg-amber-500" />
                    <StatCard icon={Star}         label="Satisfaction"    value="4.9 ★"                       color="bg-rose-500" />
                  </div>

                  {/* Profile card */}
                  <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-extrabold text-dark-navy text-base">Personal Information</h3>
                      <button className="flex items-center gap-1.5 text-xs font-bold text-primary-green hover:text-dark-green transition-colors">
                        <Settings className="w-3.5 h-3.5" /> Edit Profile
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { label: 'Full Name',  value: PATIENT.name,   icon: User },
                        { label: 'Email',      value: PATIENT.email,  icon: MessageSquare },
                        { label: 'Phone',      value: PATIENT.phone,  icon: Phone },
                        { label: 'City',       value: PATIENT.city,   icon: MapPin },
                        { label: 'Age',        value: `${PATIENT.age} years`, icon: User },
                        { label: 'Gender',     value: PATIENT.gender, icon: User },
                      ].map((f, i) => (
                        <div key={i} className="flex items-center gap-3 p-3.5 bg-light-grey rounded-2xl border border-slate-100">
                          <f.icon className="w-4 h-4 text-primary-green flex-shrink-0" />
                          <div>
                            <p className="text-[10px] font-bold text-text-grey uppercase tracking-wide">{f.label}</p>
                            <p className="text-sm font-bold text-dark-navy mt-0.5">{f.value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── CONSULTATIONS ── */}
              {activeTab === 'consultations' && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-dark-navy text-lg">My Consultation Requests</h3>
                    <Link href="/book-consultation"
                      className="flex items-center gap-1.5 text-xs font-bold text-white gradient-primary px-4 py-2.5 rounded-xl shadow-md glow-green">
                      <MessageSquare className="w-3.5 h-3.5" /> New Request
                    </Link>
                  </div>
                  <div className="flex flex-col gap-4">
                    {mockConsultations.map(c => (
                      <div key={c.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:border-primary-green/20 transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <h4 className="font-extrabold text-dark-navy text-sm">{c.type}</h4>
                            <p className="text-[10px] text-text-grey mt-1">Handled by: {c.consultant} · {c.date}</p>
                          </div>
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusBadge(c.status)}`}>{c.status}</span>
                        </div>
                        <p className="text-xs text-text-grey leading-relaxed bg-light-grey rounded-xl p-3 border border-slate-100">{c.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── RECOMMENDED DOCTORS ── */}
              {activeTab === 'doctors' && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <h3 className="font-extrabold text-dark-navy text-lg">Recommended Doctors for You</h3>
                    <Link href="/find-doctor" className="text-xs font-bold text-primary-green hover:text-dark-green flex items-center gap-1">
                      View All <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recommendedDoctors.map(doc => (
                      <div key={doc.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:border-primary-green/20 hover:shadow-md transition-all">
                        <div className="relative aspect-[4/3] overflow-hidden bg-soft-green">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black text-primary-green border border-primary-green/10">
                            95% Match
                          </div>
                        </div>
                        <div className="p-4">
                          <h4 className="font-extrabold text-dark-navy text-sm">{doc.name}</h4>
                          <p className="text-[10px] text-primary-green font-bold mt-0.5">{doc.speciality}</p>
                          <div className="flex items-center gap-2 mt-2 text-[10px] text-text-grey">
                            <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />{doc.rating}</span>
                            <span>· {doc.experience} yrs · ₹{doc.consultationFee}</span>
                          </div>
                          <Link href={`/find-doctor/${doc.id}`}
                            className="mt-3 flex items-center justify-center text-[11px] font-bold text-white gradient-primary py-2 rounded-xl w-full">
                            View Profile
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── RECOMMENDED HOSPITALS ── */}
              {activeTab === 'hospitals' && (
                <div className="flex flex-col gap-5">
                  <h3 className="font-extrabold text-dark-navy text-lg">Recommended Hospitals</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {recommendedHospitals.map(h => (
                      <div key={h.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:border-primary-green/20 hover:shadow-md transition-all">
                        <div className="relative aspect-video overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/50 to-transparent" />
                          <div className="absolute bottom-3 left-3">
                            <h4 className="font-extrabold text-white text-sm">{h.name}</h4>
                            <p className="text-white/80 text-[10px] flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{h.location}</p>
                          </div>
                        </div>
                        <div className="p-4 flex flex-wrap gap-1.5">
                          {h.departments.slice(0, 4).map(d => (
                            <span key={d} className="text-[10px] font-bold bg-soft-green text-primary-green px-2 py-0.5 rounded-md">{d}</span>
                          ))}
                          <Link href={`/hospitals/${h.id}`}
                            className="ml-auto flex items-center gap-1 text-[11px] font-bold text-white gradient-primary px-3 py-1.5 rounded-lg">
                            View <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── APPOINTMENTS ── */}
              {activeTab === 'appointments' && (
                <div className="flex flex-col gap-5">
                  <h3 className="font-extrabold text-dark-navy text-lg">My Appointments</h3>
                  <div className="flex flex-col gap-4">
                    {mockAppointments.map(apt => (
                      <div key={apt.id} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-extrabold text-dark-navy text-sm">{apt.doctor}</h4>
                            <p className="text-[10px] text-primary-green font-bold">{apt.speciality}</p>
                            <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-text-grey">
                              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{apt.date}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{apt.time}</span>
                              <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{apt.hospital}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border ${statusBadge(apt.status)}`}>{apt.status}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/book-consultation"
                    className="flex items-center justify-center gap-2 text-sm font-bold text-white gradient-primary py-3.5 rounded-2xl shadow-md glow-green">
                    <Calendar className="w-4 h-4" /> Book New Appointment
                  </Link>
                </div>
              )}

              {/* ── REPORTS ── */}
              {activeTab === 'reports' && (
                <div className="flex flex-col gap-5">
                  <h3 className="font-extrabold text-dark-navy text-lg">Medical Reports</h3>
                  <div className="border-2 border-dashed border-primary-green/25 rounded-3xl p-10 flex flex-col items-center gap-4 bg-soft-green hover:border-primary-green/40 transition-colors cursor-pointer">
                    <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
                      <Upload className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center">
                      <p className="font-extrabold text-dark-navy text-base">Upload Medical Report</p>
                      <p className="text-sm text-text-grey mt-1">PDF, JPG, PNG supported · Max 10MB per file</p>
                    </div>
                    <button className="flex items-center gap-2 text-sm font-bold text-white gradient-primary px-6 py-3 rounded-xl shadow-md glow-green">
                      <Upload className="w-4 h-4" /> Choose Files
                    </button>
                  </div>
                  <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm text-center">
                    <FileText className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-500">No reports uploaded yet</p>
                    <p className="text-xs text-text-grey mt-1">Upload your medical reports and our consultants will review them.</p>
                  </div>
                </div>
              )}

              {/* ── SUPPORT ── */}
              {activeTab === 'support' && (
                <div className="flex flex-col gap-5">
                  <h3 className="font-extrabold text-dark-navy text-lg">Support & Help</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: MessageSquare, title: 'Talk to Consultant', desc: 'Get expert healthcare guidance from our team', link: '/book-consultation', cta: 'Start Consultation', color: 'gradient-primary' },
                      { icon: Phone,         title: 'Call Us Directly',   desc: 'Speak to our support team immediately',  link: 'tel:+919876543210',    cta: 'Call Now',           color: 'bg-indigo-500' },
                      { icon: Shield,        title: 'Data Privacy',       desc: 'Review how we protect your health data',  link: '/privacy',             cta: 'Read Policy',        color: 'bg-amber-500' },
                      { icon: HelpCircle,    title: 'FAQ & Help',         desc: 'Find answers to common patient questions', link: '/',                   cta: 'Visit FAQ',          color: 'bg-violet-500' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:border-primary-green/20 transition-colors">
                        <div className={`w-10 h-10 rounded-2xl ${item.color} flex items-center justify-center mb-4 shadow-md`}>
                          <item.icon className="w-5 h-5 text-white" />
                        </div>
                        <h4 className="font-extrabold text-dark-navy text-sm">{item.title}</h4>
                        <p className="text-xs text-text-grey mt-1 mb-4 leading-relaxed">{item.desc}</p>
                        <Link href={item.link}
                          className="flex items-center gap-1.5 text-[11px] font-bold text-primary-green hover:text-dark-green transition-colors">
                          {item.cta} <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                  <div className="bg-dark-navy rounded-3xl p-5 border border-white/5">
                    <div className="flex items-start gap-2 mb-2">
                      <Shield className="w-4 h-4 text-accent-green flex-shrink-0 mt-0.5" />
                      <span className="text-xs font-bold text-white">ICC Medical Disclaimer</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      India Care Consultancy provides healthcare guidance and doctor/hospital recommendations only. We do not provide direct medical treatment or diagnosis. Always consult a qualified physician for medical decisions.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
