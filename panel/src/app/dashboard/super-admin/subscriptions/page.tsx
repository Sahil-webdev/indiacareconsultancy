'use client';

import React, { useEffect, useState } from 'react';
import { panelApi } from '@/lib/api';
import { Loader2, Save } from 'lucide-react';

type Plan = {
  id: number;
  plan_key: string;
  label: string;
  amount: number;
  duration_days: number;
  description: string | null;
};

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [message, setMessage] = useState('');

  async function loadPlans() {
    const response = await panelApi<{ plans: Plan[] }>('/api/subscriptions');
    setPlans(response.plans);
    setLoading(false);
  }

  useEffect(() => {
    void (async () => {
      try {
        await loadPlans();
      } catch {
        setLoading(false);
      }
    })();
  }, []);

  async function savePlan(plan: Plan) {
    setSavingKey(plan.plan_key);
    setMessage('');
    await panelApi(`/api/subscriptions/${plan.plan_key}`, {
      method: 'PATCH',
      body: JSON.stringify({
        amount: plan.amount,
        durationDays: plan.duration_days,
        description: plan.description,
      }),
    });
    setSavingKey('');
    setMessage(`${plan.label} updated successfully.`);
    await loadPlans();
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'var(--bg-surface)' }}>
        <div>
          <h1 className="font-extrabold text-lg" style={{ color: 'var(--text-primary)' }}>Plans & Subscriptions</h1>
          <p className="text-[11px]" style={{ color: '#64748B' }}>Amounts changed here immediately affect doctor and hospital panel payments.</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto panel-scroll p-6">
        {loading ? <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div> : null}
        {message ? <div className="mb-4 rounded-2xl px-4 py-3 text-sm font-semibold" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#4ade80' }}>{message}</div> : null}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div key={plan.plan_key} className="panel-card p-5 flex flex-col gap-4">
              <div>
                <p className="font-extrabold text-base" style={{ color: 'var(--text-primary)' }}>{plan.label}</p>
                <p className="text-[11px]" style={{ color: '#64748B' }}>{plan.plan_key}</p>
              </div>

              <label>
                <span className="text-[11px] font-semibold block mb-2" style={{ color: '#64748B' }}>Amount</span>
                <input type="number" value={plan.amount} onChange={(e) => setPlans((current) => current.map((item) => item.plan_key === plan.plan_key ? { ...item, amount: Number(e.target.value) } : item))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </label>

              <label>
                <span className="text-[11px] font-semibold block mb-2" style={{ color: '#64748B' }}>Duration (days)</span>
                <input type="number" value={plan.duration_days} onChange={(e) => setPlans((current) => current.map((item) => item.plan_key === plan.plan_key ? { ...item, duration_days: Number(e.target.value) } : item))}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </label>

              <label>
                <span className="text-[11px] font-semibold block mb-2" style={{ color: '#64748B' }}>Description</span>
                <textarea value={plan.description || ''} onChange={(e) => setPlans((current) => current.map((item) => item.plan_key === plan.plan_key ? { ...item, description: e.target.value } : item))}
                  rows={4} className="w-full px-3.5 py-2.5 rounded-xl text-sm focus:outline-none resize-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-primary)' }} />
              </label>

              <button onClick={() => savePlan(plan)} disabled={savingKey === plan.plan_key}
                className="mt-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg,#127A6A,#075E52)' }}>
                {savingKey === plan.plan_key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Plan
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
