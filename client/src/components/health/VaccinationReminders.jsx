/**
 * components/health/VaccinationReminders.jsx
 * Shows upcoming / overdue vaccinations for the active pet in a compact card.
 */
import { formatDate, daysUntil } from './healthConfig.js';

export default function VaccinationReminders({ upcoming }) {
  if (!upcoming?.length) return null;

  return (
    <div className="glass-card p-5">
      <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
        💉 <span>Vaccination Alerts</span>
        <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
          {upcoming.length}
        </span>
      </h3>

      <div className="flex flex-col gap-2">
        {upcoming.map((v, i) => {
          const days    = daysUntil(v.nextDueDate);
          const overdue = days < 0;
          const urgent  = !overdue && days <= 7;

          return (
            <div key={i}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-sm
                ${overdue
                  ? 'bg-red-500/10 border-red-500/25'
                  : urgent
                  ? 'bg-amber-500/10 border-amber-500/25'
                  : 'bg-green-500/5 border-green-500/20'
                }`}>
              <div className="min-w-0">
                <p className={`font-semibold truncate ${overdue ? 'text-red-300' : urgent ? 'text-amber-300' : 'text-green-300'}`}>
                  {v.vaccineName}
                </p>
                <p className="text-xs text-gray-500">Due: {formatDate(v.nextDueDate)}</p>
              </div>
              <span className={`text-xs font-bold flex-shrink-0 ${overdue ? 'text-red-400' : urgent ? 'text-amber-400' : 'text-green-400'}`}>
                {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Today!' : `${days}d`}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
