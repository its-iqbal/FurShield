import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import AppointmentService from '../../api/appointmentService.js';
import AppointmentStatusBadge from '../../components/appointments/AppointmentStatusBadge.jsx';
import Modal from '../../components/ui/Modal.jsx';

const SPECIES_EMOJI = { dog: '🐕', cat: '🐱', bird: '🦜', rabbit: '🐰', reptile: '🦎', fish: '🐠', other: '🐾' };

export default function VetDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppt, setSelectedAppt] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [vetNotes, setVetNotes] = useState('');

  const loadAppointments = useCallback(async () => {
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
    loadAppointments();
  }, [loadAppointments]);

  // Derived statistics
  const todayStr = new Date().toISOString().slice(0, 10);

  const todayAppts = useMemo(() => {
    return appointments.filter(
      (a) => a.appointmentDate?.slice(0, 10) === todayStr && a.status !== 'cancelled'
    );
  }, [appointments, todayStr]);

  const pendingAppts = useMemo(() => {
    return appointments.filter((a) => a.status === 'pending');
  }, [appointments]);

  const completedAppts = useMemo(() => {
    return appointments.filter((a) => a.status === 'completed');
  }, [appointments]);

  // Unique patient count
  const uniquePatients = useMemo(() => {
    const ids = new Set();
    const list = [];
    for (const a of appointments) {
      if (a.pet?._id && !ids.has(a.pet._id)) {
        ids.add(a.pet._id);
        list.push({ pet: a.pet, owner: a.owner, lastVisit: a.appointmentDate });
      }
    }
    return list;
  }, [appointments]);

  // Next upcoming appointments (after today or future)
  const upcomingAppts = useMemo(() => {
    return appointments
      .filter((a) => a.appointmentDate?.slice(0, 10) >= todayStr && a.status !== 'cancelled')
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
      .slice(0, 5);
  }, [appointments, todayStr]);

  const handleQuickConfirm = async (id) => {
    setActionLoading(true);
    try {
      await AppointmentService.updateStatus(id, { status: 'confirmed' });
      await loadAppointments();
      setSelectedAppt(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteVisit = async (id) => {
    setActionLoading(true);
    try {
      await AppointmentService.updateStatus(id, { status: 'completed', vetNotes });
      await loadAppointments();
      setSelectedAppt(null);
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const displayName = user?.name?.startsWith('Dr.') ? user?.name : `Dr. ${user?.name || ''}`;

  return (
    <DashboardLayout pageTitle="Veterinary Dashboard 📊">
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto space-y-7">

        {/* ── Welcome Banner ── */}
        <div className="glass-card p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative overflow-hidden">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary-100 text-primary-800 font-semibold border border-primary-300">
                🩺 Certified Veterinary Surgeon
              </span>
              {user?.experience && (
                <span className="text-xs text-muted">· {user.experience} yrs exp</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-heading font-semibold text-strong">
              Welcome back, <span className="heading-gradient">{displayName}</span>
            </h1>
            <p className="text-muted text-sm max-w-xl">
              {user?.specialization ? `Specialist in ${user.specialization}` : 'General Veterinary Medicine'}
              {user?.clinicName ? ` at ${user.clinicName}` : ''}. Here is your clinical overview for today.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 z-10">
            <button
              onClick={() => navigate('/vet/appointments')}
              className="btn-primary text-xs sm:text-sm py-2.5 px-4 shadow-sm"
            >
              📅 Manage Schedule
            </button>
            <button
              onClick={() => navigate('/vet/patients')}
              className="btn-outline text-xs sm:text-sm py-2.5 px-4"
            >
              🐾 Patients Directory
            </button>
          </div>

          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-primary-500/5 rounded-full pointer-events-none" />
        </div>

        {/* ── Key Clinical Metrics ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Today's Queue",
              val: todayAppts.length,
              icon: '📅',
              desc: 'Scheduled visits today',
              color: 'text-primary-800',
              bg: 'bg-primary-50',
              onClick: () => navigate('/vet/appointments'),
            },
            {
              label: 'Action Needed',
              val: pendingAppts.length,
              icon: '⏳',
              desc: 'Pending confirmations',
              color: 'text-[#7A5E2A]',
              bg: 'bg-[#FDF8EE]',
              badge: pendingAppts.length > 0 ? 'Review' : null,
              onClick: () => navigate('/vet/appointments'),
            },
            {
              label: 'Active Patients',
              val: uniquePatients.length,
              icon: '🐾',
              desc: 'Pets registered under care',
              color: 'text-primary-700',
              bg: 'bg-white',
              onClick: () => navigate('/vet/patients'),
            },
            {
              label: 'Completed Visits',
              val: completedAppts.length,
              icon: '✔️',
              desc: 'Successful consultations',
              color: 'text-info-600',
              bg: 'bg-white',
              onClick: () => navigate('/vet/appointments'),
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

        {/* ── Two Column Layout: Today's Focus & Recent Patients ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2 Cols: Schedule & Queue */}
          <div className="lg:col-span-2 space-y-6">

            {/* Today's Schedule Card */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-heading font-semibold text-strong flex items-center gap-2">
                    <span>📅</span> Today's Consultations ({todayAppts.length})
                  </h3>
                  <p className="text-xs text-muted">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <Link
                  to="/vet/appointments"
                  className="text-xs text-primary-700 hover:text-primary-900 font-semibold"
                >
                  View All Appointments →
                </Link>
              </div>

              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-6 h-6 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
                </div>
              ) : todayAppts.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-[#E8E2D9]">
                  <span className="text-3xl block mb-2">🎉</span>
                  <p className="text-sm font-semibold text-strong">No appointments scheduled for today!</p>
                  <p className="text-xs text-muted mt-0.5">
                    Your queue is clear. You can review upcoming bookings or patient records.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppts.map((appt) => (
                    <div
                      key={appt._id}
                      className="p-4 bg-white rounded-xl border border-[#E8E2D9] flex items-center justify-between gap-4 hover:shadow-xs transition-shadow"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <span className="text-3xl flex-shrink-0">{SPECIES_EMOJI[appt.pet?.species] || '🐾'}</span>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-strong truncate">{appt.pet?.name}</span>
                            <AppointmentStatusBadge status={appt.status} />
                          </div>
                          <p className="text-xs text-muted truncate mt-0.5">
                            Parent: <span className="text-body font-medium">{appt.owner?.name}</span> · Reason: {appt.reason || 'Checkup'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-xs font-mono font-semibold text-strong bg-primary-50 px-2.5 py-1 rounded-lg border border-primary-200">
                          {appt.appointmentTime || '09:00 AM'}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedAppt(appt);
                            setVetNotes(appt.vetNotes || '');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary-500 hover:bg-primary-600 text-white transition-all"
                        >
                          Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Schedule (Next up) */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-heading font-semibold text-strong flex items-center gap-2">
                  <span>⏰</span> Upcoming Schedule (Next 5 Days)
                </h3>
                <Link to="/vet/appointments" className="text-xs text-primary-700 hover:text-primary-900 font-semibold">
                  Full Schedule →
                </Link>
              </div>

              {upcomingAppts.length === 0 ? (
                <p className="text-xs text-muted italic bg-white p-4 rounded-xl border border-[#E8E2D9] text-center">
                  No upcoming appointments booked in the next 5 days.
                </p>
              ) : (
                <div className="divide-y divide-[#E8E2D9] bg-white rounded-xl border border-[#E8E2D9] overflow-hidden">
                  {upcomingAppts.map((a) => (
                    <div key={a._id} className="p-3.5 flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl">{SPECIES_EMOJI[a.pet?.species] || '🐾'}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-strong truncate">{a.pet?.name || 'Pet'}</p>
                          <p className="text-muted text-[11px] truncate">
                            {new Date(a.appointmentDate).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                            })}{' '}
                            · {a.appointmentTime}
                          </p>
                        </div>
                      </div>
                      <AppointmentStatusBadge status={a.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Right 1 Col: Quick Patient Directory & Shortcuts */}
          <div className="space-y-6">

            {/* Recent Patients */}
            <div className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-heading font-semibold text-strong flex items-center gap-1.5">
                  <span>🐾</span> Recent Patients
                </h3>
                <Link to="/vet/patients" className="text-xs text-primary-700 hover:text-primary-900 font-semibold">
                  View Directory ({uniquePatients.length}) →
                </Link>
              </div>

              {uniquePatients.length === 0 ? (
                <p className="text-xs text-muted italic p-3 text-center">No patients on file yet.</p>
              ) : (
                <div className="space-y-2.5">
                  {uniquePatients.slice(0, 4).map(({ pet, owner }) => (
                    <div
                      key={pet._id}
                      onClick={() => navigate('/vet/patients')}
                      className="p-3 bg-white rounded-xl border border-[#E8E2D9] flex items-center justify-between gap-2 hover:border-primary-300 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl">{SPECIES_EMOJI[pet.species] || '🐾'}</span>
                        <div className="min-w-0">
                          <p className="font-semibold text-xs text-strong truncate">{pet.name}</p>
                          <p className="text-[11px] text-muted truncate">
                            {owner?.name ? `Parent: ${owner.name}` : pet.species}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-muted">→</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Practice Actions */}
            <div className="glass-card p-5 space-y-3">
              <h3 className="text-sm font-heading font-semibold text-strong">⚡ Practice Shortcuts</h3>
              <div className="space-y-2 text-xs">
                <button
                  onClick={() => navigate('/vet/patients')}
                  className="w-full text-left p-2.5 rounded-xl bg-white border border-[#E8E2D9] hover:bg-primary-50 transition-colors flex items-center justify-between font-medium text-body"
                >
                  <span>📋 Log Clinical Consultation</span>
                  <span className="text-muted">→</span>
                </button>
                <button
                  onClick={() => navigate('/vet/appointments')}
                  className="w-full text-left p-2.5 rounded-xl bg-white border border-[#E8E2D9] hover:bg-primary-50 transition-colors flex items-center justify-between font-medium text-body"
                >
                  <span>⏳ Review Pending Bookings</span>
                  <span className="text-muted">→</span>
                </button>
                <button
                  onClick={() => navigate('/care-tips')}
                  className="w-full text-left p-2.5 rounded-xl bg-white border border-[#E8E2D9] hover:bg-primary-50 transition-colors flex items-center justify-between font-medium text-body"
                >
                  <span>📰 Browse Pet Care Guides</span>
                  <span className="text-muted">→</span>
                </button>
                <button
                  onClick={() => navigate('/profile')}
                  className="w-full text-left p-2.5 rounded-xl bg-white border border-[#E8E2D9] hover:bg-primary-50 transition-colors flex items-center justify-between font-medium text-body"
                >
                  <span>⚙️ Clinic Profile & Hours</span>
                  <span className="text-muted">→</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* ── Modal: Quick Manage from Dashboard ── */}
        <Modal
          isOpen={!!selectedAppt}
          onClose={() => setSelectedAppt(null)}
          title={`Consultation Details: ${selectedAppt?.pet?.name || ''}`}
        >
          {selectedAppt && (
            <div className="space-y-4">
              <div className="p-3 bg-primary-50 rounded-xl border border-primary-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-strong text-sm">
                    {SPECIES_EMOJI[selectedAppt.pet?.species] || '🐾'} {selectedAppt.pet?.name}
                  </span>
                  <AppointmentStatusBadge status={selectedAppt.status} />
                </div>
                <p className="text-muted">
                  Parent: <strong className="text-body">{selectedAppt.owner?.name}</strong> ({selectedAppt.owner?.phone || selectedAppt.owner?.email})
                </p>
                <p className="text-muted">
                  Time: {new Date(selectedAppt.appointmentDate).toLocaleDateString('en-IN')} · {selectedAppt.appointmentTime}
                </p>
                {selectedAppt.reason && (
                  <p className="text-body bg-white p-2 rounded border border-[#E8E2D9] mt-1">
                    <strong>Reason:</strong> {selectedAppt.reason}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-body block mb-1">
                  Clinical Notes / Diagnosis
                </label>
                <textarea
                  rows={3}
                  value={vetNotes}
                  onChange={(e) => setVetNotes(e.target.value)}
                  placeholder="Record diagnosis or visit notes…"
                  className="w-full bg-white border border-[#E8E2D9] rounded-xl px-3 py-2 text-xs text-body focus:outline-none focus:border-primary-500 resize-none"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-[#E8E2D9]">
                {selectedAppt.status === 'pending' && (
                  <button
                    onClick={() => handleQuickConfirm(selectedAppt._id)}
                    disabled={actionLoading}
                    className="w-full btn-primary text-xs py-2.5 justify-center"
                  >
                    {actionLoading ? 'Updating…' : '✓ Confirm Booking'}
                  </button>
                )}
                {selectedAppt.status !== 'completed' && (
                  <button
                    onClick={() => handleCompleteVisit(selectedAppt._id)}
                    disabled={actionLoading}
                    className="w-full py-2.5 rounded-xl text-xs font-semibold bg-info-500 hover:bg-info-600 text-white transition-all text-center flex items-center justify-center"
                  >
                    {actionLoading ? 'Updating…' : '✔️ Complete Consultation'}
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedAppt(null);
                    navigate('/vet/appointments');
                  }}
                  className="w-full py-2 rounded-xl text-xs font-semibold border border-[#E8E2D9] text-body hover:bg-white text-center"
                >
                  Open in Full Appointments Calendar →
                </button>
              </div>
            </div>
          )}
        </Modal>

      </div>
    </DashboardLayout>
  );
}
