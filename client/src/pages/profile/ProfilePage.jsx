import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import UserService from '../../api/userService.js';

const inputCls = `w-full bg-white border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-body
  placeholder-[#8A8279] text-sm focus:outline-none focus:border-primary-500/60
  focus:ring-2 focus:ring-primary-500/20 transition-all`;

function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-body block mb-1.5">
        {label} {required && <span className="text-[#8C4238] font-bold">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-[#8C4238] flex items-center gap-1 mt-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-body mb-5 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>
      {children}
    </div>
  );
}

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const [form, setForm]   = useState({
    name: '', email: '', phone: '', bio: '',
    // address
    street: '', city: '', state: '', pincode: '', country: 'India',
    // vet-specific
    specialization: '', experience: '', clinicName: '', clinicAddress: '',
    // shelter-specific
    shelterName: '', shelterLicense: '',
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [pwErrors, setPwErrors] = useState({});
  const [saving,   setSaving]   = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [msg,      setMsg]      = useState(null);
  const [pwMsg,    setPwMsg]    = useState(null);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await UserService.getProfile();
        const u = data.data;
        setForm({
          name:           u.name            ?? '',
          email:          u.email           ?? '',
          phone:          u.phone           ?? '',
          bio:            u.bio             ?? '',
          street:         u.address?.street  ?? '',
          city:           u.address?.city    ?? '',
          state:          u.address?.state   ?? '',
          pincode:        u.address?.pincode ?? '',
          country:        u.address?.country ?? 'India',
          specialization: u.specialization   ?? '',
          experience:     u.experience?.toString() ?? '',
          clinicName:     u.clinicName       ?? '',
          clinicAddress:  u.clinicAddress    ?? '',
          shelterName:    u.shelterName      ?? '',
          shelterLicense: u.shelterLicense   ?? '',
        });
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const set = (k) => (e) => {
    setForm(p => ({ ...p, [k]: e.target.value }));
    if (profileErrors[k]) setProfileErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };
  const setPw = (k) => (e) => {
    setPwForm(p => ({ ...p, [k]: e.target.value }));
    if (pwErrors[k]) setPwErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const validateProfile = () => {
    const errs = {};
    if (!form.name.trim()) {
      errs.name = 'Full Name is required';
    } else if (form.name.trim().length < 2) {
      errs.name = 'Name must be at least 2 characters';
    }
    setProfileErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setSaving(true); setMsg(null);
    try {
      const payload = {
        name:  form.name.trim(),
        phone: form.phone ? form.phone.trim() : undefined,
        bio:   form.bio   ? form.bio.trim()   : undefined,
        address: { street: form.street, city: form.city, state: form.state, pincode: form.pincode, country: form.country },
        ...(user?.role === 'veterinarian' && {
          specialization: form.specialization, experience: form.experience ? Number(form.experience) : undefined,
          clinicName: form.clinicName, clinicAddress: form.clinicAddress,
        }),
        ...(user?.role === 'shelter' && { shelterName: form.shelterName, shelterLicense: form.shelterLicense }),
      };
      const { data } = await UserService.updateProfile(payload);
      if (setUser) setUser(data.data);
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update profile.' });
    } finally { setSaving(false); }
  };

  const validatePassword = () => {
    const errs = {};
    if (!pwForm.currentPassword) errs.currentPassword = 'Current password is required';
    if (!pwForm.newPassword) {
      errs.newPassword = 'New password is required';
    } else if (pwForm.newPassword.length < 8) {
      errs.newPassword = 'New password must be at least 8 characters';
    }
    if (!pwForm.confirmPassword) {
      errs.confirmPassword = 'Confirm your new password';
    } else if (pwForm.newPassword !== pwForm.confirmPassword) {
      errs.confirmPassword = 'New passwords do not match';
    }
    setPwErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setPwSaving(true); setPwMsg(null);
    try {
      await UserService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErrors({});
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally { setPwSaving(false); }
  };

  const MsgBanner = ({ msg }) => msg ? (
    <div className={`p-3 rounded-xl text-sm flex items-center gap-2 mt-4
      ${msg.type === 'success' ? 'bg-primary-50 border border-primary-200 text-primary-600' : 'bg-[#F4EBE8] border border-[#E0C8C4] text-[#8C4238]'}`}>
      <span>{msg.type === 'success' ? '✅' : '⚠️'}</span> {msg.text}
    </div>
  ) : null;

  const roleLabel = { petOwner: '🐾 Pet Owner', veterinarian: '🩺 Veterinarian', shelter: '🏠 Shelter' }[user?.role] ?? '';

  if (loading) return (
    <DashboardLayout pageTitle="My Profile">
      <div className="flex items-center justify-center py-24"><div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout pageTitle="My Profile 👤">
      <div className="px-4 sm:px-6 py-8 max-w-3xl mx-auto space-y-6">

        {/* Avatar header */}
        <div className="glass-card p-6 flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/30 to-accent-500/20
            flex items-center justify-center text-4xl border border-primary-500/20 flex-shrink-0">
            {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover rounded-2xl" /> : '👤'}
          </div>
          <div>
            <h2 className="text-2xl font-heading font-semibold text-strong">{user?.name}</h2>
            <p className="text-muted text-sm">{user?.email}</p>
            <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Profile form */}
        <SectionCard title="Personal Information" icon="📝">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required error={profileErrors.name}>
                <input
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Your full name"
                  className={`w-full rounded-xl px-4 py-2.5 text-body placeholder-[#8A8279] text-sm focus:outline-none transition-all ${
                    profileErrors.name
                      ? 'border border-[#B87A74] bg-[#FDF7F7] focus:border-[#8C4238]'
                      : 'border border-[#E8E2D9] bg-white focus:border-primary-500'
                  }`}
                />
              </Field>
              <Field label="Email Address">
                <input value={form.email} disabled className={`${inputCls} opacity-50 cursor-not-allowed`} />
              </Field>
              <Field label="Phone Number">
                <input value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" className={inputCls} />
              </Field>
            </div>
            <Field label="Bio / About">
              <textarea value={form.bio} onChange={set('bio')} rows={3} placeholder="Tell us about yourself…"
                className={`${inputCls} resize-none`} />
            </Field>

            {/* Address */}
            <div className="pt-4 border-t border-[#E8E2D9]">
              <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Address</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Field label="Street"><input value={form.street} onChange={set('street')} placeholder="Street / Apartment" className={inputCls} /></Field>
                </div>
                <Field label="City"><input value={form.city} onChange={set('city')} placeholder="City" className={inputCls} /></Field>
                <Field label="State"><input value={form.state} onChange={set('state')} placeholder="State" className={inputCls} /></Field>
                <Field label="PIN Code"><input value={form.pincode} onChange={set('pincode')} placeholder="PIN Code" className={inputCls} /></Field>
                <Field label="Country"><input value={form.country} onChange={set('country')} placeholder="Country" className={inputCls} /></Field>
              </div>
            </div>

            {/* Vet fields */}
            {user?.role === 'veterinarian' && (
              <div className="pt-4 border-t border-[#E8E2D9]">
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Veterinarian Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Specialization"><input value={form.specialization} onChange={set('specialization')} placeholder="e.g. Small Animal Surgery" className={inputCls} /></Field>
                  <Field label="Years of Experience"><input type="number" value={form.experience} onChange={set('experience')} placeholder="e.g. 8" className={inputCls} /></Field>
                  <Field label="Clinic Name"><input value={form.clinicName} onChange={set('clinicName')} placeholder="Clinic / Hospital name" className={inputCls} /></Field>
                  <Field label="Clinic Address"><input value={form.clinicAddress} onChange={set('clinicAddress')} placeholder="Clinic address" className={inputCls} /></Field>
                </div>
              </div>
            )}

            {/* Shelter fields */}
            {user?.role === 'shelter' && (
              <div className="pt-4 border-t border-[#E8E2D9]">
                <p className="text-xs font-semibold text-muted uppercase tracking-widest mb-4">Shelter Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Shelter Name"><input value={form.shelterName} onChange={set('shelterName')} placeholder="Official shelter name" className={inputCls} /></Field>
                  <Field label="License Number"><input value={form.shelterLicense} onChange={set('shelterLicense')} placeholder="Shelter license / reg. number" className={inputCls} /></Field>
                </div>
              </div>
            )}

            <MsgBanner msg={msg} />
            <button type="submit" disabled={saving} id="save-profile-btn" className="btn-primary w-full justify-center disabled:opacity-50">
              {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : '✓ Save Profile'}
            </button>
          </form>
        </SectionCard>

        {/* Change password */}
        <SectionCard title="Change Password" icon="🔒">
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { key: 'currentPassword', label: 'Current Password',  placeholder: 'Enter your current password' },
              { key: 'newPassword',     label: 'New Password',      placeholder: 'At least 8 characters' },
              { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
            ].map(({ key, label, placeholder }) => (
              <Field key={key} label={label} required error={pwErrors[key]}>
                <input
                  type="password"
                  value={pwForm[key]}
                  onChange={setPw(key)}
                  placeholder={placeholder}
                  className={`w-full rounded-xl px-4 py-2.5 text-body placeholder-[#8A8279] text-sm focus:outline-none transition-all ${
                    pwErrors[key]
                      ? 'border border-[#B87A74] bg-[#FDF7F7] focus:border-[#8C4238]'
                      : 'border border-[#E8E2D9] bg-white focus:border-primary-500'
                  }`}
                />
              </Field>
            ))}
            <MsgBanner msg={pwMsg} />
            <button type="submit" disabled={pwSaving} id="change-password-btn"
              className="btn-outline w-full justify-center disabled:opacity-50">
              {pwSaving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating…</> : '🔒 Update Password'}
            </button>
          </form>
        </SectionCard>
      </div>
    </DashboardLayout>
  );
}
