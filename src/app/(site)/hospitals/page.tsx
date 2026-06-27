'use client';

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, MapPin, Star, Building2, X, ChevronRight, ShieldCheck,
  Stethoscope, Heart, Users, CheckCircle2, PhoneCall, MessageSquare,
  BadgeCheck, ArrowRight, SlidersHorizontal, Zap,
  ChevronLeft
} from 'lucide-react';
import { INITIAL_HOSPITALS, INITIAL_DOCTORS } from '@/lib/mockData';

/* ─── Animated Counter ─── */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let s = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
      s = Math.min(s + step, target);
      setCount(s);
      if (s >= target) clearInterval(t);
    }, 35);
    return () => clearInterval(t);
  }, [target]);
  return <>{count}{suffix}</>;
}

/* ─── Filter Chip Defs ─── */
type FilterKey = 'location' | 'facility' | 'type';
const FILTER_CHIPS: { key: FilterKey; label: string; options: { v: string; l: string }[] }[] = [
  {
    key: 'location',
    label: 'Location',
    options: Array.from(new Set(INITIAL_HOSPITALS.map(h => h.location))).map(l => ({ v: l, l })),
  },
  {
    key: 'type',
    label: 'Hospital Type',
    options: [
      { v: 'Premium', l: 'Premium' },
      { v: 'Basic', l: 'Basic' },
    ],
  },
  {
    key: 'facility',
    label: 'Facility',
    options: [
      { v: '24/7 Emergency', l: 'Emergency 24/7' },
      { v: 'ICU', l: 'ICU Available' },
      { v: 'Robotic Surgery', l: 'Robotic Surgery' },
      { v: 'Ambulance service', l: 'Ambulance' },
    ],
  },
];

/* ─── Filter Chip Component ─── */
function Chip({ def, value, onChange }: {
  def: typeof FILTER_CHIPS[0];
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = def.options.find(o => o.v === value);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} className="relative flex-shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border transition-all duration-200 ${value
          ? 'bg-primary-green text-white border-primary-green shadow-md'
          : 'bg-white text-slate-600 border-slate-200 hover:border-primary-green/40 hover:text-primary-green'}`}
      >
        {value ? active?.l : def.label}
        {value
          ? <span onClick={e => { e.stopPropagation(); onChange(''); }} className="ml-0.5"><X className="w-3 h-3" /></span>
          : <ChevronRight className="w-3 h-3 rotate-90" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 mt-2 z-30 bg-white rounded-2xl shadow-xl border border-slate-100 p-1.5 min-w-[150px]"
          >
            {def.options.map(opt => (
              <button key={opt.v} onClick={() => { onChange(value === opt.v ? '' : opt.v); setOpen(false); }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${value === opt.v ? 'bg-primary-green text-white' : 'text-slate-700 hover:bg-soft-green hover:text-primary-green'}`}>
                {opt.l}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Hospital Card ─── */
function HospitalCard({ hosp, index, docCount }: { hosp: typeof INITIAL_HOSPITALS[0]; index: number; docCount: number }) {
  const isPremium = hosp.subscriptionPlan === 'Premium';
  const hasEmergency = hosp.facilities.some(f => f.toLowerCase().includes('emergency'));
  const hasICU = hosp.facilities.some(f => f.toLowerCase().includes('icu'));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.4 }}
      className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary-green/8 hover:border-primary-green/20 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative aspect-[16/9] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={hosp.image} alt={hosp.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/50 via-transparent to-transparent" />
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <span className="flex items-center gap-1 bg-primary-green text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
            <BadgeCheck className="w-3 h-3" /> Verified Partner
          </span>
          {isPremium && (
            <span className="flex items-center gap-1 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-sm">
              <Zap className="w-3 h-3" /> Premium Network
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-xl shadow-sm border border-slate-100">
          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-black text-dark-navy">{hosp.rating}</span>
        </div>
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {hasEmergency && (
            <span className="flex items-center gap-1 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> Emergency
            </span>
          )}
          {hasICU && (
            <span className="bg-dark-navy/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
              ICU Available
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6">
        <h2 className="font-extrabold text-dark-navy text-lg leading-tight line-clamp-1">{hosp.name}</h2>
        <div className="flex items-start gap-1.5 text-xs text-text-grey mt-1.5 font-medium">
          <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <span className="line-clamp-1">{hosp.address}</span>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1 text-xs font-semibold text-primary-green">
            <Users className="w-3.5 h-3.5" />
            {docCount} Doctors
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-text-grey">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            {hosp.departments.length} Depts
          </div>
        </div>

        {/* Departments */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {hosp.departments.slice(0, 4).map(d => (
            <span key={d} className="text-[10px] font-bold bg-soft-green text-primary-green px-2 py-0.5 rounded-md border border-primary-green/10">{d}</span>
          ))}
          {hosp.departments.length > 4 && (
            <span className="text-[10px] font-bold bg-slate-50 text-slate-500 px-2 py-0.5 rounded-md border border-slate-100">+{hosp.departments.length - 4}</span>
          )}
        </div>

        {/* Facilities */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {hosp.facilities.slice(0, 3).map(f => (
            <span key={f} className="flex items-center gap-1 text-[10px] font-semibold text-text-grey bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              <CheckCircle2 className="w-2.5 h-2.5 text-primary-green" /> {f}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-slate-100">
          <Link href={`/hospitals/${hosp.id}`}
            className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary-green border border-primary-green/20 bg-soft-green py-2.5 rounded-xl hover:bg-light-mint transition-colors">
            View Profile <ArrowRight className="w-3 h-3" />
          </Link>
          <Link href="/book-consultation"
            className="flex items-center justify-center gap-1.5 text-xs font-bold text-white gradient-primary py-2.5 rounded-xl shadow-sm glow-green">
            <PhoneCall className="w-3 h-3" /> Book Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Featured Carousel ─── */
function FeaturedCarousel() {
  const featured = INITIAL_HOSPITALS.filter(h => h.subscriptionPlan === 'Premium');
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % featured.length), 4500);
    return () => clearInterval(t);
  }, [featured.length]);
  if (!featured.length) return null;
  const h = featured[idx];
  return (
    <section className="py-16 bg-dark-navy relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-primary-green/10 blur-3xl pointer-events-none" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="text-[10px] font-bold text-accent-green uppercase tracking-widest">Spotlight</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Featured Hospitals</h2>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIdx(i => (i - 1 + featured.length) % featured.length)}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/10 transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setIdx(i => (i + 1) % featured.length)}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white border border-white/10 transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={idx} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4 }}
            className="flex flex-col md:flex-row gap-8 items-center">
            <div className="relative w-full md:w-80 aspect-[4/3] rounded-3xl overflow-hidden flex-shrink-0 border-2 border-white/10 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/40 to-transparent" />
              <div className="absolute top-3 left-3 flex items-center gap-1 bg-primary-green text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                <BadgeCheck className="w-3 h-3" /> Verified
              </div>
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 backdrop-blur px-2.5 py-1.5 rounded-xl">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-black text-dark-navy">{h.rating}</span>
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <span className="text-[10px] font-bold text-accent-green uppercase tracking-widest">{h.location}</span>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mt-2">{h.name}</h3>
              <p className="text-slate-400 text-sm mt-2 font-medium">{h.address}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                {h.departments.slice(0, 5).map(d => (
                  <span key={d} className="text-[10px] font-bold bg-white/10 text-white px-2.5 py-1 rounded-full border border-white/10">{d}</span>
                ))}
              </div>
              <div className="flex flex-wrap justify-center md:justify-start gap-6 mt-5 text-sm">
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl font-extrabold text-white">{h.departments.length}+</span>
                  <span className="text-slate-400 text-xs">Departments</span>
                </div>
                <div className="w-px bg-white/10 hidden md:block" />
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl font-extrabold text-white">{h.facilities.length}+</span>
                  <span className="text-slate-400 text-xs">Facilities</span>
                </div>
                <div className="w-px bg-white/10 hidden md:block" />
                <div className="flex flex-col items-center md:items-start">
                  <span className="text-2xl font-extrabold text-white">{h.opdTimings}</span>
                  <span className="text-slate-400 text-xs">OPD Timings</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-3 mt-7 justify-center md:justify-start">
                <Link href={`/hospitals/${h.id}`}
                  className="flex items-center gap-2 text-sm font-bold text-white border border-white/20 bg-white/10 px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">
                  View Profile <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/book-consultation"
                  className="flex items-center gap-2 text-sm font-bold text-white gradient-primary px-6 py-3 rounded-xl shadow-md glow-green">
                  <PhoneCall className="w-4 h-4" /> Book via ICC
                </Link>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        <div className="flex justify-center gap-1.5 mt-8">
          {featured.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'w-6 bg-accent-green' : 'w-1.5 bg-white/20'}`} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Main Page ─── */
function HospitalsPageContent() {
  const searchParams = useSearchParams();
  const querySpeciality = searchParams.get('speciality') || '';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedDept, setSelectedDept] = useState(querySpeciality);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [heroLocation, setHeroLocation] = useState('');
  const [heroDept, setHeroDept] = useState(querySpeciality);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  const locationsList = useMemo(() => Array.from(new Set(INITIAL_HOSPITALS.map(h => h.location))), []);
  const deptList = useMemo(() => {
    const s = new Set<string>();
    INITIAL_HOSPITALS.forEach(h => h.departments.forEach(d => s.add(d)));
    return Array.from(s);
  }, []);

  const filtered = useMemo(() => INITIAL_HOSPITALS.filter(h => {
    if (searchTerm && !h.name.toLowerCase().includes(searchTerm.toLowerCase()) && !h.address.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (selectedLocation && h.location !== selectedLocation) return false;
    if (selectedDept && !h.departments.includes(selectedDept)) return false;
    if (selectedFacility && !h.facilities.some(f => f.toLowerCase().includes(selectedFacility.toLowerCase()))) return false;
    if (selectedType && h.subscriptionPlan !== selectedType) return false;
    return true;
  }), [searchTerm, selectedLocation, selectedDept, selectedFacility, selectedType]);

  const clearFilters = () => { setSearchTerm(''); setSelectedLocation(''); setSelectedDept(''); setSelectedFacility(''); setSelectedType(''); };
  const activeCount = [selectedLocation, selectedDept, selectedFacility, selectedType].filter(Boolean).length;
  const getDocCount = (id: string) => INITIAL_DOCTORS.filter(d => d.hospitalId === id).length;

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedLocation(heroLocation);
    setSelectedDept(heroDept);
    document.getElementById('hospital-results')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-light-grey">

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden pt-10 pb-24 gradient-hero">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full bg-primary-green/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-accent-green/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Breadcrumb */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs text-text-grey mb-8 font-medium">
            <Link href="/" className="hover:text-primary-green transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-dark-navy font-semibold">Partner Hospitals</span>
          </motion.div>

          {/* Headline */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 bg-soft-green border border-primary-green/15 px-3.5 py-1.5 rounded-full mb-5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary-green" />
              <span className="text-[10px] font-bold text-primary-green uppercase tracking-widest">NABH & Accredited Partner Network</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-dark-navy tracking-tight leading-tight">
              Find Trusted Hospitals{' '}
              <span className="text-primary-green">Near You</span>
            </h1>
            <p className="text-base sm:text-lg text-text-grey mt-4 leading-relaxed">
              Explore verified hospitals based on location, facilities, departments, doctor availability, ratings and patient preferences.
            </p>
          </motion.div>

          {/* Search Card */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
            className="max-w-5xl mx-auto">
            <form onSubmit={handleHeroSearch} className="glass-card rounded-3xl p-5 sm:p-6 shadow-2xl">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-primary-green uppercase tracking-widest px-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Location
                  </label>
                  <select value={heroLocation} onChange={e => setHeroLocation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark-navy focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10">
                    <option value="">Any City</option>
                    {locationsList.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-primary-green uppercase tracking-widest px-1 flex items-center gap-1">
                    <Stethoscope className="w-3 h-3" /> Department
                  </label>
                  <select value={heroDept} onChange={e => setHeroDept(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark-navy focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10">
                    <option value="">All Departments</option>
                    {deptList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
                  <label className="text-[10px] font-bold text-primary-green uppercase tracking-widest px-1 flex items-center gap-1">
                    <Search className="w-3 h-3" /> Hospital Name
                  </label>
                  <input type="text" placeholder="Search by name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark-navy focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10 placeholder-slate-400" />
                </div>
              </div>
              <div className="flex justify-center mt-5">
                <button type="submit"
                  className="flex items-center gap-2 gradient-primary text-white text-sm font-bold px-10 py-3.5 rounded-xl shadow-lg glow-green hover-lift">
                  <Search className="w-4 h-4" /> Search Hospitals
                </button>
              </div>
            </form>
          </motion.div>

          {/* Stats */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-4 mt-10">
            {[
              { icon: Building2, label: 'Partner Hospitals', target: 30, suffix: '+' },
              { icon: Users, label: 'Verified Doctors', target: 100, suffix: '+' },
              { icon: Heart, label: 'Patients Guided', target: 500, suffix: '+' },
              { icon: Stethoscope, label: 'Specialities', target: 20, suffix: '+' },
            ].map((s, i) => (
              <div key={i} className="glass-card rounded-2xl px-5 py-3 flex items-center gap-3 border border-primary-green/10">
                <div className="w-9 h-9 rounded-xl bg-soft-green flex items-center justify-center">
                  <s.icon className="w-4.5 h-4.5 text-primary-green" />
                </div>
                <div>
                  <span className="text-xl font-extrabold text-dark-navy leading-none">
                    <AnimatedCounter target={s.target} suffix={s.suffix} />
                  </span>
                  <p className="text-[10px] text-text-grey font-semibold mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ FILTERS + RESULTS ══ */}
      <section id="hospital-results" className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Filter chips bar */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div className="relative flex-shrink-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input type="text" placeholder="Search hospitals..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                className="bg-white border border-slate-200 pl-8 pr-4 py-2 rounded-full text-xs font-medium text-dark-navy placeholder-slate-400 focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10 w-44 sm:w-52" />
              {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X className="w-3 h-3" /></button>}
            </div>

            {FILTER_CHIPS.map(def => (
              <Chip key={def.key} def={def}
                value={def.key === 'location' ? selectedLocation : def.key === 'facility' ? selectedFacility : selectedType}
                onChange={v => { if (def.key === 'location') setSelectedLocation(v); else if (def.key === 'facility') setSelectedFacility(v); else setSelectedType(v); }} />
            ))}

            <button onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold border border-slate-200 bg-white text-slate-600">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Filters
              {activeCount > 0 && <span className="bg-primary-green text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-black">{activeCount}</span>}
            </button>

            <div className="ml-auto flex items-center gap-3">
              <span className="text-xs text-text-grey font-semibold">
                <span className="text-dark-navy font-extrabold">{filtered.length}</span> Hospitals Found
              </span>
              {activeCount > 0 && <button onClick={clearFilters} className="text-xs font-bold text-red-500 flex items-center gap-1"><X className="w-3 h-3" />Clear</button>}
            </div>
          </div>

          {/* Active filter pills */}
          {(selectedDept || activeCount > 0) && (
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="text-[10px] font-bold text-text-grey uppercase tracking-widest">Active:</span>
              {selectedDept && <span className="flex items-center gap-1 bg-primary-green text-white rounded-full px-3 py-1 text-[10px] font-bold">{selectedDept}<button onClick={() => setSelectedDept('')}><X className="w-2.5 h-2.5 ml-0.5" /></button></span>}
              {selectedLocation && <span className="flex items-center gap-1 bg-primary-green text-white rounded-full px-3 py-1 text-[10px] font-bold">{selectedLocation}<button onClick={() => setSelectedLocation('')}><X className="w-2.5 h-2.5 ml-0.5" /></button></span>}
              {selectedFacility && <span className="flex items-center gap-1 bg-primary-green text-white rounded-full px-3 py-1 text-[10px] font-bold">{selectedFacility}<button onClick={() => setSelectedFacility('')}><X className="w-2.5 h-2.5 ml-0.5" /></button></span>}
              {selectedType && <span className="flex items-center gap-1 bg-primary-green text-white rounded-full px-3 py-1 text-[10px] font-bold">{selectedType}<button onClick={() => setSelectedType('')}><X className="w-2.5 h-2.5 ml-0.5" /></button></span>}
            </div>
          )}

          {/* Grid */}
          {filtered.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-3xl border border-slate-100 p-16 text-center flex flex-col items-center gap-5 shadow-sm">
              <div className="w-20 h-20 rounded-full bg-soft-green flex items-center justify-center">
                <Building2 className="w-9 h-9 text-primary-green/50" />
              </div>
              <div>
                <h3 className="font-extrabold text-dark-navy text-xl">No Hospitals Found</h3>
                <p className="text-sm text-text-grey mt-2 max-w-sm">Try adjusting your filters or search term.</p>
              </div>
              <button onClick={clearFilters} className="text-sm font-bold text-white gradient-primary px-6 py-3 rounded-xl shadow-md hover-lift">Clear All Filters</button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map((h, i) => <HospitalCard key={h.id} hosp={h} index={i} docCount={getDocCount(h.id)} />)}
            </div>
          )}
        </div>
      </section>

      {/* ══ FEATURED CAROUSEL ══ */}
      <FeaturedCarousel />

      {/* ══ CTA ══ */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="glass-card rounded-3xl p-8 sm:p-12 border border-primary-green/10 shadow-xl text-center relative overflow-hidden">
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-primary-green/5 blur-2xl" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 shadow-lg">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-navy">Confused About Which Hospital to Choose?</h2>
              <p className="text-sm sm:text-base text-text-grey mt-3 max-w-xl mx-auto leading-relaxed">
                Our healthcare consultants provide personalised hospital recommendations based on your treatment, budget, and location — completely free.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
                <Link href="/book-consultation"
                  className="flex items-center justify-center gap-2 text-sm font-bold text-white gradient-primary px-7 py-3.5 rounded-xl shadow-lg glow-green hover-lift">
                  <MessageSquare className="w-4 h-4" /> Talk to Consultant
                </Link>
                <a href="tel:+919876543210"
                  className="flex items-center justify-center gap-2 text-sm font-bold text-primary-green border-2 border-primary-green/20 bg-soft-green px-7 py-3.5 rounded-xl hover:bg-light-mint transition-colors">
                  <PhoneCall className="w-4 h-4" /> Call Now: +91 98765 43210
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══ MOBILE FILTER SHEET ══ */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 z-40 bg-black lg:hidden" />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl shadow-2xl p-6 lg:hidden max-h-[80vh] overflow-y-auto">
              <div className="w-10 h-1 rounded-full bg-slate-200 mx-auto mb-5" />
              <div className="flex justify-between items-center mb-5">
                <span className="font-extrabold text-dark-navy text-lg flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-primary-green" /> Filter Hospitals
                </span>
                <button onClick={() => setIsMobileFiltersOpen(false)}><X className="w-5 h-5 text-slate-400" /></button>
              </div>
              {[
                { label: 'Location', items: locationsList.map(l => ({ v: l, l })), val: selectedLocation, set: setSelectedLocation },
                { label: 'Department', items: deptList.slice(0, 8).map(d => ({ v: d, l: d })), val: selectedDept, set: setSelectedDept },
              ].map(f => (
                <div key={f.label} className="mb-5">
                  <label className="text-xs font-bold text-dark-navy uppercase tracking-wide mb-2 block">{f.label}</label>
                  <div className="flex flex-wrap gap-2">
                    {f.items.map(opt => (
                      <button key={opt.v} onClick={() => f.set(f.val === opt.v ? '' : opt.v)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${f.val === opt.v ? 'bg-primary-green text-white border-primary-green' : 'bg-white text-slate-600 border-slate-200 hover:border-primary-green/40'}`}>
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className="flex gap-3 pt-4 border-t border-slate-100">
                <button onClick={() => { clearFilters(); setIsMobileFiltersOpen(false); }}
                  className="flex-1 text-xs font-bold text-slate-600 border border-slate-200 py-3 rounded-xl">Clear All</button>
                <button onClick={() => setIsMobileFiltersOpen(false)}
                  className="flex-1 text-xs font-bold text-white gradient-primary py-3 rounded-xl shadow-md">
                  Show {filtered.length} Results
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HospitalsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary-green/20 border-t-primary-green animate-spin" />
          <span className="text-sm font-semibold text-text-grey">Loading hospitals...</span>
        </div>
      </div>
    }>
      <HospitalsPageContent />
    </Suspense>
  );
}
