'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Stethoscope, ChevronRight, ArrowRight,
  Home, Search, Users, BadgeCheck, Phone, Loader2,
} from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

// 10-colour preset palette — matches panel color_preset index
const COLOR_PRESETS = [
  { gradient: 'from-rose-500 to-red-600',     lightBg: 'bg-rose-50',    lightBorder: 'border-rose-100',    lightText: 'text-rose-600' },
  { gradient: 'from-violet-500 to-purple-600', lightBg: 'bg-violet-50',  lightBorder: 'border-violet-100',  lightText: 'text-violet-600' },
  { gradient: 'from-amber-500 to-orange-600',  lightBg: 'bg-amber-50',   lightBorder: 'border-amber-100',   lightText: 'text-amber-600' },
  { gradient: 'from-pink-500 to-fuchsia-600',  lightBg: 'bg-pink-50',    lightBorder: 'border-pink-100',    lightText: 'text-pink-600' },
  { gradient: 'from-emerald-500 to-teal-600',  lightBg: 'bg-emerald-50', lightBorder: 'border-emerald-100', lightText: 'text-emerald-600' },
  { gradient: 'from-sky-500 to-blue-600',      lightBg: 'bg-sky-50',     lightBorder: 'border-sky-100',     lightText: 'text-sky-600' },
  { gradient: 'from-cyan-500 to-teal-600',     lightBg: 'bg-cyan-50',    lightBorder: 'border-cyan-100',    lightText: 'text-cyan-600' },
  { gradient: 'from-indigo-500 to-blue-700',   lightBg: 'bg-indigo-50',  lightBorder: 'border-indigo-100',  lightText: 'text-indigo-600' },
  { gradient: 'from-slate-500 to-slate-700',   lightBg: 'bg-slate-50',   lightBorder: 'border-slate-100',   lightText: 'text-slate-600' },
  { gradient: 'from-orange-500 to-red-500',    lightBg: 'bg-orange-50',  lightBorder: 'border-orange-100',  lightText: 'text-orange-600' },
];

// Static fallback data (shown if API is unreachable)
const FALLBACK: ApiSpec[] = [
  { id: 1, name: 'Cardiology',        icon: '❤️', description: 'Comprehensive care for coronary artery disease, heart failure, arrhythmia, valve disorders, bypass surgery, and angiography.', symptoms: ['Chest pain','Shortness of breath','Heart palpitations','Dizziness','High BP'],          color_preset: 0, doctor_count: 14 },
  { id: 2, name: 'Neurology',         icon: '🧠', description: "Expert diagnosis of brain, spinal cord, nerve, and muscle disorders. Stroke, epilepsy, Parkinson's, and migraines.",             symptoms: ['Severe headaches','Numbness','Seizures','Memory loss','Muscle weakness'],            color_preset: 1, doctor_count: 11 },
  { id: 3, name: 'Orthopedics',       icon: '🦴', description: 'Bone, joint, ligament, and muscle health. Joint replacement, sports injuries, fractures, and spinal conditions.',                symptoms: ['Joint pain','Back/neck pain','Swollen joints','Stiffness','Limited motion'],          color_preset: 2, doctor_count: 18 },
  { id: 4, name: 'Dermatology',       icon: '🩺', description: 'Skin, hair, and nail care. Acne, eczema, psoriasis, skin cancers, and premium aesthetic skin treatments.',                       symptoms: ['Rashes','Acne flare-ups','Mole changes','Hair thinning','Nail infections'],           color_preset: 3, doctor_count: 9  },
  { id: 5, name: 'Gynecology',        icon: '🌸', description: "Women's health — reproductive system, high-risk pregnancy, fertility concerns, and menopause support.",                          symptoms: ['Pelvic pain','Irregular cycles','Pregnancy check','Hormonal swings','Fertility'],     color_preset: 4, doctor_count: 12 },
  { id: 6, name: 'Pediatrics',        icon: '👶', description: 'Compassionate care for newborns, children & adolescents. Vaccinations, growth monitoring, pediatric disease management.',       symptoms: ['Childhood fevers','Growth lag','Vaccinations','Asthma/Allergies','Behavioural'],      color_preset: 5, doctor_count: 10 },
  { id: 7, name: 'ENT',               icon: '👂', description: 'Ear, nose, throat, sinuses, head, and neck treatment. Sleep apnea and allergy management.',                                    symptoms: ['Sinus pressure','Hearing loss','Tonsil swelling','Hoarse voice','Tinnitus'],          color_preset: 6, doctor_count: 8  },
  { id: 8, name: 'Ophthalmology',     icon: '👁️', description: 'Comprehensive eye care — cataracts, glaucoma, retinal disorders, LASIK, and paediatric eye issues.',                          symptoms: ['Blurred vision','Eye pain','Redness','Watery eyes','Night blindness'],                color_preset: 7, doctor_count: 5  },
  { id: 9, name: 'Gastroenterology',  icon: '🫁', description: 'Digestive system disorders — esophagus, stomach, liver, bowel issues, endoscopy, and colonoscopy.',                            symptoms: ['Acid reflux','Bloating','Abdominal cramps','Chronic diarrhea','Jaundice'],            color_preset: 9, doctor_count: 9  },
  { id: 10, name: 'Urology',          icon: '🏥', description: 'Urinary tract and male reproductive system. Kidney stones, bladder control, and prostate health.',                              symptoms: ['Blood in urine','Urination pain','Kidney stone','Bladder weakness','Prostate'],       color_preset: 5, doctor_count: 7  },
];

type ApiSpec = {
  id: number;
  name: string;
  icon: string;
  description: string;
  symptoms: string[];
  color_preset: number;
  doctor_count: number;
};

const fu = (i = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export default function SpecialitiesPage() {
  const [specs, setSpecs]   = useState<ApiSpec[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/specialities`)
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.specialities) && data.specialities.length > 0) {
          setSpecs(data.specialities);
        } else {
          setSpecs(FALLBACK);
        }
      })
      .catch(() => setSpecs(FALLBACK))
      .finally(() => setLoading(false));
  }, []);

  const filtered = specs.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.symptoms || []).some(sym => sym.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#F8FAFB]">

      {/* ══ HERO ══ */}
      <section className="relative overflow-hidden bg-[#050F1A]">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-primary-green/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 relative z-10">
          {/* Breadcrumb */}
          <motion.div {...fu()} className="flex items-center gap-1.5 text-white/40 text-xs font-medium mb-10">
            <Link href="/" className="hover:text-white/80 flex items-center gap-1 transition-colors"><Home className="w-3 h-3" /> Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70 font-semibold">Medical Specialities</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <motion.div {...fu(0)} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
                <Stethoscope className="w-3.5 h-3.5 text-primary-green" />
                <span className="text-white/70 text-xs font-bold tracking-wider uppercase">{loading ? '…' : `${specs.length} Medical Departments`}</span>
              </motion.div>
              <motion.h1 {...fu(1)} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                Find Care by{' '}
                <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #22C55E, #10B981)' }}>
                  Speciality
                </span>
              </motion.h1>
              <motion.p {...fu(2)} className="text-white/55 text-base mt-5 leading-relaxed max-w-md">
                Browse verified specialists across {loading ? 'multiple' : specs.length} medical departments. Select a speciality to find doctors, check symptoms, and book a consultation — all free of charge.
              </motion.p>

              {/* Stat pills */}
              <motion.div {...fu(3)} className="flex flex-wrap gap-3 mt-7">
                {[
                  { icon: Users,      text: '100+ Verified Doctors' },
                  { icon: BadgeCheck, text: 'MCI-Checked' },
                  { icon: Phone,      text: 'Free Guidance' },
                ].map((p, i) => (
                  <div key={i} className="flex items-center gap-1.5 bg-white/8 border border-white/10 text-white/70 text-xs font-semibold px-3.5 py-2 rounded-full">
                    <p.icon className="w-3.5 h-3.5 text-primary-green" /> {p.text}
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Search */}
            <motion.div {...fu(2)} className="flex flex-col gap-3">
              <p className="text-white/40 text-xs font-bold uppercase tracking-widest">Search by Symptom or Speciality</p>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="e.g. chest pain, joint ache, acne…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-white border border-white/10 pl-11 pr-4 py-4 rounded-2xl text-sm text-dark-navy placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-green/30 shadow-xl"
                />
              </div>
              {/* Quick symptom chips */}
              <div className="flex flex-wrap gap-2">
                {['Chest pain', 'Joint pain', 'Headache', 'Skin rash', 'Fever'].map(s => (
                  <button key={s} onClick={() => setSearch(s)}
                    className="text-[11px] font-bold text-white/60 border border-white/10 px-3 py-1.5 rounded-full hover:bg-white/10 hover:text-white transition-all">
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══ GRID ══ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-green" />
          </div>
        )}

        {!loading && (
          <>
            {/* Result count */}
            <div className="flex items-center justify-between mb-7">
              <h2 className="text-sm font-extrabold text-dark-navy">
                {search ? `Results for "${search}"` : 'All Specialities'}
                <span className="ml-2 text-xs font-bold text-text-grey bg-slate-100 px-2 py-0.5 rounded-full">{filtered.length}</span>
              </h2>
              {search && (
                <button onClick={() => setSearch('')} className="text-xs font-bold text-primary-green hover:text-dark-green transition-colors">
                  Clear filter ×
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-16 text-center flex flex-col items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-soft-green flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-primary-green/50" />
                </div>
                <h3 className="font-bold text-dark-navy">No speciality matched</h3>
                <p className="text-sm text-text-grey max-w-xs">Try a different symptom or keyword.</p>
                <button onClick={() => setSearch('')} className="text-sm font-bold text-white gradient-primary px-6 py-2.5 rounded-xl shadow-md">Reset</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                <AnimatePresence>
                  {filtered.map((spec, i) => {
                    const colors = COLOR_PRESETS[spec.color_preset] ?? COLOR_PRESETS[0];
                    const isActive = active === spec.id;
                    return (
                      <motion.div
                        key={spec.id}
                        layout
                        initial={{ opacity: 0, y: 28 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                        className={`group bg-white rounded-3xl border overflow-hidden flex flex-col cursor-pointer transition-all duration-300 ${
                          isActive ? 'border-primary-green/30 shadow-lg ring-1 ring-primary-green/20' : 'border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-slate-200'
                        }`}
                        onClick={() => setActive(isActive ? null : spec.id)}
                      >
                        {/* Top gradient bar */}
                        <div className={`h-1.5 w-full bg-gradient-to-r ${colors.gradient}`} />

                        <div className="p-6 flex flex-col gap-4 flex-1">
                          {/* Header */}
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.gradient} flex items-center justify-center shadow-md flex-shrink-0 text-2xl`}>
                              {spec.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h2 className="font-extrabold text-dark-navy text-lg leading-tight">{spec.name}</h2>
                              <div className="flex items-center gap-1.5 mt-1">
                                <BadgeCheck className={`w-3.5 h-3.5 ${colors.lightText}`} />
                                <span className={`text-[10px] font-bold ${colors.lightText}`}>{spec.doctor_count} Verified Doctors</span>
                              </div>
                            </div>
                            <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${isActive ? 'border-primary-green bg-primary-green' : 'border-slate-200'}`}>
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${isActive ? 'rotate-90 text-white' : 'text-slate-400'}`} />
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-text-grey leading-relaxed line-clamp-2 group-hover:line-clamp-none transition-all">{spec.description}</p>

                          {/* Symptom chips */}
                          {spec.symptoms && spec.symptoms.length > 0 && (
                            <div>
                              <p className="text-[9px] font-black text-text-grey uppercase tracking-widest mb-2">Common Symptoms</p>
                              <div className="flex flex-wrap gap-1.5">
                                {spec.symptoms.map(s => (
                                  <span key={s} className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${colors.lightBg} ${colors.lightBorder} ${colors.lightText}`}>
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Expanded action panel */}
                          <AnimatePresence>
                            {isActive && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.28 }}
                                className="overflow-hidden"
                              >
                                <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2.5">
                                  <Link href={`/find-doctor?speciality=${spec.name}`}
                                    onClick={e => e.stopPropagation()}
                                    className="flex items-center justify-center gap-1.5 text-xs font-bold text-white gradient-primary py-3 rounded-xl shadow-md glow-green">
                                    <Users className="w-3.5 h-3.5" /> Find Doctors
                                  </Link>
                                  <Link href={`/hospitals?speciality=${spec.name}`}
                                    onClick={e => e.stopPropagation()}
                                    className="flex items-center justify-center gap-1.5 text-xs font-bold text-primary-green bg-soft-green border border-primary-green/15 py-3 rounded-xl hover:bg-light-mint transition-colors">
                                    View Clinics
                                  </Link>
                                  <Link href="/book-consultation"
                                    onClick={e => e.stopPropagation()}
                                    className="col-span-2 flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 py-3 rounded-xl hover:bg-slate-100 transition-colors">
                                    <Phone className="w-3.5 h-3.5" /> Request a Consultation
                                  </Link>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Footer link (when collapsed) */}
                          {!isActive && (
                            <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
                              <Link href={`/find-doctor?speciality=${spec.name}`}
                                onClick={e => e.stopPropagation()}
                                className={`flex items-center gap-1.5 text-xs font-bold ${colors.lightText} hover:opacity-80 transition-opacity`}>
                                Find Doctors <ArrowRight className="w-3.5 h-3.5" />
                              </Link>
                              <Link href={`/hospitals?speciality=${spec.name}`}
                                onClick={e => e.stopPropagation()}
                                className="text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                                View Clinics
                              </Link>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* CTA band */}
            <motion.div {...fu()} className="mt-16 relative overflow-hidden rounded-3xl bg-[#050F1A] text-center py-14 px-6">
              <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-primary-green/20 rounded-full blur-[80px] pointer-events-none" />
              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 text-[11px] font-bold px-4 py-2 rounded-full mb-5">
                  <BadgeCheck className="w-3.5 h-3.5 text-primary-green" /> Not sure which speciality you need?
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Our Consultants Will Guide You</h2>
                <p className="text-white/50 text-sm mt-2 max-w-md mx-auto leading-relaxed">Describe your symptoms and our clinical team will match you with the right specialist — completely free.</p>
                <div className="flex flex-wrap gap-3 justify-center mt-7">
                  <Link href="/book-consultation"
                    className="flex items-center gap-2 text-sm font-bold text-dark-navy bg-white px-8 py-4 rounded-2xl shadow-lg hover:bg-soft-green transition-all">
                    <Phone className="w-4 h-4 text-primary-green" /> Get Free Guidance
                  </Link>
                  <Link href="/find-doctor"
                    className="flex items-center gap-2 text-sm font-bold text-white/80 bg-white/8 border border-white/10 px-8 py-4 rounded-2xl hover:bg-white/15 transition-all">
                    Browse All Doctors <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}
