import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Modal from '../../components/ui/Modal.jsx';
import AdoptionService from '../../api/adoptionService.js';

const SPECIES = ['all','dog','cat','bird','rabbit','reptile','fish','other'];
const SPECIES_EMOJI = { dog:'🐕', cat:'🐱', bird:'🦜', rabbit:'🐰', reptile:'🦎', fish:'🐠', other:'🐾' };
const AGE_GROUPS = ['all','puppy/kitten','young','adult','senior'];

// ── Listing card ──────────────────────────────────────────────────────────────
function ListingCard({ listing, onViewDetail }) {
  const emoji = SPECIES_EMOJI[listing.species] ?? '🐾';
  return (
    <div className="glass-card overflow-hidden group hover:scale-[1.02] transition-all duration-200 cursor-pointer"
      onClick={() => onViewDetail(listing)}
      id={`adopt-listing-${listing._id}`}>
      {/* Image */}
      <div className="h-44 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center relative overflow-hidden">
        {listing.images?.[0]
          ? <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <span className="text-7xl opacity-30">{emoji}</span>
        }
        <div className="absolute top-2 right-2">
          <span className={`text-xs font-bold px-2 py-1 rounded-full
            ${listing.status === 'available' ? 'bg-green-500/20 text-primary-600 border border-green-500/30' : 'bg-gray-500/20 text-muted border border-gray-500/30'}`}>
            {listing.status === 'available' ? '✅ Available' : listing.status}
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{emoji}</span>
          <div>
            <h3 className="text-strong font-bold">{listing.name}</h3>
            <p className="text-muted text-xs capitalize">
              {listing.species}{listing.breed ? ` · ${listing.breed}` : ''}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          {listing.age && <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F0F5] text-info-500 border border-info-400">{listing.age}</span>}
          {listing.gender && <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-muted capitalize">{listing.gender}</span>}
          {listing.isVaccinated && <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-600 border border-primary-200">💉 Vaccinated</span>}
          {listing.isNeutered && <span className="text-xs px-2 py-0.5 rounded-full bg-[#E8F0F5] text-info-600 border border-info-400">✂️ Neutered</span>}
        </div>

        {listing.description && (
          <p className="text-muted text-xs line-clamp-2 mb-3">{listing.description}</p>
        )}

        <div className="flex items-center justify-between">
          {listing.shelter?.shelterName && (
            <p className="text-subtle text-xs">🏠 {listing.shelter.shelterName}</p>
          )}
          <button className="text-xs text-primary-400 hover:text-primary-300 font-semibold transition-colors ml-auto">
            Adopt Me →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail + interest form modal ──────────────────────────────────────────────
function ListingDetail({ listing, onSubmitInterest, isSubmitting, submitted }) {
  const [form, setForm] = useState({ message: '', experience: '', livingSpace: '' });
  const emoji = SPECIES_EMOJI[listing.species] ?? '🐾';

  if (submitted) return (
    <div className="text-center py-8 animate-fade-in">
      <p className="text-5xl mb-4">🎉</p>
      <h3 className="text-xl font-black text-body mb-2">Interest Submitted!</h3>
      <p className="text-muted text-sm">The shelter will review your request and contact you soon.</p>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Pet header */}
      <div className="flex items-center gap-4 mb-5">
        <div className="w-16 h-16 rounded-2xl [#EEEAE4] flex items-center justify-center text-4xl border border-[#E8E2D9] flex-shrink-0">
          {listing.images?.[0]
            ? <img src={listing.images[0]} alt={listing.name} className="w-full h-full object-cover rounded-2xl" />
            : emoji}
        </div>
        <div>
          <h2 className="text-2xl font-heading font-semibold text-strong">{listing.name}</h2>
          <p className="text-muted text-sm capitalize">{listing.species}{listing.breed ? ` · ${listing.breed}` : ''}</p>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Age',    value: listing.age    || '—' },
          { label: 'Gender', value: listing.gender || '—' },
          { label: 'Color',  value: listing.color  || '—' },
        ].map((i) => (
          <div key={i.label} className="bg-primary-50 rounded-xl p-3 border border-[#E8E2D9] text-center">
            <p className="text-subtle text-xs">{i.label}</p>
            <p className="text-strong text-sm font-semibold capitalize mt-0.5">{i.value}</p>
          </div>
        ))}
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {listing.isVaccinated && <span className="text-xs px-3 py-1 rounded-full bg-primary-50 text-primary-600 border border-primary-200">💉 Vaccinated</span>}
        {listing.isNeutered   && <span className="text-xs px-3 py-1 rounded-full bg-[#E8F0F5] text-purple-300 border border-info-400">✂️ Neutered</span>}
        {listing.isHouseTrained && <span className="text-xs px-3 py-1 rounded-full bg-[#E8F0F5] text-info-500 border border-info-400">🏠 House trained</span>}
      </div>

      {listing.description && (
        <div className="mb-5">
          <p className="text-xs text-muted mb-2 uppercase tracking-wider font-medium">About {listing.name}</p>
          <p className="text-body text-sm leading-relaxed bg-primary-50 rounded-xl p-4 border border-[#E8E2D9]">{listing.description}</p>
        </div>
      )}

      {/* Interest form */}
      {listing.status === 'available' && (
        <div className="border-t border-[#E8E2D9] pt-5">
          <h3 className="text-strong font-bold mb-4">💌 Express Adoption Interest</h3>
          <div className="space-y-3">
            {[
              { key: 'message',      label: 'Why do you want to adopt?',            placeholder: "Tell the shelter why you'd be a great match…" },
              { key: 'experience',   label: 'Pet ownership experience',             placeholder: 'e.g. First-time owner, have had cats for 5 years…' },
              { key: 'livingSpace',  label: 'Your living environment',              placeholder: 'e.g. 2BHK apartment, house with garden, ground floor…' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-sm font-medium text-body block mb-1.5">{label}</label>
                <textarea value={form[key]} onChange={(e) => setForm(p => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder} rows={2}
                  className="w-full bg-white border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-body
                    placeholder-[#8A8279] text-sm focus:outline-none focus:border-primary-500 resize-none transition-all" />
              </div>
            ))}
          </div>
          <button onClick={() => onSubmitInterest(listing._id, form)} disabled={isSubmitting || !form.message.trim()}
            id="submit-adoption-interest-btn"
            className="btn-primary w-full justify-center mt-4 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
            {isSubmitting
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting…</>
              : '🐾 Submit Adoption Interest'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Main AdoptionPage ─────────────────────────────────────────────────────────
export default function AdoptionPage() {
  const [listings,    setListings]  = useState([]);
  const [loading,     setLoading]   = useState(true);
  const [filterSpec,  setFilterSpec]= useState('all');
  const [filterAge,   setFilterAge] = useState('all');
  const [active,      setActive]    = useState(null);
  const [showDetail,  setShowDetail]= useState(false);
  const [submitting,  setSubmitting]= useState(false);
  const [submitted,   setSubmitted] = useState(false);

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { status: 'available', limit: 50 };
      if (filterSpec !== 'all') params.species = filterSpec;
      if (filterAge  !== 'all') params.age      = filterAge;
      const { data } = await AdoptionService.getListings(params);
      setListings(data.data);
    } catch { setListings([]); }
    finally { setLoading(false); }
  }, [filterSpec, filterAge]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const openDetail = (listing) => { setActive(listing); setSubmitted(false); setShowDetail(true); };

  const handleSubmitInterest = async (listingId, form) => {
    setSubmitting(true);
    try { await AdoptionService.submitInterest(listingId, form); setSubmitted(true); }
    catch {}
    finally { setSubmitting(false); }
  };

  return (
    <DashboardLayout pageTitle="Adopt a Pet 🏠">
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-semibold text-strong">Find Your Companion 🐾</h2>
          <p className="text-muted text-sm mt-1">Browse pets available for adoption from registered shelters</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted">Species:</span>
            {SPECIES.map((s) => (
              <button key={s} onClick={() => setFilterSpec(s)}
                className={`text-xs px-3 py-1.5 rounded-full border capitalize transition-all
                  ${filterSpec === s
                    ? 'bg-primary-100 border-primary-400 text-primary-900 font-semibold shadow-sm'
                    : 'bg-primary-50 border-[#E8E2D9] text-muted hover:border-warm-md hover:text-body'
                  }`}>
                {s === 'all' ? 'All' : `${SPECIES_EMOJI[s]} ${s}`}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card animate-pulse">
                <div className="h-44 bg-primary-50 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/10 rounded w-1/2" />
                  <div className="h-3 bg-primary-50 rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4 opacity-30">🐾</p>
            <p className="text-muted">No pets available right now. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {listings.map((l) => <ListingCard key={l._id} listing={l} onViewDetail={openDetail} />)}
          </div>
        )}
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={`Adopt ${active?.name ?? ''}`} size="md">
        {active && (
          <ListingDetail
            listing={active}
            onSubmitInterest={handleSubmitInterest}
            isSubmitting={submitting}
            submitted={submitted}
          />
        )}
      </Modal>
    </DashboardLayout>
  );
}
