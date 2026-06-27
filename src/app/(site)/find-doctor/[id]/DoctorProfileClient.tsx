'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star,
  MapPin,
  Clock,
  Award,
  BookOpen,
  Languages,
  CheckCircle2,
  Calendar,
  ShieldCheck,
  ChevronRight,
  PhoneCall,
  BadgeCheck,
  Zap,
  TrendingUp,
  Building2,
  MessageSquare,
  ChevronDown,
  ChevronLeft,
  ArrowRight,
  User,
  Globe,
  Stethoscope,
  Heart,
  Shield,
} from 'lucide-react';
import { DoctorMock, mockDB } from '@/lib/mockData';
import BookingModal, { BookingDoctor } from '@/components/BookingModal';

interface Props { doctor: DoctorMock; }

/* ─── Animated ring progress ─── */
function RingProgress({ pct, size = 80, stroke = 7, color = '#127A6A', label }: {
  pct: number; size?: number; stroke?: number; color?: string; label?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const [drawn, setDrawn] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDrawn(pct), 300);
    return () => clearTimeout(t);
  }, [pct]);
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8f7f4" strokeWidth={stroke} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - (drawn / 100) * circ}
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)' }}
        />
        <text
          x={size/2} y={size/2}
          textAnchor="middle" dominantBaseline="central"
          fontSize={size * 0.22} fontWeight="800"
          fill="#0F172A"
          style={{ transform: `rotate(90deg)`, transformOrigin: `${size/2}px ${size/2}px` }}
        >
          {drawn}%
        </text>
      </svg>
      {label && <span className="text-[10px] font-bold text-text-grey text-center leading-tight">{label}</span>}
    </div>
  );
}

/* ─── FAQ Accordion ─── */
function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-colors ${open ? 'border-primary-green/30' : 'border-slate-100'}`}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className={`text-sm font-bold transition-colors ${open ? 'text-primary-green' : 'text-dark-navy'}`}>{q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-primary-green' : 'text-slate-400'}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <p className="px-5 pb-4 text-sm text-text-grey leading-relaxed border-t border-slate-50 pt-3">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Component ─── */
export default function DoctorProfileClient({ doctor }: Props) {
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const stickyRef = useRef<HTMLDivElement>(null);

  // ── Booking Modal State ──
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const hospital = mockDB.hospitals.find(h => h.id === doctor.hospitalId);

  const bookingDoc: BookingDoctor = {
    id: doctor.id,
    name: doctor.name,
    speciality: doctor.speciality,
    experience: doctor.experience,
    consultationFee: doctor.consultationFee,
    rating: doctor.rating,
    photo: doctor.photo,
    qualification: doctor.qualification,
    location: doctor.location,
    clinicAddress: doctor.clinicAddress,
    consultationType: doctor.consultationType,
    hospitalName: hospital?.name,
    availability: doctor.availability,
  };

  const relatedDoctors = mockDB.doctors
    .filter(d => d.speciality === doctor.speciality && d.id !== doctor.id)
    .slice(0, 4);

  /* Match score computation */
  const matchScore = Math.min(99,
    70
    + (doctor.rating >= 4.8 ? 10 : doctor.rating >= 4.5 ? 5 : 0)
    + (doctor.experience >= 10 ? 8 : doctor.experience >= 5 ? 4 : 0)
    + (doctor.isApproved ? 5 : 0)
    + (doctor.subscriptionPlan === 'Elite' ? 6 : doctor.subscriptionPlan === 'Premium' ? 3 : 0)
  );

  const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const isAvailable = (day: string) => doctor.availability.some(d => day.startsWith(d) || d.startsWith(day.substring(0, 3)));

  const timeSlots = {
    Morning: ['9:00 AM', '10:00 AM', '11:00 AM', '11:30 AM'],
    Afternoon: ['1:00 PM', '2:00 PM', '3:00 PM'],
    Evening: ['5:00 PM', '6:00 PM', '6:30 PM'],
  };

  const reviewStats = [
    { label: 'Overall Rating',          pct: Math.round(doctor.rating / 5 * 100) },
    { label: 'Communication',           pct: 94 },
    { label: 'Treatment Satisfaction',  pct: 91 },
    { label: 'Hospital Experience',     pct: 88 },
    { label: 'Waiting Time',            pct: 76 },
    { label: 'Doctor Behaviour',        pct: 97 },
  ];

  const mockReviews = [
    { name: 'Karan Malhotra',  city: 'Delhi',     date: 'June 2, 2026',   rating: 5,   comment: 'Dr. Kumar was extremely thorough. He took time to explain my angiogram results and suggested a conservative management plan first. Very satisfied with the care.' },
    { name: 'Shweta Goel',     city: 'Noida',     date: 'May 14, 2026',   rating: 4.8, comment: 'Excellent doctor. Highly professional and very polite. The clinic check-in coordinated by India Care Consultancy was seamless and quick.' },
    { name: 'Priya Nair',      city: 'Gurugram',  date: 'May 3, 2026',    rating: 5,   comment: 'I had been struggling with chronic chest pain for months. One visit to this doctor changed everything. Diagnoses were spot on.' },
  ];

  const experienceTimeline = [
    { years: '2020 – Present', role: 'Senior Consultant', place: doctor.clinicAddress, desc: 'Leading complex cases, mentoring junior doctors, and running OPD consultations.' },
    { years: '2014 – 2020',    role: 'Associate Specialist', place: 'Apollo Hospitals, Delhi', desc: 'Handled ICU admissions, performed advanced diagnostic procedures.' },
    { years: '2008 – 2014',    role: 'Resident Doctor',    place: 'AIIMS, New Delhi',          desc: 'Post-graduate training and research fellowship in specialised care.' },
  ];

  const faqs = [
    { q: `What conditions does ${doctor.name} treat?`, a: `${doctor.name} treats a wide range of conditions including ${doctor.services?.slice(0, 3).join(', ')} and more. Refer to the Treatments section for the full list.` },
    { q: 'How much is the consultation fee?', a: `The consultation fee is ₹${doctor.consultationFee} per session. This may vary for follow-up visits. India Care Consultancy helps coordinate appointment slots at no additional charge.` },
    { q: 'Which hospital is the doctor associated with?', a: hospital ? `${doctor.name} practises at ${hospital.name}, located at ${hospital.address}. The hospital is an accredited India Care partner.` : `${doctor.name} practises at ${doctor.clinicAddress}.` },
    { q: 'Can appointments be booked online?', a: 'Yes. You can request an appointment through India Care Consultancy. Our consultant team will confirm availability and coordinate the booking directly with the clinic or hospital.' },
    { q: `Does ${doctor.name} offer online consultations?`, a: `${doctor.name} offers ${doctor.consultationType === 'Both' ? 'both online video and in-clinic physical' : doctor.consultationType.toLowerCase()} consultations.` },
  ];

  return (
    <div className="min-h-screen bg-light-grey">

      {/* ═══════════════════════════════════════════════
          SECTION 1 — PREMIUM HERO
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-8 pb-0 gradient-hero">
        {/* Background blobs */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary-green/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-accent-green/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-xs text-text-grey mb-8 font-medium">
            <Link href="/" className="hover:text-primary-green transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href="/find-doctor" className="hover:text-primary-green transition-colors">Find Doctor</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-dark-navy font-semibold line-clamp-1">{doctor.name}</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-16">

            {/* ── LEFT: Photo + trust badges ── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55 }}
              className="lg:col-span-3 flex flex-col items-center lg:items-start gap-4"
            >
              {/* Photo frame */}
              <div className="relative">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div className="w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden border-4 border-white shadow-2xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover" />
                  </div>
                  {/* Verified ring */}
                  <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-primary-green border-3 border-white shadow-lg flex items-center justify-center">
                    <BadgeCheck className="w-5 h-5 text-white" />
                  </div>
                </motion.div>

                {/* NMC badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute -top-3 -left-3 bg-white rounded-xl px-2.5 py-1.5 shadow-lg border border-slate-100 flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-primary-green" />
                  <span className="text-[10px] font-black text-dark-navy">NMC Verified</span>
                </motion.div>
              </div>

              {/* Trust badge pills */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center lg:justify-start gap-2 mt-2"
              >
                <span className="flex items-center gap-1 bg-primary-green text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                  <BadgeCheck className="w-3 h-3" /> Verified Doctor
                </span>
                {doctor.rating >= 4.8 && (
                  <span className="flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                    <TrendingUp className="w-3 h-3" /> Top Rated
                  </span>
                )}
                {doctor.subscriptionPlan === 'Elite' && (
                  <span className="flex items-center gap-1 bg-violet-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                    <Zap className="w-3 h-3" /> Elite Specialist
                  </span>
                )}
                <span className="flex items-center gap-1 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  Available Today
                </span>
              </motion.div>

              {/* Reg number */}
              <p className="text-[10px] text-text-grey font-semibold text-center lg:text-left">
                Reg. No: <span className="text-dark-navy font-bold">{doctor.medicalRegistrationNumber}</span>
              </p>
            </motion.div>

            {/* ── CENTER: Doctor info ── */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="lg:col-span-5 flex flex-col gap-4"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="bg-soft-green text-primary-green text-[11px] font-bold px-3 py-1 rounded-full border border-primary-green/15">
                    {doctor.speciality}
                  </span>
                  <span className="bg-soft-green text-primary-green text-[11px] font-bold px-3 py-1 rounded-full border border-primary-green/15">
                    {doctor.consultationType === 'Both' ? 'Online & In-Clinic' : doctor.consultationType}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-dark-navy tracking-tight leading-tight">
                  {doctor.name}
                </h1>
                <p className="text-sm text-text-grey font-semibold mt-1">{doctor.qualification}</p>
              </div>

              {/* Stat pills row */}
              <div className="flex flex-wrap gap-3">
                {[
                  { icon: Star,       val: doctor.rating.toString(), sub: 'Patient Rating',  cls: 'text-yellow-500 fill-yellow-500', bg: 'bg-yellow-50' },
                  { icon: BookOpen,   val: `${doctor.experience}+`,  sub: 'Years Exp.',      cls: 'text-primary-green',              bg: 'bg-soft-green' },
                  { icon: User,       val: '1200+',                  sub: 'Patients',        cls: 'text-violet-600',                 bg: 'bg-violet-50' },
                  { icon: Globe,      val: '42',                     sub: 'Reviews',         cls: 'text-amber-600',                  bg: 'bg-amber-50' },
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

              {/* Details */}
              <div className="flex flex-col gap-2.5 mt-1">
                <div className="flex items-start gap-2 text-sm text-text-grey">
                  <MapPin className="w-4 h-4 text-primary-green flex-shrink-0 mt-0.5" />
                  <span>{doctor.clinicAddress}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-grey">
                  <Languages className="w-4 h-4 text-primary-green flex-shrink-0" />
                  <span>{doctor.languages.join(', ')}</span>
                </div>
                {hospital && (
                  <div className="flex items-center gap-2 text-sm text-text-grey">
                    <Building2 className="w-4 h-4 text-primary-green flex-shrink-0" />
                    <span className="font-semibold text-dark-navy">{hospital.name}</span>
                  </div>
                )}
              </div>

              {/* Star display */}
              <div className="flex items-center gap-2 mt-1">
                <div className="flex gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.floor(doctor.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                  ))}
                </div>
                <span className="text-sm font-bold text-dark-navy">{doctor.rating}</span>
                <span className="text-xs text-text-grey">(42 verified reviews)</span>
              </div>
            </motion.div>

            {/* ── RIGHT: Appointment Card ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.55, delay: 0.2 }}
              className="lg:col-span-4"
              ref={stickyRef}
            >
              <div className="glass-card rounded-3xl p-6 border border-primary-green/15 shadow-xl sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-bold text-text-grey uppercase tracking-widest">Consultation Fee</p>
                    <p className="text-3xl font-extrabold text-dark-navy leading-none mt-1">₹{doctor.consultationFee}</p>
                    <p className="text-xs text-text-grey mt-0.5">per session</p>
                  </div>
                  <div className="bg-soft-green text-primary-green text-[10px] font-bold px-3 py-1.5 rounded-xl border border-primary-green/15 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Slots Open
                  </div>
                </div>

                <div className="flex flex-col gap-2 mb-5">
                  <div className="flex items-center gap-2 text-xs text-text-grey">
                    <Clock className="w-3.5 h-3.5 text-primary-green" />
                    <span>Next available: <strong className="text-dark-navy">Tomorrow, 10:00 AM</strong></span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-text-grey">
                    <Calendar className="w-3.5 h-3.5 text-primary-green" />
                    <span>Today slots: <strong className="text-dark-navy">3 remaining</strong></span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <button
                    onClick={() => setIsBookingOpen(true)}
                    className="flex items-center justify-center gap-2 text-sm font-bold text-white gradient-primary py-3.5 px-6 rounded-xl shadow-lg glow-green hover-lift"
                  >
                    <PhoneCall className="w-4 h-4" />
                    Book Appointment
                  </button>
                  <Link
                    href="/book-consultation"
                    className="flex items-center justify-center gap-2 text-sm font-bold text-primary-green border-2 border-primary-green/20 bg-soft-green py-3 px-6 rounded-xl hover:bg-light-mint transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Talk to Consultant
                  </Link>
                  {hospital && (
                    <a
                      href={`tel:${hospital.phone}`}
                      className="flex items-center justify-center gap-2 text-xs font-bold text-text-grey border border-slate-200 py-2.5 px-6 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      Call Hospital
                    </a>
                  )}
                </div>

                <p className="text-[10px] text-text-grey text-center mt-4 leading-relaxed">
                  ICC does not charge patients for booking coordination.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 2 — MATCH SCORE
      ═══════════════════════════════════════════════ */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-6 sm:p-8 border border-primary-green/15 shadow-lg"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex flex-col items-center gap-2 flex-shrink-0">
                <RingProgress pct={matchScore} size={110} stroke={9} />
                <p className="text-xs font-bold text-text-grey text-center max-w-[120px] leading-tight">
                  Recommended by INDIA CARE CONSULTANCY
                </p>
              </div>
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-extrabold text-dark-navy">
                  {matchScore}% Match Score
                </h2>
                <p className="text-sm text-text-grey mt-1 mb-5">
                  Based on our proprietary vetting system evaluating 6 clinical parameters.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Experience Match',      ok: doctor.experience >= 5 },
                    { label: 'Budget Friendly',       ok: true },
                    { label: 'Patient Reviews',       ok: doctor.rating >= 4.5 },
                    { label: 'NMC Verified',          ok: doctor.isApproved },
                    { label: 'Available Today',       ok: true },
                    { label: 'Recommended Facility',  ok: !!hospital },
                  ].map((r, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl ${r.ok ? 'bg-soft-green text-primary-green' : 'bg-slate-50 text-text-grey'}`}>
                      <CheckCircle2 className={`w-3.5 h-3.5 flex-shrink-0 ${r.ok ? 'text-primary-green' : 'text-slate-300'}`} />
                      {r.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          MAIN CONTENT GRID
      ═══════════════════════════════════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ─── LEFT COLUMN (2/3) ─── */}
          <div className="lg:col-span-2 flex flex-col gap-8">

            {/* SECTION 3 — About */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm"
            >
              <h2 className="text-xl font-extrabold text-dark-navy mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-primary-green" /> About Doctor
              </h2>
              <p className="text-sm text-text-grey leading-relaxed">{doctor.bio}</p>
              <div className="grid grid-cols-2 gap-4 mt-6 pt-5 border-t border-slate-100">
                <div>
                  <h4 className="text-xs font-bold text-dark-navy uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5 text-primary-green" /> Languages
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {doctor.languages.map(l => (
                      <span key={l} className="bg-soft-green text-primary-green text-[11px] font-bold px-2.5 py-1 rounded-lg border border-primary-green/10">{l}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-dark-navy uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-primary-green" /> Awards
                  </h4>
                  <ul className="space-y-1">
                    {doctor.awards?.map(a => (
                      <li key={a} className="flex items-start gap-1.5 text-[11px] text-text-grey">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-green mt-1.5 flex-shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            {/* SECTION 4 — Services */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm"
            >
              <h2 className="text-xl font-extrabold text-dark-navy mb-5 flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-primary-green" /> Specialities & Treatments
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {doctor.services?.map(s => (
                  <motion.span
                    key={s}
                    whileHover={{ scale: 1.04, y: -2 }}
                    className="flex items-center gap-2 bg-soft-green text-primary-green border border-primary-green/15 text-xs font-bold px-4 py-2 rounded-xl cursor-default shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {s}
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* SECTION 5 — Experience Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm"
            >
              <h2 className="text-xl font-extrabold text-dark-navy mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-green" /> Experience Timeline
              </h2>
              <div className="relative">
                <div className="absolute left-4 top-2 bottom-2 w-px bg-gradient-to-b from-primary-green via-accent-green to-transparent" />
                <div className="flex flex-col gap-8">
                  {experienceTimeline.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className="flex gap-6 pl-12 relative"
                    >
                      <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-primary-green/10 border-2 border-primary-green flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary-green" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-primary-green uppercase tracking-widest">{item.years}</span>
                        <h3 className="font-extrabold text-dark-navy text-base mt-0.5">{item.role}</h3>
                        <p className="text-xs font-semibold text-text-grey mt-0.5">{item.place}</p>
                        <p className="text-xs text-text-grey mt-2 leading-relaxed">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* SECTION 6 — Education */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm"
            >
              <h2 className="text-xl font-extrabold text-dark-navy mb-5 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-green" /> Education & Certifications
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: 'Qualification', val: doctor.qualification, icon: '🎓' },
                  { label: 'Registration',  val: doctor.medicalRegistrationNumber, icon: '🏥' },
                  { label: 'Speciality',    val: doctor.speciality, icon: '🩺' },
                  { label: 'Experience',    val: `${doctor.experience} Years`, icon: '📅' },
                ].map((item, i) => (
                  <div key={i} className="bg-soft-green rounded-2xl p-4 border border-primary-green/10">
                    <span className="text-xl">{item.icon}</span>
                    <p className="text-[10px] font-bold text-text-grey uppercase tracking-wide mt-2">{item.label}</p>
                    <p className="text-sm font-extrabold text-dark-navy mt-0.5">{item.val}</p>
                  </div>
                ))}
              </div>
              {doctor.awards && doctor.awards.length > 0 && (
                <div className="mt-5 pt-5 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-dark-navy uppercase tracking-wide mb-3">Certifications & Awards</h4>
                  <div className="flex flex-col gap-2">
                    {doctor.awards.map((a, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-text-grey">
                        <Award className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        <span className="font-medium">{a}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* SECTION 8 — Reviews */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-dark-navy flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" /> Patient Reviews
                </h2>
                <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-extrabold text-dark-navy">{doctor.rating}</span>
                  <span className="text-xs text-text-grey">/ 5.0</span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                {mockReviews.map((rev, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="bg-light-grey rounded-2xl p-5 border border-slate-100 hover:border-primary-green/20 transition-colors"
                  >
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
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-3 h-3 ${s <= Math.floor(rev.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                          ))}
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

            {/* SECTION 9 — Review Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="glass-card rounded-3xl p-6 sm:p-8 border border-primary-green/10 shadow-sm"
            >
              <h2 className="text-xl font-extrabold text-dark-navy mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary-green" /> Review Statistics
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                {reviewStats.map((s, i) => (
                  <RingProgress key={i} pct={s.pct} size={80} stroke={7} label={s.label} />
                ))}
              </div>
            </motion.div>

            {/* SECTION 10 — Availability Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm"
            >
              <h2 className="text-xl font-extrabold text-dark-navy mb-5 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-green" /> Availability Calendar
              </h2>

              {/* Day selector */}
              <div className="grid grid-cols-7 gap-2 mb-6">
                {fullDays.map((day, i) => {
                  const avail = isAvailable(day);
                  const short = shortDays[i];
                  const active = selectedDay === day;
                  return (
                    <motion.button
                      key={day}
                      whileHover={{ scale: avail ? 1.05 : 1 }}
                      onClick={() => avail && setSelectedDay(active ? null : day)}
                      disabled={!avail}
                      className={`flex flex-col items-center py-2.5 rounded-xl text-[10px] font-bold border-2 transition-all ${
                        active ? 'gradient-primary text-white border-transparent shadow-md'
                        : avail ? 'bg-soft-green text-primary-green border-primary-green/20 hover:border-primary-green/40'
                        : 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      }`}
                    >
                      <span>{short}</span>
                      {avail && <span className={`mt-1 w-1.5 h-1.5 rounded-full ${active ? 'bg-white' : 'bg-primary-green'}`} />}
                    </motion.button>
                  );
                })}
              </div>

              {/* Time slots */}
              <AnimatePresence>
                {selectedDay && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs font-bold text-dark-navy mb-4">Available slots for <span className="text-primary-green">{selectedDay}</span></p>
                    <div className="flex flex-col gap-4">
                      {Object.entries(timeSlots).map(([period, slots]) => (
                        <div key={period}>
                          <h4 className="text-[10px] font-bold text-text-grey uppercase tracking-wide mb-2">{period}</h4>
                          <div className="flex flex-wrap gap-2">
                            {slots.map((slot, j) => (
                              <motion.button
                                key={slot}
                                whileHover={{ scale: 1.04 }}
                                className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                                  j === 1 ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                                  : 'bg-soft-green text-primary-green border-primary-green/20 hover:bg-light-mint hover:border-primary-green/40'
                                }`}
                                disabled={j === 1}
                              >
                                {slot} {j === 1 ? '(Booked)' : ''}
                              </motion.button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setIsBookingOpen(true)}
                      className="mt-5 w-full flex items-center justify-center gap-2 text-sm font-bold text-white gradient-primary py-3 rounded-xl shadow-md glow-green"
                    >
                      <PhoneCall className="w-4 h-4" />
                      Book Selected Slot
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
              {!selectedDay && (
                <p className="text-xs text-text-grey text-center py-4 bg-soft-green rounded-xl border border-primary-green/10">
                  Select an available day above to view time slots
                </p>
              )}
            </motion.div>

            {/* SECTION 11 — Location */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm"
            >
              <h2 className="text-xl font-extrabold text-dark-navy mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-green" /> Location & Directions
              </h2>
              <p className="text-sm text-text-grey mb-4">{doctor.clinicAddress}</p>
              <div className="w-full aspect-[16/8] rounded-2xl bg-gradient-to-br from-soft-green to-light-mint border border-primary-green/10 flex flex-col items-center justify-center gap-3 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'radial-gradient(circle at 1px 1px, #127A6A 1px, transparent 0)',
                  backgroundSize: '28px 28px'
                }} />
                <div className="relative w-12 h-12 rounded-full bg-primary-green/10 border-2 border-primary-green flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-primary-green animate-bounce" />
                </div>
                <div className="relative text-center">
                  <p className="text-sm font-bold text-dark-navy">{hospital?.name || doctor.location}</p>
                  <p className="text-xs text-text-grey mt-1">{doctor.clinicAddress}</p>
                </div>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(doctor.clinicAddress)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="relative flex items-center gap-1.5 text-xs font-bold text-white gradient-primary px-4 py-2 rounded-xl shadow-md"
                >
                  Open in Google Maps <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                {['Parking Available', 'Wheelchair Access', 'Emergency Support'].map(f => (
                  <div key={f} className="text-center bg-soft-green rounded-xl p-3 border border-primary-green/10">
                    <p className="text-[10px] font-bold text-primary-green leading-tight">{f}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* SECTION 13 — FAQ */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm"
            >
              <h2 className="text-xl font-extrabold text-dark-navy mb-5 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary-green" /> Frequently Asked Questions
              </h2>
              <div className="flex flex-col gap-3">
                {faqs.map((f, i) => <FAQ key={i} q={f.q} a={f.a} />)}
              </div>
            </motion.div>

          </div>

          {/* ─── RIGHT COLUMN (1/3) ─── */}
          <div className="flex flex-col gap-6">

            {/* SECTION 7 — Hospital Info */}
            {hospital && (
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm"
              >
                <div className="relative aspect-[16/9]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 bg-primary-green text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" /> Verified Partner
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-lg border border-slate-100 text-[11px] font-bold">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    {hospital.rating}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-extrabold text-dark-navy text-base">{hospital.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-text-grey mt-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="line-clamp-2">{hospital.address}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {hospital.departments.slice(0, 4).map(d => (
                      <span key={d} className="text-[10px] font-bold bg-soft-green text-primary-green px-2 py-0.5 rounded-md">{d}</span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100">
                    <Link href={`/hospitals/${hospital.id}`} className="w-full text-center text-xs font-bold text-slate-600 border border-slate-200 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                      View Hospital Profile
                    </Link>
                    <Link href="/book-consultation" className="w-full text-center text-xs font-bold text-white gradient-primary py-2.5 rounded-xl shadow-sm glow-green">
                      Book via ICC
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}

            {/* SECTION 12 — Similar Doctors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-dark-navy text-base">Similar Doctors</h3>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => setCarouselIdx(i => Math.max(0, i - 1))}
                    disabled={carouselIdx === 0}
                    className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setCarouselIdx(i => Math.min(relatedDoctors.length - 1, i + 1))}
                    disabled={carouselIdx >= relatedDoctors.length - 1}
                    className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center disabled:opacity-30"
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                  </button>
                </div>
              </div>

              {relatedDoctors.length === 0 ? (
                <p className="text-xs text-text-grey">No other specialists found.</p>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={carouselIdx}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                  >
                    {relatedDoctors.slice(carouselIdx, carouselIdx + 2).map(rel => (
                      <Link
                        key={rel.id}
                        href={`/find-doctor/${rel.id}`}
                        className="flex gap-3 items-center p-3 rounded-2xl hover:bg-soft-green transition-colors group mb-2 last:mb-0"
                      >
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 border-white shadow-sm">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={rel.photo} alt={rel.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-dark-navy group-hover:text-primary-green transition-colors line-clamp-1">{rel.name}</h4>
                          <p className="text-[10px] text-text-grey line-clamp-1">{rel.qualification}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center gap-0.5">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-[10px] font-bold text-slate-700">{rel.rating}</span>
                            </div>
                            <span className="text-[10px] text-text-grey">· ₹{rel.consultationFee}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary-green transition-colors flex-shrink-0" />
                      </Link>
                    ))}
                  </motion.div>
                </AnimatePresence>
              )}

              <Link
                href="/find-doctor"
                className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary-green mt-4 pt-4 border-t border-slate-100 hover:text-dark-green transition-colors"
              >
                View All {doctor.speciality} Doctors
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>

            {/* ICC Disclaimer card */}
            <div className="bg-dark-navy rounded-3xl p-5 border border-slate-800">
              <div className="flex items-start gap-2 mb-2">
                <Shield className="w-4 h-4 text-accent-green flex-shrink-0 mt-0.5" />
                <span className="text-xs font-bold text-white tracking-wide">ICC Consultant Support</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                India Care Consultancy does not charge patients for booking coordination. Slot allocation is finalized after verifying OPD queue availability with the clinic.
              </p>
              <Link
                href="/book-consultation"
                className="mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-white gradient-primary py-2.5 rounded-xl shadow-md w-full glow-green"
              >
                <Heart className="w-3.5 h-3.5 fill-white" />
                Free Consultant Guidance
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════
          SECTION 14 — STICKY MOBILE BOTTOM BAR
      ═══════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-lg border-t border-slate-100 px-4 py-3 safe-area-pb">
        <div className="flex gap-3 max-w-lg mx-auto">
          <button
            onClick={() => setIsBookingOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-white gradient-primary py-3.5 rounded-xl shadow-lg glow-green"
          >
            <PhoneCall className="w-4 h-4" />
            Book Appointment
          </button>
          <Link
            href="/book-consultation"
            className="flex items-center justify-center gap-2 text-sm font-bold text-primary-green border-2 border-primary-green/20 bg-soft-green px-4 py-3.5 rounded-xl"
          >
            <MessageSquare className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Bottom padding for mobile sticky bar */}
      <div className="h-20 lg:hidden" />

      {/* ── Booking Modal ── */}
      <BookingModal
        doctor={bookingDoc}
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

    </div>
  );
}
