import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { currentUser } = useStore();
  const location = useLocation();
  const isAuthenticated = !!currentUser;
  const role = currentUser?.role || null;

  if (!isAuthenticated) {
    // Preserve intended destination in location state for post-login redirect
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to user's authorized workspace if attempting to access an unauthorized route
    if (role === 'Landlord') return <Navigate to="/landlord" replace />;
    if (role === 'Admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/tenant" replace />;
  }

  return <Outlet />;
}
