import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import AdoptionService from '../../api/adoptionService.js';
import Modal from '../../components/ui/Modal.jsx';

const SPECIES_EMOJI = { dog: '🐕', cat: '🐱', bird: '🦜', rabbit: '🐰', reptile: '🦎', fish: '🐠', other: '🐾' };

export default function ShelterInterestsPage() {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedInterest, setSelectedInterest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInterests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdoptionService.getShelterInterests();
      setInterests(res.data.data || []);
    } catch {
      setInterests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterests();
  }, [fetchInterests]);

  const handleStatusChange = async (id, status) => {
    setActionLoading(true);
    try {
      await AdoptionService.updateInterest(id, { status });
      await fetchInterests();
      setSelectedInterest(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0, contacted: 0, all: interests.length };
    interests.forEach((i) => {
      if (c[i.status] !== undefined) c[i.status]++;
    });
    return c;
  }, [interests]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return interests.filter((i) => {
      const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
      const pet = i.listing || i.pet;
      const applicant = i.applicant || i.user;
      const petName = (pet?.petName || pet?.name || '').toLowerCase();
      const applicantName = (applicant?.name || '').toLowerCase();
      const applicantEmail = (applicant?.email || '').toLowerCase();
      const matchesSearch = !q || petName.includes(q) || applicantName.includes(q) || applicantEmail.includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [interests, statusFilter, search]);

  return (
    <DashboardLayout pageTitle="Adoption Requests 📬">
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-muted text-sm font-medium">Adoption Inquiries</p>
            <h1 className="text-3xl font-heading font-semibold text-strong">
              Adoption <span className="heading-gradient">Requests</span>
            </h1>
            <p className="text-muted text-sm mt-0.5">
              Review and screen applicants seeking to adopt animals from your shelter
            </p>
          </div>
          {counts.pending > 0 && (
            <div className="bg-[#F5EDD9] text-[#7A5E2A] border border-[#E3D0A8] rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto">
              <span>📬</span> {counts.pending} pending application{counts.pending === 1 ? '' : 's'} awaiting review
            </div>
          )}
        </div>

        {/* Filter bar */}
        <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search applicant or pet name…"
              className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E2D9] rounded-xl text-sm text-body placeholder-[#8A8279] focus:outline-none focus:border-primary-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {[
              { key: 'all', label: 'All Requests', count: counts.all },
              { key: 'pending', label: 'Pending', count: counts.pending },
              { key: 'contacted', label: 'Contacted', count: counts.contacted },
              { key: 'approved', label: 'Approved', count: counts.approved },
              { key: 'rejected', label: 'Declined', count: counts.rejected },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === key
                    ? 'bg-white border border-primary-300 text-primary-900 font-semibold shadow-sm'
                    : 'text-muted hover:text-body hover:bg-white/60'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    statusFilter === key ? 'bg-primary-100 text-primary-800' : 'bg-[#E8E2D9] text-muted'
                  }`}
                >
                  {count}
                </span>
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
            <span className="text-4xl block mb-3">📬</span>
            <h3 className="text-lg font-heading font-semibold text-strong mb-1">
              No adoption applications in this view
            </h3>
            <p className="text-muted text-sm max-w-md mx-auto">
              When prospective pet parents submit an adoption interest from your listings, their profile and questionnaire will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => {
              const pet = item.listing || item.pet;
              const applicant = item.applicant || item.user;
              return (
                <div
                  key={item._id}
                  className="glass-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:shadow-md transition-shadow"
                >
                  {/* Left: Pet & Applicant Info */}
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-2xl bg-primary-100 border border-[#E8E2D9] overflow-hidden flex-shrink-0 flex items-center justify-center text-3xl">
                      {pet?.images?.[0] ? (
                        <img src={pet.images[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span>{SPECIES_EMOJI[pet?.species] || '🐾'}</span>
                      )}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-heading font-bold text-strong text-base">
                          {applicant?.name || 'Applicant'}
                        </span>
                        <span className="text-xs text-muted">wishes to adopt</span>
                        <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-primary-100 text-primary-800 border border-primary-200">
                          🐾 {pet?.petName || pet?.name || 'Pet'}
                        </span>
                        <span
                          className={`text-[11px] px-2 py-0.5 rounded-full font-semibold capitalize border ${
                            item.status === 'approved'
                              ? 'bg-primary-50 text-primary-800 border-primary-300'
                              : item.status === 'pending'
                              ? 'bg-[#F5EDD9] text-[#7A5E2A] border-[#E3D0A8]'
                              : item.status === 'contacted'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="text-xs text-muted">
                        Email: <span className="text-body font-mono">{applicant?.email}</span>
                        {applicant?.phone && <span> · Phone: <span className="text-body font-mono">{applicant.phone}</span></span>}
                      </p>

                      {item.message && (
                        <p className="text-xs text-body bg-primary-50/50 p-2.5 rounded-xl border border-[#E8E2D9] italic max-w-2xl">
                          "{item.message}"
                        </p>
                      )}

                      <p className="text-[11px] text-muted">
                        Submitted on {new Date(item.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                    <button
                      onClick={() => setSelectedInterest(item)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold border border-[#D9D4CC] text-body hover:bg-white transition-all"
                    >
                      View Details
                    </button>

                    {item.status === 'pending' && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'approved')}
                        disabled={actionLoading}
                        className="btn-primary text-xs py-2 px-3 shadow-xs"
                      >
                        ✓ Approve
                      </button>
                    )}

                    {item.status !== 'rejected' && item.status !== 'approved' && (
                      <button
                        onClick={() => handleStatusChange(item._id, 'rejected')}
                        disabled={actionLoading}
                        className="px-3 py-2 rounded-xl text-xs font-semibold border border-red-200 text-[#8C4238] hover:bg-[#F4EBE8] transition-all"
                      >
                        Decline
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal: Full Application Details */}
        <Modal
          isOpen={!!selectedInterest}
          onClose={() => setSelectedInterest(null)}
          title={`Adoption Request: ${selectedInterest?.listing?.petName || selectedInterest?.pet?.petName || selectedInterest?.pet?.name || 'Pet'}`}
        >
          {selectedInterest && (() => {
            const pet = selectedInterest.listing || selectedInterest.pet;
            const applicant = selectedInterest.applicant || selectedInterest.user;
            return (
              <div className="space-y-4">
                {/* Pet Info */}
                <div className="p-3 bg-primary-50 rounded-xl border border-primary-200 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-white border border-[#E8E2D9] overflow-hidden flex-shrink-0 flex items-center justify-center text-2xl">
                    {pet?.images?.[0] ? (
                      <img src={pet.images[0]} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{SPECIES_EMOJI[pet?.species] || '🐾'}</span>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-strong">
                      {pet?.petName || pet?.name || 'Pet'}
                    </h4>
                    <p className="text-xs text-muted">
                      {pet?.species} · {pet?.breed || 'Breed unlisted'} · Status: {pet?.status || 'available'}
                    </p>
                  </div>
                </div>

                {/* Applicant Info */}
                <div className="p-3 bg-white rounded-xl border border-[#E8E2D9] text-xs space-y-1.5">
                  <h5 className="font-semibold text-strong uppercase tracking-wider text-[11px] mb-2">
                    Applicant Profile
                  </h5>
                  <p><span className="text-muted font-medium">Name:</span> <strong className="text-strong">{applicant?.name || 'Applicant'}</strong></p>
                  <p><span className="text-muted font-medium">Email:</span> <span className="font-mono text-body">{applicant?.email || '—'}</span></p>
                  {applicant?.phone && (
                    <p><span className="text-muted font-medium">Phone:</span> <span className="font-mono text-body">{applicant.phone}</span></p>
                  )}
                  {applicant?.address && (
                    <p>
                      <span className="text-muted font-medium">Location:</span>{' '}
                      {[applicant.address.street, applicant.address.city, applicant.address.state]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  )}
                  {selectedInterest.livingSpace && (
                    <p><span className="text-muted font-medium">Living Space:</span> <span className="capitalize text-body">{selectedInterest.livingSpace}</span></p>
                  )}
                  {selectedInterest.hasPets != null && (
                    <p><span className="text-muted font-medium">Currently Has Pets:</span> <span className="text-body">{selectedInterest.hasPets ? 'Yes' : 'No'}</span></p>
                  )}
                  {selectedInterest.hasChildren != null && (
                    <p><span className="text-muted font-medium">Has Children:</span> <span className="text-body">{selectedInterest.hasChildren ? 'Yes' : 'No'}</span></p>
                  )}
                </div>

              {/* Message */}
              {selectedInterest.message && (
                <div className="p-3 bg-white rounded-xl border border-[#E8E2D9] text-xs space-y-1">
                  <h5 className="font-semibold text-strong uppercase tracking-wider text-[11px]">
                    Applicant's Message & Experience
                  </h5>
                  <p className="text-body whitespace-pre-wrap">{selectedInterest.message}</p>
                </div>
              )}

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#E8E2D9]">
                <button
                  onClick={() => handleStatusChange(selectedInterest._id, 'contacted')}
                  disabled={actionLoading}
                  className="py-2 px-2 rounded-xl text-xs font-semibold border border-[#D9D4CC] text-body hover:bg-white text-center"
                >
                  📞 Mark Contacted
                </button>
                <button
                  onClick={() => handleStatusChange(selectedInterest._id, 'rejected')}
                  disabled={actionLoading}
                  className="py-2 px-2 rounded-xl text-xs font-semibold border border-red-200 text-[#8C4238] hover:bg-[#F4EBE8] text-center"
                >
                  ❌ Decline
                </button>
                <button
                  onClick={() => handleStatusChange(selectedInterest._id, 'approved')}
                  disabled={actionLoading}
                  className="btn-primary text-xs py-2 px-2 text-center justify-center"
                >
                  ✓ Approve Adoption
                </button>
              </div>
            </div>
            );
          })()}
        </Modal>

      </div>
    </DashboardLayout>
  );
}
