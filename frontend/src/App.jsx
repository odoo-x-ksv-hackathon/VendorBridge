import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ProcurementDashboard from './pages/procurementDashboard';
import VendorsPage from './pages/vendors';
import RFQPage from './pages/RfqPage';
import SubmitQuotationPage from './pages/SubmitQuotationPage';
import QuotationComparisonPage from './pages/QuotationComparisonPage';

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
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
