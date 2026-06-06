import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, FileText, ClipboardList, CheckSquare,
  ShoppingCart, Receipt, BarChart2, Activity, ChevronRight, X, LogOut,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/procurement-dashboard' },
  { label: 'Vendors', icon: Users, path: '/vendors' },
  { label: "RFQ's", icon: FileText, path: '/rfqs' },
  { label: 'Quotations', icon: ClipboardList, path: '/quotations' },
  { label: 'Approvals', icon: CheckSquare, path: null },
  { label: 'Purchase Orders', icon: ShoppingCart, path: null },
  { label: 'Invoices', icon: Receipt, path: null },
  { label: 'Reports', icon: BarChart2, path: null },
  { label: 'Activity', icon: Activity, path: null },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { pathname } = useLocation();
  const userInitials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '??';

  const handleLogout = async () => { await logout(); navigate('/login'); };

  return (
    <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-56 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
            style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)' }}>VB</div>
          <span className="font-bold text-gray-900 text-sm tracking-tight">VendorBridge</span>
        </div>
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600"><X size={18} /></button>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest px-2 mb-3">Main Menu</p>
        {navItems.map(({ label, icon: Icon, path }) => {
          const isActive = pathname === path;
          return (
            <button key={label}
              onClick={() => { if (path) { navigate(path); onClose(); } }}
              disabled={!path}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 group
                ${isActive ? 'text-blue-700 bg-blue-50' : path ? 'text-gray-600 hover:bg-gray-50 hover:text-gray-900' : 'text-gray-300 cursor-not-allowed'}`}>
              <Icon size={16} className={isActive ? 'text-blue-600' : path ? 'text-gray-400 group-hover:text-gray-600' : 'text-gray-300'} />
              {label}
              {isActive && <ChevronRight size={14} className="ml-auto text-blue-400" />}
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-gray-100 space-y-2">
        <div className="flex items-center gap-2.5 bg-gray-50 rounded-lg px-3 py-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{ background: 'linear-gradient(135deg, #1d4ed8, #06b6d4)' }}>{userInitials}</div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-gray-800 truncate">{user?.name ?? '—'}</p>
            <p className="text-[10px] text-gray-400 truncate">{user?.email ?? '—'}</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut size={14} />Log out
        </button>
      </div>
    </aside>
  );
}
