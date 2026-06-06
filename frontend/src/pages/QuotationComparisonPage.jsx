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
  Star,
  TrendingDown,
  CheckCircle2,
  Clock,
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

/* ─── Data ─────────────────────────────────────────────────────────────── */
const RFQ = {
  id: 'RFQ-2025-001',
  title: 'Office Furniture Procurement Q2',
  deadline: '15 Jun 2025',
  category: 'Furniture',
  quotationsCount: 3,
};

const QUOTATIONS = [
  {
    id: 'Q001',
    vendor: 'Infra Supplies Pvt Ltd',
    initials: 'IS',
    grandTotal: 185000,
    gst: 18,
    delivery: 10,
    vendorRating: 4.5,
    paymentTerms: '30 days',
    items: [
      { name: 'Ergonomic Chair', qty: 25, unitPrice: 3500, total: 87500 },
      { name: 'Standing Desk', qty: 10, unitPrice: 8200, total: 82000 },
    ],
    notes: 'Includes installation and 1-year warranty.',
    submittedAt: '03 Jun 2025',
  },
  {
    id: 'Q002',
    vendor: 'TechCore Ltd',
    initials: 'TC',
    grandTotal: 200010,
    gst: 18,
    delivery: 14,
    vendorRating: 4.2,
    paymentTerms: '30 days',
    items: [
      { name: 'Ergonomic Chair', qty: 25, unitPrice: 3800, total: 95000 },
      { name: 'Standing Desk', qty: 10, unitPrice: 8700, total: 87000 },
    ],
    notes: 'Standard delivery, no installation included.',
    submittedAt: '04 Jun 2025',
  },
  {
    id: 'Q003',
    vendor: 'OfficeNeed Co.',
    initials: 'ON',
    grandTotal: 214800,
    gst: 18,
    delivery: 7,
    vendorRating: 3.8,
    paymentTerms: '15 days',
    items: [
      { name: 'Ergonomic Chair', qty: 25, unitPrice: 4100, total: 102500 },
      { name: 'Standing Desk', qty: 10, unitPrice: 9100, total: 91000 },
    ],
    notes: 'Fastest delivery. Premium brand products.',
    submittedAt: '05 Jun 2025',
  },
];

const CRITERIA = [
  {
    key: 'grandTotal',
    label: 'Grand Total',
    format: (v) => `₹${v.toLocaleString('en-IN')}`,
    lowerBetter: true,
  },
  { key: 'gst', label: 'GST %', format: (v) => `${v}%`, lowerBetter: true },
  { key: 'delivery', label: 'Delivery (days)', format: (v) => `${v} days`, lowerBetter: true },
  { key: 'vendorRating', label: 'Vendor Rating', format: (v) => `${v}/5`, lowerBetter: false },
  { key: 'paymentTerms', label: 'Payment Terms', format: (v) => v, lowerBetter: null },
];

function StarRating({ value }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={10}
          className={
            i <= Math.round(value) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
          }
        />
      ))}
    </span>
  );
}

export default function QuotationComparisonPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Quotations');
  const [selected, setSelected] = useState(null);
  const [approved, setApproved] = useState(false);

  const lowestTotal = Math.min(...QUOTATIONS.map((q) => q.grandTotal));
  const fastestDelivery = Math.min(...QUOTATIONS.map((q) => q.delivery));
  const highestRating = Math.max(...QUOTATIONS.map((q) => q.vendorRating));

  const getBest = (key, lowerBetter) => {
    if (lowerBetter === null) return null;
    const vals = QUOTATIONS.map((q) => q[key]);
    return lowerBetter ? Math.min(...vals) : Math.max(...vals);
  };

  const handleSelect = (id) => setSelected(id);

  const handleApprove = () => {
    if (selected) setApproved(true);
  };

  if (approved) {
    const winner = QUOTATIONS.find((q) => q.id === selected);
    return (
      <div
        style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}
        className="flex h-screen bg-gray-50 items-center justify-center"
      >
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={28} className="text-green-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Sent for Approval</h2>
          <p className="text-xs text-gray-500 text-center">
            <span className="font-semibold text-gray-700">{winner?.vendor}</span>'s quotation of{' '}
            <span className="font-semibold text-blue-600">
              ₹{winner?.grandTotal.toLocaleString('en-IN')}
            </span>{' '}
            has been forwarded to the approval workflow.
          </p>
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 w-full justify-center">
            <Clock size={13} />
            Pending Manager Approval
          </div>
          <button
            onClick={() => {
              setApproved(false);
              setSelected(null);
            }}
            className="mt-1 px-6 py-2.5 rounded-lg text-sm font-semibold text-white w-full"
            style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)' }}
          >
            Back to Quotations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}
      className="flex h-screen bg-gray-50 overflow-hidden"
    >
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
              style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)' }}
            >
              VB
            </div>
            <span className="font-bold text-gray-900 text-sm tracking-tight">VendorBridge</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400">
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
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#06b6d4)' }}
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
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500">
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">
                Quotation Comparison
              </h1>
              <p className="text-xs text-gray-500">
                RFQ: <span className="font-medium text-gray-700">{RFQ.title}</span>
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="font-medium text-blue-600">
                  {RFQ.quotationsCount} quotations received
                </span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-gray-50">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'linear-gradient(135deg,#1d4ed8,#06b6d4)' }}
            >
              PO
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Summary stat pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              {
                label: 'Lowest Price',
                value: `₹${lowestTotal.toLocaleString('en-IN')}`,
                color: '#10b981',
                bg: '#d1fae5',
                icon: TrendingDown,
              },
              {
                label: 'Fastest Delivery',
                value: `${fastestDelivery} days`,
                color: '#3b82f6',
                bg: '#eff6ff',
                icon: Clock,
              },
              {
                label: 'Top Rated',
                value: `${highestRating}/5`,
                color: '#f59e0b',
                bg: '#fef3c7',
                icon: Star,
              },
            ].map(({ label, value, color, bg, icon: Icon }) => (
              <div
                key={label}
                className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex items-center gap-3"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: bg, color }}
                >
                  <Icon size={15} />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                  <p className="text-sm font-bold" style={{ color }}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: '640px' }}>
                <thead>
                  <tr className="border-b border-gray-100">
                    {/* Criteria header */}
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-4 bg-gray-50 w-36">
                      Criteria
                    </th>
                    {QUOTATIONS.map((q) => {
                      const isLowest = q.grandTotal === lowestTotal;
                      const isSelected = selected === q.id;
                      return (
                        <th
                          key={q.id}
                          className={`px-5 py-4 text-center transition-colors ${isLowest ? 'bg-emerald-50' : isSelected ? 'bg-blue-50' : 'bg-gray-50'}`}
                        >
                          <div className="flex flex-col items-center gap-1.5">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white`}
                              style={{ background: isLowest ? '#10b981' : '#3b82f6' }}
                            >
                              {q.initials}
                            </div>
                            <span
                              className={`text-xs font-bold leading-tight text-center ${isLowest ? 'text-emerald-700' : 'text-gray-800'}`}
                            >
                              {q.vendor}
                            </span>
                            {isLowest && (
                              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                                <TrendingDown size={9} />
                                Lowest
                              </span>
                            )}
                            <p className="text-[10px] text-gray-400">Submitted {q.submittedAt}</p>
                          </div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>

                <tbody>
                  {CRITERIA.map(({ key, label, format, lowerBetter }, ri) => {
                    const best = getBest(key, lowerBetter);
                    return (
                      <tr
                        key={key}
                        className={`border-t border-gray-50 ${ri % 2 === 0 ? '' : 'bg-gray-50/40'}`}
                      >
                        <td className="px-5 py-3.5 text-xs font-semibold text-gray-500 bg-gray-50/60">
                          {label}
                        </td>
                        {QUOTATIONS.map((q) => {
                          const val = q[key];
                          const isBest = lowerBetter !== null && val === best;
                          const isLowest = q.grandTotal === lowestTotal;
                          return (
                            <td
                              key={q.id}
                              className={`px-5 py-3.5 text-center transition-colors ${isLowest ? 'bg-emerald-50/60' : ''}`}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <span
                                  className={`text-sm font-semibold ${isBest ? (isLowest ? 'text-emerald-700' : 'text-blue-600') : 'text-gray-700'}`}
                                >
                                  {format(val)}
                                </span>
                                {key === 'vendorRating' && <StarRating value={val} />}
                                {isBest && key !== 'grandTotal' && (
                                  <span
                                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${isLowest ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-50 text-blue-500'}`}
                                  >
                                    Best
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}

                  {/* Item breakdown rows */}
                  <tr className="border-t border-gray-100 bg-gray-50">
                    <td
                      className="px-5 py-2.5 text-[11px] font-bold text-gray-500 uppercase tracking-wider"
                      colSpan={4}
                    >
                      Item Breakdown
                    </td>
                  </tr>
                  {RFQ &&
                    QUOTATIONS[0].items.map((_, itemIdx) => (
                      <tr
                        key={itemIdx}
                        className={`border-t border-gray-50 ${itemIdx % 2 === 0 ? '' : 'bg-gray-50/40'}`}
                      >
                        <td className="px-5 py-3 text-xs font-medium text-gray-500 bg-gray-50/60">
                          {QUOTATIONS[0].items[itemIdx].name}
                        </td>
                        {QUOTATIONS.map((q) => {
                          const item = q.items[itemIdx];
                          const isLowest = q.grandTotal === lowestTotal;
                          const prices = QUOTATIONS.map(
                            (x) => x.items[itemIdx]?.unitPrice || Infinity
                          );
                          const isCheapest = item?.unitPrice === Math.min(...prices);
                          return (
                            <td
                              key={q.id}
                              className={`px-5 py-3 text-center ${isLowest ? 'bg-emerald-50/60' : ''}`}
                            >
                              {item ? (
                                <div className="flex flex-col items-center gap-0.5">
                                  <span
                                    className={`text-xs font-semibold ${isCheapest ? 'text-emerald-700' : 'text-gray-700'}`}
                                  >
                                    ₹{item.unitPrice.toLocaleString('en-IN')}/unit
                                  </span>
                                  <span className="text-[10px] text-gray-400">Qty: {item.qty}</span>
                                </div>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}

                  {/* Notes row */}
                  <tr className="border-t border-gray-100">
                    <td className="px-5 py-3.5 text-xs font-semibold text-gray-500 bg-gray-50/60">
                      Notes
                    </td>
                    {QUOTATIONS.map((q) => {
                      const isLowest = q.grandTotal === lowestTotal;
                      return (
                        <td
                          key={q.id}
                          className={`px-5 py-3.5 text-center ${isLowest ? 'bg-emerald-50/60' : ''}`}
                        >
                          <p className="text-[11px] text-gray-500 leading-relaxed">{q.notes}</p>
                        </td>
                      );
                    })}
                  </tr>

                  {/* CTA row */}
                  <tr className="border-t border-gray-100">
                    <td className="px-5 py-4 bg-gray-50/60" />
                    {QUOTATIONS.map((q) => {
                      const isLowest = q.grandTotal === lowestTotal;
                      const isSelected = selected === q.id;
                      return (
                        <td
                          key={q.id}
                          className={`px-5 py-4 text-center ${isLowest ? 'bg-emerald-50/60' : ''}`}
                        >
                          {isSelected ? (
                            <div className="flex flex-col items-center gap-2">
                              <button
                                onClick={handleApprove}
                                className="w-full max-w-40 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95"
                                style={{
                                  background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)',
                                }}
                              >
                                <CheckCircle2 size={13} />
                                Select & Approve
                              </button>
                              <button
                                onClick={() => setSelected(null)}
                                className="text-[10px] text-gray-400 hover:text-gray-600 transition-colors"
                              >
                                Deselect
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleSelect(q.id)}
                              className={`w-full max-w-35 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all hover:shadow-sm active:scale-95 ${isLowest ? 'border-emerald-300 text-emerald-700 bg-white hover:bg-emerald-50' : 'border-gray-200 text-gray-600 bg-white hover:bg-gray-50 hover:border-gray-300'}`}
                            >
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
        </main>
      </div>
    </div>
  );
}
