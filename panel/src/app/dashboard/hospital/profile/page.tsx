'use client';

import React, { useEffect, useState } from 'react';
import { panelApi } from '@/lib/api';
import { Save, Loader2, CheckCircle2 } from 'lucide-react';

type HospitalProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  emergencyContact: string;
  website: string;
  registrationDetails: string;
  hospitalType: string;
  address: string;
  location: string;
  city: string;
  rating: number;
  departments: string[];
  facilities: string[];
  accreditations: string[];
  opdTimings: string;
  about: string;
  totalBeds: number;
};

function toList(value: string) {
  return value.split(',').map((item) => item.trim()).filter(Boolean);
}

export default function HospitalProfilePage() {
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [departmentsText, setDepartmentsText] = useState('');
  const [facilitiesText, setFacilitiesText] = useState('');
  const [accreditationsText, setAccreditationsText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await panelApi<{ hospital: HospitalProfile }>('/api/hospitals/me/profile');
        setProfile(response.hospital);
        setDepartmentsText(response.hospital.departments.join(', '));
        setFacilitiesText(response.hospital.facilities.join(', '));
        setAccreditationsText(response.hospital.accreditations.join(', '));
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
    setMessage('');
    try {
      await panelApi(`/api/hospitals/${profile.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          emergencyContact: profile.emergencyContact,
          website: profile.website,
          registrationDetails: profile.registrationDetails,
          hospitalType: profile.hospitalType,
          totalBeds: profile.totalBeds,
          address: profile.address,
          location: profile.location,
          opdTimings: profile.opdTimings,
          about: profile.about,
          departments: toList(departmentsText),
          facilities: toList(facilitiesText),
          accreditations: toList(accreditationsText),
        }),
      });
      setMessage('Hospital profile changes submitted for super admin review.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex-1 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-violet-400" /></div>;
  if (!profile) return <div className="flex-1 p-6 text-sm text-red-400">{error || 'Hospital profile not found.'}</div>;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Hospital Profile</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>All edits are saved through Node.js backend and stored in MySQL.</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#8B5CF6,#6D28D9)' }}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6 space-y-5">
        {message && (
          <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>
            <CheckCircle2 className="w-4 h-4" /> {message}
          </div>
        )}
        {error && <div className="rounded-2xl px-4 py-3 text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>{error}</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {[
            ['Hospital Name', 'name'],
            ['Phone', 'phone'],
            ['Emergency Contact', 'emergencyContact'],
            ['Website', 'website'],
            ['Registration Number', 'registrationDetails'],
            ['Hospital Type', 'hospitalType'],
            ['City', 'location'],
            ['OPD Timings', 'opdTimings'],
          ].map(([label, key]) => (
            <label key={key} className="panel-card p-4 block">
              <span className="text-[11px] font-semibold block mb-2" style={{ color: '#64748B' }}>{label}</span>
              <input value={String(profile[key as keyof HospitalProfile] ?? '')} onChange={(e) => setProfile((current) => current ? { ...current, [key]: e.target.value } : current)}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            </label>
          ))}
          <label className="panel-card p-4 block">
            <span className="text-[11px] font-semibold block mb-2" style={{ color: '#64748B' }}>Total Beds</span>
            <input type="number" value={profile.totalBeds} onChange={(e) => setProfile({ ...profile, totalBeds: Number(e.target.value) })}
              className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
          </label>
        </div>

        <label className="panel-card p-4 block">
          <span className="text-[11px] font-semibold block mb-2" style={{ color: '#64748B' }}>Address</span>
          <textarea value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
        </label>

        <label className="panel-card p-4 block">
          <span className="text-[11px] font-semibold block mb-2" style={{ color: '#64748B' }}>About Hospital</span>
          <textarea value={profile.about} onChange={(e) => setProfile({ ...profile, about: e.target.value })} rows={5}
            className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
        </label>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {[
            { label: 'Departments', value: departmentsText, setter: setDepartmentsText },
            { label: 'Facilities', value: facilitiesText, setter: setFacilitiesText },
            { label: 'Accreditations', value: accreditationsText, setter: setAccreditationsText },
          ].map(({ label, value, setter }) => (
            <label key={label} className="panel-card p-4 block">
              <span className="text-[11px] font-semibold block mb-2" style={{ color: '#64748B' }}>{label} (comma separated)</span>
              <textarea value={value} onChange={(e) => setter(e.target.value)} rows={5}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            </label>
          ))}
        </div>
      </main>
    </div>
  );
}
