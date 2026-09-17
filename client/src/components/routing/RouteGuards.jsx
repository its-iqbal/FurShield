import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

/**
 * ProtectedRoute
 * Wraps any route that requires authentication.
 * Optionally restricts to specific roles.
 *
 * Usage:
 *   <Route element={<ProtectedRoute />}>
 *     <Route path="/dashboard" element={<Dashboard />} />
 *   </Route>
 *
 *   <Route element={<ProtectedRoute roles={['veterinarian']} />}>
 *     <Route path="/vet/dashboard" element={<VetDashboard />} />
 *   </Route>
 */
import { Outlet } from 'react-router-dom';

export function ProtectedRoute({ roles }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // While rehydrating auth from localStorage, show nothing (avoids flash)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
          <p className="text-muted text-sm">Loading FurShield…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}

/**
 * PublicRoute
 * Redirects already-authenticated users away from auth pages (login / register)
 * to their role-specific dashboard.
 */
export function PublicRoute() {
  const { isAuthenticated, isLoading, user, getDashboardPath } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return <Outlet />;
}
