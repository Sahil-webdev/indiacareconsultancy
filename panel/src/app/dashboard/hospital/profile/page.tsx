'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { panelApi } from '@/lib/api';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  BedDouble,
  Building2,
  Check,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Globe,
  HeartPulse,
  ImagePlus,
  Loader2,
  MapPin,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';

type HospitalProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  website: string;
  image: string;
  registrationDetails: string;
  hospitalType: string;
  totalBeds: number;
  address: string;
  googleMapsLink?: string;
  location: string;
  city: string;
  rating: number;
  departments: string[];
  facilities: string[];
  accreditations: string[];
  gallery: string[];
  opdTimings: string;
  about: string;
  doctorCount?: number;
  isApproved?: boolean;
  isSubscribed?: boolean;
};

const HOSPITAL_TYPES = [
  'Multispeciality',
  'General',
  'Specialty',
  'Clinic',
  'Nursing Home',
  'Diagnostic Centre',
];

function ChipManager({
  title,
  colorClass,
  placeholder,
  values,
  setValues,
}: {
  title: string;
  colorClass: string;
  placeholder: string;
  values: string[];
  setValues: (values: string[]) => void;
}) {
  const [draft, setDraft] = useState('');

  const addValue = () => {
    const value = draft.trim();
    if (!value) return;
    if (values.includes(value)) {
      setDraft('');
      return;
    }
    setValues([...values, value]);
    setDraft('');
  };

  return (
    <div className="panel-card p-5 space-y-3">
      <h3 className={`text-xs font-black uppercase tracking-widest ${colorClass}`}>{title}</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addValue();
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl text-xs text-white bg-slate-900 border border-white/10"
        />
        <button
          type="button"
          onClick={addValue}
          className="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 text-slate-950"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((item) => (
          <span
            key={item}
            className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-white/5 text-slate-200 border border-white/10 flex items-center gap-1"
          >
            {item}
            <button type="button" onClick={() => setValues(values.filter((value) => value !== item))}>
              <X className="w-3 h-3 hover:text-red-400" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function HospitalProfilePage() {
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const coverInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await panelApi<{ hospital: HospitalProfile }>('/api/hospitals/me/profile');
        const hospital = response.hospital;

        setProfile({
          ...hospital,
          image: hospital.image && !hospital.image.includes('default-hospital') ? hospital.image : '',
          googleMapsLink: hospital.googleMapsLink || '',
          departments: hospital.departments || [],
          facilities: hospital.facilities || [],
          accreditations: hospital.accreditations || [],
          gallery: hospital.gallery || [],
          rating: hospital.rating || 4.7,
          about: hospital.about || '',
        });
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to load hospital profile');
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
      const response = await panelApi<{ hospital?: HospitalProfile }>(`/api/hospitals/${profile.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          emergencyContact: profile.emergencyContact,
          website: profile.website,
          image: profile.image,
          registrationDetails: profile.registrationDetails,
          hospitalType: profile.hospitalType,
          totalBeds: profile.totalBeds,
          address: profile.address,
          googleMapsLink: profile.googleMapsLink,
          location: profile.location,
          opdTimings: profile.opdTimings,
          about: profile.about,
          departments: profile.departments,
          facilities: profile.facilities,
          accreditations: profile.accreditations,
          gallery: profile.gallery,
        }),
      });

      if (response.hospital) {
        setProfile((current) => (current ? { ...current, ...response.hospital } : current));
      }

      setSavedMsg('Hospital profile changes saved successfully and submitted for live review.');
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save hospital profile');
    } finally {
      setSaving(false);
    }
  }

  const handleSingleImageUpload = (file: File, onReady: (value: string) => void) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      if (base64) {
        onReady(base64);
      }
    };
    reader.readAsDataURL(file);
  };

  const uploadCoverImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    handleSingleImageUpload(file, (value) => {
      setProfile({ ...profile, image: value });
      setSavedMsg('Hospital image selected from device. Save profile to submit.');
      setTimeout(() => setSavedMsg(''), 3000);
    });
  };

  const uploadGalleryImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length || !profile) return;

    Promise.all(
      files.slice(0, 6).map(
        (file) =>
          new Promise<string>((resolve, reject) => {
            if (file.size > 5 * 1024 * 1024) {
              reject(new Error('Each gallery image should be less than 5MB.'));
              return;
            }
            const reader = new FileReader();
            reader.onload = (event) => resolve((event.target?.result as string) || '');
            reader.onerror = () => reject(new Error('Failed to read gallery image'));
            reader.readAsDataURL(file);
          })
      )
    )
      .then((images) => {
        setProfile({
          ...profile,
          gallery: [...profile.gallery, ...images.filter(Boolean)].slice(0, 8),
        });
        setSavedMsg('Gallery images added. Save profile to submit changes.');
        setTimeout(() => setSavedMsg(''), 3000);
      })
      .catch((error) => setErrorMsg(error instanceof Error ? error.message : 'Failed to add gallery images'));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  if (!profile) {
    return <div className="flex-1 p-6 text-sm text-red-400">{errorMsg || 'Hospital profile not found.'}</div>;
  }

  const mapHref = profile.googleMapsLink?.trim() || `https://maps.google.com/?q=${encodeURIComponent(profile.address || profile.location)}`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header
        className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--border-color)', background: 'var(--bg-surface)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-emerald-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md">
            {profile.name[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-lg text-white">{profile.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" /> Verified Hospital
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {profile.isSubscribed ? 'Premium Tier' : 'Basic Plan'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {profile.hospitalType} · {profile.location} · Reg No: {profile.registrationDetails}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 rounded-2xl bg-slate-900 border border-white/10">
            <button
              onClick={() => setActiveTab('edit')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'edit' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" /> Edit Profile
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'preview' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
              }`}
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

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        <AnimatePresence mode="wait">
          {activeTab === 'edit' && (
            <motion.div
              key="edit-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6 max-w-6xl mx-auto"
            >
              <div className="panel-card p-6 space-y-5">
                <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> Hospital Identity & Operations
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Hospital Name *</label>
                    <input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Registration Number *</label>
                    <input
                      value={profile.registrationDetails}
                      onChange={(e) => setProfile({ ...profile, registrationDetails: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Hospital Type *</label>
                    <select
                      value={profile.hospitalType}
                      onChange={(e) => setProfile({ ...profile, hospitalType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    >
                      {HOSPITAL_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Phone *</label>
                    <input
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Emergency Contact</label>
                    <input
                      value={profile.emergencyContact}
                      onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Total Beds</label>
                    <input
                      type="number"
                      value={profile.totalBeds}
                      onChange={(e) => setProfile({ ...profile, totalBeds: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-emerald-400 bg-slate-900 border border-white/10 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Website</label>
                    <input
                      type="url"
                      value={profile.website}
                      onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Hospital Cover Image</label>
                  <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={uploadCoverImage} />
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-slate-900/90 border border-white/10">
                    <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-emerald-400/40 bg-slate-800 flex items-center justify-center">
                      {profile.image ? (
                        <img
                          src={profile.image}
                          alt={profile.name}
                          className="w-full h-full object-cover"
                          onError={() => setProfile((current) => (current ? { ...current, image: '' } : current))}
                        />
                      ) : (
                        <Building2 className="w-10 h-10 text-emerald-400" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => coverInputRef.current?.click()}
                          className="px-4 py-2 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {profile.image ? 'Change Cover Image' : 'Upload Cover Image'}
                        </button>
                        {profile.image && (
                          <button
                            type="button"
                            onClick={() => setProfile({ ...profile, image: '' })}
                            className="px-3 py-2 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Hospital facade, reception, brand board, ya verified campus image yahan upload karein.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="panel-card p-6 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-sky-400 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Location, Maps & Access
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">City / Location *</label>
                    <input
                      value={profile.location}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value, city: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">OPD Timings</label>
                    <input
                      value={profile.opdTimings}
                      onChange={(e) => setProfile({ ...profile, opdTimings: e.target.value })}
                      placeholder="e.g. 9:00 AM - 8:00 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Full Address *</label>
                  <textarea
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    rows={3}
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10 resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Google Maps Share Link</label>
                  <input
                    type="url"
                    value={profile.googleMapsLink || ''}
                    onChange={(e) => setProfile({ ...profile, googleMapsLink: e.target.value })}
                    placeholder="Paste exact Google Maps share link"
                    className="w-full px-3.5 py-2.5 rounded-xl text-xs text-white bg-slate-900 border border-white/10"
                  />
                  <p className="mt-1 text-[10px] text-slate-400">
                    Website par "Open in Google Maps" isi exact hospital location ko open karega.
                  </p>
                </div>
              </div>

              <div className="panel-card p-6 space-y-4">
                <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4" /> About Hospital & Public Summary
                </h2>
                <textarea
                  value={profile.about}
                  onChange={(e) => setProfile({ ...profile, about: e.target.value })}
                  rows={6}
                  placeholder="Hospital overview, specialties, emergency strength, patient trust, infrastructure highlights..."
                  className="w-full px-3.5 py-3 rounded-xl text-xs text-white bg-slate-900 border border-white/10 resize-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
                <ChipManager
                  title="Departments"
                  colorClass="text-emerald-400"
                  placeholder="Add department..."
                  values={profile.departments}
                  setValues={(departments) => setProfile({ ...profile, departments })}
                />
                <ChipManager
                  title="Facilities"
                  colorClass="text-sky-400"
                  placeholder="Add facility..."
                  values={profile.facilities}
                  setValues={(facilities) => setProfile({ ...profile, facilities })}
                />
                <ChipManager
                  title="Accreditations"
                  colorClass="text-amber-400"
                  placeholder="Add accreditation..."
                  values={profile.accreditations}
                  setValues={(accreditations) => setProfile({ ...profile, accreditations })}
                />
              </div>

              <div className="panel-card p-6 space-y-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <h2 className="text-xs font-black uppercase tracking-widest text-violet-400 flex items-center gap-2">
                    <ImagePlus className="w-4 h-4" /> Hospital Gallery
                  </h2>
                  <input ref={galleryInputRef} type="file" accept="image/*" multiple className="hidden" onChange={uploadGalleryImages} />
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="px-4 py-2 rounded-xl text-xs font-black bg-violet-500 text-white flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> Add Gallery Images
                  </button>
                </div>

                {profile.gallery.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/60 p-8 text-center">
                    <p className="text-xs font-bold text-slate-300">No gallery images added yet</p>
                    <p className="text-[10px] text-slate-500 mt-1">ICU, lobby, rooms, diagnostics, reception, operation theatre highlights upload kar sakte hain.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {profile.gallery.map((image, index) => (
                      <div key={`${image.slice(0, 20)}-${index}`} className="relative rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
                        <img src={image} alt={`Hospital gallery ${index + 1}`} className="w-full h-28 object-cover" />
                        <button
                          type="button"
                          onClick={() =>
                            setProfile({
                              ...profile,
                              gallery: profile.gallery.filter((_, currentIndex) => currentIndex !== index),
                            })
                          }
                          className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-slate-950/80 text-red-400 flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'preview' && (
            <motion.div
              key="preview-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-5xl mx-auto space-y-6"
            >
              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-between text-xs">
                <span className="text-sky-300 font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Live Website Hospital Preview
                </span>
                <span className="text-[10px] text-slate-400">Ye patient-facing public profile ka close preview hai</span>
              </div>

              <div className="panel-card overflow-hidden border-2 border-emerald-500/25">
                <div className="relative h-56 sm:h-72">
                  {profile.image ? (
                    <img src={profile.image} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-emerald-900 via-slate-900 to-cyan-950" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-950/20 via-slate-950/50 to-slate-950/90" />
                  <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full">{profile.hospitalType}</span>
                      <span className="bg-white/10 text-white text-[10px] font-black px-3 py-1 rounded-full border border-white/10">
                        {profile.totalBeds}+ Beds
                      </span>
                      <span className="bg-white/10 text-white text-[10px] font-black px-3 py-1 rounded-full border border-white/10">
                        {profile.departments.length} Departments
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">{profile.name}</h2>
                    <p className="text-sm text-slate-300 mt-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-400" /> {profile.address}
                    </p>
                  </div>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Rating', value: `${profile.rating.toFixed(1)} / 5`, icon: Star, color: 'text-yellow-400' },
                      { label: 'Doctors', value: `${profile.doctorCount || 0}+`, icon: Users, color: 'text-violet-400' },
                      { label: 'Beds', value: `${profile.totalBeds}+`, icon: BedDouble, color: 'text-cyan-400' },
                      { label: 'Emergency', value: profile.emergencyContact || 'Available', icon: Phone, color: 'text-red-400' },
                    ].map((item) => (
                      <div key={item.label} className="rounded-2xl bg-slate-900 border border-white/10 p-4">
                        <item.icon className={`w-4 h-4 ${item.color}`} />
                        <p className="text-[10px] text-slate-400 uppercase font-black mt-3">{item.label}</p>
                        <p className="text-sm font-black text-white mt-1">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-slate-900 border border-white/10 p-5">
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-3">About Hospital</h3>
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {profile.about || `${profile.name} is a verified hospital profile with complete location, department, and patient support information.`}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="rounded-2xl bg-slate-900 border border-white/10 p-5 space-y-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-sky-400">Departments</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.departments.map((department) => (
                          <span key={department} className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {department}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-slate-900 border border-white/10 p-5 space-y-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-amber-400">Facilities</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.facilities.map((facility) => (
                          <span key={facility} className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-white/5 text-slate-200 border border-white/10">
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <h3 className="text-lg font-black text-white flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-emerald-400" /> Location & Directions
                        </h3>
                        <p className="text-sm text-slate-300 mt-2 max-w-2xl">{profile.address}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-3">
                          <Clock className="w-3.5 h-3.5 text-emerald-400" /> OPD: {profile.opdTimings || '9:00 AM - 6:00 PM'}
                        </div>
                      </div>

                      <a
                        href={mapHref}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-colors"
                      >
                        Open in Google Maps <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="mt-5 rounded-2xl border border-emerald-500/15 bg-white/5 p-8 text-center relative overflow-hidden">
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #22C55E 1px, transparent 0)', backgroundSize: '28px 28px' }}
                      />
                      <div className="relative">
                        <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 border-2 border-emerald-400 flex items-center justify-center">
                          <MapPin className="w-7 h-7 text-emerald-400" />
                        </div>
                        <p className="text-base font-black text-white mt-4">{profile.location}</p>
                        <p className="text-xs text-slate-400 mt-1">{profile.address}</p>
                      </div>
                    </div>
                  </div>

                  {profile.gallery.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-xs font-black uppercase tracking-widest text-violet-400">Hospital Gallery</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {profile.gallery.map((image, index) => (
                          <div key={`${image.slice(0, 20)}-preview-${index}`} className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900">
                            <img src={image} alt={`Preview gallery ${index + 1}`} className="w-full h-28 object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {profile.accreditations.length > 0 && (
                    <div className="rounded-2xl bg-slate-900 border border-white/10 p-5">
                      <h3 className="text-xs font-black uppercase tracking-widest text-amber-400 mb-3 flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4" /> Accreditations
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.accreditations.map((item) => (
                          <span key={item} className="text-[11px] font-bold px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/20">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {['Parking Available', 'Wheelchair Access', 'Emergency Support'].map((feature) => (
                      <div key={feature} className="text-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-3">
                        <p className="text-[11px] font-black text-emerald-300 flex items-center justify-center gap-2">
                          <Check className="w-3.5 h-3.5" /> {feature}
                        </p>
                      </div>
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
