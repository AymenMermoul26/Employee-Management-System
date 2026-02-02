import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function RequireAuth() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) return null; // later: add spinner

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
