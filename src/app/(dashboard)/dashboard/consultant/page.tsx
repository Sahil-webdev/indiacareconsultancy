'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  FileText,
  Users,
  Building,
  CheckCircle2,
  Clock,
  MapPin,
  Stethoscope,
  ChevronRight,
  MessageSquare,
  User,
  Plus,
  Send,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { mockDB } from '@/lib/mockData';

function ConsultantPanelContent() {
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const activeTab = searchParams.get('tab') || 'leads';

  // State for leads list to trigger reactive re-renders
  const [leads, setLeads] = useState(mockDB.leads);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(mockDB.leads[0]?.id || null);
  const [newNote, setNewNote] = useState('');
  
  // Doctor/Hospital selection helper states
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState('');

  const activeLead = useMemo(() => {
    return leads.find(l => l.id === selectedLeadId) || null;
  }, [leads, selectedLeadId]);

  // Vetted doctors for recommendation
  const availableDoctors = useMemo(() => {
    if (!activeLead) return mockDB.doctors;
    return mockDB.doctors.filter(d => d.speciality === activeLead.healthConcern.preferredSpeciality);
  }, [activeLead]);

  // Vetted hospitals for recommendation
  const availableHospitals = useMemo(() => {
    if (!activeLead) return mockDB.hospitals;
    return mockDB.hospitals.filter(h => h.departments.includes(activeLead.healthConcern.preferredSpeciality));
  }, [activeLead]);

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !newNote.trim()) return;

    const updated = mockDB.updateLeadStatus(
      selectedLeadId,
      activeLead?.status || 'New',
      newNote,
      'Consultant Ramesh'
    );

    if (updated) {
      setLeads([...mockDB.leads]);
      setNewNote('');
      toast('success', 'Follow-up Note Added', 'Your consultation comments have been appended.');
    }
  };

  const handleAddRecommendations = () => {
    if (!selectedLeadId) return;
    const docIds = selectedDoctorId ? [selectedDoctorId] : [];
    const hospIds = selectedHospitalId ? [selectedHospitalId] : [];

    if (docIds.length === 0 && hospIds.length === 0) {
      toast('error', 'Recommendation Error', 'Please select at least one doctor or hospital.');
      return;
    }

    const updated = mockDB.addRecommendationsToLead(selectedLeadId, docIds, hospIds);
    if (updated) {
      setLeads([...mockDB.leads]);
      setSelectedDoctorId('');
      setSelectedHospitalId('');
      toast('success', 'Recommendations Transmitted', 'Curated specialists and hospitals shared with the patient panel.');
    }
  };

  const handleStatusChange = (status: typeof mockDB.leads[0]['status']) => {
    if (!selectedLeadId) return;
    const updated = mockDB.updateLeadStatus(selectedLeadId, status, `Consultant progressed status to: ${status}`, 'Consultant Ramesh');
    if (updated) {
      setLeads([...mockDB.leads]);
      toast('info', 'Status Progressed', `Lead progressed to ${status}.`);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'New': return 'bg-soft-green text-primary-green border-primary-green/20';
      case 'Doctor Suggested': return 'bg-purple-50 text-purple-600 border-purple-200/20';
      case 'Appointment Pending': return 'bg-yellow-50 text-yellow-600 border-yellow-200/20';
      case 'Converted': return 'bg-green-50 text-primary-green border-green-200/20';
      case 'Lost': return 'bg-red-50 text-red-500 border-red-200/20';
      default: return 'bg-slate-50 text-slate-500 border-slate-200/20';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Panel */}
      <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm">
        <span className="text-[10px] font-bold text-primary-green uppercase tracking-widest block font-semibold">
          healthcare consulting dashboard
        </span>
        <h1 className="text-2xl font-extrabold text-dark-navy mt-1">
          Case Coordinator Workdesk
        </h1>
        <p className="text-xs text-text-grey mt-0.5">Assigned Consultant: Ramesh Kumar. Vetting active queues.</p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEADS LIST PANEL (LEFT) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-slate-150 shadow-sm flex flex-col gap-4">
          <h3 className="font-bold text-dark-navy text-sm pb-3 border-b border-slate-100 flex justify-between items-center">
            <span>Inquiry Queue ({leads.length})</span>
          </h3>

          <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
            {leads.map((lead) => (
              <button
                key={lead.id}
                onClick={() => setSelectedLeadId(lead.id)}
                className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedLeadId === lead.id
                    ? 'bg-soft-green border-primary-green/30 shadow'
                    : 'bg-slate-50 border-slate-150 hover:bg-slate-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-xs text-dark-navy line-clamp-1">{lead.patientDetails.name}</h4>
                  <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getStatusBadgeClass(lead.status)}`}>
                    {lead.status}
                  </span>
                </div>
                <p className="text-[10px] text-text-grey mt-1 font-semibold">Concern: {lead.healthConcern.preferredSpeciality} | {lead.patientDetails.city}</p>
                <p className="text-[9px] text-slate-400 mt-2">Submitted: {new Date(lead.createdAt).toLocaleDateString()}</p>
              </button>
            ))}
          </div>
        </div>

        {/* DETAILS & ACTION DESK (RIGHT) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {activeLead ? (
            <>
              {/* Vetting Card */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col gap-6">
                <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                  <div>
                    <h2 className="font-extrabold text-lg text-dark-navy">{activeLead.patientDetails.name}</h2>
                    <p className="text-xs text-text-grey">Age: {activeLead.patientDetails.age} | Gender: {activeLead.patientDetails.gender} | Phone: {activeLead.patientDetails.phone}</p>
                  </div>
                  
                  {/* Status Switcher */}
                  <select
                    value={activeLead.status}
                    onChange={(e) => handleStatusChange(e.target.value as typeof mockDB.leads[0]['status'])}
                    className="text-xs font-bold bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-dark-navy focus:outline-none"
                  >
                    <option value="New">New Lead</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Need More Details">Need Details</option>
                    <option value="Doctor Suggested">Doctor Suggested</option>
                    <option value="Appointment Pending">Appointment Pending</option>
                    <option value="Converted">Converted Lead</option>
                    <option value="Lost">Lost Lead</option>
                  </select>
                </div>

                {/* Medical Concern */}
                <div>
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wide mb-2">Patient Intake symptoms</h4>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col gap-2">
                    <p className="text-sm text-dark-navy font-bold">{activeLead.healthConcern.mainProblem}</p>
                    <p className="text-xs text-text-grey leading-relaxed">{activeLead.healthConcern.symptoms}</p>
                    <div className="flex gap-4 mt-2 text-[10px] text-slate-500 font-semibold">
                      <span>Duration: {activeLead.healthConcern.duration}</span>
                      <span>• Location: {activeLead.preferences.preferredLocation}</span>
                      <span>• Budget: {activeLead.preferences.budgetRange}</span>
                    </div>
                  </div>
                </div>

                {/* Recommendations Configurator */}
                <div>
                  <h4 className="font-bold text-xs text-slate-400 uppercase tracking-wide mb-3">Suggest Doctor & Hospital</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-dark-navy">Select Specialist Doctor</label>
                      <select
                        value={selectedDoctorId}
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-dark-navy focus:outline-none"
                      >
                        <option value="">Select Doctor</option>
                        {availableDoctors.map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.name} (Fee: ₹{doc.consultationFee})</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-dark-navy">Select Partner Hospital</label>
                      <select
                        value={selectedHospitalId}
                        onChange={(e) => setSelectedHospitalId(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-dark-navy focus:outline-none"
                      >
                        <option value="">Select Hospital</option>
                        {availableHospitals.map(hosp => (
                          <option key={hosp.id} value={hosp.id}>{hosp.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAddRecommendations}
                    className="w-full bg-primary-green hover:bg-dark-green text-white font-bold text-xs py-3 rounded-xl shadow-md glow-green mt-4 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Stethoscope className="w-4 h-4" />
                    Transmit Recommendations
                  </button>
                </div>
              </div>

              {/* Consultation Logs and followups */}
              <div className="bg-white p-6 rounded-3xl border border-slate-150 shadow-sm flex flex-col gap-4">
                <h3 className="font-bold text-dark-navy text-sm">Consultant Case Progress Logs</h3>
                
                <div className="flex flex-col gap-3 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                  {activeLead.followUpNotes.length === 0 ? (
                    <p className="text-xs text-text-grey italic">No notes logged yet. Use form below to log call notes.</p>
                  ) : (
                    activeLead.followUpNotes.map((n, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                        <p className="text-xs text-slate-700 font-medium leading-relaxed">&quot;{n.note}&quot;</p>
                        <div className="flex justify-between items-center mt-2 text-[9px] text-slate-400 font-semibold">
                          <span>Logged by: {n.author}</span>
                          <span>{new Date(n.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form onSubmit={handleAddNote} className="flex gap-3 items-center mt-2">
                  <input
                    type="text"
                    placeholder="Log client call details or symptom changes..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="flex-grow bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs text-dark-navy focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-150 p-12 text-center text-sm font-semibold text-text-grey shadow-sm">
              <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              Please select a case inquiry from the queue.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ConsultantPanel() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-12 text-sm text-text-grey font-semibold bg-white rounded-3xl border border-slate-150 shadow-sm">Loading consultant workdesk...</div>}>
      <ConsultantPanelContent />
    </Suspense>
  );
}
