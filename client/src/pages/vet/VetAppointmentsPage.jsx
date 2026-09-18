import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import AppointmentService from '../../api/appointmentService.js';
import AppointmentStatusBadge from '../../components/appointments/AppointmentStatusBadge.jsx';
import Modal from '../../components/ui/Modal.jsx';

function formatDateTime(dateStr, timeStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return (
    d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) +
    (timeStr ? ` · ${timeStr}` : '')
  );
}

const SPECIES_EMOJI = { dog: '🐕', cat: '🐱', bird: '🦜', rabbit: '🐰', reptile: '🦎', fish: '🐠', other: '🐾' };

export default function VetAppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [dateFilter, setDateFilter] = useState('all'); // all | today | upcoming | past
  const [search, setSearch] = useState('');

  // Manage modal
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [vetNotes, setVetNotes] = useState('');
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [modalView, setModalView] = useState('main'); // main | reschedule

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await AppointmentService.getMine({ role: 'vet', limit: 100 });
      setAppointments(data.data || []);
    } catch {
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Status counts
  const counts = useMemo(() => {
    const c = { pending: 0, confirmed: 0, completed: 0, rescheduled: 0, cancelled: 0, all: appointments.length };
    appointments.forEach((a) => {
      if (c[a.status] !== undefined) c[a.status]++;
    });
    return c;
  }, [appointments]);

  // Filtered appointments
  const filteredAppointments = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const q = search.trim().toLowerCase();

    return appointments.filter((a) => {
      // Tab filter
      const matchesTab = activeTab === 'all' || a.status === activeTab;
      if (!matchesTab) return false;

      // Date filter
      const aDate = a.appointmentDate?.slice(0, 10);
      if (dateFilter === 'today' && aDate !== today) return false;
      if (dateFilter === 'upcoming' && aDate < today) return false;
      if (dateFilter === 'past' && aDate > today) return false;

      // Search
      if (q) {
        const petName = a.pet?.name?.toLowerCase() || '';
        const ownerName = a.owner?.name?.toLowerCase() || '';
        const reason = a.reason?.toLowerCase() || '';
        if (!petName.includes(q) && !ownerName.includes(q) && !reason.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, activeTab, dateFilter, search]);

  const openManageModal = (appt) => {
    setSelectedAppt(appt);
    setVetNotes(appt.vetNotes || '');
    setRescheduleDate('');
    setRescheduleTime('');
    setModalView('main');
  };

  const executeStatusUpdate = async (status, extra = {}) => {
    if (!selectedAppt) return;
    setActionLoading(true);
    try {
      await AppointmentService.updateStatus(selectedAppt._id, {
        status,
        vetNotes,
        ...extra,
      });
      await fetchAppointments();
      setSelectedAppt(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirm = () => executeStatusUpdate('confirmed');
  const handleComplete = () => executeStatusUpdate('completed');
  const handleCancel = () => executeStatusUpdate('cancelled');
  const handleReschedule = () => {
    if (!rescheduleDate || !rescheduleTime) return;
    executeStatusUpdate('rescheduled', {
      rescheduleDate,
      rescheduleTime,
    });
  };

  const TABS = [
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'confirmed', label: 'Confirmed', count: counts.confirmed },
    { key: 'completed', label: 'Completed', count: counts.completed },
    { key: 'rescheduled', label: 'Rescheduled', count: counts.rescheduled },
    { key: 'cancelled', label: 'Cancelled', count: counts.cancelled },
    { key: 'all', label: 'All', count: counts.all },
  ];

  return (
    <DashboardLayout pageTitle="Appointments Schedule 📅">
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-6">

        {/* Page Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-muted text-sm font-medium">Practice Schedule</p>
            <h1 className="text-3xl font-heading font-semibold text-strong">
              Appointments <span className="heading-gradient">Manager</span>
            </h1>
            <p className="text-muted text-sm mt-0.5">
              Review booking requests, track consultations, and log clinical notes
            </p>
          </div>
          {counts.pending > 0 && (
            <div className="bg-[#F5EDD9] text-[#7A5E2A] border border-[#E3D0A8] rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-2 self-start sm:self-auto">
              <span>⏳</span> {counts.pending} appointment{counts.pending === 1 ? '' : 's'} awaiting your confirmation
            </div>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="glass-card p-4 space-y-4">
          {/* Top row: search + date filter */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-80">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search pet, owner, or symptom…"
                className="w-full pl-9 pr-4 py-2 bg-white border border-[#E8E2D9] rounded-xl text-sm text-body placeholder-[#8A8279] focus:outline-none focus:border-primary-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-1 bg-primary-50 p-1 rounded-xl border border-[#E8E2D9] w-full md:w-auto overflow-x-auto">
              {[
                { key: 'all', label: 'All Dates' },
                { key: 'today', label: "Today's" },
                { key: 'upcoming', label: 'Upcoming' },
                { key: 'past', label: 'Past' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setDateFilter(key)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    dateFilter === key
                      ? 'bg-white text-primary-900 font-semibold shadow-xs'
                      : 'text-muted hover:text-body'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom row: status tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-[#E8E2D9] pt-3">
            {TABS.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === key
                    ? 'bg-white border border-primary-300 text-primary-900 font-semibold shadow-sm'
                    : 'text-muted hover:text-body hover:bg-white/60'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    activeTab === key ? 'bg-primary-100 text-primary-800' : 'bg-[#E8E2D9] text-muted'
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Appointments Table */}
        <div className="glass-card overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="p-16 text-center">
              <span className="text-4xl block mb-3">📅</span>
              <h3 className="text-base font-heading font-semibold text-strong mb-1">
                No appointments in this view
              </h3>
              <p className="text-muted text-xs">
                {search || activeTab !== 'all' || dateFilter !== 'all'
                  ? 'Try selecting a different status tab or clearing filters.'
                  : 'New booking requests from pet owners will appear here.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-[#E8E2D9] bg-primary-50/50 text-xs font-semibold text-muted uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Pet</th>
                    <th className="px-5 py-3.5">Owner</th>
                    <th className="px-5 py-3.5">Date & Time</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5">Reason / Symptoms</th>
                    <th className="px-5 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E8E2D9]">
                  {filteredAppointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-white/60 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{SPECIES_EMOJI[appt.pet?.species] || '🐾'}</span>
                          <div>
                            <p className="font-semibold text-strong">{appt.pet?.name || '—'}</p>
                            <p className="text-xs text-muted capitalize">
                              {appt.pet?.species} {appt.pet?.breed ? `· ${appt.pet.breed}` : ''}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-body">{appt.owner?.name || '—'}</p>
                        <p className="text-xs text-muted font-mono">{appt.owner?.phone || appt.owner?.email || ''}</p>
                      </td>

                      <td className="px-5 py-4 text-body">
                        <p className="font-medium">
                          {new Date(appt.appointmentDate).toLocaleDateString('en-IN', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                          })}
                        </p>
                        <p className="text-xs text-muted font-mono">{appt.appointmentTime || '09:00 AM'}</p>
                      </td>

                      <td className="px-5 py-4">
                        <AppointmentStatusBadge status={appt.status} />
                      </td>

                      <td className="px-5 py-4 text-xs text-muted max-w-[200px] truncate">
                        {appt.reason || 'General checkup'}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => openManageModal(appt)}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-white border border-[#D9D4CC] text-primary-800 hover:bg-primary-50 transition-all shadow-xs"
                        >
                          Manage →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Modal: Manage Appointment ── */}
        <Modal
          isOpen={!!selectedAppt}
          onClose={() => setSelectedAppt(null)}
          title={`Manage Appointment: ${selectedAppt?.pet?.name || ''}`}
        >
          {selectedAppt && (
            <div className="space-y-4">
              {/* Pet & Owner Summary */}
              <div className="p-3.5 bg-primary-50 rounded-xl border border-primary-200 flex items-start gap-3">
                <span className="text-2xl">{SPECIES_EMOJI[selectedAppt.pet?.species] || '🐾'}</span>
                <div className="min-w-0 flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-strong">{selectedAppt.pet?.name}</span>
                    <AppointmentStatusBadge status={selectedAppt.status} />
                  </div>
                  <p className="text-muted mt-0.5">
                    Parent: <strong className="text-body">{selectedAppt.owner?.name}</strong> · Contact:{' '}
                    {selectedAppt.owner?.phone || selectedAppt.owner?.email}
                  </p>
                  <p className="text-muted mt-1">
                    Scheduled for:{' '}
                    <strong className="text-strong">
                      {formatDateTime(selectedAppt.appointmentDate, selectedAppt.appointmentTime)}
                    </strong>
                  </p>
                  {selectedAppt.reason && (
                    <p className="text-body mt-1 bg-white/80 p-2 rounded-lg border border-[#E8E2D9]">
                      <span className="font-semibold text-muted">Reason:</span> {selectedAppt.reason}
                    </p>
                  )}
                </div>
              </div>

              {modalView === 'main' ? (
                <>
                  {/* Clinical Notes */}
                  <div>
                    <label className="text-xs font-semibold text-body block mb-1">
                      Clinical Notes / Diagnosis / Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={vetNotes}
                      onChange={(e) => setVetNotes(e.target.value)}
                      placeholder="Add medical findings, recommendations for the pet owner, or visit summary…"
                      className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-xs text-body focus:outline-none focus:border-primary-500 resize-none"
                    />
                  </div>

                  {/* Actions according to status */}
                  <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
                    {selectedAppt.status === 'pending' && (
                      <button
                        onClick={handleConfirm}
                        disabled={actionLoading}
                        className="w-full btn-primary text-xs py-2.5 justify-center"
                      >
                        {actionLoading ? 'Updating…' : '✓ Confirm Appointment'}
                      </button>
                    )}

                    {selectedAppt.status !== 'completed' && selectedAppt.status !== 'cancelled' && (
                      <button
                        onClick={handleComplete}
                        disabled={actionLoading}
                        className="w-full py-2.5 rounded-xl text-xs font-semibold bg-info-500 hover:bg-info-600 text-white transition-all text-center flex items-center justify-center gap-1.5"
                      >
                        {actionLoading ? 'Updating…' : '✔️ Complete Consultation & Save Notes'}
                      </button>
                    )}

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setModalView('reschedule')}
                        className="py-2 rounded-xl text-xs font-semibold border border-[#E8E2D9] text-body hover:bg-white transition-all text-center"
                      >
                        🕒 Reschedule
                      </button>

                      {selectedAppt.status !== 'cancelled' && (
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={actionLoading}
                          className="py-2 rounded-xl text-xs font-semibold border border-red-200 text-[#8C4238] hover:bg-[#F4EBE8] transition-all text-center"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                /* Reschedule sub-view */
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-bold text-strong uppercase tracking-wider">Select New Date & Time</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-medium text-muted block mb-1">New Date</label>
                      <input
                        type="date"
                        value={rescheduleDate}
                        onChange={(e) => setRescheduleDate(e.target.value)}
                        className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-xs text-body focus:outline-none focus:border-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-muted block mb-1">New Time</label>
                      <input
                        type="time"
                        value={rescheduleTime}
                        onChange={(e) => setRescheduleTime(e.target.value)}
                        className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-xs text-body focus:outline-none focus:border-primary-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setModalView('main')}
                      className="flex-1 py-2 rounded-xl text-xs font-medium border border-[#E8E2D9] text-muted hover:bg-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      disabled={!rescheduleDate || !rescheduleTime || actionLoading}
                      onClick={handleReschedule}
                      className="flex-1 btn-primary text-xs py-2 disabled:opacity-50"
                    >
                      {actionLoading ? 'Updating…' : 'Confirm New Time'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

      </div>
    </DashboardLayout>
  );
}
