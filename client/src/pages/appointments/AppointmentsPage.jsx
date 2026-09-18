import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import usePets from '../../hooks/usePets.js';
import useAppointments from '../../hooks/useAppointments.js';
import Modal from '../../components/ui/Modal.jsx';
import AppointmentCard from '../../components/appointments/AppointmentCard.jsx';
import AppointmentDetail from '../../components/appointments/AppointmentDetail.jsx';
import BookingWizard from '../../components/appointments/BookingWizard.jsx';
import DeleteConfirm from '../../components/pets/DeleteConfirm.jsx';

// ── Tab bar ───────────────────────────────────────────────────────────────────
function TabBar({ active, onChange, counts }) {
  const tabs = [
    { key: 'upcoming',  label: 'Upcoming',  emoji: '⏰' },
    { key: 'past',      label: 'Completed', emoji: '✔️' },
    { key: 'cancelled', label: 'Cancelled', emoji: '❌' },
  ];
  return (
    <div className="flex gap-1 p-1 bg-primary-50 rounded-xl border border-[#E8E2D9] w-fit">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          id={`tab-${tab.key}`}
          onClick={() => onChange(tab.key)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
            transition-all duration-200
            ${active === tab.key
              ? 'bg-white border border-primary-300 text-primary-900 font-semibold shadow-sm'
              : 'text-muted hover:text-body hover:bg-white/50'
            }`}
        >
          <span>{tab.emoji}</span>
          <span>{tab.label}</span>
          {counts[tab.key] > 0 && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-bold
              ${active === tab.key ? 'bg-primary-100 text-primary-800' : 'bg-[#EEEAE4] text-muted'}`}>
              {counts[tab.key]}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ApptSkeleton() {
  return (
    <div className="glass-card p-5 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-11 h-11 rounded-xl bg-white/10 flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-28 bg-white/10 rounded" />
          <div className="h-3 w-40 bg-primary-50 rounded" />
        </div>
        <div className="h-6 w-20 rounded-full bg-white/10" />
      </div>
      <div className="h-4 w-64 bg-primary-50 rounded mb-3" />
      <div className="h-8 w-full bg-primary-50 rounded-lg" />
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyTab({ tab, onBook }) {
  const msgs = {
    upcoming:  { emoji: '📅', text: "You have no upcoming appointments.", sub: 'Book one now to get started.' },
    past:      { emoji: '✔️', text: 'No completed appointments yet.',     sub: 'Your past visits will appear here.' },
    cancelled: { emoji: '❌', text: 'No cancelled appointments.',          sub: "That's great!" },
  };
  const m = msgs[tab] ?? msgs.upcoming;
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <p className="text-5xl mb-4 opacity-40">{m.emoji}</p>
      <p className="text-muted text-sm font-medium mb-1">{m.text}</p>
      <p className="text-subtle text-xs mb-6">{m.sub}</p>
      {tab === 'upcoming' && (
        <button onClick={onBook} className="btn-primary text-sm">🩺 Book Appointment</button>
      )}
    </div>
  );
}

// ── Stats bar ─────────────────────────────────────────────────────────────────
function StatsBar({ upcoming, past, cancelled }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {[
        { icon: '⏰', label: 'Upcoming',  value: upcoming.length,  color: 'text-[#7A5E2A]' },
        { icon: '✔️', label: 'Completed', value: past.length,      color: 'text-primary-600'  },
        { icon: '❌', label: 'Cancelled', value: cancelled.length,  color: 'text-[#8C4238]'    },
      ].map((s) => (
        <div key={s.label} className="glass-card p-4 text-center">
          <span className="text-2xl">{s.icon}</span>
          <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
          <p className="text-xs text-muted mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Cancel confirmation dialog ────────────────────────────────────────────────
function CancelConfirm({ appt, onConfirm, onCancel, isLoading }) {
  return (
    <div className="text-center py-2">
      <div className="w-16 h-16 rounded-2xl bg-[#F4EBE8] border border-[#E0C8C4] flex items-center justify-center text-3xl mx-auto mb-5">
        ❌
      </div>
      <h3 className="text-xl font-bold text-body mb-2">Cancel Appointment?</h3>
      <p className="text-muted text-sm mb-1">
        Cancel the appointment for <span className="text-strong font-semibold">{appt?.pet?.name}</span>?
      </p>
      <p className="text-subtle text-xs mb-3">
        with Dr. {appt?.vet?.name} on{' '}
        {appt?.appointmentDate ? new Date(appt.appointmentDate).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : ''}
        {' '}at {appt?.appointmentTime}
      </p>
      <textarea
        id="cancel-reason-input"
        placeholder="Reason for cancellation (optional)"
        rows={2}
        className="w-full mb-4 bg-white border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-body
          placeholder-[#8A8279] text-sm focus:outline-none focus:border-primary-500 resize-none"
        onChange={(e) => {
          // Pass reason up through a data attribute trick
          if (typeof window !== 'undefined') window._cancelReason = e.target.value;
        }}
      />
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={isLoading} className="btn-outline flex-1 justify-center text-sm">Keep</button>
        <button
          onClick={() => onConfirm(typeof window !== 'undefined' ? window._cancelReason : '')}
          disabled={isLoading}
          id="confirm-cancel-appt-btn"
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm
            bg-red-500/20 border border-red-500/50 text-[#8C4238] hover:bg-[#F4EBE8] transition-all
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading
            ? <span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
            : 'Yes, Cancel'
          }
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function AppointmentsPage() {
  const { user, logout } = useAuth();
  const { pets } = usePets();
  const {
    upcoming, past, cancelled,
    loading, error,
    fetchAppointments, bookAppointment, updateStatus,
  } = useAppointments();

  const [activeTab,      setTab]       = useState('upcoming');
  const [showBookModal,  setShowBook]  = useState(false);
  const [showDetailModal,setShowDetail]= useState(false);
  const [showCancelModal,setShowCancel]= useState(false);
  const [selectedAppt,   setSelectedAppt] = useState(null);
  const [cancelling,     setCancelling]= useState(false);

  const tabData = { upcoming, past, cancelled };
  const counts  = { upcoming: upcoming.length, past: past.length, cancelled: cancelled.length };

  const openDetail = (appt) => { setSelectedAppt(appt); setShowDetail(true); };
  const openCancel = (appt) => { setSelectedAppt(appt); setShowDetail(false); setShowCancel(true); };

  const handleBook = async (payload) => {
    const result = await bookAppointment(payload);
    return result; // wizard handles its own success state
  };

  const handleCancel = async (reason) => {
    setCancelling(true);
    try {
      await updateStatus(selectedAppt._id, {
        status: 'cancelled',
        cancellationReason: reason || undefined,
      });
      setShowCancel(false);
      setSelectedAppt(null);
    } catch {
      // keep modal open on error
    } finally {
      setCancelling(false);
    }
  };

  const currentList = tabData[activeTab] ?? [];

  return (
    <DashboardLayout pageTitle="Appointments 🩺">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-semibold text-strong">Appointments</h1>
            <p className="text-muted text-sm mt-1">Manage your pet care visits</p>
          </div>
          <button
            id="book-appointment-btn"
            onClick={() => setShowBook(true)}
            className="btn-primary text-sm"
            disabled={pets.length === 0}
          >
            🩺 Book Appointment
          </button>
        </div>

        {/* No pets warning */}
        {pets.length === 0 && !loading && (
          <div className="glass-card p-6 text-center mb-8">
            <p className="text-muted text-sm mb-3">
              You need to add a pet before booking an appointment.
            </p>
            <Link to="/dashboard/pets" className="btn-primary text-sm">
              🐾 Add a Pet First
            </Link>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-[#F4EBE8] border border-[#E0C8C4] text-[#8C4238] text-sm flex items-center justify-between">
            <span>⚠️ {error}</span>
            <button onClick={fetchAppointments} className="text-xs underline">Retry</button>
          </div>
        )}

        {/* Stats */}
        {!loading && <StatsBar upcoming={upcoming} past={past} cancelled={cancelled} />}

        {/* Tab bar */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <TabBar active={activeTab} onChange={setTab} counts={counts} />
          <button
            onClick={fetchAppointments}
            className="text-xs text-subtle hover:text-body transition-colors border border-[#E8E2D9] px-3 py-1.5 rounded-lg hover:border-warm-md"
          >
            ↻ Refresh
          </button>
        </div>

        {/* Appointment list */}
        <div className="flex flex-col gap-4">
          {loading && [...Array(3)].map((_, i) => <ApptSkeleton key={i} />)}

          {!loading && currentList.length === 0 && (
            <EmptyTab tab={activeTab} onBook={() => setShowBook(true)} />
          )}

          {!loading && currentList.map((appt) => (
            <AppointmentCard
              key={appt._id}
              appt={appt}
              onCancel={openCancel}
              onViewDetail={openDetail}
              isCancelling={cancelling && selectedAppt?._id === appt._id}
            />
          ))}
        </div>
      </div>

      {/* ── Book Modal ── */}
      <Modal
        isOpen={showBookModal}
        onClose={() => setShowBook(false)}
        title="Book an Appointment 🩺"
        size="lg"
      >
        <BookingWizard
          pets={pets}
          onBook={handleBook}
          onClose={() => setShowBook(false)}
        />
      </Modal>

      {/* ── Detail Modal ── */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetail(false)}
        title="Appointment Details"
        size="md"
      >
        <AppointmentDetail
          appt={selectedAppt}
          onCancel={openCancel}
          isCancelling={cancelling}
        />
      </Modal>

      {/* ── Cancel Confirm Modal ── */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancel(false)}
        title="Cancel Appointment"
        size="sm"
      >
        <CancelConfirm
          appt={selectedAppt}
          onConfirm={handleCancel}
          onCancel={() => setShowCancel(false)}
          isLoading={cancelling}
        />
      </Modal>
    </DashboardLayout>
  );
}
