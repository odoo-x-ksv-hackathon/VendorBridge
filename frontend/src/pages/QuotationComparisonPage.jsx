import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';
import { Menu, Bell, Star, TrendingDown, CheckCircle2, Clock, ArrowLeft } from 'lucide-react';

function StarRating({ value }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star key={i} size={10}
          className={i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'} />
      ))}
    </span>
  );
}

const fmt = n => Number(n).toLocaleString('en-IN');

export default function QuotationComparisonPage() {
  const { rfqId } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rfq, setRfq] = useState(null);
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [approveError, setApproveError] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/rfqs/${rfqId}`),
      api.get(`/quotations/rfq/${rfqId}`),
    ]).then(([rfqRes, quotesRes]) => {
      setRfq(rfqRes.data);
      setQuotations(quotesRes.data);
    }).catch(() => setError('Failed to load comparison data.'))
      .finally(() => setLoading(false));
  }, [rfqId]);

  const handleApprove = async () => {
    if (!selected) return;
    setApproving(true); setApproveError(null);
    try {
      await api.post('/approvals', { quotationId: selected, status: 'APPROVED' });
      setApproved(true);
    } catch (err) {
      setApproveError(err.response?.data?.error || 'Failed to approve.');
    } finally {
      setApproving(false);
    }
  };

  if (approved) {
    const winner = quotations.find(q => q.id === selected);
    return (
      <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }} className="flex h-screen bg-gray-50 items-center justify-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-green-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Sent for Approval</h2>
          <p className="text-xs text-gray-500 text-center">
            <span className="font-semibold text-gray-700">{winner?.vendor?.org?.name}</span>'s quotation of{' '}
            <span className="font-semibold text-blue-600">₹{fmt(winner?.totalAmount)}</span> has been forwarded to the approval workflow.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 w-full justify-center">
            <Clock size={13} />Pending Manager Approval
          </div>
          <button onClick={() => navigate('/rfqs')}
            className="mt-1 px-6 py-2.5 rounded-lg text-sm font-semibold text-white w-full"
            style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)' }}>
            Back to RFQs
          </button>
        </div>
      </div>
    );
  }

  const lowestTotal = quotations.length ? Math.min(...quotations.map(q => Number(q.totalAmount))) : 0;
  const fastestDelivery = quotations.length ? Math.min(...quotations.filter(q => q.deliveryDays).map(q => q.deliveryDays)) : null;
  const highestRating = quotations.length ? Math.max(...quotations.map(q => q.vendor?.rating ?? 0)) : 0;

  const CRITERIA = [
    { key: 'totalAmount', label: 'Total Amount', format: v => `₹${fmt(v)}`, lowerBetter: true },
    { key: 'deliveryDays', label: 'Delivery (days)', format: v => v ? `${v} days` : '—', lowerBetter: true },
    { key: 'rating', label: 'Vendor Rating', format: (v, q) => q.vendor?.rating ?? '—', lowerBetter: false },
    { key: 'notes', label: 'Notes', format: v => v || '—', lowerBetter: null },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }} className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500"><Menu size={20} /></button>
            <button onClick={() => navigate('/rfqs')}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors group">
              <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="w-px h-5 bg-gray-200 hidden sm:block" />
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Quotation Comparison</h1>
              {rfq && (
                <p className="text-xs text-gray-500">
                  {rfq.title}<span className="mx-1.5 text-gray-300">·</span>
                  <span className="font-medium text-blue-600">{quotations.length} quotation{quotations.length !== 1 ? 's' : ''} received</span>
                </p>
              )}
            </div>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-gray-50">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-16">Loading...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : quotations.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
              <p className="text-sm text-gray-400">No quotations received yet for this RFQ.</p>
            </div>
          ) : (
            <>
              {/* Stat pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'Lowest Price', value: `₹${fmt(lowestTotal)}`, color: '#10b981', bg: '#d1fae5', icon: TrendingDown },
                  { label: 'Fastest Delivery', value: fastestDelivery ? `${fastestDelivery} days` : '—', color: '#3b82f6', bg: '#eff6ff', icon: Clock },
                  { label: 'Top Rated', value: `${highestRating}/5`, color: '#f59e0b', bg: '#fef3c7', icon: Star },
                ].map(({ label, value, color, bg, icon: Icon }) => (
                  <div key={label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg, color }}>
                      <Icon size={15} />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                      <p className="text-sm font-bold" style={{ color }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comparison table */}
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm" style={{ minWidth: `${Math.max(640, quotations.length * 180 + 160)}px` }}>
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-4 bg-gray-50 w-36">Criteria</th>
                        {quotations.map(q => {
                          const isLowest = Number(q.totalAmount) === lowestTotal;
                          const isSelected = selected === q.id;
                          const initials = q.vendor?.org?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '??';
                          return (
                            <th key={q.id} className={`px-5 py-4 text-center transition-colors ${isLowest ? 'bg-emerald-50' : isSelected ? 'bg-blue-50' : 'bg-gray-50'}`}>
                              <div className="flex flex-col items-center gap-1.5">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                                  style={{ background: isLowest ? '#10b981' : '#3b82f6' }}>{initials}</div>
                                <span className={`text-xs font-bold leading-tight text-center ${isLowest ? 'text-emerald-700' : 'text-gray-800'}`}>
                                  {q.vendor?.org?.name ?? '—'}
                                </span>
                                {isLowest && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    <TrendingDown size={9} />Lowest
                                  </span>
                                )}
                                <p className="text-[10px] text-gray-400">
                                  {q.submittedAt ? new Date(q.submittedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}
                                </p>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {CRITERIA.map(({ key, label, format, lowerBetter }, ri) => {
                        const vals = quotations.map(q => key === 'rating' ? (q.vendor?.rating ?? 0) : Number(q[key] ?? 0)).filter(v => !isNaN(v));
                        const best = lowerBetter === null ? null : lowerBetter ? Math.min(...vals) : Math.max(...vals);
                        return (
                          <tr key={key} className={`border-t border-gray-50 ${ri % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                            <td className="px-5 py-3.5 text-xs font-semibold text-gray-500 bg-gray-50/60">{label}</td>
                            {quotations.map(q => {
                              const rawVal = key === 'rating' ? (q.vendor?.rating ?? 0) : q[key];
                              const numVal = Number(rawVal ?? 0);
                              const isBest = lowerBetter !== null && numVal === best && best !== 0;
                              const isLowest = Number(q.totalAmount) === lowestTotal;
                              return (
                                <td key={q.id} className={`px-5 py-3.5 text-center transition-colors ${isLowest ? 'bg-emerald-50/60' : ''}`}>
                                  <div className="flex flex-col items-center gap-1">
                                    <span className={`text-sm font-semibold ${isBest ? (isLowest ? 'text-emerald-700' : 'text-blue-600') : 'text-gray-700'}`}>
                                      {format(rawVal, q)}
                                    </span>
                                    {key === 'rating' && <StarRating value={q.vendor?.rating ?? 0} />}
                                    {isBest && key !== 'totalAmount' && key !== 'notes' && (
                                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isLowest ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-500'}`}>Best</span>
                                    )}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}

                      {/* Item breakdown */}
                      <tr className="border-t border-gray-100 bg-gray-50">
                        <td className="px-5 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider" colSpan={quotations.length + 1}>
                          Item Breakdown
                        </td>
                      </tr>
                      {rfq?.items?.map((rfqItem, idx) => (
                        <tr key={rfqItem.id} className={`border-t border-gray-50 ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                          <td className="px-5 py-3 text-xs font-medium text-gray-500 bg-gray-50/60">{rfqItem.productName}</td>
                          {quotations.map(q => {
                            const qi = q.items?.find(i => i.rfqItemId === rfqItem.id);
                            const isLowest = Number(q.totalAmount) === lowestTotal;
                            const prices = quotations.map(x => Number(x.items?.find(i => i.rfqItemId === rfqItem.id)?.unitPrice ?? Infinity));
                            const isCheapest = qi && Number(qi.unitPrice) === Math.min(...prices);
                            return (
                              <td key={q.id} className={`px-5 py-3 text-center ${isLowest ? 'bg-emerald-50/60' : ''}`}>
                                {qi ? (
                                  <div className="flex flex-col items-center gap-0.5">
                                    <span className={`text-xs font-semibold ${isCheapest ? 'text-emerald-700' : 'text-gray-700'}`}>
                                      ₹{fmt(qi.unitPrice)}/unit
                                    </span>
                                    <span className="text-[10px] text-gray-400">Qty: {qi.quantity}</span>
                                  </div>
                                ) : <span className="text-gray-300 text-xs">—</span>}
                              </td>
                            );
                          })}
                        </tr>
                      ))}

                      {/* CTA row */}
                      <tr className="border-t border-gray-100">
                        <td className="px-5 py-4 bg-gray-50/60" />
                        {quotations.map(q => {
                          const isLowest = Number(q.totalAmount) === lowestTotal;
                          const isSelected = selected === q.id;
                          return (
                            <td key={q.id} className={`px-5 py-4 text-center ${isLowest ? 'bg-emerald-50/60' : ''}`}>
                              {isSelected ? (
                                <div className="flex flex-col items-center gap-2">
                                  <button onClick={handleApprove} disabled={approving}
                                    className="w-full max-w-40 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95 disabled:opacity-60"
                                    style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)' }}>
                                    <CheckCircle2 size={13} />{approving ? 'Processing...' : 'Select & Approve'}
                                  </button>
                                  <button onClick={() => setSelected(null)} className="text-[10px] text-gray-400 hover:text-gray-600">Deselect</button>
                                </div>
                              ) : (
                                <button onClick={() => setSelected(q.id)}
                                  className={`w-full max-w-36 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all hover:shadow-sm active:scale-95 ${isLowest ? 'border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50'}`}>
                                  Select
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
                {approveError && <p className="px-5 py-3 text-xs text-red-500 border-t border-gray-100">{approveError}</p>}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <div className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300" />
                  Lowest price vendor — selecting initiates the approval workflow
                </div>
                <div className="flex items-center gap-2 text-[11px] text-gray-500">
                  <div className="w-3 h-3 rounded-sm bg-blue-50 border border-blue-200" />
                  Selected vendor
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
