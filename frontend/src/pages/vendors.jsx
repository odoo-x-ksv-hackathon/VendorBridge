import { useState, useEffect } from 'react';
import api from '../lib/axios';
import {
  Search,
  Plus,
  Eye,
  Bell,
  Menu,
  X,
  Building2,
  Download,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import Sidebar from '../components/Sidebar';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  Active: { color: '#10b981', bg: '#d1fae5', dot: '#10b981' },
  Pending: { color: '#f59e0b', bg: '#fef3c7', dot: '#f59e0b' },
  Blocked: { color: '#ef4444', bg: '#fee2e2', dot: '#ef4444' },
};

const tabs = ['All', 'Active', 'Pending', 'Blocked'];
const PAGE_SIZE = 10;
const emptyForm = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  gstNumber: '',
  category: '',
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] ?? statusConfig.Active;
  return (
    <span
      className="flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ color: cfg.color, background: cfg.bg }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
      {status}
    </span>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-xs text-gray-800">{value}</p>
    </div>
  );
}

function SectionTable({ title, headers, rows, empty }) {
  if (!rows?.length)
    return (
      <div>
        <p className="text-xs font-semibold text-gray-500 mb-2">{title}</p>
        <p className="text-xs text-gray-400 italic">{empty}</p>
      </div>
    );
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-2">{title}</p>
      <div className="border border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              {headers.map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 py-2"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-t border-gray-50">
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2 text-gray-600">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function VendorsPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');

  const [selectedVendor, setSelectedVendor] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchVendors = () => {
    setLoading(true);
    api
      .get('/vendors')
      .then(({ data }) =>
        setVendors(data.map((v) => ({ ...v, name: v.companyName, gst: v.gstNumber })))
      )
      .catch(() => setError('Failed to load vendors.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleViewVendor = async (id) => {
    setDetailLoading(true);
    setSelectedVendor({});
    try {
      const { data } = await api.get(`/vendors/${id}`);
      setSelectedVendor(data);
    } catch {
      setSelectedVendor(null);
      alert('Failed to load vendor details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await api.post('/vendors', form);
      fetchVendors();
      setShowAddModal(false);
      setForm(emptyForm);
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to add vendor.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(vendors.map(v => v.category).filter(Boolean))).sort()];

  const filtered = vendors.filter((v) => {
    const matchTab = activeTab === 'All' || v.status === activeTab;
    const matchCategory = categoryFilter === 'All' || v.category === categoryFilter;
    const q = search.toLowerCase();
    return (
      matchTab &&
      matchCategory &&
      (!q ||
        v.name.toLowerCase().includes(q) ||
        v.gst.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q))
    );
  });

  const handleExport = () => {
    const rows = filtered.map(v => ({
      'Company Name': v.name,
      'Category': v.category || '',
      'GST Number': v.gst || '',
      'Contact': v.contact || '',
      'Email': v.email || '',
      'Status': v.status,
      'Since': v.since,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Vendors');
    XLSX.writeFile(wb, 'vendors.xlsx');
  };

  const tabCounts = {
    All: vendors.length,
    Active: vendors.filter((v) => v.status === 'Active').length,
    Pending: vendors.filter((v) => v.status === 'Pending').length,
    Blocked: vendors.filter((v) => v.status === 'Blocked').length,
  };

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      className="flex h-screen bg-gray-50 overflow-hidden"
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Vendors</h1>
              <p className="text-xs text-gray-500">Manage supplier profiles and registrations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}
            >
              <Plus size={15} />
              Add Vendor
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name, GST number, category..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              />
            </div>
            <div className="flex gap-2 shrink-0">
              <select
                value={categoryFilter}
                onChange={e => { setCategoryFilter(e.target.value); setPage(1); }}
                className="px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
              >
                {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
              </select>
              <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
                <Download size={14} />
                <span className="hidden sm:inline">Export</span>
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}
              >
                <Plus size={14} />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${activeTab === tab ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'}`}
              >
                {tab}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
                >
                  {tabCounts[tab]}
                </span>
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Vendor Name', 'Category', 'GST No.', 'Contact No.', 'Status', 'Action'].map(
                      (h) => (
                        <th
                          key={h}
                          className={`text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-3.5 ${h === 'Vendor Name' ? 'px-5' : 'px-3'}`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                        Loading vendors...
                      </td>
                    </tr>
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                        <Building2 size={32} className="mx-auto mb-3 text-gray-200" />
                        No vendors found.
                      </td>
                    </tr>
                  ) : (
                    paginated.map((vendor) => (
                      <tr
                        key={vendor.id}
                        className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${statusConfig[vendor.status]?.dot ?? '#6b7280'}99, ${statusConfig[vendor.status]?.dot ?? '#6b7280'})`,
                              }}
                            >
                              {vendor.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 text-xs">{vendor.name}</p>
                              <p className="text-[10px] text-gray-400">Since {vendor.since}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3.5">
                          <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2.5 py-1 rounded-md">
                            {vendor.category || '—'}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-xs text-gray-500 font-mono">
                          {vendor.gst || '—'}
                        </td>
                        <td className="px-3 py-3.5 text-xs text-gray-600">
                          {vendor.contact || '—'}
                        </td>
                        <td className="px-3 py-3.5">
                          <StatusBadge status={vendor.status} />
                        </td>
                        <td className="px-3 py-3.5 pr-5">
                          <button
                            onClick={() => handleViewVendor(vendor.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          >
                            <Eye size={12} />
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <p className="text-[11px] text-gray-400">
                Showing{' '}
                <span className="font-semibold text-gray-600">
                  {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–
                  {Math.min(page * PAGE_SIZE, filtered.length)}
                </span>{' '}
                of <span className="font-semibold text-gray-600">{filtered.length}</span> vendors
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft size={14} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${p === page ? 'text-white' : 'text-gray-500 border border-gray-200 hover:bg-gray-100'}`}
                    style={p === page ? { background: '#3b82f6' } : {}}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages}
                  className="p-1.5 rounded-md border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-sm">Add New Vendor</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setFormError(null);
                  setForm(emptyForm);
                }}
              >
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleAddVendor} className="p-5 space-y-3">
              {[
                ['companyName', 'Company Name'],
                ['contactName', 'Contact Name'],
                ['email', 'Email'],
                ['phone', 'Phone Number'],
                ['gstNumber', 'GST Number'],
                ['category', 'Category'],
              ].map(([field, label]) => (
                <div key={field}>
                  <label className="text-xs font-medium text-gray-600 block mb-1">{label}</label>
                  <input
                    type={field === 'email' ? 'email' : 'text'}
                    value={form[field]}
                    onChange={(e) => setForm((f) => ({ ...f, [field]: e.target.value }))}
                    required={['companyName', 'contactName', 'email'].includes(field)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
                  />
                </div>
              ))}
              {formError && <p className="text-xs text-red-500">{formError}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 text-sm font-semibold text-white rounded-lg disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}
              >
                {submitting ? 'Adding...' : 'Add Vendor'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Vendor Detail Modal */}
      {selectedVendor !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
              <h2 className="font-bold text-gray-900 text-sm">Vendor Details</h2>
              <button onClick={() => setSelectedVendor(null)}>
                <X size={18} className="text-gray-400 hover:text-gray-600" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center py-16 text-gray-400 text-sm">
                Loading...
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5 space-y-6">
                {/* Profile header */}
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
                    style={{
                      background: `linear-gradient(135deg, ${statusConfig[selectedVendor.status]?.dot ?? '#6b7280'}99, ${statusConfig[selectedVendor.status]?.dot ?? '#6b7280'})`,
                    }}
                  >
                    {selectedVendor.companyName?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900 text-sm">{selectedVendor.companyName}</p>
                    <p className="text-xs text-gray-400">Since {selectedVendor.since}</p>
                  </div>
                  <StatusBadge status={selectedVendor.status} />
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <DetailRow label="Contact Name" value={selectedVendor.contactName} />
                  <DetailRow label="Email" value={selectedVendor.email} />
                  <DetailRow label="Phone" value={selectedVendor.contact} />
                  <DetailRow label="GST Number" value={selectedVendor.gstNumber} />
                  <DetailRow label="Category" value={selectedVendor.category} />
                  <DetailRow label="Address" value={selectedVendor.address} />
                  <DetailRow
                    label="Rating"
                    value={selectedVendor.rating != null ? `${selectedVendor.rating} / 5` : null}
                  />
                  <DetailRow
                    label="Last Login"
                    value={
                      selectedVendor.lastLogin
                        ? new Date(selectedVendor.lastLogin).toLocaleString()
                        : 'Never'
                    }
                  />
                </div>

                {/* RFQs */}
                <SectionTable
                  title="RFQ Invitations"
                  headers={['Title', 'Status', 'Invite Status', 'Deadline', 'Invited At']}
                  rows={selectedVendor.rfqs?.map((r) => [
                    r.title,
                    r.status,
                    r.inviteStatus,
                    r.deadline ? new Date(r.deadline).toLocaleDateString() : '—',
                    new Date(r.invitedAt).toLocaleDateString(),
                  ])}
                  empty="No RFQ invitations yet."
                />

                {/* Quotations */}
                <SectionTable
                  title="Quotations"
                  headers={['RFQ', 'Amount', 'Status', 'Delivery Days', 'Submitted']}
                  rows={selectedVendor.quotations?.map((q) => [
                    q.rfqTitle,
                    q.totalAmount != null ? `₹${Number(q.totalAmount).toLocaleString()}` : '—',
                    q.status,
                    q.deliveryDays ?? '—',
                    q.submittedAt ? new Date(q.submittedAt).toLocaleDateString() : '—',
                  ])}
                  empty="No quotations submitted yet."
                />

                {/* Purchase Orders */}
                <SectionTable
                  title="Purchase Orders"
                  headers={['PO Number', 'Amount', 'Status', 'Invoice', 'Date']}
                  rows={selectedVendor.purchaseOrders?.map((po) => [
                    po.poNumber,
                    `₹${Number(po.totalAmount).toLocaleString()}`,
                    po.status,
                    po.invoice ? `${po.invoice.invoiceNumber} (${po.invoice.status})` : '—',
                    new Date(po.createdAt).toLocaleDateString(),
                  ])}
                  empty="No purchase orders yet."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
