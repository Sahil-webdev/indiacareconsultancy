'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageSquare, ChevronRight, Home, Clock, CheckCircle2, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};

const CONTACT_CARDS = [
  {
    icon: MapPin, color: 'bg-soft-green text-primary-green',
    title: 'Head Office',
    lines: ['12th Floor, Statesman House', 'Barakhamba Rd, Connaught Place', 'New Delhi - 110001'],
  },
  {
    icon: Phone, color: 'bg-blue-50 text-blue-600',
    title: 'Consultant Hotline',
    lines: ['+91 98765 43210', 'Mon – Sat  ·  9 AM – 6 PM IST'],
    link: 'tel:+919876543210',
  },
  {
    icon: Mail, color: 'bg-violet-50 text-violet-600',
    title: 'Support Email',
    lines: ['info@indiacareconsultancy.com'],
    link: 'mailto:info@indiacareconsultancy.com',
  },
  {
    icon: Clock, color: 'bg-amber-50 text-amber-600',
    title: 'Response Time',
    lines: ['Email: within 24 hours', 'WhatsApp: under 10 minutes'],
  },
];

const SPECIALITIES = ['Cardiology', 'Neurology', 'Orthopedic', 'Dermatology', 'Gynecology', 'Pediatrics', 'Dentist', 'ENT'];

const inp = 'w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm text-dark-navy placeholder-slate-400 focus:outline-none focus:border-primary-green focus:ring-2 focus:ring-primary-green/10 transition-all shadow-sm';

export default function ContactPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', concern: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (k: string, v: string) => setFormData(prev => ({ ...prev, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.email) {
      toast('error', 'Missing Fields', 'Please fill your Name, Email, and Phone Number.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
      toast('success', 'Message Sent!', 'A consultant will reach out to you shortly.');
      setFormData({ name: '', email: '', phone: '', concern: '', message: '' });
    }, 1200);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent('Hello India Care, I would like to consult regarding a healthcare recommendation.');
    window.open(`https://wa.me/919876543210?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-light-grey">

      {/* ── Hero ── */}
      <section className="relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0A5C4E 0%, #127A6A 55%, #1A9A83 100%)' }}
      >
        <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '22px 22px' }} />
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-white/5 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative z-10">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-white/60 text-xs font-medium mb-7"
          >
            <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors"><Home className="w-3 h-3" /> Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white font-semibold">Contact Us</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-[10px] font-bold px-3 py-1.5 rounded-full mb-4">
              <MessageSquare className="w-3 h-3" /> Get In Touch
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight tracking-tight">
              Connect With<br className="hidden sm:block" /> India Care Consultancy
            </h1>
            <p className="text-white/65 text-sm mt-3 max-w-xl leading-relaxed">
              Questions about a doctor, hospital credentials, treatment estimations, or booking? Reach out via the form, call us, or chat on WhatsApp.
            </p>
          </motion.div>

          {/* Contact info pills */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="mt-8 flex flex-wrap gap-3"
          >
            {[
              { icon: Phone, label: '+91 98765 43210', href: 'tel:+919876543210' },
              { icon: Mail, label: 'info@indiacareconsultancy.com', href: 'mailto:info@indiacareconsultancy.com' },
            ].map((item, i) => (
              <a key={i} href={item.href}
                className="flex items-center gap-2 bg-white/15 border border-white/25 text-white text-xs font-bold px-4 py-2.5 rounded-full hover:bg-white/25 transition-all"
              >
                <item.icon className="w-3.5 h-3.5" /> {item.label}
              </a>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Contact cards ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {CONTACT_CARDS.map((c, i) => (
            <motion.div key={i} custom={i} variants={fadeUp} initial="hidden" animate="show"
              className="bg-white rounded-2xl border border-slate-100 shadow-md p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center mb-3`}>
                <c.icon className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-dark-navy text-xs mb-1.5">{c.title}</h4>
              {c.lines.map((line, j) =>
                c.link && j === 0 ? (
                  <a key={j} href={c.link} className="text-[11px] text-text-grey block leading-relaxed hover:text-primary-green transition-colors font-semibold">{line}</a>
                ) : (
                  <p key={j} className="text-[11px] text-text-grey leading-relaxed">{line}</p>
                )
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Left column: sidebar info */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* WhatsApp CTA */}
            <motion.div custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="relative bg-emerald-600 rounded-3xl overflow-hidden p-6 text-white"
            >
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-xl -translate-y-8 translate-x-8" />
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 fill-white text-white" />
                </div>
                <h4 className="font-extrabold text-lg leading-tight">Instant Help on WhatsApp</h4>
                <p className="text-emerald-100 text-xs mt-1.5 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" /> Average reply: under 10 minutes
                </p>
                <p className="text-emerald-100/80 text-xs mt-3 leading-relaxed">
                  Share reports, get doctor suggestions, and coordinate appointment timings instantly.
                </p>
                <button onClick={handleWhatsApp}
                  className="mt-5 w-full bg-white text-emerald-700 font-bold text-sm py-3 rounded-2xl shadow-md hover:bg-emerald-50 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 fill-emerald-600 text-emerald-600" /> Chat on WhatsApp
                </button>
              </div>
            </motion.div>

            {/* Quick links */}
            <motion.div custom={1} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
            >
              <h4 className="text-xs font-extrabold text-dark-navy uppercase tracking-wide mb-4">Quick Actions</h4>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'Book a Consultation', desc: 'Free guidance from our team', href: '/book-consultation' },
                  { label: 'Find a Doctor', desc: 'Browse verified specialists', href: '/find-doctor' },
                  { label: 'View Hospitals', desc: 'Partner hospitals network', href: '/hospitals' },
                  { label: 'Read Health Blog', desc: 'Expert medical articles', href: '/blog' },
                ].map((a, i) => (
                  <Link key={i} href={a.href}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100 group"
                  >
                    <div className="flex-1">
                      <p className="text-xs font-bold text-dark-navy">{a.label}</p>
                      <p className="text-[10px] text-text-grey mt-0.5">{a.desc}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-primary-green transition-colors" />
                  </Link>
                ))}
              </div>
            </motion.div>

            {/* Map placeholder */}
            <motion.div custom={2} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5"
            >
              <h4 className="text-xs font-extrabold text-dark-navy uppercase tracking-wide mb-3">Office Location</h4>
              <div className="w-full aspect-[16/9] rounded-xl bg-slate-100 border border-slate-200 flex flex-col items-center justify-center gap-1.5 text-slate-400">
                <MapPin className="w-8 h-8 animate-bounce" />
                <span className="text-xs font-semibold text-slate-500">Statesman House, CP, New Delhi</span>
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
                  className="text-[10px] font-bold text-primary-green hover:text-dark-green mt-1"
                >Open in Google Maps →</a>
              </div>
            </motion.div>
          </div>

          {/* Right column: form */}
          <motion.div
            custom={0} variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Form header stripe */}
              <div className="px-7 pt-7 pb-5 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl gradient-primary flex items-center justify-center shadow-md">
                    <Send className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-grey uppercase tracking-wider">Free Inquiry</p>
                    <h2 className="font-extrabold text-dark-navy text-lg leading-tight">Send a Message</h2>
                  </div>
                </div>
              </div>

              {sent ? (
                <div className="p-10 flex flex-col items-center gap-4 text-center">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-soft-green flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-8 h-8 text-primary-green" />
                  </motion.div>
                  <h3 className="font-extrabold text-dark-navy text-xl">Message Sent!</h3>
                  <p className="text-sm text-text-grey max-w-sm leading-relaxed">
                    Thank you for reaching out. Our clinical coordinator will contact you within 24 hours.
                  </p>
                  <button onClick={() => setSent(false)}
                    className="text-sm font-bold text-primary-green border border-primary-green/20 bg-soft-green px-6 py-2.5 rounded-xl hover:bg-light-mint transition-colors"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-7 flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-dark-navy uppercase tracking-wide block mb-1.5">Your Name <span className="text-red-500">*</span></label>
                      <input type="text" placeholder="Enter full name" value={formData.name} onChange={e => set('name', e.target.value)} className={inp} />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-dark-navy uppercase tracking-wide block mb-1.5">Email Address <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input type="email" placeholder="you@example.com" value={formData.email} onChange={e => set('email', e.target.value)} className={`${inp} pl-9`} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-dark-navy uppercase tracking-wide block mb-1.5">Phone Number <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        <input type="tel" placeholder="+91 XXXXX XXXXX" value={formData.phone} onChange={e => set('phone', e.target.value)} className={`${inp} pl-9`} />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-dark-navy uppercase tracking-wide block mb-1.5">Speciality Concern</label>
                      <select value={formData.concern} onChange={e => set('concern', e.target.value)} className={inp}>
                        <option value="">Select Speciality (Optional)</option>
                        {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-dark-navy uppercase tracking-wide block mb-1.5">Message / Symptom Details</label>
                    <textarea rows={4} placeholder="Briefly describe the symptoms, diagnostic records, or any assistance needed…"
                      value={formData.message} onChange={e => set('message', e.target.value)}
                      className={`${inp} resize-none`}
                    />
                  </div>

                  {/* Trust note */}
                  <div className="flex items-start gap-2.5 bg-soft-green border border-primary-green/10 rounded-2xl px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 text-primary-green flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-text-grey leading-relaxed">
                      Your data is encrypted and never shared without your consent. India Care Consultancy is free for patients.
                    </p>
                  </div>

                  <button type="submit" disabled={loading}
                    className="w-full gradient-primary text-white font-bold py-3.5 rounded-2xl shadow-lg glow-green flex items-center justify-center gap-2 disabled:opacity-60 transition-all mt-1"
                  >
                    {loading
                      ? <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Sending…</>
                      : <><Send className="w-4 h-4" /> Send Message</>
                    }
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
