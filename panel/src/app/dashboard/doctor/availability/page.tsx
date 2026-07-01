'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, XCircle, Save } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SLOTS = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'];

const INIT_AVAIL: Record<string, { active: boolean; slots: string[] }> = {
  Monday:    { active: true,  slots: ['10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '04:00 PM', '04:30 PM'] },
  Tuesday:   { active: true,  slots: ['09:00 AM', '09:30 AM', '10:00 AM', '02:00 PM', '02:30 PM'] },
  Wednesday: { active: false, slots: [] },
  Thursday:  { active: true,  slots: ['11:00 AM', '11:30 AM', '03:00 PM', '03:30 PM', '04:00 PM'] },
  Friday:    { active: true,  slots: ['09:30 AM', '10:00 AM', '10:30 AM', '05:00 PM', '05:30 PM'] },
  Saturday:  { active: true,  slots: ['10:00 AM', '10:30 AM', '11:00 AM'] },
  Sunday:    { active: false, slots: [] },
};

export default function DoctorAvailabilityPage() {
  const [avail, setAvail] = useState(INIT_AVAIL);
  const [saved, setSaved] = useState(false);

  const toggleDay = (day: string) => {
    setAvail(a => ({ ...a, [day]: { ...a[day], active: !a[day].active, slots: a[day].active ? [] : a[day].slots } }));
    setSaved(false);
  };

  const toggleSlot = (day: string, slot: string) => {
    setAvail(a => {
      const slots = a[day].slots.includes(slot)
        ? a[day].slots.filter(s => s !== slot)
        : [...a[day].slots, slot];
      return { ...a, [day]: { ...a[day], slots } };
    });
    setSaved(false);
  };

  const totalSlots = Object.values(avail).reduce((a, d) => a + d.slots.length, 0);
  const activeDays = Object.values(avail).filter(d => d.active).length;

  return (
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div>
            <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Availability</h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Set your weekly consultation schedule</p>
          </div>
          <button onClick={() => setSaved(true)}
            className="flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-xl"
            style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
            {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Saved!' : 'Save Schedule'}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
            {[
              { icon: CheckCircle2, label: 'Active Days',   value: activeDays,  color: 'bg-emerald-500' },
              { icon: Clock,        label: 'Total Slots',   value: totalSlots,  color: 'bg-indigo-500' },
              { icon: XCircle,      label: 'Days Off',      value: 7 - activeDays, color: 'bg-slate-500' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="panel-card p-4 flex items-center gap-3">
                <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center`}>
                  <s.icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {DAYS.map((day, di) => (
              <motion.div key={day} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: di * 0.06 }}
                className="panel-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <button onClick={() => toggleDay(day)}
                      className={`relative w-11 h-6 rounded-full transition-colors duration-300 flex-shrink-0`}
                      style={{ background: avail[day].active ? '#127A6A' : 'rgba(255,255,255,0.1)' }}>
                      <motion.div animate={{ x: avail[day].active ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
                    </button>
                    <div>
                      <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{day}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {avail[day].active ? `${avail[day].slots.length} slots selected` : 'Day off'}
                      </p>
                    </div>
                  </div>
                  {avail[day].active && avail[day].slots.length > 0 && (
                    <span className="text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                      {avail[day].slots.length} slots open
                    </span>
                  )}
                </div>

                {avail[day].active && (
                  <div className="flex flex-wrap gap-2">
                    {SLOTS.map(slot => {
                      const selected = avail[day].slots.includes(slot);
                      return (
                        <button key={slot} onClick={() => toggleSlot(day, slot)}
                          className="px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all"
                          style={selected
                            ? { background: 'rgba(18,122,106,0.25)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                            : { color: 'var(--text-muted)', background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)' }}>
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </main>
      </div>
    );
}
