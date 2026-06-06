import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';
import {
  FileText, ClipboardList, Bell, Menu, Plus, Search, Download,
  Eye, Copy, Trash2, Clock, CheckCircle2, AlertCircle, FileX,
  Calendar, Building2, Upload, Check, ArrowLeft, X, ChevronLeft, ChevronRight,
} from 'lucide-react';

const statusConfig = {
  OPEN:      { label: 'Open',      color: '#3b82f6', bg: '#eff6ff',  icon: Clock },
  CLOSED:    { label: 'Closed',    color: '#10b981', bg: '#d1fae5',  icon: CheckCircle2 },
  DRAFT:     { label: 'Draft',     color: '#6b7280', bg: '#f3f4f6',  icon: FileX },
  CANCELLED: { label: 'Cancelled', color: '#ef4444', bg: '#fee2e2',  icon: AlertCircle },
};

const UNIT_OPTIONS = ['NOS', 'KG', 'MTR', 'LTR', 'BOX', 'SET', 'PCS'];
const PAGE_SIZE = 10;

function StatusBadge({ status }) {
  const cfg = statusConfig[status] ?? statusConfig.DRAFT;
  const Icon = cfg.icon;
  return (
    <span className="flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ color: cfg.color, background: cfg.bg }}>
      <Icon size={10} />{cfg.label}
    </span>
  );
}

/* ─── RFQ List ─────────────────────────────────────────────────────────── */
function RFQList({ onCreateClick }) {
  const navigate = useNavigate();
  const [rfqs, setRfqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [page, setPage] = useState(1);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    api.get('/rfqs')
      .then(({ data }) => setRfqs(data))
      .catch(() => setError('Failed to load RFQs.'))
      .finally(() => setLoading(false));
  }, []);

  const handleView = async (id) => {
    setDetailLoading(true);
    setSelectedRfq({});
    try {
      const { data } = await api.get(`/rfqs/${id}`);
      setSelectedRfq(data);
    } catch {
      setSelectedRfq(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const tabs = ['All', 'OPEN', 'DRAFT', 'CLOSED', 'CANCELLED'];
  const tabCounts = {
    All: rfqs.length,
    OPEN: rfqs.filter(r => r.status === 'OPEN').length,
    DRAFT: rfqs.filter(r => r.status === 'DRAFT').length,
    CLOSED: rfqs.filter(r => r.status === 'CLOSED').length,
    CANCELLED: rfqs.filter(r => r.status === 'CANCELLED').length,
  };

  const filtered = rfqs.filter(r => {
    const matchTab = activeTab === 'All' || r.status === activeTab;
    const q = search.toLowerCase();
    return matchTab && (!q || r.title.toLowerCase().includes(q) || r.id.toLowerCase().includes(q));
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-lg font-bold text-gray-900 leading-tight">RFQ's</h1>
          <p className="text-xs text-gray-500">Manage requests for quotation</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg hover:bg-gray-50">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <button onClick={onCreateClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95"
            style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}>
            <Plus size={15} /><span className="hidden sm:inline">Create RFQ</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Stat pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total RFQs', value: rfqs.length, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Open', value: tabCounts.OPEN, color: '#10b981', bg: '#d1fae5' },
            { label: 'Awaiting Quotes', value: rfqs.filter(r => r._count?.quotations === 0).length, color: '#f59e0b', bg: '#fef3c7' },
            { label: 'Cancelled', value: tabCounts.CANCELLED, color: '#ef4444', bg: '#fee2e2' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: bg, color }}>{value}</div>
              <span className="text-xs font-medium text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Search + toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by title or RFQ ID..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={14} /><span className="hidden sm:inline">Export</span>
            </button>
            <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
              <button onClick={() => setViewMode('table')}
                className={`px-3 py-2 transition-colors ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="12" height="2.5" rx="1" fill="currentColor" opacity=".5"/>
                  <rect x="1" y="5.5" width="12" height="2.5" rx="1" fill="currentColor" opacity=".5"/>
                  <rect x="1" y="10" width="12" height="2.5" rx="1" fill="currentColor"/>
                </svg>
              </button>
              <button onClick={() => setViewMode('card')}
                className={`px-3 py-2 transition-colors ${viewMode === 'card' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" fill="currentColor"/>
                  <rect x="7.5" y="1" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity=".5"/>
                  <rect x="1" y="7.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity=".5"/>
                  <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1.5" fill="currentColor" opacity=".5"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map(tab => (
            <button key={tab} onClick={() => { setActiveTab(tab); setPage(1); }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${activeTab === tab ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}>
              {tab === 'All' ? 'All' : statusConfig[tab]?.label ?? tab}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['RFQ', 'Deadline', 'Vendors', 'Quotes', 'Status', 'Actions'].map(h => (
                      <th key={h} className={`text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-3.5 ${h === 'RFQ' ? 'px-5' : h === 'Actions' ? 'px-3 pr-5' : 'px-3'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-16 text-gray-400 text-sm">Loading RFQs...</td></tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                        <FileText size={32} className="mx-auto mb-3 text-gray-200" />
                        No RFQs found.
                      </td>
                    </tr>
                  ) : paginated.map(rfq => {
                    const vendorCount = rfq._count?.vendors ?? 0;
                    const quoteCount = rfq._count?.quotations ?? 0;
                    const sc = statusConfig[rfq.status] ?? statusConfig.DRAFT;
                    return (
                      <tr key={rfq.id} className="border-t border-gray-50 hover:bg-blue-50/20 transition-colors group cursor-pointer">
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
                          <div className="flex items-center gap-1.5">
                            <div className="flex -space-x-1.5">
                              {Array.from({ length: Math.min(vendorCount, 3) }).map((_, i) => (
                                <div key={i} className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white"
                                  style={{ background: `hsl(${i * 60 + 200}, 70%, 55%)` }}>V</div>
                              ))}
                            </div>
                            <span className="text-xs text-gray-500">{vendorCount}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-12 overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${vendorCount > 0 ? (quoteCount / vendorCount) * 100 : 0}%`, background: sc.color }} />
                            </div>
                            <span className="text-xs font-semibold text-gray-600">{quoteCount}/{vendorCount}</span>
                          </div>
                        </td>
                        <td className="px-3 py-3.5"><StatusBadge status={rfq.status} /></td>
                        <td className="px-3 py-3.5 pr-5">
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => navigate(`/rfqs/${rfq.id}/comparison`)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all" title="View">
                              <Eye size={13} />
                            </button>
                          </div>
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
                    style={p === page ? { background: '#3b82f6' } : {}}>{p}</button>
                ))}
                <button onClick={() => setPage(p => p+1)} disabled={page === totalPages}
                  className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CARD VIEW */}
        {viewMode === 'card' && (
          <>
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-16">Loading RFQs...</p>
            ) : paginated.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-400 text-sm">
                <FileText size={32} className="mx-auto mb-3 text-gray-200" />No RFQs found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {paginated.map(rfq => {
                  const sc = statusConfig[rfq.status] ?? statusConfig.DRAFT;
                  const vendorCount = rfq._count?.vendors ?? 0;
                  const quoteCount = rfq._count?.quotations ?? 0;
                  const pct = vendorCount > 0 ? Math.round((quoteCount / vendorCount) * 100) : 0;
                  return (
                    <div key={rfq.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-blue-100 transition-all duration-200 cursor-pointer group flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-blue-500 font-mono mb-1">{rfq.id.slice(0,8)}…</p>
                          <p className="text-sm font-bold text-gray-800 leading-tight line-clamp-2">{rfq.title}</p>
                        </div>
                        <StatusBadge status={rfq.status} />
                      </div>
                      {rfq.description && <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">{rfq.description}</p>}
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Calendar size={10} />
                          {rfq.deadline ? new Date(rfq.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-gray-400 font-medium">Quotations received</span>
                          <span className="text-[10px] font-bold" style={{ color: sc.color }}>{quoteCount}/{vendorCount}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: sc.color }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Building2 size={10} />{vendorCount} vendor{vendorCount !== 1 ? 's' : ''}
                        </div>
                        <button onClick={() => navigate(`/rfqs/${rfq.id}/comparison`)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all opacity-0 group-hover:opacity-100">
                          <Eye size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-gray-400">
                Showing <span className="font-semibold text-gray-600">{filtered.length}</span> RFQs
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => p-1)} disabled={page === 1}
                  className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40">
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i+1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md ${p === page ? 'text-white' : 'text-gray-500 border border-gray-200 bg-white hover:bg-gray-100'}`}
                    style={p === page ? { background: '#3b82f6' } : {}}>{p}</button>
                ))}
                <button onClick={() => setPage(p => p+1)} disabled={page === totalPages}
                  className="p-1.5 rounded-md border border-gray-200 bg-white text-gray-500 hover:bg-gray-100 disabled:opacity-40">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </main>

      {/* RFQ Detail Modal */}
      {selectedRfq !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="font-bold text-gray-900 text-sm">RFQ Details</h2>
              <button onClick={() => setSelectedRfq(null)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
            </div>
            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center py-16 text-gray-400 text-sm">Loading...</div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{selectedRfq.title}</p>
                    <p className="text-[10px] text-blue-500 font-mono mt-0.5">{selectedRfq.id}</p>
                    {selectedRfq.description && <p className="text-xs text-gray-500 mt-1">{selectedRfq.description}</p>}
                  </div>
                  <StatusBadge status={selectedRfq.status} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Deadline</p>
                    <p className="text-xs text-gray-800">{selectedRfq.deadline ? new Date(selectedRfq.deadline).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p></div>
                  <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Buyer Org</p>
                    <p className="text-xs text-gray-800">{selectedRfq.org?.name ?? '—'}</p></div>
                  <div><p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Created</p>
                    <p className="text-xs text-gray-800">{new Date(selectedRfq.createdAt).toLocaleDateString()}</p></div>
                </div>

                {/* Items */}
                {selectedRfq.items?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Line Items</p>
                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-gray-50 border-b border-gray-100">
                          {['Product', 'Qty', 'Unit', 'Notes'].map(h => (
                            <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {selectedRfq.items.map(item => (
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

                {/* Attachments */}
                {selectedRfq.attachments?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Attachments</p>
                    <div className="space-y-1.5">
                      {selectedRfq.attachments.map(a => (
                        <a key={a.id} href={a.fileUrl} target="_blank" rel="noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg hover:bg-blue-50 transition-colors">
                          <FileText size={13} className="text-blue-400 shrink-0" />
                          <span className="text-xs text-blue-600 truncate">{a.filename}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vendors */}
                {selectedRfq.vendors?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2">Invited Vendors</p>
                    <div className="border border-gray-100 rounded-lg overflow-hidden">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-gray-50 border-b border-gray-100">
                          {['Vendor', 'Invite Status', 'Invited At', 'Responded At'].map(h => (
                            <th key={h} className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2">{h}</th>
                          ))}
                        </tr></thead>
                        <tbody>
                          {selectedRfq.vendors.map(rv => (
                            <tr key={rv.vendorId} className="border-t border-gray-50">
                              <td className="px-3 py-2 text-gray-700 font-medium">{rv.vendor?.org?.name ?? '—'}</td>
                              <td className="px-3 py-2 text-gray-600">{rv.inviteStatus}</td>
                              <td className="px-3 py-2 text-gray-400">{new Date(rv.invitedAt).toLocaleDateString()}</td>
                              <td className="px-3 py-2 text-gray-400">{rv.respondedAt ? new Date(rv.respondedAt).toLocaleDateString() : '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Create RFQ Form ──────────────────────────────────────────────────── */
function CreateRFQForm({ onBack, onSaved }) {
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [lineItems, setLineItems] = useState([{ id: 1, productName: '', quantity: 1, unit: 'NOS', notes: '' }]);
  const [vendors, setVendors] = useState([]);
  const [allVendors, setAllVendors] = useState([]);
  const [vendorInput, setVendorInput] = useState('');
  const [vendorDropdown, setVendorDropdown] = useState(false);
  const [attachments, setAttachments] = useState([]); // File objects
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/vendors').then(({ data }) => setAllVendors(data)).catch(() => {});
  }, []);

  const addLineItem = () => setLineItems(p => [...p, { id: Date.now(), productName: '', quantity: 1, unit: 'NOS', notes: '' }]);
  const removeLineItem = id => setLineItems(p => p.filter(l => l.id !== id));
  const updateLineItem = (id, field, value) => setLineItems(p => p.map(l => l.id === id ? { ...l, [field]: value } : l));

  const addVendor = v => { if (!vendors.find(x => x.id === v.id)) setVendors(p => [...p, v]); setVendorInput(''); setVendorDropdown(false); };
  const removeVendor = id => setVendors(p => p.filter(v => v.id !== id));
  const filteredVendorOptions = allVendors.filter(v => !vendors.find(x => x.id === v.id) && v.companyName.toLowerCase().includes(vendorInput.toLowerCase()));

  const handleFileDrop = e => {
    e.preventDefault(); setDragOver(false);
    const files = Array.from(e.dataTransfer?.files || e.target?.files || []);
    setAttachments(p => [...p, ...files]);
  };

  const handleSubmit = async (asDraft = false) => {
    if (!title || !deadline || lineItems.some(l => !l.productName)) {
      setError('Title, deadline, and all item names are required.'); return;
    }
    setSubmitting(true); setError(null);
    try {
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('deadline', deadline);
      fd.append('items', JSON.stringify(lineItems.map(({ productName, quantity, unit, notes }) => ({ productName, quantity: Number(quantity), unit, notes }))));
      fd.append('vendorIds', JSON.stringify(vendors.map(v => v.id)));
      attachments.forEach(file => fd.append('files', file));
      await api.post('/rfqs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create RFQ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to RFQ List</span>
          </button>
          <div className="w-px h-5 bg-gray-200 hidden sm:block" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Create RFQ</h1>
            <p className="text-xs text-gray-500">New request for quotation</p>
          </div>
        </div>
        <button className="relative p-2 rounded-lg hover:bg-gray-50">
          <Bell size={18} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT */}
          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <FileText size={15} className="text-blue-500" /> RFQ Details
              </h2>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">RFQ Title <span className="text-red-400">*</span></label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  placeholder="e.g. Office Furniture Procurement Q2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deadline <span className="text-red-400">*</span></label>
                <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Description</label>
                <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
                  placeholder="Describe the procurement requirements..." />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">Actions</h2>
              {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
              <div className="flex flex-wrap gap-3">
                <button onClick={() => handleSubmit(false)} disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}>
                  <Building2 size={15} />{submitting ? 'Saving...' : 'Save & Send to Vendors'}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className="space-y-5">
            {/* Line Items */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-gray-800">Line Items</h2>
                <span className="text-[11px] font-medium text-gray-400">{lineItems.length} item{lineItems.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                {['Item', 'Qty', 'Unit', ''].map((h, i) => (
                  <div key={i} className={`${i === 0 ? 'col-span-5' : i === 3 ? 'col-span-1' : 'col-span-3'} text-[11px] font-semibold text-gray-400 uppercase tracking-wider`}>{h}</div>
                ))}
              </div>
              <div className="space-y-2">
                {lineItems.map(line => (
                  <div key={line.id} className="grid grid-cols-12 gap-2 items-center group">
                    <input type="text" value={line.productName} onChange={e => updateLineItem(line.id, 'productName', e.target.value)}
                      className="col-span-5 px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      placeholder="Item name" />
                    <input type="number" value={line.quantity} onChange={e => updateLineItem(line.id, 'quantity', e.target.value)}
                      className="col-span-3 px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      placeholder="0" min={1} />
                    <select value={line.unit} onChange={e => updateLineItem(line.id, 'unit', e.target.value)}
                      className="col-span-3 px-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white transition-all">
                      {UNIT_OPTIONS.map(u => <option key={u}>{u}</option>)}
                    </select>
                    <button onClick={() => removeLineItem(line.id)}
                      className="col-span-1 flex items-center justify-center p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100">
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={addLineItem} className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                <Plus size={14} />Add line item
              </button>
            </div>

            {/* Assign Vendors */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">Assign Vendors</h2>
              <div className="space-y-2 mb-3">
                {vendors.map(v => (
                  <div key={v.id} className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">{v.companyName.charAt(0)}</div>
                      <span className="text-xs font-medium text-blue-800">{v.companyName}</span>
                    </div>
                    <button onClick={() => removeVendor(v.id)} className="text-blue-300 hover:text-red-400 transition-colors"><X size={13} /></button>
                  </div>
                ))}
              </div>
              <div className="relative">
                <div className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-all"
                  onClick={() => setVendorDropdown(true)}>
                  <Plus size={13} className="text-blue-500 shrink-0" />
                  <input type="text" value={vendorInput}
                    onChange={e => { setVendorInput(e.target.value); setVendorDropdown(true); }}
                    onFocus={() => setVendorDropdown(true)}
                    placeholder="Add vendor..."
                    className="flex-1 text-xs bg-transparent focus:outline-none text-gray-600 placeholder-gray-400" />
                </div>
                {vendorDropdown && filteredVendorOptions.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {filteredVendorOptions.map(v => (
                      <button key={v.id} onMouseDown={() => addVendor(v)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left">
                        <div className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold">{v.companyName.charAt(0)}</div>
                        <span className="text-xs text-gray-700">{v.companyName}</span>
                      </button>
                    ))}
                  </div>
                )}
                {vendorDropdown && <div className="fixed inset-0 z-0" onClick={() => setVendorDropdown(false)} />}
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">Attachments</h2>
              <div onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)} onDrop={handleFileDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/60'}`}>
                <input type="file" multiple className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileDrop} />
                <Upload size={20} className={`mx-auto mb-2 transition-colors ${dragOver ? 'text-blue-500' : 'text-gray-300'}`} />
                <p className="text-xs font-medium text-gray-500">Drag & drop or <span className="text-blue-500 font-semibold">click to upload</span></p>
                <p className="text-[10px] text-gray-400 mt-1">PDF, DOCX, XLSX up to 10MB</p>
              </div>
              {attachments.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {attachments.map((file, i) => (
                    <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg">
                      <span className="text-xs text-gray-600 truncate">{file.name}</span>
                      <button onClick={() => setAttachments(p => p.filter((_, j) => j !== i))} className="text-gray-300 hover:text-red-400 ml-2 shrink-0"><X size={12} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

/* ─── Page shell ───────────────────────────────────────────────────────── */
export default function RFQPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState('list');

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }} className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <div className="lg:hidden fixed top-0 left-0 z-40 p-3.5">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-500">
            <Menu size={18} />
          </button>
        </div>

        {view === 'list'
          ? <RFQList onCreateClick={() => setView('create')} />
          : <CreateRFQForm onBack={() => setView('list')} onSaved={() => setView('list')} />
        }
      </div>
    </div>
  );
}
