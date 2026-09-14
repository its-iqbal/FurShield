/**
 * components/health/HealthTimeline.jsx
 * Renders the full vertical timeline, grouped by year.
 * Each entry shows a coloured dot, date, type badge, diagnosis snippet.
 * Clicking an entry calls onSelect to open the detail view.
 */
import { useState } from 'react';
import { getVisitMeta, formatDate, formatDateShort } from './healthConfig.js';

// ── Individual timeline entry ─────────────────────────────────────────────────
function TimelineEntry({ record, isSelected, onSelect, isLast }) {
  const meta = getVisitMeta(record.visitType);

  return (
    <div className="relative flex gap-5 group">

      {/* Vertical connecting line */}
      <div className="flex flex-col items-center flex-shrink-0">
        {/* Dot */}
        <button
          onClick={() => onSelect(record)}
          id={`timeline-entry-${record._id}`}
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10
            border-2 transition-all duration-300 flex-shrink-0
            ${isSelected
              ? `${meta.dot} border-transparent shadow-lg ${meta.glow} scale-110`
              : `bg-gray-900 border-white/20 group-hover:${meta.border} group-hover:scale-105`
            }`}
          title={meta.label}
        >
          {meta.emoji}
        </button>
        {/* Connecting line */}
        {!isLast && (
          <div className="w-px flex-1 min-h-[2.5rem] bg-gradient-to-b from-white/10 to-white/5 mt-1" />
        )}
      </div>

      {/* Card */}
      <div
        className={`flex-1 mb-6 cursor-pointer rounded-2xl border p-4 transition-all duration-300
          hover:scale-[1.01] hover:shadow-lg
          ${isSelected
            ? `${meta.bg} ${meta.border} shadow-lg ${meta.glow}`
            : 'bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20'
          }`}
        onClick={() => onSelect(record)}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center flex-wrap gap-2">
            {/* Type badge */}
            <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold
              border ${meta.bg} ${meta.border} ${meta.text}`}>
              {meta.emoji} {meta.label}
            </span>
            {/* Added-by badge */}
            <span className={`text-xs px-2 py-0.5 rounded-full
              ${record.addedBy === 'veterinarian'
                ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                : 'bg-gray-700/40 text-gray-500 border border-white/5'
              }`}>
              {record.addedBy === 'veterinarian' ? '🩺 Vet logged' : '👤 Self logged'}
            </span>
          </div>
          {/* Date */}
          <time className="text-xs text-gray-500 flex-shrink-0 mt-0.5">
            {formatDate(record.visitDate)}
          </time>
        </div>

        {/* Vet name */}
        {record.vet && (
          <p className="text-xs text-gray-500 mb-2">
            Dr. {record.vet?.name ?? 'Unknown'} · {record.vet?.specialization ?? ''}
          </p>
        )}

        {/* Diagnosis */}
        {record.diagnosis ? (
          <p className="text-sm text-white font-medium leading-snug line-clamp-2">
            {record.diagnosis}
          </p>
        ) : record.visitType === 'vaccination' && record.vaccinations?.length > 0 ? (
          <p className="text-sm text-white font-medium">
            {record.vaccinations.map((v) => v.vaccineName).join(', ')}
          </p>
        ) : (
          <p className="text-sm text-gray-600 italic">No diagnosis recorded</p>
        )}

        {/* Quick pills row */}
        <div className="flex flex-wrap gap-2 mt-3">
          {record.symptoms?.length > 0 && (
            <span className="text-xs text-gray-500 bg-gray-800/60 px-2 py-0.5 rounded-md">
              🤒 {record.symptoms.length} symptom{record.symptoms.length > 1 ? 's' : ''}
            </span>
          )}
          {record.prescriptions?.length > 0 && (
            <span className="text-xs text-gray-500 bg-gray-800/60 px-2 py-0.5 rounded-md">
              💊 {record.prescriptions.length} prescription{record.prescriptions.length > 1 ? 's' : ''}
            </span>
          )}
          {record.vaccinations?.length > 0 && (
            <span className="text-xs text-green-500/80 bg-green-500/10 px-2 py-0.5 rounded-md">
              💉 {record.vaccinations.length} vaccine{record.vaccinations.length > 1 ? 's' : ''}
            </span>
          )}
          {record.labResults?.testName && (
            <span className="text-xs text-yellow-500/80 bg-yellow-500/10 px-2 py-0.5 rounded-md">
              🧪 Lab results
            </span>
          )}
          {record.followUpDate && (
            <span className="text-xs text-purple-400/80 bg-purple-500/10 px-2 py-0.5 rounded-md">
              📅 Follow-up: {formatDateShort(record.followUpDate)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Year separator ────────────────────────────────────────────────────────────
function YearBadge({ year }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <span className="text-2xl font-black gradient-text">{year}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
    </div>
  );
}

// ── Empty timeline ────────────────────────────────────────────────────────────
function EmptyTimeline({ onAdd }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
      <div className="text-7xl mb-5 opacity-40">📋</div>
      <h3 className="text-xl font-bold text-white mb-2">No health records yet</h3>
      <p className="text-gray-500 text-sm mb-6 max-w-xs">
        Start building your pet's medical history by adding the first health record.
      </p>
      <button onClick={onAdd} className="btn-primary text-sm">
        + Add First Record
      </button>
    </div>
  );
}

// ── Skeleton ──────────────────────────────────────────────────────────────────
function TimelineSkeleton() {
  return (
    <div className="space-y-1">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-5 animate-pulse">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
            {i < 3 && <div className="w-px flex-1 min-h-10 bg-white/5 mt-1" />}
          </div>
          <div className="flex-1 mb-6 bg-white/5 rounded-2xl p-4">
            <div className="flex gap-2 mb-3">
              <div className="h-5 w-24 rounded-full bg-white/10" />
              <div className="h-5 w-20 rounded-full bg-white/5" />
            </div>
            <div className="h-4 w-3/4 rounded bg-white/10 mb-2" />
            <div className="h-4 w-1/2 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Main HealthTimeline ───────────────────────────────────────────────────────
export default function HealthTimeline({
  recordsByYear,
  sortedYears,
  loading,
  activeRecord,
  onSelectRecord,
  onAdd,
  filterType,
}) {
  if (loading) return <TimelineSkeleton />;

  const allEmpty = sortedYears.length === 0;
  if (allEmpty) return <EmptyTimeline onAdd={onAdd} />;

  return (
    <div>
      {sortedYears.map((year) => {
        const yearRecords = (recordsByYear[year] ?? [])
          .filter((r) => !filterType || r.visitType === filterType)
          .sort((a, b) => new Date(b.visitDate) - new Date(a.visitDate));

        if (yearRecords.length === 0) return null;

        return (
          <div key={year} className="mb-4">
            <YearBadge year={year} />
            {yearRecords.map((record, idx) => (
              <TimelineEntry
                key={record._id}
                record={record}
                isSelected={activeRecord?._id === record._id}
                onSelect={onSelectRecord}
                isLast={idx === yearRecords.length - 1}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}
