import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import usePets from '../../hooks/usePets.js';
import useHealthRecords from '../../hooks/useHealthRecords.js';

import Modal from '../../components/ui/Modal.jsx';
import { PetTab } from '../../components/pets/PetCard.jsx';
import HealthTimeline from '../../components/health/HealthTimeline.jsx';
import HealthRecordDetail from '../../components/health/HealthRecordDetail.jsx';
import HealthRecordForm from '../../components/health/HealthRecordForm.jsx';
import VaccinationReminders from '../../components/health/VaccinationReminders.jsx';
import DeleteConfirm from '../../components/pets/DeleteConfirm.jsx';
import { VISIT_TYPES } from '../../components/health/healthConfig.js';

// ── Filter bar ────────────────────────────────────────────────────────────────
function FilterBar({ active, onChange, counts }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
      {/* All */}
      <button
        onClick={() => onChange('')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
          transition-all whitespace-nowrap flex-shrink-0
          ${!active
            ? 'bg-white border-primary-300 text-primary-900 font-semibold shadow-sm'
            : 'bg-primary-50 border-[#E8E2D9] text-muted hover:border-warm-md hover:text-body'
          }`}>
        All
        {counts.all > 0 && <span className="bg-primary-100 text-primary-800 px-1.5 py-0.5 rounded-full text-[11px] font-semibold">{counts.all}</span>}
      </button>

      {VISIT_TYPES.map((t) => {
        const count = counts[t.value] ?? 0;
        if (count === 0) return null;
        return (
          <button key={t.value}
            onClick={() => onChange(t.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
              transition-all whitespace-nowrap flex-shrink-0
              ${active === t.value
                ? `${t.bg} ${t.border} ${t.text}`
                : 'bg-primary-50 border-[#E8E2D9] text-muted hover:border-warm-md hover:text-body'
              }`}>
            {t.emoji} {t.label}
            <span className={`px-1.5 py-0.5 rounded-full ${active === t.value ? 'bg-white/10' : 'bg-primary-50'}`}>
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ── Stats strip ───────────────────────────────────────────────────────────────
function StatsStrip({ records }) {
  const totalVaccines  = records.flatMap(r => r.vaccinations ?? []).length;
  const totalRx        = records.flatMap(r => r.prescriptions ?? []).length;
  const lastVisit      = records[0]?.visitDate
    ? new Date(records[0].visitDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: '📋', label: 'Total Records',  value: records.length },
        { icon: '💉', label: 'Vaccines Logged', value: totalVaccines },
        { icon: '💊', label: 'Prescriptions',  value: totalRx },
      ].map((s) => (
        <div key={s.label} className="glass-card p-4 text-center">
          <span className="text-2xl">{s.icon}</span>
          <p className="text-2xl font-semibold gradient-text mt-1">{s.value}</p>
          <p className="text-xs text-muted mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── No pet selected placeholder ───────────────────────────────────────────────
function NoPetSelected() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="text-7xl opacity-30 mb-5">🐾</div>
      <p className="text-muted text-sm">Select a pet above to view their health records.</p>
      <Link to="/dashboard/pets" className="btn-outline text-sm mt-4">
        ← Go to My Pets
      </Link>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HealthRecordsPage() {
  const { user, logout } = useAuth();

  // Pet tabs (reuse usePets hook for the tab strip)
  const {
    pets, loading: petsLoading,
    activePet, activePetId, setActivePetId,
  } = usePets();

  // Health records for the active pet
  const {
    records, loading: recLoading, error: recError,
    activeRecord, setActiveRecord,
    fetchRecords, createRecord, updateRecord, deleteRecord,
    recordsByYear, sortedYears, upcomingVaccinations,
  } = useHealthRecords(activePetId);

  // ── UI state ──────────────────────────────────────────────────────────────
  const [filterType,    setFilter]   = useState('');
  const [showAddModal,  setShowAdd]  = useState(false);
  const [showEditModal, setShowEdit] = useState(false);
  const [showDelModal,  setShowDel]  = useState(false);
  const [showDetailModal, setShowDetail] = useState(false);
  const [formLoading,  setFormLoad]  = useState(false);
  const [formError,    setFormError] = useState(null);

  // ── Record counts per type (for filter bar) ───────────────────────────────
  const counts = { all: records.length };
  records.forEach((r) => { counts[r.visitType] = (counts[r.visitType] ?? 0) + 1; });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const openAdd = () => { setFormError(null); setShowAdd(true); };

  const openDetail = (record) => {
    setActiveRecord(record);
    setShowDetail(true);
  };

  const openEdit = () => { setFormError(null); setShowEdit(true); setShowDetail(false); };

  const openDeleteConfirm = () => { setShowDetail(false); setShowDel(true); };

  const handleCreate = async (payload) => {
    setFormLoad(true); setFormError(null);
    try {
      await createRecord(payload);
      setShowAdd(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save record.');
    } finally { setFormLoad(false); }
  };

  const handleUpdate = async (payload) => {
    setFormLoad(true); setFormError(null);
    try {
      await updateRecord(activeRecord._id, payload);
      setShowEdit(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to update record.');
    } finally { setFormLoad(false); }
  };

  const handleDelete = async () => {
    setFormLoad(true);
    try {
      await deleteRecord(activeRecord._id);
      setShowDel(false);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to delete record.');
    } finally { setFormLoad(false); }
  };

  return (
    <DashboardLayout pageTitle="Health Records 📋">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-strong">Health Records</h1>
            <p className="text-muted text-sm mt-1">
              {activePet ? `Viewing records for ${activePet.name}` : 'Select a pet below'}
            </p>
          </div>
          {activePetId && !recLoading && (
            <button id="add-health-record-btn" onClick={openAdd} className="btn-primary text-sm">
              + Add Record
            </button>
          )}
        </div>

        {/* Pet tab strip */}
        {!petsLoading && pets.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-thin border-b border-[#E8E2D9]">
            {pets.map((pet) => (
              <PetTab key={pet._id} pet={pet}
                isActive={pet._id === activePetId}
                onClick={() => { setActivePetId(pet._id); setActiveRecord(null); }} />
            ))}
          </div>
        )}

        {/* No pet */}
        {!petsLoading && pets.length === 0 && <NoPetSelected />}

        {/* Main two-column layout */}
        {activePetId && (
          <div className="flex flex-col lg:flex-row gap-6">

            {/* ── LEFT: Timeline ── */}
            <div className="flex-1 min-w-0">

              {/* Filter bar */}
              {records.length > 0 && (
                <div className="mb-5">
                  <FilterBar active={filterType} onChange={setFilter} counts={counts} />
                </div>
              )}

              {/* Error */}
              {recError && (
                <div className="mb-4 p-3 rounded-xl bg-[#F4EBE8] border border-[#E0C8C4] text-[#8C4238] text-sm flex items-center justify-between">
                  <span>⚠️ {recError}</span>
                  <button onClick={fetchRecords} className="text-xs underline ml-3">Retry</button>
                </div>
              )}

              <HealthTimeline
                recordsByYear={recordsByYear}
                sortedYears={sortedYears}
                loading={recLoading}
                activeRecord={activeRecord}
                onSelectRecord={openDetail}
                onAdd={openAdd}
                filterType={filterType}
              />
            </div>

            {/* ── RIGHT: Sidebar ── */}
            <aside className="lg:w-72 flex flex-col gap-5 flex-shrink-0">

              {/* Stats */}
              {!recLoading && records.length > 0 && (
                <StatsStrip records={records} />
              )}

              {/* Vaccination reminders */}
              <VaccinationReminders upcoming={upcomingVaccinations} />

              {/* Pet quick info */}
              {activePet && (
                <div className="glass-card p-5">
                  <h3 className="text-sm font-bold text-body mb-3">🐾 Pet Info</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl [#EEEAE4] flex items-center justify-center text-xl border border-[#E8E2D9]">
                      {activePet.images?.[0]
                        ? <img src={activePet.images[0]} alt={activePet.name} className="w-full h-full object-cover rounded-xl" />
                        : { dog:'🐕', cat:'🐱', bird:'🦜', rabbit:'🐰', reptile:'🦎', fish:'🐠' }[activePet.species] ?? '🐾'}
                    </div>
                    <div>
                      <p className="text-strong font-bold">{activePet.name}</p>
                      <p className="text-muted text-xs capitalize">{activePet.species} · {activePet.breed || '—'}</p>
                    </div>
                  </div>
                  {activePet.allergies?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {activePet.allergies.map((a) => (
                        <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-[#F4EBE8] text-[#8C4238] border border-[#E0C8C4] capitalize">
                          ⚠️ {a}
                        </span>
                      ))}
                    </div>
                  )}
                  <Link to="/dashboard/pets" className="btn-outline text-xs w-full justify-center mt-3">
                    Edit Pet Profile
                  </Link>
                </div>
              )}

            </aside>
          </div>
        )}
      </div>

      {/* ── Add Record Modal ── */}
      <Modal isOpen={showAddModal} onClose={() => setShowAdd(false)} title="Add Health Record 📋" size="xl">
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-[#F4EBE8] border border-[#E0C8C4] text-[#8C4238] text-sm">
            ⚠️ {formError}
          </div>
        )}
        <HealthRecordForm onSubmit={handleCreate} onCancel={() => setShowAdd(false)} isLoading={formLoading} />
      </Modal>

      {/* ── Record Detail Modal ── */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetail(false)}
        title="Health Record Details"
        size="lg"
      >
        <HealthRecordDetail
          record={activeRecord}
          onEdit={openEdit}
          onDelete={openDeleteConfirm}
          onClose={() => setShowDetail(false)}
          isDeleting={formLoading}
        />
      </Modal>

      {/* ── Edit Record Modal ── */}
      <Modal isOpen={showEditModal} onClose={() => setShowEdit(false)} title="Edit Health Record ✏️" size="xl">
        {formError && (
          <div className="mb-4 p-3 rounded-xl bg-[#F4EBE8] border border-[#E0C8C4] text-[#8C4238] text-sm">
            ⚠️ {formError}
          </div>
        )}
        <HealthRecordForm
          initialData={activeRecord}
          onSubmit={handleUpdate}
          onCancel={() => setShowEdit(false)}
          isLoading={formLoading}
        />
      </Modal>

      {/* ── Delete Confirm Modal ── */}
      <Modal isOpen={showDelModal} onClose={() => setShowDel(false)} title="Delete Record?" size="sm">
        <DeleteConfirm
          petName={`this ${activeRecord?.visitType ?? 'health'} record`}
          onConfirm={handleDelete}
          onCancel={() => setShowDel(false)}
          isLoading={formLoading}
        />
      </Modal>
    </DashboardLayout>
  );
}
