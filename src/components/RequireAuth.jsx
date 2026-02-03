import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider.jsx";

export default function RequireAuth() {
  const { loading, hydrated, profileReady, isAuthenticated } = useAuth();

  const waiting = loading || !hydrated || !profileReady;

  if (waiting) {
    // Simple inline spinner to avoid flicker while auth hydrates
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
