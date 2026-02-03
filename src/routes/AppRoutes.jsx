import { Navigate, Route, Routes } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth.jsx';
import RequireRole from '../components/RequireRole.jsx';
import LoginPage from '../pages/auth/LoginPage.jsx';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage.jsx';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import EmployeesPage from '../pages/admin/EmployeesPage.jsx';
import EmployeeDetailPage from '../pages/admin/EmployeeDetailPage.jsx';
import DepartmentsPage from '../pages/admin/DepartmentsPage.jsx';
import RequestsPage from '../pages/admin/RequestsPage.jsx';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard.jsx';
import ProfilePage from '../pages/employee/ProfilePage.jsx';
import PublicPreviewPage from '../pages/employee/PublicPreviewPage.jsx';
import EmployeeRequestsPage from '../pages/employee/EmployeeRequestsPage.jsx';
import PublicProfilePage from '../pages/public/PublicProfilePage.jsx';
import { useAuth } from '../auth/AuthProvider.jsx';

function RedirectIfAuth({ children }) {
  const { isAuthenticated, role } = useAuth();

  if (isAuthenticated) {
    const target = role === "ADMIN" ? "/admin" : "/employee";
    return <Navigate to={target} replace />;
  }

  return children;
}

function NotFoundRedirect() {
  const { isAuthenticated, role } = useAuth();
  if (isAuthenticated) {
    const target = role === "ADMIN" ? "/admin" : "/employee";
    return <Navigate to={target} replace />;
  }
  return <Navigate to="/login" replace />;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route
        path="/login"
        element={
          <RedirectIfAuth>
            <LoginPage />
          </RedirectIfAuth>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <RedirectIfAuth>
            <ForgotPasswordPage />
          </RedirectIfAuth>
        }
      />
      <Route
        path="/reset-password"
        element={
          <RedirectIfAuth>
            <ResetPasswordPage />
          </RedirectIfAuth>
        }
      />
      <Route path="/public/:token" element={<PublicProfilePage />} />

      <Route element={<RequireAuth />}>
        <Route element={<RequireRole allowedRoles={["ADMIN"]} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/employees" element={<EmployeesPage />} />
          <Route path="/admin/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/admin/departments" element={<DepartmentsPage />} />
          <Route path="/admin/requests" element={<RequestsPage />} />
        </Route>

        <Route element={<RequireRole allowedRoles={["EMPLOYEE"]} />}>
          <Route path="/employee" element={<EmployeeDashboard />} />
          <Route path="/employee/profile" element={<ProfilePage />} />
          <Route path="/employee/public-preview" element={<PublicPreviewPage />} />
          <Route path="/employee/requests" element={<EmployeeRequestsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundRedirect />} />
    </Routes>
  );
}
