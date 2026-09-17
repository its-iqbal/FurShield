/**
 * components/appointments/AppointmentStatusBadge.jsx
 * Colored pill badge for appointment status.
 */

export const STATUS_META = {
  pending:      { label: 'Pending',      emoji: '⏳', bg: 'bg-yellow-500/15', border: 'border-yellow-500/30', text: 'text-[#7A5E2A]' },
  confirmed:    { label: 'Confirmed',    emoji: '✅', bg: 'bg-green-500/15',  border: 'border-green-500/30',  text: 'text-primary-600'  },
  rescheduled:  { label: 'Rescheduled', emoji: '🔄', bg: 'bg-purple-500/15', border: 'border-info-400', text: 'text-purple-300' },
  completed:    { label: 'Completed',    emoji: '✔️', bg: 'bg-blue-500/15',   border: 'border-blue-500/30',   text: 'text-info-500'   },
  cancelled:    { label: 'Cancelled',    emoji: '❌', bg: 'bg-red-500/15',    border: 'border-red-500/30',    text: 'text-[#8C4238]'    },
};

export default function AppointmentStatusBadge({ status, size = 'sm' }) {
  const meta = STATUS_META[status] ?? STATUS_META.pending;
  const sz   = size === 'lg' ? 'text-sm px-3 py-1.5 gap-2' : 'text-xs px-2.5 py-1 gap-1.5';
  return (
    <span className={`inline-flex items-center font-semibold rounded-full border
      ${meta.bg} ${meta.border} ${meta.text} ${sz}`}>
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
    </span>
  );
}
