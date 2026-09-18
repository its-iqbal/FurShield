/**
 * components/layout/DashboardLayout.jsx
 * Unified sidebar + topbar layout. Warm, clinical-but-gentle palette per DESIGN.md.
 * Sidebar uses bg-panel (#F1F5F1) on a bg-page (#FBF7F0) canvas.
 */
import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// ── Navigation config per role ────────────────────────────────────────────────
const NAV = {
  petOwner: [
    { to: '/dashboard',                icon: '⌂',  label: 'Dashboard'      },
    { to: '/dashboard/pets',           icon: '🐾', label: 'My Pets'        },
    { to: '/dashboard/health-records', icon: '📋', label: 'Health Records' },
    { to: '/dashboard/appointments',   icon: '🩺', label: 'Appointments'   },
    { to: '/shop',                     icon: '🛒', label: 'Shop'           },
    { to: '/adopt',                    icon: '🏠', label: 'Adopt a Pet'    },
    { to: '/care-tips',                icon: '📰', label: 'Care Tips'      },
  ],
  veterinarian: [
    { to: '/vet/dashboard',    icon: '📊', label: 'Dashboard'    },
    { to: '/vet/appointments', icon: '📅', label: 'Appointments' },
    { to: '/vet/patients',     icon: '🐾', label: 'Patients'     },
    { to: '/care-tips',        icon: '📰', label: 'Care Tips'    },
  ],
  shelter: [
    { to: '/shelter/dashboard', icon: '📊', label: 'Dashboard'         },
    { to: '/shelter/listings',  icon: '🐕', label: 'My Listings'       },
    { to: '/shelter/interests', icon: '📬', label: 'Adoption Requests' },
    { to: '/care-tips',         icon: '📰', label: 'Care Tips'         },
  ],
};

const BOTTOM_NAV = [
  { to: '/notifications', icon: '🔔', label: 'Notifications' },
  { to: '/profile',       icon: '👤', label: 'Profile'       },
];

// ── NavItem ───────────────────────────────────────────────────────────────────
function NavItem({ to, icon, label, collapsed, unread }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/dashboard' && to !== '/' && location.pathname.startsWith(to + '/'));

  return (
    <Link
      to={to}
      title={collapsed ? label : undefined}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 relative
        ${isActive
          ? 'bg-primary-200 text-primary-900 font-semibold'
          : 'text-[#4F4A44] hover:bg-primary-100 hover:text-primary-800'
        }`}
    >
      <span className="text-[18px] flex-shrink-0 leading-none">{icon}</span>
      {!collapsed && <span className="truncate">{label}</span>}
      {unread > 0 && (
        <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent-500 text-white
          ${collapsed ? 'absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center p-0' : ''}`}>
          {unread > 9 ? '9+' : unread}
        </span>
      )}
    </Link>
  );
}

// ── Role meta ─────────────────────────────────────────────────────────────────
const ROLE_META = {
  petOwner:     { label: 'Pet Owner',    badge: 'badge-success' },
  veterinarian: { label: 'Veterinarian', badge: 'badge-info'    },
  shelter:      { label: 'Shelter',      badge: 'badge-warning'  },
};

// ── Main DashboardLayout ──────────────────────────────────────────────────────
export default function DashboardLayout({ children, pageTitle, unreadCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [collapsed,  setCollapsed]  = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const location = useLocation();
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const navItems = NAV[user?.role] ?? NAV.petOwner;
  const roleMeta = ROLE_META[user?.role] ?? { label: '', badge: 'badge-neutral' };

  const handleLogout = async () => { await logout(); navigate('/'); };

  // ── Sidebar content ────────────────────────────────────────────────────────
  const SidebarContent = (
    <div className="flex flex-col h-full bg-panel">
      {/* Logo + collapse */}
      <div className={`flex items-center px-3 py-4 mb-2 ${collapsed ? 'justify-center' : 'justify-between'}`}>
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-xl" aria-hidden="true">🐾</span>
            <span className="font-['Fraunces'] font-semibold text-primary-800 text-base">FurShield</span>
          </Link>
        )}
        <button
          onClick={() => setCollapsed((p) => !p)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted
            hover:bg-primary-200 hover:text-primary-800 transition-colors hidden lg:flex"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '→' : '←'}
        </button>
      </div>

      {/* User card */}
      {!collapsed && (
        <div className="mx-3 mb-4 p-3 rounded-xl bg-white border border-[#E8E2D9]">
          <p className="text-body font-semibold text-sm truncate">{user?.name}</p>
          <span className={`${roleMeta.badge} mt-1`}>{roleMeta.label}</span>
        </div>
      )}

      {/* Main nav */}
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto" aria-label="Main navigation">
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom nav */}
      <div className="px-2 py-3 border-t border-[#D9E5D9] space-y-0.5">
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
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-[#8C4238] hover:bg-[#F4EBE8] transition-colors duration-150"
          title={collapsed ? 'Sign out' : undefined}
        >
          <span className="text-[18px] flex-shrink-0 leading-none" aria-hidden="true">↩</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-page text-body flex">

      {/* ── Desktop sidebar ── */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 border-r border-[#D9E5D9]
        transition-all duration-300 ${collapsed ? 'w-16' : 'w-60'}`}>
        {SidebarContent}
      </aside>

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="absolute inset-0 bg-[#33302B]/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="relative z-10 w-64 border-r border-[#D9E5D9] flex flex-col animate-slide-up">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-[#F1F5F1]/95 backdrop-blur-sm border-b border-[#D9E5D9]
          px-4 sm:px-6 py-3 flex items-center gap-4">

          {/* Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-muted
              hover:bg-primary-100 hover:text-primary-800 transition-colors"
          >
            ☰
          </button>

          {/* Page title */}
          <h1 className="text-base font-semibold text-body truncate flex-1">{pageTitle}</h1>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link to="/notifications" className="relative w-9 h-9 rounded-xl flex items-center justify-center
              text-muted hover:bg-primary-100 hover:text-primary-800 transition-colors text-lg">
              🔔
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-accent-500 rounded-full
                  text-body text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
            <Link to="/profile" className="w-9 h-9 rounded-xl flex items-center justify-center text-muted
              hover:bg-primary-100 hover:text-primary-800 transition-colors text-lg">
              👤
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-page">
          {children}
        </main>
      </div>
    </div>
  );
}
