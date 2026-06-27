'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, MapPin, PhoneCall, Clock, CheckCircle2, Building2, Users,
  Heart, ShieldCheck, ChevronRight, ArrowRight, MessageSquare,
  BadgeCheck, Zap, TrendingUp, Shield, ChevronDown, ChevronLeft,
  Award, Stethoscope, Activity, Brain, Bone, Sparkles, Baby,
  Ear, ShieldAlert, Flame, Wind, Microscope, Ambulance
} from 'lucide-react';
import { HospitalMock, mockDB } from '@/lib/mockData';

interface Props { hospital: HospitalMock; }

/* ─── Animated Ring ─── */
function RingProgress({ pct, size = 80, stroke = 7, color = '#127A6A', label }: {
  pct: number; size?: number; stroke?: number; color?: string; label?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [drawn, setDrawn] = useState(0);
  useEffect(() => { const t = setTimeout(() => setDrawn(pct), 300); return () => clearTimeout(t); }, [pct]);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8f7f4" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - (drawn / 100) * circ}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }} />
        <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central"
          fontSize={size * 0.22} fontWeight="800" fill="#0F172A"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}>
          {drawn}%
        </text>
      </svg>
      {label && <span className="text-[10px] font-bold text-text-grey text-center leading-tight max-w-[72px]">{label}</span>}
    </div>
  );
}

/* ─── FAQ Accordion ─── */
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-colors ${open ? 'border-primary-green/30' : 'border-slate-100'}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 py-4 text-left">
        <span className={`text-sm font-bold transition-colors ${open ? 'text-primary-green' : 'text-dark-navy'}`}>{q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-primary-green' : 'text-slate-400'}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
            <p className="px-5 pb-4 text-sm text-text-grey leading-relaxed border-t border-slate-50 pt-3">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Department Icon Map ─── */
const DEPT_ICONS: Record<string, React.ElementType> = {
  Cardiology: Heart, Neurology: Brain, Orthopedics: Bone, Dermatology: Sparkles,
  Gynecology: Baby, Pediatrics: Activity, Oncology: Flame, ENT: Ear,
  Urology: ShieldAlert, Gastroenterology: Stethoscope, Dentist: Activity,
  Nephrology: Wind, Emergency: Ambulance, Radiology: Microscope,
};

/* ─── Facility Icon Map ─── */
const FAC_ICONS: Record<string, string> = {
  'ICU': '🏥', '24/7 Emergency': '🚨', 'Pharmacy': '💊', 'Robotic Surgery': '🤖',
  'Blood Bank': '🩸', 'Organ Transplant': '🫀', 'Dialysis Unit': '💧',
  'MRI/CT Scan': '🔬', 'Ambulance service': '🚑', 'Cafeteria': '🍽️',
  'Rehabilitation Center': '🏋️', 'Free Wi-Fi': '📶', 'Trauma Care': '🏨',
  'In-house MRI/CT Scan': '🔬', 'Intelligent ICU': '💡',
};

/* ─── Insurance Providers ─── */
const INSURERS = ['Star Health', 'HDFC ERGO', 'Max Bupa', 'New India', 'Niva Bupa', 'Care Health', 'Bajaj Allianz', 'Tata AIG'];

export default function HospitalProfileClient({ hospital }: Props) {
  const [doctorIdx, setDoctorIdx] = useState(0);
  const [relatedIdx, setRelatedIdx] = useState(0);

  const linkedDoctors = mockDB.doctors.filter(d => d.hospitalId === hospital.id);
  const relatedHospitals = mockDB.hospitals.filter(h => h.id !== hospital.id && h.location === hospital.location).slice(0, 3);

  const matchScore = Math.min(98, 72
    + (hospital.rating >= 4.8 ? 10 : hospital.rating >= 4.5 ? 5 : 0)
    + (hospital.subscriptionPlan === 'Premium' ? 8 : 3)
    + (hospital.departments.length >= 5 ? 5 : 2)
    + (hospital.facilities.length >= 5 ? 3 : 1)
  );

  const hasEmergency = hospital.facilities.some(f => f.toLowerCase().includes('emergency'));
  const hasICU = hospital.facilities.some(f => f.toLowerCase().includes('icu'));
  const isPremium = hospital.subscriptionPlan === 'Premium';

  const reviewStats = [
    { label: 'Overall Rating',    pct: Math.round(hospital.rating / 5 * 100) },
    { label: 'Cleanliness',       pct: 91 },
    { label: 'Doctor Quality',    pct: 94 },
    { label: 'Staff Behaviour',   pct: 88 },
    { label: 'Waiting Time',      pct: 74 },
    { label: 'Infrastructure',    pct: 92 },
  ];

  const mockReviews = [
    { name: 'Sunita Kapoor', city: 'Delhi', date: 'June 5, 2026', rating: 5, comment: 'Exceptional hospital. The ICU care my father received was world-class. Nurses were attentive and the doctors explained everything clearly. Highly recommend.' },
    { name: 'Rohit Malhotra', city: 'Gurugram', date: 'May 18, 2026', rating: 4.8, comment: 'Very clean hospital with professional staff. Appointment coordination via India Care Consultancy was seamless. The OPD wait time is minimal.' },
    { name: 'Ananya Verma', city: 'Noida', date: 'May 2, 2026', rating: 5, comment: 'The cardiology department here is incredible. Dr. Kumar\'s team handled my father\'s stent procedure with great care. We felt fully supported throughout.' },
  ];

  const faqs = [
    { q: 'Does the hospital provide emergency services?', a: `Yes. ${hospital.name} provides 24/7 emergency medical care. Emergency contact: ${hospital.emergencyContact}. They have a dedicated trauma team always on standby.` },
    { q: 'Does the hospital accept health insurance?', a: 'Yes, this hospital supports cashless treatment with major health insurance providers including Star Health, HDFC ERGO, Max Bupa, Care Health, and more. Verify your specific plan with the billing desk.' },
    { q: `How many doctors are available at ${hospital.name}?`, a: `Currently, ${linkedDoctors.length > 0 ? linkedDoctors.length : 'multiple'} India Care verified doctors practise here across departments. Additional resident and visiting consultants are also available.` },
    { q: 'What are the OPD timings?', a: `OPD is available from ${hospital.opdTimings}. Emergency services run 24/7. For specific department timings, please contact the hospital directly.` },
    { q: 'Can appointments be booked through India Care Consultancy?', a: 'Yes. ICC coordinates appointments directly with this hospital at no additional charge. Our consultant team will verify slot availability and assist with the complete booking process.' },
  ];

  const historyTimeline = [
    { year: '2010 – Present', title: 'Serving Patients', desc: 'Continuously expanding departments, adopting advanced medical technologies, and improving patient outcomes.' },
    { year: '2015', title: 'NABH Accreditation', desc: 'Received National Accreditation Board for Hospitals & Healthcare Providers certification for quality standards.' },
    { year: '2018', title: 'Robotic Surgery Unit', desc: 'Established one of the most advanced robotic surgery units in the region.' },
    { year: '2022', title: 'India Care Partnership', desc: 'Became an official verified partner of India Care Consultancy to improve patient reach and referral quality.' },
  ];

  return (
    <div className="min-h-screen bg-light-grey">

      {/* ══ SECTION 1: HERO ══ */}
      <section className="relative overflow-hidden">
        {/* Full-width banner */}
        <div className="relative h-72 sm:h-96 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-navy/30 via-dark-navy/40 to-dark-navy/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary-green/10 to-transparent" />
        </div>

        {/* Hero card overlapping banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="-mt-24 relative z-10">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-white/80 mb-4 font-medium">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link href="/hospitals" className="hover:text-white transition-colors">Hospitals</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-white font-semibold line-clamp-1">{hospital.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-8">
              {/* LEFT: Logo + Badges */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
                className="lg:col-span-3 flex flex-col items-center lg:items-start gap-4">
                {/* Logo placeholder */}
                <div className="relative">
                  <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-2xl bg-white flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary-green border-2 border-white rounded-full p-1.5 shadow-lg">
                    <BadgeCheck className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                  <span className="flex items-center gap-1 bg-primary-green text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                    <BadgeCheck className="w-3 h-3" /> Verified Hospital
                  </span>
                  {isPremium && (
                    <span className="flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                      <Zap className="w-3 h-3" /> Premium Partner
                    </span>
                  )}
                  {hasEmergency && (
                    <span className="flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Emergency 24/7
                    </span>
                  )}
                  <span className="flex items-center gap-1 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                    <ShieldCheck className="w-3 h-3" /> NABH Certified
                  </span>
                </div>
                <p className="text-[10px] text-text-grey font-semibold text-center lg:text-left">
                  Reg: <span className="text-dark-navy font-bold">{hospital.registrationDetails}</span>
                </p>
              </motion.div>

              {/* CENTER: Hospital Info */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
                className="lg:col-span-5 flex flex-col gap-3 pt-2">
                <div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <span className="bg-soft-green text-primary-green text-[11px] font-bold px-3 py-1 rounded-full border border-primary-green/15">Multi-Speciality</span>
                    <span className="bg-soft-green text-primary-green text-[11px] font-bold px-3 py-1 rounded-full border border-primary-green/15">Super Speciality</span>
                  </div>
                  <h1 className="text-2xl sm:text-4xl font-extrabold text-dark-navy tracking-tight leading-tight">{hospital.name}</h1>
                  <div className="flex items-center gap-1.5 text-sm text-text-grey mt-1.5">
                    <MapPin className="w-4 h-4 text-primary-green flex-shrink-0" />
                    <span>{hospital.address}</span>
                  </div>
                </div>

                {/* Stat pills */}
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { icon: Star,     val: hospital.rating.toString(), sub: 'Rating',        cls: 'text-yellow-500 fill-yellow-500', bg: 'bg-yellow-50' },
                    { icon: Building2, val: `${hospital.departments.length}+`,  sub: 'Departments', cls: 'text-primary-green',  bg: 'bg-soft-green' },
                    { icon: Users,    val: `${linkedDoctors.length || '10'}+`, sub: 'Doctors',     cls: 'text-violet-600',      bg: 'bg-violet-50' },
                    { icon: Heart,    val: '5000+',                             sub: 'Patients',    cls: 'text-rose-500',        bg: 'bg-rose-50' },
                  ].map((s, i) => (
                    <div key={i} className={`flex items-center gap-2 ${s.bg} px-3 py-2 rounded-xl border border-white`}>
                      <s.icon className={`w-4 h-4 ${s.cls}`} />
                      <div>
                        <div className="text-sm font-extrabold text-dark-navy leading-none">{s.val}</div>
                        <div className="text-[10px] text-text-grey font-medium">{s.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Star display */}
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => (
                      <Star key={i} className={`w-4 h-4 ${i <= Math.floor(hospital.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-dark-navy">{hospital.rating}</span>
                  <span className="text-xs text-text-grey">(120+ patient reviews)</span>
                </div>

                {/* OPD timing */}
                <div className="flex items-center gap-2 text-sm text-text-grey">
                  <Clock className="w-4 h-4 text-primary-green flex-shrink-0" />
                  OPD: <span className="font-semibold text-dark-navy">{hospital.opdTimings}</span>
                </div>
              </motion.div>

              {/* RIGHT: Appointment Card */}
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-4">
                <div className="glass-card rounded-3xl p-6 border border-primary-green/15 shadow-xl sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-text-grey uppercase tracking-widest">Consultation Assistance</p>
                      <p className="text-sm font-extrabold text-dark-navy mt-0.5">Free via ICC</p>
                    </div>
                    <div className="bg-soft-green text-primary-green text-[10px] font-bold px-3 py-1.5 rounded-xl border border-primary-green/15 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Open Now
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-5 bg-soft-green rounded-2xl p-4 border border-primary-green/10">
                    <div className="flex items-center gap-2 text-xs text-text-grey">
                      <Clock className="w-3.5 h-3.5 text-primary-green" />
                      <span>OPD Hours: <strong className="text-dark-navy">{hospital.opdTimings}</strong></span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-text-grey">
                      <Shield className="w-3.5 h-3.5 text-red-500" />
                      <span>Emergency: <strong className="text-dark-navy">{hospital.emergencyContact}</strong></span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <Link href="/book-consultation"
                      className="flex items-center justify-center gap-2 text-sm font-bold text-white gradient-primary py-3.5 px-6 rounded-xl shadow-lg glow-green hover-lift">
                      <PhoneCall className="w-4 h-4" /> Book Appointment
                    </Link>
                    <Link href="/book-consultation"
                      className="flex items-center justify-center gap-2 text-sm font-bold text-primary-green border-2 border-primary-green/20 bg-soft-green py-3 px-6 rounded-xl hover:bg-light-mint transition-colors">
                      <MessageSquare className="w-4 h-4" /> Talk to Consultant
                    </Link>
                    <a href={`tel:${hospital.emergencyContact}`}
                      className="flex items-center justify-center gap-2 text-xs font-bold text-text-grey border border-slate-200 py-2.5 px-6 rounded-xl hover:bg-slate-50 transition-colors">
                      <PhoneCall className="w-3.5 h-3.5" /> Call Hospital
                    </a>
                  </div>
                  <p className="text-[10px] text-text-grey text-center mt-4">ICC coordinates at no extra charge to patients.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ SECTION 2: MATCH SCORE ══ */}
      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-card rounded-3xl p-6 sm:p-8 border border-primary-green/15 shadow-lg">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <RingProgress pct={matchScore} size={110} stroke={9} />
                <p className="text-xs font-bold text-text-grey text-center max-w-[120px] leading-tight">Recommended by INDIA CARE CONSULTANCY</p>
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-dark-navy">{matchScore}% Recommendation Score</h2>
                <p className="text-sm text-text-grey mt-1 mb-5">Our proprietary assessment evaluating 5 hospital quality parameters.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { l: 'Department Quality',   ok: hospital.departments.length >= 4 },
                    { l: 'Doctor Network',        ok: linkedDoctors.length > 0 },
                    { l: 'Patient Reviews',       ok: hospital.rating >= 4.5 },
                    { l: 'Location Accessible',   ok: true },
                    { l: 'Insurance Support',     ok: true },
                    { l: 'Emergency Available',   ok: hasEmergency },
                  ].map((r, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl ${r.ok ? 'bg-soft-green text-primary-green' : 'bg-slate-50 text-text-grey'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${r.ok ? 'text-primary-green' : 'text-slate-300'}`} />
                      {r.l}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ MAIN GRID ══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ─── LEFT COLUMN ─── */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* SECTION 3: About */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-dark-navy mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-primary-green" /> About Hospital
              </h2>
              <p className="text-sm text-text-grey leading-relaxed">
                {hospital.name} is a leading multi-speciality hospital and a verified India Care Consultancy partner.
                Located at {hospital.address}, the hospital offers world-class medical treatment across {hospital.departments.length} specialised departments.
                It has been recognised for clinical excellence, patient safety, and infrastructure quality.
              </p>

              {/* History Timeline */}
              <div className="mt-6 pt-5 border-t border-slate-100">
                <h3 className="text-sm font-extrabold text-dark-navy mb-5">Hospital Timeline</h3>
                <div className="relative">
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary-green to-transparent" />
                  <div className="flex flex-col gap-6">
                    {historyTimeline.map((item, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                        className="flex gap-5 pl-10 relative">
                        <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary-green/10 border-2 border-primary-green flex items-center justify-center">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary-green" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-primary-green uppercase tracking-widest">{item.year}</span>
                          <h4 className="font-extrabold text-dark-navy text-sm mt-0.5">{item.title}</h4>
                          <p className="text-xs text-text-grey mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* SECTION 4: Departments */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-dark-navy mb-5 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary-green" /> Medical Departments
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {hospital.departments.map((dept, i) => {
                  const Icon = DEPT_ICONS[dept] || Building2;
                  return (
                    <motion.div key={dept} whileHover={{ scale: 1.02, y: -2 }} transition={{ duration: 0.2 }}
                      className="flex items-start gap-3 p-4 bg-soft-green rounded-2xl border border-primary-green/10 hover:border-primary-green/25 hover:shadow-md transition-all">
                      <div className="w-9 h-9 rounded-xl bg-primary-green/10 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4.5 h-4.5 text-primary-green" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-dark-navy text-sm">{dept}</h3>
                        <p className="text-[10px] text-text-grey mt-0.5">Specialised care unit</p>
                        <Link href={`/find-doctor?speciality=${dept}`}
                          className="text-[10px] font-bold text-primary-green hover:text-dark-green transition-colors flex items-center gap-0.5 mt-1">
                          Find Doctors <ArrowRight className="w-2.5 h-2.5" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* SECTION 5: Facilities */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-dark-navy mb-5 flex items-center gap-2">
                <Award className="w-5 h-5 text-primary-green" /> Facilities & Infrastructure
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {hospital.facilities.map((fac, i) => (
                  <motion.div key={i} whileHover={{ scale: 1.03 }}
                    className="flex flex-col items-center gap-2 p-4 bg-light-grey rounded-2xl border border-slate-100 hover:border-primary-green/20 hover:bg-soft-green transition-all text-center">
                    <span className="text-2xl">{FAC_ICONS[fac] || '✅'}</span>
                    <span className="text-[11px] font-bold text-dark-navy leading-tight">{fac}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* SECTION 6: Doctors */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-extrabold text-dark-navy flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary-green" /> Associated Doctors
                </h2>
                {linkedDoctors.length > 2 && (
                  <div className="flex gap-1.5">
                    <button onClick={() => setDoctorIdx(i => Math.max(0, i - 1))} disabled={doctorIdx === 0}
                      className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center disabled:opacity-30">
                      <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <button onClick={() => setDoctorIdx(i => Math.min(linkedDoctors.length - 2, i + 1))} disabled={doctorIdx >= linkedDoctors.length - 2}
                      className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center disabled:opacity-30">
                      <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                )}
              </div>

              {linkedDoctors.length === 0 ? (
                <div className="text-center py-8 bg-soft-green rounded-2xl border border-primary-green/10">
                  <p className="text-sm text-text-grey">We are linking doctor directories for this hospital. Contact ICC for direct referrals.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {linkedDoctors.slice(doctorIdx, doctorIdx + 4).map(doc => (
                    <Link key={doc.id} href={`/find-doctor/${doc.id}`}
                      className="flex gap-3 items-center p-4 bg-light-grey rounded-2xl border border-slate-100 hover:border-primary-green/20 hover:bg-soft-green transition-all group">
                      <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-dark-navy group-hover:text-primary-green transition-colors line-clamp-1">{doc.name}</h4>
                        <span className="text-[10px] font-bold text-primary-green">{doc.speciality}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] font-bold text-slate-700">{doc.rating}</span>
                          </div>
                          <span className="text-[10px] text-text-grey">· {doc.experience} Yrs</span>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-green transition-colors flex-shrink-0" />
                    </Link>
                  ))}
                </div>
              )}
              <Link href={`/find-doctor?hospital=${hospital.id}`}
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary-green mt-5 pt-4 border-t border-slate-100 hover:text-dark-green transition-colors">
                View All Doctors at {hospital.name} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* SECTION 7: Gallery */}
            {hospital.gallery && hospital.gallery.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
                <h2 className="text-xl font-extrabold text-dark-navy mb-5 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary-green" /> Hospital Gallery
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {hospital.gallery.map((img, i) => (
                    <div key={i} className={`group relative rounded-2xl overflow-hidden bg-slate-100 ${i === 0 ? 'sm:col-span-2 row-span-1' : ''} aspect-video`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt={`${hospital.name} gallery ${i + 1}`}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-dark-navy/0 group-hover:bg-dark-navy/20 transition-all duration-300" />
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* SECTION 8: Reviews */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-dark-navy flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Patient Reviews
                </h2>
                <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-extrabold text-dark-navy">{hospital.rating}</span>
                  <span className="text-xs text-text-grey">/ 5.0</span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {mockReviews.map((rev, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="bg-light-grey rounded-2xl p-5 border border-slate-100 hover:border-primary-green/20 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-green to-accent-green flex items-center justify-center text-white font-black text-sm">
                          {rev.name[0]}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-dark-navy">{rev.name}</h4>
                          <p className="text-[10px] text-text-grey">{rev.city} · {rev.date}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex gap-0.5 mb-1">
                          {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= Math.floor(rev.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />)}
                        </div>
                        <span className="text-[10px] font-bold text-primary-green flex items-center gap-0.5">
                          <BadgeCheck className="w-3 h-3" /> Verified Patient
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-text-grey leading-relaxed">&ldquo;{rev.comment}&rdquo;</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* SECTION 9: Review Analytics */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="glass-card rounded-3xl p-6 sm:p-8 border border-primary-green/10 shadow-sm">
              <h2 className="text-xl font-extrabold text-dark-navy mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-green" /> Review Analytics
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {reviewStats.map((s, i) => <RingProgress key={i} pct={s.pct} size={80} stroke={7} label={s.label} />)}
              </div>
            </motion.div>

            {/* SECTION 10: Insurance */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-dark-navy mb-5 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary-green" /> Insurance Support
              </h2>
              <p className="text-sm text-text-grey mb-5">This hospital accepts cashless treatment from major health insurance providers.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {INSURERS.map(ins => (
                  <div key={ins} className="flex items-center justify-center p-3 bg-soft-green rounded-xl border border-primary-green/10 text-center">
                    <span className="text-xs font-bold text-dark-navy">{ins}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* SECTION 11: Bhamashah Facility */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-dark-navy mb-5 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-green" /> Bhamashah Facility (Jan Aadhaar / BSBY)
              </h2>
              <p className="text-sm text-text-grey mb-5">
                Bhamashah Yojana is the Rajasthan Government's flagship scheme providing cashless medical treatment to eligible families. This hospital supports Bhamashah Card / Jan Aadhaar Card holders with dedicated facilities and cashless treatment benefits.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-soft-green to-light-mint rounded-2xl p-5 border border-primary-green/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-green/10 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-primary-green" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-dark-navy">Cashless Treatment</h3>
                      <p className="text-xs text-text-grey">Zero upfront payment for eligible cardholders</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-grey leading-relaxed">
                    Patients holding Bhamashah / Jan Aadhaar cards can avail cashless treatment at this hospital. All necessary medical services are covered under government-defined package rates.
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <Award className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-dark-navy">Eligible Cards Accepted</h3>
                      <p className="text-xs text-text-grey">Bhamashah, Jan Aadhaar & BSBY</p>
                    </div>
                  </div>
                  <p className="text-xs text-text-grey leading-relaxed">
                    Bhamashah Card, Jan Aadhaar Card, and BSBY (Bhamashah Swasthya Bima Yojana) cardholders get priority access. IPD coverage and free treatment for specified illnesses are available under the scheme.
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-dark-navy rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-white">Bhamashah Help Desk Available</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Visit the hospital's Bhamashah counter for assistance with claims & eligibility</p>
                </div>
                <span className="flex items-center gap-1 text-[10px] font-bold text-white bg-primary-green px-3 py-1.5 rounded-lg">
                  <BadgeCheck className="w-3 h-3" /> Supported
                </span>
              </div>
            </motion.div>

            {/* SECTION 12: Emergency */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-gradient-to-br from-red-50 to-rose-50 rounded-3xl p-6 sm:p-8 border border-red-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-dark-navy mb-5 flex items-center gap-2">
                <Ambulance className="w-5 h-5 text-red-500" /> Emergency Support
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { icon: '🚨', label: 'Emergency Number', val: hospital.emergencyContact, sub: 'Call anytime' },
                  { icon: '🚑', label: 'Ambulance Service', val: '24/7 Available', sub: 'Quick response' },
                  { icon: '🏥', label: 'Trauma Center', val: 'Level 1', sub: 'Fully equipped' },
                ].map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 border border-red-100 text-center">
                    <span className="text-2xl">{item.icon}</span>
                    <p className="text-[10px] font-bold text-text-grey uppercase tracking-wide mt-2">{item.label}</p>
                    <p className="text-sm font-extrabold text-dark-navy mt-0.5">{item.val}</p>
                    <p className="text-[10px] text-text-grey mt-0.5">{item.sub}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* SECTION 12: Location */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-dark-navy mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-green" /> Location & Directions
              </h2>
              <p className="text-sm text-text-grey mb-4">{hospital.address}</p>
              <div className="w-full aspect-[16/8] rounded-2xl bg-gradient-to-br from-soft-green to-light-mint border border-primary-green/10 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #127A6A 1px, transparent 0)', backgroundSize: '28px 28px' }} />
                <div className="relative w-12 h-12 rounded-full bg-primary-green/10 border-2 border-primary-green flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary-green animate-bounce" />
                </div>
                <div className="relative text-center">
                  <p className="text-sm font-bold text-dark-navy">{hospital.name}</p>
                  <p className="text-xs text-text-grey mt-1">{hospital.address}</p>
                </div>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(hospital.address)}`} target="_blank" rel="noopener noreferrer"
                  className="relative flex items-center gap-1.5 text-xs font-bold text-white gradient-primary px-4 py-2 rounded-xl shadow-md">
                  Open in Google Maps <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {['Parking Available', 'Wheelchair Access', 'Public Transport'].map(f => (
                  <div key={f} className="text-center bg-soft-green rounded-xl p-3 border border-primary-green/10">
                    <p className="text-[10px] font-bold text-primary-green leading-tight">{f}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* SECTION 13: FAQ */}
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm">
              <h2 className="text-xl font-extrabold text-dark-navy mb-5 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-green" /> Frequently Asked Questions
              </h2>
              <div className="flex flex-col gap-3">
                {faqs.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
              </div>
            </motion.div>
          </div>

          {/* ─── RIGHT COLUMN ─── */}
          <div className="flex flex-col gap-6">

            {/* SECTION 14: Related Hospitals */}
            {relatedHospitals.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-dark-navy text-base">Nearby Hospitals</h3>
                  <div className="flex gap-1.5">
                    <button onClick={() => setRelatedIdx(i => Math.max(0, i - 1))} disabled={relatedIdx === 0}
                      className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center disabled:opacity-30">
                      <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                    <button onClick={() => setRelatedIdx(i => Math.min(relatedHospitals.length - 1, i + 1))} disabled={relatedIdx >= relatedHospitals.length - 1}
                      className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center disabled:opacity-30">
                      <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                    </button>
                  </div>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div key={relatedIdx} initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -15 }} transition={{ duration: 0.2 }}>
                    {relatedHospitals.slice(relatedIdx, relatedIdx + 2).map(h => (
                      <Link key={h.id} href={`/hospitals/${h.id}`}
                        className="flex gap-3 items-center p-3 rounded-2xl hover:bg-soft-green transition-colors group mb-2 last:mb-0">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-dark-navy group-hover:text-primary-green transition-colors line-clamp-1">{h.name}</h4>
                          <p className="text-[10px] text-text-grey">{h.location}</p>
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-[10px] font-bold text-slate-700">{h.rating}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-green transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                  </motion.div>
                </AnimatePresence>
                <Link href="/hospitals" className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary-green mt-4 pt-4 border-t border-slate-100 hover:text-dark-green transition-colors">
                  View All Hospitals <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </motion.div>
            )}

            {/* ICC disclaimer */}
            <div className="bg-dark-navy rounded-3xl p-5 border border-slate-800">
              <div className="flex items-start gap-2 mb-2">
                <Shield className="w-4 h-4 text-accent-green flex-shrink-0 mt-0.5" />
                <span className="text-xs font-bold text-white">ICC Clinical Disclaimer</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                India Care Consultancy does not guarantee priority ICU bed allocations. All admissions are handled per hospital clinical triage protocols. ICC provides guidance and referral support only.
              </p>
              <Link href="/book-consultation"
                className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-white gradient-primary py-2.5 rounded-xl shadow-md w-full glow-green">
                <Heart className="w-3.5 h-3.5 fill-white" /> Free Guidance
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ══ STICKY MOBILE BAR ══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-lg border-t border-slate-100 px-4 py-3">
        <div className="flex gap-3 max-w-lg mx-auto">
          <Link href="/book-consultation"
            className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-white gradient-primary py-3.5 rounded-xl shadow-lg glow-green">
            <PhoneCall className="w-4 h-4" /> Book Appointment
          </Link>
          <Link href="/book-consultation"
            className="flex items-center justify-center gap-2 text-sm font-bold text-primary-green border-2 border-primary-green/20 bg-soft-green px-4 py-3.5 rounded-xl">
            <MessageSquare className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Bottom padding for mobile bar */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
