import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute, PublicRoute } from './components/routing/RouteGuards.jsx';

// ── Public ────────────────────────────────────────────────────────────────────
import LandingPage      from './pages/LandingPage.jsx';
import NotFound         from './pages/NotFound.jsx';
import Unauthorized     from './pages/Unauthorized.jsx';

// ── Auth ──────────────────────────────────────────────────────────────────────
import LoginPage        from './pages/auth/LoginPage.jsx';
import RegisterPage     from './pages/auth/RegisterPage.jsx';

// ── Pet Owner ─────────────────────────────────────────────────────────────────
import OwnerDashboard   from './pages/dashboard/OwnerDashboard.jsx';
import MyPetsPage       from './pages/pets/MyPetsPage.jsx';
import HealthRecordsPage from './pages/health/HealthRecordsPage.jsx';
import AppointmentsPage from './pages/appointments/AppointmentsPage.jsx';
import ProductShopPage  from './pages/shop/ProductShopPage.jsx';
import AdoptionPage     from './pages/adoption/AdoptionPage.jsx';
import CareTipsPage     from './pages/care/CareTipsPage.jsx';

// ── Veterinarian ──────────────────────────────────────────────────────────────
import VetDashboardPage    from './pages/dashboard/VetDashboardPage.jsx';
import VetAppointmentsPage from './pages/vet/VetAppointmentsPage.jsx';
import VetPatientsPage     from './pages/vet/VetPatientsPage.jsx';

// ── Shelter ───────────────────────────────────────────────────────────────────
import ShelterDashboardPage from './pages/dashboard/ShelterDashboardPage.jsx';
import ShelterListingsPage  from './pages/shelter/ShelterListingsPage.jsx';
import ShelterInterestsPage from './pages/shelter/ShelterInterestsPage.jsx';

// ── Shared (all authenticated roles) ─────────────────────────────────────────
import NotificationsPage from './pages/notifications/NotificationsPage.jsx';
import ProfilePage       from './pages/profile/ProfilePage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* ── Public ── */}
          <Route path="/"             element={<LandingPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* ── Auth (redirect away if logged in) ── */}
          <Route element={<PublicRoute />}>
            <Route path="/login"    element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* ── Pet Owner routes ── */}
          <Route element={<ProtectedRoute roles={['petOwner']} />}>
            <Route path="/dashboard"                   element={<OwnerDashboard />} />
            <Route path="/dashboard/pets"              element={<MyPetsPage />} />
            <Route path="/dashboard/health-records"    element={<HealthRecordsPage />} />
            <Route path="/dashboard/appointments"      element={<AppointmentsPage />} />
          </Route>

          {/* ── Veterinarian routes ── */}
          <Route element={<ProtectedRoute roles={['veterinarian']} />}>
            <Route path="/vet/dashboard"    element={<VetDashboardPage />} />
            <Route path="/vet/appointments" element={<VetAppointmentsPage />} />
            <Route path="/vet/patients"     element={<VetPatientsPage />} />
          </Route>

          {/* ── Shelter routes ── */}
          <Route element={<ProtectedRoute roles={['shelter']} />}>
            <Route path="/shelter/dashboard" element={<ShelterDashboardPage />} />
            <Route path="/shelter/listings"  element={<ShelterListingsPage />} />
            <Route path="/shelter/interests" element={<ShelterInterestsPage />} />
          </Route>

          {/* ── Shared authenticated routes (all roles) ── */}
          <Route element={<ProtectedRoute />}>
            <Route path="/shop"         element={<ProductShopPage />} />
            <Route path="/adopt"        element={<AdoptionPage />} />
            <Route path="/care-tips"    element={<CareTipsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/profile"      element={<ProfilePage />} />
          </Route>

          {/* ── Fallback ── */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
