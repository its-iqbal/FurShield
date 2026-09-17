import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// ── Input field ───────────────────────────────────────────────────────────────
function InputField({ id, label, type = 'text', value, onChange, placeholder, error, icon, rightElement }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A39A] text-base pointer-events-none select-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-input ${error ? 'form-input-error' : ''} ${icon ? 'pl-10' : ''} ${rightElement ? 'pr-12' : ''}`}
          autoComplete={type === 'password' ? 'current-password' : 'email'}
        />
        {rightElement && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">{rightElement}</span>
        )}
      </div>
      {error && <p className="form-error-text">{error}</p>}
    </div>
  );
}

// ── Brand panel (left, desktop) ───────────────────────────────────────────────
function BrandPanel() {
  const features = [
    { icon: '🐾', text: 'Manage all your pets in one place' },
    { icon: '📋', text: 'Full health records & vaccination history' },
    { icon: '🩺', text: 'Book vet appointments instantly' },
    { icon: '🏥', text: 'Find adoptable pets near you' },
  ];

  return (
    <div className="hidden lg:flex flex-col justify-between p-12 h-full relative bg-primary-50 border-r border-primary-200">
      {/* Subtle corner radial */}
      <div className="absolute bottom-0 right-0 w-80 h-80 pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, #C9DCC9 0%, transparent 70%)', transform: 'translate(30%, 30%)' }} />

      {/* Brand */}
      <div className="flex items-center gap-3">
        <span className="text-3xl" aria-hidden="true">🐾</span>
        <span className="font-['Fraunces'] text-2xl font-semibold text-primary-800">FurShield</span>
      </div>

      {/* Hero text */}
      <div className="flex flex-col gap-10 relative z-10">
        <div>
          <h2 className="font-['Fraunces'] text-4xl font-semibold text-primary-900 leading-snug mb-4">
            Every Paw & Wing<br />
            <span style={{
              background: 'linear-gradient(135deg, #4F6B54 0%, #7FA087 60%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
            }}>Deserves a Shield</span><br />
            of Love
          </h2>
          <p className="text-muted text-lg leading-relaxed max-w-sm font-light">
            Join thousands of pet owners, vets, and shelters on the platform built for better pet care.
          </p>
        </div>

        <div className="flex flex-col gap-3.5">
          {features.map((f) => (
            <div key={f.text} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary-200 flex items-center justify-center text-base flex-shrink-0">
                {f.icon}
              </div>
              <span className="text-body text-sm">{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 relative z-10">
        {[['50K+', 'Pets Protected'], ['98%', 'Satisfaction'], ['24/7', 'Support']].map(([val, lbl]) => (
          <div key={lbl} className="card-tint p-4 text-center">
            <p className="font-['Fraunces'] text-xl font-semibold text-primary-700">{val}</p>
            <p className="text-xs text-muted mt-0.5">{lbl}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Login Page ───────────────────────────────────────────────────────────
export default function LoginPage() {
  const { login, isLoading, error, clearError } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const redirectTo = location.state?.from?.pathname || null;

  const [form, setForm]             = useState({ email: '', password: '' });
  const [showPassword, setShowPw]   = useState(false);
  const [fieldErrors, setFE]        = useState({});
  const [submitting, setSubmitting] = useState(false);

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
    <div className="min-h-screen bg-page flex">

      {/* ── Left brand panel ── */}
      <div className="lg:w-[52%] flex-shrink-0">
        <BrandPanel />
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-page">
        <div className="w-full max-w-md animate-fade-in">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <span className="text-2xl" aria-hidden="true">🐾</span>
            <span className="font-['Fraunces'] text-xl font-semibold text-primary-800">FurShield</span>
          </div>

          {/* Form card */}
          <div className="card-surface p-8">
            <div className="mb-8">
              <h1 className="font-['Fraunces'] text-3xl font-semibold text-primary-900 mb-1.5">Welcome back</h1>
              <p className="text-muted text-sm">Sign in to your FurShield account</p>
            </div>

            {/* Global error */}
            {error && (
              <div className="alert-error mb-6 animate-fade-in">
                <span className="text-base mt-0.5 flex-shrink-0" aria-hidden="true">⚠</span>
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
                icon="✉"
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
                    className="text-muted hover:text-body transition-colors text-sm"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? '🙈' : '👁'}
                  </button>
                }
              />

              <button
                type="submit"
                disabled={busy}
                id="login-submit-btn"
                className="btn-accent mt-1 w-full disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {busy
                  ? <><span className="spinner w-4 h-4" /><span>Signing in…</span></>
                  : 'Sign In →'
                }
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="divider flex-1" />
              <span className="text-subtle text-xs">New to FurShield?</span>
              <div className="divider flex-1" />
            </div>

            <Link
              to="/register"
              id="go-to-register-link"
              className="btn-outline w-full text-center"
            >
              Create an account
            </Link>
          </div>

          <p className="text-center text-subtle text-xs mt-6">
            By signing in you agree to our{' '}
            <a href="#" className="text-primary-600 hover:underline">Terms</a> &{' '}
            <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}
