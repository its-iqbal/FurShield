import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import UserService from '../../api/userService.js';

const inputCls = `w-full bg-gray-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white
  placeholder-gray-600 text-sm focus:outline-none focus:border-primary-500/60
  focus:ring-2 focus:ring-primary-500/20 transition-all`;

function Field({ label, required, children }) {
  return (
    <div>
      <label className="text-sm font-medium text-gray-300 block mb-1.5">
        {label} {required && <span className="text-primary-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
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

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setPw = (k) => (e) => setPwForm(p => ({ ...p, [k]: e.target.value }));

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setMsg(null);
    try {
      const payload = {
        name:  form.name,
        phone: form.phone || undefined,
        bio:   form.bio   || undefined,
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match.' }); return;
    }
    setPwSaving(true); setPwMsg(null);
    try {
      await UserService.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      setPwMsg({ type: 'success', text: 'Password changed successfully!' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.response?.data?.message || 'Failed to change password.' });
    } finally { setPwSaving(false); }
  };

  const MsgBanner = ({ msg }) => msg ? (
    <div className={`p-3 rounded-xl text-sm flex items-center gap-2 mt-4
      ${msg.type === 'success' ? 'bg-green-500/10 border border-green-500/20 text-green-400' : 'bg-red-500/10 border border-red-500/20 text-red-400'}`}>
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
            <h2 className="text-2xl font-black text-white">{user?.name}</h2>
            <p className="text-gray-500 text-sm">{user?.email}</p>
            <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 border border-primary-500/20">
              {roleLabel}
            </span>
          </div>
        </div>

        {/* Profile form */}
        <SectionCard title="Personal Information" icon="📝">
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" required>
                <input value={form.name} onChange={set('name')} placeholder="Your full name" className={inputCls} />
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
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Address</p>
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
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Veterinarian Details</p>
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
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">Shelter Details</p>
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
              <Field key={key} label={label} required>
                <input type="password" value={pwForm[key]} onChange={setPw(key)} placeholder={placeholder} className={inputCls} />
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
