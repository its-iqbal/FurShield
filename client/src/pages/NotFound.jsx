import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center px-6">
      <div className="animate-fade-in">
        <p className="text-8xl mb-6">🐾</p>
        <h1 className="text-6xl font-black gradient-text mb-4">404</h1>
        <p className="text-gray-400 text-xl mb-2">Oops! This page has wandered off.</p>
        <p className="text-gray-600 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary">← Back to Home</Link>
      </div>
    </div>
  );
}
