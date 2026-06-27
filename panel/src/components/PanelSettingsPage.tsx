'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings, Bell, Shield, Moon, Sun, Globe, Key, Trash2,
  CheckCircle2, User, Phone, Mail, Lock, Eye, EyeOff, Save
} from 'lucide-react';
import PanelSidebar from '@/components/PanelSidebar';
import { useTheme } from '@/components/ThemeProvider';

type Role = 'super_admin' | 'doctor' | 'hospital';

interface SettingsPageProps {
  role: Role;
  userName: string;
  userEmail: string;
  userPhone: string;
}

const SECTION = 'text-[10px] font-black uppercase tracking-widest mb-4';

export default function PanelSettingsPage({ role, userName, userEmail, userPhone }: SettingsPageProps) {
  const { theme, toggle } = useTheme();
  const [showPass, setShowPass] = useState(false);
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({
    emailLeads: true, emailAppts: true, smsAppts: false,
    whatsapp: true, browserPush: false,
  });
  const [profile, setProfile] = useState({ name: userName, email: userEmail, phone: userPhone });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });

  const inp = `w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all`;
  const inpStyle = { background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className="relative w-11 h-6 rounded-full flex-shrink-0 transition-colors duration-300"
      style={{ background: value ? '#127A6A' : 'rgba(255,255,255,0.1)' }}>
      <motion.div animate={{ x: value ? 22 : 2 }} transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" />
    </button>
  );

  const TABS = ['Profile', 'Notifications', 'Security', 'Appearance'];
  const [tab, setTab] = useState('Profile');

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--bg-app)' }}>
      <PanelSidebar role={role} userName={userName} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
          <div>
            <h1 className="font-extrabold text-lg flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <Settings className="w-5 h-5 text-emerald-400" /> Settings
            </h1>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Manage your account preferences</p>
          </div>
          <button onClick={handleSave}
            className="flex items-center gap-2 text-xs font-bold text-white px-4 py-2 rounded-xl"
            style={{ background: saved ? 'rgba(34,197,94,0.8)' : 'linear-gradient(135deg,#127A6A,#075E52)' }}>
            {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto panel-scroll p-6">
          {/* Tabs */}
          <div className="flex gap-1.5 mb-6 flex-wrap">
            {TABS.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                style={tab === t
                  ? { background: 'rgba(18,122,106,0.25)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                  : { color: 'var(--text-muted)', background: 'var(--bg-surface-2)', border: '1px solid var(--border-color)' }}>
                {t}
              </button>
            ))}
          </div>

          {/* Profile tab */}
          {tab === 'Profile' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel-card p-6 max-w-2xl">
              <p className={SECTION} style={{ color: 'var(--text-muted)' }}>Account Information</p>
              <div className="flex flex-col gap-4">
                {[
                  { label: 'Full Name',    icon: User,  key: 'name',  type: 'text' },
                  { label: 'Email',        icon: Mail,  key: 'email', type: 'email' },
                  { label: 'Phone Number', icon: Phone, key: 'phone', type: 'tel' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                    <div className="relative">
                      <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                      <input type={f.type} value={(profile as Record<string, string>)[f.key]}
                        onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                        className={`${inp} pl-9`} style={inpStyle} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Notifications tab */}
          {tab === 'Notifications' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel-card p-6 max-w-2xl">
              <p className={SECTION} style={{ color: 'var(--text-muted)' }}>Notification Preferences</p>
              <div className="flex flex-col gap-4">
                {[
                  { key: 'emailLeads', label: 'New Lead Alerts',       desc: 'Email when a new consultation lead comes in',    icon: Mail },
                  { key: 'emailAppts', label: 'Appointment Emails',    desc: 'Confirmation and reminder emails for appointments', icon: Bell },
                  { key: 'smsAppts',   label: 'SMS Reminders',         desc: 'SMS alerts 1 hour before scheduled appointments', icon: Phone },
                  { key: 'whatsapp',   label: 'WhatsApp Updates',      desc: 'Receive updates via WhatsApp',                   icon: Globe },
                  { key: 'browserPush',label: 'Browser Push',          desc: 'Real-time browser notifications',               icon: Bell },
                ].map(n => (
                  <div key={n.key} className="flex items-center justify-between gap-4 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                        <n.icon className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{n.label}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{n.desc}</p>
                      </div>
                    </div>
                    <Toggle value={(notifs as Record<string, boolean>)[n.key]} onChange={() => setNotifs(prev => ({ ...prev, [n.key]: !prev[n.key as keyof typeof prev] }))} />
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Security tab */}
          {tab === 'Security' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5 max-w-2xl">
              <div className="panel-card p-6">
                <p className={SECTION} style={{ color: 'var(--text-muted)' }}>Change Password</p>
                <div className="flex flex-col gap-4">
                  {[
                    { label: 'Current Password', key: 'current' },
                    { label: 'New Password',     key: 'newPass' },
                    { label: 'Confirm Password', key: 'confirm' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] font-bold uppercase tracking-wide block mb-1.5" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                        <input type={showPass ? 'text' : 'password'}
                          value={(passwords as Record<string, string>)[f.key]}
                          onChange={e => setPasswords(p => ({ ...p, [f.key]: e.target.value }))}
                          className={`${inp} pl-9 pr-9`} style={inpStyle} />
                        <button onClick={() => setShowPass(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
                          {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button className="flex items-center gap-2 text-xs font-bold text-white px-5 py-2.5 rounded-xl w-fit"
                    style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
                    <Key className="w-3.5 h-3.5" /> Update Password
                  </button>
                </div>
              </div>

              <div className="panel-card p-6 border border-red-500/20">
                <p className="text-[10px] font-black uppercase tracking-widest text-red-400 mb-3">Danger Zone</p>
                <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>Permanently delete your account and all data. This action cannot be undone.</p>
                <button className="flex items-center gap-2 text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-5 py-2.5 rounded-xl hover:bg-red-500/20 transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete Account
                </button>
              </div>
            </motion.div>
          )}

          {/* Appearance tab */}
          {tab === 'Appearance' && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="panel-card p-6 max-w-2xl">
              <p className={SECTION} style={{ color: 'var(--text-muted)' }}>Display Settings</p>
              <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3">
                  {theme === 'dark'
                    ? <Moon className="w-5 h-5 text-indigo-400" />
                    : <Sun className="w-5 h-5 text-amber-400" />}
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Theme</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Currently: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {(['dark', 'light'] as const).map(t => (
                    <button key={t} onClick={() => theme !== t && toggle()}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all capitalize"
                      style={theme === t
                        ? { background: 'rgba(18,122,106,0.25)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.3)' }
                        : { color: 'var(--text-muted)', background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)' }}>
                      {t === 'dark' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />} {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-sky-400" />
                  <div>
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Language</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Panel display language</p>
                  </div>
                </div>
                <select className="px-3 py-2 rounded-xl text-xs focus:outline-none" style={{ background: 'var(--bg-surface-3)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
                  <option>English</option>
                  <option>Hindi</option>
                </select>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}
