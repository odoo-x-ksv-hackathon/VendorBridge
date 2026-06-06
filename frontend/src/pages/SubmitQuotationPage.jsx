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
  Trash2,
  Plus,
  Check,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard },
  { label: 'Vendors', icon: Users },
  { label: "RFQ's", icon: FileText },
  { label: 'Quotations', icon: ClipboardList, active: true },
  { label: 'Approvals', icon: CheckSquare },
  { label: 'Purchase Orders', icon: ShoppingCart },
  { label: 'Invoices', icon: Receipt },
  { label: 'Reports', icon: BarChart2 },
  { label: 'Activity', icon: Activity },
];

const RFQ_CONTEXT = {
  id: 'RFQ-2025-001',
  title: 'Office Furniture Procurement Q2',
  deadline: '15 Jun 2025',
  category: 'Furniture',
  summary: 'Ergonomic chair × 25, Standing desk × 10 — Category: Furniture',
  items: [
    { id: 1, item: 'Ergonomic Chair', qty: 25 },
    { id: 2, item: 'Standing Desk', qty: 10 },
  ],
};

export default function SubmitQuotationPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Quotations');
  const [submitted, setSubmitted] = useState(false);

  const [gst, setGst] = useState('18');
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState(
    RFQ_CONTEXT.items.map((i) => ({ ...i, unitPrice: '', delivery: '' }))
  );

  const updateRow = (id, field, value) =>
    setRows((p) => p.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const addRow = () =>
    setRows((p) => [...p, { id: Date.now(), item: '', qty: 1, unitPrice: '', delivery: '' }]);

  const removeRow = (id) => setRows((p) => p.filter((r) => r.id !== id));

  const subtotal = rows.reduce(
    (s, r) => s + (parseFloat(r.unitPrice) || 0) * (parseFloat(r.qty) || 0),
    0
  );
  const gstAmt = (subtotal * (parseFloat(gst) || 0)) / 100;
  const grandTotal = subtotal + gstAmt;

  const fmt = (n) => n.toLocaleString('en-IN', { maximumFractionDigits: 0 });

  if (submitted) {
    return (
      <div
        style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}
        className="flex h-screen bg-gray-50 items-center justify-center"
      >
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
            <Check size={28} className="text-green-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Quotation Submitted</h2>
          <p className="text-xs text-gray-500 text-center">
            Your quotation for{' '}
            <span className="font-semibold text-gray-700">{RFQ_CONTEXT.title}</span> has been
            submitted successfully.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white"
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
              VN
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">Vendor Name</p>
              <p className="text-[10px] text-gray-400 truncate">vendor@company.com</p>
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
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Submit Quotation</h1>
              <p className="text-xs text-gray-500">
                RFQ: <span className="font-medium text-gray-700">{RFQ_CONTEXT.title}</span>
                <span className="mx-1.5 text-gray-300">·</span>
                Deadline <span className="font-medium text-red-500">{RFQ_CONTEXT.deadline}</span>
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
              VN
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* RFQ Summary banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 flex items-start gap-3">
            <FileText size={15} className="text-blue-500 mt-0.5 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-blue-800 mb-0.5">RFQ Summary</p>
              <p className="text-xs text-blue-600">{RFQ_CONTEXT.summary}</p>
            </div>
            <span className="ml-auto shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-purple-100 text-purple-700">
              {RFQ_CONTEXT.category}
            </span>
          </div>

          {/* Quotation line items */}
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
              <h2 className="text-sm font-bold text-gray-800">Your Quotation</h2>
              <span className="text-[11px] font-medium text-gray-400">
                {rows.length} item{rows.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-140">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['Item', 'Qty', 'Unit Price (₹)', 'Total (₹)', 'Delivery (days)', ''].map(
                      (h) => (
                        <th
                          key={h}
                          className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-4 py-3"
                        >
                          {h}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const total = (parseFloat(row.unitPrice) || 0) * (parseFloat(row.qty) || 0);
                    return (
                      <tr key={row.id} className="border-t border-gray-50 group">
                        <td className="px-4 py-2.5">
                          <input
                            type="text"
                            value={row.item}
                            onChange={(e) => updateRow(row.id, 'item', e.target.value)}
                            className="w-full min-w-32.5 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            placeholder="Item name"
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="number"
                            value={row.qty}
                            onChange={(e) => updateRow(row.id, 'qty', e.target.value)}
                            className="w-16 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            min={1}
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-medium">
                              ₹
                            </span>
                            <input
                              type="number"
                              value={row.unitPrice}
                              onChange={(e) => updateRow(row.id, 'unitPrice', e.target.value)}
                              className="w-28 pl-6 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                              placeholder="0"
                            />
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          <span className="text-xs font-semibold text-gray-700">
                            {total > 0 ? (
                              `₹${fmt(total)}`
                            ) : (
                              <span className="text-gray-300 font-normal">—</span>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-2.5">
                          <input
                            type="number"
                            value={row.delivery}
                            onChange={(e) => updateRow(row.id, 'delivery', e.target.value)}
                            className="w-20 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                            placeholder="0"
                            min={1}
                          />
                        </td>
                        <td className="px-4 py-2.5">
                          <button
                            onClick={() => removeRow(row.id)}
                            className="p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="px-5 py-3 border-t border-gray-50">
              <button
                onClick={addRow}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Plus size={14} />
                Add line item
              </button>
            </div>
          </div>

          {/* Tax / Notes / Summary row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Tax + Notes */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Tax / GST %
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={gst}
                    onChange={(e) => setGst(e.target.value)}
                    className="w-28 px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    placeholder="0"
                    min={0}
                    max={100}
                  />
                  <span className="text-sm font-semibold text-gray-400">%</span>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Notes / Terms
                </label>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
                  placeholder="e.g. Payment terms: 20 days net, warranty details, delivery conditions..."
                />
              </div>
            </div>

            {/* Right: Price summary */}
            <div className="bg-white rounded-xl border border-gray-100 p-5 flex flex-col justify-between">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Price Summary
              </h2>
              <div className="space-y-3 flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-sm font-semibold text-gray-800">₹{fmt(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">GST ({gst || 0}%)</span>
                  <span className="text-sm font-semibold text-gray-800">₹{fmt(gstAmt)}</span>
                </div>
                <div className="h-px bg-gray-100 my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Grand Total</span>
                  <span className="text-base font-bold" style={{ color: '#1d4ed8' }}>
                    ₹{fmt(grandTotal)}
                  </span>
                </div>
              </div>

              {/* Validity note */}
              <div className="mt-5 pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-gray-600 shrink-0">
                    Quote valid for
                  </label>
                  <input
                    type="number"
                    defaultValue={30}
                    className="w-16 px-2.5 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    min={1}
                  />
                  <span className="text-xs text-gray-400">days</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSubmitted(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95"
                style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)' }}
              >
                <Check size={15} />
                Submit Quotation
              </button>
              <button className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95">
                Save Draft
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
