/**
 * components/health/HealthRecordDetail.jsx
 * Expanded detail panel for a single health record.
 * Shows: diagnosis, symptoms, prescriptions, vaccinations, lab results, notes, documents.
 */
import { getVisitMeta, formatDate, formatDateShort, daysUntil } from './healthConfig.js';

// ── Tiny atoms ────────────────────────────────────────────────────────────────
function SectionTitle({ icon, children }) {
  return (
    <h4 className="flex items-center gap-2 text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
      <span>{icon}</span>
      {children}
    </h4>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
      <span className="text-xs text-gray-600 w-28 flex-shrink-0 mt-0.5">{label}</span>
      <span className="text-sm text-gray-200 flex-1 leading-snug">{value}</span>
    </div>
  );
}

// ── Prescription table ────────────────────────────────────────────────────────
function PrescriptionList({ prescriptions }) {
  if (!prescriptions?.length) return null;
  return (
    <div className="mb-6">
      <SectionTitle icon="💊">Prescriptions</SectionTitle>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Medication</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Dosage</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((p, i) => (
              <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                <td className="px-4 py-3 text-white font-medium">{p.medicationName}</td>
                <td className="px-4 py-3 text-gray-300">{p.dosage || '—'}</td>
                <td className="px-4 py-3 text-gray-300">{p.duration || '—'}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{p.notes || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Vaccination list ──────────────────────────────────────────────────────────
function VaccinationList({ vaccinations }) {
  if (!vaccinations?.length) return null;
  return (
    <div className="mb-6">
      <SectionTitle icon="💉">Vaccinations</SectionTitle>
      <div className="flex flex-col gap-2">
        {vaccinations.map((v, i) => {
          const days = v.nextDueDate ? daysUntil(v.nextDueDate) : null;
          const overdue  = days !== null && days < 0;
          const dueSoon  = days !== null && days >= 0 && days <= 14;

          return (
            <div key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-green-500/5
                border border-green-500/20 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-xl">💉</span>
                <div>
                  <p className="text-sm font-semibold text-white">{v.vaccineName}</p>
                  <p className="text-xs text-gray-500">
                    Given: {v.dateGiven ? formatDate(v.dateGiven) : '—'}
                    {v.batchNumber && ` · Batch: ${v.batchNumber}`}
                  </p>
                </div>
              </div>
              {v.nextDueDate && (
                <span className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0
                  ${overdue ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                  : dueSoon  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  :            'bg-green-500/10 text-green-400 border border-green-500/20'
                  }`}>
                  {overdue  ? `⚠️ Overdue by ${Math.abs(days)}d`
                  : dueSoon ? `⏰ Due in ${days}d`
                  :           `Next: ${formatDateShort(v.nextDueDate)}`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Lab results ───────────────────────────────────────────────────────────────
function LabResults({ labResults }) {
  if (!labResults?.testName) return null;
  return (
    <div className="mb-6">
      <SectionTitle icon="🧪">Lab Results</SectionTitle>
      <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-4">
        <InfoRow label="Test Name"  value={labResults.testName} />
        <InfoRow label="Result"     value={labResults.result} />
        <InfoRow label="Normal Range" value={labResults.normalRange} />
        <InfoRow label="Lab Name"   value={labResults.labName} />
        <InfoRow label="Test Date"  value={labResults.testDate ? formatDate(labResults.testDate) : null} />
      </div>
    </div>
  );
}

// ── Symptom chips ─────────────────────────────────────────────────────────────
function SymptomChips({ symptoms }) {
  if (!symptoms?.length) return null;
  return (
    <div className="mb-6">
      <SectionTitle icon="🤒">Reported Symptoms</SectionTitle>
      <div className="flex flex-wrap gap-2">
        {symptoms.map((s, i) => (
          <span key={i}
            className="text-xs px-3 py-1.5 rounded-full bg-amber-500/10
              border border-amber-500/20 text-amber-300 capitalize">
            {s}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Document links ────────────────────────────────────────────────────────────
function DocumentLinks({ documents }) {
  if (!documents?.length) return null;
  return (
    <div className="mb-6">
      <SectionTitle icon="📄">Documents</SectionTitle>
      <div className="flex flex-col gap-2">
        {documents.map((url, i) => (
          <a key={i} href={url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10
              hover:border-primary-500/40 hover:bg-primary-500/5 transition-all duration-200 group text-sm">
            <span className="text-lg">📁</span>
            <span className="text-primary-400 group-hover:underline truncate flex-1">{url}</span>
            <span className="text-gray-600 text-xs flex-shrink-0">↗</span>
          </a>
        ))}
      </div>
    </div>
  );
}

// ── Main HealthRecordDetail ───────────────────────────────────────────────────
export default function HealthRecordDetail({ record, onEdit, onDelete, onClose, isDeleting }) {
  if (!record) return null;
  const meta = getVisitMeta(record.visitType);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className={`flex items-start justify-between gap-3 p-4 rounded-xl mb-5 ${meta.bg} border ${meta.border}`}>
        <div className="flex items-start gap-3">
          <span className="text-3xl">{meta.emoji}</span>
          <div>
            <div className={`text-xs font-semibold uppercase tracking-wider mb-1 ${meta.text}`}>
              {meta.label}
            </div>
            <p className="text-white font-bold text-lg leading-tight">
              {record.diagnosis || record.vaccinations?.map(v => v.vaccineName).join(', ') || 'No diagnosis'}
            </p>
            <p className="text-gray-400 text-xs mt-1">
              {formatDate(record.visitDate)}
              {record.vet && ` · Dr. ${record.vet.name}`}
              {record.vet?.specialization && ` (${record.vet.specialization})`}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <button onClick={onEdit}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm
              border border-white/10 text-gray-400 hover:text-primary-400
              hover:border-primary-500/40 hover:bg-primary-500/10 transition-all">
            ✏️
          </button>
          <button onClick={onDelete} disabled={isDeleting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm
              border border-white/10 text-gray-400 hover:text-red-400
              hover:border-red-500/40 hover:bg-red-500/10 transition-all disabled:opacity-40">
            {isDeleting
              ? <span className="w-3.5 h-3.5 border-2 border-red-400/40 border-t-red-400 rounded-full animate-spin" />
              : '🗑️'}
          </button>
        </div>
      </div>

      {/* Clinical sections */}
      <SymptomChips   symptoms={record.symptoms} />
      <PrescriptionList prescriptions={record.prescriptions} />
      <VaccinationList  vaccinations={record.vaccinations} />
      <LabResults       labResults={record.labResults} />

      {/* Treatment & notes */}
      {record.treatment && (
        <div className="mb-6">
          <SectionTitle icon="🩺">Treatment Plan</SectionTitle>
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 text-sm text-gray-300 leading-relaxed">
            {record.treatment}
          </div>
        </div>
      )}

      {record.notes && (
        <div className="mb-6">
          <SectionTitle icon="📝">Additional Notes</SectionTitle>
          <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-gray-400 leading-relaxed">
            {record.notes}
          </div>
        </div>
      )}

      {/* Follow-up */}
      {record.followUpDate && (
        <div className="mb-6">
          <SectionTitle icon="📅">Follow-up Date</SectionTitle>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-white text-sm font-semibold">{formatDate(record.followUpDate)}</p>
              {(() => {
                const d = daysUntil(record.followUpDate);
                return (
                  <p className={`text-xs ${d < 0 ? 'text-red-400' : d <= 7 ? 'text-amber-400' : 'text-gray-500'}`}>
                    {d < 0 ? `${Math.abs(d)} days overdue` : d === 0 ? 'Today!' : `In ${d} days`}
                  </p>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      <DocumentLinks documents={record.documents} />

      {/* Provenance row */}
      <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-600">
        <span>
          Logged by: <span className="text-gray-400">{record.addedBy === 'veterinarian' ? '🩺 Veterinarian' : '👤 Pet Owner'}</span>
        </span>
        {record.createdAt && (
          <span>Created {formatDate(record.createdAt)}</span>
        )}
      </div>
    </div>
  );
}
