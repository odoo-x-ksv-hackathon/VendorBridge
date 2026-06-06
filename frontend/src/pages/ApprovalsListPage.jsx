import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';
import { Menu, Bell, CheckCircle2, XCircle, Clock, ChevronRight, ClipboardList } from 'lucide-react';

const statusConfig = {
  SELECTED: { label: 'Pending Approval', color: '#f59e0b', bg: '#fef3c7', icon: Clock },
  REJECTED: { label: 'Rejected',         color: '#ef4444', bg: '#fee2e2', icon: XCircle },
  APPROVED: { label: 'Approved',         color: '#10b981', bg: '#d1fae5', icon: CheckCircle2 },
};

const fmt = n => Number(n).toLocaleString('en-IN');

export default function ApprovalsListPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rfqs')
      .then(({ data }) => {
        // Show RFQs that have at least one SELECTED or decided quotation
        const relevant = data.filter(r =>
          (r.quotations ?? []).some(q => ['SELECTED', 'REJECTED'].includes(q.status))
        );
        setRfqs(relevant);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }} className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500"><Menu size={20} /></button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Approvals</h1>
              <p className="text-xs text-gray-500">Quotations awaiting or completed approval</p>
            </div>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-gray-50">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5">
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['RFQ', 'Vendor', 'Amount', 'Status', 'Action'].map(h => (
                      <th key={h} className={`text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-3.5 ${h === 'RFQ' ? 'px-5' : 'px-3'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-16 text-gray-400 text-sm">Loading...</td></tr>
                  ) : rfqs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                        <ClipboardList size={32} className="mx-auto mb-3 text-gray-200" />
                        No approvals yet.
                      </td>
                    </tr>
                  ) : rfqs.flatMap(rfq =>
                    (rfq.quotations ?? [])
                      .filter(q => ['SELECTED', 'REJECTED'].includes(q.status))
                      .map(q => {
                        const sc = statusConfig[q.status] ?? statusConfig.SELECTED;
                        const Icon = sc.icon;
                        return (
                          <tr key={q.id} className="border-t border-gray-50 hover:bg-blue-50/20 transition-colors cursor-pointer"
                            onClick={() => navigate(`/approvals/${q.id}`)}>
                            <td className="px-5 py-3.5">
                              <p className="font-semibold text-gray-800 text-xs leading-tight">{rfq.title}</p>
                              <p className="text-[10px] text-blue-500 font-mono mt-0.5">{rfq.id.slice(0,8)}…</p>
                            </td>
                            <td className="px-3 py-3.5 text-xs text-gray-600">{q.vendor?.org?.name ?? '—'}</td>
                            <td className="px-3 py-3.5 text-xs font-semibold text-gray-800">₹{fmt(q.totalAmount)}</td>
                            <td className="px-3 py-3.5">
                              <span className="flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full"
                                style={{ color: sc.color, background: sc.bg }}>
                                <Icon size={10} />{sc.label}
                              </span>
                            </td>
                            <td className="px-3 py-3.5">
                              <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                                Review <ChevronRight size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
