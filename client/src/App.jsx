import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute, PublicRoute } from './components/routing/RouteGuards.jsx';

// ── Public pages ───────────────────────────────────────────────────────────────
import LandingPage from './pages/LandingPage.jsx';
import NotFound    from './pages/NotFound.jsx';
import Unauthorized from './pages/Unauthorized.jsx';

// ── Auth pages (redirect away if already logged in) ────────────────────────────
import LoginPage    from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

// ── Role dashboards ────────────────────────────────────────────────────────────
import OwnerDashboard   from './pages/dashboard/OwnerDashboard.jsx';
import MyPetsPage       from './pages/pets/MyPetsPage.jsx';
import VetDashboard     from './pages/dashboard/VetDashboard.jsx';
import ShelterDashboard from './pages/dashboard/ShelterDashboard.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Public landing page ── */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ── Auth pages: redirect away if already logged in ── */}
          <Route element={<PublicRoute />}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* ── Pet Owner routes ── */}
          <Route element={<ProtectedRoute roles={['petOwner']} />}>
            <Route path="/dashboard"                   element={<OwnerDashboard />} />
            <Route path="/dashboard/pets"              element={<MyPetsPage />} />
            <Route path="/dashboard/health-records"    element={<OwnerDashboard />} />
            <Route path="/dashboard/appointments"      element={<OwnerDashboard />} />
          </Route>

          {/* ── Veterinarian routes ── */}
          <Route element={<ProtectedRoute roles={['veterinarian']} />}>
            <Route path="/vet/dashboard" element={<VetDashboard />} />
          </Route>

          {/* ── Animal Shelter routes ── */}
          <Route element={<ProtectedRoute roles={['shelter']} />}>
            <Route path="/shelter/dashboard" element={<ShelterDashboard />} />
          </Route>

          {/* ── Shared authenticated routes (all roles) ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/shop"      element={<OwnerDashboard />} />
            <Route path="/adopt"     element={<OwnerDashboard />} />
            <Route path="/care-tips" element={<OwnerDashboard />} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
