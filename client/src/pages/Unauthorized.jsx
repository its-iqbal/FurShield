import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Unauthorized() {
  const { getDashboardPath, user } = useAuth();
  return (
    <div className="min-h-screen bg-page flex items-center justify-center text-center px-6">
      <div className="animate-fade-in">
        <p className="text-7xl mb-6">🚫</p>
        <h1 className="text-5xl font-black text-body mb-4">Access Denied</h1>
        <p className="text-muted mb-2">You don't have permission to view this page.</p>
        <p className="text-subtle mb-8 text-sm">Your role: <span className="text-primary-400">{user?.role}</span></p>
        <Link to={getDashboardPath(user?.role)} className="btn-primary">
          Go to My Dashboard
        </Link>
      </div>
    </div>
  );
}
