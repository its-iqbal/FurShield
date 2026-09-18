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
  image: '',
};

const SAMPLE_AVATARS = [
  { label: 'Golden Retriever', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600&auto=format&fit=crop&q=80' },
  { label: 'Persian Cat', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80' },
  { label: 'Beagle', url: 'https://images.unsplash.com/photo-1505628346881-b72b27e84530?w=600&auto=format&fit=crop&q=80' },
  { label: 'Orange Cat', url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&auto=format&fit=crop&q=80' },
  { label: 'Parrot', url: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&auto=format&fit=crop&q=80' },
  { label: 'Bunny', url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=600&auto=format&fit=crop&q=80' },
];

// ── Small field atoms ─────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-body">
        {label} {required && <span className="text-[#8C4238] font-bold">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-[#8C4238] flex items-center gap-1 mt-0.5">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
}

function TextInput({ value, onChange, placeholder, type = 'text', error, ...props }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full rounded-xl px-4 py-2.5 text-body text-sm placeholder-[#8A8279] transition-all duration-200 focus:outline-none focus:ring-2 ${
        error
          ? 'border border-[#B87A74] bg-[#FDF7F7] focus:border-[#8C4238] focus:ring-[#8C4238]/20'
          : 'border border-[#E8E2D9] bg-white focus:border-primary-500 focus:ring-primary-500/20'
      }`}
      {...props}
    />
  );
}

function Textarea({ value, onChange, placeholder, rows = 3, error, ...props }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full rounded-xl px-4 py-2.5 text-body text-sm placeholder-[#8A8279] transition-all duration-200 resize-none focus:outline-none focus:ring-2 ${
        error
          ? 'border border-[#B87A74] bg-[#FDF7F7] focus:border-[#8C4238] focus:ring-[#8C4238]/20'
          : 'border border-[#E8E2D9] bg-white focus:border-primary-500 focus:ring-primary-500/20'
      }`}
      {...props}
    />
  );
}

function SectionTitle({ children }) {
  return (
    <div className="flex items-center gap-3 mb-4 mt-6 first:mt-0">
      <div className="flex-1 h-px bg-[#E8E2D9]" />
      <span className="text-xs font-semibold text-muted uppercase tracking-widest whitespace-nowrap">
        {children}
      </span>
      <div className="flex-1 h-px bg-[#E8E2D9]" />
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
        image:         initialData.images?.[0] ?? '',
      });
    } else {
      setForm(DEFAULT_FORM);
    }
    setErrs({});
  }, [initialData]);

  const set = (field) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [field]: val }));
    if (errors[field]) {
      setErrs((p) => {
        const next = { ...p };
        delete next[field];
        return next;
      });
    }
  };

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    const nameTrim = form.name.trim();
    if (!nameTrim) {
      e.name = 'Pet name is required';
    } else if (nameTrim.length < 2) {
      e.name = 'Pet name must be at least 2 characters';
    }

    if (!form.species) {
      e.species = 'Please select a species';
    }

    if (form.age !== '') {
      const numAge = Number(form.age);
      if (isNaN(numAge) || numAge < 0 || numAge > 50) {
        e.age = 'Age must be a valid number between 0 and 50';
      }
    }

    if (form.weight !== '') {
      const numWeight = Number(form.weight);
      if (isNaN(numWeight) || numWeight <= 0 || numWeight > 300) {
        e.weight = 'Weight must be a positive number in kg (e.g. 14.5)';
      }
    }

    if (form.dob) {
      const parsedDob = new Date(form.dob);
      if (parsedDob > new Date()) {
        e.dob = 'Date of birth cannot be in the future';
      }
    }

    if (form.image && form.image.trim()) {
      if (!/^https?:\/\/.+/i.test(form.image.trim())) {
        e.image = 'Image URL must start with http:// or https://';
      }
    }

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
      images:         form.image ? [form.image.trim()] : [],
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* ── Pet Photo ── */}
      <SectionTitle>Pet Photo</SectionTitle>
      <div className="mb-5 p-4 rounded-xl border border-[#E8E2D9] bg-primary-50/50 flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-20 h-20 rounded-2xl bg-white border border-[#E8E2D9] flex items-center justify-center text-4xl overflow-hidden flex-shrink-0 shadow-inner">
          {form.image ? (
            <img src={form.image} alt="Pet Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
          ) : (
            <span>{SPECIES.find(s => s.value === form.species)?.emoji || '🐾'}</span>
          )}
        </div>
        <div className="flex-1 w-full space-y-2">
          <label className="text-xs font-semibold text-body block">Photo URL</label>
          <div className="flex gap-2">
            <input
              type="url"
              value={form.image}
              onChange={(e) => setForm(p => ({ ...p, image: e.target.value }))}
              placeholder="Paste image URL (https://...)"
              className={`flex-1 rounded-xl px-3 py-2 text-xs text-body placeholder-[#8A8279] focus:outline-none transition-all ${
                errors.image
                  ? 'border border-[#B87A74] bg-[#FDF7F7] focus:border-[#8C4238]'
                  : 'bg-white border border-[#E8E2D9] focus:border-primary-500'
              }`}
            />
            {form.image && (
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, image: '' }))}
                className="px-2.5 py-1 text-xs text-[#8C4238] border border-red-200 rounded-xl hover:bg-red-50"
              >
                Clear
              </button>
            )}
          </div>
          {errors.image && (
            <p className="text-xs text-[#8C4238] flex items-center gap-1 mt-1">
              <span>⚠️</span> {errors.image}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[11px] text-muted">Or quick preset:</span>
            {SAMPLE_AVATARS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => {
                  setForm(p => ({ ...p, image: s.url }));
                  if (errors.image) setErrs(p => { const next = { ...p }; delete next.image; return next; });
                }}
                className="text-[10px] px-2 py-0.5 rounded-lg bg-white border border-[#E8E2D9] text-body hover:border-primary-500 hover:text-primary-700 transition-all"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Basic Info ── */}
      <SectionTitle>Basic Information</SectionTitle>

      {/* Species selector */}
      <Field label="Species" required error={errors.species}>
        <div className="grid grid-cols-4 gap-2 mt-1">
          {SPECIES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => {
                setForm((p) => ({ ...p, species: s.value }));
                if (errors.species) setErrs(p => { const next = { ...p }; delete next.species; return next; });
              }}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center
                transition-all duration-200 hover:scale-105
                ${form.species === s.value
                  ? 'border-primary-500/70 bg-primary-500/20 text-body shadow-warm-sm'
                  : 'border-[#E8E2D9] bg-primary-50 text-muted hover:border-warm-md'
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
          <TextInput value={form.name} onChange={set('name')} placeholder="Buddy, Luna, Max…" error={errors.name} />
        </Field>

        <Field label="Breed">
          <TextInput value={form.breed} onChange={set('breed')} placeholder="e.g. Golden Retriever" />
        </Field>

        <Field label="Age (years)" error={errors.age}>
          <TextInput value={form.age} onChange={set('age')} placeholder="e.g. 3" type="number" min="0" step="0.5" error={errors.age} />
        </Field>

        <Field label="Date of Birth" error={errors.dob}>
          <TextInput value={form.dob} onChange={set('dob')} type="date" error={errors.dob} />
        </Field>

        <Field label="Weight (kg)" error={errors.weight}>
          <TextInput value={form.weight} onChange={set('weight')} placeholder="e.g. 8.5" type="number" min="0" step="0.1" error={errors.weight} />
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
                  ? 'border-primary-500 bg-primary-100 text-primary-900 font-semibold shadow-sm'
                  : 'border-[#E8E2D9] bg-primary-50 text-muted hover:border-warm-md hover:text-body'
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
          <label className="flex items-center gap-3 p-3 rounded-xl border border-[#E8E2D9] bg-primary-50 cursor-pointer hover:border-warm-md transition-all mt-6">
            <input
              type="checkbox"
              checked={form.isNeutered}
              onChange={set('isNeutered')}
              className="w-4 h-4 accent-primary-500"
            />
            <span className="text-sm text-body">Spayed / Neutered ✂️</span>
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
          <p className="text-xs text-subtle mt-1">Separate multiple allergies with commas.</p>
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
      <div className="flex gap-3 pt-6 mt-2 border-t border-[#E8E2D9]">
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
