import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Unauthorized() {
  const { getDashboardPath, user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center px-6">
      <div className="animate-fade-in">
        <p className="text-7xl mb-6">🚫</p>
        <h1 className="text-5xl font-black text-white mb-4">Access Denied</h1>
        <p className="text-gray-400 mb-2">You don't have permission to view this page.</p>
        <p className="text-gray-600 mb-8 text-sm">Your role: <span className="text-primary-400">{user?.role}</span></p>
        <Link to={getDashboardPath(user?.role)} className="btn-primary">
          Go to My Dashboard
        </Link>
      </div>
    </div>
  );
}
