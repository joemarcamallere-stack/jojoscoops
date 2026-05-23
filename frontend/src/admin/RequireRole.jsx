import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RequireRole({ role, children }) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="admin-shell" style={{ padding: 40, textAlign: 'center' }}>Loading…</div>;
  }

  if (!user || profile?.role !== role) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
