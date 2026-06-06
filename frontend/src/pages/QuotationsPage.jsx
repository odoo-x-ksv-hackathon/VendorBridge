import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';
import { Menu, Bell, FileText, Calendar, ChevronRight, Clock, CheckCircle2, AlertCircle, FileX, Search } from 'lucide-react';

const statusConfig = {
  OPEN:      { label: 'Open',      color: '#3b82f6', bg: '#eff6ff', icon: Clock },
  CLOSED:    { label: 'Closed',    color: '#10b981', bg: '#d1fae5', icon: CheckCircle2 },
  DRAFT:     { label: 'Draft',     color: '#6b7280', bg: '#f3f4f6', icon: FileX },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2', icon: AlertCircle },
};

export default function QuotationsPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/rfqs')
      .then(({ data }) => setRfqs(data.filter(r => (r._count?.quotations ?? 0) > 0)))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = rfqs.filter(r => {
    const q = search.toLowerCase();
    return !q || r.title.toLowerCase().includes(q);
  });

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }} className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500"><Menu size={20} /></button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Quotations</h1>
              <p className="text-xs text-gray-500">RFQs with received quotations</p>
            </div>
          </div>
          <button className="relative p-2 rounded-lg hover:bg-gray-50">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="relative">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by RFQ title..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['RFQ', 'Deadline', 'Quotes', 'Status', 'Action'].map(h => (
                      <th key={h} className={`text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-3.5 ${h === 'RFQ' ? 'px-5' : 'px-3'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={5} className="text-center py-16 text-gray-400 text-sm">Loading...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-16 text-gray-400 text-sm">
                        <FileText size={32} className="mx-auto mb-3 text-gray-200" />
                        No quotations received yet.
                      </td>
                    </tr>
                  ) : filtered.map(rfq => {
                    const sc = statusConfig[rfq.status] ?? statusConfig.OPEN;
                    const Icon = sc.icon;
                    return (
                      <tr key={rfq.id} className="border-t border-gray-50 hover:bg-blue-50/20 transition-colors cursor-pointer"
                        onClick={() => navigate(`/rfqs/${rfq.id}/comparison`)}>
                        <td className="px-5 py-3.5">
                          <p className="font-semibold text-gray-800 text-xs leading-tight">{rfq.title}</p>
                          <p className="text-[10px] text-blue-500 font-mono mt-0.5">{rfq.id.slice(0, 8)}…</p>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <Calendar size={11} className="text-gray-400" />
                            {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                            {rfq._count?.quotations} quote{rfq._count?.quotations !== 1 ? 's' : ''}
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ color: sc.color, background: sc.bg }}>
                            <Icon size={10} />{sc.label}
                          </span>
                        </td>
                        <td className="px-3 py-3.5">
                          <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                            Compare <ChevronRight size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
