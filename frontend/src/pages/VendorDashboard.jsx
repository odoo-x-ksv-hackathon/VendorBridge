import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import VendorSidebar from '../components/VendorSidebar';
import { Menu, Bell, FileText, ClipboardList, Clock, CheckCircle2, ArrowRight, Calendar, Building2 } from 'lucide-react';

const statusConfig = {
  OPEN:      { label: 'Open',      color: '#3b82f6', bg: '#eff6ff' },
  CLOSED:    { label: 'Closed',    color: '#10b981', bg: '#d1fae5' },
  DRAFT:     { label: 'Draft',     color: '#6b7280', bg: '#f3f4f6' },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2' },
};

const inviteStatusConfig = {
  INVITED:   { label: 'Invited',   color: '#f59e0b', bg: '#fef3c7' },
  VIEWED:    { label: 'Viewed',    color: '#3b82f6', bg: '#eff6ff' },
  RESPONDED: { label: 'Responded', color: '#10b981', bg: '#d1fae5' },
  DECLINED:  { label: 'Declined',  color: '#ef4444', bg: '#fee2e2' },
};

export default function VendorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/rfqs')
      .then(({ data }) => setRfqs(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const userInitials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '??';
  const openRfqs = rfqs.filter(r => r.status === 'OPEN');
  const respondedRfqs = rfqs.filter(r => r.vendors?.some(v => v.inviteStatus === 'RESPONDED'));
  const pendingRfqs = rfqs.filter(r => r.vendors?.some(v => v.inviteStatus === 'INVITED'));
  const recent = rfqs.slice(0, 5);

  const stats = [
    { label: 'Total RFQs Received', value: rfqs.length, icon: FileText, color: '#7c3aed', bg: '#f5f3ff' },
    { label: 'Open RFQs', value: openRfqs.length, icon: Clock, color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Quotes Submitted', value: respondedRfqs.length, icon: CheckCircle2, color: '#10b981', bg: '#d1fae5' },
    { label: 'Awaiting Response', value: pendingRfqs.length, icon: ClipboardList, color: '#f59e0b', bg: '#fef3c7' },
  ];

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }} className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <VendorSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700"><Menu size={20} /></button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Welcome back, {user?.name?.split(' ')[0] ?? 'Vendor'}</h1>
              <p className="text-xs text-gray-500">Here's what's happening with your RFQs</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-gray-50">
              <Bell size={18} className="text-gray-500" />
              {pendingRfqs.length > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>{userInitials}</div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color, bg }) => (
              <div key={label} className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent RFQs */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800">Recent RFQ Invitations</h2>
              <button onClick={() => navigate('/vendor-rfqs')}
                className="text-[11px] font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1">
                View all <ArrowRight size={12} />
              </button>
            </div>

            {loading ? (
              <p className="text-sm text-gray-400 text-center py-12">Loading...</p>
            ) : recent.length === 0 ? (
              <div className="py-12 text-center">
                <FileText size={32} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm text-gray-400">No RFQ invitations yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {recent.map(rfq => {
                  const sc = statusConfig[rfq.status] ?? statusConfig.OPEN;
                  const myInvite = rfq.vendors?.find(v => v.inviteStatus);
                  const ic = inviteStatusConfig[myInvite?.inviteStatus ?? 'INVITED'];
                  return (
                    <div key={rfq.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                          style={{ background: sc.bg }}>
                          <FileText size={14} style={{ color: sc.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-800 truncate">{rfq.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1 text-[10px] text-gray-400">
                              <Building2 size={9} />{rfq.org?.name ?? '—'}
                            </span>
                            {rfq.deadline && (
                              <span className="flex items-center gap-1 text-[10px] text-gray-400">
                                <Calendar size={9} />{new Date(rfq.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ color: ic.color, background: ic.bg }}>
                          {ic.label}
                        </span>
                        <button onClick={() => navigate('/vendor-rfqs')}
                          className="text-[11px] font-medium text-purple-600 hover:text-purple-700 px-2.5 py-1 rounded-lg hover:bg-purple-50 transition-colors">
                          View
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick action */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-3">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate('/vendor-rfqs')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)' }}>
                <FileText size={15} />View All RFQs
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
