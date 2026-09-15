/**
 * components/layout/DashboardLayout.jsx
 * Unified sidebar + topbar layout used by all dashboard pages.
 * Sidebar collapses to icon-only on desktop and slides in on mobile.
 */
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// ── Navigation config per role ────────────────────────────────────────────────
const NAV = {
  petOwner: [
    { to: '/dashboard',                icon: '🏠', label: 'Dashboard'      },
    { to: '/dashboard/pets',           icon: '🐾', label: 'My Pets'        },
    { to: '/dashboard/health-records', icon: '📋', label: 'Health Records' },
    { to: '/dashboard/appointments',   icon: '🩺', label: 'Appointments'   },
    { to: '/shop',                     icon: '🛒', label: 'Shop'           },
    { to: '/adopt',                    icon: '🏠', label: 'Adopt a Pet'    },
    { to: '/care-tips',                icon: '📰', label: 'Care Tips'      },
  ],
  veterinarian: [
    { to: '/vet/dashboard',     icon: '📊', label: 'Dashboard'      },
    { to: '/vet/appointments',  icon: '📅', label: 'Appointments'   },
    { to: '/vet/patients',      icon: '🐾', label: 'Patients'       },
    { to: '/care-tips',         icon: '📰', label: 'Care Tips'      },
  ],
  shelter: [
    { to: '/shelter/dashboard', icon: '📊', label: 'Dashboard'          },
    { to: '/shelter/listings',  icon: '🐕', label: 'My Listings'        },
    { to: '/shelter/interests', icon: '📬', label: 'Adoption Requests'  },
    { to: '/care-tips',         icon: '📰', label: 'Care Tips'          },
  ],
};

const BOTTOM_NAV = [
  { to: '/notifications', icon: '🔔', label: 'Notifications' },
  { to: '/profile',       icon: '👤', label: 'Profile'       },
];

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({ to, icon, label, collapsed, unread }) {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(to + '/');

  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
        ${isActive
          ? 'bg-primary-500/20 text-white border border-primary-500/30'
          : 'text-gray-500 hover:bg-white/5 hover:text-gray-200 border border-transparent'
        }`}
    >
      <span className="text-xl flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
        {icon}
      </span>
      {!collapsed && (
        <span className="text-sm font-medium truncate">{label}</span>
      )}
      {unread > 0 && (
        <span className={`ml-auto text-xs font-bold px-1.5 py-0.5 rounded-full bg-primary-500 text-white
          ${collapsed ? 'absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[10px]' : ''}`}>
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}

// ── Main DashboardLayout ──────────────────────────────────────────────────────
export default function DashboardLayout({ children, pageTitle, unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  // Close mobile menu on route change
  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navItems = NAV[user?.role] ?? NAV.petOwner;

  const handleLogout = async () => { await logout(); navigate('/'); };

  const roleLabel = { petOwner: 'Pet Owner', veterinarian: 'Veterinarian', shelter: 'Shelter' }[user?.role] ?? '';
  const roleColor = { petOwner: 'text-primary-400', veterinarian: 'text-blue-400', shelter: 'text-orange-400' }[user?.role] ?? 'text-gray-400';

  // ── Sidebar content (shared for desktop + mobile) ─────────────────────────
  const SidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo + collapse toggle */}
      <div className={`flex items-center px-3 py-4 mb-2 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <span className="text-xl">🐾</span>
            <span className="font-black gradient-text text-base">FurShield</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500
            hover:bg-white/10 hover:text-white transition-all hidden lg:flex"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User card */}
      {!collapsed && (
        <div className="mx-3 mb-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="text-white font-bold text-sm truncate">{user?.name}</p>
          <p className={`text-xs ${roleColor}`}>{roleLabel}</p>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-3 border-t border-white/10 space-y-1">
        {BOTTOM_NAV.map((item) => (
          <NavItem
            key={item.to}
            {...item}
            collapsed={collapsed}
            unread={item.to === '/notifications' ? unreadCount : 0}
          />
        ))}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600
            hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 group`}
          title={collapsed ? 'Sign out' : undefined}
        >
          <span className="text-xl group-hover:scale-110 transition-transform">🚪</span>
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">

      {/* ── Desktop sidebar ── */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 border-r border-white/5 bg-gray-900/50
        transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        {SidebarContent}
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-64 bg-gray-900 border-r border-white/10 flex flex-col animate-slide-up">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-gray-950/95 backdrop-blur-md border-b border-white/5
          px-4 sm:px-6 py-3 flex items-center gap-4">

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 rounded-lg flex items-center justify-center text-gray-400
              hover:bg-white/10 hover:text-white transition-all"
          >
            ☰
          </button>

          {/* Page title */}
          <h1 className="text-lg font-bold text-white truncate flex-1">{pageTitle}</h1>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <Link to="/notifications" className="relative w-9 h-9 rounded-lg flex items-center justify-center
              text-gray-400 hover:bg-white/10 hover:text-white transition-all">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-primary-500 rounded-full
                  text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400
              hover:bg-white/10 hover:text-white transition-all text-lg">
              👤
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
