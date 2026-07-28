'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { panelApi } from '@/lib/api';
import {
  Clock, CheckCircle2, XCircle, Save, Loader2, Calendar, Sun, Moon,
  Copy, Sparkles, AlertCircle, Syringe, Video, PhoneCall, Check, Zap, Trash2
} from 'lucide-react';

type DoctorProfile = {
  id: string;
  name: string;
  availability: string[];
  opdTimings?: string;
  consultationType?: string;
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

const REVERSE_DAY_MAPPING: Record<string, string> = {
  Mon: 'Monday',
  Tue: 'Tuesday',
  Wed: 'Wednesday',
  Thu: 'Thursday',
  Fri: 'Friday',
  Sat: 'Saturday',
  Sun: 'Sunday',
};

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const MORNING_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM'
];

const EVENING_SLOTS = [
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM',
  '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM'
];

const ALL_SLOTS = [...MORNING_SLOTS, ...EVENING_SLOTS];

const DEFAULT_SLOTS = ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '05:00 PM', '05:30 PM'];

export default function DoctorAvailabilityPage() {
  const [profile, setProfile] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Active Mode Filter Tab
  const [selectedMode, setSelectedMode] = useState<'all' | 'clinic' | 'video' | 'phone'>('all');

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
            newSched[fullDay] = {
              active: isActive,
              slots: isActive ? (schedule[fullDay]?.slots || DEFAULT_SLOTS) : [],
            };
          });
          setSchedule(newSched);
        }
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to load availability');
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

  // Bulk Actions
  const copyMondayToWeekdays = () => {
    const mondaySlots = [...schedule.Monday.slots];
    const isMondayActive = schedule.Monday.active;

    setSchedule(prev => ({
      ...prev,
      Monday:    { active: isMondayActive, slots: [...mondaySlots] },
      Tuesday:   { active: isMondayActive, slots: [...mondaySlots] },
      Wednesday: { active: isMondayActive, slots: [...mondaySlots] },
      Thursday:  { active: isMondayActive, slots: [...mondaySlots] },
      Friday:    { active: isMondayActive, slots: [...mondaySlots] },
    }));

    setSavedMsg('Monday schedule copied to all weekdays (Tue - Fri).');
    setTimeout(() => setSavedMsg(''), 4000);
  };

  const selectShiftForActiveDays = (shift: 'morning' | 'evening' | 'both') => {
    setSchedule(prev => {
      const updated = { ...prev };
      DAYS.forEach((day) => {
        if (updated[day].active) {
          if (shift === 'morning') {
            updated[day].slots = [...MORNING_SLOTS];
          } else if (shift === 'evening') {
            updated[day].slots = [...EVENING_SLOTS];
          } else {
            updated[day].slots = [...ALL_SLOTS];
          }
        }
      });
      return updated;
    });
  };

  const clearAllSlots = () => {
    setSchedule(prev => {
      const updated = { ...prev };
      DAYS.forEach((day) => {
        updated[day] = { active: false, slots: [] };
      });
      return updated;
    });
  };

  // Save Schedule Handler
  const handleSaveSchedule = async () => {
    if (!profile) return;
    setSaving(true);
    setErrorMsg('');
    setSavedMsg('');

    // Map active days to short names for DB ('Mon', 'Tue', etc.)
    const activeShortDays = DAYS
      .filter(day => schedule[day].active && schedule[day].slots.length > 0)
      .map(day => DAY_MAPPING[day]);

    // Build OPD Timings summary text
    const opdTimingsText = '10:00 AM - 01:00 PM & 05:00 PM - 08:00 PM';

    try {
      const response = await panelApi<{ doctor?: DoctorProfile }>(`/api/doctors/${profile.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          availability: activeShortDays,
          opdTimings: opdTimingsText,
        }),
      });

      if (response.doctor) {
        setProfile((prev) => prev ? { ...prev, ...response.doctor } : prev);
      }
      setSavedMsg('Weekly availability schedule saved successfully!');
      setTimeout(() => setSavedMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save availability schedule.');
    } finally {
      setSaving(false);
    }
  };

  const totalSlots = Object.values(schedule).reduce((acc, d) => acc + d.slots.length, 0);
  const activeDaysCount = Object.values(schedule).filter(d => d.active && d.slots.length > 0).length;
  const estimatedHours = Math.round(totalSlots * 0.5 * 10) / 10;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-10">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header Banner */}
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg text-white">OPD &amp; Telehealth Availability</h1>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Live Patient Booking Schedule
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Set open consultation days &amp; time slots for patient appointments</p>
        </div>

        <button
          onClick={handleSaveSchedule}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black text-slate-950 disabled:opacity-60 transition-all shadow-lg shadow-emerald-500/20"
          style={{ background: 'linear-gradient(135deg, #10B981, #059669)' }}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving Schedule...' : 'Save Schedule'}
        </button>
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

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto panel-scroll p-6 space-y-6">
        {/* Summary Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{activeDaysCount} Days</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Active OPD Days</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="panel-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{totalSlots} Slots</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Weekly Open Slots</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="panel-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Sun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-white">~{estimatedHours} Hrs</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Weekly OPD Hours</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="panel-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center font-bold">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{7 - activeDaysCount} Days</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Days Off</p>
            </div>
          </motion.div>
        </div>

        {/* Consultation Mode Filter Tabs */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-black text-white">Filter Schedule View by Booking Mode:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'All Modes', icon: Calendar },
              { id: 'clinic', label: '💉 Clinic Visit', icon: Syringe },
              { id: 'video', label: '📹 Video Consult', icon: Video },
              { id: 'phone', label: '📞 Phone Consult', icon: PhoneCall },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedMode(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all ${selectedMode === tab.id ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-950 text-slate-400 hover:text-white border border-white/10'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bulk Schedule Quick Tools Bar */}
        <div className="panel-card p-5 space-y-3">
          <h2 className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2">
            <Zap className="w-4 h-4" /> Quick Schedule Automation Tools
          </h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={copyMondayToWeekdays}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <Copy className="w-3.5 h-3.5 text-sky-400" /> Copy Mon to Weekdays (Tue - Fri)
            </button>

            <button
              onClick={() => selectShiftForActiveDays('morning')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <Sun className="w-3.5 h-3.5 text-amber-400" /> Select Morning Shift (09:00 AM - 01:00 PM)
            </button>

            <button
              onClick={() => selectShiftForActiveDays('evening')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 flex items-center gap-1.5 transition-all"
            >
              <Moon className="w-3.5 h-3.5 text-purple-400" /> Select Evening Shift (04:00 PM - 08:00 PM)
            </button>

            <button
              onClick={clearAllSlots}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 flex items-center gap-1.5 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All Slots
            </button>
          </div>
        </div>

        {/* Day-by-Day Availability Grid */}
        <div className="space-y-4">
          {DAYS.map((day, idx) => {
            const dayData = schedule[day];
            const isActive = dayData.active;

            return (
              <motion.div
                key={day}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`panel-card p-5 space-y-4 border transition-all ${isActive ? 'border-emerald-500/30' : 'border-white/5 opacity-75'}`}
              >
                {/* Day Header Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleDay(day)}
                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-slate-800 border border-white/10'}`}
                    >
                      <motion.div
                        animate={{ x: isActive ? 24 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-slate-950 shadow-md flex items-center justify-center text-[9px] font-bold text-white"
                      >
                        {isActive && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                      </motion.div>
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-sm text-white">{day}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-slate-400 border border-white/10 uppercase">
                          {DAY_MAPPING[day]}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {isActive ? `${dayData.slots.length} time slots selected` : 'Day off · No appointments allowed'}
                      </p>
                    </div>
                  </div>

                  {isActive && (
                    <span className="text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                      {dayData.slots.length} Slots Open
                    </span>
                  )}
                </div>

                {/* Time Slot Picker Grid */}
                {isActive && (
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    {/* Morning Shift */}
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1">
                        <Sun className="w-3 h-3" /> Morning Shift (09:00 AM – 01:00 PM)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {MORNING_SLOTS.map((slot) => {
                          const isSelected = dayData.slots.includes(slot);
                          return (
                            <button
                              key={slot}
                              onClick={() => toggleSlot(day, slot)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${isSelected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'}`}
                            >
                              {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Evening Shift */}
                    <div className="space-y-2 pt-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-purple-400 flex items-center gap-1">
                        <Moon className="w-3 h-3" /> Evening Shift (04:00 PM – 08:00 PM)
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {EVENING_SLOTS.map((slot) => {
                          const isSelected = dayData.slots.includes(slot);
                          return (
                            <button
                              key={slot}
                              onClick={() => toggleSlot(day, slot)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all border ${isSelected ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm' : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'}`}
                            >
                              {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                              {slot}
                            </button>
                          );
                        })}
                      </div>
                    </div>
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
