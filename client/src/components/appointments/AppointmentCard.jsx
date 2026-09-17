/**
 * components/appointments/AppointmentCard.jsx
 * Single appointment card in the list view.
 */
import AppointmentStatusBadge, { STATUS_META } from './AppointmentStatusBadge.jsx';

const SPECIES_EMOJI = { dog:'🐕', cat:'🐱', bird:'🦜', rabbit:'🐰', reptile:'🦎', fish:'🐠', other:'🐾' };

function formatDateTime(dateStr, timeStr) {
  const date = new Date(dateStr);
  const dateLabel = date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return `${dateLabel}${timeStr ? ` · ${timeStr}` : ''}`;
}

export default function AppointmentCard({ appt, onCancel, onViewDetail, isCancelling }) {
  const meta         = STATUS_META[appt.status] ?? STATUS_META.pending;
  const canCancel    = ['pending', 'confirmed'].includes(appt.status);
  const isRescheduled = appt.status === 'rescheduled';

  const petEmoji  = SPECIES_EMOJI[appt.pet?.species] ?? '🐾';
  const vetName   = appt.vet?.name   ?? 'Unknown Vet';
  const petName   = appt.pet?.name   ?? 'Unknown Pet';
  const clinicName= appt.vet?.clinicName ?? '';

  // use rescheduled date/time if available
  const displayDate = isRescheduled && appt.rescheduleDate ? appt.rescheduleDate : appt.appointmentDate;
  const displayTime = isRescheduled && appt.rescheduleTime ? appt.rescheduleTime : appt.appointmentTime;

  return (
    <div
      className={`glass-card p-5 border transition-all duration-300 hover:scale-[1.005]
        ${meta.border} hover:shadow-lg`}
      style={{ borderLeftWidth: '3px' }}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        {/* Left: pet + vet info */}
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-11 h-11 rounded-xl [#EEEAE4] flex items-center justify-center text-2xl
            border border-[#E8E2D9] flex-shrink-0">
            {petEmoji}
          </div>
          <div className="min-w-0">
            <p className="text-strong font-bold text-sm truncate">{petName}</p>
            <p className="text-muted text-xs truncate">
              🩺 {vetName?.startsWith('Dr.') ? vetName : `Dr. ${vetName}`}
              {clinicName && <span className="text-subtle"> · {clinicName}</span>}
            </p>
          </div>
        </div>
        {/* Right: status badge */}
        <div className="flex-shrink-0">
          <AppointmentStatusBadge status={appt.status} />
        </div>
      </div>

      {/* Date/time row */}
      <div className="flex items-center gap-2 mb-3 text-sm">
        <span className="text-lg">📅</span>
        <span className={`font-medium ${isRescheduled ? 'text-purple-300' : 'text-body'}`}>
          {formatDateTime(displayDate, displayTime)}
        </span>
        {isRescheduled && (
          <span className="text-xs text-info-600 bg-[#E8F0F5] border border-info-400 px-2 py-0.5 rounded-full">
            Rescheduled
          </span>
        )}
      </div>

      {/* Reason */}
      {appt.reason && (
        <p className="text-xs text-muted mb-3 bg-primary-50 rounded-lg px-3 py-2 line-clamp-2">
          📝 {appt.reason}
        </p>
      )}

      {/* Vet notes (if present) */}
      {appt.vetNotes && (
        <p className="text-xs text-info-500 mb-3 bg-blue-500/5 border border-blue-500/15 rounded-lg px-3 py-2 line-clamp-2">
          🩺 {appt.vetNotes}
        </p>
      )}

      {/* Action row */}
      <div className="flex items-center gap-2 pt-3 border-t border-[#E8E2D9]">
        <button
          onClick={() => onViewDetail(appt)}
          id={`view-appt-${appt._id}`}
          className="text-xs text-muted hover:text-body border border-[#E8E2D9]
            hover:border-white/25 rounded-lg px-3 py-1.5 transition-all"
        >
          View Details →
        </button>
        {canCancel && (
          <button
            onClick={() => onCancel(appt)}
            id={`cancel-appt-${appt._id}`}
            disabled={isCancelling}
            className="text-xs text-[#8C4238] hover:text-[#8C4238] border border-[#E0C8C4]
              hover:border-red-500/40 hover:bg-[#F4EBE8] rounded-lg px-3 py-1.5
              transition-all disabled:opacity-40 ml-auto"
          >
            {isCancelling ? '…' : 'Cancel'}
          </button>
        )}
      </div>
    </div>
  );
}
