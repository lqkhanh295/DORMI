import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { toast } from 'sonner';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { currentUser } = useStore();
  const location = useLocation();
  const isAuthenticated = !!currentUser;
  const role = currentUser?.role || null;

  const isUnauthorized = Boolean(allowedRoles && role && !allowedRoles.includes(role));

  useEffect(() => {
    if (isUnauthorized) {
      toast.error('Bạn không có quyền truy cập vào phân hệ này.');
    }
  }, [isUnauthorized]);

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (role === 'Admin') {
    return <Outlet />;
  }

  if (isUnauthorized) {
    if (role === 'Landlord') return <Navigate to="/landlord" replace />;
    return <Navigate to="/tenant" replace />;
  }

  return <Outlet />;
}
