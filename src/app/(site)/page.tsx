'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Heart, Brain, Bone, Sparkles, Baby, Activity, Ear, ShieldAlert,
  Flame, Search, CheckCircle2, Users, Building2, ArrowRight, Shield,
  Clock, ChevronRight, Stethoscope, Star, MapPin, PhoneCall,
  BadgeCheck, Zap, TrendingUp, MessageSquare, ChevronDown, ChevronLeft,
  Globe, Award, Lock
} from 'lucide-react';
import { INITIAL_DOCTORS, INITIAL_HOSPITALS, INITIAL_SPECIALITIES } from '@/lib/mockData';

/* ─────────────────────────────────────────────────────
   ANIMATED COUNTER
───────────────────────────────────────────────────── */
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [n, setN] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let s = 0;
        const step = Math.ceil(target / 50);
        const t = setInterval(() => {
          s = Math.min(s + step, target);
          setN(s);
          if (s >= target) clearInterval(t);
        }, 28);
      }
    }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{n}{suffix}</span>;
}

/* ─────────────────────────────────────────────────────
   SPECIALITY ICON MAP
───────────────────────────────────────────────────── */
const ICON_MAP: Record<string, React.ElementType> = {
  Heart, Brain, Bone, Sparkles, Baby, Activity, Ear, ShieldAlert, Flame, Stethoscope,
};
const DEPT_GRAD: Record<string, string> = {
  Heart: 'from-rose-500 to-red-600', Brain: 'from-violet-500 to-purple-600',
  Bone: 'from-amber-500 to-orange-600', Sparkles: 'from-pink-500 to-rose-500',
  Baby: 'from-fuchsia-500 to-pink-600', Activity: 'from-sky-500 to-blue-600',
  Ear: 'from-emerald-500 to-green-600', ShieldAlert: 'from-indigo-500 to-blue-600',
  Flame: 'from-orange-500 to-red-600', Stethoscope: 'from-lime-500 to-green-600',
};

/* ─────────────────────────────────────────────────────
   HERO FLOATING CARD
───────────────────────────────────────────────────── */
function FloatingCard({
  delay, className, icon: Icon, color, label, sublabel
}: { delay: number; className: string; icon: React.ElementType; color: string; label: string; sublabel?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.6 }}
      className={`absolute glass-card border border-white/40 rounded-2xl p-3.5 shadow-xl flex items-center gap-3 ${className}`}
      style={{ backdropFilter: 'blur(16px)' }}
    >
      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3 + delay, repeat: Infinity, ease: 'easeInOut' }}>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4.5 h-4.5 text-white" />
        </div>
      </motion.div>
      <div>
        <p className="text-xs font-extrabold text-dark-navy leading-tight">{label}</p>
        {sublabel && <p className="text-[10px] text-text-grey mt-0.5">{sublabel}</p>}
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────
   FAQ ACCORDION
───────────────────────────────────────────────────── */
function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-2xl overflow-hidden transition-colors duration-200 ${open ? 'border-primary-green/30 bg-soft-green/50' : 'border-slate-100 bg-white'}`}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-5 sm:px-6 py-4 text-left gap-4">
        <span className={`text-sm font-bold transition-colors ${open ? 'text-primary-green' : 'text-dark-navy'}`}>{q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-300 ${open ? 'rotate-180 text-primary-green' : 'text-slate-400'}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }}>
            <p className="px-5 sm:px-6 pb-5 text-sm text-text-grey leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────────────────────────────────────────
   TESTIMONIAL CARD
───────────────────────────────────────────────────── */
const TESTIMONIALS = [
  { name: 'Kavya Sharma', city: 'Delhi', rating: 5, avatar: 'K', text: 'India Care Consultancy matched me with the perfect cardiologist within 24 hours. The entire process was smooth, professional and completely stress-free. Highly recommend!' },
  { name: 'Rohan Mehta', city: 'Mumbai', rating: 5, avatar: 'R', text: 'After struggling for weeks to find a good orthopedic in Gurugram, ICC connected me with a top specialist within hours. My knee surgery was a success.' },
  { name: 'Priya Nair', city: 'Bengaluru', rating: 5, avatar: 'P', text: 'The consultant was incredibly helpful and guided us through every step. We found the right hospital for my mother\'s cancer treatment without any confusion.' },
  { name: 'Arjun Patel', city: 'Ahmedabad', rating: 5, avatar: 'A', text: 'Professional, fast, and genuinely caring. ICC took the guesswork out of finding a verified neurologist. Worth every second spent on the platform.' },
];

/* ─────────────────────────────────────────────────────
   MAIN HOMEPAGE
───────────────────────────────────────────────────── */
export default function Homepage() {
  const router = useRouter();
  const [speciality, setSpeciality] = useState('');
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Testimonial auto-play
  useEffect(() => {
    const t = setInterval(() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length), 5000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (speciality) params.set('speciality', speciality);
    if (location) params.set('location', location);
    if (budget) params.set('budget', budget);
    router.push(`/find-doctor?${params.toString()}`);
  };

  const featuredDoctors = INITIAL_DOCTORS.filter(d => d.isApproved).slice(0, 4);
  const featuredHospitals = INITIAL_HOSPITALS.filter(h => h.subscriptionPlan === 'Premium').slice(0, 3);
  const locations = Array.from(new Set(INITIAL_DOCTORS.map(d => d.location)));

  const faqs = [
    { q: 'What is India Care Consultancy?', a: 'India Care Consultancy is a premium healthcare guidance platform that helps patients find verified doctors, trusted hospitals, and personalised medical recommendations based on their specific needs, location, budget, and preferences.' },
    { q: 'Is the consultation service free?', a: 'Yes. India Care Consultancy does not charge patients for guidance, recommendations, or appointment coordination. Our revenue comes from our verified partner network, not patients.' },
    { q: 'How does ICC verify doctors and hospitals?', a: 'All doctors are verified for NMC registration, qualifications, and experience. Hospitals are vetted for accreditation status, department quality, and patient safety standards before being listed as ICC partners.' },
    { q: 'How quickly can I get a recommendation?', a: 'Most patients receive personalised doctor and hospital recommendations within a few hours of submitting their requirements. Our consultants work rapidly to match you with the best available options.' },
    { q: 'Can ICC help with medical tourism or patients from outside India?', a: 'Yes. India Care Consultancy assists both domestic patients and international patients seeking medical treatment in India. We help with hospital selection, consultation scheduling, and care coordination.' },
  ];

  return (
    <div className="relative overflow-x-hidden">

      {/* ═══════════════════════════════════════════════
          SECTION 1 — HERO
      ═══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden min-h-screen flex flex-col justify-center pt-20 pb-12 gradient-hero">
        {/* Background shapes */}
        <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-primary-green/5 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full bg-accent-green/5 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary-green/3 blur-3xl pointer-events-none" />

        {/* Dot-grid pattern */}
        <div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #127A6A 1px, transparent 0)',
          backgroundSize: '36px 36px'
        }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center min-h-[80vh]">

            {/* ── LEFT ── */}
            <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
              className="lg:col-span-6 flex flex-col gap-7">

              {/* Trust pill */}
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 bg-soft-green border border-primary-green/20 px-4 py-2 rounded-full w-fit shadow-sm">
                <span className="w-2 h-2 rounded-full bg-primary-green animate-pulse" />
                <span className="text-[11px] font-black text-primary-green uppercase tracking-widest">India&apos;s Trusted Healthcare Guidance Platform</span>
              </motion.div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-dark-navy tracking-tight leading-[1.05]">
                Find The Right Doctor{' '}
                <span className="relative inline-block">
                  <span className="text-primary-green">Without</span>
                </span>
                {' '}The Confusion
              </h1>

              <p className="text-base sm:text-lg text-text-grey leading-relaxed max-w-lg">
                Get expert healthcare guidance and discover verified doctors, trusted hospitals, and personalised recommendations — all based on your needs.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-3">
                <Link href="/book-consultation"
                  className="flex items-center gap-2 text-sm font-bold text-white gradient-primary px-7 py-4 rounded-2xl shadow-lg glow-green hover-lift">
                  <MessageSquare className="w-4 h-4" />
                  Get Free Consultation
                </Link>
                <Link href="/find-doctor"
                  className="flex items-center gap-2 text-sm font-bold text-dark-navy glass-card border border-white/50 px-7 py-4 rounded-2xl hover:border-primary-green/30 hover:text-primary-green transition-colors shadow-md">
                  <Search className="w-4 h-4" />
                  Find A Doctor
                </Link>
              </div>

              {/* Trust micro-badges */}
              <div className="flex flex-wrap gap-3 mt-1">
                {[
                  { icon: BadgeCheck, label: '100+ Verified Doctors', cls: 'text-primary-green' },
                  { icon: ShieldAlert, label: 'NMC Certified', cls: 'text-violet-600' },
                  { icon: Star, label: '4.9 Platform Rating', cls: 'text-amber-500' },
                ].map((b, i) => (
                  <span key={i} className="flex items-center gap-1.5 text-xs font-bold text-text-grey bg-white/80 border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm">
                    <b.icon className={`w-3.5 h-3.5 ${b.cls}`} />
                    {b.label}
                  </span>
                ))}
              </div>

              {/* Search Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}
                className="glass-card rounded-3xl p-5 shadow-2xl border border-white/50 mt-2">
                <form onSubmit={handleSearch}>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-primary-green uppercase tracking-widest px-1 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" /> Speciality
                      </label>
                      <select value={speciality} onChange={e => setSpeciality(e.target.value)}
                        className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark-navy focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10">
                        <option value="">Any Speciality</option>
                        {INITIAL_SPECIALITIES.map(s => <option key={s.slug} value={s.title}>{s.title}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-primary-green uppercase tracking-widest px-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Location
                      </label>
                      <select value={location} onChange={e => setLocation(e.target.value)}
                        className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark-navy focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10">
                        <option value="">Any City</option>
                        {locations.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-bold text-primary-green uppercase tracking-widest px-1 flex items-center gap-1">
                        <Globe className="w-3 h-3" /> Budget
                      </label>
                      <select value={budget} onChange={e => setBudget(e.target.value)}
                        className="w-full bg-white/80 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-dark-navy focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10">
                        <option value="">Any Budget</option>
                        <option value="500">Under ₹500</option>
                        <option value="1000">Under ₹1,000</option>
                        <option value="1500">Under ₹1,500</option>
                        <option value="2000">₹2,000+</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit"
                    className="mt-4 w-full flex items-center justify-center gap-2 gradient-primary text-white text-sm font-bold py-3.5 rounded-2xl shadow-lg glow-green hover-lift">
                    <Search className="w-4 h-4" />
                    Search Doctors & Hospitals
                  </button>
                </form>
              </motion.div>
            </motion.div>

            {/* ── RIGHT: Floating Ecosystem ── */}
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.7 }}
              className="lg:col-span-6 relative hidden lg:flex items-center justify-center">

              {/* Central circle */}
              <div className="relative w-72 h-72">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-primary-green/20" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-8 rounded-full border border-dashed border-accent-green/20" />
                {/* Central logo */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-32 h-32 rounded-3xl gradient-primary shadow-2xl glow-green flex flex-col items-center justify-center gap-1 p-4">
                    <Heart className="w-10 h-10 text-white fill-white" />
                    <span className="text-white text-[9px] font-black uppercase tracking-widest text-center leading-tight">India Care Consultancy</span>
                  </div>
                </div>

                {/* Orbiting dots */}
                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                  <motion.div key={i} animate={{ rotate: 360 }} transition={{ duration: 15 + i * 2, repeat: Infinity, ease: 'linear', delay: i * 0.5 }}
                    className="absolute inset-0 flex items-start justify-center" style={{ transformOrigin: '50% 50%' }}>
                    <div className="w-3 h-3 rounded-full bg-primary-green/30 -mt-1.5" style={{ marginTop: '-6px' }} />
                  </motion.div>
                ))}
              </div>

              {/* Floating cards */}
              <FloatingCard delay={0.5} className="top-4 -left-4 w-44" icon={BadgeCheck} color="bg-primary-green" label="Verified Doctors" sublabel="100+ NMC Certified" />
              <FloatingCard delay={0.7} className="top-12 -right-8 w-40" icon={Building2} color="bg-indigo-500" label="Partner Hospitals" sublabel="30+ Premium" />
              <FloatingCard delay={0.9} className="-bottom-2 -left-8 w-40" icon={Clock} color="bg-amber-500" label="Available Today" sublabel="Fast Slots" />
              <FloatingCard delay={1.1} className="bottom-12 -right-4 w-44" icon={MessageSquare} color="bg-violet-500" label="Health Guidance" sublabel="Free consultation" />
              <FloatingCard delay={1.3} className="top-1/2 -left-12 w-38" icon={Zap} color="bg-emerald-500" label="Fast Appointment" sublabel="Same day" />
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-text-grey cursor-pointer"
          onClick={() => document.getElementById('why-icc')?.scrollIntoView({ behavior: 'smooth' })}>
          <span className="text-[10px] font-bold uppercase tracking-widest">Scroll</span>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 2 — WHY ICC
      ═══════════════════════════════════════════════ */}
      <section id="why-icc" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[10px] font-black text-primary-green uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-navy mt-3 tracking-tight leading-tight">
              Why India Care Consultancy
            </h2>
            <p className="text-base text-text-grey mt-4 leading-relaxed">
              We combine healthcare expertise with modern technology to deliver the most personalised doctor and hospital recommendations.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: BadgeCheck, grad: 'from-emerald-500 to-primary-green', title: 'Verified Doctor Network', desc: 'Every doctor on ICC is verified for NMC registration, qualifications, and clinical experience before listing.' },
              { icon: Building2, grad: 'from-indigo-500 to-violet-600', title: 'Trusted Hospital Partners', desc: 'We partner only with NABH accredited and quality-assessed hospitals across India\'s major cities.' },
              { icon: Stethoscope, grad: 'from-amber-500 to-orange-600', title: 'Personalised Guidance', desc: 'Our consultants study your specific health needs, budget, and location to deliver tailored recommendations.' },
              { icon: Globe, grad: 'from-rose-500 to-pink-600', title: 'Budget Friendly Options', desc: 'We match you with doctors and hospitals that fit your financial requirements — without compromising on quality.' },
              { icon: Clock, grad: 'from-sky-500 to-blue-600', title: 'Appointment Support', desc: 'Once you\'re matched, our team coordinates your appointment slot directly with the clinic or hospital.' },
              { icon: Lock, grad: 'from-violet-500 to-purple-600', title: 'Complete Confidentiality', desc: 'All health information shared with us is kept strictly confidential. Your privacy is our priority.' },
            ].map((card, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group relative bg-white border border-slate-100 rounded-3xl p-6 sm:p-7 shadow-sm hover:shadow-xl hover:shadow-primary-green/6 hover:border-primary-green/20 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                {/* Top-right shine */}
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-gradient-to-br from-primary-green/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.grad} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="w-5.5 h-5.5 text-white" />
                </div>
                <h3 className="font-extrabold text-dark-navy text-base mb-2">{card.title}</h3>
                <p className="text-sm text-text-grey leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 3 — HOW IT WORKS
      ═══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-light-grey relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-green/4 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[10px] font-black text-primary-green uppercase tracking-widest">Simple Process</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-dark-navy mt-3 tracking-tight leading-tight">
              How It Works
            </h2>
            <p className="text-base text-text-grey mt-4">From health concern to confirmed appointment — in 4 simple steps.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connecting line (desktop) */}
            <div className="absolute hidden lg:block top-[52px] left-[12%] right-[12%] h-px bg-gradient-to-r from-transparent via-primary-green/30 to-transparent" />

            {[
              { step: '01', icon: MessageSquare, title: 'Tell Us Your Health Concern', desc: 'Share your symptoms, speciality needed, location, and budget preference.' },
              { step: '02', icon: Stethoscope, title: 'Consultant Reviews Your Requirement', desc: 'Our healthcare consultant analyses your needs and identifies the best options.' },
              { step: '03', icon: BadgeCheck, title: 'Get Recommended Doctors', desc: 'Receive a personalised list of verified doctors and hospitals that match your criteria.' },
              { step: '04', icon: PhoneCall, title: 'Book Appointment Easily', desc: 'We coordinate the appointment with the clinic or hospital on your behalf.' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.12, duration: 0.5 }}
                className="relative flex flex-col items-center text-center gap-4">
                {/* Circle */}
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl gradient-primary shadow-xl flex items-center justify-center group-hover:scale-110 z-10 relative glow-green">
                    <s.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -top-2.5 -right-2.5 bg-white text-primary-green text-[10px] font-black px-2 py-0.5 rounded-full border border-primary-green/20 shadow-sm z-20">
                    {s.step}
                  </div>
                </div>
                <div>
                  <h3 className="font-extrabold text-dark-navy text-base leading-snug">{s.title}</h3>
                  <p className="text-sm text-text-grey mt-2 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.5 }}
            className="flex justify-center mt-12">
            <Link href="/book-consultation"
              className="flex items-center gap-2 text-sm font-bold text-white gradient-primary px-8 py-4 rounded-2xl shadow-lg glow-green hover-lift">
              Start For Free <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 4 — SPECIALITIES
      ═══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-black text-primary-green uppercase tracking-widest">Specialities</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-navy mt-2 tracking-tight">Popular Medical Specialities</h2>
            </div>
            <Link href="/specialities" className="flex items-center gap-1.5 text-sm font-bold text-primary-green hover:text-dark-green transition-colors">
              All Specialities <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
            {INITIAL_SPECIALITIES.map((sp, i) => {
              const Icon = ICON_MAP[sp.icon] || Stethoscope;
              const grad = DEPT_GRAD[sp.icon] || 'from-primary-green to-accent-green';
              return (
                <motion.div key={sp.slug}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="flex-shrink-0 w-40">
                  <Link href={`/find-doctor?speciality=${sp.title}`}
                    className="flex flex-col items-center gap-3 p-5 bg-white border border-slate-100 rounded-3xl hover:border-primary-green/25 hover:shadow-xl hover:shadow-primary-green/8 transition-all duration-300 group text-center">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-dark-navy text-sm group-hover:text-primary-green transition-colors">{sp.title}</h3>
                      <p className="text-[10px] text-text-grey mt-1 leading-snug line-clamp-2">{sp.desc.split(',')[0]}</p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 5 — FEATURED DOCTORS
      ═══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-light-grey relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full bg-primary-green/4 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-black text-primary-green uppercase tracking-widest">Our Network</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-navy mt-2 tracking-tight">Featured Verified Doctors</h2>
            </div>
            <Link href="/find-doctor" className="flex items-center gap-1.5 text-sm font-bold text-primary-green hover:text-dark-green transition-colors">
              View All Doctors <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featuredDoctors.map((doc, i) => {
              const matchScore = Math.min(99, 70 + (doc.rating >= 4.8 ? 10 : 5) + (doc.experience >= 10 ? 8 : 4) + (doc.subscriptionPlan === 'Elite' ? 6 : 3) + 5);
              return (
                <motion.div key={doc.id}
                  initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary-green/8 hover:border-primary-green/20 hover:-translate-y-1.5 transition-all duration-300">
                  {/* Photo */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-soft-green">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/60 via-transparent to-transparent" />
                    {/* Match score */}
                    <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-xl text-[10px] font-black text-primary-green border border-primary-green/10 shadow-sm">
                      {matchScore}% Match
                    </div>
                    <div className="absolute bottom-3 left-3 flex gap-1">
                      <span className="flex items-center gap-1 bg-primary-green text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                        <BadgeCheck className="w-2.5 h-2.5" /> Verified
                      </span>
                      {doc.subscriptionPlan === 'Elite' && (
                        <span className="flex items-center gap-1 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                          <Zap className="w-2.5 h-2.5" /> Elite
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Info */}
                  <div className="p-4 sm:p-5">
                    <h3 className="font-extrabold text-dark-navy text-sm leading-tight">{doc.name}</h3>
                    <p className="text-[11px] text-text-grey mt-0.5">{doc.qualification}</p>
                    <div className="flex items-center gap-2 mt-2.5">
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= Math.floor(doc.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-700">{doc.rating}</span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5 text-[11px] text-text-grey font-medium">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" />{doc.location}</span>
                      <span>{doc.experience} Yrs</span>
                    </div>
                    <div className="flex items-center justify-between mt-2.5">
                      <span className="text-sm font-extrabold text-dark-navy">₹{doc.consultationFee}</span>
                      <span className="text-[10px] font-semibold text-primary-green">per session</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                      <Link href={`/find-doctor/${doc.id}`}
                        className="text-center text-[11px] font-bold text-primary-green border border-primary-green/20 bg-soft-green py-2 rounded-xl hover:bg-light-mint transition-colors">
                        View Profile
                      </Link>
                      <Link href={`/book-consultation?doc=${doc.id}`}
                        className="text-center text-[11px] font-bold text-white gradient-primary py-2 rounded-xl shadow-sm glow-green">
                        Book Now
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 6 — FEATURED HOSPITALS
      ═══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
            <div>
              <span className="text-[10px] font-black text-primary-green uppercase tracking-widest">Partner Network</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-navy mt-2 tracking-tight">Featured Partner Hospitals</h2>
            </div>
            <Link href="/hospitals" className="flex items-center gap-1.5 text-sm font-bold text-primary-green hover:text-dark-green transition-colors">
              All Hospitals <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredHospitals.map((hosp, i) => (
              <motion.div key={hosp.id}
                initial={{ opacity: 0, y: 25 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary-green/8 hover:border-primary-green/20 hover:-translate-y-1.5 transition-all duration-300">
                <div className="relative aspect-[16/9] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={hosp.image} alt={hosp.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-navy/60 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="flex items-center gap-1 bg-primary-green text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      <BadgeCheck className="w-2.5 h-2.5" /> Verified
                    </span>
                    <span className="flex items-center gap-1 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                      <Zap className="w-2.5 h-2.5" /> Premium
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2 py-1 rounded-lg border border-slate-100 text-[11px] font-black flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" /> {hosp.rating}
                  </div>
                  <div className="absolute bottom-3 left-3">
                    <h3 className="font-extrabold text-white text-sm leading-tight line-clamp-1">{hosp.name}</h3>
                    <p className="text-[10px] text-white/80 mt-0.5 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" />{hosp.location}</p>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {hosp.departments.slice(0, 3).map(d => (
                      <span key={d} className="text-[10px] font-bold bg-soft-green text-primary-green px-2 py-0.5 rounded-md border border-primary-green/10">{d}</span>
                    ))}
                    {hosp.departments.length > 3 && <span className="text-[10px] font-bold text-text-grey bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">+{hosp.departments.length - 3}</span>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Link href={`/hospitals/${hosp.id}`}
                      className="flex-1 text-center text-[11px] font-bold text-primary-green border border-primary-green/20 bg-soft-green py-2.5 rounded-xl hover:bg-light-mint transition-colors">
                      View Hospital
                    </Link>
                    <Link href="/book-consultation"
                      className="flex-1 text-center text-[11px] font-bold text-white gradient-primary py-2.5 rounded-xl shadow-sm glow-green">
                      Request Appt.
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 7 — TESTIMONIALS
      ═══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-light-grey relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary-green/4 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-[10px] font-black text-primary-green uppercase tracking-widest">Patient Stories</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-navy mt-3 tracking-tight">Real Patients. Real Results.</h2>
            <p className="text-base text-text-grey mt-4">Over 500+ patients have trusted India Care Consultancy with their healthcare journey.</p>
          </motion.div>

          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div key={testimonialIdx} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.4 }}
                className="max-w-3xl mx-auto">
                <div className="glass-card rounded-3xl p-8 sm:p-10 border border-primary-green/10 shadow-xl text-center relative">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-6xl text-primary-green/20 font-serif leading-none select-none">&ldquo;</div>
                  <div className="flex gap-0.5 justify-center mb-5">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-base sm:text-lg text-dark-navy font-medium leading-relaxed italic">
                    &ldquo;{TESTIMONIALS[testimonialIdx].text}&rdquo;
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-green to-accent-green flex items-center justify-center text-white font-black text-lg shadow-md">
                      {TESTIMONIALS[testimonialIdx].avatar}
                    </div>
                    <div className="text-left">
                      <p className="font-extrabold text-dark-navy">{TESTIMONIALS[testimonialIdx].name}</p>
                      <p className="text-sm text-text-grey">{TESTIMONIALS[testimonialIdx].city} · Verified Patient</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4 mt-8">
              <button onClick={() => setTestimonialIdx(i => (i - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)}
                className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:border-primary-green/30 hover:bg-soft-green transition-colors">
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <div className="flex gap-2">
                {TESTIMONIALS.map((_, i) => (
                  <button key={i} onClick={() => setTestimonialIdx(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${i === testimonialIdx ? 'w-6 bg-primary-green' : 'w-2 bg-slate-200'}`} />
                ))}
              </div>
              <button onClick={() => setTestimonialIdx(i => (i + 1) % TESTIMONIALS.length)}
                className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center hover:border-primary-green/30 hover:bg-soft-green transition-colors">
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 8 — STATISTICS (DARK)
      ═══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-dark-navy relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-primary-green/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-accent-green/8 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <span className="text-[10px] font-black text-accent-green uppercase tracking-widest">Numbers That Matter</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">Platform Statistics</h2>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, target: 500, suffix: '+', label: 'Patients Guided', sub: 'And growing daily', color: 'bg-primary-green/20 text-accent-green' },
              { icon: BadgeCheck, target: 100, suffix: '+', label: 'Verified Doctors', sub: 'NMC Registered', color: 'bg-violet-500/20 text-violet-300' },
              { icon: Building2, target: 30, suffix: '+', label: 'Partner Hospitals', sub: 'NABH Accredited', color: 'bg-amber-500/20 text-amber-300' },
              { icon: Star, target: 95, suffix: '%', label: 'Patient Satisfaction', sub: 'Based on reviews', color: 'bg-rose-500/20 text-rose-300' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 text-center shadow-xl">
                <div className={`w-12 h-12 rounded-2xl ${s.color} flex items-center justify-center mx-auto mb-4`}>
                  <s.icon className="w-6 h-6" />
                </div>
                <div className="text-4xl sm:text-5xl font-extrabold text-white leading-none">
                  <Counter target={s.target} suffix={s.suffix} />
                </div>
                <h3 className="font-bold text-white mt-3 text-sm sm:text-base">{s.label}</h3>
                <p className="text-slate-400 text-xs mt-1">{s.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 9 — RECOMMENDATION ENGINE
      ═══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <span className="text-[10px] font-black text-primary-green uppercase tracking-widest">Intelligent Matching</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-navy mt-3 mb-5 tracking-tight leading-tight">
                How We Recommend The Right Doctor
              </h2>
              <p className="text-base text-text-grey leading-relaxed mb-8">
                Our recommendation engine evaluates 6 key parameters to ensure every match is highly personalised, clinically relevant, and budget-appropriate.
              </p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Location Match',    pct: 95, icon: MapPin },
                  { label: 'Budget Match',       pct: 88, icon: Globe },
                  { label: 'Doctor Experience', pct: 92, icon: Award },
                  { label: 'Availability',       pct: 87, icon: Clock },
                  { label: 'Hospital Quality',   pct: 94, icon: Building2 },
                  { label: 'Patient Reviews',    pct: 96, icon: Star },
                ].map((f, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -15 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                    className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-soft-green flex items-center justify-center flex-shrink-0">
                      <f.icon className="w-4 h-4 text-primary-green" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-xs font-bold text-dark-navy">{f.label}</span>
                        <span className="text-xs font-black text-primary-green">{f.pct}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: `${f.pct}%` }} viewport={{ once: true }} transition={{ delay: i * 0.07 + 0.3, duration: 0.8 }}
                          className="h-full rounded-full gradient-primary" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
              className="glass-card rounded-3xl p-8 border border-primary-green/15 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-dark-navy text-base">ICC Recommendation Score</h3>
                  <p className="text-xs text-text-grey mt-0.5">Personalised match algorithm</p>
                </div>
              </div>
              {/* Sample match score card */}
              <div className="bg-white rounded-2xl p-5 border border-slate-100 mb-4">
                <div className="flex items-center gap-3 mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={INITIAL_DOCTORS[0].photo} alt={INITIAL_DOCTORS[0].name} className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" />
                  <div>
                    <h4 className="font-extrabold text-dark-navy text-sm">{INITIAL_DOCTORS[0].name}</h4>
                    <p className="text-[10px] text-primary-green font-bold">{INITIAL_DOCTORS[0].speciality}</p>
                  </div>
                  <div className="ml-auto bg-primary-green/10 border border-primary-green/20 rounded-xl px-3 py-1.5 text-center">
                    <span className="text-lg font-extrabold text-primary-green leading-none">95%</span>
                    <p className="text-[9px] text-primary-green font-bold">Match</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Location Match', 'Budget Match', 'High Rating', 'Verified'].map(b => (
                    <div key={b} className="flex items-center gap-1.5 text-[10px] font-semibold text-primary-green bg-soft-green px-2.5 py-1.5 rounded-lg">
                      <CheckCircle2 className="w-3 h-3 flex-shrink-0" /> {b}
                    </div>
                  ))}
                </div>
              </div>
              <Link href="/book-consultation"
                className="w-full flex items-center justify-center gap-2 text-sm font-bold text-white gradient-primary py-3.5 rounded-2xl shadow-lg glow-green">
                <MessageSquare className="w-4 h-4" /> Get My Personalised Match
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 10 — HOSPITAL LOGO SCROLL
      ═══════════════════════════════════════════════ */}
      <section className="py-14 sm:py-20 bg-light-grey border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 text-center">
          <span className="text-[10px] font-black text-primary-green uppercase tracking-widest">Partner Network</span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-dark-navy mt-2">Trusted Hospital Partners</h2>
        </div>
        <div className="relative">
          <motion.div animate={{ x: [0, -50 * INITIAL_HOSPITALS.length] }} transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            className="flex gap-6 w-max">
            {[...INITIAL_HOSPITALS, ...INITIAL_HOSPITALS].map((h, i) => (
              <Link key={i} href={`/hospitals/${h.id}`}
                className="flex-shrink-0 flex items-center gap-3 bg-white border border-slate-100 rounded-2xl px-5 py-3.5 shadow-sm hover:border-primary-green/20 hover:shadow-md transition-all w-56">
                <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border border-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={h.image} alt={h.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold text-dark-navy line-clamp-1">{h.name}</p>
                  <p className="text-[10px] text-text-grey flex items-center gap-0.5 mt-0.5"><Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" /> {h.rating}</p>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 11 — FAQ
      ═══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <span className="text-[10px] font-black text-primary-green uppercase tracking-widest">Common Questions</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-navy mt-3 tracking-tight">Frequently Asked Questions</h2>
            <p className="text-base text-text-grey mt-4">Everything you need to know about India Care Consultancy.</p>
          </motion.div>
          <div className="flex flex-col gap-3">
            {faqs.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════
          SECTION 12 — FINAL CTA
      ═══════════════════════════════════════════════ */}
      <section className="py-20 sm:py-28 bg-dark-navy relative overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-10 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary-green/10 blur-3xl pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full mb-8">
              <Heart className="w-4 h-4 text-accent-green fill-accent-green" />
              <span className="text-[11px] font-bold text-white/90 uppercase tracking-widest">Free Healthcare Guidance</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">
              Still Not Sure Which<br />
              <span className="text-accent-green">Doctor To Choose?</span>
            </h2>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10">
              Speak to our healthcare consultant and receive personalised, expert doctor and hospital recommendations — completely free of charge.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-consultation"
                className="flex items-center justify-center gap-2 text-base font-bold text-white gradient-primary px-9 py-4.5 rounded-2xl shadow-2xl glow-green hover-lift">
                <MessageSquare className="w-5 h-5" />
                Talk To Consultant
              </Link>
              <a href="tel:+919876543210"
                className="flex items-center justify-center gap-2 text-base font-bold text-white border-2 border-white/20 bg-white/10 px-9 py-4.5 rounded-2xl hover:bg-white/20 transition-colors">
                <PhoneCall className="w-5 h-5" />
                Call Now
              </a>
            </div>
            <p className="text-slate-500 text-xs mt-8">
              No charges. No hidden fees. No obligations.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ══ MOBILE STICKY CONSULT BAR ══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-lg border-t border-slate-100 px-4 py-3 safe-area-pb">
        <Link href="/book-consultation"
          className="flex items-center justify-center gap-2 text-sm font-bold text-white gradient-primary py-3.5 rounded-xl shadow-lg glow-green w-full">
          <MessageSquare className="w-4 h-4" />
          Get Free Consultation
        </Link>
      </div>

      {/* Mobile bottom spacing */}
      <div className="h-20 lg:hidden" />
    </div>
  );
}
