/**
 * components/appointments/AppointmentDetail.jsx
 * Full detail modal for a single appointment.
 */
import AppointmentStatusBadge from './AppointmentStatusBadge.jsx';

function InfoRow({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-[#E8E2D9] last:border-0">
      <span className="text-lg flex-shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-subtle mb-0.5">{label}</p>
        <p className="text-sm text-body font-medium">{value}</p>
      </div>
    </div>
  );
}

function format12h(t) {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

export default function AppointmentDetail({ appt, onCancel, isCancelling }) {
  if (!appt) return null;

  const isRescheduled = appt.status === 'rescheduled';
  const displayDate   = isRescheduled && appt.rescheduleDate ? appt.rescheduleDate : appt.appointmentDate;
  const displayTime   = isRescheduled && appt.rescheduleTime ? appt.rescheduleTime : appt.appointmentTime;
  const canCancel     = ['pending', 'confirmed'].includes(appt.status);

  return (
    <div className="animate-fade-in">
      {/* Status header */}
      <div className="flex items-center justify-between mb-5">
        <AppointmentStatusBadge status={appt.status} size="lg" />
        {isRescheduled && (
          <span className="text-xs text-info-600 bg-[#E8F0F5] border border-info-400 px-3 py-1 rounded-full">
            🔄 Rescheduled
          </span>
        )}
      </div>

      {/* Core info */}
      <div className="glass-card p-4 mb-5">
        <InfoRow icon="🐾" label="Pet"              value={`${appt.pet?.name ?? '—'} (${appt.pet?.species ?? ''}${appt.pet?.breed ? ` · ${appt.pet.breed}` : ''})`} />
        <InfoRow icon="🩺" label="Veterinarian"     value={`Dr. ${appt.vet?.name ?? '—'}`} />
        <InfoRow icon="🔬" label="Specialization"   value={appt.vet?.specialization} />
        <InfoRow icon="🏥" label="Clinic"           value={appt.vet?.clinicName} />
        <InfoRow icon="📍" label="Clinic Address"   value={appt.vet?.clinicAddress} />
        <InfoRow icon="📞" label="Vet Phone"        value={appt.vet?.phone} />
        <InfoRow icon="📅" label="Date"             value={formatDate(displayDate)} />
        <InfoRow icon="🕐" label="Time"             value={format12h(displayTime)} />
      </div>

      {/* Reason & notes */}
      {appt.reason && (
        <div className="mb-4">
          <p className="text-xs text-muted mb-2 font-medium uppercase tracking-wider">📝 Reason for Visit</p>
          <div className="bg-primary-50 border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-body leading-relaxed">
            {appt.reason}
          </div>
        </div>
      )}

      {appt.ownerNotes && (
        <div className="mb-4">
          <p className="text-xs text-muted mb-2 font-medium uppercase tracking-wider">📋 Owner Notes</p>
          <div className="bg-primary-50 border border-[#E8E2D9] rounded-xl px-4 py-3 text-sm text-muted leading-relaxed">
            {appt.ownerNotes}
          </div>
        </div>
      )}

      {appt.vetNotes && (
        <div className="mb-4">
          <p className="text-xs text-blue-500/80 mb-2 font-medium uppercase tracking-wider">🩺 Vet Notes</p>
          <div className="bg-blue-500/5 border border-info-400 rounded-xl px-4 py-3 text-sm text-blue-200 leading-relaxed">
            {appt.vetNotes}
          </div>
        </div>
      )}

      {appt.cancellationReason && (
        <div className="mb-4">
          <p className="text-xs text-red-500/80 mb-2 font-medium uppercase tracking-wider">❌ Cancellation Reason</p>
          <div className="bg-red-500/5 border border-[#E0C8C4] rounded-xl px-4 py-3 text-sm text-[#8C4238] leading-relaxed">
            {appt.cancellationReason}
          </div>
        </div>
      )}

      {/* Follow-up after reschedule */}
      {isRescheduled && appt.rescheduleDate && (
        <div className="mb-4 p-4 rounded-xl bg-[#E8F0F5] border border-purple-500/25 flex items-start gap-3">
          <span className="text-xl">🔄</span>
          <div>
            <p className="text-purple-300 text-sm font-semibold">Rescheduled To</p>
            <p className="text-body text-sm">{formatDate(appt.rescheduleDate)} · {format12h(appt.rescheduleTime)}</p>
          </div>
        </div>
      )}

      {/* Action */}
      {canCancel && (
        <div className="pt-4 border-t border-[#E8E2D9]">
          <button
            onClick={() => onCancel(appt)}
            disabled={isCancelling}
            id={`detail-cancel-appt-${appt._id}`}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border
              border-red-500/30 bg-[#F4EBE8] text-[#8C4238] text-sm font-semibold
              hover:bg-red-500/20 hover:border-red-500/50 transition-all
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isCancelling
              ? <><span className="w-4 h-4 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> Cancelling…</>
              : '❌ Cancel Appointment'
            }
          </button>
          <p className="text-xs text-subtle text-center mt-2">
            Please cancel at least 2 hours before the appointment.
          </p>
        </div>
      )}
    </div>
  );
}
