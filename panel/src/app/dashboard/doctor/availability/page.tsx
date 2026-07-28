'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { panelApi } from '@/lib/api';
import { Clock, CheckCircle2, XCircle, Save, Loader2, Calendar, Check, AlertCircle } from 'lucide-react';

type DoctorProfile = {
  id: string;
  name: string;
  availability: string[];
  opdTimings?: string;
  availabilitySchedule?: Record<string, string[]>;
};

const DAY_MAPPING: Record<string, string> = {
  Monday: 'Mon',
  Tuesday: 'Tue',
  Wednesday: 'Wed',
  Thursday: 'Thu',
  Friday: 'Fri',
  Saturday: 'Sat',
  Sunday: 'Sun',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'
];

const DEFAULT_SLOTS = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '05:00 PM', '05:30 PM'];

function deriveOpdTimings(schedule: Record<string, { active: boolean; slots: string[] }>) {
  const ordered = TIME_SLOTS.filter((slot) =>
    Object.values(schedule).some((day) => day.slots.includes(slot))
  );

  if (!ordered.length) return '';
  return `${ordered[0]} - ${ordered[ordered.length - 1]}`;
}

export default function DoctorAvailabilityPage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Schedule State per day
  const [schedule, setSchedule] = useState<Record<string, { active: boolean; slots: string[] }>>({
    Monday:    { active: true,  slots: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '05:00 PM', '05:30 PM'] },
    Tuesday:   { active: true,  slots: ['10:00 AM', '10:30 AM', '11:00 AM', '05:00 PM', '05:30 PM'] },
    Wednesday: { active: true,  slots: ['10:00 AM', '10:30 AM', '11:00 AM', '05:00 PM'] },
    Thursday:  { active: true,  slots: ['10:00 AM', '10:30 AM', '11:00 AM', '05:00 PM', '05:30 PM'] },
    Friday:    { active: true,  slots: ['10:00 AM', '10:30 AM', '11:00 AM', '05:00 PM', '05:30 PM'] },
    Saturday:  { active: true,  slots: ['10:00 AM', '10:30 AM', '11:00 AM'] },
    Sunday:    { active: false, slots: [] },
  });

  useEffect(() => {
    async function loadDoctorSchedule() {
      try {
        const response = await panelApi<{ doctor: DoctorProfile }>('/api/doctors/me/profile');
        const doc = response.doctor;
        setProfile(doc);

        if (doc.availability && Array.isArray(doc.availability)) {
          const newSched: Record<string, { active: boolean; slots: string[] }> = {};
          DAYS.forEach((fullDay) => {
            const shortDay = DAY_MAPPING[fullDay];
            const isActive = doc.availability.includes(shortDay) || doc.availability.includes(fullDay);
            const configuredSlots = doc.availabilitySchedule?.[shortDay] || [];
            newSched[fullDay] = {
              active: isActive,
              slots: isActive ? (configuredSlots.length > 0 ? configuredSlots : (schedule[fullDay]?.slots || DEFAULT_SLOTS)) : [],
            };
          });
          setSchedule(newSched);
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to load availability schedule');
      } finally {
        setLoading(false);
      }
    }
    loadDoctorSchedule();
  }, []);

  const toggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        active: !prev[day].active,
        slots: !prev[day].active ? (prev[day].slots.length > 0 ? prev[day].slots : DEFAULT_SLOTS) : [],
      }
    }));
  };

  const toggleSlot = (day: string, slot: string) => {
    setSchedule(prev => {
      const currentSlots = prev[day].slots;
      const updatedSlots = currentSlots.includes(slot)
        ? currentSlots.filter(s => s !== slot)
        : [...currentSlots, slot];
      return {
        ...prev,
        [day]: {
          ...prev[day],
          active: updatedSlots.length > 0 ? true : prev[day].active,
          slots: updatedSlots,
        }
      };
    });
  };

  const handleSaveSchedule = async () => {
    if (!profile) return;
    setSaving(true);
    setErrorMsg('');
    setSavedMsg('');

    const activeShortDays = DAYS
      .filter(day => schedule[day].active && schedule[day].slots.length > 0)
      .map(day => DAY_MAPPING[day]);

    const availabilitySchedule = Object.fromEntries(
      DAYS.map((day) => [DAY_MAPPING[day], schedule[day].active ? schedule[day].slots : []])
    );
    const opdTimings = deriveOpdTimings(schedule);

    try {
      const response = await panelApi<{ doctor?: DoctorProfile }>(`/api/doctors/${profile.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          availability: activeShortDays,
          availabilitySchedule,
          opdTimings,
        }),
      });

      if (response.doctor) {
        setProfile((prev) => prev ? { ...prev, ...response.doctor } : prev);
      }
      setSavedMsg('Schedule saved successfully!');
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save schedule.');
    } finally {
      setSaving(false);
    }
  };

  const totalSlots = Object.values(schedule).reduce((acc, d) => acc + d.slots.length, 0);
  const activeDaysCount = Object.values(schedule).filter(d => d.active && d.slots.length > 0).length;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <header
        className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0 page-header"
        style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}
      >
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Availability &amp; OPD Schedule</h1>
          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Manage your weekly consultation days and time slots</p>
        </div>

        <button
          onClick={handleSaveSchedule}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-md"
          style={{ background: 'linear-gradient(135deg, #127A6A, #075E52)' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (savedMsg ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />)}
          {saving ? 'Saving...' : (savedMsg ? 'Saved!' : 'Save Schedule')}
        </button>
      </header>

      {/* Notifications */}
      <div className="px-6 pt-4">
        {savedMsg && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {savedMsg}
          </div>
        )}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-bold bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" /> {errorMsg}
          </div>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto panel-scroll p-6 space-y-6">
        {/* Simple Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="panel-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{activeDaysCount} Days</p>
              <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Active Days</p>
            </div>
          </div>

          <div className="panel-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{totalSlots} Slots</p>
              <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Open Time Slots</p>
            </div>
          </div>

          <div className="panel-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-500/15 text-slate-500 flex items-center justify-center font-bold">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{7 - activeDaysCount} Days</p>
              <p className="text-[10px] font-bold uppercase" style={{ color: 'var(--text-muted)' }}>Days Off</p>
            </div>
          </div>
        </div>

        {/* Days List */}
        <div className="space-y-4">
          {DAYS.map((day, idx) => {
            const dayData = schedule[day];
            const isActive = dayData.active;

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="panel-card p-5 space-y-4"
              >
                {/* Day Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleDay(day)}
                      className="relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0"
                      style={{ background: isActive ? '#127A6A' : 'var(--border-color)' }}
                    >
                      <motion.div
                        animate={{ x: isActive ? 22 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm flex items-center justify-center"
                      >
                        {isActive && <Check className="w-2.5 h-2.5 text-emerald-700" />}
                      </motion.div>
                    </button>

                    <div>
                      <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{day}</h3>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                        {isActive ? `${dayData.slots.length} slots selected` : 'Day Off'}
                      </p>
                    </div>
                  </div>

                  {isActive && dayData.slots.length > 0 && (
                    <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      {dayData.slots.length} slots open
                    </span>
                  )}
                </div>

                {/* Time Slots Grid */}
                {isActive && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    {TIME_SLOTS.map((slot) => {
                      const selected = dayData.slots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => toggleSlot(day, slot)}
                          className="px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                          style={selected
                            ? { background: 'rgba(18, 122, 106, 0.18)', color: '#127A6A', border: '1px solid rgba(18, 122, 106, 0.35)' }
                            : { background: 'var(--bg-surface-3)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }
                          }
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
