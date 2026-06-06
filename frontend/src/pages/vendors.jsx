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
  Search,
  Plus,
  Eye,
  ChevronRight,
  Bell,
  Menu,
  X,
  Building2,
  Filter,
  Download,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Vendors', icon: Users, active: true },
  { label: "RFQ's", icon: FileText },
  { label: 'Quotations', icon: ClipboardList },
  { label: 'Approvals', icon: CheckSquare },
  { label: 'Purchase Orders', icon: ShoppingCart },
  { label: 'Invoices', icon: Receipt },
  { label: 'Reports', icon: BarChart2 },
  { label: 'Activity', icon: Activity },
];

const vendors = [
  {
    id: 'V-001',
    name: 'Infra Supplies Pvt Ltd',
    category: 'Construction',
    gst: '27AABCS1429B2Z0',
    contact: '+91 98765 43210',
    status: 'Active',
    since: 'Jan 2023',
  },
  {
    id: 'V-002',
    name: 'Tech Core Ltd',
    category: 'IT',
    gst: '27AABCS1429B2Z0',
    contact: '+91 91234 56789',
    status: 'Active',
    since: 'Mar 2023',
  },
  {
    id: 'V-003',
    name: 'FastLog Transport',
    category: 'Logistics',
    gst: '27AABCS1429B2Z0',
    contact: '+91 87654 32109',
    status: 'Blocked',
    since: 'Jul 2022',
  },
  {
    id: 'V-004',
    name: 'OfficeNeed Co',
    category: 'Office Supplies',
    gst: '27AABCS1429B2Z0',
    contact: '+91 99001 23456',
    status: 'Active',
    since: 'Feb 2024',
  },
  {
    id: 'V-005',
    name: 'BuildRight Infra',
    category: 'Construction',
    gst: '27AABCS1429B2Z0',
    contact: '+91 70123 45678',
    status: 'Pending',
    since: 'May 2024',
  },
  {
    id: 'V-006',
    name: 'SkyNet Solutions',
    category: 'IT',
    gst: '27AABCS1429B2Z0',
    contact: '+91 88800 11223',
    status: 'Pending',
    since: 'Apr 2024',
  },
  {
    id: 'V-007',
    name: 'Prime Electricals',
    category: 'Electrical',
    gst: '27AABCS1429B2Z0',
    contact: '+91 96543 21098',
    status: 'Active',
    since: 'Nov 2022',
  },
  {
    id: 'V-008',
    name: 'ClearWave Telecom',
    category: 'IT',
    gst: '27AABCS1429B2Z0',
    contact: '+91 93322 11445',
    status: 'Blocked',
    since: 'Jun 2021',
  },
];

const statusConfig = {
  Active: { color: '#10b981', bg: '#d1fae5', dot: '#10b981' },
  Pending: { color: '#f59e0b', bg: '#fef3c7', dot: '#f59e0b' },
  Blocked: { color: '#ef4444', bg: '#fee2e2', dot: '#ef4444' },
};

const tabs = ['All', 'Active', 'Pending', 'Blocked'];
const tabCounts = { All: 28, Active: 21, Pending: 4, Blocked: 3 };

export default function VendorsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Vendors');
  const [activeTab, setActiveTab] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = vendors.filter((v) => {
    const matchTab = activeTab === 'All' || v.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      v.name.toLowerCase().includes(q) ||
      v.gst.toLowerCase().includes(q) ||
      v.category.toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  return (
    <div
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
      className="flex h-screen bg-gray-50 overflow-hidden"
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-56 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
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
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-gray-600"
          >
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
                setActiveNav(label);
                setSidebarOpen(false);
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

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95"
              style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}
            >
              <Plus size={15} />
              Add Vendor
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Search + actions row */}
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
                placeholder="Search by name, GST number, category..."
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
              <button
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
                onClick={() => setActiveTab(tab)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${
                  activeTab === tab
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                {tab}
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activeTab === tab ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {tabCounts[tab]}
                </span>
              </button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-160">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3.5">
                      Vendor Name
                    </th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-3.5">
                      Category
                    </th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-3.5">
                      GST No.
                    </th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-3.5">
                      Contact No.
                    </th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-3.5">
                      Status
                    </th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-3.5 pr-5">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-16 text-gray-400 text-sm">
                        <Building2 size={32} className="mx-auto mb-3 text-gray-200" />
                        No vendors found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((vendor) => (
                      <tr
                        key={vendor.id}
                        className="border-t border-gray-50 hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
                              style={{
                                background: `linear-gradient(135deg, ${statusConfig[vendor.status].dot}99, ${statusConfig[vendor.status].dot})`,
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
                            {vendor.category}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 text-xs text-gray-500 font-mono">
                          {vendor.gst}
                        </td>
                        <td className="px-3 py-3.5 text-xs text-gray-600">{vendor.contact}</td>
                        <td className="px-3 py-3.5">
                          <span
                            className="flex items-center gap-1.5 w-fit text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{
                              color: statusConfig[vendor.status].color,
                              background: statusConfig[vendor.status].bg,
                            }}
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full shrink-0"
                              style={{ background: statusConfig[vendor.status].dot }}
                            />
                            {vendor.status}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 pr-5">
                          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50 transition-all">
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

            {/* Table footer */}
            <div className="px-5 py-3.5 border-t border-gray-100 flex items-center justify-between bg-gray-50/50">
              <p className="text-[11px] text-gray-400">
                Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of{' '}
                <span className="font-semibold text-gray-600">{tabCounts[activeTab]}</span> vendors
              </p>
              <div className="flex items-center gap-1">
                <button
                  className="px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-40"
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
                <button className="px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
                  2
                </button>
                <button className="px-2.5 py-1 text-xs font-medium text-gray-500 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors">
                  Next
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
