'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  BadgeCheck,
  Calendar,
  Check,
  Clock,
  CreditCard,
  DollarSign,
  FileText,
  Globe2,
  Megaphone,
  ShieldCheck,
  Star,
  TimerReset,
  TrendingUp,
  User,
  Wallet,
  X,
} from 'lucide-react';

import { panelApi } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface DoctorProfile {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  photo: string;
  medicalRegistrationNumber: string;
  qualification: string;
  speciality: string;
  experience: number;
  clinicAddress: string;
  consultationFee: number;
  city: string;
  area: string;
  rating: number;
  availability: string[];
  subscriptionEndsAt: string | null;
  subscriptionPaidAt: string | null;
  isSubscribed: boolean;
  isApproved: boolean;
  hospitalName: string;
  opdTimings: string;
}

interface DoctorAppointment {
  id: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  appointmentDate: string;
  timeSlot: string;
  concern: string;
  status: string;
  workflowStatus: string;
  earningAmount: number;
}

interface PaymentRecord {
  id: string;
  paymentType: string;
  amount: number;
  currency: string;
  status: string;
  paymentMethod: string;
  transactionRef: string;
  invoiceNumber: string;
  paidAt: string | null;
  createdAt: string;
}

interface MonthlyEarning {
  monthKey: string;
  label: string;
  earnings: number;
  consultations: number;
}

interface EarningsSummary {
  consultationFee: number;
  totalBookings: number;
  completedBookings: number;
  confirmedBookings: number;
  cancelledBookings: number;
  upcomingBookings: number;
  totalEarnings: number;
  thisMonthEarnings: number;
  pendingEarnings: number;
  totalExpenses: number;
  netEarnings: number;
}

interface DoctorDashboardResponse {
  success: true;
  doctor: DoctorProfile;
  appointments: DoctorAppointment[];
  summary: EarningsSummary;
  monthlyEarnings: MonthlyEarning[];
  paymentHistory: PaymentRecord[];
}

interface SpotlightStatus {
  id: string;
  tagline: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  paymentStatus: string;
}

interface SpotlightResponse {
  success: true;
  fee: {
    amount: number;
    durationDays: number;
  };
  spotlight: SpotlightStatus | null;
}

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

function formatCurrency(amount: number) {
  return currencyFormatter.format(Number(amount || 0));
}

function formatDate(value?: string | null) {
  if (!value) return 'Not available';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return dateFormatter.format(parsed);
}

function getDaysRemaining(value?: string | null) {
  if (!value) return 0;
  const endsAt = new Date(value);
  const diff = endsAt.getTime() - Date.now();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function paymentTypeLabel(paymentType: string) {
  switch (paymentType) {
    case 'subscription':
      return 'Subscription Plan';
    case 'spotlight':
      return 'Promote Profile';
    case 'consultation':
      return 'Consultation Fee';
    case 'refund':
      return 'Refund';
    default:
      return paymentType;
  }
}

function DoctorPanelContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const activeTab = searchParams.get('tab') || 'overview';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState<DoctorDashboardResponse | null>(null);
  const [actioningId, setActioningId] = useState<string | null>(null);
  const [spotlightLoading, setSpotlightLoading] = useState(true);
  const [spotlight, setSpotlight] = useState<SpotlightResponse | null>(null);
  const [spotlightTagline, setSpotlightTagline] = useState('');
  const [promoteSubmitting, setPromoteSubmitting] = useState(false);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await panelApi<DoctorDashboardResponse>('/api/doctors/me/earnings');
      setDashboard(response);
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'Unable to load doctor dashboard.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const loadSpotlight = async () => {
    try {
      setSpotlightLoading(true);
      const response = await panelApi<SpotlightResponse>('/api/promote/current');
      setSpotlight(response);
      setSpotlightTagline(response.spotlight?.tagline || '');
    } catch {
      setSpotlight(null);
    } finally {
      setSpotlightLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadSpotlight();
  }, []);

  const doctor = dashboard?.doctor || null;
  const appointments = dashboard?.appointments || [];
  const summary = dashboard?.summary || null;
  const monthlyEarnings = dashboard?.monthlyEarnings || [];
  const paymentHistory = dashboard?.paymentHistory || [];
  const activeSpotlight = spotlight?.spotlight || null;
  const spotlightDaysRemaining = getDaysRemaining(activeSpotlight?.endsAt);

  const upcomingAppointments = useMemo(
    () => appointments.filter((appointment) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate >= new Date() && !String(appointment.workflowStatus || '').toLowerCase().includes('cancelled');
    }),
    [appointments]
  );

  const completedAppointments = useMemo(
    () => appointments.filter((appointment) => {
      const workflowStatus = String(appointment.workflowStatus || appointment.status || '').toLowerCase();
      const status = String(appointment.status || '').toLowerCase();
      return workflowStatus === 'completed' || status === 'completed';
    }),
    [appointments]
  );

  const handleAppointmentUpdate = async (
    appointmentId: string,
    workflowStatus: string,
    toastTitle: string,
    toastDescription: string
  ) => {
    try {
      setActioningId(appointmentId);
      await panelApi(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ workflowStatus }),
      });
      await loadDashboard();
      toast('success', toastTitle, toastDescription);
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Unable to update appointment right now.';
      toast('error', 'Action Failed', message);
    } finally {
      setActioningId(null);
    }
  };

  const handlePromoteProfile = async () => {
    if (!spotlightTagline.trim()) {
      toast('info', 'Tagline Required', 'Promote profile se pehle ek strong spotlight tagline add karo.');
      return;
    }

    try {
      setPromoteSubmitting(true);
      await panelApi('/api/promote', {
        method: 'POST',
        body: JSON.stringify({
          action: 'promote',
          tagline: spotlightTagline.trim(),
          paymentMethod: 'UPI',
        }),
      });
      await loadSpotlight();
      await loadDashboard();
      toast('success', 'Promotion Activated', 'Aapka doctor profile ab homepage ke Top Tier Health Care Experts section me visible hai.');
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Promotion activate nahi ho paaya.';
      toast('error', 'Promotion Failed', message);
    } finally {
      setPromoteSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-sm text-text-grey font-semibold bg-white rounded-3xl border border-slate-150 shadow-sm">
        Loading doctor earnings dashboard...
      </div>
    );
  }

  if (error || !doctor || !summary) {
    return (
      <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-8 flex flex-col gap-4">
        <h1 className="text-xl font-extrabold text-dark-navy">Doctor Earnings</h1>
        <p className="text-sm text-red-500">
          {error || 'Doctor dashboard data could not be loaded.'}
        </p>
        <p className="text-xs text-text-grey">
          Panel session token missing ya invalid ho sakta hai. Doctor login ke baad page refresh karke dubara check karein.
        </p>
        <div>
          <button
            onClick={loadDashboard}
            className="px-4 py-2 rounded-xl text-sm font-bold text-white gradient-medical shadow-sm"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-150 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary-green uppercase tracking-widest block">
              Practitioner portal
            </span>
            <h1 className="text-xl font-extrabold text-dark-navy mt-0.5">{doctor.name}</h1>
            <p className="text-xs text-text-grey">
              {doctor.speciality} | MCI No: {doctor.medicalRegistrationNumber}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="bg-green-50 text-primary-green text-xs font-bold px-3 py-1.5 rounded-xl border border-green-200/30 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-primary-green" />
            {doctor.isApproved ? 'Approved Doctor' : 'Approval Pending'}
          </span>
          <span className="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-200/30 flex items-center gap-1.5 shadow-sm">
            <CreditCard className="w-4 h-4 text-amber-500" />
            {doctor.isSubscribed ? 'Subscription Active' : 'Subscription Pending'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-soft-green text-primary-green flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase block tracking-wider">Total Earnings</span>
            <span className="text-lg font-bold text-dark-navy">{formatCurrency(summary.totalEarnings)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase block tracking-wider">This Month</span>
            <span className="text-lg font-bold text-dark-navy">{formatCurrency(summary.thisMonthEarnings)}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase block tracking-wider">Completed Consults</span>
            <span className="text-lg font-bold text-dark-navy">{summary.completedBookings}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase block tracking-wider">Net Earnings</span>
            <span className="text-lg font-bold text-dark-navy">{formatCurrency(summary.netEarnings)}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-6 md:p-8 min-h-[400px]">
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Overview Panel</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 p-5 border border-slate-150 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Consultation Fee</p>
                <p className="text-xl font-extrabold text-dark-navy mt-2">{formatCurrency(summary.consultationFee)}</p>
              </div>
              <div className="bg-slate-50 p-5 border border-slate-150 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Upcoming Bookings</p>
                <p className="text-xl font-extrabold text-dark-navy mt-2">{summary.upcomingBookings}</p>
              </div>
              <div className="bg-slate-50 p-5 border border-slate-150 rounded-2xl">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Revenue Pipeline</p>
                <p className="text-xl font-extrabold text-dark-navy mt-2">{formatCurrency(summary.pendingEarnings)}</p>
              </div>
            </div>

            <div className="bg-slate-50 p-5 border border-slate-150 rounded-2xl max-w-2xl">
              <h4 className="font-bold text-sm text-dark-navy mb-2">Clinic Address</h4>
              <p className="text-xs text-text-grey leading-relaxed">{doctor.clinicAddress || 'Clinic address not added yet.'}</p>
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Profile Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl">
              {[
                ['Full Name', doctor.name],
                ['MCI Registration Number', doctor.medicalRegistrationNumber],
                ['Department', doctor.speciality],
                ['Qualification', doctor.qualification],
                ['Hospital / Clinic', doctor.hospitalName || 'Independent Practice'],
                ['Consultation Fee', formatCurrency(doctor.consultationFee)],
                ['Location', [doctor.area, doctor.city].filter(Boolean).join(', ') || 'Not updated'],
                ['OPD Timings', doctor.opdTimings || 'Not updated'],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-3 border-b border-slate-100 gap-4">
                  <span className="text-sm text-text-grey font-medium">{label}:</span>
                  <span className="text-sm text-dark-navy font-bold text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'availability' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">OPD Availability Calendar</h2>
            <div className="flex flex-wrap gap-2.5">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div
                  key={day}
                  className={`px-4 py-3 rounded-xl border font-bold text-xs ${
                    doctor.availability.includes(day)
                      ? 'bg-green-50 border-green-200 text-primary-green shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-400'
                  }`}
                >
                  {day} {doctor.availability.includes(day) ? '(Open)' : '(Closed)'}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Patient Referral Requests</h2>
            {appointments.length === 0 ? (
              <p className="text-xs text-text-grey">No appointment requests found.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {appointments.map((appointment) => {
                  const appointmentStatus = appointment.workflowStatus || appointment.status;
                  const isPendingAction = ['Requested', 'Awaiting Doctor Confirmation', 'Pending'].includes(appointmentStatus);
                  return (
                    <div key={appointment.id} className="p-5 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            appointmentStatus === 'Completed'
                              ? 'bg-green-50 text-primary-green border-green-200'
                              : String(appointmentStatus).toLowerCase().includes('cancelled')
                                ? 'bg-red-50 text-red-500 border-red-200'
                                : appointmentStatus === 'Confirmed'
                                  ? 'bg-blue-50 text-blue-600 border-blue-200'
                                  : 'bg-yellow-50 text-yellow-600 border-yellow-200'
                          }`}
                        >
                          {appointmentStatus}
                        </span>
                        <h4 className="font-bold text-dark-navy text-sm mt-2">Patient: {appointment.patientName}</h4>
                        <p className="text-xs text-text-grey mt-0.5">
                          Date: {formatDate(appointment.appointmentDate)} | Slot: {appointment.timeSlot}
                        </p>
                        <p className="text-xs text-slate-500 mt-2">
                          Expected earning: <span className="font-bold text-dark-navy">{formatCurrency(appointment.earningAmount)}</span>
                        </p>
                        {appointment.concern && (
                          <p className="text-xs text-slate-500 italic mt-1">Concern: &quot;{appointment.concern}&quot;</p>
                        )}
                      </div>

                      {isPendingAction && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAppointmentUpdate(appointment.id, 'Cancelled by Doctor', 'Appointment Declined', 'The appointment request has been declined.')}
                            disabled={actioningId === appointment.id}
                            className="flex items-center gap-1 text-xs font-bold text-slate-600 border border-slate-200 bg-white px-3.5 py-2 rounded-xl hover:bg-slate-100 disabled:opacity-60"
                          >
                            <X className="w-4.5 h-4.5" />
                            Decline
                          </button>
                          <button
                            onClick={() => handleAppointmentUpdate(appointment.id, 'Confirmed', 'Appointment Confirmed', 'The patient slot booking has been confirmed.')}
                            disabled={actioningId === appointment.id}
                            className="flex items-center gap-1 text-xs font-bold text-white gradient-medical px-4 py-2 rounded-xl shadow-sm glow-green disabled:opacity-60"
                          >
                            <Check className="w-4.5 h-4.5" />
                            Approve Slot
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Coordinated Medical Reports</h2>
            <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl text-xs text-slate-600 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-green" />
              <span>Report-sharing workflow can be connected next. Doctor earnings data is now live.</span>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Patient Reviews & Feedback</h2>
            <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-bold text-xs text-dark-navy">Average Rating</span>
                <div className="flex gap-0.5 text-yellow-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-xs font-bold text-dark-navy">{doctor.rating.toFixed(1)} / 5</span>
                </div>
              </div>
              <p className="text-xs text-text-grey leading-relaxed">
                Reviews module ke liye abhi live earnings setup complete kar diya gaya hai. Patient feedback feed ko next round me direct DB source se wire kiya ja sakta hai.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'subscription' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Membership Subscription Tier</h2>
            <div className="p-6 bg-slate-950 text-white rounded-3xl border border-slate-800 flex justify-between items-center max-w-xl">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">CURRENT STATUS</span>
                <h3 className="text-xl font-bold mt-1">{doctor.isSubscribed ? 'Doctor Subscription Active' : 'Subscription Pending'}</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Renewal and payment records are now pulled from the live payments ledger.
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-semibold text-slate-400">Renews on</span>
                <span className="text-sm font-bold text-amber-500">{formatDate(doctor.subscriptionEndsAt)}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'promote' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="font-extrabold text-lg text-dark-navy">Promote Profile</h2>
              <p className="text-xs text-text-grey">
                Spotlight payment ke baad aapka profile homepage ke <span className="font-bold text-dark-navy">Top Tier Health Care Experts</span> section me show hota hai.
              </p>
            </div>

            {spotlightLoading ? (
              <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl text-xs text-text-grey">
                Checking live spotlight status...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Homepage Visibility</p>
                    <p className="text-base font-extrabold text-dark-navy mt-2">
                      {activeSpotlight?.isActive ? 'Live on Homepage' : 'Not Live Yet'}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Promotion Fee</p>
                    <p className="text-base font-extrabold text-dark-navy mt-2">{formatCurrency(spotlight?.fee.amount || 0)}</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Duration</p>
                    <p className="text-base font-extrabold text-dark-navy mt-2">{spotlight?.fee.durationDays || 30} Days</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Days Remaining</p>
                    <p className="text-base font-extrabold text-dark-navy mt-2">
                      {activeSpotlight?.isActive ? `${spotlightDaysRemaining} days left` : '0 days'}
                    </p>
                  </div>
                </div>

                <div className={`rounded-3xl border p-6 ${activeSpotlight?.isActive ? 'bg-green-50 border-green-200/60' : 'bg-slate-50 border-slate-150'}`}>
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        <BadgeCheck className={`w-5 h-5 ${activeSpotlight?.isActive ? 'text-primary-green' : 'text-slate-400'}`} />
                        <span className={`text-sm font-extrabold ${activeSpotlight?.isActive ? 'text-primary-green' : 'text-dark-navy'}`}>
                          {activeSpotlight?.isActive ? 'Promotion Confirmed' : 'Promotion Inactive'}
                        </span>
                      </div>
                      <p className="text-sm text-dark-navy leading-relaxed">
                        {activeSpotlight?.isActive
                          ? 'Aapka doctor profile successfully homepage par visible hai aur users ise Top Tier Health Care Experts section me dekh rahe hain.'
                          : 'Abhi aapka profile homepage spotlight section me live nahi hai. Promote karne ke baad ye section me turant show hoga.'}
                      </p>
                      {activeSpotlight?.isActive && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                          <div className="bg-white rounded-2xl border border-green-100 px-4 py-3">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Started</p>
                            <p className="text-sm font-bold text-dark-navy mt-1">{formatDate(activeSpotlight.startsAt)}</p>
                          </div>
                          <div className="bg-white rounded-2xl border border-green-100 px-4 py-3">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Ends On</p>
                            <p className="text-sm font-bold text-dark-navy mt-1">{formatDate(activeSpotlight.endsAt)}</p>
                          </div>
                          <div className="bg-white rounded-2xl border border-green-100 px-4 py-3">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Status</p>
                            <p className="text-sm font-bold text-primary-green mt-1">{activeSpotlight.paymentStatus || 'Paid'}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="lg:w-[320px] bg-white border border-slate-150 rounded-3xl p-5 shadow-sm">
                      <div className="flex items-center gap-2 mb-3">
                        <Megaphone className="w-4 h-4 text-primary-green" />
                        <h3 className="text-sm font-extrabold text-dark-navy">Homepage Spotlight</h3>
                      </div>
                      <textarea
                        value={spotlightTagline}
                        onChange={(event) => setSpotlightTagline(event.target.value)}
                        rows={4}
                        placeholder="Add a strong doctor spotlight tagline..."
                        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-dark-navy placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green"
                      />
                      <button
                        onClick={handlePromoteProfile}
                        disabled={promoteSubmitting}
                        className="w-full mt-4 gradient-medical text-white font-bold py-3 rounded-2xl shadow-sm disabled:opacity-60"
                      >
                        {promoteSubmitting ? 'Activating Promotion...' : activeSpotlight?.isActive ? 'Renew Spotlight for 1 Month' : 'Pay & Activate Spotlight'}
                      </button>
                      <div className="mt-4 flex items-start gap-2 text-xs text-text-grey">
                        <Globe2 className="w-4 h-4 text-primary-green flex-shrink-0 mt-0.5" />
                        <span>Payment confirm hote hi profile homepage spotlight section me live ho jaayega aur countdown yahin update hota rahega.</span>
                      </div>
                      {activeSpotlight?.isActive && (
                        <div className="mt-3 flex items-start gap-2 text-xs text-primary-green">
                          <TimerReset className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span>{spotlightDaysRemaining} din baad ye promotion expire ho jayega.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h2 className="font-extrabold text-lg text-dark-navy">Earnings & Payment History</h2>
              <p className="text-xs text-text-grey">Live earnings from completed consultations plus actual doctor-side payment records.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Lifetime Earnings</p>
                <p className="text-2xl font-extrabold text-dark-navy mt-2">{formatCurrency(summary.totalEarnings)}</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">This Month</p>
                <p className="text-2xl font-extrabold text-dark-navy mt-2">{formatCurrency(summary.thisMonthEarnings)}</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pending Pipeline</p>
                <p className="text-2xl font-extrabold text-dark-navy mt-2">{formatCurrency(summary.pendingEarnings)}</p>
              </div>
              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Platform Spend</p>
                <p className="text-2xl font-extrabold text-dark-navy mt-2">{formatCurrency(summary.totalExpenses)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-150">
                  <h3 className="font-bold text-sm text-dark-navy">Monthly Earnings Trend</h3>
                </div>
                {monthlyEarnings.length === 0 ? (
                  <div className="p-5 text-xs text-text-grey">No completed consultations yet, so monthly earnings will appear here after successful appointments.</div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {monthlyEarnings.map((item) => (
                      <div key={item.monthKey} className="px-5 py-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-dark-navy">{item.label}</p>
                          <p className="text-xs text-text-grey">{item.consultations} completed consultations</p>
                        </div>
                        <p className="text-sm font-extrabold text-primary-green">{formatCurrency(item.earnings)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-150">
                  <h3 className="font-bold text-sm text-dark-navy">Consultation Snapshot</h3>
                </div>
                <div className="divide-y divide-slate-100">
                  <div className="px-5 py-4 flex items-center justify-between">
                    <span className="text-xs text-text-grey">Total bookings received</span>
                    <span className="text-sm font-bold text-dark-navy">{summary.totalBookings}</span>
                  </div>
                  <div className="px-5 py-4 flex items-center justify-between">
                    <span className="text-xs text-text-grey">Confirmed / active pipeline</span>
                    <span className="text-sm font-bold text-dark-navy">{summary.confirmedBookings}</span>
                  </div>
                  <div className="px-5 py-4 flex items-center justify-between">
                    <span className="text-xs text-text-grey">Completed consultations</span>
                    <span className="text-sm font-bold text-dark-navy">{summary.completedBookings}</span>
                  </div>
                  <div className="px-5 py-4 flex items-center justify-between">
                    <span className="text-xs text-text-grey">Cancelled appointments</span>
                    <span className="text-sm font-bold text-dark-navy">{summary.cancelledBookings}</span>
                  </div>
                  <div className="px-5 py-4 flex items-center justify-between">
                    <span className="text-xs text-text-grey">Upcoming appointments</span>
                    <span className="text-sm font-bold text-dark-navy">{upcomingAppointments.length}</span>
                  </div>
                  <div className="px-5 py-4 flex items-center justify-between">
                    <span className="text-xs text-text-grey">Average per completed consult</span>
                    <span className="text-sm font-bold text-dark-navy">{formatCurrency(summary.consultationFee)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-150">
                <h3 className="font-bold text-sm text-dark-navy">Payment Ledger</h3>
              </div>
              {paymentHistory.length === 0 ? (
                <div className="p-5 text-xs text-text-grey">No doctor-side payment entries found yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs text-slate-700">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">Payment ID</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Created</th>
                        <th className="p-4">Amount</th>
                        <th className="p-4">Method</th>
                        <th className="p-4">Reference</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((payment) => (
                        <tr key={payment.id} className="border-b border-slate-100 last:border-0 font-medium">
                          <td className="p-4 font-mono text-slate-600">PAY-{payment.id}</td>
                          <td className="p-4">{paymentTypeLabel(payment.paymentType)}</td>
                          <td className="p-4">{formatDate(payment.paidAt || payment.createdAt)}</td>
                          <td className="p-4">{formatCurrency(payment.amount)}</td>
                          <td className="p-4">{payment.paymentMethod || 'Not set'}</td>
                          <td className="p-4 font-mono">{payment.transactionRef || payment.invoiceNumber || 'NA'}</td>
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded border ${
                                payment.status === 'Paid'
                                  ? 'bg-green-50 text-primary-green border-green-200/30'
                                  : payment.status === 'Pending'
                                    ? 'bg-yellow-50 text-yellow-600 border-yellow-200/30'
                                    : 'bg-red-50 text-red-500 border-red-200/30'
                              }`}
                            >
                              {payment.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
              <div className="px-5 py-4 bg-slate-50 border-b border-slate-150">
                <h3 className="font-bold text-sm text-dark-navy">Completed Consultation Earnings</h3>
              </div>
              {completedAppointments.length === 0 ? (
                <div className="p-5 text-xs text-text-grey">Completed consultation earnings will appear here after appointments are marked completed.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs text-slate-700">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">Patient</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Slot</th>
                        <th className="p-4">Concern</th>
                        <th className="p-4">Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b border-slate-100 last:border-0 font-medium">
                          <td className="p-4">{appointment.patientName}</td>
                          <td className="p-4">{formatDate(appointment.appointmentDate)}</td>
                          <td className="p-4">{appointment.timeSlot}</td>
                          <td className="p-4">{appointment.concern || 'General consultation'}</td>
                          <td className="p-4 font-bold text-primary-green">{formatCurrency(appointment.earningAmount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function DoctorPanel() {
  return (
    <Suspense
      fallback={(
        <div className="flex items-center justify-center p-12 text-sm text-text-grey font-semibold bg-white rounded-3xl border border-slate-150 shadow-sm">
          Loading doctor portal...
        </div>
      )}
    >
      <DoctorPanelContent />
    </Suspense>
  );
}
