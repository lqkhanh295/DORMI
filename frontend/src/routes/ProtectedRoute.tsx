import { Navigate, Outlet } from 'react-router-dom';
import { useStore } from '../store/useStore';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { currentUser } = useStore();
  const isAuthenticated = !!currentUser;
  const role = currentUser?.role || null;

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />; // Hoặc trang 403 Access Denied
  }

  return <Outlet />;
}
