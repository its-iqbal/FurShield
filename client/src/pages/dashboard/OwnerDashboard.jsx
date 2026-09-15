import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

const quickLinks = [
  { icon: '🐾', label: 'My Pets',        to: '/dashboard/pets',           color: 'from-amber-500/20 border-amber-500/30'    },
  { icon: '📋', label: 'Health Records',  to: '/dashboard/health-records', color: 'from-blue-500/20 border-blue-500/30'      },
  { icon: '🩺', label: 'Appointments',    to: '/dashboard/appointments',   color: 'from-purple-500/20 border-purple-500/30'  },
  { icon: '🛒', label: 'Shop',            to: '/shop',                     color: 'from-primary-500/20 border-primary-500/30'},
  { icon: '🏠', label: 'Adopt a Pet',     to: '/adopt',                    color: 'from-green-500/20 border-green-500/30'    },
  { icon: '📰', label: 'Care Tips',       to: '/care-tips',                color: 'from-yellow-500/20 border-yellow-500/30'  },
];

export default function OwnerDashboard() {
  const { user } = useAuth();

  return (
    <DashboardLayout pageTitle="Dashboard 🏠">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        {/* Hero greeting */}
        <div className="mb-10">
          <p className="text-gray-500 text-sm mb-1">Welcome back 👋</p>
          <h1 className="text-4xl font-black text-white">
            Hey, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>!
          </h1>
          <p className="text-gray-500 mt-2">Your pet management hub — everything in one place.</p>
        </div>

        {/* Quick links grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-10">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              id={`dashboard-link-${link.label.toLowerCase().replace(/\s+/g,'-')}`}
              className={`glass-card p-6 flex flex-col items-start gap-3 group
                bg-gradient-to-br ${link.color} border hover:scale-[1.03] transition-all duration-200`}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{link.icon}</span>
              <span className="font-semibold text-white text-sm">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Getting started card */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-bold text-white mb-2">🚀 Getting Started</h2>
          <p className="text-gray-500 text-sm mb-4">Follow these steps to get the most out of FurShield.</p>
          <div className="space-y-3">
            {[
              { step: '1', label: 'Add your pet profile',         to: '/dashboard/pets',           done: false },
              { step: '2', label: 'Log first health record',       to: '/dashboard/health-records', done: false },
              { step: '3', label: 'Book an appointment',          to: '/dashboard/appointments',   done: false },
              { step: '4', label: 'Browse care tips & the shop',  to: '/care-tips',                done: false },
            ].map((item) => (
              <Link key={item.step} to={item.to}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10
                  hover:border-primary-500/30 hover:bg-primary-500/5 transition-all group">
                <span className="w-7 h-7 rounded-full border border-white/20 flex items-center justify-center
                  text-xs font-bold text-gray-400 group-hover:border-primary-500/50 group-hover:text-primary-400 flex-shrink-0 transition-all">
                  {item.step}
                </span>
                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
                <span className="ml-auto text-gray-600 group-hover:text-primary-400 transition-colors">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
