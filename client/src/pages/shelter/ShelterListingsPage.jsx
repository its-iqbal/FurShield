import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import AdoptionService from '../../api/adoptionService.js';
import Modal from '../../components/ui/Modal.jsx';

const SPECIES_EMOJI = { dog: '🐕', cat: '🐱', bird: '🦜', rabbit: '🐰', reptile: '🦎', fish: '🐠', other: '🐾' };
const SPECIES = ['dog', 'cat', 'bird', 'rabbit', 'reptile', 'fish', 'other'];

const SAMPLE_LISTING_PHOTOS = [
  { label: 'Labrador / Retriever', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&auto=format&fit=crop&q=80' },
  { label: 'Beagle', url: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&auto=format&fit=crop&q=80' },
  { label: 'Ginger Cat', url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&auto=format&fit=crop&q=80' },
  { label: 'White Cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80' },
  { label: 'Indie Dog', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=80' },
  { label: 'Rabbit', url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&auto=format&fit=crop&q=80' },
];

const inputCls = `w-full bg-white border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-body
  placeholder-[#8A8279] text-sm focus:outline-none focus:border-primary-500 transition-all`;

// ── Add/Edit listing form ─────────────────────────────────────────────────────
function ListingForm({ initial, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState({
    name: '',
    species: 'dog',
    breed: '',
    age: '',
    gender: 'unknown',
    color: '',
    description: '',
    isVaccinated: false,
    isNeutered: false,
    isHouseTrained: false,
    status: 'available',
    image: initial?.images?.[0] || '',
    ...(initial ?? {}),
  });
  const [errors, setErrs] = useState({});

  const set = (k) => (e) => {
    setForm((p) => ({ ...p, [k]: e.target.value }));
    if (errors[k]) setErrs((p) => { const n = { ...p }; delete n[k]; return n; });
  };
  const setB = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.checked }));

  const validate = () => {
    const e = {};
    const petName = (form.name || form.petName || '').trim();
    if (!petName) {
      e.name = 'Pet name is required';
    } else if (petName.length < 2) {
      e.name = 'Pet name must be at least 2 characters';
    }

    if (!form.species) {
      e.species = 'Species is required';
    }

    if (form.image && form.image.trim()) {
      if (!/^https?:\/\/.+/i.test(form.image.trim())) {
        e.image = 'Image URL must start with http:// or https://';
      }
    }

    if (form.description && form.description.trim().length > 0 && form.description.trim().length < 10) {
      e.description = 'Please write at least 10 characters describing the pet';
    }

    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = {
      ...form,
      petName: form.name || form.petName,
      images: form.image ? [form.image.trim()] : (form.images || []),
    };
    onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {/* Pet Photo */}
      <div className="p-3.5 bg-primary-50/50 rounded-xl border border-[#E8E2D9] flex flex-col sm:flex-row gap-3.5 items-center">
        <div className="w-18 h-18 rounded-2xl bg-white border border-[#E8E2D9] flex items-center justify-center text-3xl overflow-hidden flex-shrink-0 shadow-inner">
          {form.image ? (
            <img src={form.image} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <span>{SPECIES_EMOJI[form.species] || '🐾'}</span>
          )}
        </div>
        <div className="flex-1 w-full space-y-1.5">
          <label className="text-xs font-semibold text-body block">Pet Photo URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={form.image}
              onChange={(e) => {
                setForm((p) => ({ ...p, image: e.target.value }));
                if (errors.image) setErrs((p) => { const n = { ...p }; delete n.image; return n; });
              }}
              placeholder="Paste public image URL (https://...)"
              className={`flex-1 rounded-xl px-3 py-2 text-xs text-body placeholder-[#8A8279] focus:outline-none transition-all ${
                errors.image
                  ? 'border border-[#B87A74] bg-[#FDF7F7] focus:border-[#8C4238]'
                  : 'bg-white border border-[#E8E2D9] focus:border-primary-500'
              }`}
            />
            {form.image && (
              <button
                type="button"
                onClick={() => setForm((p) => ({ ...p, image: '' }))}
                className="px-2 py-1 text-xs text-[#8C4238] border border-red-200 rounded-xl hover:bg-red-50"
              >
                Clear
              </button>
            )}
          </div>
          {errors.image && (
            <p className="text-xs text-[#8C4238] flex items-center gap-1 mt-1">
              <span>⚠️</span> {errors.image}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] text-muted">Or pick sample:</span>
            {SAMPLE_LISTING_PHOTOS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setForm((p) => ({ ...p, image: s.url }));
                  if (errors.image) setErrs((p) => { const n = { ...p }; delete n.image; return n; });
                }}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-white border border-[#E8E2D9] text-body hover:border-primary-500 hover:text-primary-700 transition-all"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-body block mb-1">
            Pet Name <span className="text-[#8C4238] font-bold">*</span>
          </label>
          <input
            value={form.name || form.petName || ''}
            onChange={(e) => {
              setForm((p) => ({ ...p, name: e.target.value, petName: e.target.value }));
              if (errors.name) setErrs((p) => { const n = { ...p }; delete n.name; return n; });
            }}
            placeholder="e.g. Bella"
            className={`w-full rounded-xl px-4 py-2.5 text-body text-sm placeholder-[#8A8279] transition-all focus:outline-none ${
              errors.name
                ? 'border border-[#B87A74] bg-[#FDF7F7] focus:border-[#8C4238]'
                : 'bg-white border border-[#E8E2D9] focus:border-primary-500'
            }`}
          />
          {errors.name && (
            <p className="text-xs text-[#8C4238] flex items-center gap-1 mt-1">
              <span>⚠️</span> {errors.name}
            </p>
          )}
        </div>
        <div>
          <label className="text-xs font-medium text-body block mb-1">
            Species <span className="text-[#8C4238] font-bold">*</span>
          </label>
          <select value={form.species} onChange={set('species')} className={inputCls}>
            {SPECIES.map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-body block mb-1">Breed</label>
          <input value={form.breed} onChange={set('breed')} placeholder="e.g. Labrador Mix" className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-medium text-body block mb-1">Age</label>
          <input value={form.age} onChange={set('age')} placeholder="e.g. 2 years" className={inputCls} />
        </div>
        <div>
          <label className="text-xs font-medium text-body block mb-1">Gender</label>
          <select value={form.gender} onChange={set('gender')} className={inputCls}>
            {['male', 'female', 'unknown'].map((g) => (
              <option key={g} value={g} className="capitalize">
                {g}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-body block mb-1">Color</label>
          <input value={form.color} onChange={set('color')} placeholder="e.g. Golden brown" className={inputCls} />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-body block mb-1">Adoption Status</label>
          <select value={form.status} onChange={set('status')} className={inputCls}>
            {['available', 'pending', 'adopted'].map((s) => (
              <option key={s} value={s} className="capitalize">
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-body block mb-1">About Pet & Temperament</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={set('description')}
          placeholder="Friendly with kids, loves belly rubs, leash-trained…"
          className={`w-full rounded-xl px-4 py-2.5 text-body text-sm placeholder-[#8A8279] transition-all resize-none focus:outline-none ${
            errors.description
              ? 'border border-[#B87A74] bg-[#FDF7F7] focus:border-[#8C4238]'
              : 'bg-white border border-[#E8E2D9] focus:border-primary-500'
          }`}
        />
        {errors.description && (
          <p className="text-xs text-[#8C4238] flex items-center gap-1 mt-1">
            <span>⚠️</span> {errors.description}
          </p>
        )}
      </div>

      <div className="flex gap-4 flex-wrap text-xs pt-1">
        {[
          { key: 'isVaccinated', label: 'Vaccinated 💉' },
          { key: 'isNeutered', label: 'Neutered / Spayed ✂️' },
          { key: 'isHouseTrained', label: 'House Trained 🏡' },
        ].map(({ key, label }) => (
          <label key={key} className="flex items-center gap-2 cursor-pointer text-body">
            <input
              type="checkbox"
              checked={!!form[key]}
              onChange={setB(key)}
              className="rounded accent-primary-500 w-4 h-4"
            />
            {label}
          </label>
        ))}
      </div>

      <div className="flex gap-3 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2 rounded-xl text-xs font-semibold border border-[#E8E2D9] text-muted hover:bg-white"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex-1 btn-primary text-xs py-2 disabled:opacity-50"
        >
          {isSaving ? 'Saving…' : initial ? 'Save Changes' : '+ Publish Listing'}
        </button>
      </div>
    </form>
  );
}

// ── Main Listings Page ────────────────────────────────────────────────────────
export default function ShelterListingsPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [speciesFilter, setSpeciesFilter] = useState('all');
  const [search, setSearch] = useState('');

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdoptionService.getListings({ limit: 100 });
      setListings(res.data.data || []);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleSave = async (form) => {
    setIsSaving(true);
    try {
      if (editing?._id) {
        await AdoptionService.updateListing(editing._id, form);
      } else {
        await AdoptionService.createListing(form);
      }
      await fetchListings();
      setShowModal(false);
      setEditing(null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async (id) => {
    if (!confirm('Are you sure you want to remove this adoption listing?')) return;
    try {
      await AdoptionService.removeListing(id);
      await fetchListings();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return listings.filter((l) => {
      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchesSpecies = speciesFilter === 'all' || l.species === speciesFilter;
      const petName = (l.petName || l.name || '').toLowerCase();
      const breed = (l.breed || '').toLowerCase();
      const matchesSearch = !q || petName.includes(q) || breed.includes(q);
      return matchesStatus && matchesSpecies && matchesSearch;
    });
  }, [listings, statusFilter, speciesFilter, search]);

  return (
    <DashboardLayout pageTitle="Shelter Listings 🐕">
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-muted text-sm font-medium">Animal Shelter Management</p>
            <h1 className="text-3xl font-heading font-semibold text-strong">
              Pet <span className="heading-gradient">Listings</span>
            </h1>
            <p className="text-muted text-sm mt-0.5">
              Manage rescue animals currently available or pending adoption
            </p>
          </div>
          <button
            onClick={() => {
              setEditing(null);
              setShowModal(true);
            }}
            className="btn-primary text-xs sm:text-sm py-2.5 px-4 shadow-sm self-start sm:self-auto"
          >
            + Add New Rescue
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by pet name or breed…"
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E2D9] rounded-xl text-sm text-body placeholder-[#8A8279] focus:outline-none focus:border-primary-500 transition-all"
            />
          </div>

          {/* Status buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { key: 'all', label: 'All Status' },
              { key: 'available', label: 'Available' },
              { key: 'pending', label: 'Pending' },
              { key: 'adopted', label: 'Adopted' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === key
                    ? 'bg-white border border-primary-300 text-primary-900 font-semibold shadow-sm'
                    : 'text-muted hover:text-body hover:bg-white/60'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <span className="text-4xl block mb-3">🐕</span>
            <h3 className="text-lg font-heading font-semibold text-strong mb-1">
              {search || statusFilter !== 'all' ? 'No matching listings found' : 'No pet listings published yet'}
            </h3>
            <p className="text-muted text-sm max-w-md mx-auto mb-4">
              Add your shelter's rescues with photos, age, breed, and temperament to connect with loving families.
            </p>
            <button
              onClick={() => {
                setEditing(null);
                setShowModal(true);
              }}
              className="btn-primary text-xs py-2 px-4"
            >
              + Create First Listing
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((l) => (
              <div
                key={l._id}
                className="glass-card overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group"
              >
                <div>
                  {/* Photo Banner */}
                  <div className="h-44 w-full bg-primary-100 flex items-center justify-center relative overflow-hidden border-b border-[#E8E2D9]">
                    {l.images?.[0] ? (
                      <img
                        src={l.images[0]}
                        alt={l.petName || l.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <span className="text-5xl opacity-40">{SPECIES_EMOJI[l.species] || '🐾'}</span>
                    )}
                    <span
                      className={`absolute top-3 right-3 text-[11px] px-2.5 py-0.5 rounded-full font-semibold border shadow-xs capitalize ${
                        l.status === 'available'
                          ? 'bg-primary-50 text-primary-800 border-primary-300'
                          : l.status === 'pending'
                          ? 'bg-[#F5EDD9] text-[#7A5E2A] border-[#E3D0A8]'
                          : 'bg-[#E8E2D9] text-muted border-[#D9D4CC]'
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-bold text-base text-strong truncate">
                        {l.petName || l.name}
                      </h3>
                      <span className="text-xs text-muted capitalize font-medium">
                        {l.gender !== 'unknown' ? l.gender : ''}
                      </span>
                    </div>

                    <p className="text-xs text-muted">
                      {l.species ? l.species.toUpperCase() : ''} {l.breed ? `· ${l.breed}` : ''} {l.age ? `· ${l.age} yrs` : ''}
                    </p>

                    {l.description && (
                      <p className="text-xs text-body line-clamp-2 bg-primary-50/40 p-2 rounded-lg border border-[#E8E2D9]/60">
                        {l.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setEditing(l);
                      setShowModal(true);
                    }}
                    className="py-1.5 px-3 rounded-xl text-xs font-semibold border border-[#D9D4CC] text-body hover:bg-white transition-all text-center"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleRemove(l._id)}
                    className="py-1.5 px-3 rounded-xl text-xs font-semibold border border-red-200 text-[#8C4238] hover:bg-[#F4EBE8] transition-all text-center"
                  >
                    🗑️ Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal: Add / Edit Listing */}
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditing(null);
          }}
          title={editing ? `Edit ${editing.petName || editing.name}` : 'Add Pet for Adoption'}
        >
          <ListingForm
            initial={editing}
            onSave={handleSave}
            onCancel={() => {
              setShowModal(false);
              setEditing(null);
            }}
            isSaving={isSaving}
          />
        </Modal>

      </div>
    </DashboardLayout>
  );
}
