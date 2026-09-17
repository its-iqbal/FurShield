import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import AppointmentService from '../../api/appointmentService.js';
import AppointmentStatusBadge from '../../components/appointments/AppointmentStatusBadge.jsx';
import Modal from '../../components/ui/Modal.jsx';

function formatDateTime(dateStr, timeStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { weekday:'short', day:'numeric', month:'short' }) + (timeStr ? ` · ${timeStr}` : '');
}

const SPECIES_EMOJI = { dog:'🐕', cat:'🐱', bird:'🦜', rabbit:'🐰', reptile:'🦎', fish:'🐠', other:'🐾' };

// ── Appointment row ───────────────────────────────────────────────────────────
function ApptRow({ appt, onAction }) {
  const pet  = appt.pet;
  const owner = appt.owner;
  return (
    <tr className="border-b border-[#E8E2D9] hover:bg-white/[0.03] transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{SPECIES_EMOJI[pet?.species] ?? '🐾'}</span>
          <div>
            <p className="text-strong text-sm font-semibold">{pet?.name ?? '—'}</p>
            <p className="text-subtle text-xs capitalize">{pet?.species} {pet?.breed ? `· ${pet.breed}` : ''}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-body text-sm">{owner?.name ?? '—'}</td>
      <td className="px-4 py-3 text-muted text-sm">{formatDateTime(appt.appointmentDate, appt.appointmentTime)}</td>
      <td className="px-4 py-3"><AppointmentStatusBadge status={appt.status} /></td>
      <td className="px-4 py-3 text-muted text-xs max-w-[12rem] truncate">{appt.reason ?? '—'}</td>
      <td className="px-4 py-3">
        <button onClick={() => onAction(appt)}
          className="text-xs text-primary-600 hover:text-primary-800 border border-primary-500/30
            hover:border-primary-500/50 px-2.5 py-1 rounded-lg transition-all opacity-0 group-hover:opacity-100">
          Manage →
        </button>
      </td>
    </tr>
  );
}

// ── Manage appointment modal ──────────────────────────────────────────────────
function ManageAppt({ appt, onConfirm, onComplete, onReschedule, isLoading }) {
  const [notes,  setNotes]  = useState(appt?.vetNotes ?? '');
  const [resDate, setResDate]= useState('');
  const [resTime, setResTime]= useState('');
  const [view,   setView]   = useState('main'); // main | reschedule

  if (!appt) return null;

  return (
    <div>
      {/* Summary */}
      <div className="glass-card p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{SPECIES_EMOJI[appt.pet?.species] ?? '🐾'}</span>
          <div>
            <p className="text-strong font-bold">{appt.pet?.name} — {appt.reason}</p>
            <p className="text-muted text-xs">{formatDateTime(appt.appointmentDate, appt.appointmentTime)} · {appt.owner?.name}</p>
          </div>
        </div>
        <AppointmentStatusBadge status={appt.status} size="lg" />
      </div>

      {/* Vet notes */}
      <div className="mb-4">
        <label className="text-sm font-medium text-body block mb-1.5">Vet Notes / Diagnosis</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          placeholder="Add your clinical notes, diagnosis, or instructions for the owner…"
          className="w-full bg-white border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-body
            placeholder-[#8A8279] text-sm focus:outline-none focus:border-primary-500 resize-none transition-all" />
      </div>

      {view === 'reschedule' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-body block mb-1.5">New Date</label>
              <input type="date" value={resDate} onChange={(e) => setResDate(e.target.value)}
                className="w-full bg-white border border-[#E8E2D9] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-body text-sm focus:outline-none focus:border-primary-500/60 transition-all" />
            </div>
            <div>
              <label className="text-sm text-body block mb-1.5">New Time</label>
              <input type="time" value={resTime} onChange={(e) => setResTime(e.target.value)}
                className="w-full bg-white border border-[#E8E2D9] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-body text-sm focus:outline-none focus:border-primary-500/60 transition-all" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setView('main')} className="btn-outline flex-1 text-sm">← Back</button>
            <button disabled={!resDate || !resTime || isLoading}
              onClick={() => onReschedule(appt._id, notes, resDate, resTime)}
              className="btn-primary flex-1 text-sm justify-center disabled:opacity-40">
              {isLoading ? '…' : '🔄 Confirm Reschedule'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {appt.status === 'pending' && (
            <button onClick={() => onConfirm(appt._id, notes)} disabled={isLoading}
              id={`confirm-appt-${appt._id}`}
              className="w-full py-2.5 rounded-xl border border-green-500/40 bg-primary-50 text-primary-600 text-sm font-semibold hover:bg-green-500/20 transition-all disabled:opacity-40">
              ✅ Confirm Appointment
            </button>
          )}
          {['pending','confirmed'].includes(appt.status) && (
            <button onClick={() => onComplete(appt._id, notes)} disabled={isLoading}
              id={`complete-appt-${appt._id}`}
              className="w-full py-2.5 rounded-xl border border-blue-500/40 bg-[#E8F0F5] text-info-500 text-sm font-semibold hover:bg-blue-500/20 transition-all disabled:opacity-40">
              ✔️ Mark Completed
            </button>
          )}
          {['pending','confirmed'].includes(appt.status) && (
            <button onClick={() => setView('reschedule')}
              className="w-full py-2.5 rounded-xl border border-purple-500/40 bg-[#E8F0F5] text-purple-300 text-sm font-semibold hover:bg-purple-500/20 transition-all">
              🔄 Reschedule
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Vet Dashboard ────────────────────────────────────────────────────────
export default function VetDashboardPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [tab,          setTab]          = useState('pending');
  const [selected,     setSelected]     = useState(null);
  const [showModal,    setShowModal]    = useState(false);
  const [actionLoading, setActLoad]     = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await AppointmentService.getMine({ role: 'vet', limit: 100 });
      setAppointments(data.data);
    } catch { setAppointments([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const filtered = tab === 'all'
    ? appointments
    : appointments.filter(a => a.status === tab);

  const counts = { pending: 0, confirmed: 0, completed: 0, all: appointments.length };
  appointments.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });

  // Today's appointments
  const today = new Date().toISOString().slice(0, 10);
  const todayAppts = appointments.filter(a =>
    a.appointmentDate?.slice(0, 10) === today && !['completed','cancelled'].includes(a.status)
  );

  const doAction = async (fn) => {
    setActLoad(true);
    try { await fn(); await fetch(); setShowModal(false); }
    catch {}
    finally { setActLoad(false); }
  };

  const handleConfirm  = (id, notes) => doAction(() => AppointmentService.updateStatus(id, { status: 'confirmed',   vetNotes: notes }));
  const handleComplete = (id, notes) => doAction(() => AppointmentService.updateStatus(id, { status: 'completed',   vetNotes: notes }));
  const handleReschedule = (id, notes, date, time) => doAction(() =>
    AppointmentService.updateStatus(id, { status: 'rescheduled', vetNotes: notes, rescheduleDate: date, rescheduleTime: time })
  );

  const TABS = [
    { key: 'pending',   label: 'Pending'   },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'all',       label: 'All'       },
  ];

  return (
    <DashboardLayout pageTitle="Vet Dashboard 📊">
      <div className="px-4 sm:px-6 py-8 max-w-6xl mx-auto">

        {/* Welcome */}
        <div className="mb-8">
          <p className="text-muted text-sm">Welcome back</p>
          <h2 className="text-3xl font-heading font-semibold text-strong">
            <span className="heading-gradient">
              {user?.name?.startsWith('Dr.') ? user?.name : `Dr. ${user?.name || ''}`}
            </span>
          </h2>
          {user?.specialization && <p className="text-muted mt-1">🔬 {user.specialization}</p>}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '⏳', label: 'Pending',   value: counts.pending,   color: 'text-[#7A5E2A]' },
            { icon: '✅', label: 'Confirmed', value: counts.confirmed,  color: 'text-primary-600'  },
            { icon: '✔️', label: 'Completed', value: counts.completed,  color: 'text-info-500'   },
            { icon: '📅', label: "Today's",   value: todayAppts.length, color: 'text-primary-700'},
          ].map((s) => (
            <div key={s.label} className="glass-card p-4 text-center">
              <span className="text-2xl">{s.icon}</span>
              <p className={`text-3xl font-black mt-1 ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Today's quick view */}
        {todayAppts.length > 0 && (
          <div className="glass-card p-5 mb-6 border border-primary-500/20">
            <h3 className="text-sm font-bold text-primary-700 mb-3 flex items-center gap-2">
              📅 Today's Appointments ({todayAppts.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {todayAppts.map((a) => (
                <button key={a._id} onClick={() => { setSelected(a); setShowModal(true); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary-50 border border-[#E8E2D9] hover:border-primary-500/40 transition-all text-sm">
                  <span>{SPECIES_EMOJI[a.pet?.species] ?? '🐾'}</span>
                  <span className="text-strong font-semibold">{a.pet?.name}</span>
                  <span className="text-muted">{a.appointmentTime}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Appointments table */}
        <div className="glass-card overflow-hidden">
          {/* Tabs */}
          <div className="flex items-center gap-1 p-3 border-b border-[#E8E2D9] overflow-x-auto">
            {TABS.map(({ key, label }) => (
              <button key={key} onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                  ${tab === key
                    ? 'bg-white border border-primary-300 text-primary-900 font-semibold shadow-sm'
                    : 'text-muted hover:text-body hover:bg-white/50'
                  }`}>
                {label}
                {counts[key] > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${tab === key ? 'bg-primary-100 text-primary-800' : 'bg-[#EEEAE4] text-muted'}`}>
                    {counts[key]}
                  </span>
                )}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="p-8 text-center"><div className="w-8 h-8 border-2 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto" /></div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center"><p className="text-muted">No {tab} appointments.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E8E2D9] bg-primary-50">
                    {['Pet','Owner','Date & Time','Status','Reason','Action'].map((h) => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => (
                    <ApptRow key={a._id} appt={a} onAction={(a) => { setSelected(a); setShowModal(true); }} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Manage Appointment" size="md">
        <ManageAppt
          appt={selected}
          onConfirm={handleConfirm}
          onComplete={handleComplete}
          onReschedule={handleReschedule}
          isLoading={actionLoading}
        />
      </Modal>
    </DashboardLayout>
  );
}
