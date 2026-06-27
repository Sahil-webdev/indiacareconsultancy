'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Activity, Calendar, Stethoscope, Building2, FileText,
  User, LogOut, Shield, BadgeCheck, MapPin, Star, Clock,
  CheckCircle2, AlertCircle, Edit3, ArrowRight, PhoneCall,
  Ruler, Weight, Droplets, Phone, Mail, Home, ChevronRight,
  TrendingUp, Zap, Package, MessageSquare, Plus, Eye,
  Sparkles, Target, Award, Camera, Trash2,
} from 'lucide-react';
import { usePatientAuth } from '@/lib/patientAuth';
import { INITIAL_APPOINTMENTS, INITIAL_DOCTORS, INITIAL_HOSPITALS } from '@/lib/mockData';

type Tab = 'overview' | 'appointments' | 'doctors' | 'hospitals' | 'reports' | 'profile';

const TABS: { key: Tab; label: string; icon: React.ElementType; desc: string }[] = [
  { key: 'overview',     label: 'Overview',           icon: Activity,    desc: 'Health summary' },
  { key: 'appointments', label: 'Appointments',        icon: Calendar,    desc: 'My bookings' },
  { key: 'doctors',      label: 'Suggested Doctors',   icon: Stethoscope, desc: 'For you' },
  { key: 'hospitals',    label: 'Hospitals',           icon: Building2,   desc: 'Partner network' },
  { key: 'reports',      label: 'Medical Reports',     icon: FileText,    desc: 'Documents' },
  { key: 'profile',      label: 'My Profile',          icon: User,        desc: 'Health details' },
];

/* ── fade-up variant for sections ── */
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const stagger = { show: { transition: { staggerChildren: 0.07 } } };

export default function MyHealthPage() {
  const router = useRouter();
  const { patient, isLoggedIn, logout, updateProfile } = usePatientAuth();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Redirect to home if not logged in
  useEffect(() => {
    if (!isLoggedIn) router.replace('/');
  }, [isLoggedIn, router]);

  if (!isLoggedIn || !patient) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary-green/20 border-t-primary-green animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-grey">

      {/* ══════════════════════════════════════
          HERO HEADER
      ══════════════════════════════════════ */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0A5C4E 0%, #127A6A 55%, #1A9A83 100%)' }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        {/* Blobs */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full bg-black/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-white/60 text-xs font-medium mb-8"
          >
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <Home className="w-3 h-3" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">My Health Dashboard</span>
          </motion.div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            {/* Patient identity */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-5"
            >
              {/* Avatar */}
              <div className="relative">
                <motion.div
                  animate={{ boxShadow: ['0 0 0 0px rgba(255,255,255,0.15)', '0 0 0 8px rgba(255,255,255,0.06)', '0 0 0 0px rgba(255,255,255,0.15)'] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 h-20 rounded-3xl bg-white/20 border-2 border-white/30 flex items-center justify-center text-white font-black text-3xl shadow-2xl backdrop-blur overflow-hidden"
                >
                  {patient.profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={patient.profileImage} alt={patient.name} className="w-full h-full object-cover" />
                  ) : patient.name[0]}
                </motion.div>
                <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center">
                  <BadgeCheck className="w-3 h-3 text-white" />
                </div>
              </div>

              <div>
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-wrap gap-2 mb-2"
                >
                  {patient.profileComplete ? (
                    <span className="flex items-center gap-1 bg-emerald-400/25 border border-emerald-300/30 text-emerald-100 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      <BadgeCheck className="w-3 h-3" /> Profile Complete
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 bg-amber-400/25 border border-amber-300/30 text-amber-100 text-[10px] font-bold px-2.5 py-1 rounded-full">
                      <AlertCircle className="w-3 h-3" /> Profile Incomplete
                    </span>
                  )}
                  <span className="flex items-center gap-1 bg-white/15 border border-white/20 text-white/80 text-[10px] font-bold px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active Patient
                  </span>
                </motion.div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {patient.name}
                </h1>
                <p className="text-white/60 text-sm mt-0.5 font-medium">{patient.email}</p>
              </div>
            </motion.div>

            {/* Quick stat pills */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.15 }}
              className="flex flex-wrap gap-3"
            >
              {[
                { icon: Calendar,    value: INITIAL_APPOINTMENTS.length.toString(), label: 'Appointments' },
                { icon: Stethoscope, value: '4',  label: 'Suggested Doctors' },
                { icon: Building2,   value: '3',  label: 'Partner Hospitals' },
              ].map((s, i) => (
                <div key={i} className="flex items-center gap-2.5 bg-white/10 border border-white/15 backdrop-blur rounded-2xl px-4 py-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center">
                    <s.icon className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-extrabold text-white leading-none">{s.value}</p>
                    <p className="text-[10px] text-white/60 font-medium mt-0.5">{s.label}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Tab Navigation ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-8 flex gap-1 overflow-x-auto no-scrollbar pb-1"
          >
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
                  activeTab === tab.key
                    ? 'bg-white text-primary-green shadow-md'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.key === 'profile' && !patient.profileComplete && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CONTENT AREA
      ══════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === 'overview'     && <OverviewTab patient={patient} onTabChange={setActiveTab} />}
            {activeTab === 'appointments' && <AppointmentsTab patient={patient} />}
            {activeTab === 'doctors'      && <DoctorsTab />}
            {activeTab === 'hospitals'    && <HospitalsTab />}
            {activeTab === 'reports'      && <ReportsTab />}
            {activeTab === 'profile'      && <ProfileTab patient={patient} updateProfile={updateProfile} />}
          </motion.div>
        </AnimatePresence>

        {/* Sign out */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-10 pt-6 border-t border-slate-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-2 text-xs text-text-grey font-semibold">
            <Shield className="w-3.5 h-3.5 text-primary-green" />
            Secure connection · India Care Consultancy
          </div>
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="flex items-center gap-2 text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </motion.div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════
   OVERVIEW TAB
════════════════════════════════════════ */
function OverviewTab({ patient, onTabChange }: {
  patient: ReturnType<typeof usePatientAuth>['patient'] & object;
  onTabChange: (t: Tab) => void;
}) {
  const appointments = INITIAL_APPOINTMENTS;
  const upcomingApt = appointments[0];
  const aptDoctor = upcomingApt ? INITIAL_DOCTORS.find(d => d.id === upcomingApt.doctorId) : null;

  const statCards = [
    { icon: Calendar, label: 'Total Appointments', value: appointments.length, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-600' },
    { icon: Stethoscope, label: 'Suggested Doctors', value: 4, color: 'from-primary-green to-dark-green', bg: 'bg-soft-green', text: 'text-primary-green' },
    { icon: Building2, label: 'Partner Hospitals', value: 3, color: 'from-violet-500 to-violet-600', bg: 'bg-violet-50', text: 'text-violet-600' },
    { icon: FileText, label: 'Medical Reports', value: 0, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50', text: 'text-amber-600' },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-8">

      {/* Complete profile banner */}
      {patient && !patient.profileComplete && (
        <motion.div variants={fadeUp}
          className="relative overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 flex items-center gap-5"
        >
          <div className="absolute right-0 top-0 bottom-0 w-32 opacity-10 flex items-center justify-center">
            <Sparkles className="w-24 h-24 text-amber-500" />
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Target className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-amber-900 text-sm">Complete Your Health Profile</h3>
            <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
              Add your age, height, weight and blood group to unlock personalised doctor recommendations.
            </p>
          </div>
          <button
            onClick={() => onTabChange('profile')}
            className="flex-shrink-0 flex items-center gap-1.5 text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 px-4 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Complete Now <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}

      {/* Stat cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 overflow-hidden relative"
          >
            <div className={`absolute top-0 right-0 w-20 h-20 rounded-full ${s.bg} opacity-50 -translate-y-8 translate-x-8`} />
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon className={`w-5 h-5 ${s.text}`} />
            </div>
            <p className={`text-3xl font-black ${s.text}`}>{s.value}</p>
            <p className="text-xs text-text-grey font-semibold mt-1">{s.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Upcoming appointment */}
        <motion.div variants={fadeUp} className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-extrabold text-dark-navy flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary-green" /> Upcoming Appointment
            </h3>
            <button onClick={() => onTabChange('appointments')} className="text-[11px] font-bold text-primary-green hover:text-dark-green flex items-center gap-1">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          {upcomingApt && aptDoctor ? (
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-soft-green shadow-sm flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={aptDoctor.photo} alt={aptDoctor.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-primary-green uppercase tracking-wide">{aptDoctor.speciality}</span>
                      <h4 className="font-extrabold text-dark-navy text-lg leading-tight">{aptDoctor.name}</h4>
                      <p className="text-xs text-text-grey font-medium">{aptDoctor.qualification}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${
                      upcomingApt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                      upcomingApt.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                    }`}>{upcomingApt.status}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                    <span className="flex items-center gap-1.5 text-xs text-text-grey font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-primary-green" /> {upcomingApt.appointmentDate}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-text-grey font-semibold">
                      <Clock className="w-3.5 h-3.5 text-primary-green" /> {upcomingApt.appointmentTime}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-text-grey font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {aptDoctor.location}
                    </span>
                  </div>
                  {upcomingApt.notes && (
                    <div className="mt-4 bg-soft-green rounded-xl p-3 border border-primary-green/10">
                      <p className="text-[11px] text-text-grey leading-relaxed">{upcomingApt.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-soft-green flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-7 h-7 text-primary-green/50" />
              </div>
              <p className="text-sm font-bold text-dark-navy">No upcoming appointments</p>
              <p className="text-xs text-text-grey mt-1">Book a consultation with a verified doctor.</p>
              <Link href="/find-doctor" className="inline-flex items-center gap-1.5 mt-4 text-xs font-bold text-white gradient-primary px-5 py-2.5 rounded-xl shadow-md">
                Find a Doctor <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </motion.div>

        {/* Quick actions */}
        <motion.div variants={fadeUp} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <h3 className="font-extrabold text-dark-navy mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary-green" /> Quick Actions
          </h3>
          <div className="flex flex-col gap-2.5">
            {[
              { icon: Stethoscope, label: 'Find a Doctor', desc: 'Browse specialists', href: '/find-doctor', color: 'bg-soft-green text-primary-green' },
              { icon: Building2, label: 'Browse Hospitals', desc: 'Partner hospitals', href: '/hospitals', color: 'bg-violet-50 text-violet-600' },
              { icon: PhoneCall, label: 'Book Consultation', desc: 'Talk to our team', href: '/book-consultation', color: 'bg-blue-50 text-blue-600' },
              { icon: MessageSquare, label: 'Get Guidance', desc: 'Free healthcare advice', href: '/contact', color: 'bg-amber-50 text-amber-600' },
            ].map((a, i) => (
              <Link key={i} href={a.href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100 group"
              >
                <div className={`w-9 h-9 rounded-xl ${a.color} flex items-center justify-center flex-shrink-0`}>
                  <a.icon className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-dark-navy">{a.label}</p>
                  <p className="text-[10px] text-text-grey">{a.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary-green transition-colors" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Suggested doctors preview */}
      <motion.div variants={fadeUp} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-extrabold text-dark-navy flex items-center gap-2">
            <Award className="w-4 h-4 text-primary-green" /> Recommended For You
          </h3>
          <button onClick={() => onTabChange('doctors')} className="text-[11px] font-bold text-primary-green hover:text-dark-green flex items-center gap-1">
            See All <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          {INITIAL_DOCTORS.slice(0, 4).map((doc, i) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="p-5 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-slate-100 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-100 ml-auto flex-shrink-0">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-black text-slate-700">{doc.rating}</span>
                </div>
              </div>
              <p className="text-[10px] font-bold text-primary-green uppercase tracking-wide">{doc.speciality}</p>
              <h4 className="font-bold text-dark-navy text-sm mt-0.5 line-clamp-1">{doc.name}</h4>
              <p className="text-[10px] text-text-grey mt-1 flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />{doc.location} · {doc.experience}y exp
              </p>
              <Link href={`/find-doctor/${doc.id}`} className="mt-3 w-full flex items-center justify-center gap-1 text-[10px] font-bold text-primary-green border border-primary-green/20 bg-soft-green py-2 rounded-lg hover:bg-light-mint transition-colors">
                View Profile <ArrowRight className="w-2.5 h-2.5" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   APPOINTMENTS TAB
════════════════════════════════════════ */
function AppointmentsTab({ patient }: { patient: NonNullable<ReturnType<typeof usePatientAuth>['patient']> }) {
  const appointments = INITIAL_APPOINTMENTS;

  if (appointments.length === 0) return <EmptyState icon={Calendar} title="No Appointments Yet" desc="Book a consultation with a verified doctor through India Care." action={{ label: 'Book Now', href: '/find-doctor' }} />;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-5">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-dark-navy">My Appointments</h2>
        <Link href="/book-consultation" className="flex items-center gap-1.5 text-sm font-bold text-white gradient-primary px-5 py-2.5 rounded-xl shadow-md glow-green">
          <Plus className="w-4 h-4" /> New Booking
        </Link>
      </motion.div>

      {appointments.map((apt, i) => {
        const doc = INITIAL_DOCTORS.find(d => d.id === apt.doctorId);
        const hosp = INITIAL_HOSPITALS.find(h => h.id === apt.hospitalId);
        return (
          <motion.div key={apt.id} variants={fadeUp}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-primary-green/15 transition-all duration-300"
          >
            <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-100">
              <span className="text-xs font-bold text-text-grey flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary-green" /> {apt.appointmentDate} at {apt.appointmentTime}
              </span>
              <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${
                apt.status === 'Confirmed' ? 'bg-emerald-100 text-emerald-700' :
                apt.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                apt.status === 'Completed' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-600'
              }`}>{apt.status}</span>
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-start gap-5">
              {doc && (
                <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-soft-green shadow-sm flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1">
                {doc ? (
                  <>
                    <p className="text-[10px] font-bold text-primary-green uppercase tracking-wide">{doc.speciality}</p>
                    <h4 className="font-extrabold text-dark-navy text-lg leading-tight">{doc.name}</h4>
                    <p className="text-xs text-text-grey font-medium mt-0.5">{doc.qualification}</p>
                  </>
                ) : (
                  <h4 className="font-extrabold text-dark-navy text-lg">{apt.speciality}</h4>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-text-grey font-semibold">
                  {hosp && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-slate-400" />{hosp.name}</span>}
                  {doc && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" />{doc.location}</span>}
                </div>
                {apt.notes && (
                  <div className="mt-3 bg-soft-green rounded-xl px-4 py-2.5 border border-primary-green/10">
                    <p className="text-[11px] text-text-grey leading-relaxed">{apt.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

/* ════════════════════════════════════════
   SUGGESTED DOCTORS TAB
════════════════════════════════════════ */
function DoctorsTab() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-5">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-dark-navy">Suggested Doctors</h2>
          <p className="text-xs text-text-grey mt-0.5">Verified specialists recommended based on your profile</p>
        </div>
        <Link href="/find-doctor" className="text-sm font-bold text-primary-green hover:text-dark-green flex items-center gap-1">
          Browse All <ChevronRight className="w-4 h-4" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-5">
        {INITIAL_DOCTORS.map((doc, i) => (
          <motion.div key={doc.id} variants={fadeUp}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5 flex gap-4 hover:shadow-md hover:border-primary-green/20 transition-all duration-300 group"
          >
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-soft-green shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary-green border-2 border-white flex items-center justify-center">
                <BadgeCheck className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold text-primary-green uppercase tracking-wide">{doc.speciality}</p>
                  <h4 className="font-extrabold text-dark-navy text-sm leading-tight mt-0.5">{doc.name}</h4>
                  <p className="text-[10px] text-text-grey font-medium mt-0.5 line-clamp-1">{doc.qualification}</p>
                </div>
                <div className="flex items-center gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded-lg border border-amber-100 flex-shrink-0">
                  <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-black text-slate-700">{doc.rating}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-2 text-[10px] text-text-grey font-semibold">
                <span className="flex items-center gap-1"><Stethoscope className="w-2.5 h-2.5 text-primary-green" />{doc.experience}y exp</span>
                <span className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5 text-slate-400" />{doc.location}</span>
                <span className="font-bold text-primary-green">₹{doc.consultationFee}/session</span>
              </div>
              <div className="flex gap-2 mt-3">
                <Link href={`/find-doctor/${doc.id}`} className="flex-1 text-center text-[10px] font-bold text-primary-green border border-primary-green/20 bg-soft-green py-2 rounded-xl hover:bg-light-mint transition-colors">
                  View Profile
                </Link>
                <Link href={`/find-doctor`} className="flex-1 text-center text-[10px] font-bold text-white gradient-primary py-2 rounded-xl shadow-sm glow-green">
                  Book Slot
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   HOSPITALS TAB
════════════════════════════════════════ */
function HospitalsTab() {
  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="flex flex-col gap-5">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-dark-navy">Partner Hospitals</h2>
          <p className="text-xs text-text-grey mt-0.5">NABH-accredited hospitals in our network</p>
        </div>
        <Link href="/hospitals" className="text-sm font-bold text-primary-green hover:text-dark-green flex items-center gap-1">
          View All <ChevronRight className="w-4 h-4" />
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {INITIAL_HOSPITALS.map((hosp, i) => (
          <motion.div key={hosp.id} variants={fadeUp}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md hover:border-primary-green/15 transition-all duration-300 group"
          >
            <div className="relative aspect-[16/9]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={hosp.image} alt={hosp.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/60 to-transparent" />
              <div className="absolute bottom-2 left-3 flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-lg border border-slate-100">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="text-[11px] font-black text-slate-700">{hosp.rating}</span>
              </div>
              <div className="absolute top-2 right-2 bg-primary-green text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <BadgeCheck className="w-2.5 h-2.5" /> ICC Partner
              </div>
            </div>
            <div className="p-5">
              <h4 className="font-extrabold text-dark-navy text-sm">{hosp.name}</h4>
              <p className="text-[11px] text-text-grey mt-1.5 flex items-center gap-1 font-medium">
                <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />{hosp.address}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {hosp.departments.slice(0, 3).map(d => (
                  <span key={d} className="text-[9px] font-bold bg-soft-green text-primary-green px-2 py-0.5 rounded-md">{d}</span>
                ))}
                {hosp.departments.length > 3 && (
                  <span className="text-[9px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md">+{hosp.departments.length - 3}</span>
                )}
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                <Link href={`/hospitals/${hosp.id}`} className="flex-1 text-center text-[11px] font-bold text-slate-600 border border-slate-200 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                  View Hospital
                </Link>
                <Link href="/book-consultation" className="flex-1 text-center text-[11px] font-bold text-white gradient-primary py-2.5 rounded-xl shadow-sm">
                  Book via ICC
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   REPORTS TAB
════════════════════════════════════════ */
function ReportsTab() {
  return <EmptyState icon={FileText} title="No Medical Reports" desc="Medical reports shared through India Care Consultancy will appear here." action={{ label: 'Book Consultation', href: '/book-consultation' }} />;
}

/* ════════════════════════════════════════
   PROFILE TAB
════════════════════════════════════════ */
function ProfileTab({
  patient,
  updateProfile,
}: {
  patient: NonNullable<ReturnType<typeof usePatientAuth>['patient']>;
  updateProfile: ReturnType<typeof usePatientAuth>['updateProfile'];
}) {
  const [editing, setEditing] = useState(!patient.profileComplete);
  const [saved, setSaved] = useState(false);
  const [imageError, setImageError] = useState('');
  const [form, setForm] = useState({
    age: patient.age || '',
    height: patient.height || '',
    weight: patient.weight || '',
    bloodGroup: patient.bloodGroup || '',
    allergies: patient.allergies || '',
    chronicConditions: patient.chronicConditions || '',
    emergencyContact: patient.emergencyContact || '',
  });

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    setImageError('');

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file.');
      return;
    }
    if (file.size > 1024 * 1024) {
      setImageError('Image must be under 1 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        updateProfile({ profileImage: reader.result });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    };
    reader.onerror = () => setImageError('Could not read this image. Please try another file.');
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    updateProfile({ profileImage: undefined });
    setImageError('');
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleSave = () => {
    updateProfile({
      ...form,
      profileComplete: !!(form.age && form.height && form.weight && form.bloodGroup),
    });
    setSaved(true);
    setEditing(false);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="max-w-3xl">

      {saved && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl px-5 py-3 text-sm font-bold mb-5"
        >
          <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
        </motion.div>
      )}

      {/* Basic Info */}
      <motion.div variants={fadeUp} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 mb-5">
          <div>
            <h3 className="text-base font-extrabold text-dark-navy flex items-center gap-2">
              <User className="w-4 h-4 text-primary-green" /> Basic Information
            </h3>
            <p className="text-xs text-text-grey mt-1">Update your patient photo and personal account details.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-3xl gradient-primary flex items-center justify-center text-white text-2xl font-black overflow-hidden border-4 border-soft-green shadow-md">
              {patient.profileImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={patient.profileImage} alt={patient.name} className="w-full h-full object-cover" />
              ) : patient.name[0]}
            </div>
            <div className="flex flex-col gap-2">
              <label className="inline-flex items-center justify-center gap-2 text-xs font-bold text-white gradient-primary px-4 py-2.5 rounded-xl shadow-sm cursor-pointer hover:opacity-95 transition-opacity">
                <Camera className="w-3.5 h-3.5" /> Change Photo
                <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" />
              </label>
              {patient.profileImage && (
                <button type="button" onClick={handleRemoveImage} className="inline-flex items-center justify-center gap-2 text-xs font-bold text-red-500 border border-red-100 bg-red-50 px-4 py-2 rounded-xl hover:bg-red-100 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
              <p className="text-[10px] text-text-grey">JPG/PNG/WebP, max 1 MB</p>
            </div>
          </div>
        </div>

        {imageError && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
            <AlertCircle className="w-4 h-4" /> {imageError}
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Full Name', value: patient.name, icon: User },
            { label: 'City', value: patient.city, icon: MapPin },
            { label: 'Gender', value: patient.gender || '—', icon: User },
            { label: 'Member Since', value: new Date(patient.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), icon: Calendar },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
              <p className="text-[9px] font-bold text-text-grey uppercase tracking-wide mb-1">{item.label}</p>
              <p className="text-sm font-bold text-dark-navy truncate">{item.value}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
            <Mail className="w-4 h-4 text-primary-green flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] font-bold text-text-grey uppercase tracking-wide">Email</p>
              <p className="text-sm font-bold text-dark-navy truncate">{patient.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3.5 border border-slate-100">
            <Phone className="w-4 h-4 text-primary-green flex-shrink-0" />
            <div>
              <p className="text-[9px] font-bold text-text-grey uppercase tracking-wide">Mobile</p>
              <p className="text-sm font-bold text-dark-navy">{patient.mobile}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Health Details */}
      <motion.div variants={fadeUp} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-extrabold text-dark-navy flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary-green" /> Health Details
            {!patient.profileComplete && (
              <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Incomplete</span>
            )}
          </h3>
          {!editing && (
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 text-xs font-bold text-primary-green hover:text-dark-green transition-colors">
              <Edit3 className="w-3.5 h-3.5" /> Edit Details
            </button>
          )}
        </div>

        {editing ? (
          <div className="flex flex-col gap-4">
            {/* Age / Height / Weight row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Age (years)', key: 'age' as const, placeholder: 'e.g. 29', type: 'number' },
                { label: 'Height (cm)', key: 'height' as const, placeholder: 'e.g. 175', type: 'number' },
                { label: 'Weight (kg)', key: 'weight' as const, placeholder: 'e.g. 70', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-[10px] font-bold text-dark-navy uppercase tracking-wide block mb-1.5">{f.label}</label>
                  <input type={f.type} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-primary-green focus:ring-2 focus:ring-primary-green/10 rounded-xl px-3.5 py-2.5 text-sm text-dark-navy focus:outline-none transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Blood group */}
            <div>
              <label className="text-[10px] font-bold text-dark-navy uppercase tracking-wide block mb-2">Blood Group</label>
              <div className="flex flex-wrap gap-2">
                {BLOOD_GROUPS.map(bg => (
                  <button key={bg} type="button"
                    onClick={() => setForm(f => ({ ...f, bloodGroup: bg }))}
                    className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${form.bloodGroup === bg ? 'bg-primary-green text-white border-primary-green shadow-sm' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary-green/40 hover:text-primary-green'}`}
                  >
                    {bg}
                  </button>
                ))}
              </div>
            </div>

            {[
              { label: 'Known Allergies', key: 'allergies' as const, placeholder: 'e.g., Penicillin, Peanuts or None' },
              { label: 'Chronic Conditions', key: 'chronicConditions' as const, placeholder: 'e.g., Diabetes, Hypertension or None' },
              { label: 'Emergency Contact Number', key: 'emergencyContact' as const, placeholder: '+91 XXXXX XXXXX' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-[10px] font-bold text-dark-navy uppercase tracking-wide block mb-1.5">{f.label}</label>
                <input type="text" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-primary-green focus:ring-2 focus:ring-primary-green/10 rounded-xl px-3.5 py-2.5 text-sm text-dark-navy focus:outline-none transition-all"
                />
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(false)} className="flex-1 text-sm font-bold text-slate-600 border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={handleSave} className="flex-[2] text-sm font-bold text-white gradient-primary py-3 rounded-xl shadow-md glow-green flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> Save Profile
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { icon: Calendar, label: 'Age', value: patient.age ? `${patient.age} yrs` : '—', color: 'bg-blue-50 text-blue-600' },
              { icon: Ruler, label: 'Height', value: patient.height ? `${patient.height} cm` : '—', color: 'bg-green-50 text-green-600' },
              { icon: Weight, label: 'Weight', value: patient.weight ? `${patient.weight} kg` : '—', color: 'bg-violet-50 text-violet-600' },
              { icon: Droplets, label: 'Blood Group', value: patient.bloodGroup || '—', color: 'bg-red-50 text-red-500' },
              { icon: AlertCircle, label: 'Allergies', value: patient.allergies || '—', color: 'bg-amber-50 text-amber-600' },
              { icon: Activity, label: 'Chronic Conditions', value: patient.chronicConditions || '—', color: 'bg-slate-50 text-slate-600' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                <div className={`w-8 h-8 rounded-xl ${item.color} flex items-center justify-center mb-2.5`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <p className="text-[9px] font-bold text-text-grey uppercase tracking-wide">{item.label}</p>
                <p className={`text-sm font-bold mt-0.5 ${item.value === '—' ? 'text-slate-300' : 'text-dark-navy'}`}>{item.value}</p>
              </div>
            ))}
          </div>
        )}

        {!patient.profileComplete && !editing && (
          <button onClick={() => setEditing(true)} className="mt-5 w-full flex items-center justify-center gap-2 text-sm font-bold text-white gradient-primary py-3.5 rounded-xl shadow-md glow-green">
            <Edit3 className="w-4 h-4" /> Complete My Health Profile
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ════════════════════════════════════════
   EMPTY STATE
════════════════════════════════════════ */
function EmptyState({ icon: Icon, title, desc, action }: {
  icon: React.ElementType; title: string; desc: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-20 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.1 }}
        className="w-20 h-20 rounded-3xl bg-soft-green flex items-center justify-center shadow-sm"
      >
        <Icon className="w-9 h-9 text-primary-green/50" />
      </motion.div>
      <div>
        <h3 className="font-extrabold text-dark-navy text-lg">{title}</h3>
        <p className="text-sm text-text-grey mt-1.5 max-w-xs leading-relaxed">{desc}</p>
      </div>
      {action && (
        <Link href={action.href} className="flex items-center gap-2 text-sm font-bold text-white gradient-primary px-7 py-3 rounded-xl shadow-md hover-lift glow-green">
          <PhoneCall className="w-4 h-4" /> {action.label}
        </Link>
      )}
    </div>
  );
}
