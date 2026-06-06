import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  ClipboardList,
  CheckSquare,
  ShoppingCart,
  Receipt,
  BarChart2,
  Activity,
  ChevronRight,
  Bell,
  Menu,
  X,
  Plus,
  Search,
  Filter,
  Download,
  Eye,
  Copy,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileX,
  Calendar,
  Building2,
  Upload,
  Check,
  ArrowLeft,
} from 'lucide-react';

/* ─── Nav ─────────────────────────────────────────────────────────────── */
const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Vendors', icon: Users },
  { label: "RFQ's", icon: FileText },
  { label: 'Quotations', icon: ClipboardList },
  { label: 'Approvals', icon: CheckSquare },
  { label: 'Purchase Orders', icon: ShoppingCart },
  { label: 'Invoices', icon: Receipt },
  { label: 'Reports', icon: BarChart2 },
  { label: 'Activity', icon: Activity },
];

/* ─── RFQ data ─────────────────────────────────────────────────────────── */
const INITIAL_RFQS = [
  {
    id: 'RFQ-2025-001',
    title: 'Office Furniture Procurement Q2',
    category: 'Furniture',
    deadline: '15 Jun 2025',
    created: '01 Jun 2025',
    vendors: 3,
    quotations: 2,
    status: 'Active',
    description: 'Ergonomic chairs and standing desks for 3rd floor',
  },
  {
    id: 'RFQ-2025-002',
    title: 'IT Equipment Refresh – Dev Team',
    category: 'IT Equipment',
    deadline: '20 Jun 2025',
    created: '02 Jun 2025',
    vendors: 5,
    quotations: 4,
    status: 'Active',
    description: 'Laptops, monitors and docking stations for 12 developers',
  },
  {
    id: 'RFQ-2025-003',
    title: 'Annual Stationery & Office Supplies',
    category: 'Office Supplies',
    deadline: '10 Jun 2025',
    created: '28 May 2025',
    vendors: 4,
    quotations: 4,
    status: 'Closed',
    description: 'Yearly stationery bundle for all departments',
  },
  {
    id: 'RFQ-2025-004',
    title: 'Server Room AC Maintenance',
    category: 'Infrastructure',
    deadline: '25 Jun 2025',
    created: '03 Jun 2025',
    vendors: 2,
    quotations: 0,
    status: 'Draft',
    description: 'Preventive maintenance for 4 precision ACs in server room',
  },
  {
    id: 'RFQ-2025-005',
    title: 'Fleet Vehicle Insurance Renewal',
    category: 'Logistics',
    deadline: '08 Jun 2025',
    created: '25 May 2025',
    vendors: 3,
    quotations: 3,
    status: 'Overdue',
    description: 'Insurance renewal for 6 company-owned vehicles',
  },
  {
    id: 'RFQ-2025-006',
    title: 'Electrical Panel Upgrade – Plant B',
    category: 'Electrical',
    deadline: '30 Jun 2025',
    created: '04 Jun 2025',
    vendors: 2,
    quotations: 1,
    status: 'Active',
    description: 'Upgrade of main distribution panel at Plant B',
  },
  {
    id: 'RFQ-2025-007',
    title: 'Cloud Backup Solution – FY26',
    category: 'IT Equipment',
    deadline: '18 Jun 2025',
    created: '05 Jun 2025',
    vendors: 4,
    quotations: 2,
    status: 'Active',
    description: 'Enterprise cloud backup and DR solution for FY2026',
  },
  {
    id: 'RFQ-2025-008',
    title: 'Cafeteria Equipment Replacement',
    category: 'Office Supplies',
    deadline: '05 Jun 2025',
    created: '20 May 2025',
    vendors: 3,
    quotations: 3,
    status: 'Closed',
    description: 'Replacement of refrigerators, microwave and coffee machines',
  },
];

/* ─── Config ───────────────────────────────────────────────────────────── */
const statusConfig = {
  Active: { color: '#3b82f6', bg: '#eff6ff', icon: Clock },
  Closed: { color: '#10b981', bg: '#d1fae5', icon: CheckCircle2 },
  Draft: { color: '#6b7280', bg: '#f3f4f6', icon: FileX },
  Overdue: { color: '#ef4444', bg: '#fee2e2', icon: AlertCircle },
};

const categoryColors = {
  Furniture: { color: '#7c3aed', bg: '#ede9fe' },
  'IT Equipment': { color: '#0891b2', bg: '#cffafe' },
  'Office Supplies': { color: '#d97706', bg: '#fef3c7' },
  Infrastructure: { color: '#059669', bg: '#d1fae5' },
  Logistics: { color: '#db2777', bg: '#fce7f3' },
  Electrical: { color: '#ea580c', bg: '#ffedd5' },
};

const VENDOR_OPTIONS = [
  'Infra Supplies Pvt Ltd',
  'Tech Core Ltd',
  'FastLog Transport',
  'OfficeNeed Co',
  'BuildRight Infra',
  'SkyNet Solutions',
  'Prime Electricals',
];
const UNIT_OPTIONS = ['NOS', 'KG', 'MTR', 'LTR', 'BOX', 'SET', 'PCS'];
const CATEGORY_OPTIONS = [
  'Furniture',
  'IT Equipment',
  'Office Supplies',
  'Infrastructure',
  'Logistics',
  'Electrical',
];
const FORM_STEPS = ['RFQ Details', 'Items & Vendors', 'Review & Send'];
const tabs = ['All', 'Active', 'Draft', 'Closed', 'Overdue'];

/* ─── Sidebar ──────────────────────────────────────────────────────────── */
function Sidebar({ open, onClose, activeNav, onNav }) {
  return (
    <aside
      className={`fixed lg:static inset-y-0 left-0 z-30 w-56 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}
          >
            VB
          </div>
          <span className="font-bold text-gray-900 text-sm tracking-tight">VendorBridge</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-gray-400">
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-3">
          Main Menu
        </p>
        {navItems.map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => {
              onNav(label);
              onClose();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 group ${activeNav === label ? 'text-blue-700 bg-blue-50' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
          >
            <Icon
              size={16}
              className={
                activeNav === label ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
              }
            />
            {label}
            {activeNav === label && <ChevronRight size={14} className="ml-auto text-blue-400" />}
          </button>
        ))}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100">
        <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2.5">
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #06b6d4)' }}
          >
            PO
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">Procurement Officer</p>
            <p className="text-[10px] text-gray-400 truncate">officer@company.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ─── List view ────────────────────────────────────────────────────────── */
function RFQList({ rfqs, onCreateClick }) {
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('table');

  const tabCounts = {
    All: rfqs.length,
    Active: rfqs.filter((r) => r.status === 'Active').length,
    Draft: rfqs.filter((r) => r.status === 'Draft').length,
    Closed: rfqs.filter((r) => r.status === 'Closed').length,
    Overdue: rfqs.filter((r) => r.status === 'Overdue').length,
  };

  const filtered = rfqs.filter((r) => {
    const matchTab = activeTab === 'All' || r.status === activeTab;
    const q = search.toLowerCase();
    return (
      matchTab &&
      (!q ||
        r.title.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q))
    );
  });

  return (
    <>
      {/* Header */}
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
          <button
            onClick={onCreateClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95"
            style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Create RFQ</span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Stat pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Total RFQs', value: rfqs.length, color: '#3b82f6', bg: '#eff6ff' },
            { label: 'Active', value: tabCounts.Active, color: '#10b981', bg: '#d1fae5' },
            {
              label: 'Awaiting Quotes',
              value: rfqs.filter((r) => r.quotations === 0).length,
              color: '#f59e0b',
              bg: '#fef3c7',
            },
            { label: 'Overdue', value: tabCounts.Overdue, color: '#ef4444', bg: '#fee2e2' },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
                style={{ background: bg, color }}
              >
                {value}
              </div>
              <span className="text-xs font-medium text-gray-500">{label}</span>
            </div>
          ))}
        </div>

        {/* Search + toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, category, RFQ ID..."
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
          </div>
          <div className="flex gap-2 shrink-0">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
              <Filter size={14} />
              <span className="hidden sm:inline">Filter</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors">
              <Download size={14} />
              <span className="hidden sm:inline">Export</span>
            </button>
            {/* View toggle */}
            <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 transition-colors ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Table view"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect
                    x="1"
                    y="1"
                    width="12"
                    height="2.5"
                    rx="1"
                    fill="currentColor"
                    opacity=".5"
                  />
                  <rect
                    x="1"
                    y="5.5"
                    width="12"
                    height="2.5"
                    rx="1"
                    fill="currentColor"
                    opacity=".5"
                  />
                  <rect x="1" y="10" width="12" height="2.5" rx="1" fill="currentColor" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 transition-colors ${viewMode === 'card' ? 'bg-blue-50 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                title="Card view"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="1" width="5.5" height="5.5" rx="1.5" fill="currentColor" />
                  <rect
                    x="7.5"
                    y="1"
                    width="5.5"
                    height="5.5"
                    rx="1.5"
                    fill="currentColor"
                    opacity=".5"
                  />
                  <rect
                    x="1"
                    y="7.5"
                    width="5.5"
                    height="5.5"
                    rx="1.5"
                    fill="currentColor"
                    opacity=".5"
                  />
                  <rect
                    x="7.5"
                    y="7.5"
                    width="5.5"
                    height="5.5"
                    rx="1.5"
                    fill="currentColor"
                    opacity=".5"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
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

        {/* TABLE VIEW */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-175">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['RFQ', 'Category', 'Deadline', 'Vendors', 'Quotes', 'Status', 'Actions'].map(
                      (h) => (
                        <th
                          key={h}
                          className={`text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-3.5 ${h === 'RFQ' ? 'px-5' : h === 'Actions' ? 'px-3 pr-5' : 'px-3'}`}
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-gray-400 text-sm">
                        <FileText size={32} className="mx-auto mb-3 text-gray-200" />
                        No RFQs found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((rfq) => {
                      const sc = statusConfig[rfq.status];
                      const StatusIcon = sc.icon;
                      const cat = categoryColors[rfq.category] || {
                        color: '#6b7280',
                        bg: '#f3f4f6',
                      };
                      return (
                        <tr
                          key={rfq.id}
                          className="border-t border-gray-50 hover:bg-blue-50/20 transition-colors group cursor-pointer"
                        >
                          <td className="px-5 py-3.5">
                            <p className="font-semibold text-gray-800 text-xs leading-tight">
                              {rfq.title}
                            </p>
                            <p className="text-[10px] text-blue-500 font-mono mt-0.5">{rfq.id}</p>
                          </td>
                          <td className="px-3 py-3.5">
                            <span
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-md"
                              style={{ color: cat.color, background: cat.bg }}
                            >
                              {rfq.category}
                            </span>
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex items-center gap-1.5 text-xs text-gray-600">
                              <Calendar size={11} className="text-gray-400" />
                              {rfq.deadline}
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <div className="flex -space-x-1.5">
                                {Array.from({ length: Math.min(rfq.vendors, 3) }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white"
                                    style={{ background: `hsl(${i * 60 + 200}, 70%, 55%)` }}
                                  >
                                    V
                                  </div>
                                ))}
                              </div>
                              <span className="text-xs text-gray-500">{rfq.vendors}</span>
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 h-1.5 bg-gray-100 rounded-full w-12 overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${rfq.vendors > 0 ? (rfq.quotations / rfq.vendors) * 100 : 0}%`,
                                    background: sc.color,
                                  }}
                                />
                              </div>
                              <span className="text-xs font-semibold text-gray-600">
                                {rfq.quotations}/{rfq.vendors}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-3.5">
                            <span
                              className="flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full"
                              style={{ color: sc.color, background: sc.bg }}
                            >
                              <StatusIcon size={10} />
                              {rfq.status}
                            </span>
                          </td>
                          <td className="px-3 py-3.5 pr-5">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                title="View"
                              >
                                <Eye size={13} />
                              </button>
                              <button
                                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                                title="Duplicate"
                              >
                                <Copy size={13} />
                              </button>
                              <button
                                className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                                title="Delete"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <p className="text-[11px] text-gray-400">
                Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{' '}
                <span className="font-semibold text-gray-600">{tabCounts[activeTab]}</span> RFQs
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200 rounded-md hover:bg-gray-100 disabled:opacity-40"
                  disabled
                >
                  Prev
                </button>
                <button
                  className="px-2.5 py-1 text-xs font-medium text-white rounded-md"
                  style={{ background: '#3b82f6' }}
                >
                  1
                </button>
                <button className="px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200 rounded-md hover:bg-gray-100">
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CARD VIEW */}
        {viewMode === 'card' && (
          <>
            {filtered.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 py-16 text-center text-gray-400 text-sm">
                <FileText size={32} className="mx-auto mb-3 text-gray-200" />
                No RFQs found.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.map((rfq) => {
                  const sc = statusConfig[rfq.status];
                  const StatusIcon = sc.icon;
                  const cat = categoryColors[rfq.category] || { color: '#6b7280', bg: '#f3f4f6' };
                  const pct =
                    rfq.vendors > 0 ? Math.round((rfq.quotations / rfq.vendors) * 100) : 0;
                  return (
                    <div
                      key={rfq.id}
                      className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-blue-100 transition-all duration-200 cursor-pointer group flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-blue-500 font-mono mb-1">
                            {rfq.id}
                          </p>
                          <p className="text-sm font-bold text-gray-800 leading-tight line-clamp-2">
                            {rfq.title}
                          </p>
                        </div>
                        <span
                          className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full shrink-0"
                          style={{ color: sc.color, background: sc.bg }}
                        >
                          <StatusIcon size={10} />
                          {rfq.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed">
                        {rfq.description}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                          style={{ color: cat.color, background: cat.bg }}
                        >
                          {rfq.category}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-gray-400">
                          <Calendar size={10} />
                          {rfq.deadline}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[10px] text-gray-400 font-medium">
                            Quotations received
                          </span>
                          <span className="text-[10px] font-bold" style={{ color: sc.color }}>
                            {rfq.quotations}/{rfq.vendors}
                          </span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{ width: `${pct}%`, background: sc.color }}
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                        <div className="flex items-center gap-1 text-[10px] text-gray-400">
                          <Building2 size={10} />
                          {rfq.vendors} vendor{rfq.vendors !== 1 ? 's' : ''} assigned
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all">
                            <Eye size={12} />
                          </button>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
                            <Copy size={12} />
                          </button>
                          <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-gray-400">
                Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{' '}
                <span className="font-semibold text-gray-600">{tabCounts[activeTab]}</span> RFQs
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200 rounded-md hover:bg-gray-100 disabled:opacity-40 bg-white"
                  disabled
                >
                  Prev
                </button>
                <button
                  className="px-2.5 py-1 text-xs font-medium text-white rounded-md"
                  style={{ background: '#3b82f6' }}
                >
                  1
                </button>
                <button className="px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200 rounded-md hover:bg-gray-100 bg-white">
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}

/* ─── Create RFQ form ──────────────────────────────────────────────────── */
function CreateRFQForm({ onBack, onSave }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Furniture');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [lineItems, setLineItems] = useState([{ id: 1, item: '', qty: 1, unit: 'NOS' }]);
  const [assignedVendors, setAssignedVendors] = useState([]);
  const [vendorInput, setVendorInput] = useState('');
  const [vendorDropdown, setVendorDropdown] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const addLineItem = () =>
    setLineItems((p) => [...p, { id: Date.now(), item: '', qty: 1, unit: 'NOS' }]);
  const removeLineItem = (id) => setLineItems((p) => p.filter((l) => l.id !== id));
  const updateLineItem = (id, field, value) =>
    setLineItems((p) => p.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  const addVendor = (v) => {
    if (!assignedVendors.includes(v)) setAssignedVendors((p) => [...p, v]);
    setVendorInput('');
    setVendorDropdown(false);
  };
  const removeVendor = (v) => setAssignedVendors((p) => p.filter((x) => x !== v));
  const filteredVendors = VENDOR_OPTIONS.filter(
    (v) => !assignedVendors.includes(v) && v.toLowerCase().includes(vendorInput.toLowerCase())
  );

  const handleFileDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer?.files || e.target?.files || []);
    setAttachments((p) => [...p, ...files.map((f) => f.name)]);
  };

  const handleSave = (asDraft = false) => {
    const newRFQ = {
      id: `RFQ-2025-00${Date.now() % 100}`,
      title: title || 'Untitled RFQ',
      category,
      deadline: deadline
        ? new Date(deadline).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
        : 'TBD',
      created: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      vendors: assignedVendors.length,
      quotations: 0,
      status: asDraft ? 'Draft' : 'Active',
      description: description || 'No description provided',
    };
    onSave(newRFQ);
  };

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800 transition-colors group"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to RFQ List</span>
          </button>
          <div className="w-px h-5 bg-gray-200 hidden sm:block" />
          <div>
            <h1 className="text-lg font-bold text-gray-900 leading-tight">Create RFQ</h1>
            <p className="text-xs text-gray-500">New request for quotation</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="relative p-2 rounded-lg hover:bg-gray-50">
            <Bell size={18} className="text-gray-500" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #06b6d4)' }}
          >
            PO
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5">
        {/* Stepper */}
        <div className="flex items-center mb-7 max-w-2xl">
          {FORM_STEPS.map((label, i) => {
            const step = i + 1;
            const done = step < currentStep;
            const active = step === currentStep;
            return (
              <div key={label} className="flex items-center flex-1 last:flex-none">
                <button
                  onClick={() => setCurrentStep(step)}
                  className="flex items-center gap-2 group"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-200 shrink-0 ${done ? 'border-blue-500 bg-blue-500 text-white' : active ? 'border-blue-500 bg-white text-blue-600 shadow-md shadow-blue-100' : 'border-gray-200 bg-white text-gray-400'}`}
                  >
                    {done ? <Check size={14} /> : step}
                  </div>
                  <span
                    className={`text-xs font-semibold hidden sm:block transition-colors ${active ? 'text-blue-600' : done ? 'text-blue-400' : 'text-gray-400'}`}
                  >
                    {label}
                  </span>
                </button>
                {i < FORM_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-3 rounded-full transition-colors ${done ? 'bg-blue-400' : 'bg-gray-200'}`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* LEFT */}
          <div className="space-y-5">
            {/* Basic Details */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                <FileText size={15} className="text-blue-500" /> RFQ Details
              </h2>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  RFQ Title <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                  placeholder="e.g. Office Furniture Procurement Q2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white transition-all appearance-none"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Deadline <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
                  placeholder="Describe the procurement requirements..."
                />
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-xs font-semibold text-gray-500 mb-4 uppercase tracking-wider">
                Actions
              </h2>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleSave(false)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95"
                  style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}
                >
                  <Building2 size={15} />
                  Save & Send to Vendors
                </button>
                <button
                  onClick={() => handleSave(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                >
                  Save as Draft
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
                <span className="text-[11px] font-medium text-gray-400">
                  {lineItems.length} item{lineItems.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="grid grid-cols-12 gap-2 mb-2 px-1">
                <div className="col-span-5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Item
                </div>
                <div className="col-span-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Qty
                </div>
                <div className="col-span-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Unit
                </div>
                <div className="col-span-1" />
              </div>
              <div className="space-y-2">
                {lineItems.map((line) => (
                  <div key={line.id} className="grid grid-cols-12 gap-2 items-center group">
                    <input
                      type="text"
                      value={line.item}
                      onChange={(e) => updateLineItem(line.id, 'item', e.target.value)}
                      className="col-span-5 px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      placeholder="Item name"
                    />
                    <input
                      type="number"
                      value={line.qty}
                      onChange={(e) => updateLineItem(line.id, 'qty', e.target.value)}
                      className="col-span-3 px-2.5 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                      placeholder="0"
                      min={1}
                    />
                    <select
                      value={line.unit}
                      onChange={(e) => updateLineItem(line.id, 'unit', e.target.value)}
                      className="col-span-3 px-2 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white transition-all"
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u}>{u}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => removeLineItem(line.id)}
                      className="col-span-1 flex items-center justify-center p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={addLineItem}
                className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus size={14} />
                Add line item
              </button>
            </div>

            {/* Assign Vendors */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Assign Vendors
              </h2>
              <div className="space-y-2 mb-3">
                {assignedVendors.map((v) => (
                  <div
                    key={v}
                    className="flex items-center justify-between px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold">
                        {v.charAt(0)}
                      </div>
                      <span className="text-xs font-medium text-blue-800">{v}</span>
                    </div>
                    <button
                      onClick={() => removeVendor(v)}
                      className="text-blue-300 hover:text-red-400 transition-colors"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="relative">
                <div
                  className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-blue-300 hover:bg-blue-50/40 transition-all"
                  onClick={() => setVendorDropdown(true)}
                >
                  <Plus size={13} className="text-blue-500 shrink-0" />
                  <input
                    type="text"
                    value={vendorInput}
                    onChange={(e) => {
                      setVendorInput(e.target.value);
                      setVendorDropdown(true);
                    }}
                    onFocus={() => setVendorDropdown(true)}
                    placeholder="Add vendor..."
                    className="flex-1 text-xs bg-transparent focus:outline-none text-gray-600 placeholder-gray-400"
                  />
                </div>
                {vendorDropdown && filteredVendors.length > 0 && (
                  <div className="absolute z-10 left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                    {filteredVendors.map((v) => (
                      <button
                        key={v}
                        onMouseDown={() => addVendor(v)}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="w-6 h-6 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                          {v.charAt(0)}
                        </div>
                        <span className="text-xs text-gray-700">{v}</span>
                      </button>
                    ))}
                  </div>
                )}
                {vendorDropdown && (
                  <div className="fixed inset-0 z-0" onClick={() => setVendorDropdown(false)} />
                )}
              </div>
            </div>

            {/* Attachments */}
            <div className="bg-white rounded-xl border border-gray-100 p-5">
              <h2 className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Attachments
              </h2>
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50/60'}`}
              >
                <input
                  type="file"
                  multiple
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileDrop}
                />
                <Upload
                  size={20}
                  className={`mx-auto mb-2 transition-colors ${dragOver ? 'text-blue-500' : 'text-gray-300'}`}
                />
                <p className="text-xs font-medium text-gray-500">
                  Drag & drop files or{' '}
                  <span className="text-blue-500 font-semibold">click to upload</span>
                </p>
                <p className="text-[10px] text-gray-400 mt-1">PDF, DOCX, XLSX up to 10MB</p>
              </div>
              {attachments.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {attachments.map((name, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                    >
                      <span className="text-xs text-gray-600 truncate">{name}</span>
                      <button
                        onClick={() => setAttachments((p) => p.filter((_, j) => j !== i))}
                        className="text-gray-300 hover:text-red-400 ml-2 shrink-0"
                      >
                        <X size={12} />
                      </button>
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

export default function RFQPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState("RFQ's");
  const [view, setView] = useState('list'); // 'list' | 'create'
  const [rfqs, setRfqs] = useState(INITIAL_RFQS);

  const handleSave = (newRFQ) => {
    setRfqs((prev) => [newRFQ, ...prev]);
    setView('list');
  };

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

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        activeNav={activeNav}
        onNav={(label) => {
          setActiveNav(label);
          // If navigating away from RFQ's reset to list
          if (label === "RFQ's") setView('list');
        }}
      />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Mobile menu trigger is inside each header — inject it here as overlay */}
        <div className="lg:hidden fixed top-0 left-0 z-40 p-3.5">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-500"
          >
            <Menu size={18} />
          </button>
        </div>

        {view === 'list' ? (
          <RFQList rfqs={rfqs} onCreateClick={() => setView('create')} />
        ) : (
          <CreateRFQForm onBack={() => setView('list')} onSave={handleSave} />
        )}
      </div>
    </div>
  );
}
