'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  Clock,
  Loader2,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { panelApi } from '@/lib/api';

type Employee = {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string;
  city: string;
  role: string;
  department: string;
  active: boolean;
  status: string;
  lastLogin: string | null;
  leadsAssigned: number;
  joinedAt: string;
  createdAt: string;
};

const ROLES = ['Consultant', 'Senior Consultant', 'Support Executive', 'Operations Manager', 'Content Manager'];
const EMPLOYEE_ACTIONS = ['Edit Employee', 'Activate Employee', 'Deactivate Employee', 'Resend Invite', 'Delete Employee'] as const;

function formatDateTime(value: string | null) {
  if (!value) return 'Never';
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function ThreeDotMenu({
  employee,
  onAction,
}: {
  employee: Employee;
  onAction: (action: typeof EMPLOYEE_ACTIONS[number], employee: Employee) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });

  useEffect(() => {
    function handler(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    function updatePosition() {
      if (!buttonRef.current) return;
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + 8, right: Math.max(16, window.innerWidth - rect.right) });
    }
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button ref={buttonRef} onClick={() => setOpen((current) => !current)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/8 transition-colors" style={{ color: '#64748B' }}>
        <MoreVertical className="w-3.5 h-3.5" />
      </button>
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 4 }}
              transition={{ duration: 0.13 }}
              className="fixed z-[9999] rounded-2xl border shadow-2xl overflow-hidden"
              style={{ top: menuPosition.top, right: menuPosition.right, background: 'var(--bg-surface)', borderColor: 'var(--border-color)', minWidth: 220 }}
            >
              {EMPLOYEE_ACTIONS.map((action) => (
                <button
                  key={action}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-left transition-colors hover:bg-white/5"
                  style={{ color: action === 'Delete Employee' ? '#f87171' : 'var(--text-secondary)' }}
                  onClick={() => {
                    setOpen(false);
                    onAction(action, employee);
                  }}
                >
                  {action}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}

function BaseModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <div className="w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>{title}</h3>
          <button onClick={onClose} style={{ color: '#64748B' }}><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

const EMPTY_FORM = { name: '', email: '', phone: '', city: '', role: 'Consultant', department: 'Operations', password: 'Welcome@123' };

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);

  async function loadEmployees() {
    try {
      setLoading(true);
      const response = await panelApi<{ employees: Employee[] }>('/api/employees');
      setEmployees(response.employees || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (!success) return;
    const timer = window.setTimeout(() => setSuccess(''), 3000);
    return () => window.clearTimeout(timer);
  }, [success]);

  const filtered = useMemo(() => employees.filter((employee) => {
    const haystack = `${employee.name} ${employee.role} ${employee.city} ${employee.email}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  }), [employees, search]);

  async function saveEmployee() {
    try {
      setSaving(true);
      setError('');
      if (editingEmployee) {
        await panelApi(`/api/employees/${editingEmployee.id}`, {
          method: 'PATCH',
          body: JSON.stringify(form),
        });
        setSuccess('Employee updated successfully');
      } else {
        await panelApi('/api/employees', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setSuccess('Employee invited successfully');
      }
      setShowAdd(false);
      setEditingEmployee(null);
      setForm(EMPTY_FORM);
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save employee');
    } finally {
      setSaving(false);
    }
  }

  async function runEmployeeAction(employeeId: string, action: string, message: string) {
    try {
      setSaving(true);
      setError('');
      if (action === 'delete') {
        await panelApi(`/api/employees/${employeeId}`, { method: 'DELETE' });
      } else {
        await panelApi(`/api/employees/${employeeId}/actions`, {
          method: 'POST',
          body: JSON.stringify({ action }),
        });
      }
      setSuccess(message);
      await loadEmployees();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Employee action failed');
    } finally {
      setSaving(false);
    }
  }

  function handleAction(action: typeof EMPLOYEE_ACTIONS[number], employee: Employee) {
    if (action === 'Edit Employee') {
      setEditingEmployee(employee);
      setForm({
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        city: employee.city,
        role: employee.role,
        department: employee.department || 'Operations',
        password: 'Welcome@123',
      });
      setShowAdd(true);
      return;
    }
    if (action === 'Activate Employee') return runEmployeeAction(employee.id, 'activate', 'Employee activated successfully');
    if (action === 'Deactivate Employee') return runEmployeeAction(employee.id, 'deactivate', 'Employee deactivated successfully');
    if (action === 'Resend Invite') return runEmployeeAction(employee.id, 'resend_invite', 'Invite reminder sent successfully');
    if (action === 'Delete Employee') return runEmployeeAction(employee.id, 'delete', 'Employee deleted successfully');
  }

  const activeCount = employees.filter((item) => item.active).length;
  const consultantCount = employees.filter((item) => item.role.includes('Consultant')).length;
  const totalLeads = employees.reduce((sum, item) => sum + item.leadsAssigned, 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>ICC Employees</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Manage internal staff, invites, status, and access</p>
        </div>
        <button onClick={() => { setEditingEmployee(null); setForm(EMPTY_FORM); setShowAdd(true); }} className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl" style={{ background: 'rgba(37,184,154,0.15)', color: '#25B89A', border: '1px solid rgba(37,184,154,0.25)' }}>
          <Plus className="w-3.5 h-3.5" /> Add Employee
        </button>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        {success && <div className="mb-4 rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>{success}</div>}
        {error && <div className="mb-4 rounded-2xl px-4 py-3 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>{error}</div>}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Staff', value: employees.length, color: 'bg-sky-500' },
            { label: 'Active', value: activeCount, color: 'bg-emerald-500' },
            { label: 'Consultants', value: consultantCount, color: 'bg-violet-500' },
            { label: 'Leads Assigned', value: totalLeads, color: 'bg-amber-500' },
          ].map((item) => (
            <div key={item.label} className="panel-card p-4 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                <Users className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xl font-extrabold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
                <p className="text-[10px]" style={{ color: '#64748B' }}>{item.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="panel-card overflow-visible">
          <div className="flex items-center gap-3 p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: '#64748B' }} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees..." className="w-full pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
            </div>
            <button onClick={loadEmployees} className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors hover:bg-white/10" style={{ color: '#64748B' }}>
              <RefreshCw className="w-4 h-4" />
            </button>
            <span className="text-xs ml-auto" style={{ color: '#64748B' }}>{filtered.length} employees</span>
          </div>

          {loading ? (
            <div className="p-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>
          ) : (
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {['Employee', 'Contact', 'Role', 'Department', 'Status', 'Last Login', 'Leads', 'Joined', 'Actions'].map((heading) => (
                      <th key={heading} className="px-4 py-3 text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: '#2D4150' }}>{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((employee) => (
                    <tr key={employee.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: 'rgba(255,255,255,0.04)' }}>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{employee.name}</p>
                        <p className="text-[10px]" style={{ color: '#64748B' }}>EMP-{employee.id}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="flex items-center gap-1" style={{ color: '#94A3B8' }}><Mail className="w-3 h-3" />{employee.email}</p>
                        <p className="flex items-center gap-1 mt-0.5" style={{ color: '#64748B' }}><Phone className="w-3 h-3" />{employee.phone || 'No phone'} · {employee.city || 'No city'}</p>
                      </td>
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-primary)' }}>{employee.role}</td>
                      <td className="px-4 py-3.5" style={{ color: '#94A3B8' }}>{employee.department || 'Operations'}</td>
                      <td className="px-4 py-3.5"><span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${employee.active ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/15 text-slate-400 border border-slate-500/20'}`}>{employee.status}</span></td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#64748B' }}>{formatDateTime(employee.lastLogin)}</td>
                      <td className="px-4 py-3.5" style={{ color: 'var(--text-primary)' }}>{employee.leadsAssigned}</td>
                      <td className="px-4 py-3.5 whitespace-nowrap" style={{ color: '#64748B' }}>{formatDateTime(employee.joinedAt)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleAction('Edit Employee', employee)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-white/5 transition-colors" style={{ color: '#25B89A' }}>
                            <Users className="w-3.5 h-3.5" />
                          </button>
                          <ThreeDotMenu employee={employee} onAction={handleAction} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {showAdd && (
          <BaseModal title={editingEmployee ? `Edit Employee · ${editingEmployee.name}` : 'Add Employee'} onClose={() => { setShowAdd(false); setEditingEmployee(null); }}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {[
                ['name', 'Full name'],
                ['email', 'Email'],
                ['phone', 'Phone'],
                ['city', 'City'],
                ['department', 'Department'],
                ['password', 'Temporary password'],
              ].map(([key, label]) => (
                <input
                  key={key}
                  value={(form as Record<string, string>)[key]}
                  onChange={(event) => setForm((prev) => ({ ...prev, [key]: event.target.value }))}
                  placeholder={label}
                  className="w-full rounded-xl px-3 py-2 text-sm"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}
                />
              ))}
              <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))} className="w-full rounded-xl px-3 py-2 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }}>
                {ROLES.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </div>
            <button onClick={saveEmployee} disabled={saving || !form.name || !form.email} className="mt-4 px-4 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-60" style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
              {saving ? 'Saving...' : editingEmployee ? 'Save Employee' : 'Send Invite'}
            </button>
          </BaseModal>
        )}
      </main>
    </div>
  );
}
