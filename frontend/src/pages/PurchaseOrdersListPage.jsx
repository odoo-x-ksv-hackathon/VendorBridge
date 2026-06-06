import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';
import { Menu, Bell, ShoppingCart, ChevronRight } from 'lucide-react';

const statusConfig = {
  ISSUED:    { color: '#3b82f6', bg: '#eff6ff' },
  COMPLETED: { color: '#10b981', bg: '#d1fae5' },
  CANCELLED: { color: '#ef4444', bg: '#fee2e2' },
};

const fmt = n => Number(n).toLocaleString('en-IN');

export default function PurchaseOrdersListPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pos, setPos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/pos')
      .then(({ data }) => setPos(data))
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
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Purchase Orders</h1>
              <p className="text-xs text-gray-500">All generated purchase orders</p>
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
                    return (
                      <tr key={po.id} className="border-t border-gray-50 hover:bg-blue-50/20 transition-colors cursor-pointer"
                        onClick={() => navigate(`/purchase-orders/${po.id}`)}>
                        <td className="px-5 py-3.5 font-semibold text-blue-600 text-xs font-mono">{po.poNumber}</td>
                        <td className="px-3 py-3.5 text-xs text-gray-700">{po.vendor?.org?.name ?? '—'}</td>
                        <td className="px-3 py-3.5 text-xs font-semibold text-gray-800">₹{fmt(po.totalAmount)}</td>
                        <td className="px-3 py-3.5">
                          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{ color: sc.color, background: sc.bg }}>{po.status}</span>
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
        </main>
      </div>
    </div>
  );
}
