import { useAuth } from '../../context/AuthContext.jsx';
import { Link } from 'react-router-dom';

const quickLinks = [
  { icon: '🐾', label: 'My Pets',        to: '/dashboard/pets',          color: 'from-primary-500/20 to-primary-600/10 border-primary-500/30' },
  { icon: '📋', label: 'Health Records',  to: '/dashboard/health-records', color: 'from-blue-500/20 to-blue-600/10 border-blue-500/30' },
  { icon: '🩺', label: 'Appointments',    to: '/dashboard/appointments',   color: 'from-purple-500/20 to-purple-600/10 border-purple-500/30' },
  { icon: '🛒', label: 'Shop',            to: '/shop',                     color: 'from-accent-500/20 to-accent-600/10 border-accent-500/30' },
  { icon: '🏠', label: 'Adopt a Pet',     to: '/adopt',                    color: 'from-green-500/20 to-green-600/10 border-green-500/30' },
  { icon: '📰', label: 'Care Tips',       to: '/care-tips',                color: 'from-yellow-500/20 to-yellow-600/10 border-yellow-500/30' },
];

export default function OwnerDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <span className="font-black gradient-text text-lg">FurShield</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-400">
            Hi, <span className="text-white font-medium">{user?.name?.split(' ')[0]}</span> 👋
          </span>
          <button onClick={logout} className="text-xs text-gray-600 hover:text-red-400 transition-colors">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero greeting */}
        <div className="mb-10">
          <p className="text-gray-500 text-sm mb-1">Good to see you back</p>
          <h1 className="text-4xl font-black text-white">
            Welcome, <span className="gradient-text">{user?.name?.split(' ')[0]}</span> 🎉
          </h1>
          <p className="text-gray-500 mt-2">What would you like to do today?</p>
        </div>

        {/* Quick links grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`glass-card p-6 flex flex-col items-start gap-3 group
                bg-gradient-to-br ${link.color} border hover:scale-[1.02] transition-all duration-200`}
            >
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                {link.icon}
              </span>
              <span className="font-semibold text-white text-sm">{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Coming soon notice */}
        <div className="mt-12 glass-card p-6 text-center">
          <p className="text-gray-500 text-sm">
            🚧 Full dashboard features are being built. This is your home base, <span className="text-primary-400">{user?.name?.split(' ')[0]}</span>!
          </p>
        </div>
      </main>
    </div>
  );
}
