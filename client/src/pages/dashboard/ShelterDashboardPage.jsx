import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import AdoptionService from '../../api/adoptionService.js';
import Modal from '../../components/ui/Modal.jsx';

const SPECIES_EMOJI = { dog:'🐕', cat:'🐱', bird:'🦜', rabbit:'🐰', reptile:'🦎', fish:'🐠', other:'🐾' };
const SPECIES = ['dog','cat','bird','rabbit','reptile','fish','other'];

const inputCls = `w-full bg-gray-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white
  placeholder-gray-600 text-sm focus:outline-none focus:border-primary-500/60 transition-all`;

// ── Add/Edit listing form ─────────────────────────────────────────────────────
function ListingForm({ initial, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState({
    name: '', species: 'dog', breed: '', age: '', gender: 'unknown',
    color: '', description: '', isVaccinated: false, isNeutered: false,
    isHouseTrained: false, status: 'available',
    ...(initial ?? {}),
  });
  const set  = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const setB = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.checked }));

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-300 block mb-1">Pet Name *</label>
          <input value={form.name} onChange={set('name')} required placeholder="e.g. Brownie" className={inputCls} />
        </div>
        <div>
          <label className="text-sm text-gray-300 block mb-1">Species *</label>
          <select value={form.species} onChange={set('species')} className={inputCls}>
            {SPECIES.map(s => <option key={s} value={s} className="bg-gray-900 capitalize">{s}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-300 block mb-1">Breed</label>
          <input value={form.breed} onChange={set('breed')} placeholder="e.g. Labrador" className={inputCls} />
        </div>
        <div>
          <label className="text-sm text-gray-300 block mb-1">Age</label>
          <input value={form.age} onChange={set('age')} placeholder="e.g. 2 years" className={inputCls} />
        </div>
        <div>
          <label className="text-sm text-gray-300 block mb-1">Gender</label>
          <select value={form.gender} onChange={set('gender')} className={inputCls}>
            {['male','female','unknown'].map(g => <option key={g} value={g} className="bg-gray-900 capitalize">{g}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-300 block mb-1">Color</label>
          <input value={form.color} onChange={set('color')} placeholder="e.g. Golden brown" className={inputCls} />
        </div>
        <div>
          <label className="text-sm text-gray-300 block mb-1">Status</label>
          <select value={form.status} onChange={set('status')} className={inputCls}>
            {['available','pending','adopted'].map(s => <option key={s} value={s} className="bg-gray-900 capitalize">{s}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-300 block mb-1">Description</label>
        <textarea value={form.description} onChange={set('description')} rows={3}
          placeholder="Tell potential adopters about this pet's personality…"
          className={`${inputCls} resize-none`} />
      </div>
      <div className="flex flex-wrap gap-4">
        {[
          { key: 'isVaccinated',   label: '💉 Vaccinated'    },
          { key: 'isNeutered',     label: '✂️ Neutered'       },
          { key: 'isHouseTrained', label: '🏠 House Trained'  },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer text-sm text-gray-300">
            <input type="checkbox" checked={form[key]} onChange={setB(key)} className="w-4 h-4 accent-primary-500" />
            {label}
          </label>
        ))}
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="btn-outline flex-shrink-0 px-5 text-sm">Cancel</button>
        <button type="submit" disabled={isSaving} className="btn-primary flex-1 justify-center text-sm disabled:opacity-50">
          {isSaving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</> : '✓ Save Listing'}
        </button>
      </div>
    </form>
  );
}

// ── Interest card ─────────────────────────────────────────────────────────────
function InterestCard({ interest, onApprove, onReject }) {
  return (
    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-white font-bold text-sm">{interest.owner?.name ?? 'Applicant'}</p>
          <p className="text-gray-500 text-xs">{interest.owner?.email}</p>
          <p className="text-gray-500 text-xs">For: <span className="text-gray-300">{interest.listing?.name ?? '—'}</span></p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border capitalize flex-shrink-0
          ${interest.status === 'approved' ? 'bg-green-500/10 text-green-300 border-green-500/20'
          : interest.status === 'rejected' ? 'bg-red-500/10 text-red-300 border-red-500/20'
          : 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20'}`}>
          {interest.status}
        </span>
      </div>
      {interest.message && <p className="text-gray-400 text-xs mb-3 line-clamp-2">{interest.message}</p>}
      {interest.experience && <p className="text-gray-600 text-xs mb-3">🏅 {interest.experience}</p>}
      {interest.status === 'pending' && (
        <div className="flex gap-2">
          <button onClick={() => onApprove(interest._id)}
            className="flex-1 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300 text-xs font-medium hover:bg-green-500/20 transition-all">
            ✅ Approve
          </button>
          <button onClick={() => onReject(interest._id)}
            className="flex-1 py-1.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium hover:bg-red-500/20 transition-all">
            ❌ Reject
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main Shelter Dashboard ────────────────────────────────────────────────────
export default function ShelterDashboardPage() {
  const { user } = useAuth();
  const [listings,   setListings]   = useState([]);
  const [interests,  setInterests]  = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState('listings');
  const [showModal,  setShowModal]  = useState(false);
  const [editing,    setEditing]    = useState(null);
  const [isSaving,   setIsSaving]   = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, intRes] = await Promise.all([
        AdoptionService.getListings({ limit: 50 }),
        AdoptionService.getShelterInterests(),
      ]);
      setListings(listRes.data.data);
      setInterests(intRes.data.data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleSave = async (form) => {
    setIsSaving(true);
    try {
      if (editing?._id) await AdoptionService.updateListing(editing._id, form);
      else              await AdoptionService.createListing(form);
      await fetchAll();
      setShowModal(false);
      setEditing(null);
    } catch {}
    finally { setIsSaving(false); }
  };

  const handleRemoveListing = async (id) => {
    if (!confirm('Remove this listing?')) return;
    try { await AdoptionService.removeListing(id); await fetchAll(); } catch {}
  };

  const handleInterestAction = async (id, status) => {
    try { await AdoptionService.updateInterest(id, { status }); await fetchAll(); } catch {}
  };

  const available = listings.filter(l => l.status === 'available').length;
  const pending   = interests.filter(i => i.status === 'pending').length;

  return (
    <DashboardLayout pageTitle="Shelter Dashboard 🏠">
      <div className="px-4 sm:px-6 py-8 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <p className="text-gray-500 text-sm">Shelter Portal</p>
          <h2 className="text-3xl font-black text-white gradient-text">{user?.shelterName || user?.name}</h2>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: '🐕', label: 'Total Listings',    value: listings.length,  color: 'text-primary-400'  },
            { icon: '✅', label: 'Available',          value: available,         color: 'text-green-400'    },
            { icon: '📬', label: 'Pending Requests',  value: pending,           color: 'text-yellow-400'   },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <span className="text-2xl">{s.icon}</span>
              <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab bar */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div className="flex gap-1 p-1 bg-white/5 rounded-xl border border-white/10">
            {[{ key:'listings', label:'My Listings', emoji:'🐕' }, { key:'interests', label:'Adoption Requests', emoji:'📬' }].map(({ key, label, emoji }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${tab === key ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                <span>{emoji}</span> {label}
                {key === 'interests' && pending > 0 && (
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-yellow-500/30 text-yellow-300">{pending}</span>
                )}
              </button>
            ))}
          </div>
          {tab === 'listings' && (
            <button onClick={() => { setEditing(null); setShowModal(true); }} id="add-listing-btn" className="btn-primary text-sm">
              + Add Listing
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-16"><div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" /></div>
        ) : tab === 'listings' ? (
          listings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4 opacity-30">🐕</p>
              <p className="text-gray-400 mb-4">No listings yet. Add your first pet for adoption.</p>
              <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary text-sm">+ Add First Listing</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {listings.map((l) => (
                <div key={l._id} className="glass-card overflow-hidden group">
                  <div className="h-36 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-5xl relative overflow-hidden">
                    {l.images?.[0] ? <img src={l.images[0]} alt={l.name} className="w-full h-full object-cover" /> : <span className="opacity-30">{SPECIES_EMOJI[l.species] ?? '🐾'}</span>}
                    <div className="absolute top-2 right-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full capitalize
                        ${l.status === 'available' ? 'bg-green-500/30 text-green-200' : 'bg-gray-500/30 text-gray-300'}`}>
                        {l.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-white font-bold text-sm">{l.name}</p>
                    <p className="text-gray-500 text-xs capitalize mb-3">{l.species} · {l.breed || '—'} · {l.age || '—'}</p>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(l); setShowModal(true); }}
                        className="flex-1 text-xs py-1.5 rounded-lg border border-white/10 text-gray-400 hover:border-primary-500/40 hover:text-primary-400 transition-all">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleRemoveListing(l._id)}
                        className="flex-1 text-xs py-1.5 rounded-lg border border-white/10 text-gray-400 hover:border-red-500/40 hover:text-red-400 transition-all">
                        🗑️ Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          interests.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4 opacity-30">📬</p>
              <p className="text-gray-400">No adoption requests yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {interests.map((i) => (
                <InterestCard key={i._id} interest={i}
                  onApprove={(id) => handleInterestAction(id, 'approved')}
                  onReject={(id)  => handleInterestAction(id, 'rejected')} />
              ))}
            </div>
          )
        )}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Listing' : 'Add New Listing 🐕'} size="lg">
        <ListingForm initial={editing} onSave={handleSave} onCancel={() => setShowModal(false)} isSaving={isSaving} />
      </Modal>
    </DashboardLayout>
  );
}
