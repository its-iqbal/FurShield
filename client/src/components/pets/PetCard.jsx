/**
 * components/pets/PetCard.jsx
 * Compact card shown in the pet tab strip and as the active detail view.
 */

export const SPECIES_META = {
  dog:     { emoji: '🐕', color: 'from-amber-500/20  border-amber-500/30'   },
  cat:     { emoji: '🐱', color: 'from-purple-500/20 border-purple-500/30'  },
  bird:    { emoji: '🦜', color: 'from-green-500/20  border-green-500/30'   },
  rabbit:  { emoji: '🐰', color: 'from-pink-500/20   border-pink-500/30'    },
  reptile: { emoji: '🦎', color: 'from-teal-500/20   border-teal-500/30'    },
  fish:    { emoji: '🐠', color: 'from-blue-500/20   border-blue-500/30'    },
  other:   { emoji: '🐾', color: 'from-gray-500/20   border-gray-500/30'    },
};

function Badge({ children, color = 'gray' }) {
  const colorMap = {
    gray:    'bg-gray-700/60 text-gray-300',
    primary: 'bg-primary-500/20 text-primary-300',
    green:   'bg-green-500/20 text-green-300',
    red:     'bg-red-500/20 text-red-300',
    yellow:  'bg-yellow-500/20 text-yellow-300',
  };
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${colorMap[color]}`}>
      {children}
    </span>
  );
}

/** Tab button in the pets strip */
export function PetTab({ pet, isActive, onClick }) {
  const meta = SPECIES_META[pet.species] ?? SPECIES_META.other;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-sm font-medium
        transition-all duration-200 whitespace-nowrap flex-shrink-0
        ${isActive
          ? `bg-gradient-to-br ${meta.color} border text-white shadow-lg`
          : 'border-white/5 bg-white/5 text-gray-400 hover:border-white/15 hover:text-gray-200'
        }`}
    >
      <span className="text-xl">{meta.emoji}</span>
      <span>{pet.name}</span>
      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary-400 ml-1" />}
    </button>
  );
}

/** Full detail card for the active/selected pet */
export function PetDetailCard({ pet, onEdit, onDelete }) {
  const meta = SPECIES_META[pet.species] ?? SPECIES_META.other;

  const infoItems = [
    { label: 'Species',   value: pet.species   ? pet.species.charAt(0).toUpperCase() + pet.species.slice(1) : '—' },
    { label: 'Breed',     value: pet.breed      || '—' },
    { label: 'Age',       value: pet.age != null ? `${pet.age} yr${pet.age !== 1 ? 's' : ''}` : '—' },
    { label: 'Gender',    value: pet.gender     || '—' },
    { label: 'Weight',    value: pet.weight != null ? `${pet.weight} kg` : '—' },
    { label: 'Color',     value: pet.color      || '—' },
    { label: 'Microchip', value: pet.microchipId || '—' },
    { label: 'DOB',       value: pet.dob ? new Date(pet.dob).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' }) : '—' },
  ];

  return (
    <div className={`glass-card p-6 bg-gradient-to-br ${meta.color} border animate-fade-in`}>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-gray-900/60 flex items-center justify-center text-5xl
            border border-white/10 shadow-inner flex-shrink-0">
            {pet.images?.[0]
              ? <img src={pet.images[0]} alt={pet.name} className="w-full h-full object-cover rounded-2xl" />
              : meta.emoji
            }
          </div>
          <div>
            <h2 className="text-3xl font-black text-white">{pet.name}</h2>
            <p className="text-gray-400 text-sm capitalize mt-0.5">
              {pet.species} {pet.breed ? `· ${pet.breed}` : ''}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {pet.isNeutered && <Badge color="green">✂️ Neutered</Badge>}
              {pet.allergies?.length > 0 && (
                <Badge color="red">⚠️ {pet.allergies.length} Allerg{pet.allergies.length > 1 ? 'ies' : 'y'}</Badge>
              )}
              {pet.insurance?.policyNumber && <Badge color="primary">🛡️ Insured</Badge>}
              {(pet.documents?.length ?? 0) > 0 && (
                <Badge color="yellow">📄 {pet.documents.length} Doc{pet.documents.length > 1 ? 's' : ''}</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onEdit}
            id={`edit-pet-${pet._id}`}
            title="Edit pet"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400
              border border-white/10 hover:border-primary-500/50 hover:text-primary-400
              hover:bg-primary-500/10 transition-all duration-200 text-sm"
          >
            ✏️
          </button>
          <button
            onClick={onDelete}
            id={`delete-pet-${pet._id}`}
            title="Remove pet"
            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400
              border border-white/10 hover:border-red-500/50 hover:text-red-400
              hover:bg-red-500/10 transition-all duration-200 text-sm"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {infoItems.map((item) => (
          <div key={item.label} className="bg-gray-900/50 rounded-xl p-3 border border-white/5">
            <p className="text-gray-500 text-xs mb-1">{item.label}</p>
            <p className="text-white text-sm font-medium capitalize truncate">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Allergies */}
      {pet.allergies?.length > 0 && (
        <div className="mb-4">
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Known Allergies</p>
          <div className="flex flex-wrap gap-2">
            {pet.allergies.map((a) => (
              <span key={a} className="text-xs px-3 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/20 capitalize">
                ⚠️ {a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Medical history */}
      {pet.medicalHistory && (
        <div>
          <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wider">Medical History</p>
          <p className="text-sm text-gray-300 bg-gray-900/50 rounded-xl p-4 border border-white/5 leading-relaxed">
            {pet.medicalHistory}
          </p>
        </div>
      )}

      {/* Quick actions bar */}
      <div className="grid grid-cols-3 gap-3 mt-6 pt-5 border-t border-white/10">
        {[
          { icon: '📋', label: 'Health Records', id: `health-records-btn-${pet._id}` },
          { icon: '🩺', label: 'Book Appointment', id: `book-appt-btn-${pet._id}` },
          { icon: '📁', label: 'Documents', id: `documents-btn-${pet._id}` },
        ].map((action) => (
          <button
            key={action.label}
            id={action.id}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/10
              bg-white/5 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 group"
          >
            <span className="text-2xl group-hover:scale-110 transition-transform duration-200">
              {action.icon}
            </span>
            <span className="text-xs text-gray-400 text-center leading-tight">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
