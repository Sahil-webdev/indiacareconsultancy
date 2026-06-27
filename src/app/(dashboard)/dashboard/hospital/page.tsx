'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Building2,
  Calendar,
  Layers,
  ShieldCheck,
  Users,
  Image,
  DollarSign,
  Plus,
  Trash,
  PhoneCall,
  Check,
  X
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { mockDB } from '@/lib/mockData';

function HospitalPanelContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const activeTab = searchParams.get('tab') || 'overview';

  // Hospital credentials (matches 'hosp_1' Apollo Hospital)
  const hospital = mockDB.hospitals.find(h => h.id === 'hosp_1')!;
  
  // Find doctors linked with this hospital
  const linkedDoctors = useMemo(() => {
    return mockDB.doctors.filter(d => d.hospitalId === hospital.id);
  }, [hospital]);

  // Find appointments mapped to this hospital
  const appointments = useMemo(() => {
    return mockDB.appointments.filter(a => a.hospitalId === hospital.id);
  }, [hospital]);

  const [localAppointments, setLocalAppointments] = useState(appointments);

  const handleApprove = (aptId: string) => {
    mockDB.updateAppointmentStatus(aptId, 'Confirmed', 'Approved by Hospital.');
    setLocalAppointments(prev =>
      prev.map(a => a.id === aptId ? { ...a, status: 'Confirmed' } : a)
    );
    toast('success', 'Referral Confirmed', 'The patient admission request slot has been approved.');
  };

  const handleReject = (aptId: string) => {
    mockDB.updateAppointmentStatus(aptId, 'Cancelled', 'Declined by Hospital.');
    setLocalAppointments(prev =>
      prev.map(a => a.id === aptId ? { ...a, status: 'Cancelled' } : a)
    );
    toast('info', 'Referral Declined', 'The admission referral was declined.');
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-16 h-12 rounded-xl overflow-hidden bg-slate-150 flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hospital.image} alt={hospital.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-primary-green uppercase tracking-widest block">
              Accredited hospital panel
            </span>
            <h1 className="text-xl font-extrabold text-dark-navy mt-0.5">
              {hospital.name}
            </h1>
            <p className="text-xs text-text-grey">Location: {hospital.location} | Lic No: {hospital.registrationDetails}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <span className="bg-soft-green text-primary-green text-xs font-bold px-3 py-1.5 rounded-xl border border-primary-green/200/30 flex items-center gap-1.5 shadow-sm">
            <Building2 className="w-4 h-4 text-primary-green" />
            {hospital.subscriptionPlan} Partner
          </span>
        </div>
      </div>

      {/* Stats Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-soft-green text-primary-green flex items-center justify-center flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase block tracking-wider font-semibold">OPD Referrals</span>
            <span className="text-lg font-bold text-dark-navy">{localAppointments.length} Leads</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-primary-green flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase block tracking-wider font-semibold">Linked Doctors</span>
            <span className="text-lg font-bold text-dark-navy">{linkedDoctors.length} Practitioners</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase block tracking-wider font-semibold">Departments</span>
            <span className="text-lg font-bold text-dark-navy">{hospital.departments.length} Medical</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase block tracking-wider font-semibold">Facilities</span>
            <span className="text-lg font-bold text-dark-navy">{hospital.facilities.length} Accredited</span>
          </div>
        </div>
      </div>

      {/* Main Tab content router */}
      <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-6 md:p-8 min-h-[400px]">
        
        {/* Tab 1: Overview Panel */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Overview Dashboard</h2>
            <div className="bg-slate-50 p-5 border border-slate-150 rounded-2xl max-w-lg flex flex-col gap-2">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">OPD Timing Standard</span>
              <p className="text-sm text-dark-navy font-bold">{hospital.opdTimings}</p>
            </div>
          </div>
        )}

        {/* Tab 2: Hospital Profile */}
        {activeTab === 'profile' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Hospital Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-text-grey font-medium">Institution Name:</span>
                <span className="text-sm text-dark-navy font-bold">{hospital.name}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-text-grey font-medium">Licence/Registration Details:</span>
                <span className="text-sm text-dark-navy font-bold">{hospital.registrationDetails}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-text-grey font-medium">Full Address:</span>
                <span className="text-sm text-dark-navy font-bold">{hospital.address}</span>
              </div>
              <div className="flex justify-between py-3 border-b border-slate-100">
                <span className="text-sm text-text-grey font-medium">Emergency Line:</span>
                <span className="text-sm text-rose-600 font-extrabold">{hospital.emergencyContact}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Departments */}
        {activeTab === 'departments' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center">
              <h2 className="font-extrabold text-lg text-dark-navy">Active Medical Departments</h2>
              <button
                onClick={() => toast('info', 'Add Department', 'System settings restricted. Contact administrator to expand department permissions.')}
                className="flex items-center gap-1.5 text-xs font-bold text-white gradient-primary px-4 py-2 rounded-xl shadow cursor-pointer"
              >
                <Plus className="w-4.5 h-4.5" />
                Add Department
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {hospital.departments.map(dept => (
                <div key={dept} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex justify-between items-center text-sm font-semibold text-slate-700">
                  <span>{dept} Department</span>
                  <button onClick={() => toast('info', 'Action Blocked', 'Requires Admin approvals to delete primary departments.')} className="text-slate-400 hover:text-red-500">
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Vetted Facilities */}
        {activeTab === 'facilities' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Accredited Core Facilities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {hospital.facilities.map(fac => (
                <div key={fac} className="p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-2.5 text-sm font-bold text-slate-700">
                  <ShieldCheck className="w-5 h-5 text-primary-green" />
                  <span>{fac}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Linked Doctors */}
        {activeTab === 'doctors' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Linked Doctors Directories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {linkedDoctors.map(doc => (
                <div key={doc.id} className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex gap-3 items-center">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={doc.photo} alt={doc.name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-dark-navy">{doc.name}</h4>
                    <p className="text-[10px] text-primary-green font-semibold">{doc.speciality} Specialist</p>
                    <p className="text-[10px] text-text-grey mt-0.5">{doc.experience} Years Experience</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 6: Appointment Requests */}
        {activeTab === 'requests' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">OPD Referral Coordination</h2>
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
                      <p className="text-xs text-text-grey mt-0.5">Speciality: {apt.speciality} | Slot: {apt.appointmentDate} at {apt.appointmentTime}</p>
                      {apt.notes && <p className="text-xs text-slate-500 italic mt-2">Intake Concern: &quot;{apt.notes}&quot;</p>}
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

        {/* Tab 7: Subscription */}
        {activeTab === 'subscription' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Hospital Subscription Tier</h2>
            <div className="p-6 bg-slate-950 text-white rounded-3xl border border-slate-800 flex justify-between items-center max-w-xl">
              <div>
                <span className="text-[10px] font-bold text-primary-green uppercase tracking-widest block font-semibold">PARTNER TIER</span>
                <h3 className="text-xl font-bold mt-1">Hospital Premium Portal</h3>
                <p className="text-xs text-slate-400 mt-2">Featured ranking, departments search boosts, ICU referral coordinates.</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className="text-sm font-semibold text-slate-400">Status</span>
                <span className="text-sm font-bold text-primary-green">Premium Vetted</span>
              </div>
            </div>
          </div>
        )}

        {/* Tab 8: Billing Payments */}
        {activeTab === 'payments' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Billing & Invoices</h2>
            <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Invoice ID</th>
                    <th className="p-4">Billing Date</th>
                    <th className="p-4">Billing Plan</th>
                    <th className="p-4">Charges</th>
                    <th className="p-4">Payment Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100 last:border-0 font-medium">
                    <td className="p-4 font-mono text-slate-600">INV-92841</td>
                    <td className="p-4">June 14, 2026</td>
                    <td className="p-4">Hospital Premium - Monthly</td>
                    <td className="p-4">₹14,999</td>
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

export default function HospitalPanel() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12 text-sm text-text-grey font-semibold bg-white rounded-3xl border border-slate-150 shadow-sm">Loading hospital portal...</div>}>
      <HospitalPanelContent />
    </Suspense>
  );
}
