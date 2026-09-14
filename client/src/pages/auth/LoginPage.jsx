import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// ── Small reusable UI atoms ───────────────────────────────────────────────────

function InputField({ id, label, type = 'text', value, onChange, placeholder, error, icon, rightElement }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-300">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-lg pointer-events-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full bg-gray-900/80 border rounded-xl px-4 py-3 text-white placeholder-gray-600
            focus:outline-none focus:ring-2 transition-all duration-200
            ${icon ? 'pl-10' : ''}
            ${rightElement ? 'pr-12' : ''}
            ${error
              ? 'border-red-500/60 focus:ring-red-500/30'
              : 'border-white/10 focus:border-primary-500/60 focus:ring-primary-500/20'
            }`}
          autoComplete={type === 'password' ? 'current-password' : 'email'}
        />
        {rightElement && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightElement}</span>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
  );
}

// ── Background orb decoration ─────────────────────────────────────────────────
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-800/10 rounded-full blur-2xl" />
    </div>
  );
}

// ── Brand panel (left side on desktop) ───────────────────────────────────────
function BrandPanel() {
  const features = [
    { icon: '🐾', text: 'Manage all your pets in one place' },
    { icon: '📋', text: 'Full health records & vaccination history' },
    { icon: '🩺', text: 'Book vet appointments instantly' },
    { icon: '🏥', text: 'Find adoptable pets near you' },
  ];

  return (
    <div className="hidden lg:flex flex-col justify-between p-12 relative">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <span className="text-3xl">🐾</span>
        <span className="text-2xl font-black gradient-text">FurShield</span>
      </div>

      {/* Hero text */}
      <div className="flex flex-col gap-8">
        <div>
          <h2 className="text-4xl font-black text-white leading-tight mb-4">
            Every Paw & Wing<br />
            <span className="gradient-text">Deserves a Shield</span><br />
            of Love
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed max-w-sm">
            Join thousands of pet owners, vets, and shelters on the platform built for better pet care.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {features.map((f) => (
            <div key={f.text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-sm flex-shrink-0">
                {f.icon}
              </div>
              <span className="text-gray-300 text-sm">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[['50K+', 'Pets Protected'], ['98%', 'Satisfaction'], ['24/7', 'Support']].map(([val, lbl]) => (
          <div key={lbl} className="glass-card p-4 text-center">
            <p className="text-xl font-black gradient-text">{val}</p>
            <p className="text-xs text-gray-500 mt-1">{lbl}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const redirectTo = location.state?.from?.pathname || null;

  const [form, setForm]           = useState({ email: '', password: '' });
  const [showPassword, setShowPw] = useState(false);
  const [fieldErrors, setFE]      = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Clear context error when user starts typing
  useEffect(() => { if (error) clearError(); }, [form]);

  const validate = () => {
    const errs = {};
    if (!form.email)    errs.email    = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    setFE(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const result = await login(form.email, form.password);
    setSubmitting(false);
    if (result.success) {
      const { role } = result.user;
      const dest = redirectTo || (
        role === 'veterinarian' ? '/vet/dashboard'
        : role === 'shelter'   ? '/shelter/dashboard'
        : '/dashboard'
      );
      navigate(dest, { replace: true });
    }
  };

  const busy = submitting || isLoading;

  return (
    <div className="min-h-screen bg-gray-950 flex">
      <BackgroundOrbs />

      {/* ── Left brand panel ── */}
      <div className="lg:w-1/2 relative">
        {/* Gradient divider on desktop */}
        <div className="hidden lg:block absolute inset-y-0 right-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
        <BrandPanel />
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md animate-fade-in">

          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <span className="text-2xl">🐾</span>
            <span className="text-xl font-black gradient-text">FurShield</span>
          </div>

          {/* Card */}
          <div className="glass-card p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-white mb-2">Welcome back</h1>
              <p className="text-gray-500">Sign in to your FurShield account</p>
            </div>

            {/* Global error */}
            {error && (
              <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
                <span className="text-base mt-0.5">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
              <InputField
                id="login-email"
                label="Email address"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                error={fieldErrors.email}
                icon="✉️"
              />

              <InputField
                id="login-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Enter your password"
                error={fieldErrors.password}
                icon="🔒"
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPassword)}
                    className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={busy}
                id="login-submit-btn"
                className="btn-primary justify-center mt-1 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {busy ? <><LoadingSpinner /><span>Signing in…</span></> : 'Sign In →'}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-gray-600 text-xs">New to FurShield?</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <Link
              to="/register"
              id="go-to-register-link"
              className="btn-outline justify-center w-full text-center"
            >
              Create an account
            </Link>
          </div>

          <p className="text-center text-gray-700 text-xs mt-6">
            By signing in you agree to our{' '}
            <a href="#" className="text-primary-500 hover:underline">Terms</a> &amp;{' '}
            <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
