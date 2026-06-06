import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  Menu, Bell, CheckCircle2, XCircle, Clock, AlertTriangle,
  Building2, Star, Truck, MessageSquare, ChevronDown, FileText,
} from 'lucide-react';

const statusMeta = {
  approved: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', ring: 'ring-emerald-200', label: 'Approved' },
  pending:  { icon: Clock,        color: 'text-amber-500',   bg: 'bg-amber-50',   border: 'border-amber-200',   ring: 'ring-amber-200',   label: 'Awaiting' },
  rejected: { icon: XCircle,      color: 'text-red-500',     bg: 'bg-red-50',     border: 'border-red-200',     ring: 'ring-red-200',     label: 'Rejected' },
  waiting:  { icon: Clock,        color: 'text-gray-400',    bg: 'bg-gray-50',    border: 'border-gray-200',    ring: 'ring-gray-100',    label: 'Waiting' },
};

function StarRating({ value }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={10} className={i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </span>
  );
}

const fmt = n => Number(n).toLocaleString('en-IN');

export default function QuotationApprovalPage() {
  const { quotationId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [finalStatus, setFinalStatus] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Approval chain is local UI state seeded from the quotation's existing approval
  const [chain, setChain] = useState([]);

  useEffect(() => {
    api.get(`/quotations/rfq/${quotationId}`)
      .then(({ data }) => {
        // data may be an array; find the one matching quotationId
        const q = Array.isArray(data) ? data.find(q => q.id === quotationId) : data;
        setQuotation(q ?? null);
        if (q) {
          // Build chain from existing approval records + pending slot for current user
          const existing = (q.approvals ?? []).map((a, i) => ({
            id: a.id ?? i,
            name: a.approver?.name ?? 'Approver',
            role: a.approver?.role ?? '',
            initials: (a.approver?.name ?? 'AP').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
            status: a.status === 'APPROVED' ? 'approved' : a.status === 'REJECTED' ? 'rejected' : 'pending',
            remark: a.remarks ?? '',
            date: a.actionedAt ? new Date(a.actionedAt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '',
          }));
          // If no approvals yet, add a pending slot for current user
          if (existing.length === 0) {
            existing.push({
              id: 'current',
              name: user?.name ?? 'You',
              role: user?.role?.replace('_', ' ') ?? '',
              initials: (user?.name ?? 'YO').split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase(),
              status: 'pending',
              remark: '',
              date: 'Assigned now',
            });
          }
          setChain(existing);
        }
      })
      .catch(() => setError('Failed to load quotation.'))
      .finally(() => setLoading(false));
  }, [quotationId]);

  const handleAction = async (action) => {
    setSubmitting(true); setSubmitError(null);
    try {
      await api.post('/approvals', {
        quotationId,
        status: action === 'approved' ? 'APPROVED' : 'REJECTED',
        remarks,
      });
      const updated = chain.map((c, i) => {
        if (c.status === 'pending') return { ...c, status: action, remark: remarks, date: new Date().toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) };
        return c;
      });
      setChain(updated);
      setRemarks('');
      setFinalStatus(action);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to process approval.');
    } finally {
      setSubmitting(false);
    }
  };

  if (finalStatus) {
    const isApproved = finalStatus === 'approved';
    return (
      <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }} className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${isApproved ? 'bg-green-50' : 'bg-red-50'}`}>
            {isApproved ? <CheckCircle2 size={28} className="text-green-500" /> : <XCircle size={28} className="text-red-400" />}
          </div>
          <h2 className="text-lg font-bold text-gray-900">{isApproved ? 'Approved' : 'Rejected'}</h2>
          <p className="text-xs text-gray-500 text-center">
            {isApproved
              ? 'Quotation approved. A Purchase Order can now be generated.'
              : 'This quotation has been rejected and the vendor has been notified.'}
          </p>
          {isApproved && (
            <button
              onClick={() => navigate('/purchase-orders')}
              className="mt-1 px-6 py-2.5 rounded-lg text-sm font-semibold text-white w-full"
              style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)' }}>
              Go to Purchase Orders
            </button>
          )}
          <button onClick={() => navigate('/quotations')} className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
            Back to Quotations
          </button>
        </div>
      </div>
    );
  }

  const pendingIdx = chain.findIndex(c => c.status === 'pending');
  const activePending = chain[pendingIdx];

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }} className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500"><Menu size={20} /></button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Approval Workflow</h1>
              {quotation && (
                <p className="text-xs text-gray-500">
                  {quotation.rfq?.title}
                  <span className="mx-1.5 text-gray-300">·</span>
                  <span className="font-medium text-gray-700">{quotation.vendor?.org?.name}</span>
                  <span className="mx-1.5 text-gray-300">·</span>
                  <span className="font-semibold text-blue-600">₹{fmt(quotation.totalAmount)}</span>
                </p>
              )}
            </div>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-gray-50">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-16">Loading...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : !quotation ? (
            <p className="text-sm text-gray-400 text-center py-16">Quotation not found.</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* LEFT */}
              <div className="space-y-5">
                {/* Approval chain */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Approval Chain</p>
                  <div className="space-y-1">
                    {chain.map((approver, idx) => {
                      const meta = statusMeta[approver.status];
                      const Icon = meta.icon;
                      const isLast = idx === chain.length - 1;
                      const isExpanded = expandedId === approver.id;
                      return (
                        <div key={approver.id}>
                          <div className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ring-4 ${meta.ring}`}
                                style={{ background: approver.status === 'approved' ? '#10b981' : approver.status === 'rejected' ? '#ef4444' : approver.status === 'pending' ? '#f59e0b' : '#d1d5db' }}>
                                {approver.status === 'approved' ? <CheckCircle2 size={14} /> : approver.status === 'rejected' ? <XCircle size={14} /> : approver.initials.charAt(0)}
                              </div>
                              {!isLast && <div className={`w-0.5 flex-1 my-1 min-h-5 rounded-full ${approver.status === 'approved' ? 'bg-emerald-200' : 'bg-gray-100'}`} />}
                            </div>
                            <div className="flex-1 pb-3">
                              <div className="flex items-start justify-between gap-2 mb-0.5">
                                <div>
                                  <p className="text-xs font-semibold text-gray-800">{approver.name}</p>
                                  <p className="text-[10px] text-gray-400">{approver.role}</p>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}>
                                    <Icon size={9} />{meta.label}
                                  </span>
                                  {approver.remark && (
                                    <button onClick={() => setExpandedId(isExpanded ? null : approver.id)} className="p-1 rounded-md hover:bg-gray-100 text-gray-400 transition-colors">
                                      <ChevronDown size={12} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <p className="text-[10px] text-gray-400 mb-1">{approver.date}</p>
                              {isExpanded && approver.remark && (
                                <div className="mt-1.5 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
                                  <p className="text-[11px] text-gray-500 flex items-start gap-1.5">
                                    <MessageSquare size={10} className="text-gray-400 mt-0.5 shrink-0" />
                                    {approver.remark}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Remarks */}
                {activePending && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Remarks (optional)</label>
                    <textarea rows={4} value={remarks} onChange={e => setRemarks(e.target.value)}
                      placeholder="Add your comments or conditions..."
                      className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none" />
                    <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                      <AlertTriangle size={10} />Visible to all approvers in the chain.
                    </p>
                  </div>
                )}
                {!activePending && (
                  <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                    <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                    <p className="text-xs font-medium text-emerald-700">All approvers have reviewed this quotation.</p>
                  </div>
                )}
              </div>

              {/* RIGHT */}
              <div className="space-y-5">
                {/* Quotation summary */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">Quotation Summary</p>
                  <div className="space-y-3">
                    {[
                      { label: 'Vendor',   value: quotation.vendor?.org?.name ?? '—', icon: Building2 },
                      { label: 'Total',    value: `₹${fmt(quotation.totalAmount)}`,   icon: null, highlight: true },
                      { label: 'Delivery', value: quotation.deliveryDays ? `${quotation.deliveryDays} days` : '—', icon: Truck },
                      { label: 'Notes',    value: quotation.notes || '—', icon: null },
                    ].map(({ label, value, icon: Icon, highlight }) => (
                      <div key={label} className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
                        <div className="flex items-center gap-2">
                          {Icon && <Icon size={13} className="text-gray-400" />}
                          <span className="text-xs font-medium text-gray-500">{label}</span>
                        </div>
                        <span className={`text-xs font-semibold ${highlight ? 'text-blue-600 text-sm' : 'text-gray-800'}`}>{value}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between py-2.5">
                      <div className="flex items-center gap-2">
                        <Star size={13} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-500">Vendor Rating</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <StarRating value={quotation.vendor?.rating ?? 0} />
                        <span className="text-xs font-semibold text-gray-800">{quotation.vendor?.rating ?? '—'}/5</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                {activePending && (
                  <div className="bg-white rounded-xl border border-gray-100 p-5">
                    <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                      Awaiting: <span className="text-amber-600">{activePending.name}</span>
                    </p>
                    <p className="text-[10px] text-gray-400 mb-4">{activePending.role} · {activePending.date}</p>
                    {submitError && <p className="text-xs text-red-500 mb-3">{submitError}</p>}
                    <div className="flex gap-3">
                      <button onClick={() => handleAction('approved')} disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95 disabled:opacity-60"
                        style={{ background: 'linear-gradient(135deg,#059669 0%,#10b981 100%)' }}>
                        <CheckCircle2 size={15} />{submitting ? 'Processing...' : 'Approve'}
                      </button>
                      <button onClick={() => handleAction('rejected')} disabled={submitting}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-all active:scale-95 disabled:opacity-60">
                        <XCircle size={15} />Reject
                      </button>
                    </div>
                  </div>
                )}

                {/* Activity log */}
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Activity Timeline</p>
                  <div className="space-y-3">
                    {chain.filter(c => c.status !== 'waiting').map(c => {
                      const meta = statusMeta[c.status];
                      const Icon = meta.icon;
                      return (
                        <div key={c.id} className="flex items-start gap-2.5">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${meta.bg}`}>
                            <Icon size={11} className={meta.color} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-700">
                              {c.name} <span className={`font-normal ${meta.color}`}>{meta.label.toLowerCase()}</span>
                            </p>
                            <p className="text-[10px] text-gray-400">{c.date}</p>
                            {c.remark && <p className="text-[10px] text-gray-500 mt-0.5 italic">"{c.remark}"</p>}
                          </div>
                        </div>
                      );
                    })}
                    <div className="flex items-start gap-2.5">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-blue-50">
                        <FileText size={11} className="text-blue-500" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-700">Quotation submitted for approval</p>
                        <p className="text-[10px] text-gray-400">
                          {quotation.submittedAt ? new Date(quotation.submittedAt).toLocaleString('en-IN', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
