import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';
import {
  Menu, Bell, ShoppingCart, ChevronRight,
  CheckCircle2, Clock, XCircle, Loader2, FileCheck2,
} from 'lucide-react';

const statusConfig = {
  ISSUED:    { label: 'Issued',     color: '#3b82f6', bg: '#eff6ff', icon: Clock },
  ACKNOWLEDGED: { label: 'Acknowledged', color: '#10b981', bg: '#d1fae5', icon: CheckCircle2 },
  COMPLETED: { label: 'Completed',   color: '#059669', bg: '#d1fae5', icon: CheckCircle2 },
  CANCELLED: { label: 'Cancelled',   color: '#ef4444', bg: '#fee2e2', icon: XCircle },
  DRAFT:     { label: 'Draft',       color: '#6b7280', bg: '#f3f4f6', icon: Clock },
};

const fmt = n => Number(n).toLocaleString('en-IN');

export default function PurchaseOrdersListPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pos, setPos] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const loadData = async () => {
    try {
      const [{ data: posData }, { data: rfqsData }] = await Promise.all([
        api.get('/pos'),
        api.get('/rfqs'),
      ]);

      setPos(posData);

      const quoteResults = await Promise.allSettled(
        rfqsData.map(async (rfq) => {
          const { data: quotationData } = await api.get(`/quotations/rfq/${rfq.id}`);
          return quotationData
            .filter(q => q.status === 'SELECTED')
            .map(q => ({ rfq, quotation: q }));
        })
      );

      const flattenedQuotes = quoteResults.flatMap(result => result.status === 'fulfilled' ? result.value : []);
      setQuotes(flattenedQuotes);
    } catch {
      setPos([]);
      setQuotes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGeneratePo = async (quotationId) => {
    setSubmitting(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const { data } = await api.post('/pos', { quotationId });
      setPos(prev => [data.purchaseOrder, ...prev]);
      setActionSuccess(data.message || 'Purchase order generated successfully.');
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to generate purchase order.');
    } finally {
      setSubmitting(false);
    }
  };

  const totals = pos.reduce((acc, po) => {
    acc.count += 1;
    acc.total += Number(po.totalAmount ?? 0);
    acc.issued += po.status === 'ISSUED' ? 1 : 0;
    acc.completed += po.status === 'COMPLETED' ? 1 : 0;
    return acc;
  }, { count: 0, total: 0, issued: 0, completed: 0 });

  const quoteTotals = quotes.length;

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }} className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500"><Menu size={20} /></button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Purchase Orders</h1>
              <p className="text-xs text-gray-500">Generate purchase orders from approved quotations</p>
            </div>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-gray-50">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: 'Total POs', value: totals.count },
              { label: 'Ready Quotes', value: quoteTotals },
              { label: 'Issued', value: totals.issued },
              { label: 'Completed', value: totals.completed },
              { label: 'Value', value: `₹${fmt(totals.total)}` },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-4">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{card.label}</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{card.value}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-1 bg-white rounded-xl border border-gray-100 p-5 space-y-4 h-fit">
              <div>
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Accepted quotes</p>
                <h2 className="text-base font-bold text-gray-900">Generate PO from selected quotation</h2>
                <p className="text-xs text-gray-500 mt-1">Use the action button beside each selected quotation. No quotation ID is needed.</p>
              </div>

              <div className="rounded-lg bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700 space-y-1">
                <p className="font-semibold">Requirements</p>
                <p>The quotation must already be approved and marked as SELECTED.</p>
              </div>

              {actionError && <p className="text-xs text-red-500">{actionError}</p>}
              {actionSuccess && <p className="text-xs text-emerald-600">{actionSuccess}</p>}

              <div className="space-y-2 max-h-[28rem] overflow-y-auto pr-1">
                {loading ? (
                  <p className="text-sm text-gray-400 py-8 text-center">Loading quotes...</p>
                ) : quotes.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-10 px-4 text-center">
                    <FileCheck2 size={28} className="mx-auto mb-2 text-gray-300" />
                    <p className="text-sm font-medium text-gray-700">No selected quotations yet.</p>
                    <p className="text-xs text-gray-500 mt-1">Approved quotations will appear here for PO creation.</p>
                  </div>
                ) : quotes.map(({ rfq, quotation }) => (
                  <div key={quotation.id} className="rounded-xl border border-gray-100 p-4 hover:border-blue-200 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-900 truncate">{rfq.title}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5 truncate">{quotation.id}</p>
                        <p className="text-xs text-gray-600 mt-2">
                          Vendor: <span className="font-semibold text-gray-800">{quotation.vendor?.org?.name ?? '—'}</span>
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Total: <span className="font-semibold text-blue-600">₹{fmt(quotation.totalAmount)}</span>
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                        <CheckCircle2 size={10} />Accepted
                      </span>
                    </div>

                    <button
                      onClick={() => handleGeneratePo(quotation.id)}
                      disabled={submitting}
                      className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.99] disabled:opacity-60"
                      style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)' }}
                    >
                      {submitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                      {submitting ? 'Generating...' : 'Create Purchase Order'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-900">Recent purchase orders</h2>
                  <p className="text-xs text-gray-500">Click any row to open the invoice view.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[640px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {['PO Number', 'Vendor', 'Total', 'Status', 'Date', 'Action'].map(h => (
                        <th key={h} className={`text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-3.5 ${h === 'PO Number' ? 'px-5' : 'px-3'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan={6} className="text-center py-16 text-gray-400 text-sm">Loading...</td></tr>
                    ) : pos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                          <ShoppingCart size={32} className="mx-auto mb-3 text-gray-200" />
                          No purchase orders yet.
                        </td>
                      </tr>
                    ) : pos.map(po => {
                      const sc = statusConfig[po.status] ?? statusConfig.ISSUED;
                      const Icon = sc.icon;
                      return (
                        <tr key={po.id} className="border-t border-gray-50 hover:bg-blue-50/20 transition-colors cursor-pointer"
                          onClick={() => navigate(`/purchase-orders/${po.id}`)}>
                          <td className="px-5 py-3.5 font-semibold text-blue-600 text-xs font-mono">{po.poNumber}</td>
                          <td className="px-3 py-3.5 text-xs text-gray-700">{po.vendor?.org?.name ?? '—'}</td>
                          <td className="px-3 py-3.5 text-xs font-semibold text-gray-800">₹{fmt(po.totalAmount)}</td>
                          <td className="px-3 py-3.5">
                            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                              style={{ color: sc.color, background: sc.bg }}>
                              <Icon size={10} />{sc.label}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 text-xs text-gray-500">
                            {new Date(po.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                          </td>
                          <td className="px-3 py-3.5">
                            <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                              View <ChevronRight size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
