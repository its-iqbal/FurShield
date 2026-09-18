import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function InputField({ id, label, type = 'text', value, onChange, placeholder, error, icon, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="form-label">{label}</label>
      <div className="relative">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A39A] pointer-events-none select-none">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`form-input ${error ? 'form-input-error' : ''} ${icon ? 'pl-10' : ''}`}
        />
      </div>
      {hint  && <p className="form-hint-text">{hint}</p>}
      {error && <p className="form-error-text">{error}</p>}
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
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-300
              ${step < currentStep  ? 'bg-primary-500 text-white'
              : step === currentStep ? 'bg-white border-2 border-primary-500 text-primary-600'
              : 'bg-[#EEEAE4] border border-[#D9D4CC] text-[#8A8279]'}`}
          >
            {step < currentStep ? '✓' : step}
          </div>
          {step < totalSteps && (
            <div className={`h-px w-8 transition-all duration-500 ${step < currentStep ? 'bg-primary-400' : 'bg-[#D9D4CC]'}`} />
          )}
        </div>
      ))}
      <span className="ml-2 text-xs text-subtle">Step {currentStep} of {totalSteps}</span>
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
  },
  {
    id:          'veterinarian',
    icon:        '🩺',
    label:       'Veterinarian',
    description: 'View patient histories, log treatments, manage your schedule and availability.',
  },
  {
    id:          'shelter',
    icon:        '🏠',
    label:       'Animal Shelter',
    description: 'List adoptable animals, manage care logs, and coordinate with potential adopters.',
  },
];

function StepRole({ selected, onSelect, onNext }) {
  return (
    <div className="animate-fade-in">
      <h2 className="font-['Fraunces'] text-2xl font-semibold text-primary-900 mb-1">I am a…</h2>
      <p className="text-muted text-sm mb-6">Select the role that best describes you.</p>

      <div className="flex flex-col gap-3 mb-8">
        {roles.map((role) => (
          <button
            key={role.id}
            id={`role-${role.id}`}
            type="button"
            onClick={() => onSelect(role.id)}
            className={`relative flex items-start gap-4 p-5 rounded-2xl border text-left
              transition-all duration-150 group
              ${selected === role.id
                ? 'bg-primary-50 border-primary-400 shadow-warm-sm'
                : 'bg-white border-[#E8E2D9] hover:border-primary-300 hover:bg-primary-50/50'
              }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 transition-colors duration-150
              ${selected === role.id ? 'bg-primary-200' : 'bg-[#F1F5F1] group-hover:bg-primary-100'}`}>
              {role.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-body text-sm mb-0.5">{role.label}</p>
              <p className="text-muted text-xs leading-relaxed">{role.description}</p>
            </div>
            {selected === role.id && (
              <span className="absolute top-4 right-4 w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-body text-[10px] flex-shrink-0">✓</span>
            )}
          </button>
        ))}
      </div>

      <button
        id="role-next-btn"
        type="button"
        disabled={!selected}
        onClick={onNext}
        className="btn-accent w-full disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue →
      </button>
    </div>
  );
}

// ── STEP 2: Account details ───────────────────────────────────────────────────
function StepDetails({ role, form, onChange, errors, onBack, onNext, busy, apiError }) {
  const roleMeta       = roles.find((r) => r.id === role);
  const [showPw, setShowPw]     = useState(false);
  const [showConfirm, setShowCf] = useState(false);
  const namePlaceholder = role === 'shelter' ? 'Contact Person Name' : 'Your full name';
  const nameLabel       = role === 'shelter' ? 'Contact Person Name' : 'Full Name';

  // Password strength
  const getStrength = (pw) => {
    if (!pw) return 0;
    let s = 0;
    if (pw.length >= 8)  s++;
    if (/[A-Z]/.test(pw)) s++;
    if (/[0-9]/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s;
  };
  const strength     = getStrength(form.password);
  const strengthColor = ['bg-[#D9D4CC]', 'bg-[#B87A74]', 'bg-[#C9913D]', 'bg-info-500', 'bg-primary-500'][strength];
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength];

  return (
    <div className="animate-fade-in">
      {/* Role badge */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-medium mb-6">
        <span aria-hidden="true">{roleMeta?.icon}</span>
        <span>Registering as {roleMeta?.label}</span>
      </div>

      <h2 className="font-['Fraunces'] text-2xl font-semibold text-primary-900 mb-1">Create your account</h2>
      <p className="text-muted text-sm mb-6">Fill in your details to get started.</p>

      {apiError && (
        <div className="alert-error mb-4 animate-fade-in">
          <span aria-hidden="true">⚠</span>
          <span>{apiError}</span>
        </div>
      )}

      <div className="flex flex-col gap-4">
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
          icon="✉"
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

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-password" className="form-label">Password</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A39A] pointer-events-none select-none">🔒</span>
            <input
              id="reg-password"
              type={showPw ? 'text' : 'password'}
              value={form.password}
              onChange={(e) => onChange('password', e.target.value)}
              placeholder="Min. 8 characters"
              autoComplete="new-password"
              className={`form-input pl-10 pr-12 ${errors.password ? 'form-input-error' : ''}`}
            />
            <button type="button" onClick={() => setShowPw(!showPw)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-body transition-colors text-sm">
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
          {/* Strength bar */}
          {form.password && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex gap-1 flex-1">
                {[1,2,3,4].map((i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColor : 'bg-[#E8E2D9]'}`} />
                ))}
              </div>
              {strengthLabel && <span className="text-[11px] text-muted">{strengthLabel}</span>}
            </div>
          )}
          {errors.password && <p className="form-error-text">{errors.password}</p>}
        </div>

        {/* Confirm Password */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8A39A] pointer-events-none select-none">🔒</span>
            <input
              id="reg-confirm"
              type={showConfirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={(e) => onChange('confirmPassword', e.target.value)}
              placeholder="Repeat your password"
              autoComplete="new-password"
              className={`form-input pl-10 pr-12 ${errors.confirmPassword ? 'form-input-error' : ''}`}
            />
            <button type="button" onClick={() => setShowCf(!showConfirm)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-body transition-colors text-sm">
              {showConfirm ? '🙈' : '👁'}
            </button>
          </div>
          {errors.confirmPassword && <p className="form-error-text">{errors.confirmPassword}</p>}
        </div>
      </div>

      <div className="flex gap-3 mt-8">
        <button type="button" onClick={onBack} className="btn-outline px-5 py-3 text-sm">
          ← Back
        </button>
        <button
          id="register-submit-btn"
          type="button"
          disabled={busy}
          onClick={onNext}
          className="btn-accent flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? <><span className="spinner w-4 h-4" /><span>Creating account…</span></> : 'Create Account →'}
        </button>
      </div>
    </div>
  );
}

// ── STEP 3: Success ───────────────────────────────────────────────────────────
function StepSuccess({ role, name }) {
  const roleLabel = roles.find((r) => r.id === role)?.label ?? '';
  return (
    <div className="animate-fade-in text-center py-6">
      <div className="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center text-4xl mx-auto mb-6">
        🎉
      </div>
      <h2 className="font-['Fraunces'] text-3xl font-semibold text-primary-900 mb-2">You're all set!</h2>
      <p className="text-body mb-2">
        Welcome to FurShield, <span className="text-primary-700 font-semibold">{name}</span>!
      </p>
      <p className="text-muted text-sm mb-8">
        Your {roleLabel} account has been created. Redirecting you to your dashboard…
      </p>
      <div className="spinner mx-auto" />
    </div>
  );
}

// ── Main Register Page ────────────────────────────────────────────────────────
export default function RegisterPage() {
  const { register: registerUser, error: apiError, clearError } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]         = useState(1);
  const TOTAL_STEPS             = 3;
  const [selectedRole, setRole] = useState('');
  const [form, setForm]         = useState({
    name: '', email: '', phone: '', password: '', confirmPassword: '', shelterName: '',
  });
  const [errors, setErrors]     = useState({});
  const [busy, setBusy]         = useState(false);
  const [registeredUser, setRU] = useState(null);

  useEffect(() => { if (apiError) clearError(); }, [form]);

  const handleChange = (field, value) => {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) {
      setErrors((p) => {
        const next = { ...p };
        delete next[field];
        return next;
      });
    }
  };

  const validateStep2 = () => {
    const errs = {};
    if (selectedRole === 'shelter' && !form.shelterName.trim()) errs.shelterName = 'Shelter name is required';
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

  const handleRegister = async () => {
    if (!validateStep2()) return;
    setBusy(true);
    const payload = {
      name: form.name, email: form.email, phone: form.phone,
      password: form.password, role: selectedRole,
    };
    if (selectedRole === 'shelter') payload.shelterName = form.shelterName;
    const result = await registerUser(payload);
    setBusy(false);
    if (result.success) {
      setRU(result.user);
      setStep(3);
      const path = selectedRole === 'veterinarian' ? '/vet/dashboard'
                 : selectedRole === 'shelter'      ? '/shelter/dashboard'
                 : '/dashboard';
      setTimeout(() => navigate(path, { replace: true }), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-page flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg animate-fade-in">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-2xl" aria-hidden="true">🐾</span>
            <span className="font-['Fraunces'] text-xl font-semibold text-primary-800">FurShield</span>
          </Link>
          <Link to="/login" className="text-sm text-muted hover:text-body transition-colors">
            Already have an account? <span className="text-primary-600 font-medium">Sign in</span>
          </Link>
        </div>

        {/* Card */}
        <div className="card-surface p-8">
          {step < 3 && <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />}

          {step === 1 && (
            <StepRole selected={selectedRole} onSelect={setRole} onNext={() => setStep(2)} />
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

        <p className="text-center text-subtle text-xs mt-6">
          By creating an account you agree to our{' '}
          <a href="#" className="text-primary-600 hover:underline">Terms</a> &{' '}
          <a href="#" className="text-primary-600 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
