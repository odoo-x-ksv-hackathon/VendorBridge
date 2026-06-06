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
  Plus,
  UserPlus,
  Eye,
  TrendingUp,
  AlertCircle,
  Clock,
  Menu,
  X,
  Bell,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Vendors', icon: Users },
  { label: "RFQ's", icon: FileText },
  { label: 'Quotations', icon: ClipboardList },
  { label: 'Approvals', icon: CheckSquare },
  { label: 'Purchase Orders', icon: ShoppingCart },
  { label: 'Invoices', icon: Receipt },
  { label: 'Reports', icon: BarChart2 },
  { label: 'Activity', icon: Activity },
];

const stats = [
  {
    label: "Active RFQ's",
    value: '12',
    icon: FileText,
    color: '#3b82f6',
    bg: '#eff6ff',
    trend: '+3 this week',
  },
  {
    label: 'Pending Approvals',
    value: '5',
    icon: Clock,
    color: '#f59e0b',
    bg: '#fffbeb',
    trend: '2 urgent',
  },
  {
    label: "PO's This Month",
    value: '₹2.3L',
    icon: ShoppingCart,
    color: '#10b981',
    bg: '#ecfdf5',
    trend: '+12% vs last month',
  },
  {
    label: 'Overdue Invoices',
    value: '3',
    icon: AlertCircle,
    color: '#ef4444',
    bg: '#fef2f2',
    trend: 'Action needed',
  },
];

const recentPOs = [
  { id: 'PO-001', vendor: 'Infra Supplies', amount: '₹87,000', status: 'Approved' },
  { id: 'PO-002', vendor: 'Tech Core Ltd', amount: '₹1,40,000', status: 'Pending' },
  { id: 'PO-003', vendor: 'OfficeNeed Co', amount: '₹34,900', status: 'Draft' },
  { id: 'PO-004', vendor: 'Globe Traders', amount: '₹62,500', status: 'Approved' },
];

const statusConfig = {
  Approved: { color: '#10b981', bg: '#d1fae5' },
  Pending: { color: '#f59e0b', bg: '#fef3c7' },
  Draft: { color: '#6b7280', bg: '#f3f4f6' },
};

const spendingData = [
  { month: 'Jan', amount: 1.2 },
  { month: 'Feb', amount: 1.8 },
  { month: 'Mar', amount: 1.4 },
  { month: 'Apr', amount: 2.1 },
  { month: 'May', amount: 1.9 },
  { month: 'Jun', amount: 2.3 },
];

const categoryData = [
  { name: 'IT Equipment', value: 40, color: '#3b82f6' },
  { name: 'Office Supplies', value: 25, color: '#10b981' },
  { name: 'Infrastructure', value: 20, color: '#f59e0b' },
  { name: 'Others', value: 15, color: '#8b5cf6' },
];

export default function ProcurementDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Dashboard');

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
        className={`fixed lg:static inset-y-0 left-0 z-30 w-56 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
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

        {/* Nav */}
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
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 group ${
                activeNav === label
                  ? 'text-blue-700 bg-blue-50'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
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

        {/* User badge */}
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

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Dashboard</h1>
              <p className="text-xs text-gray-500">
                Welcome back, Procurement Officer — Today's Overview
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #06b6d4)' }}
            >
              PO
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <main className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Stat Cards */}
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map(({ label, value, icon: Icon, color, bg, trend }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: bg }}
                  >
                    <Icon size={18} style={{ color }} />
                  </div>
                  <ArrowUpRight size={14} className="text-gray-300" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 leading-none">{value}</p>
                  <p className="text-xs text-gray-500 mt-1">{label}</p>
                </div>
                <p className="text-[11px] font-medium" style={{ color }}>
                  {trend}
                </p>
              </div>
            ))}
          </div>

          {/* Middle row: PO Table + Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Recent Purchase Orders */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-sm font-bold text-gray-800">Recent Purchase Orders</h2>
                <button className="text-[11px] font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View all <ChevronRight size={12} />
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                        PO #
                      </th>
                      <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-3">
                        Vendor
                      </th>
                      <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-3">
                        Amount
                      </th>
                      <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-3 py-3 pr-5">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentPOs.map((po, i) => (
                      <tr
                        key={po.id}
                        className="border-t border-gray-50 hover:bg-gray-50/70 transition-colors cursor-pointer"
                      >
                        <td className="px-5 py-3.5 font-semibold text-blue-600 text-xs">{po.id}</td>
                        <td className="px-3 py-3.5 text-gray-700 text-xs">{po.vendor}</td>
                        <td className="px-3 py-3.5 font-semibold text-gray-800 text-xs">
                          {po.amount}
                        </td>
                        <td className="px-3 py-3.5 pr-5">
                          <span
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-full"
                            style={{
                              color: statusConfig[po.status].color,
                              background: statusConfig[po.status].bg,
                            }}
                          >
                            {po.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Spending Trends */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="text-sm font-bold text-gray-800">Spending Trends</h2>
                <p className="text-[11px] text-gray-400 mt-0.5">Last 6 months (₹ Lakhs)</p>
              </div>
              <div className="p-4 space-y-4">
                <ResponsiveContainer width="100%" height={110}>
                  <LineChart
                    data={spendingData}
                    margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="month"
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        fontSize: 11,
                        border: 'none',
                        borderRadius: 8,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(v) => [`₹${v}L`, 'Spend']}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#3b82f6"
                      strokeWidth={2.5}
                      dot={{ fill: '#3b82f6', r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>

                {/* Category pie */}
                <div className="flex items-center gap-3">
                  <ResponsiveContainer width={80} height={80}>
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={22}
                        outerRadius={38}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex flex-col gap-1 flex-1">
                    {categoryData.map((d) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ background: d.color }}
                        />
                        <span className="text-[10px] text-gray-500 truncate">{d.name}</span>
                        <span className="text-[10px] font-bold text-gray-700 ml-auto">
                          {d.value}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <button
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-md active:scale-95"
                style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}
              >
                <Plus size={15} />
                New RFQ
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-95">
                <UserPlus size={15} className="text-gray-500" />
                Add Vendor
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-95">
                <Eye size={15} className="text-gray-500" />
                View Invoices
              </button>
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 active:scale-95">
                <TrendingUp size={15} className="text-gray-500" />
                Reports
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
