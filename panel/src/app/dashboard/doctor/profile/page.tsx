'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { panelApi } from '@/lib/api';
import {
  Save, Loader2, CheckCircle2, User, Award, Stethoscope, MapPin,
  Clock, Calendar, Globe, Building2, Phone, Mail, Eye, Edit3, Plus,
  X, BadgeCheck, Star, ShieldCheck, Heart, Sparkles, Check, FileText,
  AlertCircle, Syringe, Video, PhoneCall, Tag, Upload, Camera, Trash2
} from 'lucide-react';

type DoctorProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  photo: string;
  medicalRegistrationNumber: string;
  qualification: string;
  speciality: string;
  experience: number;
  gender?: string;
  clinicAddress: string;
  location: string;
  area: string;
  consultationFee: number;
  consultationType: string;
  bio: string;
  hospitalName: string;
  opdTimings: string;
  availability: string[];
  languages: string[];
  services: string[];
  awards: string[];
  isApproved: boolean;
  isSubscribed: boolean;
  rating?: number;
};

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Native File Input Ref for Device Upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active View Tab: 'edit' or 'preview'
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  // Input states for dynamic tags
  const [newServiceInput, setNewServiceInput] = useState('');
  const [newLanguageInput, setNewLanguageInput] = useState('');
  const [newAwardInput, setNewAwardInput] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await panelApi<{ doctor: DoctorProfile }>('/api/doctors/me/profile');
        const doc = response.doctor;
        // Clear server-side default placeholder paths that cause 404 on panel
        const photoUrl = doc.photo && !doc.photo.includes('default-doctor') ? doc.photo : '';
        setProfile({
          ...doc,
          photo: photoUrl,
          gender: doc.gender || 'Male',
          languages: doc.languages || ['English', 'Hindi'],
          services: doc.services || ['General Consultation', 'ECG Interpretation', 'Hypertension Management'],
          awards: doc.awards || ['Best Doctor Award 2024', 'Gold Medalist in Cardiology'],
          rating: doc.rating || 4.9,
        });
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to load doctor profile');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setErrorMsg('');
    setSavedMsg('');
    try {
      const response = await panelApi<{ doctor?: DoctorProfile }>(`/api/doctors/${profile.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          photo: profile.photo,
          medicalRegistrationNumber: profile.medicalRegistrationNumber,
          qualification: profile.qualification,
          speciality: profile.speciality,
          experience: profile.experience,
          gender: profile.gender,
          clinicAddress: profile.clinicAddress,
          location: profile.location,
          area: profile.area,
          consultationFee: profile.consultationFee,
          consultationType: profile.consultationType,
          bio: profile.bio,
          hospitalName: profile.hospitalName,
          availability: profile.availability,
          languages: profile.languages,
          services: profile.services,
          awards: profile.awards,
          opdTimings: profile.opdTimings,
        }),
      });

      if (response.doctor) {
        setProfile((prev) => prev ? { ...prev, ...response.doctor } : prev);
      }
      setSavedMsg('Profile changes saved successfully & submitted for live review.');
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  }

  // Handle Photo File Upload from Device
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        setProfile({ ...profile, photo: base64 });
        setSavedMsg('Profile photo selected from device. Click "Save Profile" to apply.');
        setTimeout(() => setSavedMsg(''), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Tag helper functions
  const addService = () => {
    if (!newServiceInput.trim() || !profile) return;
    if (!profile.services.includes(newServiceInput.trim())) {
      setProfile({ ...profile, services: [...profile.services, newServiceInput.trim()] });
    }
    setNewServiceInput('');
  };

  const removeService = (service: string) => {
    if (!profile) return;
    setProfile({ ...profile, services: profile.services.filter(s => s !== service) });
  };

  const addLanguage = () => {
    if (!newLanguageInput.trim() || !profile) return;
    if (!profile.languages.includes(newLanguageInput.trim())) {
      setProfile({ ...profile, languages: [...profile.languages, newLanguageInput.trim()] });
    }
    setNewLanguageInput('');
  };

  const removeLanguage = (lang: string) => {
    if (!profile) return;
    setProfile({ ...profile, languages: profile.languages.filter(l => l !== lang) });
  };

  const addAward = () => {
    if (!newAwardInput.trim() || !profile) return;
    if (!profile.awards.includes(newAwardInput.trim())) {
      setProfile({ ...profile, awards: [...profile.awards, newAwardInput.trim()] });
    }
    setNewAwardInput('');
  };

  const removeAward = (award: string) => {
    if (!profile) return;
    setProfile({ ...profile, awards: profile.awards.filter(a => a !== award) });
  };

  const toggleDay = (day: string) => {
    if (!profile) return;
    const exists = profile.availability.includes(day);
    setProfile({
      ...profile,
      availability: exists ? profile.availability.filter(d => d !== day) : [...profile.availability, day]
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex-1 p-6 text-sm text-red-400">
        {errorMsg || 'Doctor profile not found.'}
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header Banner */}
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
            {profile.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-white">{profile.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" /> Verified Specialist
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {profile.isSubscribed ? 'Premium Tier' : 'Basic Plan'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{profile.speciality} · {profile.qualification} · MCI Reg: {profile.medicalRegistrationNumber}</p>
          </div>
        </div>

        {/* Action Toolbar & Tab Switcher */}
        <div className="flex items-center gap-3">
          {/* Dual View Tabs */}
          <div className="flex p-1 rounded-2xl bg-slate-900 border border-white/10">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'edit' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'preview' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
            >
              <Eye className="w-3.5 h-3.5" /> Live Patient View
            </button>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-slate-950 disabled:opacity-60 transition-all shadow-lg shadow-emerald-500/20"
            style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </header>

      {/* Alert Banners */}
      <div className="px-6 pt-4">
        {savedMsg && (
          <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {savedMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold bg-red-500/15 border border-red-500/30 text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <AnimatePresence mode="wait">
          {/* TAB 1: EDIT & MANAGE PROFILE */}
          {activeTab === 'edit' && (
            <motion.div
              key="edit-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-5xl mx-auto"
            >
              {/* Section 1: Hero & Identity Information */}
              <div className="panel-card p-6 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <User className="w-4 h-4" /> Doctor Identity &amp; Credentials
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Full Name *</label>
                    <input
                      type="text"
                      value={profile.name}
                      onChange={e => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Medical Registration No (MCI/State) *</label>
                    <input
                      type="text"
                      value={profile.medicalRegistrationNumber}
                      onChange={e => setProfile({ ...profile, medicalRegistrationNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Primary Speciality *</label>
                    <input
                      type="text"
                      value={profile.speciality}
                      onChange={e => setProfile({ ...profile, speciality: e.target.value })}
                      placeholder="e.g. Cardiology, Neurology"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Qualifications / Degrees *</label>
                    <input
                      type="text"
                      value={profile.qualification}
                      onChange={e => setProfile({ ...profile, qualification: e.target.value })}
                      placeholder="e.g. MBBS, MD, DM (Cardiology)"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Experience (Years) *</label>
                    <input
                      type="number"
                      value={profile.experience}
                      onChange={e => setProfile({ ...profile, experience: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Gender</label>
                    <select
                      value={profile.gender || 'Male'}
                      onChange={e => setProfile({ ...profile, gender: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Phone Number</label>
                    <input
                      type="text"
                      value={profile.phone}
                      onChange={e => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    />
                  </div>
                </div>

                {/* DEVICE FILE UPLOAD COMPONENT FOR PROFILE PHOTO */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Doctor Profile Photo</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-900/90 border border-white/10">
                    <div className="relative">
                      {profile.photo ? (
                        <img
                          src={profile.photo}
                          alt={profile.name}
                          className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-400 shadow-md"
                          onError={() => setProfile(prev => prev ? { ...prev, photo: '' } : prev)}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-2xl border-2 border-emerald-400/40">
                          {profile.name[0]}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center border-2 border-slate-900">
                        <Camera className="w-3 h-3" />
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-2 shadow-md shadow-emerald-500/10"
                        >
                          <Upload className="w-4 h-4" />
                          {profile.photo ? 'Change Photo from Device' : 'Upload Photo from Device'}
                        </button>

                        {profile.photo && (
                          <button
                            type="button"
                            onClick={() => setProfile({ ...profile, photo: '' })}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove Photo
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">Select a photo from your computer or mobile device (PNG, JPG, WEBP formats up to 5MB).</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Practice Location & Booking Modes */}
              <div className="panel-card p-6 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-sky-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Practice Location &amp; Booking Options
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Hospital / Clinic Name</label>
                    <input
                      type="text"
                      value={profile.hospitalName}
                      onChange={e => setProfile({ ...profile, hospitalName: e.target.value })}
                      placeholder="e.g. City Heart & Vascular Institute"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">City / Location *</label>
                    <input
                      type="text"
                      value={profile.location}
                      onChange={e => setProfile({ ...profile, location: e.target.value })}
                      placeholder="e.g. New Delhi"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Area / Landmark</label>
                    <input
                      type="text"
                      value={profile.area}
                      onChange={e => setProfile({ ...profile, area: e.target.value })}
                      placeholder="e.g. Saket District Centre"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Full Clinic Address</label>
                  <textarea
                    value={profile.clinicAddress}
                    onChange={e => setProfile({ ...profile, clinicAddress: e.target.value })}
                    rows={2}
                    placeholder="Full street address of OPD Clinic / Hospital"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Consultation Fee (₹) *</label>
                    <input
                      type="number"
                      value={profile.consultationFee}
                      onChange={e => setProfile({ ...profile, consultationFee: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold text-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Consultation Modes Supported</label>
                    <select
                      value={profile.consultationType}
                      onChange={e => setProfile({ ...profile, consultationType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    >
                      <option value="Both">Both (Online Telehealth &amp; Offline Clinic)</option>
                      <option value="Online">Online Only (Video &amp; Phone Consults)</option>
                      <option value="Offline">Offline Clinic Visits Only</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">OPD Timings</label>
                    <input
                      type="text"
                      value={profile.opdTimings}
                      onChange={e => setProfile({ ...profile, opdTimings: e.target.value })}
                      placeholder="e.g. 10:00 AM - 02:00 PM & 05:00 PM - 08:00 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    />
                  </div>
                </div>

                {/* Available Days Picker */}
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Weekly Availability Days</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_DAYS.map((day) => {
                      const active = profile.availability.includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleDay(day)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold border transition-all ${active ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'}`}
                        >
                          {active && <Check className="w-3 h-3 inline mr-1" />}
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Section 3: Biography */}
              <div className="panel-card p-6 space-y-3">
                <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Professional Bio &amp; Patient Introduction
                </h2>
                <textarea
                  value={profile.bio}
                  onChange={e => setProfile({ ...profile, bio: e.target.value })}
                  rows={4}
                  placeholder="Describe your medical background, special focus areas, clinical achievements, and care philosophy for patients on the website..."
                  className="w-full px-4 py-3 rounded-2xl text-xs text-white bg-slate-900 border border-white/10 resize-none font-medium leading-relaxed"
                />
              </div>

              {/* Section 4: Dynamic Tags (Services, Languages, Awards) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {/* Services Tag Manager */}
                <div className="panel-card p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-1.5">
                    <Stethoscope className="w-4 h-4" /> Services &amp; Treatments
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newServiceInput}
                      onChange={e => setNewServiceInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addService(); } }}
                      placeholder="Add procedure/service..."
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10"
                    />
                    <button onClick={addService} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {profile.services.map(s => (
                      <span key={s} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        {s}
                        <button onClick={() => removeService(s)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages Tag Manager */}
                <div className="panel-card p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-sky-400 flex items-center gap-1.5">
                    <Globe className="w-4 h-4" /> Languages Spoken
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newLanguageInput}
                      onChange={e => setNewLanguageInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLanguage(); } }}
                      placeholder="Add language..."
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10"
                    />
                    <button onClick={addLanguage} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-sky-500 text-slate-950">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {profile.languages.map(l => (
                      <span key={l} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                        {l}
                        <button onClick={() => removeLanguage(l)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Awards Tag Manager */}
                <div className="panel-card p-5 space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                    <Award className="w-4 h-4" /> Awards &amp; Honors
                  </h3>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAwardInput}
                      onChange={e => setNewAwardInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addAward(); } }}
                      placeholder="Add fellowship/award..."
                      className="flex-1 px-3 py-1.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10"
                    />
                    <button onClick={addAward} className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-slate-950">
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {profile.awards.map(a => (
                      <div key={a} className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center justify-between">
                        <span>🏆 {a}</span>
                        <button onClick={() => removeAward(a)} className="hover:text-red-400"><X className="w-3 h-3" /></button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: LIVE WEBSITE PATIENT PREVIEW */}
          {activeTab === 'preview' && (
            <motion.div
              key="preview-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {/* Preview Disclaimer Header */}
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between text-xs">
                <span className="text-sky-300 font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Live Website Patient View Preview
                </span>
                <span className="text-[10px] text-slate-400">This is exactly how patients see your profile on indiacare.com</span>
              </div>

              {/* Website Card Replica */}
              <div className="panel-card p-6 sm:p-8 space-y-6 relative overflow-hidden border-2 border-emerald-500/30">
                {/* Hero Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b pb-6 border-white/10">
                  <div className="flex items-center gap-5">
                    <div className="relative">
                      {profile.photo ? (
                        <img
                          src={profile.photo}
                          alt={profile.name}
                          className="w-24 h-24 rounded-3xl object-cover border-2 border-emerald-400 shadow-xl"
                          onError={() => setProfile(prev => prev ? { ...prev, photo: '' } : prev)}
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-3xl border-2 border-emerald-400">
                          {profile.name[0]}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center border-2 border-slate-900">
                        <BadgeCheck className="w-4 h-4" />
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h2 className="font-black text-xl text-white">{profile.name}</h2>
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                          {profile.rating} ★
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-slate-300">{profile.qualification} · {profile.speciality}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" /> {profile.hospitalName || 'Private Practice'}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {profile.clinicAddress || profile.location}
                      </p>
                    </div>
                  </div>

                  {/* Match Score & Fee Badge */}
                  <div className="sm:text-right space-y-2">
                    <div className="p-3 rounded-2xl bg-slate-900 border border-emerald-500/30 inline-block">
                      <p className="text-[10px] text-slate-400 uppercase font-black">Patient Match Score</p>
                      <p className="text-2xl font-black text-emerald-400">98% Match</p>
                    </div>
                  </div>
                </div>

                {/* Patient Booking Mode Fee Pills */}
                <div className="space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Available Consultation Modes &amp; Fees</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-white flex items-center gap-1.5">
                        <Syringe className="w-4 h-4 text-emerald-400" /> Clinic Visit
                      </span>
                      <span className="font-black text-emerald-400">₹{profile.consultationFee}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-white flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-sky-400" /> Video Consult
                      </span>
                      <span className="font-black text-sky-400">₹{profile.consultationFee}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between text-xs">
                      <span className="font-extrabold text-white flex items-center gap-1.5">
                        <PhoneCall className="w-4 h-4 text-purple-400" /> Phone Consult
                      </span>
                      <span className="font-black text-purple-400">₹{profile.consultationFee}</span>
                    </div>
                  </div>
                </div>

                {/* About & Bio */}
                {profile.bio && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">About Doctor</h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-medium p-4 rounded-2xl bg-slate-900/80 border border-white/10">
                      {profile.bio}
                    </p>
                  </div>
                )}

                {/* Services Grid */}
                {profile.services.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Services &amp; Treatments Offered</h3>
                    <div className="flex flex-wrap gap-2">
                      {profile.services.map(s => (
                        <span key={s} className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/25">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages & Awards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  {profile.languages.length > 0 && (
                    <div className="space-y-2 p-4 rounded-2xl bg-slate-900/80 border border-white/10">
                      <h4 className="text-[11px] font-black uppercase text-sky-400">Languages Spoken</h4>
                      <p className="text-xs text-white font-bold">{profile.languages.join(' · ')}</p>
                    </div>
                  )}

                  {profile.awards.length > 0 && (
                    <div className="space-y-2 p-4 rounded-2xl bg-slate-900/80 border border-white/10">
                      <h4 className="text-[11px] font-black uppercase text-amber-400">Awards &amp; Honors</h4>
                      <p className="text-xs text-white font-bold">{profile.awards.join(' · ')}</p>
                    </div>
                  )}
                </div>

                {/* Schedule Days */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2">
                  <h4 className="text-[11px] font-black uppercase text-emerald-400">OPD Timings &amp; Available Days</h4>
                  <p className="text-xs text-slate-300 font-bold">{profile.opdTimings || '9:00 AM - 6:00 PM'}</p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {ALL_DAYS.map(day => (
                      <span key={day} className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${profile.availability.includes(day) ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-white/5 text-slate-500 border-white/10'}`}>
                        {day}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
