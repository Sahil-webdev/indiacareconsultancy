'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Edit2, Trash2, Check, X,
  ToggleLeft, ToggleRight, Mail, Phone, Shield,
  Clock, ChevronDown,
} from 'lucide-react';

const ROLES = ['Consultant', 'Senior Consultant', 'Support Executive', 'Operations Manager', 'Content Manager'];

const INITIAL_EMPLOYEES = [
  { id: 'E001', name: 'Priya Sharma', role: 'Senior Consultant', email: 'priya@icc.in', phone: '98765 00001', city: 'Delhi', active: true, lastLogin: '2 hrs ago', leadsAssigned: 12, joinedAt: 'Jan 2025' },
  { id: 'E002', name: 'Amit Rathore', role: 'Consultant', email: 'amit@icc.in', phone: '98765 00002', city: 'Delhi', active: true, lastLogin: '5 hrs ago', leadsAssigned: 8, joinedAt: 'Mar 2025' },
  { id: 'E003', name: 'Neha Kapoor', role: 'Consultant', email: 'neha@icc.in', phone: '98765 00003', city: 'Mumbai', active: true, lastLogin: 'Yesterday', leadsAssigned: 7, joinedAt: 'Feb 2025' },
  { id: 'E004', name: 'Rohit Saxena', role: 'Operations Manager', email: 'rohit@icc.in', phone: '98765 00004', city: 'Delhi', active: true, lastLogin: '1 hr ago', leadsAssigned: 0, joinedAt: 'Nov 2024' },
  { id: 'E005', name: 'Simran Batra', role: 'Support Executive', email: 'simran@icc.in', phone: '98765 00005', city: 'Noida', active: false, lastLogin: '3 days ago', leadsAssigned: 3, joinedAt: 'Apr 2025' },
];

const ROLE_COLORS: Record<string, string> = {
  'Senior Consultant': 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  'Consultant': 'text-sky-400 bg-sky-500/10 border-sky-500/20',
  'Operations Manager': 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  'Support Executive': 'text-slate-400 bg-slate-500/10 border-slate-500/20',
  'Content Manager': 'text-rose-400 bg-rose-500/10 border-rose-500/20',
};

type Employee = typeof INITIAL_EMPLOYEES[0];

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: '', role: 'Consultant', email: '', phone: '', city: '' });

  const filtered = employees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.role.toLowerCase().includes(search.toLowerCase()) ||
    e.city.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (id: string) => setEmployees(prev => prev.map(e => e.id === id ? { ...e, active: !e.active } : e));
  const deleteEmp = (id: string) => { setEmployees(prev => prev.filter(e => e.id !== id)); setDeleteConfirm(null); };

  const addEmployee = () => {
    if (!draft.name.trim() || !draft.email.trim()) return;
    const newEmp: Employee = {
      id: `E${String(Date.now()).slice(-3)}`, ...draft,
      active: true, lastLogin: 'Never', leadsAssigned: 0, joinedAt: 'Jul 2025',
    };
    setEmployees(prev => [...prev, newEmp]);
    setDraft({ name: '', role: 'Consultant', email: '', phone: '', city: '' });
    setShowAdd(false);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>ICC Employees</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Manage internal staff — consultants, managers & support team</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl"
          style={{ background: 'rgba(37,184,154,0.15)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.25)' }}>
          <Plus className="w-3.5 h-3.5" /> Add Employee
        </button>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Staff', value: employees.length, color: 'bg-sky-500' },
            { label: 'Active', value: employees.filter(e => e.active).length, color: 'bg-emerald-500' },
            { label: 'Consultants', value: employees.filter(e => e.role.includes('Consultant')).length, color: 'bg-violet-500' },
            { label: 'Leads Assigned', value: employees.reduce((a, e) => a + e.leadsAssigned, 0), color: 'bg-amber-500' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center flex-shrink-0`}>
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{s.value}</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search employees…"
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
        </div>

        {/* Add Employee Form */}
        <AnimatePresence>
          {showAdd && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="panel-card p-5 mb-4 overflow-hidden" style={{ border: '1px solid rgba(37,184,154,0.25)' }}>
              <p className="font-bold text-sm mb-3" style={{ color: '#25B89A' }}>Invite New Employee</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { key: 'name', label: 'Full Name *', placeholder: 'Rahul Gupta' },
                  { key: 'email', label: 'Email *', placeholder: 'rahul@icc.in' },
                  { key: 'phone', label: 'Phone', placeholder: '98765 XXXXX' },
                  { key: 'city', label: 'City', placeholder: 'Delhi' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>{f.label}</label>
                    <input value={(draft as any)[f.key]} onChange={e => setDraft(d => ({ ...d, [f.key]: e.target.value }))} placeholder={f.placeholder}
                      className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
                  </div>
                ))}
                <div>
                  <label className="text-[10px] font-semibold block mb-1" style={{ color: '#64748B' }}>Role</label>
                  <select value={draft.role} onChange={e => setDraft(d => ({ ...d, role: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl text-xs focus:outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={addEmployee} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.25)' }}>
                  <Check className="w-3.5 h-3.5" /> Send Invite
                </button>
                <button onClick={() => setShowAdd(false)} className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#64748B' }}>
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Employee Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((emp, i) => (
            <motion.div key={emp.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className={`panel-card p-5 ${!emp.active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{ background: 'rgba(37,184,154,0.15)', color: '#25B89A' }}>
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{emp.name}</p>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${ROLE_COLORS[emp.role] ?? 'text-slate-400 bg-slate-500/10 border-slate-500/20'}`}>
                      {emp.role}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => toggle(emp.id)}>
                    {emp.active
                      ? <ToggleRight className="w-6 h-6 text-emerald-400" />
                      : <ToggleLeft className="w-6 h-6" style={{ color: '#475569' }} />}
                  </button>
                  {deleteConfirm === emp.id ? (
                    <>
                      <button onClick={() => deleteEmp(emp.id)} className="w-6 h-6 rounded-md bg-red-500/20 flex items-center justify-center"><Check className="w-3 h-3 text-red-400" /></button>
                      <button onClick={() => setDeleteConfirm(null)} className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center"><X className="w-3 h-3" style={{ color: '#64748B' }} /></button>
                    </>
                  ) : (
                    <button onClick={() => setDeleteConfirm(emp.id)} className="w-6 h-6 rounded-md hover:bg-red-500/10 flex items-center justify-center" style={{ color: '#64748B' }}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3 space-y-1.5">
                <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#64748B' }}><Mail className="w-3 h-3" />{emp.email}</p>
                <p className="text-[11px] flex items-center gap-1.5" style={{ color: '#64748B' }}><Phone className="w-3 h-3" />{emp.phone} · {emp.city}</p>
                <div className="flex items-center gap-3 pt-1 border-t" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  <span className="text-[10px]" style={{ color: '#64748B' }}>
                    <Clock className="w-3 h-3 inline mr-1" />Last login: {emp.lastLogin}
                  </span>
                  <span className="text-[10px]" style={{ color: '#64748B' }}>
                    {emp.leadsAssigned} leads assigned
                  </span>
                  <span className="text-[10px] ml-auto" style={{ color: '#475569' }}>Joined {emp.joinedAt}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
