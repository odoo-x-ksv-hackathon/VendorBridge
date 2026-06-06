import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ProcurementDashboard from './pages/ProcurementDashboard';
import VendorsPage from './pages/vendors';
import RFQPage from './pages/RfqPage';
import VendorDashboard from './pages/VendorDashboard';
import VendorRFQsPage from './pages/VendorRFQsPage';
import QuotationsPage from './pages/QuotationsPage';
import QuotationComparisonPage from './pages/QuotationComparisonPage';
import QuotationApprovalPage from './pages/QuotationApprovalPage';
import PurchaseOrderInvoicePage from './pages/PurchaseOrderInvoicePage';

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
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/procurement-dashboard"
            element={
              <PrivateRoute>
                <ProcurementDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/vendors"
            element={
              <PrivateRoute>
                <VendorsPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/rfqs"
            element={
              <PrivateRoute>
                <RFQPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/quotations/:rfqId/submit"
            element={
              <PrivateRoute>
                <SubmitQuotationPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/rfqs/:rfqId/comparison"
            element={
              <PrivateRoute>
                <QuotationComparisonPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/quotations/:quotationId/approval"
            element={
              <PrivateRoute>
                <QuotationApprovalPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/invoices/:invoiceId"
            element={
              <PrivateRoute>
                <PurchaseOrderInvoicePage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<RoleRedirect />} />

          {/* Buyer routes */}
          <Route path="/procurement-dashboard" element={<BuyerOnly><ProcurementDashboard /></BuyerOnly>} />
          <Route path="/vendors" element={<BuyerOnly><VendorsPage /></BuyerOnly>} />
          <Route path="/rfqs" element={<BuyerOnly><RFQPage /></BuyerOnly>} />
          <Route path="/quotations" element={<BuyerOnly><QuotationsPage /></BuyerOnly>} />
          <Route path="/rfqs/:rfqId/comparison" element={<BuyerOnly><QuotationComparisonPage /></BuyerOnly>} />

          {/* Vendor routes */}
          <Route path="/vendor-dashboard" element={<VendorOnly><VendorDashboard /></VendorOnly>} />
          <Route path="/vendor-rfqs" element={<VendorOnly><VendorRFQsPage /></VendorOnly>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
