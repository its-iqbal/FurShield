import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import AdoptionService from '../../api/adoptionService.js';

const SPECIES_EMOJI = { dog: '🐕', cat: '🐱', bird: '🦜', rabbit: '🐰', reptile: '🦎', fish: '🐠', other: '🐾' };

export default function ShelterDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [listRes, intRes] = await Promise.all([
        AdoptionService.getListings({ limit: 50 }),
        AdoptionService.getShelterInterests(),
      ]);
      setListings(listRes.data.data || []);
      setInterests(intRes.data.data || []);
    } catch {
      setListings([]);
      setInterests([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Derived metrics
  const availableListings = useMemo(() => listings.filter((l) => l.status === 'available'), [listings]);
  const adoptedListings = useMemo(() => listings.filter((l) => l.status === 'adopted'), [listings]);
  const pendingInterests = useMemo(() => interests.filter((i) => i.status === 'pending'), [interests]);

  return (
    <DashboardLayout pageTitle="Shelter Dashboard 🏠">
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-7">

        {/* ── Shelter Welcome Banner ── */}
        <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 font-semibold border border-primary-300">
                🏡 Verified Animal Rescue
              </span>
              {user?.shelterLicense && (
                <span className="text-xs text-muted">· Reg #{user.shelterLicense}</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-semibold text-strong">
              Welcome back, <span className="heading-gradient">{user?.shelterName || user?.name}</span>
            </h1>
            <p className="text-muted text-sm max-w-xl">
              Manage rescue profiles, evaluate adoption inquiries, and help animals find their forever families.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 z-10">
            <button
              onClick={() => navigate('/shelter/listings')}
              className="btn-primary text-xs sm:text-sm py-2.5 px-4 shadow-sm"
            >
              🐕 Manage Listings
            </button>
            <button
              onClick={() => navigate('/shelter/interests')}
              className="btn-outline text-xs sm:text-sm py-2.5 px-4"
            >
              📬 Adoption Inquiries ({pendingInterests.length})
            </button>
          </div>

          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-primary-500/5 rounded-full pointer-events-none" />
        </div>

        {/* ── Key Shelter Metrics ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: 'Total Listings',
              val: listings.length,
              icon: '🐕',
              desc: 'Rescues on file',
              color: 'text-primary-800',
              bg: 'bg-primary-50',
              onClick: () => navigate('/shelter/listings'),
            },
            {
              label: 'Available Now',
              val: availableListings.length,
              icon: '✅',
              desc: 'Ready for adoption',
              color: 'text-primary-600',
              bg: 'bg-white',
              onClick: () => navigate('/shelter/listings'),
            },
            {
              label: 'Pending Inquiries',
              val: pendingInterests.length,
              icon: '📬',
              desc: 'Awaiting shelter review',
              color: 'text-[#7A5E2A]',
              bg: 'bg-[#FDF8EE]',
              badge: pendingInterests.length > 0 ? 'Action Needed' : null,
              onClick: () => navigate('/shelter/interests'),
            },
            {
              label: 'Forever Homes',
              val: adoptedListings.length,
              icon: '🏡',
              desc: 'Successfully adopted',
              color: 'text-info-600',
              bg: 'bg-white',
              onClick: () => navigate('/shelter/listings'),
            },
          ].map((card) => (
            <div
              key={card.label}
              onClick={card.onClick}
              className={`glass-card p-5 cursor-pointer hover:-translate-y-0.5 transition-all flex flex-col justify-between ${card.bg}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-2xl">{card.icon}</span>
                {card.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F5EDD9] text-[#7A5E2A] font-bold uppercase tracking-wider">
                    {card.badge}
                  </span>
                )}
              </div>
              <div className="mt-3">
                <p className={`text-3xl font-black ${card.color}`}>{card.val}</p>
                <p className="text-xs font-semibold text-strong mt-0.5">{card.label}</p>
                <p className="text-[11px] text-muted">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Two Column Layout: Recent Applications & Available Spotlight ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2 Cols: Inquiries Queue */}
          <div className="lg:col-span-2 space-y-6">

            {/* Applications Queue */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-heading font-semibold text-strong flex items-center gap-2">
                    <span>📬</span> Recent Adoption Inquiries
                  </h3>
                  <p className="text-xs text-muted">Prospective adopters waiting for your shelter's response</p>
                </div>
                <Link
                  to="/shelter/interests"
                  className="text-xs text-primary-700 hover:text-primary-900 font-semibold"
                >
                  View All Requests ({interests.length}) →
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                </div>
              ) : interests.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-[#E8E2D9]">
                  <span className="text-3xl block mb-2">🎉</span>
                  <p className="text-sm font-semibold text-strong">No adoption applications pending</p>
                  <p className="text-xs text-muted mt-0.5">
                    Your queue is clear. New inquiries from pet adopters will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {interests.slice(0, 4).map((item) => {
                    const pet = item.listing || item.pet;
                    const applicant = item.applicant || item.user;
                    return (
                      <div
                        key={item._id}
                        onClick={() => navigate('/shelter/interests')}
                        className="p-3.5 bg-white rounded-xl border border-[#E8E2D9] flex items-center justify-between gap-4 hover:border-primary-400 cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center text-xl overflow-hidden flex-shrink-0 border border-[#E8E2D9]">
                            {pet?.images?.[0] ? (
                              <img src={pet.images[0]} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span>{SPECIES_EMOJI[pet?.species] || '🐾'}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-strong truncate">
                              {applicant?.name || 'Applicant'} interested in{' '}
                              <span className="text-primary-800 font-bold">{pet?.petName || pet?.name || 'Pet'}</span>
                            </p>
                            <p className="text-[11px] text-muted truncate mt-0.5">
                              {applicant?.email} {applicant?.phone ? `· ${applicant.phone}` : ''}
                            </p>
                          </div>
                        </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize border ${
                            item.status === 'approved'
                              ? 'bg-primary-50 text-primary-800 border-primary-300'
                              : item.status === 'pending'
                              ? 'bg-[#F5EDD9] text-[#7A5E2A] border-[#E3D0A8]'
                              : 'bg-gray-50 text-muted border-gray-200'
                          }`}
                        >
                          {item.status}
                        </span>
                        <span className="text-xs text-muted">→</span>
                      </div>
                    </div>
                  );
                })}
                </div>
              )}
            </div>

            {/* Available Animals Spotlight */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-heading font-semibold text-strong flex items-center gap-2">
                  <span>🐕</span> Featured Available Rescues
                </h3>
                <Link to="/shelter/listings" className="text-xs text-primary-700 hover:text-primary-900 font-semibold">
                  All Listings ({listings.length}) →
                </Link>
              </div>

              {availableListings.length === 0 ? (
                <p className="text-xs text-muted italic bg-white p-4 rounded-xl border border-[#E8E2D9] text-center">
                  No animals currently marked as available.
                </p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {availableListings.slice(0, 3).map((pet) => (
                    <div
                      key={pet._id}
                      onClick={() => navigate('/shelter/listings')}
                      className="bg-white rounded-xl border border-[#E8E2D9] overflow-hidden hover:shadow-xs cursor-pointer transition-shadow"
                    >
                      <div className="h-28 bg-primary-100 flex items-center justify-center overflow-hidden">
                        {pet.images?.[0] ? (
                          <img src={pet.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-3xl">{SPECIES_EMOJI[pet.species] || '🐾'}</span>
                        )}
                      </div>
                      <div className="p-2.5 text-center">
                        <p className="font-bold text-xs text-strong truncate">{pet.petName || pet.name}</p>
                        <p className="text-[11px] text-muted truncate">
                          {pet.breed || pet.species} {pet.age ? `· ${pet.age}y` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right 1 Col: Quick Shelter Shortcuts & Practice Info */}
          <div className="space-y-6">

            {/* Quick Practice Actions */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="text-sm font-heading font-semibold text-strong">⚡ Shelter Shortcuts</h3>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => navigate('/shelter/listings')}
                  className="w-full text-left p-2.5 rounded-xl bg-white border border-[#E8E2D9] hover:bg-primary-50 transition-colors flex items-center justify-between font-medium text-body"
                >
                  <span>🐕 + Add New Rescue Listing</span>
                  <span className="text-muted">→</span>
                </button>
                <button
                  onClick={() => navigate('/shelter/interests')}
                  className="w-full text-left p-2.5 rounded-xl bg-white border border-[#E8E2D9] hover:bg-primary-50 transition-colors flex items-center justify-between font-medium text-body"
                >
                  <span>📬 Review Pending Inquiries</span>
                  <span className="text-muted">→</span>
                </button>
                <button
                  onClick={() => navigate('/adopt')}
                  className="w-full text-left p-2.5 rounded-xl bg-white border border-[#E8E2D9] hover:bg-primary-50 transition-colors flex items-center justify-between font-medium text-body"
                >
                  <span>🏠 View Public Adoption Feed</span>
                  <span className="text-muted">→</span>
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full text-left p-2.5 rounded-xl bg-white border border-[#E8E2D9] hover:bg-primary-50 transition-colors flex items-center justify-between font-medium text-body"
                >
                  <span>⚙️ Shelter Profile & License</span>
                  <span className="text-muted">→</span>
                </button>
              </div>
            </div>

            {/* Shelter Notice Card */}
            <div className="glass-card p-5 bg-primary-50/70 border border-primary-200">
              <span className="text-2xl block mb-2">💡</span>
              <h4 className="text-xs font-bold text-primary-900 mb-1">Adopter Verification Tips</h4>
              <p className="text-[11px] text-muted leading-relaxed">
                Always review the applicant's experience, verify if they rent or own their residence, and contact them via phone before approving final adoption releases.
              </p>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
