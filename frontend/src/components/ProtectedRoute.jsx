import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Usage:
 *   <ProtectedRoute>              — any logged-in user
 *   <ProtectedRoute role="admin"> — admin only
 *   <ProtectedRoute role="provider"> — provider only
 *   <ProtectedRoute role="customer"> — customer only
 */
export default function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    // Redirect to the right dashboard for their actual role
    if (user.role === 'admin')    return <Navigate to="/admin" replace />;
    if (user.role === 'provider') return <Navigate to="/provider/dashboard" replace />;
    return <Navigate to="/" replace />;
  }

  return children;
}
