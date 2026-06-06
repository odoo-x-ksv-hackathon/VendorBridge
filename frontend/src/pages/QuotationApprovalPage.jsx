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
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  Building2,
  Star,
  Truck,
  MessageSquare,
  ChevronDown,
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
const APPROVAL = {
  rfq: 'Office Furniture Procurement Q2',
  vendor: 'Infra Supplies Pvt Ltd',
  amount: 185000,
  quotation: {
    vendor: 'Infra Supplies PVT LTD',
    total: '₹1,85,400',
    delivery: '10 days',
    rating: '4.5/5',
    gst: '18%',
    paymentTerms: '30 days',
  },
};

const INITIAL_CHAIN = [
  {
    id: 1,
    name: 'Rahul Mehta',
    role: 'Procurement Head',
    initials: 'RM',
    status: 'approved',
    remark: 'Looks good. Proceeding to finance review.',
    date: 'May 20, 10:32 AM',
  },
  {
    id: 2,
    name: 'Priya Shah',
    role: 'Finance Manager',
    initials: 'PS',
    status: 'pending',
    remark: '',
    date: 'Assigned May 21',
  },
  {
    id: 3,
    name: 'Amit Verma',
    role: 'Director',
    initials: 'AV',
    status: 'waiting',
    remark: '',
    date: '',
  },
];

const statusMeta = {
  approved: {
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    ring: 'ring-emerald-200',
    label: 'Approved',
  },
  pending: {
    icon: Clock,
    color: 'text-amber-500',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    ring: 'ring-amber-200',
    label: 'Awaiting',
  },
  rejected: {
    icon: XCircle,
    color: 'text-red-500',
    bg: 'bg-red-50',
    border: 'border-red-200',
    ring: 'ring-red-200',
    label: 'Rejected',
  },
  waiting: {
    icon: Clock,
    color: 'text-gray-400',
    bg: 'bg-gray-50',
    border: 'border-gray-200',
    ring: 'ring-gray-100',
    label: 'Waiting',
  },
};

function StarRating({ value }) {
  const num = parseFloat(value);
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={10}
          className={
            i <= Math.round(num) ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'
          }
        />
      ))}
    </span>
  );
}

export default function ApprovalWorkflowPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeNav, setActiveNav] = useState('Approvals');
  const [chain, setChain] = useState(INITIAL_CHAIN);
  const [remarks, setRemarks] = useState('');
  const [finalStatus, setFinalStatus] = useState(null); // 'approved' | 'rejected'
  const [expandedId, setExpandedId] = useState(null);

  const pendingIdx = chain.findIndex((c) => c.status === 'pending');

  const handleAction = (action) => {
    if (pendingIdx === -1) return;
    const updated = chain.map((c, i) => {
      if (i === pendingIdx)
        return {
          ...c,
          status: action,
          remark: remarks,
          date: new Date().toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      if (action === 'approved' && i === pendingIdx + 1)
        return { ...c, status: 'pending', date: 'Just assigned' };
      return c;
    });
    setChain(updated);
    setRemarks('');
    // if last approver or rejected → finalise
    const allApproved = updated.every((c) => c.status === 'approved');
    if (action === 'rejected') setFinalStatus('rejected');
    else if (allApproved) setFinalStatus('approved');
  };

  // ── Final state screens ──────────────────────────────────────────────
  if (finalStatus) {
    const isApproved = finalStatus === 'approved';
    return (
      <div
        style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }}
        className="flex h-screen bg-gray-50 items-center justify-center"
      >
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 flex flex-col items-center gap-4 max-w-sm w-full mx-4">
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center ${isApproved ? 'bg-green-50' : 'bg-red-50'}`}
          >
            {isApproved ? (
              <CheckCircle2 size={28} className="text-green-500" />
            ) : (
              <XCircle size={28} className="text-red-400" />
            )}
          </div>
          <h2 className="text-lg font-bold text-gray-900">
            {isApproved ? 'Fully Approved' : 'Rejected'}
          </h2>
          <p className="text-xs text-gray-500 text-center">
            {isApproved
              ? 'All approvers have signed off. A Purchase Order will now be generated.'
              : 'This quotation has been rejected and the procurement officer has been notified.'}
          </p>
          {isApproved && (
            <button
              className="mt-1 px-6 py-2.5 rounded-lg text-sm font-semibold text-white w-full"
              style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)' }}
            >
              Generate Purchase Order
            </button>
          )}
          <button
            onClick={() => {
              setFinalStatus(null);
              setChain(INITIAL_CHAIN);
            }}
            className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            Back to Approvals
          </button>
        </div>
      </div>
    );
  }

  const activePending = chain[pendingIdx];

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
              PS
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800 truncate">Priya Shah</p>
              <p className="text-[10px] text-gray-400 truncate">finance@company.com</p>
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
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Approval Workflow</h1>
              <p className="text-xs text-gray-500">
                RFQ: <span className="font-medium text-gray-700">{APPROVAL.rfq}</span>
                <span className="mx-1.5 text-gray-300">·</span>
                Vendor: <span className="font-medium text-gray-700">{APPROVAL.vendor}</span>
                <span className="mx-1.5 text-gray-300">·</span>
                <span className="font-semibold text-blue-600">
                  ₹{APPROVAL.amount.toLocaleString('en-IN')}
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
              PS
            </div>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* LEFT — Approval chain + remarks */}
            <div className="space-y-5">
              {/* Approval chain */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Approval Chain
                </p>

                <div className="space-y-1">
                  {chain.map((approver, idx) => {
                    const meta = statusMeta[approver.status];
                    const Icon = meta.icon;
                    const isLast = idx === chain.length - 1;
                    const isExpanded = expandedId === approver.id;

                    return (
                      <div key={approver.id}>
                        <div className="flex gap-3">
                          {/* Timeline spine */}
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ring-4 ${meta.ring}`}
                              style={{
                                background:
                                  approver.status === 'approved'
                                    ? '#10b981'
                                    : approver.status === 'rejected'
                                      ? '#ef4444'
                                      : approver.status === 'pending'
                                        ? '#f59e0b'
                                        : '#d1d5db',
                              }}
                            >
                              {approver.status === 'approved' ? (
                                <CheckCircle2 size={14} />
                              ) : approver.status === 'rejected' ? (
                                <XCircle size={14} />
                              ) : (
                                approver.initials.charAt(0)
                              )}
                            </div>
                            {!isLast && (
                              <div
                                className={`w-0.5 flex-1 my-1 min-h-5 rounded-full ${approver.status === 'approved' ? 'bg-emerald-200' : 'bg-gray-100'}`}
                              />
                            )}
                          </div>

                          {/* Content */}
                          <div className={`flex-1 pb-${isLast ? '0' : '3'}`}>
                            <div className="flex items-start justify-between gap-2 mb-0.5">
                              <div>
                                <p className="text-xs font-semibold text-gray-800">
                                  {approver.name}
                                </p>
                                <p className="text-[10px] text-gray-400">{approver.role}</p>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${meta.bg} ${meta.color}`}
                                >
                                  <Icon size={9} />
                                  {meta.label}
                                </span>
                                {approver.remark && (
                                  <button
                                    onClick={() => setExpandedId(isExpanded ? null : approver.id)}
                                    className="p-1 rounded-md hover:bg-gray-100 text-gray-400 transition-colors"
                                  >
                                    <ChevronDown
                                      size={12}
                                      className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-[10px] text-gray-400 mb-1">{approver.date}</p>

                            {/* Expanded remark */}
                            {isExpanded && approver.remark && (
                              <div className="mt-1.5 px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg">
                                <p className="text-[11px] text-gray-500 flex items-start gap-1.5">
                                  <MessageSquare
                                    size={10}
                                    className="text-gray-400 mt-0.5 shrink-0"
                                  />
                                  {approver.remark}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Remarks input — only show if there's a pending approver */}
              {activePending && (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                    Approval Remarks
                  </label>
                  <textarea
                    rows={4}
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Add your comments or conditions..."
                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5 flex items-center gap-1">
                    <AlertTriangle size={10} />
                    Remarks are optional but visible to all approvers in the chain.
                  </p>
                </div>
              )}

              {/* No more pending */}
              {!activePending && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                  <p className="text-xs font-medium text-emerald-700">
                    All approvers have reviewed this quotation.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT — Quotation summary + actions */}
            <div className="space-y-5">
              {/* Quotation Summary card */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-4">
                  Quotation Summary
                </p>

                <div className="space-y-3">
                  {[
                    {
                      label: 'Vendor',
                      value: APPROVAL.quotation.vendor,
                      icon: Building2,
                      highlight: false,
                    },
                    {
                      label: 'Total',
                      value: APPROVAL.quotation.total,
                      icon: null,
                      highlight: true,
                    },
                    { label: 'GST', value: APPROVAL.quotation.gst, icon: null, highlight: false },
                    {
                      label: 'Delivery',
                      value: APPROVAL.quotation.delivery,
                      icon: Truck,
                      highlight: false,
                    },
                    {
                      label: 'Payment Terms',
                      value: APPROVAL.quotation.paymentTerms,
                      icon: null,
                      highlight: false,
                    },
                  ].map(({ label, value, icon: Icon, highlight }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        {Icon && <Icon size={13} className="text-gray-400" />}
                        <span className="text-xs font-medium text-gray-500">{label}</span>
                      </div>
                      <span
                        className={`text-xs font-semibold ${highlight ? 'text-blue-600 text-sm' : 'text-gray-800'}`}
                      >
                        {value}
                      </span>
                    </div>
                  ))}

                  {/* Rating row */}
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-2">
                      <Star size={13} className="text-gray-400" />
                      <span className="text-xs font-medium text-gray-500">Rating</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating value={4.5} />
                      <span className="text-xs font-semibold text-gray-800">
                        {APPROVAL.quotation.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              {activePending && (
                <div className="bg-white rounded-xl border border-gray-100 p-5">
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
                    Awaiting: <span className="text-amber-600">{activePending.name}</span>
                  </p>
                  <p className="text-[10px] text-gray-400 mb-4">
                    {activePending.role} · {activePending.date}
                  </p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction('approved')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 hover:shadow-md active:scale-95"
                      style={{ background: 'linear-gradient(135deg,#059669 0%,#10b981 100%)' }}
                    >
                      <CheckCircle2 size={15} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction('rejected')}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-all active:scale-95"
                    >
                      <XCircle size={15} />
                      Reject
                    </button>
                  </div>
                </div>
              )}

              {/* Activity log */}
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Activity Timeline
                </p>
                <div className="space-y-3">
                  {chain
                    .filter((c) => c.status !== 'waiting')
                    .map((c) => {
                      const meta = statusMeta[c.status];
                      const Icon = meta.icon;
                      return (
                        <div key={c.id} className="flex items-start gap-2.5">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${meta.bg}`}
                          >
                            <Icon size={11} className={meta.color} />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-700">
                              {c.name}{' '}
                              <span className={`font-normal ${meta.color}`}>
                                {meta.label.toLowerCase()}
                              </span>
                            </p>
                            <p className="text-[10px] text-gray-400">{c.date}</p>
                            {c.remark && (
                              <p className="text-[10px] text-gray-500 mt-0.5 italic">
                                "{c.remark}"
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  <div className="flex items-start gap-2.5">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-blue-50">
                      <FileText size={11} className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700">
                        Quotation submitted for approval
                      </p>
                      <p className="text-[10px] text-gray-400">May 20, 9:15 AM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
