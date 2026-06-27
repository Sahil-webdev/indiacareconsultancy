'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Phone,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Stethoscope,
  Star,
  BadgeCheck,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Video,
  PhoneCall,
  Syringe,
  Paperclip,
  FileText,
  ImageIcon,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { DoctorMock, HospitalMock } from '@/lib/mockData';

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */
export interface BookingDoctor {
  id: string;
  name: string;
  speciality: string;
  experience: number;
  consultationFee: number;
  rating: number;
  photo: string;
  qualification: string;
  location: string;
  clinicAddress: string;
  consultationType: string;
  hospitalName?: string;
  availability: string[];
}

interface BookingFormData {
  patientName: string;
  mobile: string;
  age: string;
  gender: string;
  appointmentDate: string;
  timeSlot: string;
  reason: string;
  mode: 'Clinic Visit' | 'Video Consult' | 'Phone Consult';
}

interface FormErrors {
  patientName?: string;
  mobile?: string;
  age?: string;
  gender?: string;
  appointmentDate?: string;
  timeSlot?: string;
  reason?: string;
}

interface Props {
  doctor: BookingDoctor | null;
  isOpen: boolean;
  onClose: () => void;
}

/* ─────────────────────────────────────────
   Time slots (static demo)
───────────────────────────────────────── */
const TIME_SLOTS = [
  '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM',
  '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
  '5:00 PM', '5:30 PM', '6:00 PM',
];

const BOOKED_SLOTS = ['9:30 AM', '11:00 AM', '3:00 PM']; // Demo: pre-booked

/* ─────────────────────────────────────────
   BookingModal
───────────────────────────────────────── */
export default function BookingModal({ doctor, isOpen, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<BookingFormData>({
    patientName: '',
    mobile: '',
    age: '',
    gender: '',
    appointmentDate: '',
    timeSlot: '',
    reason: '',
    mode: 'Clinic Visit',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ── Report upload state ──
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  const MAX_FILES = 3;

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter(f => ACCEPTED_TYPES.includes(f.type));
    setReportFiles(prev => {
      const combined = [...prev, ...valid];
      return combined.slice(0, MAX_FILES);
    });
  };

  const removeFile = (idx: number) => {
    setReportFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Reset form when modal opens for a new doctor
  useEffect(() => {
    if (isOpen) {
      setForm({
        patientName: '',
        mobile: '',
        age: '',
        gender: '',
        appointmentDate: '',
        timeSlot: '',
        reason: '',
        mode: 'Clinic Visit',
      });
      setErrors({});
      setSubmitted(false);
      setSubmitting(false);
      setReportFiles([]);
    }
  }, [isOpen, doctor?.id]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!doctor) return null;

  /* ── Validation ── */
  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!form.patientName.trim()) newErrors.patientName = 'Patient name is required';
    if (!form.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^[6-9]\d{9}$/.test(form.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Enter a valid 10-digit Indian mobile number';
    }
    if (!form.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120) {
      newErrors.age = 'Enter a valid age (1–120)';
    }
    if (!form.gender) newErrors.gender = 'Gender is required';
    if (!form.appointmentDate) newErrors.appointmentDate = 'Appointment date is required';
    if (!form.timeSlot) newErrors.timeSlot = 'Please select a time slot';
    if (!form.reason.trim()) newErrors.reason = 'Please describe your symptoms / reason';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);

    // TODO: Integrate with backend API — e.g.:
    // await fetch('/api/appointments', { method: 'POST', body: JSON.stringify({ doctorId: doctor.id, ...form }) });

    // Simulated delay
    await new Promise(res => setTimeout(res, 1200));

    // Save to local state (in-memory only)
    const booking = {
      id: `booking_${Date.now()}`,
      doctorId: doctor.id,
      doctorName: doctor.name,
      ...form,
      createdAt: new Date().toISOString(),
    };
    console.log('[BookingModal] Booking created (local state):', booking);

    setSubmitting(false);
    setSubmitted(true);
  };

  const update = (field: keyof BookingFormData, val: string) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  /* ── Get tomorrow date as min ── */
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  /* ── Mode icons ── */
  const modeOptions: { label: BookingFormData['mode']; icon: React.ReactNode; desc: string }[] = [
    { label: 'Clinic Visit', icon: <Syringe className="w-4 h-4" />, desc: 'In-person visit' },
    { label: 'Video Consult', icon: <Video className="w-4 h-4" />, desc: 'Online video call' },
    { label: 'Phone Consult', icon: <PhoneCall className="w-4 h-4" />, desc: 'Voice call' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-dark-navy/60 backdrop-blur-sm"
          />

          {/* Modal panel */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.96 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-3 sm:p-5 pointer-events-none"
          >
            <div
              className="relative w-full max-w-2xl max-h-[94vh] bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* ── Top gradient stripe ── */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-green via-accent-green to-primary-green" />

              {/* ── Close button ── */}
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-slate-500" />
              </button>

              {/* ─────────────── SUCCESS STATE ─────────────── */}
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center gap-5 p-10 text-center flex-1"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', delay: 0.1 }}
                    className="w-20 h-20 rounded-full bg-soft-green flex items-center justify-center shadow-lg"
                  >
                    <CheckCircle2 className="w-10 h-10 text-primary-green" />
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-dark-navy mt-2">Booking Confirmed! 🎉</h2>
                    <p className="text-text-grey text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                      Your appointment request with <strong className="text-dark-navy">{doctor.name}</strong> on{' '}
                      <strong className="text-primary-green">{form.appointmentDate}</strong> at{' '}
                      <strong className="text-primary-green">{form.timeSlot}</strong> has been received.
                    </p>
                    <p className="text-xs text-text-grey mt-3">
                      Our consultant will contact you shortly on <strong>{form.mobile}</strong> to confirm.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 mt-2 w-full max-w-xs">
                    <button
                      onClick={onClose}
                      className="flex-1 text-sm font-bold text-white gradient-primary py-3 rounded-xl shadow-md glow-green hover-lift"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              ) : (
                <>
                  {/* ─────────────── DOCTOR INFO HEADER ─────────────── */}
                  <div className="flex-shrink-0 px-5 pt-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-soft-green/60 to-light-mint/40">
                    <p className="text-[10px] font-bold text-primary-green uppercase tracking-widest mb-3">
                      Book Appointment
                    </p>
                    <div className="flex items-start gap-4">
                      {/* Doctor photo */}
                      <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-primary-green rounded-full p-0.5 border-2 border-white">
                          <BadgeCheck className="w-3 h-3 text-white" />
                        </div>
                      </div>

                      {/* Doctor details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-bold text-primary-green bg-soft-green px-2 py-0.5 rounded-full border border-primary-green/15">
                            {doctor.speciality}
                          </span>
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                            <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                            {doctor.rating}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-dark-navy text-base leading-tight">{doctor.name}</h3>
                        <p className="text-xs text-text-grey font-medium mt-0.5 line-clamp-1">{doctor.qualification}</p>

                        {/* Stats row */}
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-text-grey">
                          <span className="flex items-center gap-1 font-semibold">
                            <Stethoscope className="w-3 h-3 text-primary-green" />
                            {doctor.experience} Yrs Exp
                          </span>
                          <span className="flex items-center gap-1 font-semibold">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {doctor.location}
                          </span>
                          {doctor.hospitalName && (
                            <span className="flex items-center gap-1 font-semibold">
                              <Building2 className="w-3 h-3 text-slate-400" />
                              <span className="line-clamp-1">{doctor.hospitalName}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Fee */}
                      <div className="flex-shrink-0 text-right hidden sm:block">
                        <p className="text-[10px] text-text-grey uppercase tracking-wide font-medium">Fee</p>
                        <p className="text-xl font-black text-dark-navy leading-none">₹{doctor.consultationFee}</p>
                        <p className="text-[10px] text-text-grey">/ session</p>
                      </div>
                    </div>
                  </div>

                  {/* ─────────────── FORM ─────────────── */}
                  <form
                    onSubmit={handleSubmit}
                    className="flex-1 overflow-y-auto custom-scrollbar px-5 py-5 flex flex-col gap-5"
                    noValidate
                  >
                    {/* Section: Patient Details */}
                    <div>
                      <h4 className="text-xs font-bold text-dark-navy uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary-green" />
                        Patient Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Patient Name */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-text-grey mb-1">
                            Patient Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.patientName}
                            onChange={e => update('patientName', e.target.value)}
                            placeholder="Full name of the patient"
                            className={`w-full text-sm px-3.5 py-2.5 rounded-xl border bg-slate-50 text-dark-navy placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                              errors.patientName
                                ? 'border-red-400 focus:ring-red-200'
                                : 'border-slate-200 focus:border-primary-green focus:ring-primary-green/10'
                            }`}
                          />
                          {errors.patientName && (
                            <p className="flex items-center gap-1 text-[10px] text-red-500 font-semibold mt-1">
                              <AlertCircle className="w-3 h-3" /> {errors.patientName}
                            </p>
                          )}
                        </div>

                        {/* Mobile */}
                        <div>
                          <label className="block text-[11px] font-bold text-text-grey mb-1">
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                            <input
                              type="tel"
                              value={form.mobile}
                              onChange={e => update('mobile', e.target.value)}
                              placeholder="10-digit mobile"
                              maxLength={10}
                              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-slate-50 text-sm text-dark-navy placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                                errors.mobile
                                  ? 'border-red-400 focus:ring-red-200'
                                  : 'border-slate-200 focus:border-primary-green focus:ring-primary-green/10'
                              }`}
                            />
                          </div>
                          {errors.mobile && (
                            <p className="flex items-center gap-1 text-[10px] text-red-500 font-semibold mt-1">
                              <AlertCircle className="w-3 h-3" /> {errors.mobile}
                            </p>
                          )}
                        </div>

                        {/* Age */}
                        <div>
                          <label className="block text-[11px] font-bold text-text-grey mb-1">
                            Age <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={120}
                            value={form.age}
                            onChange={e => update('age', e.target.value)}
                            placeholder="Patient age"
                            className={`w-full text-sm px-3.5 py-2.5 rounded-xl border bg-slate-50 text-dark-navy placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                              errors.age
                                ? 'border-red-400 focus:ring-red-200'
                                : 'border-slate-200 focus:border-primary-green focus:ring-primary-green/10'
                            }`}
                          />
                          {errors.age && (
                            <p className="flex items-center gap-1 text-[10px] text-red-500 font-semibold mt-1">
                              <AlertCircle className="w-3 h-3" /> {errors.age}
                            </p>
                          )}
                        </div>

                        {/* Gender */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-text-grey mb-1">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            {['Male', 'Female', 'Other'].map(g => (
                              <button
                                key={g}
                                type="button"
                                onClick={() => update('gender', g)}
                                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                                  form.gender === g
                                    ? 'bg-primary-green text-white border-primary-green shadow-sm'
                                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary-green/40 hover:text-primary-green'
                                }`}
                              >
                                {g}
                              </button>
                            ))}
                          </div>
                          {errors.gender && (
                            <p className="flex items-center gap-1 text-[10px] text-red-500 font-semibold mt-1">
                              <AlertCircle className="w-3 h-3" /> {errors.gender}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section: Appointment Details */}
                    <div>
                      <h4 className="text-xs font-bold text-dark-navy uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary-green" />
                        Appointment Details
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {/* Date */}
                        <div>
                          <label className="block text-[11px] font-bold text-text-grey mb-1">
                            Date <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <input
                              type="date"
                              min={minDateStr}
                              value={form.appointmentDate}
                              onChange={e => update('appointmentDate', e.target.value)}
                              className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border bg-slate-50 text-sm text-dark-navy focus:outline-none focus:bg-white focus:ring-2 transition-all ${
                                errors.appointmentDate
                                  ? 'border-red-400 focus:ring-red-200'
                                  : 'border-slate-200 focus:border-primary-green focus:ring-primary-green/10'
                              }`}
                            />
                          </div>
                          {errors.appointmentDate && (
                            <p className="flex items-center gap-1 text-[10px] text-red-500 font-semibold mt-1">
                              <AlertCircle className="w-3 h-3" /> {errors.appointmentDate}
                            </p>
                          )}
                        </div>

                        {/* Time Slot */}
                        <div>
                          <label className="block text-[11px] font-bold text-text-grey mb-1">
                            Time Slot <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                            <select
                              value={form.timeSlot}
                              onChange={e => update('timeSlot', e.target.value)}
                              className={`w-full pl-9 pr-8 py-2.5 rounded-xl border bg-slate-50 text-sm text-dark-navy focus:outline-none focus:bg-white focus:ring-2 transition-all appearance-none ${
                                errors.timeSlot
                                  ? 'border-red-400 focus:ring-red-200'
                                  : 'border-slate-200 focus:border-primary-green focus:ring-primary-green/10'
                              }`}
                            >
                              <option value="">Select a slot</option>
                              {TIME_SLOTS.map(slot => (
                                <option
                                  key={slot}
                                  value={slot}
                                  disabled={BOOKED_SLOTS.includes(slot)}
                                >
                                  {slot}{BOOKED_SLOTS.includes(slot) ? ' (Booked)' : ''}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                          </div>
                          {errors.timeSlot && (
                            <p className="flex items-center gap-1 text-[10px] text-red-500 font-semibold mt-1">
                              <AlertCircle className="w-3 h-3" /> {errors.timeSlot}
                            </p>
                          )}
                        </div>

                        {/* Reason */}
                        <div className="sm:col-span-2">
                          <label className="block text-[11px] font-bold text-text-grey mb-1">
                            Reason / Symptoms <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            rows={3}
                            value={form.reason}
                            onChange={e => update('reason', e.target.value)}
                            placeholder="Briefly describe the symptoms, concern, or reason for visit..."
                            className={`w-full text-sm px-3.5 py-2.5 rounded-xl border bg-slate-50 text-dark-navy placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 transition-all resize-none ${
                              errors.reason
                                ? 'border-red-400 focus:ring-red-200'
                                : 'border-slate-200 focus:border-primary-green focus:ring-primary-green/10'
                            }`}
                          />
                          {errors.reason && (
                            <p className="flex items-center gap-1 text-[10px] text-red-500 font-semibold mt-1">
                              <AlertCircle className="w-3 h-3" /> {errors.reason}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Section: Preferred Mode */}
                    <div>
                      <h4 className="text-xs font-bold text-dark-navy uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-primary-green" />
                        Preferred Mode
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {modeOptions.map(opt => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => update('mode', opt.label)}
                            className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border text-center transition-all ${
                              form.mode === opt.label
                                ? 'bg-primary-green text-white border-primary-green shadow-md'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-primary-green/40 hover:text-primary-green'
                            }`}
                          >
                            {opt.icon}
                            <span className="text-[10px] font-bold leading-tight">{opt.label}</span>
                            <span className={`text-[9px] font-medium leading-tight ${form.mode === opt.label ? 'text-white/80' : 'text-slate-400'}`}>
                              {opt.desc}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Section: Upload Reports (Optional) */}
                    <div>
                      <h4 className="text-xs font-bold text-dark-navy uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <Paperclip className="w-3.5 h-3.5 text-primary-green" />
                        Medical Reports
                        <span className="ml-1 text-[9px] font-bold text-slate-400 border border-slate-200 bg-slate-50 px-1.5 py-0.5 rounded-full normal-case tracking-normal">Optional</span>
                      </h4>
                      <p className="text-[10px] text-text-grey mb-2.5">
                        Attach previous test results, prescriptions, or X-rays to help the doctor prepare. Accepted: JPG, PNG, PDF · Max {MAX_FILES} files.
                      </p>

                      {/* Drop zone */}
                      <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center gap-2 py-5 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
                          dragOver
                            ? 'border-primary-green bg-soft-green scale-[1.01]'
                            : reportFiles.length >= MAX_FILES
                              ? 'border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed'
                              : 'border-slate-200 bg-slate-50 hover:border-primary-green/50 hover:bg-soft-green/40'
                        }`}
                      >
                        <UploadCloud className={`w-7 h-7 transition-colors ${dragOver ? 'text-primary-green' : 'text-slate-300'}`} />
                        <div className="text-center">
                          <p className="text-xs font-bold text-dark-navy">
                            {dragOver ? 'Drop files here' : 'Click to upload or drag & drop'}
                          </p>
                          <p className="text-[10px] text-text-grey mt-0.5">
                            {reportFiles.length >= MAX_FILES ? `Max ${MAX_FILES} files reached` : `${reportFiles.length}/${MAX_FILES} files selected`}
                          </p>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                          onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
                          disabled={reportFiles.length >= MAX_FILES}
                        />
                      </div>

                      {/* File previews */}
                      {reportFiles.length > 0 && (
                        <div className="flex flex-col gap-2 mt-3">
                          {reportFiles.map((file, idx) => {
                            const isImg = file.type.startsWith('image/');
                            return (
                              <motion.div
                                key={`${file.name}-${idx}`}
                                initial={{ opacity: 0, y: -6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.2 }}
                                className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5"
                              >
                                {/* Icon / thumbnail */}
                                <div className="w-8 h-8 rounded-lg bg-primary-green/10 flex items-center justify-center flex-shrink-0">
                                  {isImg
                                    ? <ImageIcon className="w-4 h-4 text-primary-green" />
                                    : <FileText className="w-4 h-4 text-primary-green" />
                                  }
                                </div>
                                {/* File info */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-dark-navy truncate">{file.name}</p>
                                  <p className="text-[10px] text-text-grey">{formatFileSize(file.size)} · {isImg ? 'Image' : 'PDF'}</p>
                                </div>
                                {/* Remove */}
                                <button
                                  type="button"
                                  onClick={e => { e.stopPropagation(); removeFile(idx); }}
                                  className="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 flex items-center justify-center flex-shrink-0 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3 text-red-400" />
                                </button>
                              </motion.div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Note */}
                    <p className="text-[10px] text-text-grey bg-soft-green/60 border border-primary-green/10 rounded-xl px-3.5 py-2.5 leading-relaxed">
                      <span className="font-bold text-primary-green">Note:</span> India Care Consultancy does not charge patients for booking coordination. Our consultant will contact you to confirm the slot.
                    </p>

                    {/* Actions */}
                    <div className="flex gap-3 pt-1 pb-1">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 text-sm font-bold text-slate-600 border-2 border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-[2] flex items-center justify-center gap-2 text-sm font-bold text-white gradient-primary py-3 rounded-xl shadow-lg glow-green hover-lift disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Confirming...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Confirm Booking
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
