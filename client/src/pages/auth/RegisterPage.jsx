import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// ── Background orbs (same as Login) ──────────────────────────────────────────
function BackgroundOrbs() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse-slow" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
    </div>
  );
}

function LoadingSpinner() {
  return <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />;
}

function InputField({ id, label, type = 'text', value, onChange, placeholder, error, icon, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-300">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">{icon}</span>
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
            ${error
              ? 'border-red-500/60 focus:ring-red-500/30'
              : 'border-white/10 focus:border-primary-500/60 focus:ring-primary-500/20'
            }`}
        />
      </div>
      {hint  && <p className="text-xs text-gray-600">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
              ${step < currentStep  ? 'bg-primary-500 text-white'
              : step === currentStep ? 'bg-primary-500/20 border-2 border-primary-500 text-primary-400'
              : 'bg-white/5 border border-white/10 text-gray-600'}`}
          >
            {step < currentStep ? '✓' : step}
          </div>
          {step < totalSteps && (
            <div className={`h-px w-8 transition-all duration-500 ${step < currentStep ? 'bg-primary-500' : 'bg-white/10'}`} />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs text-gray-500">Step {currentStep} of {totalSteps}</span>
    </div>
  );
}

// ── STEP 1: Role selection ────────────────────────────────────────────────────
const roles = [
  {
    id:          'petOwner',
    icon:        '🐾',
    label:       'Pet Owner',
    description: 'Manage pets, book vet appointments, track health records, and browse the store.',
    color:       'from-primary-500/20 to-primary-600/10',
    border:      'border-primary-500/50',
  },
  {
    id:          'veterinarian',
    icon:        '🩺',
    label:       'Veterinarian',
    description: 'View patient histories, log treatments, manage your schedule and availability.',
    color:       'from-blue-500/20 to-blue-600/10',
    border:      'border-blue-500/50',
  },
  {
    id:          'shelter',
    icon:        '🏠',
    label:       'Animal Shelter',
    description: 'List adoptable animals, manage care logs, and coordinate with potential adopters.',
    color:       'from-accent-500/20 to-accent-600/10',
    border:      'border-accent-500/50',
  },
];

function StepRole({ selected, onSelect, onNext }) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-black text-white mb-1">I am a…</h2>
      <p className="text-gray-500 text-sm mb-6">Select the role that best describes you.</p>

      <div className="flex flex-col gap-3 mb-8">
        {roles.map((role) => (
          <button
            key={role.id}
            id={`role-${role.id}`}
            type="button"
            onClick={() => onSelect(role.id)}
            className={`relative flex items-start gap-4 p-5 rounded-xl border text-left
              transition-all duration-200 group
              ${selected === role.id
                ? `bg-gradient-to-br ${role.color} ${role.border} shadow-lg shadow-primary-500/10 scale-[1.01]`
                : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20'
              }`}
          >
            <span className="text-3xl mt-0.5 group-hover:scale-110 transition-transform duration-200">
              {role.icon}
            </span>
            <div className="flex-1">
              <p className="font-bold text-white mb-1">{role.label}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{role.description}</p>
            </div>
            {selected === role.id && (
              <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs">✓</span>
            )}
          </button>
        ))}
      </div>

      <button
        id="role-next-btn"
        type="button"
        disabled={!selected}
        onClick={onNext}
        className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        Continue →
      </button>
    </div>
  );
}

// ── STEP 2: Account details ───────────────────────────────────────────────────
function StepDetails({ role, form, onChange, errors, onBack, onNext, busy, apiError }) {
  const roleMeta = roles.find((r) => r.id === role);
  const [showPw, setShowPw]     = useState(false);
  const [showConfirm, setShowCf] = useState(false);

  // Extra label for shelter's "name" field
  const namePlaceholder = role === 'shelter' ? 'Contact Person Name' : 'Your full name';
  const nameLabel       = role === 'shelter' ? 'Contact Person Name' : 'Full Name';

  return (
    <div className="animate-fade-in">
      {/* Role badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/30 text-primary-300 text-xs font-medium mb-6">
        <span>{roleMeta?.icon}</span>
        <span>Registering as {roleMeta?.label}</span>
      </div>

      <h2 className="text-2xl font-black text-white mb-1">Create your account</h2>
      <p className="text-gray-500 text-sm mb-6">Fill in your details to get started.</p>

      {apiError && (
        <div className="mb-4 flex items-start gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-fade-in">
          <span>⚠️</span>
          <span>{apiError}</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Shelter name (only for shelter role) */}
        {role === 'shelter' && (
          <InputField
            id="reg-shelter-name"
            label="Shelter / Organization Name"
            value={form.shelterName}
            onChange={(e) => onChange('shelterName', e.target.value)}
            placeholder="Happy Paws Animal Shelter"
            error={errors.shelterName}
            icon="🏠"
          />
        )}

        <InputField
          id="reg-name"
          label={nameLabel}
          value={form.name}
          onChange={(e) => onChange('name', e.target.value)}
          placeholder={namePlaceholder}
          error={errors.name}
          icon="👤"
        />

        <InputField
          id="reg-email"
          label="Email Address"
          type="email"
          value={form.email}
          onChange={(e) => onChange('email', e.target.value)}
          placeholder="you@example.com"
          error={errors.email}
          icon="✉️"
        />

        <InputField
          id="reg-phone"
          label="Phone Number"
          type="tel"
          value={form.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          placeholder="+91 98765 43210"
          error={errors.phone}
          icon="📞"
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-password" className="text-sm font-medium text-gray-300">Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">🔒</span>
            <input
              id="reg-password"
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => onChange('password', e.target.value)}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className={`w-full bg-gray-900/80 border rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-600
                focus:outline-none focus:ring-2 transition-all duration-200
                ${errors.password ? 'border-red-500/60 focus:ring-red-500/30' : 'border-white/10 focus:border-primary-500/60 focus:ring-primary-500/20'}`}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-sm">
              {showPw ? '🙈' : '👁️'}
            </button>
          </div>
          {/* Password strength bar */}
          {form.password && (
            <div className="flex gap-1 mt-1">
              {['weak', 'fair', 'good', 'strong'].map((lvl, i) => {
                const len = form.password.length;
                const filled = len >= 8 * (i + 1) / 4 || (i === 0 && len >= 1) || (i === 1 && len >= 5) || (i === 2 && len >= 8) || (i === 3 && len >= 12 && /[A-Z]/.test(form.password) && /[0-9]/.test(form.password));
                return <div key={lvl} className={`h-1 flex-1 rounded-full transition-all ${filled ? i < 1 ? 'bg-red-500' : i < 2 ? 'bg-yellow-500' : i < 3 ? 'bg-blue-500' : 'bg-green-500' : 'bg-white/10'}`} />;
              })}
            </div>
          )}
          {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-confirm" className="text-sm font-medium text-gray-300">Confirm Password</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">🔒</span>
            <input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => onChange('confirmPassword', e.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className={`w-full bg-gray-900/80 border rounded-xl pl-10 pr-12 py-3 text-white placeholder-gray-600
                focus:outline-none focus:ring-2 transition-all duration-200
                ${errors.confirmPassword ? 'border-red-500/60 focus:ring-red-500/30' : 'border-white/10 focus:border-primary-500/60 focus:ring-primary-500/20'}`}
            />
            <button type="button" onClick={() => setShowCf(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors text-sm">
              {showConfirm ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button type="button" onClick={onBack}
          className="btn-outline px-5 py-3 text-sm">
          ← Back
        </button>
        <button
          id="register-submit-btn"
          type="button"
          disabled={busy}
          onClick={onNext}
          className="btn-primary flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {busy ? <><LoadingSpinner /><span>Creating account…</span></> : 'Create Account 🐾'}
        </button>
      </div>
    </div>
  );
}

// ── STEP 3: Success screen ────────────────────────────────────────────────────
function StepSuccess({ role, name }) {
  const roleLabel = roles.find((r) => r.id === role)?.label ?? '';
  return (
    <div className="animate-fade-in text-center py-4">
      <div className="text-6xl mb-6 animate-bounce">🎉</div>
      <h2 className="text-3xl font-black text-white mb-2">You're all set!</h2>
      <p className="text-gray-400 mb-2">
        Welcome to FurShield, <span className="text-primary-400 font-semibold">{name}</span>!
      </p>
      <p className="text-gray-600 text-sm mb-8">
        Your {roleLabel} account has been created. Redirecting you to your dashboard…
      </p>
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
    </div>
  );
}

// ── Main Register Page ────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { register: registerUser, error: apiError, clearError } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]     = useState(1);
  const TOTAL_STEPS         = 3;

  const [selectedRole, setRole] = useState('');
  const [form, setForm]         = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', shelterName: '',
  });
  const [errors, setErrors]     = useState({});
  const [busy, setBusy]         = useState(false);
  const [registeredUser, setRU] = useState(null);

  useEffect(() => { if (apiError) clearError(); }, [form]);

  const handleChange = (field, value) => setForm((p) => ({ ...p, [field]: value }));

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateStep2 = () => {
    const errs = {};
    if (selectedRole === 'shelter' && !form.shelterName.trim())
      errs.shelterName = 'Shelter name is required';
    if (!form.name.trim())                              errs.name    = 'Name is required';
    if (!form.email.trim())                             errs.email   = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email))         errs.email   = 'Enter a valid email';
    if (!form.phone.trim())                             errs.phone   = 'Phone number is required';
    if (!form.password)                                 errs.password = 'Password is required';
    else if (form.password.length < 8)                  errs.password = 'Min. 8 characters';
    if (!form.confirmPassword)                          errs.confirmPassword = 'Please confirm password';
    else if (form.password !== form.confirmPassword)    errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!validateStep2()) return;
    setBusy(true);

    const payload = {
      name:     form.name,
      email:    form.email,
      phone:    form.phone,
      password: form.password,
      role:     selectedRole,
    };
    if (selectedRole === 'shelter') payload.shelterName = form.shelterName;

    const result = await registerUser(payload);
    setBusy(false);

    if (result.success) {
      setRU(result.user);
      setStep(3);
      // Auto-redirect after success animation
      const path = selectedRole === 'veterinarian' ? '/vet/dashboard'
                 : selectedRole === 'shelter'      ? '/shelter/dashboard'
                 : '/dashboard';
      setTimeout(() => navigate(path, { replace: true }), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12 relative">
      <BackgroundOrbs />

      <div className="w-full max-w-lg relative z-10 animate-fade-in">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🐾</span>
            <span className="text-lg font-black gradient-text">FurShield</span>
          </Link>
          <Link to="/login" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
            Already have an account? <span className="text-primary-400 font-medium">Sign in</span>
          </Link>
        </div>

        {/* Card */}
        <div className="glass-card p-8">
          {step < 3 && <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />}

          {step === 1 && (
            <StepRole
              selected={selectedRole}
              onSelect={setRole}
              onNext={() => setStep(2)}
            />
          )}

          {step === 2 && (
            <StepDetails
              role={selectedRole}
              form={form}
              onChange={handleChange}
              errors={errors}
              onBack={() => setStep(1)}
              onNext={handleRegister}
              busy={busy}
              apiError={apiError}
            />
          )}

          {step === 3 && (
            <StepSuccess role={selectedRole} name={registeredUser?.name ?? form.name} />
          )}
        </div>

        <p className="text-center text-gray-700 text-xs mt-6">
          By creating an account you agree to our{' '}
          <a href="#" className="text-primary-500 hover:underline">Terms</a> &amp;{' '}
          <a href="#" className="text-primary-500 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
