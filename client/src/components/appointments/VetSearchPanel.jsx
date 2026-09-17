/**
 * components/appointments/VetSearchPanel.jsx
 * Vet search with auto-suggest, city filter, and vet selection card grid.
 * Used in step 2 of the booking wizard.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import AppointmentService from '../../api/appointmentService.js';

// ── Vet card ──────────────────────────────────────────────────────────────────
function VetCard({ vet, isSelected, onSelect }) {
  const days = (vet.availableSlots ?? []).map((s) => s.day?.slice(0, 3)).join(' · ');

  return (
    <button
      type="button"
      id={`select-vet-${vet._id}`}
      onClick={() => onSelect(vet)}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-200 hover:scale-[1.01] group
        ${isSelected
          ? 'bg-primary-500/15 border-primary-500/50 shadow-warm-sm'
          : 'bg-primary-50 border-[#E8E2D9] hover:bg-white/[0.08] hover:border-warm-md'
        }`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl [#EEEAE4] flex items-center justify-center text-2xl
          border border-[#E8E2D9] flex-shrink-0 group-hover:scale-105 transition-transform">
          {vet.avatar ? (
            <img src={vet.avatar} alt={vet.name} className="w-full h-full object-cover rounded-xl" />
          ) : '🩺'}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-strong font-bold text-sm">{vet.name?.startsWith('Dr.') ? vet.name : `Dr. ${vet.name}`}</p>
              {vet.specialization && (
                <p className="text-primary-700 text-xs mt-0.5">{vet.specialization}</p>
              )}
            </div>
            {isSelected && (
              <span className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-white text-xs flex-shrink-0">
                ✓
              </span>
            )}
          </div>

          {vet.clinicName && (
            <p className="text-muted text-xs mt-1.5 flex items-center gap-1">
              🏥 {vet.clinicName}
            </p>
          )}
          {vet.address?.city && (
            <p className="text-subtle text-xs flex items-center gap-1">
              📍 {vet.address.city}
              {vet.address?.state && `, ${vet.address.state}`}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {vet.experience && (
              <span className="text-xs text-muted bg-primary-50 px-2 py-0.5 rounded-md">
                {vet.experience} yrs exp
              </span>
            )}
            {vet.phone && (
              <span className="text-xs text-muted">📞 {vet.phone}</span>
            )}
          </div>

          {/* Available days strip */}
          {days && (
            <p className="text-xs text-primary-600/80 mt-2">📅 {days}</p>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function VetSkeleton() {
  return (
    <div className="flex gap-3 p-4 rounded-2xl bg-primary-50 border border-[#E8E2D9] animate-pulse">
      <div className="w-12 h-12 rounded-xl bg-white/10 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-32 bg-white/10 rounded" />
        <div className="h-3 w-24 bg-primary-50 rounded" />
        <div className="h-3 w-40 bg-primary-50 rounded" />
      </div>
    </div>
  );
}

// ── Main VetSearchPanel ───────────────────────────────────────────────────────
export default function VetSearchPanel({ selectedVet, onSelectVet }) {
  const [query,     setQuery]   = useState('');
  const [city,      setCity]    = useState('');
  const [vets,      setVets]    = useState([]);
  const [loading,   setLoading] = useState(false);
  const [searched,  setSearched]= useState(false);
  const debounceRef = useRef(null);

  const search = useCallback(async (q, c) => {
    setLoading(true);
    setSearched(true);
    try {
      const params = {};
      if (q.trim()) params.search = q.trim();
      if (c.trim()) params.city   = c.trim();
      const { data } = await AppointmentService.searchVets({ ...params, limit: 12 });
      setVets(data.data);
    } catch {
      setVets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search on mount to show all vets
  useEffect(() => { search('', ''); }, [search]);

  // Debounced search on query/city change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(query, city), 400);
    return () => clearTimeout(debounceRef.current);
  }, [query, city, search]);

  return (
    <div>
      {/* Search controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, specialization, condition…"
            id="vet-search-input"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8E2D9] rounded-xl text-body
              placeholder-[#8A8279] text-sm focus:outline-none focus:border-primary-500
              focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
        <div className="relative sm:w-44">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none">📍</span>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City"
            id="vet-city-filter"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E8E2D9] rounded-xl text-body
              placeholder-[#8A8279] text-sm focus:outline-none focus:border-primary-500
              focus:ring-2 focus:ring-primary-500/20 transition-all"
          />
        </div>
      </div>

      {/* Selected vet banner */}
      {selectedVet && (
        <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-primary-50 border border-primary-200">
          <span className="text-xl">✅</span>
          <div className="flex-1 min-w-0">
            <p className="text-strong text-sm font-semibold">{selectedVet.name?.startsWith('Dr.') ? selectedVet.name : `Dr. ${selectedVet.name}`}</p>
            {selectedVet.specialization && (
              <p className="text-primary-700 text-xs">{selectedVet.specialization}</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => onSelectVet(null)}
            className="text-xs text-muted hover:text-[#8C4238] transition-colors"
          >
            Change
          </button>
        </div>
      )}

      {/* Results */}
      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto pr-1 scrollbar-thin">
        {loading && [...Array(3)].map((_, i) => <VetSkeleton key={i} />)}

        {!loading && searched && vets.length === 0 && (
          <div className="text-center py-10 text-muted text-sm">
            <p className="text-3xl mb-3">🩺</p>
            <p>No veterinarians found.</p>
            <p className="text-xs mt-1 text-subtle">Try a different search or clear the city filter.</p>
          </div>
        )}

        {!loading && vets.map((vet) => (
          <VetCard
            key={vet._id}
            vet={vet}
            isSelected={selectedVet?._id === vet._id}
            onSelect={onSelectVet}
          />
        ))}
      </div>

      <p className="text-xs text-gray-700 mt-3">
        {!loading && vets.length > 0 && `Showing ${vets.length} veterinarian${vets.length > 1 ? 's' : ''}`}
      </p>
    </div>
  );
}
