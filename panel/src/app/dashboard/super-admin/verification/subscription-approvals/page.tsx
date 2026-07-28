'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { panelApi } from '@/lib/api';
import {
  CheckCircle2, XCircle, Clock, Search, Loader2, Copy, Check, Eye,
  Building2, User, Image as ImageIcon, Zap, AlertCircle, ShieldCheck, DollarSign, Sparkles, X
} from 'lucide-react';

type SubscriptionRequest = {
  id: number;
  user_id: number;
  entity_type: 'doctor' | 'hospital';
  entity_id: number;
  amount: number;
  status: 'Pending' | 'Paid' | 'Failed';
  payment_method: string;
  utr_number: string;
  screenshot_url?: string;
  created_at: string;
  paid_at?: string;
  entity_name: string;
  entity_detail: string;
  user_email: string;
};

export default function SubscriptionApprovalsPage() {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function loadRequests() {
    setLoading(true);
    try {
      const response = await panelApi<{ requests: SubscriptionRequest[] }>('/api/subscriptions/requests');
      setRequests(response.requests || []);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load subscription requests');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  const handleApprove = async (id: number) => {
    setActionLoadingId(id);
    setErrorMsg('');
    try {
      await panelApi(`/api/subscriptions/requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'approve' }),
      });
      setToastMsg('Subscription approved & activated for 30 days successfully!');
      setTimeout(() => setToastMsg(''), 4000);
      await loadRequests();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to approve subscription');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoadingId(id);
    setErrorMsg('');
    try {
      await panelApi(`/api/subscriptions/requests/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: 'reject' }),
      });
      setToastMsg('Subscription request marked as rejected.');
      setTimeout(() => setToastMsg(''), 4000);
      await loadRequests();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to reject subscription');
    } finally {
      setActionLoadingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(text);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const filteredRequests = requests.filter(r =>
    r.entity_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.utr_number?.toLowerCase().includes(search.toLowerCase()) ||
    r.user_email?.toLowerCase().includes(search.toLowerCase())
  );

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => r.status === 'Paid').length;
  const totalCollected = requests.filter(r => r.status === 'Paid').reduce((acc, r) => acc + Number(r.amount), 0);

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-color)' }}>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-extrabold text-lg text-white">UPI Subscription Payment Approvals</h1>
            <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> {pendingCount} Pending Verification
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">Verify doctor &amp; hospital UPI UTR numbers to activate monthly subscription plans</p>
        </div>
      </header>

      {/* Alert Banners */}
      <div className="px-6 pt-4">
        {toastMsg && (
          <div className="flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> {toastMsg}
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="panel-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{pendingCount}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Pending UTR Approvals</p>
            </div>
          </div>

          <div className="panel-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-white">{approvedCount}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Active Subscriptions Approved</p>
            </div>
          </div>

          <div className="panel-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xl font-black text-emerald-400">₹{totalCollected.toLocaleString('en-IN')}</p>
              <p className="text-[10px] font-bold text-slate-400 uppercase">Total Revenue Collected</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-white/10">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by doctor name, UTR number, or email..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
        </div>

        {/* Requests Table */}
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="panel-card p-12 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-40" />
            <p className="text-sm font-bold text-white">No Subscription Requests Found</p>
            <p className="text-xs text-slate-400">All doctor and hospital UPI subscription payments are up to date.</p>
          </div>
        ) : (
          <div className="panel-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-slate-950/60 text-slate-400 uppercase text-[10px] font-black">
                    <th className="px-5 py-3.5">Doctor / Entity</th>
                    <th className="px-5 py-3.5">Plan &amp; Amount</th>
                    <th className="px-5 py-3.5">UTR / Ref Number</th>
                    <th className="px-5 py-3.5">Payment Receipt</th>
                    <th className="px-5 py-3.5">Date Submitted</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredRequests.map(req => (
                    <tr key={req.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                            {req.entity_type === 'doctor' ? <User className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="font-extrabold text-white">{req.entity_name || req.user_email}</p>
                            <p className="text-[10px] text-slate-400">{req.entity_detail || req.user_email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-black text-emerald-400">
                        ₹{Number(req.amount).toLocaleString('en-IN')}
                        <span className="text-[10px] text-slate-400 font-normal block">Monthly Subscription</span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-white">
                          <span>{req.utr_number}</span>
                          <button
                            onClick={() => copyToClipboard(req.utr_number)}
                            className="p-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                            title="Copy UTR Number"
                          >
                            {copiedUtr === req.utr_number ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {req.screenshot_url ? (
                          <button
                            onClick={() => setPreviewImage(req.screenshot_url || null)}
                            className="flex items-center gap-1.5 text-sky-400 hover:text-sky-300 font-bold bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-xl"
                          >
                            <ImageIcon className="w-3.5 h-3.5" /> View Receipt
                          </button>
                        ) : (
                          <span className="text-slate-500 text-[10px] italic">No receipt file</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-400 text-[11px]">
                        {new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="px-5 py-4">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full border ${
                          req.status === 'Paid'
                            ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                            : req.status === 'Failed'
                              ? 'bg-red-500/20 text-red-400 border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        }`}>
                          {req.status === 'Paid' ? 'Approved & Paid' : req.status === 'Failed' ? 'Rejected' : 'Pending UTR Verification'}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        {req.status === 'Pending' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleApprove(req.id)}
                              disabled={actionLoadingId === req.id}
                              className="px-3 py-1.5 rounded-xl text-xs font-black text-slate-950 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 transition-all flex items-center gap-1 shadow-md shadow-emerald-500/10"
                            >
                              {actionLoadingId === req.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              disabled={actionLoadingId === req.id}
                              className="px-3 py-1.5 rounded-xl text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all flex items-center gap-1"
                            >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-500">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Image Preview Modal */}
      <AnimatePresence>
        {previewImage && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative max-w-xl w-full bg-slate-900 border border-white/20 rounded-3xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-emerald-400" /> Payment Receipt Screenshot
                </span>
                <button onClick={() => setPreviewImage(null)} className="p-1 rounded-full text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <img src={previewImage} alt="Payment receipt preview" className="w-full max-h-[70vh] object-contain rounded-2xl border border-white/10" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
