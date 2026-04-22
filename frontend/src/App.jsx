import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import Services from './pages/Services';
import Providers from './pages/Providers';
import ProviderDetail from './pages/ProviderDetail';
import Login from './pages/Login';
import Register from './pages/Register';

// Shared auth pages
import Profile from './pages/Profile';
import BookService from './pages/BookService';
import Bookings from './pages/Bookings';
import BookingDetail from './pages/BookingDetail';

// Provider pages
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderKYC from './pages/provider/KYC';
import ProviderProfile from './pages/provider/Profile';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUserDetail from './pages/admin/UserDetail';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          {/* ── Public ── */}
          <Route path="/"              element={<Home />} />
          <Route path="/services"      element={<Services />} />
          <Route path="/providers"     element={<Providers />} />
          <Route path="/providers/:id" element={<ProviderDetail />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />

          {/* ── Any logged-in user ── */}
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />

          {/* ── Customer routes ── */}
          <Route path="/book/:serviceId" element={
            <ProtectedRoute role="customer"><BookService /></ProtectedRoute>
          } />
          <Route path="/bookings" element={
            <ProtectedRoute role="customer"><Bookings /></ProtectedRoute>
          } />
          <Route path="/bookings/:id" element={
            <ProtectedRoute><BookingDetail /></ProtectedRoute>
          } />

          {/* ── Provider routes ── */}
          <Route path="/provider/dashboard" element={
            <ProtectedRoute role="provider"><ProviderDashboard /></ProtectedRoute>
          } />
          <Route path="/provider/kyc" element={
            <ProtectedRoute role="provider"><ProviderKYC /></ProtectedRoute>
          } />
          <Route path="/provider/profile" element={
            <ProtectedRoute role="provider"><ProviderProfile /></ProtectedRoute>
          } />

          {/* ── Admin routes ── */}
          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
          } />
          <Route path="/admin/users/:id" element={
            <ProtectedRoute role="admin"><AdminUserDetail /></ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
