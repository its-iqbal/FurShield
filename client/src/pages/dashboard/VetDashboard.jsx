import { useAuth } from '../../context/AuthContext.jsx';

const vetLinks = [
  { icon: '📅', label: 'My Appointments', color: 'from-primary-500/20 border-primary-500/30' },
  { icon: '🐾', label: 'Patient Records',  color: 'from-blue-500/20 border-blue-500/30' },
  { icon: '👤', label: 'My Profile',       color: 'from-purple-500/20 border-purple-500/30' },
  { icon: '⏰', label: 'Availability',      color: 'from-accent-500/20 border-accent-500/30' },
];

export default function VetDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <span className="font-black gradient-text text-lg">FurShield</span>
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
            Veterinarian
          </span>
        </div>
        <button onClick={logout} className="text-xs text-gray-600 hover:text-red-400 transition-colors">
          Sign out
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-gray-500 text-sm mb-1">Veterinarian Portal</p>
        <h1 className="text-4xl font-black text-white mb-2">
          Dr. <span className="gradient-text">{user?.name}</span>
        </h1>
        {user?.specialization && (
          <p className="text-gray-500 mb-8">🩺 {user.specialization}</p>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {vetLinks.map((link) => (
            <div key={link.label}
              className={`glass-card p-6 flex flex-col items-start gap-3 cursor-pointer
                bg-gradient-to-br ${link.color} border hover:scale-[1.02] transition-all duration-200`}>
              <span className="text-3xl">{link.icon}</span>
              <span className="font-semibold text-white text-sm">{link.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 glass-card p-6 text-center">
          <p className="text-gray-500 text-sm">🚧 Veterinarian features are being built. Stay tuned!</p>
        </div>
      </main>
    </div>
  );
}
