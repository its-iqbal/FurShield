import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import usePets from '../../hooks/usePets.js';
import Modal from '../../components/ui/Modal.jsx';
import PetForm from '../../components/pets/PetForm.jsx';
import DeleteConfirm from '../../components/pets/DeleteConfirm.jsx';
import { PetTab, PetDetailCard } from '../../components/pets/PetCard.jsx';

function EmptyPets({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center px-4 animate-fade-in">
      <div className="text-8xl mb-6 opacity-50">🐾</div>
      <h2 className="text-2xl font-black text-body mb-2">No pets yet</h2>
      <p className="text-muted mb-8 max-w-sm">
        Add your first furry (or not-so-furry) friend to start tracking their health, appointments, and more.
      </p>
      <button
        id="add-first-pet-btn"
        onClick={onAdd}
        className="btn-primary"
      >
        🐾 Add My First Pet
      </button>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 rounded-2xl bg-white/10" />
        <div className="flex-1">
          <div className="h-7 bg-white/10 rounded-lg w-32 mb-2" />
          <div className="h-4 bg-primary-50 rounded w-24" />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-14 bg-primary-50 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

function ErrorBanner({ message, onRetry }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-[#F4EBE8] border border-[#E0C8C4] text-[#8C4238] text-sm mx-6 mt-4">
      <span>⚠️ {message}</span>
      <button onClick={onRetry} className="text-xs underline ml-4 hover:no-underline">
        Retry
      </button>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MyPetsPage() {
  const { user, logout } = useAuth();
  const {
    pets, loading, error,
    activePet, activePetId, setActivePetId,
    fetchPets, addPet, updatePet, deletePet,
  } = usePets();

  // ── Modal state ──────────────────────────────────────────────────────────────
  const [showAddModal,    setShowAdd]    = useState(false);
  const [showEditModal,   setShowEdit]   = useState(false);
  const [showDeleteModal, setShowDelete] = useState(false);
  const [formLoading,     setFormLoad]   = useState(false);
  const [formError,       setFormError]  = useState(null);

  // ── Handlers ─────────────────────────────────────────────────────────────────

  const handleAdd = async (payload) => {
    setFormLoad(true);
    setFormError(null);
    try {
      await addPet(payload);
      setShowAdd(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add pet. Please try again.');
    } finally {
      setFormLoad(false);
    }
  };

  const handleEdit = async (payload) => {
    setFormLoad(true);
    setFormError(null);
    try {
      await updatePet(activePetId, payload);
      setShowEdit(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update pet. Please try again.');
    } finally {
      setFormLoad(false);
    }
  };

  const handleDelete = async () => {
    setFormLoad(true);
    try {
      await deletePet(activePetId);
      setShowDelete(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to remove pet.');
    } finally {
      setFormLoad(false);
    }
  };

  const openAdd = () => { setFormError(null); setShowAdd(true); };
  const openEdit = () => { setFormError(null); setShowEdit(true); };

  return (
    <DashboardLayout pageTitle="My Pets 🐾">
      {/* ── Error banner ── */}
      {error && <ErrorBanner message={error} onRetry={fetchPets} />}

      {/* ── Page content ── */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-strong">My Pets</h1>
            <p className="text-muted text-sm mt-1">
              {loading ? 'Loading…'
                : pets.length === 0 ? 'No pets added yet'
                : `${pets.length} pet${pets.length > 1 ? 's' : ''} registered`
              }
            </p>
          </div>
          {!loading && (
            <button
              id="add-pet-btn"
              onClick={openAdd}
              className="btn-primary text-sm"
            >
              + Add Pet
            </button>
          )}
        </div>

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-11 w-28 rounded-xl bg-primary-50 animate-pulse flex-shrink-0" />
              ))}
            </div>
            <SkeletonCard />
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && pets.length === 0 && <EmptyPets onAdd={openAdd} />}

        {/* ── Pet tabs + detail view ── */}
        {!loading && pets.length > 0 && (
          <div className="space-y-5">

            {/* Horizontal tab strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
              {pets.map((pet) => (
                <PetTab
                  key={pet._id}
                  pet={pet}
                  isActive={pet._id === activePetId}
                  onClick={() => setActivePetId(pet._id)}
                />
              ))}

              {/* Add another pet shortcut */}
              <button
                onClick={openAdd}
                id="add-another-pet-tab"
                className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-warm-md
                  text-sm text-muted hover:text-body hover:border-primary-500/50 hover:bg-primary-500/5
                  transition-all duration-200 whitespace-nowrap flex-shrink-0"
              >
                + Add Pet
              </button>
            </div>

            {/* Active pet detail card */}
            {activePet && (
              <PetDetailCard
                pet={activePet}
                onEdit={openEdit}
                onDelete={() => setShowDelete(true)}
              />
            )}

            {/* Stats strip */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { icon: '📋', label: 'Health Records', value: '—', to: `/dashboard/health-records` },
                { icon: '🩺', label: 'Appointments',   value: '—', to: `/dashboard/appointments`   },
                { icon: '💊', label: 'Medications',    value: '—', to: `/dashboard/pets`            },
              ].map((stat) => (
                <Link
                  key={stat.label}
                  to={stat.to}
                  className="glass-card p-4 text-center hover:scale-[1.02] transition-all duration-200 group"
                >
                  <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-200">
                    {stat.icon}
                  </div>
                  <p className="text-lg font-bold text-strong">{stat.value}</p>
                  <p className="text-xs text-muted">{stat.label}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Add Pet Modal ── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAdd(false)}
        title="Add a New Pet 🐾"
        size="lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-[#F4EBE8] border border-[#E0C8C4] text-[#8C4238] text-sm">
            ⚠️ {formError}
          </div>
        )}
        <PetForm
          onSubmit={handleAdd}
          onCancel={() => setShowAdd(false)}
          isLoading={formLoading}
        />
      </Modal>

      {/* ── Edit Pet Modal ── */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEdit(false)}
        title={`Edit ${activePet?.name ?? 'Pet'} ✏️`}
        size="lg"
      >
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-[#F4EBE8] border border-[#E0C8C4] text-[#8C4238] text-sm">
            ⚠️ {formError}
          </div>
        )}
        <PetForm
          initialData={activePet}
          onSubmit={handleEdit}
          onCancel={() => setShowEdit(false)}
          isLoading={formLoading}
        />
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDelete(false)}
        title="Confirm Removal"
        size="sm"
      >
        <DeleteConfirm
          petName={activePet?.name}
          onConfirm={handleDelete}
          onCancel={() => setShowDelete(false)}
          isLoading={formLoading}
        />
      </Modal>
    </DashboardLayout>
  );
}
