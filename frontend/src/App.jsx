import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ProcurementDashboard from './pages/ProcurementDashboard';
import VendorsPage from './pages/vendors';
import RFQPage from './pages/RfqPage';
import QuotationsPage from './pages/QuotationsPage';
import QuotationComparisonPage from './pages/QuotationComparisonPage';
import QuotationApprovalPage from './pages/QuotationApprovalPage';
import PurchaseOrderInvoicePage from './pages/PurchaseOrderInvoicePage';
import ApprovalsListPage from './pages/ApprovalsListPage';
import PurchaseOrdersListPage from './pages/PurchaseOrdersListPage';
import InvoicesListPage from './pages/InvoicesListPage';
import VendorDashboard from './pages/VendorDashboard';
import VendorRFQsPage from './pages/VendorRFQsPage';

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'VENDOR') return <Navigate to="/vendor-dashboard" replace />;
  return <Navigate to="/procurement-dashboard" replace />;
}

function BuyerOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'VENDOR') return <Navigate to="/vendor-dashboard" replace />;
  return children;
}

function VendorOnly({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'VENDOR') return <Navigate to="/procurement-dashboard" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Buyer routes */}
          <Route path="/procurement-dashboard" element={<BuyerOnly><ProcurementDashboard /></BuyerOnly>} />
          <Route path="/vendors" element={<BuyerOnly><VendorsPage /></BuyerOnly>} />
          <Route path="/rfqs" element={<BuyerOnly><RFQPage /></BuyerOnly>} />
          <Route path="/rfqs/:rfqId/comparison" element={<BuyerOnly><QuotationComparisonPage /></BuyerOnly>} />
          <Route path="/quotations" element={<BuyerOnly><QuotationsPage /></BuyerOnly>} />
          <Route path="/approvals" element={<BuyerOnly><ApprovalsListPage /></BuyerOnly>} />
          <Route path="/approvals/:quotationId" element={<BuyerOnly><QuotationApprovalPage /></BuyerOnly>} />
          <Route path="/purchase-orders" element={<BuyerOnly><PurchaseOrdersListPage /></BuyerOnly>} />
          <Route path="/purchase-orders/:poId" element={<BuyerOnly><PurchaseOrderInvoicePage /></BuyerOnly>} />
          <Route path="/invoices" element={<BuyerOnly><InvoicesListPage /></BuyerOnly>} />

          {/* Vendor routes */}
          <Route path="/vendor-dashboard" element={<VendorOnly><VendorDashboard /></VendorOnly>} />
          <Route path="/vendor-rfqs" element={<VendorOnly><VendorRFQsPage /></VendorOnly>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
