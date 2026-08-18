import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ADMIN_ROUTE_PATH } from '../config';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, cachedHotel } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    // Redirect to correct login portal
    if (allowedRoles.includes('admin')) {
      return <Navigate to="/admin-login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') {
      return <Navigate to={ADMIN_ROUTE_PATH} replace />;
    } else if (user.role === 'hotel_owner') {
      return <Navigate to="/owner" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // For hotel owners on any /owner/* sub-page, check hotel status.
  // If hotel is pending/rejected/suspended, force them back to /owner
  // where the full status gate will handle it properly.
  if (user.role === 'hotel_owner' && cachedHotel) {
    const status = cachedHotel.status;
    // /owner (OwnerDashboard) handles the status gate itself — don't redirect there
    // But sub-pages should redirect to /owner which will show the status gate
    const isSubPage = allowedRoles.includes('hotel_owner') && children?.type?.name !== 'OwnerDashboard';
    if (isSubPage && status && status !== 'approved' && status !== 'active') {
      return <Navigate to="/owner" replace />;
    }
  }

  return children;
}