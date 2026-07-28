'use client';

import React, { startTransition, useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, User, Phone, Calendar, Clock, MapPin, Building2, Stethoscope, Star,
  BadgeCheck, ChevronDown, CheckCircle2, AlertCircle, Video, PhoneCall, Syringe,
  Paperclip, FileText, ImageIcon, Trash2, UploadCloud, Copy, Check, Sparkles, Upload
} from 'lucide-react';
import { siteApi } from '@/lib/api';
import { usePatientAuth } from '@/lib/patientAuth';

const OFFICIAL_UPI_ID = '9024155604@ibl';
const CONSULTATION_TOKEN_FEE = 9; // ₹9 consultation fee

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
  availabilitySchedule?: Record<string, string[]>;
  opdTimings?: string;
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
  utrNumber: string;
}

interface FormErrors {
  patientName?: string;
  mobile?: string;
  age?: string;
  gender?: string;
  appointmentDate?: string;
  timeSlot?: string;
  reason?: string;
  utrNumber?: string;
}

interface Props {
  doctor: BookingDoctor | null;
  isOpen: boolean;
  onClose: () => void;
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatDateLabel(value: string) {
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getUpcomingAvailableDates(doctor: BookingDoctor, daysAhead = 21) {
  const allowed = new Set(
    Object.entries(doctor.availabilitySchedule || {})
      .filter(([, slots]) => Array.isArray(slots) && slots.length > 0)
      .map(([day]) => day.slice(0, 3))
  );

  const fallbackDays = (doctor.availability || []).map((day) => day.slice(0, 3));
  const activeDays = allowed.size > 0 ? allowed : new Set(fallbackDays.length > 0 ? fallbackDays : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);

  const results: Array<{ value: string; label: string }> = [];
  const today = new Date();

  for (let i = 1; i <= daysAhead; i++) {
    const candidate = new Date(today);
    candidate.setDate(today.getDate() + i);

    const dayName = SHORT_DAYS[candidate.getDay()];
    if (activeDays.has(dayName)) {
      const year = candidate.getFullYear();
      const month = String(candidate.getMonth() + 1).padStart(2, '0');
      const day = String(candidate.getDate()).padStart(2, '0');

      results.push({
        value: `${year}-${month}-${day}`,
        label: candidate.toLocaleDateString('en-IN', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
        }),
      });
    }
  }

  return results;
}

export default function BookingModal({ doctor, isOpen, onClose }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { isLoggedIn, patient } = usePatientAuth();

  // Booking Steps: 'details' -> 'payment' -> 'confirmed'
  const [bookingStep, setBookingStep] = useState<'details' | 'payment' | 'confirmed'>('details');

  const [form, setForm] = useState<BookingFormData>({
    patientName: '',
    mobile: '',
    age: '',
    gender: '',
    appointmentDate: '',
    timeSlot: '',
    reason: '',
    mode: 'Clinic Visit',
    utrNumber: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [availableDates, setAvailableDates] = useState<Array<{ value: string; label: string }>>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Report upload state
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

  const copyUpiId = () => {
    navigator.clipboard.writeText(OFFICIAL_UPI_ID);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  useEffect(() => {
    if (isOpen) {
      if (!isLoggedIn) {
        onClose();
        router.push(`/login?redirect=${encodeURIComponent(pathname || '/')}`);
        return;
      }
      startTransition(() => {
        setForm({
          patientName: patient?.name || '',
          mobile: patient?.mobile?.replace(/\D/g, '').slice(-10) || '',
          age: patient?.age || '',
          gender: patient?.gender || '',
          appointmentDate: '',
          timeSlot: '',
          reason: '',
          mode: 'Clinic Visit',
          utrNumber: '',
        });
        setErrors({});
        setBookingStep('details');
        setSubmitting(false);
        setReportFiles([]);
      });
    }
  }, [isOpen, doctor?.id, isLoggedIn, onClose, pathname, patient, router]);

  useEffect(() => {
    if (!doctor || !isOpen) return;

    const dates = getUpcomingAvailableDates(doctor);
    setAvailableDates(dates);
    setAvailableSlots([]);
    setBookedSlots([]);

    setForm((prev) => ({
      ...prev,
      appointmentDate: dates[0]?.value || '',
      timeSlot: '',
    }));
  }, [doctor, isOpen]);

  useEffect(() => {
    if (!doctor || !isOpen || !form.appointmentDate) {
      setAvailableSlots([]);
      return;
    }

    let active = true;
    setSlotsLoading(true);

    const shortDay = SHORT_DAYS[new Date(`${form.appointmentDate}T00:00:00`).getDay()];
    const fullDayName = Object.keys(DAY_NAME_MAP).find(k => DAY_NAME_MAP[k] === shortDay) || 'Monday';

    const rawSchedule = (doctor.availabilitySchedule || {})[fullDayName] || (doctor.availabilitySchedule || {})[shortDay];
    const defaultSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'];
    const doctorSlots = Array.isArray(rawSchedule) && rawSchedule.length > 0 ? rawSchedule : defaultSlots;

    siteApi<{ bookedTimeSlots?: string[] }>(
      `/api/appointments/booked-slots?doctorId=${encodeURIComponent(doctor.id)}&appointmentDate=${encodeURIComponent(form.appointmentDate)}`
    )
      .then((data) => {
        if (!active) return;
        setBookedSlots(data.bookedTimeSlots || []);
        setAvailableSlots(doctorSlots);
      })
      .catch(() => {
        if (!active) return;
        setBookedSlots([]);
        setAvailableSlots(doctorSlots);
      })
      .finally(() => {
        if (!active) return;
        setSlotsLoading(false);
      });

    return () => { active = false; };
  }, [doctor, isOpen, form.appointmentDate]);

  if (!doctor) return null;

  const DAY_NAME_MAP: Record<string, string> = {
    Monday: 'Mon', Tuesday: 'Tue', Wednesday: 'Wed', Thursday: 'Thu', Friday: 'Fri', Saturday: 'Sat', Sunday: 'Sun'
  };

  const validateDetails = (): boolean => {
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

  const handleProceedToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateDetails()) return;
    setBookingStep('payment');
  };

  const handleFinalBookingSubmit = async () => {
    if (!form.utrNumber.trim() || form.utrNumber.trim().length < 6) {
      setErrors(prev => ({ ...prev, utrNumber: 'Please enter a valid 12-digit UTR / UPI Reference Number' }));
      return;
    }

    setSubmitting(true);
    try {
      await siteApi('/api/appointments', {
        method: 'POST',
        body: JSON.stringify({
          doctorId: doctor.id,
          patientName: form.patientName,
          patientPhone: form.mobile,
          patientEmail: patient?.email || '',
          appointmentDate: form.appointmentDate,
          timeSlot: form.timeSlot,
          concern: form.reason,
          mode: form.mode,
          fee: CONSULTATION_TOKEN_FEE,
          paymentMethod: 'UPI',
          transactionRef: form.utrNumber.trim(),
          paymentStatus: 'Submitted (Verification Pending)',
        }),
      });

      setSubmitting(false);
      setBookingStep('confirmed');
    } catch (err) {
      setErrors(prev => ({ ...prev, utrNumber: err instanceof Error ? err.message : 'Failed to submit appointment booking' }));
      setSubmitting(false);
    }
  };

  const update = (field: keyof BookingFormData, val: string) => {
    setForm(prev => ({ ...prev, [field]: val }));
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const modeOptions: { label: BookingFormData['mode']; icon: React.ReactNode; desc: string }[] = [
    { label: 'Clinic Visit', icon: <Syringe className="w-4 h-4" />, desc: 'In-person visit' },
    { label: 'Video Consult', icon: <Video className="w-4 h-4" />, desc: 'HD Telehealth call' },
    { label: 'Phone Consult', icon: <PhoneCall className="w-4 h-4" />, desc: 'Voice consult' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={e => { if (e.target === overlayRef.current) onClose(); }}
            className="fixed inset-0 z-50 bg-dark-navy/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col"
            >
              {/* Header */}
              <div className="gradient-hero p-5 border-b border-slate-100 flex items-start justify-between flex-shrink-0 relative">
                <div className="flex items-center gap-3.5 pr-8">
                  {doctor.photo ? (
                    <img src={doctor.photo} alt={doctor.name} className="w-14 h-14 rounded-2xl object-cover border-2 border-primary-green/30 shadow-md" />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-primary-green/10 text-primary-green font-bold text-xl flex items-center justify-center border-2 border-primary-green/30">
                      {doctor.name[0]}
                    </div>
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary-green bg-soft-green px-2 py-0.5 rounded-full inline-block mb-1">
                      Consultation Booking
                    </span>
                    <h3 className="font-extrabold text-dark-navy text-base leading-snug line-clamp-1">{doctor.name}</h3>
                    <p className="text-xs text-text-grey mt-0.5">{doctor.speciality} · {doctor.qualification}</p>
                  </div>
                </div>

                <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors flex-shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="p-5 sm:p-6 overflow-y-auto panel-scroll flex-1">
                {bookingStep === 'confirmed' ? (
                  /* CONFIRMED SLIP STEP */
                  <div className="text-center space-y-4 py-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-500/30">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 border border-emerald-500/30">
                        ₹9 UPI Payment Submitted (UTR: {form.utrNumber})
                      </span>
                      <h3 className="text-xl font-extrabold text-dark-navy mt-2">Appointment Request Submitted!</h3>
                      <p className="text-xs text-text-grey leading-relaxed">
                        Your ₹9 consultation fee payment with UTR <span className="font-mono font-bold text-dark-navy">{form.utrNumber}</span> is submitted for verification.
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-text-grey">Patient Name:</span>
                        <span className="font-bold text-dark-navy">{form.patientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-grey">Appointment Date:</span>
                        <span className="font-bold text-dark-navy">{formatDateLabel(form.appointmentDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-grey">Time Slot:</span>
                        <span className="font-bold text-dark-navy">{form.timeSlot}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-text-grey">Mode:</span>
                        <span className="font-bold text-primary-green">{form.mode}</span>
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="w-full py-3.5 rounded-xl text-xs font-bold text-white gradient-primary shadow-lg glow-green"
                    >
                      Done
                    </button>
                  </div>
                ) : bookingStep === 'payment' ? (
                  /* ₹9 UPI QR PAYMENT STEP */
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b pb-3">
                      <button onClick={() => setBookingStep('details')} className="text-xs font-bold text-primary-green flex items-center gap-1">
                        ← Edit Details
                      </button>
                      <span className="text-xs font-black text-dark-navy">Step 2 of 2: ₹9 Payment</span>
                    </div>

                    {/* QR Code Card */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-3">
                      <div className="inline-block p-2.5 bg-white rounded-2xl shadow-md border border-slate-200">
                        <img src="/payment-qr.png" alt="UPI Payment QR Code" className="w-44 h-44 object-contain mx-auto" />
                      </div>

                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pay Consultation Fee ₹9 to Official UPI</p>
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-mono text-sm font-black text-dark-navy">{OFFICIAL_UPI_ID}</span>
                          <button
                            type="button"
                            onClick={copyUpiId}
                            className="px-2 py-0.5 rounded-lg bg-soft-green text-primary-green text-[10px] font-bold flex items-center gap-1 border border-primary-green/20"
                          >
                            {copiedUpi ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            {copiedUpi ? 'Copied' : 'Copy UPI'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* UTR Input Form */}
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-text-grey mb-1">
                          12-Digit UTR / UPI Reference Number <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={form.utrNumber}
                          onChange={e => update('utrNumber', e.target.value)}
                          placeholder="e.g. 420198765432"
                          maxLength={20}
                          className="w-full text-sm px-3.5 py-2.5 rounded-xl border bg-slate-50 text-dark-navy font-mono font-bold focus:outline-none focus:bg-white focus:ring-2 focus:ring-primary-green/20"
                        />
                        {errors.utrNumber && (
                          <p className="flex items-center gap-1 text-[10px] text-red-500 font-semibold mt-1">
                            <AlertCircle className="w-3 h-3" /> {errors.utrNumber}
                          </p>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">Check your GPay / PhonePe / Paytm receipt for the 12-digit UTR number.</p>
                      </div>

                      <button
                        onClick={handleFinalBookingSubmit}
                        disabled={submitting}
                        className="w-full py-3.5 rounded-xl text-xs font-bold text-white gradient-primary shadow-lg glow-green flex items-center justify-center gap-2"
                      >
                        {submitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            Confirm Booking &amp; Submit UTR
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* STEP 1: APPOINTMENT DETAILS FORM */
                  <form onSubmit={handleProceedToPayment} className="space-y-5">
                    {/* Section: Patient Info */}
                    <div>
                      <h4 className="text-xs font-bold text-dark-navy uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-primary-green" /> Patient Credentials
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-text-grey mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={form.patientName}
                            onChange={e => update('patientName', e.target.value)}
                            placeholder="Patient name"
                            className="w-full text-sm px-3.5 py-2.5 rounded-xl border bg-slate-50 text-dark-navy font-bold focus:outline-none focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-text-grey mb-1">
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            value={form.mobile}
                            onChange={e => update('mobile', e.target.value)}
                            placeholder="10-digit mobile"
                            maxLength={10}
                            className="w-full text-sm px-3.5 py-2.5 rounded-xl border bg-slate-50 text-dark-navy font-bold focus:outline-none focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-text-grey mb-1">
                            Age <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={form.age}
                            onChange={e => update('age', e.target.value)}
                            placeholder="Patient age"
                            className="w-full text-sm px-3.5 py-2.5 rounded-xl border bg-slate-50 text-dark-navy font-bold focus:outline-none focus:bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-text-grey mb-1">
                            Gender <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={form.gender}
                            onChange={e => update('gender', e.target.value)}
                            className="w-full text-sm px-3.5 py-2.5 rounded-xl border bg-slate-50 text-dark-navy font-bold focus:outline-none"
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Section: Appointment Date & Slot */}
                    <div>
                      <h4 className="text-xs font-bold text-dark-navy uppercase tracking-wide mb-3 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary-green" /> Appointment Schedule
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[11px] font-bold text-text-grey mb-1">Date</label>
                          <select
                            value={form.appointmentDate}
                            onChange={e => update('appointmentDate', e.target.value)}
                            className="w-full text-sm px-3.5 py-2.5 rounded-xl border bg-slate-50 text-dark-navy font-bold focus:outline-none"
                          >
                            {availableDates.map(d => (
                              <option key={d.value} value={d.value}>{d.label}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-text-grey mb-1">Time Slot</label>
                          <select
                            value={form.timeSlot}
                            onChange={e => update('timeSlot', e.target.value)}
                            className="w-full text-sm px-3.5 py-2.5 rounded-xl border bg-slate-50 text-dark-navy font-bold focus:outline-none"
                          >
                            <option value="">Select Time Slot</option>
                            {availableSlots.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Mode selection */}
                    <div>
                      <label className="block text-[11px] font-bold text-text-grey mb-2">Preferred Consultation Mode</label>
                      <div className="grid grid-cols-3 gap-2">
                        {modeOptions.map(opt => (
                          <button
                            key={opt.label}
                            type="button"
                            onClick={() => update('mode', opt.label)}
                            className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-center transition-all ${form.mode === opt.label ? 'bg-primary-green text-white border-primary-green' : 'bg-slate-50 text-slate-600 border-slate-200'}`}
                          >
                            {opt.icon}
                            <span className="text-[10px] font-bold">{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Concern / Reason */}
                    <div>
                      <label className="block text-[11px] font-bold text-text-grey mb-1">Symptoms / Primary Health Concern</label>
                      <textarea
                        value={form.reason}
                        onChange={e => update('reason', e.target.value)}
                        rows={2}
                        placeholder="Briefly describe your symptoms..."
                        className="w-full text-xs px-3.5 py-2.5 rounded-xl border bg-slate-50 text-dark-navy resize-none font-medium"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 rounded-xl text-xs font-bold text-white gradient-primary shadow-lg glow-green flex items-center justify-center gap-2"
                    >
                      Proceed to ₹9 Payment &amp; Confirmation →
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
