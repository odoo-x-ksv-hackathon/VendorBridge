import { useState, useEffect } from 'react';
import api from '../lib/axios';
import VendorSidebar from '../components/VendorSidebar';
import {
  Menu, Bell, Search, FileText, Calendar, Building2, Eye,
  ChevronLeft, ChevronRight, Clock, CheckCircle2, AlertCircle,
  FileX, X, Trash2, Plus, Check, Send, Edit2,
} from 'lucide-react';

const statusConfig = {
  OPEN:      { label: 'Open',      color: '#3b82f6', bg: '#eff6ff', icon: Clock },
  CLOSED:    { label: 'Closed',    color: '#10b981', bg: '#d1fae5', icon: CheckCircle2 },
  DRAFT:     { label: 'Draft',     color: '#6b7280', bg: '#f3f4f6', icon: FileX },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2', icon: AlertCircle },
};

const PAGE_SIZE = 10;
const fmt = n => Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });

function StatusBadge({ status }) {
  const cfg = statusConfig[status] ?? statusConfig.OPEN;
  const Icon = cfg.icon;
  return (
    <span className="flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ color: cfg.color, background: cfg.bg }}>
      <Icon size={10} />{cfg.label}
    </span>
  );
}

/* ─── Quote Modal ──────────────────────────────────────────────────────── */
function QuoteModal({ rfq, existingQuote, onClose, onSuccess }) {
  const isRevision = !!existingQuote;

  const [rows, setRows] = useState(
    rfq.items.map(item => ({
      rfqItemId: item.id,
      productName: item.productName,
      qty: Number(item.quantity),
      unit: item.unit ?? '',
      unitPrice: existingQuote?.items?.find(q => q.rfqItemId === item.id)?.unitPrice ?? '',
    }))
  );
  const [gst, setGst] = useState('18');
  const [notes, setNotes] = useState(existingQuote?.notes ?? '');
  const [deliveryDays, setDeliveryDays] = useState(existingQuote?.deliveryDays ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const updatePrice = (rfqItemId, val) =>
    setRows(p => p.map(r => r.rfqItemId === rfqItemId ? { ...r, unitPrice: val } : r));

  const subtotal = rows.reduce((s, r) => s + (parseFloat(r.unitPrice) || 0) * r.qty, 0);
  const gstAmt = subtotal * (parseFloat(gst) || 0) / 100;
  const grandTotal = subtotal + gstAmt;

  const handleSubmit = async () => {
    if (rows.some(r => !r.unitPrice || isNaN(parseFloat(r.unitPrice)))) {
      setError('Please enter a valid price for all items.'); return;
    }
    setSubmitting(true); setError(null);
    try {
      const payload = {
        deliveryDays: deliveryDays ? Number(deliveryDays) : undefined,
        notes,
        items: rows.map(r => ({ rfqItemId: r.rfqItemId, unitPrice: parseFloat(r.unitPrice) })),
      };
      if (isRevision) {
        await api.put(`/quotations/${existingQuote.id}`, payload);
      } else {
        await api.post('/quotations', { rfqId: rfq.id, ...payload });
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quotation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl shadow-xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-900 text-sm">{isRevision ? 'Revise Quotation' : 'Submit Quotation'}</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {rfq.title}
              <span className="mx-1.5 text-gray-300">·</span>
              Deadline <span className="font-medium text-red-500">
                {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
              </span>
            </p>
          </div>
          <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* RFQ banner */}
          <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3 flex items-start gap-3">
            <FileText size={15} className="text-purple-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-purple-800 mb-0.5">RFQ from {rfq.org?.name}</p>
              <p className="text-xs text-purple-600">{rfq.description || `${rfq.items.length} items requested`}</p>
            </div>
          </div>

          {/* Line items table */}
          <div className="bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Your Quotation</h3>
              <span className="text-[11px] font-medium text-gray-400">{rows.length} item{rows.length !== 1 ? 's' : ''}</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    {['Item', 'Qty', 'Unit', 'Unit Price (₹)', 'Total (₹)'].map(h => (
                      <th key={h} className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => {
                    const total = (parseFloat(row.unitPrice) || 0) * row.qty;
                    return (
                      <tr key={row.rfqItemId} className="border-t border-gray-100 bg-white">
                        <td className="px-4 py-2.5 text-xs font-medium text-gray-700">{row.productName}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-600">{row.qty}</td>
                        <td className="px-4 py-2.5 text-xs text-gray-500">{row.unit || '—'}</td>
                        <td className="px-4 py-2.5">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">₹</span>
                            <input type="number" value={row.unitPrice} min={0} step="0.01"
                              onChange={e => updatePrice(row.rfqItemId, e.target.value)}
                              className="w-32 pl-6 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 bg-white transition-all"
                              placeholder="0.00" />
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-semibold text-gray-700">
                            {total > 0 ? `₹${fmt(total)}` : <span className="text-gray-300 font-normal">—</span>}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Tax / Notes / Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Tax / GST %</label>
                  <div className="flex items-center gap-2">
                    <input type="number" value={gst} onChange={e => setGst(e.target.value)} min={0} max={100}
                      className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all" />
                    <span className="text-sm font-semibold text-gray-400">%</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Delivery Days</label>
                  <input type="number" value={deliveryDays} onChange={e => setDeliveryDays(e.target.value)} min={1}
                    className="w-24 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all"
                    placeholder="e.g. 7" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Notes / Terms</label>
                  <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all resize-none"
                    placeholder="Payment terms, warranty, delivery conditions..." />
                </div>
              </div>
            </div>

            {/* Right: price summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-between">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Price Summary</h3>
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm font-semibold text-gray-800">₹{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">GST ({gst || 0}%)</span>
                  <span className="text-sm font-semibold text-gray-800">₹{fmt(gstAmt)}</span>
                </div>
                <div className="h-px bg-gray-100" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Grand Total</span>
                  <span className="text-base font-bold" style={{ color: '#7c3aed' }}>₹{fmt(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100 shrink-0 flex gap-3">
          <button onClick={handleSubmit} disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#7c3aed 0%,#a78bfa 100%)' }}>
            <Check size={15} />{submitting ? 'Submitting...' : isRevision ? 'Revise Quotation' : 'Submit Quotation'}
          </button>
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── RFQ Detail Modal ─────────────────────────────────────────────────── */
function RFQDetailModal({ rfq, onClose, onQuoteSubmitted }) {
  const [existingQuote, setExistingQuote] = useState(null);
  const [loadingQuote, setLoadingQuote] = useState(true);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    api.get(`/quotations/my/${rfq.id}`)
      .then(({ data }) => { if (data) setExistingQuote(data); })
      .catch(() => {})
      .finally(() => setLoadingQuote(false));
  }, [rfq.id]);

  const canQuote = rfq.status === 'OPEN';

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
            <h2 className="font-bold text-gray-900 text-sm">RFQ Details</h2>
            <button onClick={onClose}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-gray-900 text-sm">{rfq.title}</p>
                <p className="text-[10px] text-blue-500 font-mono mt-0.5">{rfq.id}</p>
                {rfq.description && <p className="text-xs text-gray-500 mt-1">{rfq.description}</p>}
              </div>
              <StatusBadge status={rfq.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              {[
                ['Buyer', rfq.org?.name ?? '—'],
                ['Deadline', rfq.deadline ? new Date(rfq.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'],
                ['Items', `${rfq.items?.length ?? 0} line items`],
              ].map(([label, val]) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                  <p className="text-xs text-gray-800">{val}</p>
                </div>
              ))}
            </div>

            {rfq.items?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Required Items</p>
                <div className="border border-gray-100 rounded-lg overflow-hidden">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-gray-50 border-b border-gray-100">
                      {['Product', 'Qty', 'Unit', 'Notes'].map(h => (
                        <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">{h}</th>
                      ))}
                    </tr></thead>
                    <tbody>
                      {rfq.items.map(item => (
                        <tr key={item.id} className="border-t border-gray-50">
                          <td className="px-3 py-2 text-gray-700 font-medium">{item.productName}</td>
                          <td className="px-3 py-2 text-gray-600">{item.quantity}</td>
                          <td className="px-3 py-2 text-gray-600">{item.unit ?? '—'}</td>
                          <td className="px-3 py-2 text-gray-400">{item.notes ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {rfq.attachments?.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Attachments</p>
                <div className="space-y-1.5">
                  {rfq.attachments.map(a => (
                    <a key={a.id} href={a.fileUrl} target="_blank" rel="noreferrer"
                      className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                      <FileText size={13} className="text-blue-400 shrink-0" />
                      <span className="text-xs text-blue-600 truncate">{a.filename}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {!loadingQuote && existingQuote && (
              <div className="p-4 border border-green-100 bg-green-50 rounded-lg">
                <p className="text-xs font-semibold text-green-700 mb-2">Your Submitted Quote</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['Total', `₹${Number(existingQuote.totalAmount).toLocaleString('en-IN')}`],
                    ['Delivery', existingQuote.deliveryDays ? `${existingQuote.deliveryDays} days` : '—'],
                    ['Status', existingQuote.status],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-bold text-gray-800">{val}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {canQuote && !loadingQuote && (
            <div className="px-5 py-4 border-t border-gray-100 shrink-0">
              <button onClick={() => setShowQuoteModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg,#7c3aed 0%,#a78bfa 100%)' }}>
                {existingQuote ? <><Edit2 size={14} />Revise Quote</> : <><Send size={14} />Submit Quote</>}
              </button>
            </div>
          )}
        </div>
      </div>

      {showQuoteModal && (
        <QuoteModal
          rfq={rfq}
          existingQuote={existingQuote}
          onClose={() => setShowQuoteModal(false)}
          onSuccess={() => { setShowQuoteModal(false); onQuoteSubmitted(); onClose(); }}
        />
      )}
    </>
  );
}

/* ─── Main Page ────────────────────────────────────────────────────────── */
export default function VendorRFQsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [page, setPage] = useState(1);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchRfqs = () => {
    setLoading(true);
    api.get('/rfqs')
      .then(({ data }) => setRfqs(data))
      .catch(() => setError('Failed to load RFQs.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRfqs(); }, []);

  const handleView = async (rfq) => {
    setDetailLoading(true);
    setSelectedRfq({ ...rfq, items: [] });
    try {
      const { data } = await api.get(`/rfqs/${rfq.id}`);
      setSelectedRfq(data);
    } catch {
      setSelectedRfq(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const tabs = ['All', 'OPEN', 'CLOSED'];
  const tabCounts = {
    All: rfqs.length,
    OPEN: rfqs.filter(r => r.status === 'OPEN').length,
    CLOSED: rfqs.filter(r => r.status === 'CLOSED').length,
  };

  const filtered = rfqs.filter(r => {
    const matchTab = activeTab === 'All' || r.status === activeTab;
    const q = search.toLowerCase();
    return matchTab && (!q || r.title.toLowerCase().includes(q) || r.org?.name?.toLowerCase().includes(q));
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }} className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <VendorSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500"><Menu size={20} /></button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">RFQ Invitations</h1>
              <p className="text-xs text-gray-500">View and respond to buyer requests</p>
            </div>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-gray-50">
            <Bell size={18} className="text-gray-500" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by title or buyer name..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-400 transition-all" />
          </div>

          <div className="flex items-center gap-2">
            {tabs.map(tab => (
              <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${activeTab === tab ? 'border-purple-500 bg-purple-50 text-purple-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
                {tab === 'All' ? 'All' : statusConfig[tab]?.label ?? tab}
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                  {tabCounts[tab]}
                </span>
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[560px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['RFQ', 'Buyer', 'Deadline', 'Items', 'Status', 'Action'].map(h => (
                      <th key={h} className={`text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-3.5 ${h === 'RFQ' ? 'px-5' : 'px-3'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-16 text-gray-400 text-sm">Loading...</td></tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                        <FileText size={32} className="mx-auto mb-3 text-gray-200" />
                        No RFQ invitations found.
                      </td>
                    </tr>
                  ) : paginated.map(rfq => {
                    const sc = statusConfig[rfq.status] ?? statusConfig.OPEN;
                    const Icon = sc.icon;
                    return (
                      <tr key={rfq.id} className="border-t border-gray-50 hover:bg-purple-50/20 transition-colors">
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-gray-800 text-xs leading-tight">{rfq.title}</p>
                          <p className="text-[10px] text-blue-500 font-mono mt-0.5">{rfq.id.slice(0, 8)}…</p>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Building2 size={11} className="text-gray-400" />{rfq.org?.name ?? '—'}
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar size={11} className="text-gray-400" />
                            {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </div>
                        </td>
                        <td className="px-3 py-3.5 text-xs text-gray-600">{rfq._count?.items ?? '—'}</td>
                        <td className="px-3 py-3.5">
                          <span className="flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ color: sc.color, background: sc.bg }}>
                            <Icon size={10} />{sc.label}
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <button onClick={() => handleView(rfq)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:border-purple-300 hover:text-purple-600 hover:bg-purple-50 transition-all">
                            <Eye size={12} />View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <p className="text-[11px] text-gray-400">
                Showing <span className="font-semibold text-gray-600">{Math.min((page-1)*PAGE_SIZE+1, filtered.length)}–{Math.min(page*PAGE_SIZE, filtered.length)}</span> of <span className="font-semibold text-gray-600">{filtered.length}</span> RFQs
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => p-1)} disabled={page === 1}
                  className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${p === page ? 'text-white' : 'text-gray-500 border border-gray-200 hover:bg-gray-100'}`}
                    style={p === page ? { background: '#7c3aed' } : {}}>{p}</button>
                ))}
                <button onClick={() => setPage(p => p+1)} disabled={page === totalPages}
                  className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {selectedRfq !== null && (
        detailLoading ? null :
        selectedRfq.items && (
          <RFQDetailModal
            rfq={selectedRfq}
            onClose={() => setSelectedRfq(null)}
            onQuoteSubmitted={fetchRfqs}
          />
        )
      )}
    </div>
  );
}
