'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck, HeartHandshake, Eye, Award, CheckCircle2,
  ChevronRight, Phone, Home, Star, Users, Building2,
  Stethoscope, ArrowRight, BadgeCheck, Heart, Zap, Globe,
  TrendingUp, Lock, Smile,
} from 'lucide-react';

/* ── helpers ── */
const fu = (i = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

const STATS = [
  { icon: Users,       value: '5,000+', label: 'Patients Guided',   color: 'from-emerald-400 to-teal-500' },
  { icon: Stethoscope, value: '100+',   label: 'Verified Doctors',  color: 'from-blue-400 to-indigo-500' },
  { icon: Building2,   value: '30+',    label: 'Partner Hospitals', color: 'from-violet-400 to-purple-500' },
  { icon: Star,        value: '4.9★',   label: 'Patient Rating',    color: 'from-amber-400 to-orange-500' },
];

const PILLARS = [
  {
    icon: Award, accent: '#10B981', bg: 'bg-emerald-50', border: 'border-emerald-100',
    tag: 'Why We Exist',
    title: 'Our Mission',
    text: 'To guide every Indian patient through the medical ecosystem with integrity, transparency, and clinical data — helping them discover the right verified doctors and accredited hospitals.',
  },
  {
    icon: Eye, accent: '#3B82F6', bg: 'bg-blue-50', border: 'border-blue-100',
    tag: "Where We're Headed",
    title: 'Our Vision',
    text: "To build India's most trusted and patient-centric healthcare guidance portal — known for reducing treatment delay times and matching patients accurately without bias.",
  },
  {
    icon: HeartHandshake, accent: '#8B5CF6', bg: 'bg-violet-50', border: 'border-violet-100',
    tag: 'Our Promise',
    title: 'Our Commitment',
    text: 'We never accept incentives to recommend unaccredited practitioners. Your case notes and budget preferences are always first. Your health outcome is our only incentive.',
  },
];

const STANDARDS = [
  { icon: BadgeCheck, title: 'Active Medical Registration', desc: 'All registrations verified against MCI or State Medical Councils.' },
  { icon: Building2,  title: 'Hospital Safety Vetting',     desc: 'Screened for sanitation, equipment age, ICU setups & NABH status.' },
  { icon: TrendingUp, title: 'No Artificial Markups',       desc: 'We display genuine consultation fees. Zero hidden charges for patients.' },
  { icon: Lock,       title: 'Personal Privacy Guard',      desc: 'All data is encrypted and shared only with your explicit approval.' },
  { icon: Smile,      title: 'Post-Referral Follow-up',     desc: 'Our coordinators check in to ensure your experience was seamless.' },
  { icon: Globe,      title: 'Pan-India Network',           desc: 'Doctor and hospital listings across 20+ major Indian cities.' },
];

const TEAM = [
  { name: 'Dr. Priya Mehta',   role: 'Clinical Advisor',       initial: 'P', color: 'from-emerald-400 to-teal-500' },
  { name: 'Rohit Sharma',      role: 'Founder & CEO',          initial: 'R', color: 'from-blue-400 to-indigo-500' },
  { name: 'Ananya Krishnan',   role: 'Head of Partnerships',   initial: 'A', color: 'from-violet-400 to-purple-500' },
  { name: 'Dr. Sanjay Gupta',  role: 'Medical Quality Lead',   initial: 'S', color: 'from-amber-400 to-orange-500' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFB]">

      {/* ══════════════════ HERO ══════════════════ */}
      <section className="relative overflow-hidden bg-[#050F1A]">
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-green/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 relative z-10">
          {/* Breadcrumb */}
          <motion.div {...fu()} className="flex items-center gap-1.5 text-white/40 text-xs font-medium mb-12">
            <Link href="/" className="hover:text-white/80 flex items-center gap-1 transition-colors"><Home className="w-3 h-3" /> Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white/70 font-semibold">About Us</span>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            {/* Left copy */}
            <div>
              <motion.div {...fu(0)} className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-6">
                <span className="w-2 h-2 rounded-full bg-primary-green animate-pulse" />
                <span className="text-white/70 text-xs font-bold tracking-wider uppercase">Trusted Healthcare Partner · Est. 2024</span>
              </motion.div>

              <motion.h1 {...fu(1)} className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1] tracking-tight">
                Guiding India's{' '}
                <span className="relative">
                  <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #22C55E, #10B981)' }}>
                    Patients
                  </span>
                </span>{' '}
                to the Right Doctor
              </motion.h1>

              <motion.p {...fu(2)} className="text-white/55 text-base mt-6 leading-relaxed max-w-lg">
                India Care Consultancy was built to eliminate the confusion and opacity when choosing medical specialists. We are your trusted clinical referral partner — not a hospital, not a pharmacy. Just guidance you can trust.
              </motion.p>

              <motion.div {...fu(3)} className="flex flex-wrap gap-3 mt-8">
                <Link href="/book-consultation"
                  className="flex items-center gap-2 text-sm font-bold text-white px-6 py-3.5 rounded-2xl shadow-lg transition-all"
                  style={{ background: 'linear-gradient(135deg, #0A5C4E, #1A9A83)' }}
                >
                  <Phone className="w-4 h-4" /> Free Consultation
                </Link>
                <Link href="/find-doctor"
                  className="flex items-center gap-2 text-sm font-bold text-white/80 bg-white/8 border border-white/10 px-6 py-3.5 rounded-2xl hover:bg-white/15 transition-all"
                >
                  Explore Doctors <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>

            {/* Right image card */}
            <motion.div {...fu(1)} className="relative hidden lg:block">
              <div className="relative rounded-3xl overflow-hidden aspect-[5/4] shadow-2xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1576091160621-263300b93c85?auto=format&fit=crop&q=80&w=700"
                  alt="Healthcare Consultants"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050F1A]/70 via-transparent to-transparent" />
                {/* Floating badge */}
                <div className="absolute bottom-5 left-5 right-5 bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-green flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 fill-white text-white" />
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-sm">5,000+ Patients Helped</p>
                    <p className="text-white/60 text-[11px] mt-0.5">Across 20+ Indian cities — completely free</p>
                  </div>
                  <BadgeCheck className="w-6 h-6 text-emerald-400 ml-auto flex-shrink-0" />
                </div>
              </div>
              {/* Decorative ring */}
              <div className="absolute -bottom-6 -right-6 w-40 h-40 rounded-full border-2 border-white/5 pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-60 h-60 rounded-full border border-white/3 pointer-events-none" />
            </motion.div>
          </div>

          {/* Stat pills */}
          <div className="mt-14 grid grid-cols-2 sm:grid-cols-4 gap-4">
            {STATS.map((s, i) => (
              <motion.div key={i} {...fu(i)}
                className="relative overflow-hidden bg-white/5 border border-white/8 rounded-2xl p-5"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center mb-3 shadow-lg`}>
                  <s.icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-2xl font-extrabold text-white">{s.value}</p>
                <p className="text-white/50 text-xs font-semibold mt-1">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════ MISSION / VISION / COMMITMENT ══════════════════ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        <motion.div {...fu()} className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 bg-soft-green border border-primary-green/15 text-primary-green text-[11px] font-bold px-3.5 py-1.5 rounded-full">
            <Zap className="w-3 h-3" /> What Drives Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-navy mt-3 tracking-tight">Our Core Principles</h2>
          <p className="text-sm text-text-grey mt-2 max-w-md mx-auto leading-relaxed">The three pillars that define how we operate and what we stand for every single day.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLARS.map((p, i) => (
            <motion.div key={i} {...fu(i)}
              className={`relative bg-white rounded-3xl border ${p.border} p-7 flex flex-col gap-4 overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}
            >
              {/* Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-3xl" style={{ backgroundColor: p.accent }} />
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-2xl ${p.bg} flex items-center justify-center`}>
                  <p.icon className="w-6 h-6" style={{ color: p.accent }} />
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border text-xs" style={{ color: p.accent, backgroundColor: `${p.bg}`, borderColor: `${p.accent}25` }}>
                  {p.tag}
                </span>
              </div>
              <h3 className="font-extrabold text-dark-navy text-xl">{p.title}</h3>
              <p className="text-sm text-text-grey leading-relaxed">{p.text}</p>
            </motion.div>
          ))}
        </div>

        {/* ══ Our Story ══ */}
        <motion.div {...fu()} className="mt-20 grid grid-cols-1 lg:grid-cols-2 gap-0 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="relative min-h-[320px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1504813184591-01572f98c85f?auto=format&fit=crop&q=80&w=700"
              alt="Our Story"
              className="w-full h-full object-cover absolute inset-0"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-slate-900/20 lg:to-slate-900/5" />
          </div>
          <div className="p-8 lg:p-12 flex flex-col justify-center gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-soft-green border border-primary-green/15 text-primary-green text-[11px] font-bold px-3 py-1.5 rounded-full">
                <Heart className="w-3 h-3 fill-primary-green" /> Our Story
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-dark-navy mt-3 leading-tight">
                Born from a Personal<br />Healthcare Struggle
              </h2>
            </div>
            <p className="text-sm text-text-grey leading-relaxed">
              Our founders personally experienced the chaos of navigating India's medical system — unverified credentials, hidden fees, and no single trusted voice to say "this doctor is right for you."
            </p>
            <p className="text-sm text-text-grey leading-relaxed">
              India Care Consultancy was built to solve exactly that. We analyze doctor credentials, evaluate hospital capacities, and match patients with pre-vetted options — and <strong className="text-dark-navy font-bold">we are never paid to recommend</strong>. Your health outcome is our only incentive.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/book-consultation" className="flex items-center gap-2 text-sm font-bold text-white gradient-primary px-6 py-3 rounded-xl shadow-md glow-green">
                <Phone className="w-4 h-4" /> Free Guidance Call
              </Link>
              <Link href="/find-doctor" className="flex items-center gap-2 text-sm font-bold text-primary-green bg-soft-green border border-primary-green/15 px-6 py-3 rounded-xl hover:bg-light-mint transition-colors">
                Find a Doctor <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* ══ Standards Grid ══ */}
        <div className="mt-20">
          <motion.div {...fu()} className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 bg-soft-green border border-primary-green/15 text-primary-green text-[11px] font-bold px-3.5 py-1.5 rounded-full">
              <ShieldCheck className="w-3 h-3" /> Why Trust Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-navy mt-3 tracking-tight">Quality Verification Standards</h2>
            <p className="text-sm text-text-grey mt-2 max-w-md mx-auto">Every doctor and hospital in our network passes a rigorous multi-point vetting process.</p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {STANDARDS.map((s, i) => (
              <motion.div key={i} {...fu(i)}
                className="flex items-start gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:border-primary-green/20 hover:shadow-md group transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-soft-green flex items-center justify-center flex-shrink-0 group-hover:bg-primary-green transition-colors duration-300">
                  <s.icon className="w-4.5 h-4.5 text-primary-green group-hover:text-white transition-colors duration-300" />
                </div>
                <div>
                  <h4 className="font-bold text-dark-navy text-sm">{s.title}</h4>
                  <p className="text-xs text-text-grey mt-1.5 leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ══ Team ══ */}
        <div className="mt-20">
          <motion.div {...fu()} className="text-center mb-12">
            <span className="inline-flex items-center gap-1.5 bg-soft-green border border-primary-green/15 text-primary-green text-[11px] font-bold px-3.5 py-1.5 rounded-full">
              <Users className="w-3 h-3" /> The People
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-dark-navy mt-3 tracking-tight">Meet Our Core Team</h2>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
            {TEAM.map((m, i) => (
              <motion.div key={i} {...fu(i)}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-3 text-center hover:-translate-y-1 hover:shadow-md transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${m.color} flex items-center justify-center text-white font-black text-2xl shadow-md`}>
                  {m.initial}
                </div>
                <div>
                  <p className="font-extrabold text-dark-navy text-sm">{m.name}</p>
                  <p className="text-[11px] text-text-grey font-medium mt-0.5">{m.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ══ CTA Band ══ */}
        <motion.div {...fu()} className="mt-20 relative overflow-hidden rounded-3xl text-center py-16 px-6 bg-[#050F1A]">
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)', backgroundSize: '48px 48px' }} />
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-primary-green/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 text-[11px] font-bold px-4 py-2 rounded-full mb-5">
              <Heart className="w-3 h-3 fill-primary-green text-primary-green" /> Free for Every Patient
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Ready to Find the Right Doctor?</h2>
            <p className="text-white/50 text-sm mt-3 max-w-md mx-auto leading-relaxed">Get a free personalised consultation from our clinical team and get matched with a verified specialist today.</p>
            <div className="flex flex-wrap gap-3 justify-center mt-8">
              <Link href="/book-consultation"
                className="flex items-center gap-2 text-sm font-bold text-dark-navy bg-white px-8 py-4 rounded-2xl shadow-lg hover:bg-soft-green transition-all"
              >
                <Phone className="w-4 h-4 text-primary-green" /> Book Free Consultation
              </Link>
              <Link href="/find-doctor"
                className="flex items-center gap-2 text-sm font-bold text-white/80 bg-white/8 border border-white/10 px-8 py-4 rounded-2xl hover:bg-white/15 transition-all"
              >
                Browse Doctors <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
