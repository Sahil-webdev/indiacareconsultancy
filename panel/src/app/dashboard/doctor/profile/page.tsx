'use client';

import React, { useEffect, useState } from 'react';
import { panelApi } from '@/lib/api';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

type DoctorProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification: string;
  speciality: string;
  experience: number;
  clinicAddress: string;
  location: string;
  area: string;
  consultationFee: number;
  consultationType: string;
  bio: string;
  hospitalName: string;
  availability: string[];
  languages: string[];
  services: string[];
  awards: string[];
  isApproved: boolean;
  isSubscribed: boolean;
};

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toList(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function DoctorProfilePage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');
  const [languagesText, setLanguagesText] = useState('');
  const [servicesText, setServicesText] = useState('');
  const [awardsText, setAwardsText] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await panelApi<{ doctor: DoctorProfile }>('/api/doctors/me/profile');
        setProfile(response.doctor);
        setLanguagesText(response.doctor.languages.join(', '));
        setServicesText(response.doctor.services.join(', '));
        setAwardsText(response.doctor.awards.join(', '));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSave() {
    if (!profile) return;
    setSaving(true);
    setError('');
    setSaved('');
    try {
      await panelApi(`/api/doctors/${profile.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          qualification: profile.qualification,
          speciality: profile.speciality,
          experience: profile.experience,
          clinicAddress: profile.clinicAddress,
          location: profile.location,
          area: profile.area,
          consultationFee: profile.consultationFee,
          consultationType: profile.consultationType,
          bio: profile.bio,
          hospitalName: profile.hospitalName,
          availability: profile.availability,
          languages: toList(languagesText),
          services: toList(servicesText),
          awards: toList(awardsText),
          opdTimings: '',
        }),
      });
      setSaved('Profile changes submitted for super admin review.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>;
  }

  if (!profile) {
    return <div className="flex-1 p-6 text-sm text-red-400">{error || 'Doctor profile not found.'}</div>;
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>My Profile</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Doctor profile updates save into MySQL and go live after approval.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6 space-y-5">
        {saved && (
          <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
            <CheckCircle2 className="w-4 h-4" /> {saved}
          </div>
        )}
        {error && <div className="rounded-2xl px-4 py-3 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[
            ['Full Name', 'name'],
            ['Phone', 'phone'],
            ['Qualification', 'qualification'],
            ['Speciality', 'speciality'],
            ['Hospital Name', 'hospitalName'],
            ['City', 'location'],
            ['Area', 'area'],
          ].map(([label, key]) => (
            <label key={key} className="panel-card p-4 block">
              <span className="text-[11px] font-semibold block mb-2" style={{ color: '#64748B' }}>{label}</span>
              <input
                value={String(profile[key as keyof DoctorProfile] ?? '')}
                onChange={(e) => setProfile((current) => current ? { ...current, [key]: e.target.value } : current)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
              />
            </label>
          ))}

          <label className="panel-card p-4 block">
            <span className="text-[11px] font-semibold block mb-2" style={{ color: '#64748B' }}>Experience (Years)</span>
            <input type="number" value={profile.experience} onChange={(e) => setProfile({ ...profile, experience: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
          </label>

          <label className="panel-card p-4 block">
            <span className="text-[11px] font-semibold block mb-2" style={{ color: '#64748B' }}>Consultation Fee</span>
            <input type="number" value={profile.consultationFee} onChange={(e) => setProfile({ ...profile, consultationFee: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
          </label>
        </div>

        <label className="panel-card p-4 block">
          <span className="text-[11px] font-semibold block mb-2" style={{ color: '#64748B' }}>Clinic Address</span>
          <textarea value={profile.clinicAddress} onChange={(e) => setProfile({ ...profile, clinicAddress: e.target.value })}
            rows={3} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
        </label>

        <label className="panel-card p-4 block">
          <span className="text-[11px] font-semibold block mb-2" style={{ color: '#64748B' }}>Bio</span>
          <textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            rows={5} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
        </label>

        <div className="panel-card p-4">
          <span className="text-[11px] font-semibold block mb-3" style={{ color: '#64748B' }}>Availability</span>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((day) => {
              const active = profile.availability.includes(day);
              return (
                <button key={day} onClick={() => setProfile({
                  ...profile,
                  availability: active ? profile.availability.filter((item) => item !== day) : [...profile.availability, day],
                })}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold border"
                  style={{
                    background: active ? 'rgba(37,184,154,0.15)' : 'rgba(255,255,255,0.04)',
                    borderColor: active ? 'rgba(37,184,154,0.35)' : 'rgba(255,255,255,0.08)',
                    color: active ? '#25B89A' : '#94A3B8',
                  }}>
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            { label: 'Languages', value: languagesText, setter: setLanguagesText },
            { label: 'Services', value: servicesText, setter: setServicesText },
            { label: 'Awards', value: awardsText, setter: setAwardsText },
          ].map(({ label, value, setter }) => (
            <label key={label} className="panel-card p-4 block">
              <span className="text-[11px] font-semibold block mb-2" style={{ color: '#64748B' }}>{label} (comma separated)</span>
              <textarea value={value} onChange={(e) => setter(e.target.value)}
                rows={5} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            </label>
          ))}
        </div>
      </main>
    </div>
  );
}
