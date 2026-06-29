'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  User,
  FileText,
  Star,
  ShieldCheck,
  DollarSign,
  Activity,
  Check,
  X,
  CreditCard,
  ThumbsUp
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { mockDB } from '@/lib/mockData';

function DoctorPanelContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const activeTab = searchParams.get('tab') || 'overview';

  // Doctor credentials (matches 'doc_1')
  const doctor = mockDB.doctors.find(d => d.id === 'doc_1')!;
  
  // Find appointments assigned to this doctor
  const appointments = useMemo(() => {
    return mockDB.appointments.filter(a => a.doctorId === doctor.id);
  }, [doctor]);

  const [localAppointments, setLocalAppointments] = useState(appointments);

  const handleApprove = (aptId: string) => {
    mockDB.updateAppointmentStatus(aptId, 'Confirmed', 'Approved by Doctor.');
    setLocalAppointments(prev =>
      prev.map(a => a.id === aptId ? { ...a, status: 'Confirmed' } : a)
    );
    toast('success', 'Appointment Confirmed', 'The patient slot booking has been confirmed.');
  };

  const handleReject = (aptId: string) => {
    mockDB.updateAppointmentStatus(aptId, 'Cancelled', 'Cancelled by Doctor.');
    setLocalAppointments(prev =>
      prev.map(a => a.id === aptId ? { ...a, status: 'Cancelled' } : a)
    );
    toast('info', 'Appointment Declined', 'The appointment booking request was declined.');
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header Info */}
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
            <h1 className="text-xl font-extrabold text-dark-navy mt-0.5">
              {doctor.name}
            </h1>
            <p className="text-xs text-text-grey">Speciality: {doctor.speciality} | MCI No: {doctor.medicalRegistrationNumber}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-xl border border-amber-200/30 flex items-center gap-1.5 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            Tier: {doctor.subscriptionPlan} Plan
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-soft-green text-primary-green flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase block tracking-wider">Referrals</span>
            <span className="text-lg font-bold text-dark-navy">{localAppointments.length} Bookings</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-primary-green flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase block tracking-wider">OPD Slots</span>
            <span className="text-lg font-bold text-dark-navy">{doctor.availability.length} Days Open</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Star className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase block tracking-wider">Vetted Rating</span>
            <span className="text-lg font-bold text-dark-navy">{doctor.rating} / 5</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase block tracking-wider">Billing Tier</span>
            <span className="text-lg font-bold text-dark-navy">Active SLA</span>
          </div>
        </div>
      </div>

      {/* Main Tab content router */}
      <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-6 md:p-8 min-h-[400px]">
        
        {/* Tab 1: Overview Dashboard */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Overview Panel</h2>
            <div className="bg-slate-50 p-5 border border-slate-150 rounded-2xl max-w-lg">
              <h4 className="font-bold text-sm text-dark-navy mb-2">OPD Clinic Address</h4>
              <p className="text-xs text-text-grey leading-relaxed">{doctor.clinicAddress}</p>
            </div>
            
            <div className="mt-4">
              <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wide mb-4">Patient Coordination Desk</h4>
              <div className="bg-slate-50 p-4 border border-slate-100 rounded-xl text-xs text-slate-600 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary-green" />
                <span>India Care Consultant is actively managing client referrals for your Connaught Place OPD desk.</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Profile management */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Profile Management</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-text-grey font-medium">Full Name:</span>
                <span className="text-sm text-dark-navy font-bold">{doctor.name}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-text-grey font-medium">MCI Registration Number:</span>
                <span className="text-sm text-dark-navy font-bold">{doctor.medicalRegistrationNumber}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-text-grey font-medium">Department:</span>
                <span className="text-sm text-dark-navy font-bold">{doctor.speciality}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-text-grey font-medium">Consultation Fee:</span>
                <span className="text-sm text-dark-navy font-bold">₹{doctor.consultationFee}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Availability */}
        {activeTab === 'availability' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">OPD Availability Calendar</h2>
            <div className="flex flex-wrap gap-2.5">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
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

        {/* Tab 4: Appointment Requests */}
        {activeTab === 'requests' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Patient Referral Requests</h2>
            {localAppointments.length === 0 ? (
              <p className="text-xs text-text-grey">No appointment requests found.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {localAppointments.map((apt) => (
                  <div key={apt.id} className="p-5 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        apt.status === 'Confirmed' ? 'bg-green-50 text-primary-green border-green-200' :
                        apt.status === 'Cancelled' ? 'bg-red-50 text-red-500 border-red-200' : 'bg-yellow-50 text-yellow-600 border-yellow-250'
                      }`}>
                        {apt.status}
                      </span>
                      <h4 className="font-bold text-dark-navy text-sm mt-2">Patient: {apt.patientName}</h4>
                      <p className="text-xs text-text-grey mt-0.5">Date: {apt.appointmentDate} | Slot: {apt.appointmentTime}</p>
                      {apt.notes && <p className="text-xs text-slate-500 italic mt-2">Notes: &quot;{apt.notes}&quot;</p>}
                    </div>

                    {apt.status === 'Pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(apt.id)}
                          className="flex items-center gap-1 text-xs font-bold text-slate-600 border border-slate-200 bg-white px-3.5 py-2 rounded-xl hover:bg-slate-100"
                        >
                          <X className="w-4.5 h-4.5" />
                          Decline
                        </button>
                        <button
                          onClick={() => handleApprove(apt.id)}
                          className="flex items-center gap-1 text-xs font-bold text-white gradient-medical px-4 py-2 rounded-xl shadow-sm glow-green cursor-pointer"
                        >
                          <Check className="w-4.5 h-4.5" />
                          Approve Slot
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Patient Reports */}
        {activeTab === 'reports' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Coordinated Medical Reports</h2>
            <div className="flex flex-col gap-3">
              <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between text-xs font-semibold text-slate-700">
                <div className="flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-primary-green" />
                  <span>Sahil_Sharma_Heart_ECG_June2026.pdf</span>
                </div>
                <button
                  onClick={() => toast('info', 'File Download', 'Opening encrypted PDF viewer...')}
                  className="text-xs font-bold text-primary-green hover:underline"
                >
                  View File
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: Reviews */}
        {activeTab === 'reviews' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Patient Reviews & Feedback</h2>
            <div className="p-5 bg-slate-50 border border-slate-150 rounded-2xl flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="font-bold text-xs text-dark-navy">Karan Malhotra</span>
                <div className="flex gap-0.5 text-yellow-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
              </div>
              <p className="text-xs text-text-grey italic leading-relaxed">
                &quot;Dr. Kumar was extremely thorough. He took the time to explain my angiogram results and suggested a conservative management plan first. Very satisfied.&quot;
              </p>
            </div>
          </div>
        )}

        {/* Tab 7: Subscription */}
        {activeTab === 'subscription' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Membership Subscription Tier</h2>
            <div className="p-6 bg-slate-950 text-white rounded-3xl border border-slate-800 flex justify-between items-center max-w-xl">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block">ACTIVE PLAN</span>
                <h3 className="text-xl font-bold mt-1">Doctor Elite Portal</h3>
                <p className="text-xs text-slate-400 mt-2">Unlimited consult leads, direct coordinator desk mapping.</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-semibold text-slate-400">Renews on</span>
                <span className="text-sm font-bold text-amber-500">July 14, 2026</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Payments */}
        {activeTab === 'payments' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Payment & Invoice History</h2>
            <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Invoice ID</th>
                    <th className="p-4">Billing Date</th>
                    <th className="p-4">Subscription Plan</th>
                    <th className="p-4">Amount Charged</th>
                    <th className="p-4">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 last:border-0 font-medium">
                    <td className="p-4 font-mono text-slate-600">INV-82947</td>
                    <td className="p-4">June 14, 2026</td>
                    <td className="p-4">Doctor Elite - Monthly</td>
                    <td className="p-4">₹4,999</td>
                    <td className="p-4">
                      <span className="bg-green-50 text-primary-green border border-green-200/30 px-2 py-0.5 rounded">Paid</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function DoctorPanel() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12 text-sm text-text-grey font-semibold bg-white rounded-3xl border border-slate-150 shadow-sm">Loading doctor portal...</div>}>
      <DoctorPanelContent />
    </Suspense>
  );
}
