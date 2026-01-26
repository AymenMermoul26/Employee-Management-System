import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider.jsx';

export default function RequireRole({ allowedRoles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
