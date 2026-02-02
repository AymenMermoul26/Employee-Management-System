import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function RequireRole({ allowedRoles }) {
  const { loading, isAuthenticated, role } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
