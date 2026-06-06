import { useState, useRef } from 'react';
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
  Download,
  Printer,
  Mail,
  CheckCircle2,
  Building2,
  BadgeCheck,
} from 'lucide-react';

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

const INVOICE = {
  poNumber: 'PO-2025-0068',
  poDate: '21 May 2025',
  invoiceDate: '22 May 2025',
  dueDate: '21 June 2025',
  buyer: {
    name: 'Your Organization Name',
    address: '123 Business Park, Ahmedabad',
    gstin: '25383438AFB',
  },
  vendor: {
    name: 'Infra Supplies Pvt Ltd',
    address: '456, Industrial Estate, Surat',
    gstin: '343434DB4523',
  },
  items: [
    { id: 1, name: 'Ergonomic Chair', qty: 25, unitPrice: 3500 },
    { id: 2, name: 'Standing Desk', qty: 10, unitPrice: 8200 },
  ],
  cgstPct: 9,
  sgstPct: 9,
};

function calcTotals(items, cgstPct, sgstPct) {
  const subtotal = items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
  const cgst = Math.round((subtotal * cgstPct) / 100);
  const sgst = Math.round((subtotal * sgstPct) / 100);
  return { subtotal, cgst, sgst, grand: subtotal + cgst + sgst };
}

const fmt = (n) => n.toLocaleString('en-IN');

function EmailModal({ onClose, onSend }) {
  const [to, setTo] = useState('vendor@infrasupplies.com');
  const [subject, setSubj] = useState(`Invoice ${INVOICE.poNumber} – VendorBridge`);
  const [body, setBody] = useState(
    'Please find attached the invoice for the above PO. Kindly confirm receipt.'
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Email Invoice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        </div>
        {[
          { label: 'To', val: to, set: setTo, type: 'input' },
          { label: 'Subject', val: subject, set: setSubj, type: 'input' },
        ].map(({ label, val, set, type }) => (
          <div key={label}>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
            <input
              value={val}
              onChange={(e) => set(e.target.value)}
              type={type}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
            />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Message</label>
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button
            onClick={onSend}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)' }}
          >
            <Mail size={14} />
            Send Invoice
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function POInvoicePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Invoices');
  const [paid, setPaid] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const printRef = useRef(null);

  const { subtotal, cgst, sgst, grand } = calcTotals(
    INVOICE.items,
    INVOICE.cgstPct,
    INVOICE.sgstPct
  );

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Invoice ${INVOICE.poNumber}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',sans-serif; font-size:12px; color:#111; padding:32px; }
        table { width:100%; border-collapse:collapse; }
        th,td { border:1px solid #e5e7eb; padding:8px 12px; text-align:left; }
        th { background:#f9fafb; font-weight:600; font-size:11px; text-transform:uppercase; }
        .right { text-align:right; }
        .total-row td { font-weight:600; }
        .grand td { font-weight:700; font-size:14px; }
        h1 { font-size:20px; margin-bottom:4px; }
        .meta { display:flex; justify-content:space-between; margin:20px 0; }
        .meta div { line-height:1.6; }
        .label { font-size:10px; font-weight:600; color:#6b7280; text-transform:uppercase; letter-spacing:.05em; margin-bottom:4px; }
      </style></head>
      <body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
    win.close();
  };

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
      {showEmail && (
        <EmailModal
          onClose={() => setShowEmail(false)}
          onSend={() => {
            setShowEmail(false);
            setEmailSent(true);
            setTimeout(() => setEmailSent(false), 3000);
          }}
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
                Purchase Order &amp; Invoice
              </h1>
              <p className="text-xs text-gray-500">
                <span className="font-medium text-blue-600">{INVOICE.poNumber}</span>
                <span className="mx-1.5 text-gray-300">·</span>
                Auto-generated after approval
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Action buttons */}
            <button
              onClick={handlePrint}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all"
            >
              <Printer size={13} />
              Print
            </button>
            <button className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all">
              <Download size={13} />
              Download PDF
            </button>
            <button
              onClick={() => setShowEmail(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)' }}
            >
              <Mail size={13} />
              Email Invoice
            </button>
            <button className="relative p-2 rounded-lg hover:bg-gray-50 lg:ml-1">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Email sent toast */}
          {emailSent && (
            <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-3 rounded-xl">
              <CheckCircle2 size={14} />
              Invoice emailed to <span className="font-bold">vendor@infrasupplies.com</span>
            </div>
          )}

          {/* ── Invoice document ── */}
          <div
            ref={printRef}
            className="bg-white rounded-xl border border-gray-100 overflow-hidden"
          >
            {/* Document header band */}
            <div
              className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
              style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}
            >
              <div>
                <p className="text-white font-bold text-base tracking-tight">VendorBridge</p>
                <p className="text-blue-200 text-[11px] mt-0.5">
                  Procurement & Vendor Management ERP
                </p>
              </div>
              <div className="text-right">
                <p className="text-white font-bold text-lg">{INVOICE.poNumber}</p>
                <p className="text-blue-200 text-[11px]">Purchase Order &amp; Invoice</p>
              </div>
            </div>

            {/* Bill-to + Vendor + PO meta */}
            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-gray-100">
              {/* Bill to */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Bill To
                </p>
                <p className="text-sm font-bold text-gray-800">{INVOICE.buyer.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                  {INVOICE.buyer.address}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  GSTIN:{' '}
                  <span className="font-mono font-semibold text-gray-600">
                    {INVOICE.buyer.gstin}
                  </span>
                </p>
              </div>
              {/* Vendor */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Vendor
                </p>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                    IS
                  </div>
                  <p className="text-sm font-bold text-gray-800">{INVOICE.vendor.name}</p>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{INVOICE.vendor.address}</p>
                <p className="text-xs text-gray-400 mt-1">
                  GSTIN:{' '}
                  <span className="font-mono font-semibold text-gray-600">
                    {INVOICE.vendor.gstin}
                  </span>
                </p>
              </div>
            </div>

            {/* PO / Invoice dates */}
            <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50/60 border-b border-gray-100">
              {[
                { label: 'PO Number', value: INVOICE.poNumber },
                { label: 'PO Date', value: INVOICE.poDate },
                { label: 'Invoice Date', value: INVOICE.invoiceDate },
                { label: 'Due Date', value: INVOICE.dueDate },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                    {label}
                  </p>
                  <p className="text-xs font-semibold text-gray-700 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Line items table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm" style={{ minWidth: '480px' }}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {['#', 'Item', 'Qty', 'Unit Price', 'Total'].map((h, i) => (
                      <th
                        key={h}
                        className={`text-[11px] font-semibold text-gray-500 uppercase tracking-wider py-3 ${i === 0 ? 'pl-6 pr-2 w-8' : i === 1 ? 'px-3 text-left' : i === 4 ? 'px-6 text-right' : 'px-3 text-right'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {INVOICE.items.map((item, idx) => {
                    const total = item.qty * item.unitPrice;
                    return (
                      <tr
                        key={item.id}
                        className="border-t border-gray-50 hover:bg-gray-50/40 transition-colors"
                      >
                        <td className="pl-6 pr-2 py-3.5 text-xs text-gray-400 font-medium">
                          {idx + 1}
                        </td>
                        <td className="px-3 py-3.5">
                          <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                        </td>
                        <td className="px-3 py-3.5 text-xs text-gray-600 text-right font-medium">
                          {item.qty}
                        </td>
                        <td className="px-3 py-3.5 text-xs text-gray-600 text-right font-medium">
                          ₹{fmt(item.unitPrice)}
                        </td>
                        <td className="px-6 py-3.5 text-xs font-semibold text-gray-800 text-right">
                          ₹{fmt(total)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Totals section */}
            <div className="border-t border-gray-100 px-6 py-4">
              <div className="ml-auto max-w-xs space-y-2.5">
                {[
                  { label: 'Subtotal', value: `₹${fmt(subtotal)}`, bold: false },
                  { label: `CGST (${INVOICE.cgstPct}%)`, value: `₹${fmt(cgst)}`, bold: false },
                  { label: `SGST (${INVOICE.sgstPct}%)`, value: `₹${fmt(sgst)}`, bold: false },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{label}</span>
                    <span className="text-xs font-semibold text-gray-700">{value}</span>
                  </div>
                ))}
                <div className="h-px bg-gray-200 my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Grand Total</span>
                  <span className="text-base font-bold" style={{ color: '#1d4ed8' }}>
                    ₹{fmt(grand)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer strip */}
            <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2 text-[11px] text-gray-400">
                <BadgeCheck size={13} className="text-blue-400" />
                Generated by VendorBridge · All figures in INR
              </div>
              <div className="text-[11px] text-gray-400">
                This is a computer-generated document and does not require a signature.
              </div>
            </div>
          </div>

          {/* Status + Mark as Paid */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Status:</span>
              {paid ? (
                <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                  <CheckCircle2 size={11} />
                  Paid
                </span>
              ) : (
                <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                  Pending Payment
                </span>
              )}
            </div>
            {!paid && (
              <button
                onClick={() => setPaid(true)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline underline-offset-2 transition-colors"
              >
                Mark as Paid
              </button>
            )}

            {/* Mobile action buttons */}
            <div className="flex items-center gap-2 ml-auto sm:hidden">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all"
              >
                <Printer size={12} />
                Print
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all">
                <Download size={12} />
                PDF
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
