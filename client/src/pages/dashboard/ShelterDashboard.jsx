import { useAuth } from '../../context/AuthContext.jsx';

export default function ShelterDashboard() {
  const { user, logout } = useAuth();
  const shelterLinks = [
    { icon: '🐕', label: 'My Listings',       color: 'from-primary-500/20 border-primary-500/30' },
    { icon: '📬', label: 'Adoption Requests', color: 'from-accent-500/20 border-accent-500/30' },
    { icon: '📋', label: 'Care Logs',          color: 'from-green-500/20 border-green-500/30' },
    { icon: '👤', label: 'Shelter Profile',    color: 'from-purple-500/20 border-purple-500/30' },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🐾</span>
          <span className="font-black gradient-text text-lg">FurShield</span>
          <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-accent-500/20 text-orange-300 border border-accent-500/30">
            Shelter
          </span>
        </div>
        <button onClick={logout} className="text-xs text-gray-600 hover:text-red-400 transition-colors">
          Sign out
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <p className="text-gray-500 text-sm mb-1">Shelter Portal</p>
        <h1 className="text-4xl font-black text-white mb-8">
          <span className="gradient-text">{user?.shelterName || user?.name}</span>
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shelterLinks.map((link) => (
            <div key={link.label}
              className={`glass-card p-6 flex flex-col items-start gap-3 cursor-pointer
                bg-gradient-to-br ${link.color} border hover:scale-[1.02] transition-all duration-200`}>
              <span className="text-3xl">{link.icon}</span>
              <span className="font-semibold text-white text-sm">{link.label}</span>
            </div>
          ))}
        </div>

        <div className="mt-12 glass-card p-6 text-center">
          <p className="text-gray-500 text-sm">🚧 Shelter features are being built. Stay tuned!</p>
        </div>
      </main>
    </div>
  );
}
