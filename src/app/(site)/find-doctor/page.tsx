'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MapPin,
  Star,
  Clock,
  X,
  ChevronRight,
  PhoneCall,
  Heart,
  Stethoscope,
  CheckCircle2,
  Users,
  Building2,
  Shield,
  ArrowRight,
  SlidersHorizontal,
  Languages,
  BadgeCheck,
  TrendingUp,
  Zap,
  ChevronLeft,
  MessageSquare
} from 'lucide-react';
import { INITIAL_DOCTORS, INITIAL_HOSPITALS } from '@/lib/mockData';
import BookingModal, { BookingDoctor } from '@/components/BookingModal';

/* ─────────────────────────────────────────
   Filter Chip Config
───────────────────────────────────────── */
type FilterKey = 'location' | 'experience' | 'fee' | 'gender' | 'consultationType' | 'rating';
interface FilterChipDef {
  key: FilterKey;
  label: string;
  options: { value: string; label: string }[];
}
const FILTER_CHIP_DEFS: FilterChipDef[] = [
  {
    key: 'location',
    label: 'Location',
    options: Array.from(new Set(INITIAL_DOCTORS.map(d => d.location))).map(l => ({ value: l, label: l })),
  },
  {
    key: 'experience',
    label: 'Experience',
    options: [
      { value: '1-5',   label: '1–5 Yrs' },
      { value: '5-10',  label: '5–10 Yrs' },
      { value: '10-15', label: '10–15 Yrs' },
      { value: '15+',   label: '15+ Yrs' },
    ],
  },
  {
    key: 'fee',
    label: 'Consult Fee',
    options: [
      { value: 'Low',    label: 'Under ₹800' },
      { value: 'Medium', label: '₹800–₹1200' },
      { value: 'High',   label: 'Above ₹1200' },
    ],
  },
  {
    key: 'gender',
    label: 'Gender',
    options: [
      { value: 'Male',   label: 'Male Doctor' },
      { value: 'Female', label: 'Female Doctor' },
    ],
  },
  {
    key: 'consultationType',
    label: 'Availability',
    options: [
      { value: 'Online',  label: 'Online' },
      { value: 'Offline', label: 'In-Clinic' },
    ],
  },
  {
    key: 'rating',
    label: 'Min Rating',
    options: [
      { value: '4.8', label: '★ 4.8+' },
      { value: '4.6', label: '★ 4.6+' },
      { value: '4.0', label: '★ 4.0+' },
    ],
  },
];

/* ─────────────────────────────────────────
   Animated Counter
───────────────────────────────────────── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, 35);
    return () => clearInterval(timer);
  }, [target]);
  return <>{count}{suffix}</>;
}

/* ─────────────────────────────────────────
   Doctor Match Score
───────────────────────────────────────── */
function MatchScore({ doc, selectedLocation, selectedFeeRange }: {
  doc: typeof INITIAL_DOCTORS[0];
  selectedLocation: string;
  selectedFeeRange: string;
}) {
  const score = useMemo(() => {
    let s = 70;
    if (doc.rating >= 4.8) s += 10;
    else if (doc.rating >= 4.5) s += 5;
    if (doc.experience >= 10) s += 8;
    else if (doc.experience >= 5) s += 4;
    if (selectedLocation && doc.location === selectedLocation) s += 5;
    if (selectedFeeRange === 'Low' && doc.consultationFee < 800) s += 5;
    if (selectedFeeRange === 'Medium' && doc.consultationFee >= 800 && doc.consultationFee <= 1200) s += 5;
    if (doc.isApproved) s += 2;
    return Math.min(s, 99);
  }, [doc, selectedLocation, selectedFeeRange]);

  const circumference = 2 * Math.PI * 18;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="18" fill="none" stroke="#e8f7f4" strokeWidth="4" />
          <circle
            cx="22" cy="22" r="18" fill="none"
            stroke="#127A6A" strokeWidth="4"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-primary-green">
          {score}%
        </span>
      </div>
      <span className="text-[9px] font-bold text-text-grey uppercase tracking-wide">Match</span>
    </div>
  );
}

/* ─────────────────────────────────────────
   Filter Chip Dropdown
───────────────────────────────────────── */
function FilterChip({ def, value, onChange }: {
  def: FilterChipDef;
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activeOption = def.options.find(o => o.value === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all duration-200 ${
          value
            ? 'bg-primary-green text-white border-primary-green shadow-md shadow-primary-green/20'
            : 'bg-white text-slate-600 border-slate-200 hover:border-primary-green/40 hover:text-primary-green'
        }`}
      >
        {value ? activeOption?.label : def.label}
        {value ? (
          <span
            onClick={e => { e.stopPropagation(); onChange(''); }}
            className="ml-0.5 hover:bg-white/20 rounded-full p-0.5"
          >
            <X className="w-3 h-3" />
          </span>
        ) : (
          <ChevronRight className="w-3 h-3 rotate-90" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-30 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 min-w-[140px]"
          >
            {def.options.map(opt => (
              <button
                key={opt.value}
                onClick={() => { onChange(value === opt.value ? '' : opt.value); setOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  value === opt.value
                    ? 'bg-primary-green text-white'
                    : 'text-slate-700 hover:bg-soft-green hover:text-primary-green'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────
   Doctor Card (Premium Horizontal)
───────────────────────────────────────── */
function DoctorCard({ doc, index, selectedLocation, selectedFeeRange, hospitalName, onBook }: {
  doc: typeof INITIAL_DOCTORS[0];
  index: number;
  selectedLocation: string;
  selectedFeeRange: string;
  hospitalName: string;
  onBook: (doc: BookingDoctor) => void;
}) {
  const isAvailableToday = doc.availability.includes('Monday') || doc.availability.includes('Tuesday') || doc.availability.includes('Wednesday');
  const isTopRated = doc.rating >= 4.8;
  const isElite = doc.subscriptionPlan === 'Elite';
  const isMostBooked = doc.experience >= 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group relative bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-primary-green/8 hover:border-primary-green/20 transition-all duration-300 overflow-hidden"
    >
      {/* Top gradient accent bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-green via-accent-green to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-5">

        {/* ── LEFT: Photo + Badges ── */}
        <div className="relative flex-shrink-0">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border-2 border-white shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
          </div>

          {/* Verified badge */}
          <div className="absolute -bottom-1.5 -right-1.5 bg-primary-green text-white rounded-full p-1 shadow-md border-2 border-white">
            <BadgeCheck className="w-3.5 h-3.5" />
          </div>

          {/* Rating badge */}
          <div className="absolute -top-1.5 -left-1.5 bg-white border border-yellow-100 rounded-xl px-1.5 py-0.5 flex items-center gap-0.5 shadow-sm">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-black text-slate-700">{doc.rating}</span>
          </div>
        </div>

        {/* ── CENTER: Details ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* Trust badges row */}
          <div className="flex flex-wrap gap-1.5">
            {isAvailableToday && (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Available Today
              </span>
            )}
            {isElite && (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
                <Zap className="w-2.5 h-2.5" />
                Elite Specialist
              </span>
            )}
            {isTopRated && (
              <span className="inline-flex items-center gap-1 bg-violet-50 text-violet-700 border border-violet-200 rounded-full px-2 py-0.5 text-[10px] font-bold">
                <TrendingUp className="w-2.5 h-2.5" />
                Top Rated
              </span>
            )}
            {isMostBooked && (
              <span className="inline-flex items-center gap-1 bg-primary-green/8 text-primary-green border border-primary-green/15 rounded-full px-2 py-0.5 text-[10px] font-bold">
                <Shield className="w-2.5 h-2.5" />
                ICC Recommended
              </span>
            )}
          </div>

          {/* Name & Speciality */}
          <div>
            <span className="text-[10px] font-bold text-primary-green uppercase tracking-widest">{doc.speciality}</span>
            <h3 className="font-extrabold text-dark-navy text-lg leading-tight mt-0.5 line-clamp-1">{doc.name}</h3>
            <p className="text-xs text-text-grey font-medium mt-0.5 line-clamp-1">{doc.qualification}</p>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-grey">
            <span className="flex items-center gap-1 font-semibold">
              <Stethoscope className="w-3.5 h-3.5 text-primary-green" />
              {doc.experience} Yrs Exp
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {doc.location}
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <Languages className="w-3.5 h-3.5 text-slate-400" />
              {doc.languages.slice(0, 2).join(', ')}
            </span>
            <span className="flex items-center gap-1 font-semibold">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {doc.consultationType}
            </span>
          </div>

          {/* Hospital name */}
          <div className="flex items-center gap-1.5 text-[11px] text-text-grey font-semibold">
            <Building2 className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="line-clamp-1">{hospitalName}</span>
          </div>

          {/* Availability days */}
          <div className="flex flex-wrap gap-1 mt-1">
            {doc.availability.slice(0, 4).map(day => (
              <span key={day} className="text-[9px] font-bold bg-soft-green text-primary-green px-1.5 py-0.5 rounded-md border border-primary-green/10">
                {day.substring(0, 3)}
              </span>
            ))}
            {doc.availability.length > 4 && (
              <span className="text-[9px] font-bold bg-slate-50 text-slate-500 px-1.5 py-0.5 rounded-md border border-slate-100">
                +{doc.availability.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* ── RIGHT: Fee + Actions + Score ── */}
        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-between gap-4 sm:gap-3 sm:min-w-[130px] pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="flex flex-col sm:items-end gap-0.5">
            <span className="text-[10px] text-text-grey font-medium uppercase tracking-wide">Consultation Fee</span>
            <span className="text-2xl font-black text-dark-navy leading-none">₹{doc.consultationFee}</span>
            <span className="text-[10px] text-text-grey">per session</span>
          </div>

          <MatchScore doc={doc} selectedLocation={selectedLocation} selectedFeeRange={selectedFeeRange} />

          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <button
              onClick={() => onBook({
                id: doc.id,
                name: doc.name,
                speciality: doc.speciality,
                experience: doc.experience,
                consultationFee: doc.consultationFee,
                rating: doc.rating,
                photo: doc.photo,
                qualification: doc.qualification,
                location: doc.location,
                clinicAddress: doc.clinicAddress,
                consultationType: doc.consultationType,
                hospitalName: hospitalName,
                availability: doc.availability,
              })}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-white gradient-primary px-4 py-2.5 rounded-xl shadow-md hover:opacity-90 transition-opacity glow-green whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              Book Slot
            </button>
            <Link
              href={`/find-doctor/${doc.id}`}
              className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary-green border border-primary-green/20 bg-soft-green px-4 py-2.5 rounded-xl hover:bg-light-mint transition-colors whitespace-nowrap"
            >
              View Profile
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   Featured Doctors Carousel
───────────────────────────────────────── */
function FeaturedCarousel({ onBook }: { onBook: (doc: BookingDoctor) => void }) {
  const featured = INITIAL_DOCTORS.filter(d => d.subscriptionPlan === 'Elite' || d.rating >= 4.8).slice(0, 5);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (featured.length === 0) return;
    const t = setInterval(() => setIdx(i => (i + 1) % featured.length), 4000);
    return () => clearInterval(t);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const doc = featured[idx];

  return (
    <section className="py-16 bg-gradient-to-br from-dark-navy via-slate-900 to-dark-navy relative overflow-hidden">
      {/* Decorative orbs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-primary-green/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-accent-green/8 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="text-[10px] font-bold text-accent-green uppercase tracking-widest">Top Specialists</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Featured Doctors</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIdx(i => (i - 1 + featured.length) % featured.length)}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/10"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIdx(i => (i + 1) % featured.length)}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors border border-white/10"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row gap-8 items-center"
          >
            {/* Doctor visual */}
            <div className="relative flex-shrink-0">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-3xl overflow-hidden border-4 border-white/10 shadow-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
              </div>
              <div className="absolute -top-2 -right-2 bg-accent-green text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg">
                ★ {doc.rating}
              </div>
              <div className="absolute -bottom-2 -left-2 bg-primary-green text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                Verified
              </div>
            </div>

            {/* Doctor info */}
            <div className="flex-1 text-center md:text-left">
              <span className="text-[10px] font-bold text-accent-green uppercase tracking-widest">{doc.speciality}</span>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-2">{doc.name}</h3>
              <p className="text-slate-400 text-sm mt-1 font-medium">{doc.qualification}</p>
              <p className="text-slate-300 text-sm mt-4 leading-relaxed max-w-xl">{doc.bio}</p>

              <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-6 text-sm">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl font-extrabold text-white">{doc.experience}+</span>
                  <span className="text-slate-400 text-xs font-medium">Years Exp.</span>
                </div>
                <div className="w-px bg-white/10 hidden md:block" />
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl font-extrabold text-white">₹{doc.consultationFee}</span>
                  <span className="text-slate-400 text-xs font-medium">Consultation Fee</span>
                </div>
                <div className="w-px bg-white/10 hidden md:block" />
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl font-extrabold text-white">{doc.location}</span>
                  <span className="text-slate-400 text-xs font-medium">Location</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-8 justify-center md:justify-start">
                <button
                  onClick={() => onBook({
                    id: doc.id,
                    name: doc.name,
                    speciality: doc.speciality,
                    experience: doc.experience,
                    consultationFee: doc.consultationFee,
                    rating: doc.rating,
                    photo: doc.photo,
                    qualification: doc.qualification,
                    location: doc.location,
                    clinicAddress: doc.clinicAddress,
                    consultationType: doc.consultationType,
                    availability: doc.availability,
                  })}
                  className="flex items-center gap-2 text-sm font-bold text-white gradient-primary px-6 py-3 rounded-xl shadow-md glow-green"
                >
                  <PhoneCall className="w-4 h-4" />
                  Book Consultation
                </button>
                <Link
                  href={`/find-doctor/${doc.id}`}
                  className="flex items-center gap-2 text-sm font-bold text-white border border-white/20 bg-white/10 px-6 py-3 rounded-xl hover:bg-white/20 transition-colors"
                >
                  View Full Profile
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-10">
          {featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-6 bg-accent-green' : 'w-1.5 bg-white/20'}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Related Hospitals
───────────────────────────────────────── */
function RelatedHospitals() {
  return (
    <section className="py-16 bg-light-grey">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="text-[10px] font-bold text-primary-green uppercase tracking-widest">Partner Network</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-navy mt-1">Recommended Hospitals</h2>
            <p className="text-sm text-text-grey mt-1.5">Accredited partner hospitals where our doctors practise.</p>
          </div>
          <Link href="/hospitals" className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary-green hover:text-dark-green transition-colors">
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {INITIAL_HOSPITALS.slice(0, 3).map((hosp, i) => (
            <motion.div
              key={hosp.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-3xl border border-primary-green/10 overflow-hidden shadow-sm hover-lift"
            >
              <div className="relative aspect-[16/9]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={hosp.image} alt={hosp.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/50 to-transparent" />
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 px-2 py-0.5 rounded-lg text-[11px] font-bold text-dark-navy border border-slate-100">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  {hosp.rating}
                </div>
                <div className="absolute top-3 right-3 bg-primary-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Partner
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-bold text-dark-navy text-base line-clamp-1">{hosp.name}</h3>
                <div className="flex items-center gap-1 text-xs text-text-grey mt-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <span className="line-clamp-1">{hosp.address}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {hosp.departments.slice(0, 3).map(dept => (
                    <span key={dept} className="text-[10px] font-bold bg-soft-green text-primary-green px-2 py-0.5 rounded-md">
                      {dept}
                    </span>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-3">
                  <Link href={`/hospitals/${hosp.id}`} className="flex-1 text-center text-xs font-bold text-slate-600 border border-slate-200 py-2.5 rounded-xl hover:bg-slate-50 transition-colors">
                    View Hospital
                  </Link>
                  <Link href="/book-consultation" className="flex-1 text-center text-xs font-bold text-white gradient-primary py-2.5 rounded-xl shadow-sm glow-green">
                    Book via ICC
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────
   Main Page Content
───────────────────────────────────────── */
function FindDoctorPageContent() {
  const searchParams = useSearchParams();

  const initialSpeciality = searchParams.get('speciality') || '';
  const initialLocation = searchParams.get('location') || '';
  const initialBudget = searchParams.get('budget') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpeciality, setSelectedSpeciality] = useState(initialSpeciality);
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);
  const [selectedGender, setSelectedGender] = useState('');
  const [selectedConsultationType, setSelectedConsultationType] = useState('');
  const [selectedExperience, setSelectedExperience] = useState('');
  const [selectedFeeRange, setSelectedFeeRange] = useState(initialBudget);
  const [selectedRating, setSelectedRating] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [heroSearchSpeciality, setHeroSearchSpeciality] = useState(initialSpeciality);
  const [heroSearchLocation, setHeroSearchLocation] = useState(initialLocation);
  const [heroSearchBudget, setHeroSearchBudget] = useState(initialBudget);
  const [heroSearchGender, setHeroSearchGender] = useState('');

  // ── Booking Modal State ──
  const [bookingDoctor, setBookingDoctor] = useState<BookingDoctor | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const handleBookDoctor = useCallback((doc: BookingDoctor) => {
    setBookingDoctor(doc);
    setIsBookingOpen(true);
  }, []);

  const handleCloseBooking = useCallback(() => {
    setIsBookingOpen(false);
  }, []);

  const specialitiesList = useMemo(() => Array.from(new Set(INITIAL_DOCTORS.map(d => d.speciality))), []);
  const locationsList = useMemo(() => Array.from(new Set(INITIAL_DOCTORS.map(d => d.location))), []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedSpeciality(heroSearchSpeciality);
    setSelectedLocation(heroSearchLocation);
    setSelectedFeeRange(heroSearchBudget);
    setSelectedGender(heroSearchGender);
    // Scroll to results
    document.getElementById('doctor-results')?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredDoctors = useMemo(() => {
    return INITIAL_DOCTORS.filter((doc) => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        if (!doc.name.toLowerCase().includes(q) && !(doc.bio?.toLowerCase().includes(q)) && !doc.qualification.toLowerCase().includes(q)) return false;
      }
      if (selectedSpeciality && doc.speciality !== selectedSpeciality) return false;
      if (selectedLocation && doc.location !== selectedLocation) return false;
      if (selectedGender && doc.gender !== selectedGender) return false;
      if (selectedConsultationType) {
        if (selectedConsultationType === 'Online' && doc.consultationType === 'Offline') return false;
        if (selectedConsultationType === 'Offline' && doc.consultationType === 'Online') return false;
      }
      if (selectedExperience) {
        if (selectedExperience === '15+' && doc.experience < 15) return false;
        if (selectedExperience === '10-15' && (doc.experience < 10 || doc.experience >= 15)) return false;
        if (selectedExperience === '5-10' && (doc.experience < 5 || doc.experience >= 10)) return false;
        if (selectedExperience === '1-5' && doc.experience >= 5) return false;
      }
      if (selectedFeeRange) {
        if ((selectedFeeRange === 'Low' || selectedFeeRange === 'economy') && doc.consultationFee >= 800) return false;
        if ((selectedFeeRange === 'Medium' || selectedFeeRange === 'standard') && (doc.consultationFee < 800 || doc.consultationFee > 1200)) return false;
        if ((selectedFeeRange === 'High' || selectedFeeRange === 'premium') && doc.consultationFee <= 1200) return false;
      }
      if (selectedRating && doc.rating < parseFloat(selectedRating)) return false;
      return true;
    });
  }, [searchTerm, selectedSpeciality, selectedLocation, selectedGender, selectedConsultationType, selectedExperience, selectedFeeRange, selectedRating]);

  const clearFilters = () => {
    setSearchTerm(''); setSelectedSpeciality(''); setSelectedLocation('');
    setSelectedGender(''); setSelectedConsultationType(''); setSelectedExperience('');
    setSelectedFeeRange(''); setSelectedRating('');
  };

  const getHospitalName = (hospId?: string) => {
    if (!hospId) return 'Private Clinic';
    return INITIAL_HOSPITALS.find(h => h.id === hospId)?.name || 'Partner Hospital';
  };

  const activeFilterCount = [selectedLocation, selectedExperience, selectedFeeRange, selectedGender, selectedConsultationType, selectedRating].filter(Boolean).length;

  const filterValues: Record<FilterKey, string> = {
    location: selectedLocation,
    experience: selectedExperience,
    fee: selectedFeeRange,
    gender: selectedGender,
    consultationType: selectedConsultationType,
    rating: selectedRating,
  };
  const filterSetters: Record<FilterKey, (v: string) => void> = {
    location: setSelectedLocation,
    experience: setSelectedExperience,
    fee: setSelectedFeeRange,
    gender: setSelectedGender,
    consultationType: setSelectedConsultationType,
    rating: setSelectedRating,
  };

  return (
    <div className="min-h-screen bg-light-grey">

      {/* ═══════════════════════════════════════
          SECTION 1 — PREMIUM HERO SEARCH
      ═══════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-10 pb-24 gradient-hero">
        {/* Decorative green blobs */}
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary-green/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-accent-green/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-text-grey mb-8 font-medium"
          >
            <Link href="/" className="hover:text-primary-green transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-dark-navy font-semibold">Find Doctor</span>
          </motion.div>

          {/* Hero headline */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-10"
          >
            <div className="inline-flex items-center gap-2 bg-soft-green border border-primary-green/15 px-3.5 py-1.5 rounded-full mb-5">
              <CheckCircle2 className="w-3.5 h-3.5 text-primary-green" />
              <span className="text-[10px] font-bold text-primary-green uppercase tracking-widest">100% Verified Doctor Network</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark-navy tracking-tight leading-tight">
              Find the Right Doctor{' '}
              <span className="text-primary-green">For Your Health</span>
            </h1>
            <p className="text-base sm:text-lg text-text-grey mt-4 leading-relaxed">
              Discover verified specialists based on your symptoms, budget, location and healthcare needs.
            </p>
          </motion.div>

          {/* Glass Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <form
              onSubmit={handleHeroSearch}
              className="glass-card rounded-3xl p-5 sm:p-6 shadow-2xl"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Speciality */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-primary-green uppercase tracking-widest px-1 flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" /> Speciality
                  </label>
                  <select
                    value={heroSearchSpeciality}
                    onChange={e => setHeroSearchSpeciality(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark-navy focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10"
                  >
                    <option value="">All Specialities</option>
                    {specialitiesList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-primary-green uppercase tracking-widest px-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </label>
                  <select
                    value={heroSearchLocation}
                    onChange={e => setHeroSearchLocation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark-navy focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10"
                  >
                    <option value="">Any Location</option>
                    {locationsList.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>

                {/* Budget */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-primary-green uppercase tracking-widest px-1 flex items-center gap-1">
                    <Shield className="w-3 h-3" /> Budget
                  </label>
                  <select
                    value={heroSearchBudget}
                    onChange={e => setHeroSearchBudget(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark-navy focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10"
                  >
                    <option value="">Any Budget</option>
                    <option value="Low">Economy (&lt; ₹800)</option>
                    <option value="Medium">Standard (₹800–₹1200)</option>
                    <option value="High">Premium (&gt; ₹1200)</option>
                  </select>
                </div>

                {/* Gender */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-primary-green uppercase tracking-widest px-1 flex items-center gap-1">
                    <Users className="w-3 h-3" /> Gender
                  </label>
                  <select
                    value={heroSearchGender}
                    onChange={e => setHeroSearchGender(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark-navy focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10"
                  >
                    <option value="">Any Gender</option>
                    <option value="Male">Male Doctor</option>
                    <option value="Female">Female Doctor</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-center mt-5">
                <button
                  type="submit"
                  className="flex items-center gap-2 gradient-primary text-white text-sm font-bold px-10 py-3.5 rounded-xl shadow-lg glow-green hover-lift"
                >
                  <Search className="w-4 h-4" />
                  Search Doctors
                </button>
              </div>
            </form>
          </motion.div>

          {/* Floating Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mt-10"
          >
            {[
              { icon: Users, label: 'Verified Doctors', target: 100, suffix: '+' },
              { icon: Building2, label: 'Partner Hospitals', target: 30, suffix: '+' },
              { icon: Heart, label: 'Patients Guided', target: 500, suffix: '+' },
            ].map((stat, i) => (
              <div key={i} className="glass-card rounded-2xl px-5 py-3 flex items-center gap-3 border border-primary-green/10">
                <div className="w-9 h-9 rounded-xl bg-soft-green flex items-center justify-center">
                  <stat.icon className="w-4.5 h-4.5 text-primary-green" />
                </div>
                <div>
                  <span className="text-xl font-extrabold text-dark-navy leading-none">
                    <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                  </span>
                  <p className="text-[10px] text-text-grey font-semibold mt-0.5">{stat.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 3 + 4 — FILTERS + RESULTS
      ═══════════════════════════════════════ */}
      <section id="doctor-results" className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Smart Filter Chips Bar */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {/* Search input */}
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search doctor, keyword..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 pl-8 pr-4 py-2 rounded-full text-xs font-medium text-dark-navy placeholder-slate-400 focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10 w-48 sm:w-56"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Chips */}
            {FILTER_CHIP_DEFS.map(def => (
              <FilterChip
                key={def.key}
                def={def}
                value={filterValues[def.key]}
                onChange={filterSetters[def.key]}
              />
            ))}

            {/* Mobile filter button */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border border-slate-200 bg-white text-slate-600 hover:border-primary-green/40 hover:text-primary-green transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              All Filters
              {activeFilterCount > 0 && (
                <span className="bg-primary-green text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Results count & clear */}
            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-text-grey font-semibold">
                <span className="text-dark-navy font-extrabold">{filteredDoctors.length}</span>{' '}
                {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
              </span>
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear All
                </button>
              )}
            </div>
          </div>

          {/* Active filter summary */}
          {(selectedSpeciality || activeFilterCount > 0) && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex flex-wrap items-center gap-2 mb-6"
            >
              <span className="text-[10px] font-bold text-text-grey uppercase tracking-widest">Active:</span>
              {selectedSpeciality && (
                <span className="flex items-center gap-1 bg-primary-green text-white rounded-full px-3 py-1 text-[10px] font-bold">
                  {selectedSpeciality}
                  <button onClick={() => setSelectedSpeciality('')}><X className="w-2.5 h-2.5" /></button>
                </span>
              )}
              {Object.entries(filterValues).map(([key, val]) => {
                if (!val) return null;
                const def = FILTER_CHIP_DEFS.find(d => d.key === key as FilterKey);
                const label = def?.options.find(o => o.value === val)?.label || val;
                return (
                  <span key={key} className="flex items-center gap-1 bg-primary-green text-white rounded-full px-3 py-1 text-[10px] font-bold">
                    {label}
                    <button onClick={() => filterSetters[key as FilterKey]('')}><X className="w-2.5 h-2.5" /></button>
                  </span>
                );
              })}
            </motion.div>
          )}

          {/* Doctor Cards */}
          {filteredDoctors.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-3xl border border-slate-100 p-16 text-center flex flex-col items-center gap-5 shadow-sm"
            >
              <div className="w-20 h-20 rounded-full bg-soft-green flex items-center justify-center">
                <Stethoscope className="w-9 h-9 text-primary-green/50" />
              </div>
              <div>
                <h3 className="font-extrabold text-dark-navy text-xl">No Doctors Found</h3>
                <p className="text-sm text-text-grey mt-2 max-w-sm">
                  We couldn&apos;t find doctors matching these criteria. Try adjusting your filters.
                </p>
              </div>
              <button
                onClick={clearFilters}
                className="text-sm font-bold text-white gradient-primary px-6 py-3 rounded-xl shadow-md hover-lift"
              >
                Clear All Filters
              </button>
            </motion.div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredDoctors.map((doc, i) => (
                <DoctorCard
                  key={doc.id}
                  doc={doc}
                  index={i}
                  selectedLocation={selectedLocation}
                  selectedFeeRange={selectedFeeRange}
                  hospitalName={getHospitalName(doc.hospitalId)}
                  onBook={handleBookDoctor}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════════════════
          SECTION 5 — FEATURED DOCTORS CAROUSEL
      ═══════════════════════════════════════ */}
      <FeaturedCarousel onBook={handleBookDoctor} />

      {/* ═══════════════════════════════════════
          SECTION 6 — RELATED HOSPITALS
      ═══════════════════════════════════════ */}
      <RelatedHospitals />

      {/* ═══════════════════════════════════════
          SECTION 7 — HELP CHOOSING CTA
      ═══════════════════════════════════════ */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 sm:p-12 border border-primary-green/10 shadow-xl text-center relative overflow-hidden"
          >
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-green/5 blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full bg-accent-green/8 blur-2xl" />

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-navy tracking-tight">
                Not Sure Which Doctor to Choose?
              </h2>
              <p className="text-sm sm:text-base text-text-grey mt-3 max-w-xl mx-auto leading-relaxed">
                Talk to our dedicated healthcare consultant and get personalized doctor recommendations based on your symptoms, budget, and location — for free.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                <Link
                  href="/book-consultation"
                  className="flex items-center justify-center gap-2 text-sm font-bold text-white gradient-primary px-7 py-3.5 rounded-xl shadow-lg glow-green hover-lift"
                >
                  <MessageSquare className="w-4 h-4" />
                  Talk to Consultant
                </Link>
                <a
                  href="tel:+919876543210"
                  className="flex items-center justify-center gap-2 text-sm font-bold text-primary-green border-2 border-primary-green/20 bg-soft-green px-7 py-3.5 rounded-xl hover:bg-light-mint hover:border-primary-green/30 transition-colors"
                >
                  <PhoneCall className="w-4 h-4" />
                  Call Now: +91 98765 43210
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MOBILE FILTERS BOTTOM SHEET
      ═══════════════════════════════════════ */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 z-40 bg-black lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 lg:hidden max-h-[85vh] overflow-y-auto"
            >
              <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />
              <div className="flex justify-between items-center mb-5">
                <span className="font-extrabold text-dark-navy text-lg flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary-green" />
                  Refine Search
                </span>
                <button onClick={() => setIsMobileFiltersOpen(false)}>
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              <div className="flex flex-col gap-5">
                {FILTER_CHIP_DEFS.map(def => (
                  <div key={def.key} className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-dark-navy uppercase tracking-wide">{def.label}</label>
                    <div className="flex flex-wrap gap-2">
                      {def.options.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => filterSetters[def.key](filterValues[def.key] === opt.value ? '' : opt.value)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
                            filterValues[def.key] === opt.value
                              ? 'bg-primary-green text-white border-primary-green'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-primary-green/40'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Speciality in mobile sheet */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-dark-navy uppercase tracking-wide">Speciality</label>
                  <select
                    value={selectedSpeciality}
                    onChange={e => setSelectedSpeciality(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark-navy focus:outline-none focus:border-primary-green"
                  >
                    <option value="">All Specialities</option>
                    {specialitiesList.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => { clearFilters(); setIsMobileFiltersOpen(false); }}
                  className="flex-1 text-xs font-bold text-slate-600 border border-slate-200 py-3 rounded-xl hover:bg-slate-50"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex-1 text-xs font-bold text-white gradient-primary py-3 rounded-xl shadow-md"
                >
                  Show {filteredDoctors.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Booking Modal ── */}
      <BookingModal
        doctor={bookingDoctor}
        isOpen={isBookingOpen}
        onClose={handleCloseBooking}
      />

    </div>
  );
}

/* ─────────────────────────────────────────
   Page Export with Suspense
───────────────────────────────────────── */
export default function FindDoctorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary-green/20 border-t-primary-green animate-spin" />
          <span className="text-sm font-semibold text-text-grey">Loading doctor directory...</span>
        </div>
      </div>
    }>
      <FindDoctorPageContent />
    </Suspense>
  );
}
