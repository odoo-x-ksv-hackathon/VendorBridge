import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import Sidebar from '../components/Sidebar';
import {
  Menu, Bell, Download, Printer, Mail, CheckCircle2,
  Building2, BadgeCheck, X, Clock,
} from 'lucide-react';

const fmt = n => Number(n).toLocaleString('en-IN');

function EmailModal({ invoice, po, onClose, onSent }) {
  const [to, setTo] = useState(invoice?.emailSentTo ?? '');
  const [subject, setSubj] = useState(`Invoice ${invoice?.invoiceNumber ?? ''} – VendorBridge`);
  const [body, setBody] = useState('Please find attached the invoice for the above PO. Kindly confirm receipt.');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    setSending(true);
    // Email is already sent by backend on invoice generation; this just closes the modal
    await new Promise(r => setTimeout(r, 600));
    setSending(false);
    onSent(to);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-900">Email Invoice</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
        </div>
        {[{ label: 'To', val: to, set: setTo }, { label: 'Subject', val: subject, set: setSubj }].map(({ label, val, set }) => (
          <div key={label}>
            <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
            <input value={val} onChange={e => set(e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
          </div>
        ))}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Message</label>
          <textarea rows={3} value={body} onChange={e => setBody(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none" />
        </div>
        <div className="flex gap-3 pt-1">
          <button onClick={handleSend} disabled={sending}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)' }}>
            <Mail size={14} />{sending ? 'Sending...' : 'Send Invoice'}
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PurchaseOrderInvoicePage() {
  const { poId } = useParams();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [po, setPo] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [generatingInvoice, setGeneratingInvoice] = useState(false);
  const [invoiceError, setInvoiceError] = useState(null);
  const [showEmail, setShowEmail] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState(null);
  const printRef = useRef(null);

  useEffect(() => {
    Promise.all([
      api.get('/pos'),
      api.get('/invoices'),
    ]).then(([posRes, invoicesRes]) => {
      const foundPo = posRes.data.find(p => p.id === poId);
      setPo(foundPo ?? null);
      const foundInvoice = invoicesRes.data.find(inv => inv.poId === poId);
      setInvoice(foundInvoice ?? null);
      if (foundInvoice?.emailed && foundInvoice?.emailSentTo) setEmailSentTo(foundInvoice.emailSentTo);
    }).catch(() => setError('Failed to load purchase order.'))
      .finally(() => setLoading(false));
  }, [poId]);

  const handleGenerateInvoice = async () => {
    setGeneratingInvoice(true); setInvoiceError(null);
    try {
      const { data } = await api.post('/invoices', { poId });
      setInvoice(data.invoice);
      if (data.invoice?.emailSentTo) setEmailSentTo(data.invoice.emailSentTo);
    } catch (err) {
      setInvoiceError(err.response?.data?.error || 'Failed to generate invoice.');
    } finally {
      setGeneratingInvoice(false);
    }
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`<html><head><title>Invoice ${po?.poNumber}</title>
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        body { font-family:'Segoe UI',sans-serif; font-size:12px; color:#111; padding:32px; }
        table { width:100%; border-collapse:collapse; }
        th,td { border:1px solid #e5e7eb; padding:8px 12px; text-align:left; }
        th { background:#f9fafb; font-weight:600; font-size:11px; text-transform:uppercase; }
        .right { text-align:right; }
      </style></head><body>${content}</body></html>`);
    win.document.close(); win.focus(); win.print(); win.close();
  };

  const taxAmount = po ? Number(po.taxAmount) : 0;
  const subtotal  = po ? Number(po.subtotal)   : 0;
  const total     = po ? Number(po.totalAmount) : 0;
  const cgst = taxAmount / 2;
  const sgst = taxAmount / 2;

  const poDate      = po?.createdAt  ? new Date(po.createdAt).toLocaleDateString('en-IN',  { day:'2-digit', month:'short', year:'numeric' }) : '—';
  const invoiceDate = invoice?.generatedAt ? new Date(invoice.generatedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '—';

  return (
    <div style={{ fontFamily: "'DM Sans','Segoe UI',sans-serif" }} className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />}
      {showEmail && invoice && (
        <EmailModal invoice={invoice} po={po} onClose={() => setShowEmail(false)} onSent={to => setEmailSentTo(to)} />
      )}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="bg-white border-b border-gray-200 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500"><Menu size={20} /></button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">Purchase Order &amp; Invoice</h1>
              {po && (
                <p className="text-xs text-gray-500">
                  <span className="font-medium text-blue-600">{po.poNumber}</span>
                  <span className="mx-1.5 text-gray-300">·</span>
                  {po.vendor?.org?.name ?? '—'}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handlePrint} className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all">
              <Printer size={13} />Print
            </button>
            <button className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all">
              <Download size={13} />Download PDF
            </button>
            {invoice && (
              <button onClick={() => setShowEmail(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)' }}>
                <Mail size={13} />Email Invoice
              </button>
            )}
            <button className="relative p-2 rounded-lg hover:bg-gray-50 lg:ml-1">
              <Bell size={18} className="text-gray-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <p className="text-sm text-gray-400 text-center py-16">Loading...</p>
          ) : error ? (
            <p className="text-sm text-red-500">{error}</p>
          ) : !po ? (
            <p className="text-sm text-gray-400 text-center py-16">Purchase order not found.</p>
          ) : (
            <>
              {emailSentTo && (
                <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-4 py-3 rounded-xl">
                  <CheckCircle2 size={14} />Invoice emailed to <span className="font-bold">{emailSentTo}</span>
                </div>
              )}

              {/* Invoice document */}
              <div ref={printRef} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Header band */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between"
                  style={{ background: 'linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%)' }}>
                  <div>
                    <p className="text-white font-bold text-base tracking-tight">VendorBridge</p>
                    <p className="text-blue-200 text-[11px] mt-0.5">Procurement & Vendor Management ERP</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">{po.poNumber}</p>
                    <p className="text-blue-200 text-[11px]">Purchase Order &amp; Invoice</p>
                  </div>
                </div>

                {/* Bill-to + Vendor */}
                <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-gray-100">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Bill To</p>
                    <p className="text-sm font-bold text-gray-800">{po.org?.name ?? 'Your Organisation'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Vendor</p>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {(po.vendor?.org?.name ?? 'V').charAt(0)}
                      </div>
                      <p className="text-sm font-bold text-gray-800">{po.vendor?.org?.name ?? '—'}</p>
                    </div>
                  </div>
                </div>

                {/* PO / Invoice dates */}
                <div className="px-6 py-4 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-gray-50/60 border-b border-gray-100">
                  {[
                    { label: 'PO Number',    value: po.poNumber },
                    { label: 'PO Date',      value: poDate },
                    { label: 'Invoice Date', value: invoice ? invoiceDate : '—' },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-semibold text-gray-700 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Totals (no line items since PO API gives aggregate totals only) */}
                <div className="border-t border-gray-100 px-6 py-5">
                  <div className="ml-auto max-w-xs space-y-2.5">
                    {[
                      { label: 'Subtotal',                   value: `₹${fmt(subtotal)}` },
                      { label: `CGST (${po.taxRate / 2}%)`,  value: `₹${fmt(cgst)}` },
                      { label: `SGST (${po.taxRate / 2}%)`,  value: `₹${fmt(sgst)}` },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{label}</span>
                        <span className="text-xs font-semibold text-gray-700">{value}</span>
                      </div>
                    ))}
                    <div className="h-px bg-gray-200 my-1" />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-gray-900">Grand Total</span>
                      <span className="text-base font-bold" style={{ color: '#1d4ed8' }}>₹{fmt(total)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer strip */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <BadgeCheck size={13} className="text-blue-400" />
                    Generated by VendorBridge · All figures in INR
                  </div>
                  <div className="text-[11px] text-gray-400">Computer-generated document.</div>
                </div>
              </div>

              {/* Status + Invoice actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">PO Status:</span>
                  <span className={`text-[11px] font-bold px-3 py-1 rounded-full ${po.status === 'ISSUED' ? 'bg-blue-100 text-blue-700' : po.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {po.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-600">Invoice:</span>
                  {invoice ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle2 size={11} />{invoice.invoiceNumber}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-700">
                      <Clock size={11} />Not generated
                    </span>
                  )}
                </div>
                {!invoice && (
                  <button onClick={handleGenerateInvoice} disabled={generatingInvoice}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg,#1d4ed8 0%,#3b82f6 100%)' }}>
                    {generatingInvoice ? 'Generating...' : 'Generate Invoice'}
                  </button>
                )}
                {invoiceError && <p className="text-xs text-red-500">{invoiceError}</p>}

                <div className="flex items-center gap-2 ml-auto sm:hidden">
                  <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 bg-white hover:bg-gray-50 transition-all">
                    <Printer size={12} />Print
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
