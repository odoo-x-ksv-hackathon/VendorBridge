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
import SubmitQuotationPage from './pages/SubmitQuotationPage';
import QuotationComparisonPage from './pages/QuotationComparisonPage';

function RoleRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'VENDOR') return <Navigate to="/vendor-dashboard" replace />;
  return <Navigate to="/procurement-dashboard" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RoleRedirect />} />
          <Route path="/procurement-dashboard" element={<PrivateRoute><ProcurementDashboard /></PrivateRoute>} />
          <Route path="/vendors" element={<PrivateRoute><VendorsPage /></PrivateRoute>} />
          <Route path="/rfqs" element={<PrivateRoute><RFQPage /></PrivateRoute>} />
          <Route path="/vendor-dashboard" element={<PrivateRoute><VendorDashboard /></PrivateRoute>} />
          <Route path="/vendor-rfqs" element={<PrivateRoute><VendorRFQsPage /></PrivateRoute>} />
          <Route path="/quotations/:rfqId/submit" element={<PrivateRoute><SubmitQuotationPage /></PrivateRoute>} />
          <Route path="/rfqs/:rfqId/comparison" element={<PrivateRoute><QuotationComparisonPage /></PrivateRoute>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
