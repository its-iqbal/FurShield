/**
 * components/health/HealthRecordDetail.jsx
 * Expanded detail panel for a single health record.
 * Shows: diagnosis, symptoms, prescriptions, vaccinations, lab results, notes, documents.
 */
import { getVisitMeta, formatDate, formatDateShort, daysUntil } from './healthConfig.js';

// ── Tiny atoms ────────────────────────────────────────────────────────────────
function SectionTitle({ icon, children }) {
  return (
    <h4 className="flex items-center gap-2 text-xs font-semibold text-muted uppercase tracking-widest mb-3">
      <span>{icon}</span>
      {children}
    </h4>
  );
}

function InfoRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2 border-b border-[#E8E2D9] last:border-0">
      <span className="text-xs text-subtle w-28 flex-shrink-0 mt-0.5">{label}</span>
      <span className="text-sm text-body flex-1 leading-snug">{value}</span>
    </div>
  );
}

// ── Prescription table ────────────────────────────────────────────────────────
function PrescriptionList({ prescriptions }) {
  if (!prescriptions?.length) return null;
  return (
    <div className="mb-6">
      <SectionTitle icon="💊">Prescriptions</SectionTitle>
      <div className="overflow-x-auto rounded-xl border border-[#E8E2D9]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#E8E2D9] bg-primary-50">
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider">Medication</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider">Dosage</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider">Duration</th>
              <th className="text-left px-4 py-2.5 text-xs font-semibold text-muted uppercase tracking-wider">Notes</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.map((p, i) => (
              <tr key={i} className="border-b border-[#E8E2D9] last:border-0 hover:bg-primary-50 transition-colors">
                <td className="px-4 py-3 text-body font-medium">{p.medicationName}</td>
                <td className="px-4 py-3 text-body">{p.dosage || '—'}</td>
                <td className="px-4 py-3 text-body">{p.duration || '—'}</td>
                <td className="px-4 py-3 text-muted text-xs">{p.notes || '—'}</td>
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
                border border-primary-200 gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <span className="text-xl">💉</span>
                <div>
                  <p className="text-sm font-semibold text-strong">{v.vaccineName}</p>
                  <p className="text-xs text-muted">
                    Given: {v.dateGiven ? formatDate(v.dateGiven) : '—'}
                    {v.batchNumber && ` · Batch: ${v.batchNumber}`}
                  </p>
                </div>
              </div>
              {v.nextDueDate && (
                <span className={`text-xs px-3 py-1 rounded-full font-medium flex-shrink-0
                  ${overdue ? 'bg-red-500/20 text-[#8C4238] border border-red-500/30'
                  : dueSoon  ? 'bg-amber-500/20 text-amber-300 border border-accent-400'
                  :            'bg-primary-50 text-primary-600 border border-primary-200'
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
      <div className="bg-yellow-500/5 border border-[#E3D0A8] rounded-xl p-4">
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
            className="text-xs px-3 py-1.5 rounded-full bg-accent-400/15
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
            className="flex items-center gap-3 p-3 rounded-xl bg-primary-50 border border-[#E8E2D9]
              hover:border-primary-500/40 hover:bg-primary-500/5 transition-all duration-200 group text-sm">
            <span className="text-lg">📁</span>
            <span className="text-primary-400 group-hover:underline truncate flex-1">{url}</span>
            <span className="text-subtle text-xs flex-shrink-0">↗</span>
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
            <p className="text-strong font-bold text-lg leading-tight">
              {record.diagnosis || record.vaccinations?.map(v => v.vaccineName).join(', ') || 'No diagnosis'}
            </p>
            <p className="text-muted text-xs mt-1">
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
              border border-[#E8E2D9] text-muted hover:text-primary-400
              hover:border-primary-500/40 hover:bg-primary-500/10 transition-all">
            ✏️
          </button>
          <button onClick={onDelete} disabled={isDeleting}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm
              border border-[#E8E2D9] text-muted hover:text-[#8C4238]
              hover:border-red-500/40 hover:bg-[#F4EBE8] transition-all disabled:opacity-40">
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
          <div className="bg-blue-500/5 border border-blue-500/15 rounded-xl p-4 text-sm text-body leading-relaxed">
            {record.treatment}
          </div>
        </div>
      )}

      {record.notes && (
        <div className="mb-6">
          <SectionTitle icon="📝">Additional Notes</SectionTitle>
          <div className="bg-primary-50 border border-[#E8E2D9] rounded-xl p-4 text-sm text-muted leading-relaxed">
            {record.notes}
          </div>
        </div>
      )}

      {/* Follow-up */}
      {record.followUpDate && (
        <div className="mb-6">
          <SectionTitle icon="📅">Follow-up Date</SectionTitle>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#E8F0F5] border border-info-400">
            <span className="text-xl">📅</span>
            <div>
              <p className="text-strong text-sm font-semibold">{formatDate(record.followUpDate)}</p>
              {(() => {
                const d = daysUntil(record.followUpDate);
                return (
                  <p className={`text-xs ${d < 0 ? 'text-[#8C4238]' : d <= 7 ? 'text-accent-600' : 'text-muted'}`}>
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
      <div className="pt-4 border-t border-[#E8E2D9] flex items-center justify-between text-xs text-subtle">
        <span>
          Logged by: <span className="text-muted">{record.addedBy === 'veterinarian' ? '🩺 Veterinarian' : '👤 Pet Owner'}</span>
        </span>
        {record.createdAt && (
          <span>Created {formatDate(record.createdAt)}</span>
        )}
      </div>
    </div>
  );
}
