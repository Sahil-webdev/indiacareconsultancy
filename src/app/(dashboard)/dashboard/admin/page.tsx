'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Users,
  Building,
  FileText,
  DollarSign,
  CheckCircle2,
  Calendar,
  AlertCircle,
  Search,
  Check,
  X,
  Plus,
  ShieldCheck,
  Award,
  Layers,
  Settings,
  Clock
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { mockDB } from '@/lib/mockData';

function AdminDashboardContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const activeTab = searchParams.get('tab') || 'overview';

  // State arrays for reactive approvals tables
  const [doctorsList, setDoctorsList] = useState(mockDB.doctors);
  const [hospitalsList, setHospitalsList] = useState(mockDB.hospitals);

  const pendingDoctors = useMemo(() => {
    return doctorsList.filter(d => !d.isApproved);
  }, [doctorsList]);

  const pendingHospitals = useMemo(() => {
    return hospitalsList.filter(h => !h.isApproved);
  }, [hospitalsList]);

  const handleApproveDoctor = (docId: string) => {
    // Modify in memory
    const idx = mockDB.doctors.findIndex(d => d.id === docId);
    if (idx !== -1) {
      mockDB.doctors[idx].isApproved = true;
    }
    setDoctorsList([...mockDB.doctors]);
    toast('success', 'Doctor Approved', 'Doctor profile is now active on the public directory.');
  };

  const handleRejectDoctor = (docId: string) => {
    // Delete/decline
    mockDB.deleteDoctor(docId);
    setDoctorsList([...mockDB.doctors]);
    toast('info', 'Doctor Discarded', 'Doctor registration request discarded.');
  };

  const handleApproveHospital = (hospId: string) => {
    const idx = mockDB.hospitals.findIndex(h => h.id === hospId);
    if (idx !== -1) {
      mockDB.hospitals[idx].isApproved = true;
    }
    setHospitalsList([...mockDB.hospitals]);
    toast('success', 'Hospital Vetted', 'Hospital is now listed as an accredited partner.');
  };

  const handleRejectHospital = (hospId: string) => {
    mockDB.deleteHospital(hospId);
    setHospitalsList([...mockDB.hospitals]);
    toast('info', 'Hospital Discarded', 'Hospital partner request discarded.');
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-primary-green uppercase tracking-widest block font-semibold">
            Super Administrator console
          </span>
          <h1 className="text-2xl font-extrabold text-dark-navy mt-1">
            Platform Operations Center
          </h1>
          <p className="text-xs text-text-grey mt-0.5">Vetting node status: Online | Database link active</p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-soft-green text-primary-green flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase tracking-wider block font-semibold">Active Doctors</span>
            <span className="text-lg font-bold text-dark-navy">{doctorsList.filter(d => d.isApproved).length} Listed</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 text-primary-green flex items-center justify-center flex-shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase tracking-wider block font-semibold">Partner Hospitals</span>
            <span className="text-lg font-bold text-dark-navy">{hospitalsList.filter(h => h.isApproved).length} Accredited</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase tracking-wider block font-semibold">Total Case Leads</span>
            <span className="text-lg font-bold text-dark-navy">{mockDB.leads.length} Cases</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-150 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-text-grey font-bold uppercase tracking-wider block font-semibold">Monthly Revenue</span>
            <span className="text-lg font-bold text-dark-navy">₹2,48,000</span>
          </div>
        </div>
      </div>

      {/* Tab details container */}
      <div className="bg-white rounded-3xl border border-slate-150 shadow-sm p-6 md:p-8 min-h-[450px]">
        
        {/* Tab 1: Overview and Pending Vetting approvals */}
        {activeTab === 'overview' && (
          <div className="flex flex-col gap-8">
            {/* Doctor Approvals */}
            <div>
              <h3 className="font-extrabold text-base text-dark-navy mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Pending Doctor Registrations ({pendingDoctors.length})
              </h3>
              {pendingDoctors.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-100 text-xs text-text-grey rounded-2xl">
                  No pending doctor registrations in queue.
                </div>
              ) : (
                <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs text-slate-700">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">Name</th>
                        <th className="p-4">Speciality</th>
                        <th className="p-4">Registration No</th>
                        <th className="p-4">Requested Tier</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingDoctors.map((doc) => (
                        <tr key={doc.id} className="border-b border-slate-100 font-medium">
                          <td className="p-4 font-bold">{doc.name}</td>
                          <td className="p-4">{doc.speciality}</td>
                          <td className="p-4 font-mono">{doc.medicalRegistrationNumber}</td>
                          <td className="p-4">
                            <span className="bg-amber-50 text-amber-600 border border-amber-250/20 px-2 py-0.5 rounded font-bold">{doc.subscriptionPlan}</span>
                          </td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            <button
                              onClick={() => handleRejectDoctor(doc.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Discard Request"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproveDoctor(doc.id)}
                              className="p-1 text-white gradient-medical rounded-lg shadow-sm hover:opacity-95 transition-all"
                              title="Approve Practitioner"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Hospital Approvals */}
            <div>
              <h3 className="font-extrabold text-base text-dark-navy mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Pending Hospital Affiliations ({pendingHospitals.length})
              </h3>
              {pendingHospitals.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-100 text-xs text-text-grey rounded-2xl">
                  No pending hospital registrations in queue.
                </div>
              ) : (
                <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs text-slate-700">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider">
                        <th className="p-4">Hospital Name</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Reg Details</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingHospitals.map((hosp) => (
                        <tr key={hosp.id} className="border-b border-slate-100 font-medium">
                          <td className="p-4 font-bold">{hosp.name}</td>
                          <td className="p-4">{hosp.location}</td>
                          <td className="p-4 font-mono">{hosp.registrationDetails}</td>
                          <td className="p-4 text-right flex justify-end gap-2">
                            <button
                              onClick={() => handleRejectHospital(hosp.id)}
                              className="p-1 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-100 transition-colors"
                              title="Discard Request"
                            >
                              <X className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleApproveHospital(hosp.id)}
                              className="p-1 text-white gradient-medical rounded-lg shadow-sm hover:opacity-95 transition-all"
                              title="Approve Hospital"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Patients directory */}
        {activeTab === 'patients' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Patient Account Registry</h2>
            <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Registration Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDB.users.filter(u => u.role === 'patient').map(u => (
                    <tr key={u.id} className="border-b border-slate-100 font-medium">
                      <td className="p-4 font-bold">{u.name}</td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4 font-mono">{u.phone}</td>
                      <td className="p-4">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Leads queue */}
        {activeTab === 'leads' && (
          <div className="flex flex-col gap-6">
            <h2 className="font-extrabold text-lg text-dark-navy">Intake Lead Registry</h2>
            <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse text-xs text-slate-700">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 font-bold text-slate-500 uppercase tracking-wider">
                    <th className="p-4">Patient Name</th>
                    <th className="p-4">City</th>
                    <th className="p-4">Speciality Concern</th>
                    <th className="p-4">Case Status</th>
                    <th className="p-4">Intake Date</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDB.leads.map(lead => (
                    <tr key={lead.id} className="border-b border-slate-100 font-medium">
                      <td className="p-4 font-bold">{lead.patientDetails.name}</td>
                      <td className="p-4">{lead.patientDetails.city}</td>
                      <td className="p-4">{lead.healthConcern.preferredSpeciality}</td>
                      <td className="p-4">
                        <span className="bg-soft-green text-primary-green border border-primary-green/20 px-2 py-0.5 rounded uppercase tracking-wide font-extrabold text-[9px]">
                          {lead.status}
                        </span>
                      </td>
                      <td className="p-4">{new Date(lead.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Other Tabs placeholders for completeness */}
        {((['doctors', 'hospitals', 'consultants', 'appointments', 'subscriptions', 'payments', 'blogs', 'settings'] as const) as readonly string[]).includes(activeTab) && (
          <div className="flex flex-col gap-4">
            <h2 className="font-extrabold text-lg text-dark-navy capitalize">{activeTab} Administration</h2>
            <div className="p-6 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-text-grey leading-relaxed">
              Managing secure operational parameters for {activeTab} nodes. Access granted to Super Admin panel credentials.
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12 text-sm text-text-grey font-semibold bg-white rounded-3xl border border-slate-150 shadow-sm">Loading admin dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
