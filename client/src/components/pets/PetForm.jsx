/**
 * components/pets/PetForm.jsx
 * Add / Edit pet form rendered inside a Modal.
 * All fields from the Pet schema are covered.
 */
import { useState, useEffect } from 'react';

// ── Constants ─────────────────────────────────────────────────────────────────
const SPECIES = [
  { value: 'dog',     label: 'Dog',     emoji: '🐕' },
  { value: 'cat',     label: 'Cat',     emoji: '🐱' },
  { value: 'bird',    label: 'Bird',    emoji: '🦜' },
  { value: 'rabbit',  label: 'Rabbit',  emoji: '🐰' },
  { value: 'reptile', label: 'Reptile', emoji: '🦎' },
  { value: 'fish',    label: 'Fish',    emoji: '🐠' },
  { value: 'other',   label: 'Other',   emoji: '🐾' },
];

const GENDERS = ['male', 'female', 'unknown'];

const DEFAULT_FORM = {
  name: '', species: '', breed: '', age: '', gender: 'unknown',
  weight: '', color: '', dob: '', microchipId: '',
  isNeutered: false, allergies: '', medicalHistory: '',
};

// ── Small field atoms ─────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-300">
        {label} {required && <span className="text-primary-400">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-gray-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white
        placeholder-gray-600 text-sm focus:outline-none focus:border-primary-500/60
        focus:ring-2 focus:ring-primary-500/20 transition-all duration-200"
      {...props}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className="w-full bg-gray-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white
        placeholder-gray-600 text-sm focus:outline-none focus:border-primary-500/60
        focus:ring-2 focus:ring-primary-500/20 transition-all duration-200 resize-none"
    />
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// ── Main PetForm ──────────────────────────────────────────────────────────────
export default function PetForm({ initialData = null, onSubmit, onCancel, isLoading }) {
  const isEditing = !!initialData;

  const [form, setForm]   = useState(DEFAULT_FORM);
  const [errors, setErrs] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (initialData) {
      setForm({
        name:          initialData.name          ?? '',
        species:       initialData.species        ?? '',
        breed:         initialData.breed          ?? '',
        age:           initialData.age?.toString() ?? '',
        gender:        initialData.gender         ?? 'unknown',
        weight:        initialData.weight?.toString() ?? '',
        color:         initialData.color          ?? '',
        dob:           initialData.dob ? initialData.dob.slice(0, 10) : '',
        microchipId:   initialData.microchipId   ?? '',
        isNeutered:    initialData.isNeutered     ?? false,
        allergies:     (initialData.allergies ?? []).join(', '),
        medicalHistory:initialData.medicalHistory ?? '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrs({});
  }, [initialData]);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Pet name is required';
    if (!form.species)        e.species = 'Please select a species';
    if (form.age && isNaN(Number(form.age)))    e.age    = 'Age must be a number';
    if (form.weight && isNaN(Number(form.weight))) e.weight = 'Weight must be a number';
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name:           form.name.trim(),
      species:        form.species,
      breed:          form.breed.trim() || undefined,
      age:            form.age   ? Number(form.age)    : undefined,
      gender:         form.gender,
      weight:         form.weight ? Number(form.weight) : undefined,
      color:          form.color.trim()       || undefined,
      dob:            form.dob                || undefined,
      microchipId:    form.microchipId.trim() || undefined,
      isNeutered:     form.isNeutered,
      allergies:      form.allergies
        ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      medicalHistory: form.medicalHistory.trim() || undefined,
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* ── Basic Info ── */}
      <SectionTitle>Basic Information</SectionTitle>

      {/* Species selector */}
      <Field label="Species" required error={errors.species}>
        <div className="grid grid-cols-4 gap-2 mt-1">
          {SPECIES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setForm((p) => ({ ...p, species: s.value }))}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center
                transition-all duration-200 hover:scale-105
                ${form.species === s.value
                  ? 'border-primary-500/70 bg-primary-500/20 text-white shadow-lg shadow-primary-500/10'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
            >
              <span className="text-xl">{s.emoji}</span>
              <span className="text-xs font-medium">{s.label}</span>
            </button>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <Field label="Pet Name" required error={errors.name}>
          <TextInput value={form.name} onChange={set('name')} placeholder="Buddy, Luna, Max…" />
        </Field>

        <Field label="Breed">
          <TextInput value={form.breed} onChange={set('breed')} placeholder="e.g. Golden Retriever" />
        </Field>

        <Field label="Age (years)" error={errors.age}>
          <TextInput value={form.age} onChange={set('age')} placeholder="e.g. 3" type="number" min="0" step="0.5" />
        </Field>

        <Field label="Date of Birth">
          <TextInput value={form.dob} onChange={set('dob')} type="date" />
        </Field>

        <Field label="Weight (kg)" error={errors.weight}>
          <TextInput value={form.weight} onChange={set('weight')} placeholder="e.g. 8.5" type="number" min="0" step="0.1" />
        </Field>

        <Field label="Color / Markings">
          <TextInput value={form.color} onChange={set('color')} placeholder="e.g. Golden brown" />
        </Field>
      </div>

      {/* Gender */}
      <Field label="Gender" error={errors.gender}>
        <div className="flex gap-2 mt-1">
          {GENDERS.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setForm((p) => ({ ...p, gender: g }))}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium border capitalize transition-all duration-200
                ${form.gender === g
                  ? 'border-primary-500/70 bg-primary-500/20 text-white'
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}
            >
              {g === 'male' ? '♂ Male' : g === 'female' ? '♀ Female' : '— Unknown'}
            </button>
          ))}
        </div>
      </Field>

      {/* ── Health Info ── */}
      <SectionTitle>Health Details</SectionTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Microchip ID">
          <TextInput value={form.microchipId} onChange={set('microchipId')} placeholder="15-digit chip number" />
        </Field>

        <Field label="">
          <label className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 cursor-pointer hover:border-white/20 transition-all mt-6">
            <input
              type="checkbox"
              checked={form.isNeutered}
              onChange={set('isNeutered')}
              className="w-4 h-4 accent-primary-500"
            />
            <span className="text-sm text-gray-300">Spayed / Neutered ✂️</span>
          </label>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Allergies (comma-separated)">
          <TextInput
            value={form.allergies}
            onChange={set('allergies')}
            placeholder="e.g. pollen, chicken, dairy"
          />
          <p className="text-xs text-gray-600 mt-1">Separate multiple allergies with commas.</p>
        </Field>
      </div>

      <div className="mt-4">
        <Field label="Medical History Overview">
          <Textarea
            value={form.medicalHistory}
            onChange={set('medicalHistory')}
            placeholder="Brief overview of past conditions, surgeries, or ongoing issues…"
            rows={3}
          />
        </Field>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-6 mt-2 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          className="btn-outline flex-shrink-0 px-5 py-2.5 text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary flex-1 justify-center text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isLoading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            : isEditing ? '✓ Save Changes' : '🐾 Add Pet'
          }
        </button>
      </div>
    </form>
  );
}
