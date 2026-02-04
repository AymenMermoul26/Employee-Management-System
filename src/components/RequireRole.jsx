import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function RequireRole({ allowedRoles }) {
  const { loading, hydrated, profileReady, isAuthenticated, role } = useAuth();

  const waiting = loading || !hydrated || !profileReady;

  if (waiting) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Defensive: AuthProvider normally guarantees role when isAuthenticated is true.
  if (!role) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated but wrong role => send them to their correct home.
  if (!allowedRoles.includes(role)) {
    const fallback = role === "ADMIN" ? "/admin" : "/employee";
    return <Navigate to={fallback} replace />;
  }

  return <Outlet />;
}
