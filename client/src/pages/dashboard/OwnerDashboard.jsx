import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

// Quick links — single palette: primary-50 cards with primary-200 icon wells
// No amber/blue/purple/green scattered across cards per DESIGN.md
const quickLinks = [
  { icon: '🐾', label: 'My Pets',       to: '/dashboard/pets',           desc: 'Profiles & records'   },
  { icon: '📋', label: 'Health Records', to: '/dashboard/health-records', desc: 'Timeline & vet logs'  },
  { icon: '🩺', label: 'Appointments',  to: '/dashboard/appointments',   desc: 'Book & manage visits' },
  { icon: '🛒', label: 'Shop',          to: '/shop',                     desc: 'Food, care & toys'   },
  { icon: '🏠', label: 'Adopt a Pet',   to: '/adopt',                    desc: 'Find a companion'    },
  { icon: '📰', label: 'Care Tips',     to: '/care-tips',                desc: 'Guides & articles'   },
];

export default function OwnerDashboard() {
  const { user } = useAuth();
  const firstName = user?.name?.split(' ')[0] ?? 'there';

  return (
    <DashboardLayout pageTitle="Dashboard">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Hero greeting */}
        <div className="mb-10">
          <p className="text-muted text-sm mb-1 font-light">Welcome back</p>
          <h1 className="font-['Fraunces'] text-4xl font-semibold text-primary-900">
            Hello, <span style={{
              background: 'linear-gradient(135deg, #4F6B54 0%, #7FA087 60%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>{firstName}</span>
          </h1>
          <p className="text-muted mt-2 font-light">Your pet management hub — everything in one place.</p>
        </div>

        {/* Quick links grid — consistent card appearance, no per-card color variance */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              id={`dashboard-link-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
              className="card p-5 flex flex-col items-start gap-3 group hover:shadow-warm-md transition-shadow duration-200"
            >
              <div className="w-11 h-11 rounded-xl bg-primary-100 flex items-center justify-center text-2xl
                group-hover:bg-primary-200 transition-colors duration-150">
                {link.icon}
              </div>
              <div>
                <p className="font-semibold text-body text-sm">{link.label}</p>
                <p className="text-subtle text-xs mt-0.5">{link.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Getting started */}
        <div className="card p-6">
          <h2 className="font-['Fraunces'] text-lg font-semibold text-primary-900 mb-1">Getting Started</h2>
          <p className="text-muted text-sm mb-5 font-light">Follow these steps to get the most out of FurShield.</p>
          <div className="space-y-2">
            {[
              { step: '1', label: 'Add your pet profile',         to: '/dashboard/pets'           },
              { step: '2', label: 'Log first health record',       to: '/dashboard/health-records' },
              { step: '3', label: 'Book an appointment',           to: '/dashboard/appointments'   },
              { step: '4', label: 'Browse care tips & the shop',   to: '/care-tips'                },
            ].map((item) => (
              <Link key={item.step} to={item.to}
                className="flex items-center gap-3 p-3.5 rounded-xl border border-[#E8E2D9] bg-white
                  hover:border-primary-300 hover:bg-primary-50 transition-all duration-150 group">
                <span className="w-7 h-7 rounded-full border border-[#D9D4CC] flex items-center justify-center
                  text-xs font-semibold text-muted group-hover:border-primary-400 group-hover:text-primary-700
                  flex-shrink-0 transition-colors duration-150">
                  {item.step}
                </span>
                <span className="text-sm text-body group-hover:text-primary-800 transition-colors duration-150 flex-1">
                  {item.label}
                </span>
                <span className="text-muted group-hover:text-primary-600 transition-colors duration-150 text-sm">→</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
