/**
 * components/appointments/BookingWizard.jsx
 * 4-step appointment booking flow:
 *   Step 1 → Select Pet
 *   Step 2 → Search & Select Vet
 *   Step 3 → Pick Date & Time
 *   Step 4 → Details + Confirm
 *   (Step 5) → Success screen
 */
import { useState } from 'react';
import VetSearchPanel from './VetSearchPanel.jsx';
import SlotPicker from './SlotPicker.jsx';

const SPECIES_EMOJI = { dog:'🐕', cat:'🐱', bird:'🦜', rabbit:'🐰', reptile:'🦎', fish:'🐠', other:'🐾' };

// ── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ step, total }) {
  const labels = ['Pet', 'Vet', 'Schedule', 'Details'];
  return (
    <div className="flex items-center gap-1 mb-8">
      {labels.map((label, i) => {
        const n = i + 1;
        const done    = n < step;
        const current = n === step;
        return (
          <div key={label} className="flex items-center gap-1 flex-1">
            <div className={`flex flex-col items-center gap-1 flex-shrink-0`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                transition-all duration-300
                ${done    ? 'bg-primary-500 text-white'
                : current ? 'bg-primary-500/20 border-2 border-primary-500 text-primary-400'
                :           'bg-primary-50 border border-[#E8E2D9] text-subtle'
                }`}>
                {done ? '✓' : n}
              </div>
              <span className={`text-xs whitespace-nowrap transition-colors duration-300
                ${current ? 'text-primary-400 font-medium' : done ? 'text-muted' : 'text-gray-700'}`}>
                {label}
              </span>
            </div>
            {i < labels.length - 1 && (
              <div className={`flex-1 h-px mb-5 transition-all duration-500
                ${done ? 'bg-primary-500' : 'bg-[#E8E2D9]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Step 1: Pet selection ─────────────────────────────────────────────────────
function StepPet({ pets, selectedPet, onSelect, onNext }) {
  return (
    <div>
      <p className="text-muted text-sm mb-4">Who is this appointment for?</p>

      <div className="space-y-3 mb-6">
        {pets.map((pet) => (
          <button
            key={pet._id}
            type="button"
            id={`wizard-pet-${pet._id}`}
            onClick={() => onSelect(pet)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left
              transition-all duration-200
              ${selectedPet?._id === pet._id
                ? 'border-primary-500/60 bg-primary-500/15 shadow-sm'
                : 'bg-primary-50 border-[#E8E2D9] hover:bg-white/[0.08] hover:border-warm-md'
              }`}
          >
            <div className="w-12 h-12 rounded-xl [#EEEAE4] flex items-center justify-center text-2xl border border-[#E8E2D9] flex-shrink-0">
              {SPECIES_EMOJI[pet.species] ?? '🐾'}
            </div>
            <div className="flex-1">
              <p className="text-strong font-bold">{pet.name}</p>
              <p className="text-muted text-xs capitalize">
                {pet.species}{pet.breed ? ` · ${pet.breed}` : ''}{pet.age ? ` · ${pet.age}yr` : ''}
              </p>
              {pet.allergies?.length > 0 && (
                <p className="text-[#8C4238]/80 text-xs mt-1">⚠️ {pet.allergies.join(', ')}</p>
              )}
            </div>
            {selectedPet?._id === pet._id && (
              <span className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center text-body text-xs flex-shrink-0">✓</span>
            )}
          </button>
        ))}
      </div>

      <button
        type="button"
        id="wizard-next-step2"
        disabled={!selectedPet}
        onClick={onNext}
        className="btn-primary w-full justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        Continue → Select Vet
      </button>
    </div>
  );
}

// ── Step 2: Vet search ────────────────────────────────────────────────────────
function StepVet({ selectedVet, onSelect, onBack, onNext }) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-black text-body mb-1">Choose a Veterinarian</h2>
      <p className="text-muted text-sm mb-5">Search by name, specialization, or condition treated.</p>

      <VetSearchPanel selectedVet={selectedVet} onSelectVet={onSelect} />

      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onBack} className="btn-outline px-5 py-3 text-sm">← Back</button>
        <button
          type="button"
          id="wizard-next-step3"
          disabled={!selectedVet}
          onClick={onNext}
          className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Continue → Pick Schedule
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Date + time ───────────────────────────────────────────────────────
function StepSchedule({ selectedDate, selectedTime, onDateChange, onTimeChange, selectedVet, onBack, onNext }) {
  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-black text-body mb-1">Pick a Date & Time</h2>
      <p className="text-muted text-sm mb-5">
        Choose from Dr. {selectedVet?.name}'s available slots.
      </p>

      <SlotPicker
        selectedDate={selectedDate}
        selectedTime={selectedTime}
        onDateChange={onDateChange}
        onTimeChange={onTimeChange}
        vet={selectedVet}
      />

      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onBack} className="btn-outline px-5 py-3 text-sm">← Back</button>
        <button
          type="button"
          id="wizard-next-step4"
          disabled={!selectedDate || !selectedTime}
          onClick={onNext}
          className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Continue → Add Details
        </button>
      </div>
    </div>
  );
}

// ── Step 4: Reason + confirm ──────────────────────────────────────────────────
function StepDetails({ form, onChange, selectedPet, selectedVet, selectedDate, selectedTime, onBack, onSubmit, isLoading, apiError }) {
  const displayDate = selectedDate
    ? new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  function format12h(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }

  return (
    <div className="animate-fade-in">
      <h2 className="text-xl font-black text-body mb-1">Confirm Appointment</h2>
      <p className="text-muted text-sm mb-5">Add a reason and review your booking details.</p>

      {apiError && (
        <div className="mb-4 p-3 rounded-xl bg-[#F4EBE8] border border-[#E0C8C4] text-[#8C4238] text-sm flex items-start gap-2">
          <span>⚠️</span><span>{apiError}</span>
        </div>
      )}

      {/* Summary card */}
      <div className="glass-card p-4 mb-5 space-y-3">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Booking Summary</p>
        {[
          { icon: '🐾', label: 'Pet',       value: `${selectedPet?.name} · ${selectedPet?.species ?? ''}` },
          { icon: '🩺', label: 'Vet',       value: `Dr. ${selectedVet?.name} (${selectedVet?.specialization ?? 'General'})` },
          { icon: '🏥', label: 'Clinic',    value: selectedVet?.clinicName || '—' },
          { icon: '📅', label: 'Date',      value: displayDate },
          { icon: '🕐', label: 'Time',      value: format12h(selectedTime) },
        ].map((row) => (
          <div key={row.label} className="flex items-start gap-3">
            <span className="text-lg flex-shrink-0 mt-0.5">{row.icon}</span>
            <div>
              <p className="text-xs text-subtle">{row.label}</p>
              <p className="text-sm text-body font-medium capitalize">{row.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Reason */}
      <div className="mb-4">
        <label className="text-sm font-medium text-body mb-1.5 block">
          Reason for Visit <span className="text-primary-400">*</span>
        </label>
        <input
          type="text"
          id="appt-reason"
          value={form.reason}
          onChange={(e) => onChange('reason', e.target.value)}
          placeholder="e.g. Limping, Annual check-up, Skin irritation, Vaccination"
          className="w-full bg-white border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-body
            placeholder-[#8A8279] text-sm focus:outline-none focus:border-primary-500
            focus:ring-2 focus:ring-primary-500/20 transition-all"
        />
      </div>

      {/* Notes */}
      <div className="mb-6">
        <label className="text-sm font-medium text-body mb-1.5 block">
          Additional Notes <span className="text-subtle text-xs font-normal">(optional)</span>
        </label>
        <textarea
          id="appt-notes"
          value={form.notes}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={3}
          placeholder="Any additional context for the vet — symptoms, medications, recent changes…"
          className="w-full bg-white border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-body
            placeholder-[#8A8279] text-sm focus:outline-none focus:border-primary-500
            focus:ring-2 focus:ring-primary-500/20 transition-all resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="btn-outline px-5 py-3 text-sm">← Back</button>
        <button
          type="button"
          id="wizard-submit-booking"
          disabled={!form.reason.trim() || isLoading}
          onClick={onSubmit}
          className="btn-primary flex-1 justify-center disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isLoading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Booking…</>
            : '🩺 Confirm Booking'
          }
        </button>
      </div>
    </div>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────
function StepSuccess({ selectedPet, selectedVet, selectedDate, selectedTime }) {
  function format12h(t) {
    if (!t) return '';
    const [h, m] = t.split(':').map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2,'0')} ${h >= 12 ? 'PM' : 'AM'}`;
  }
  const dateLabel = selectedDate
    ? new Date(selectedDate).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  return (
    <div className="animate-fade-in text-center py-4">
      <div className="text-6xl mb-5 ">🎉</div>
      <h2 className="text-2xl font-black text-body mb-2">Appointment Booked!</h2>
      <p className="text-muted text-sm mb-1">
        Your appointment for <span className="text-strong font-semibold">{selectedPet?.name}</span> with{' '}
        <span className="text-primary-600 font-semibold">Dr. {selectedVet?.name}</span> is confirmed.
      </p>
      <div className="glass-card p-4 mt-5 text-left space-y-2">
        <p className="text-sm text-body">📅 {dateLabel} · {format12h(selectedTime)}</p>
        {selectedVet?.clinicName && <p className="text-sm text-muted">🏥 {selectedVet.clinicName}</p>}
        {selectedVet?.phone && <p className="text-sm text-muted">📞 {selectedVet.phone}</p>}
      </div>
      <p className="text-xs text-subtle mt-4">The vet will confirm your appointment shortly.</p>
    </div>
  );
}

// ── Main BookingWizard ────────────────────────────────────────────────────────
export default function BookingWizard({ pets, onBook, onClose }) {
  const TOTAL_STEPS = 4;

  const [step,         setStep]   = useState(1);
  const [selectedPet,  setPet]    = useState(pets.length === 1 ? pets[0] : null);
  const [selectedVet,  setVet]    = useState(null);
  const [selectedDate, setDate]   = useState('');
  const [selectedTime, setTime]   = useState('');
  const [details,      setDetails]= useState({ reason: '', notes: '' });
  const [isLoading,    setLoading]= useState(false);
  const [apiError,     setApiErr] = useState(null);
  const [success,      setSuccess]= useState(false);

  // If only one pet, auto-skip step 1
  const effectiveStep = pets.length === 1 && step === 1 ? 2 : step;

  const setDetail = (k, v) => setDetails((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    setLoading(true);
    setApiErr(null);
    try {
      await onBook({
        petId:           selectedPet._id,
        vetId:           selectedVet._id,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        reason:          details.reason,
        ownerNotes:      details.notes || undefined,
      });
      setSuccess(true);
    } catch (err) {
      setApiErr(err.response?.data?.message || 'Booking failed. The slot may have just been taken. Please try another time.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return <StepSuccess selectedPet={selectedPet} selectedVet={selectedVet} selectedDate={selectedDate} selectedTime={selectedTime} />;
  }

  return (
    <div>
      {/* Only show step indicator for full 4-step flow */}
      {pets.length > 1 && (
        <StepIndicator step={step} total={TOTAL_STEPS} />
      )}

      {/* Step 1 — Pet (skipped if only 1 pet) */}
      {pets.length > 1 && step === 1 && (
        <StepPet
          pets={pets}
          selectedPet={selectedPet}
          onSelect={setPet}
          onNext={() => setStep(2)}
        />
      )}

      {/* Step 2 — Vet */}
      {(step === 2 || (pets.length === 1 && step === 1)) && (
        <StepVet
          selectedVet={selectedVet}
          onSelect={setVet}
          onBack={() => setStep(Math.max(1, step - 1))}
          onNext={() => setStep(3)}
        />
      )}

      {/* Step 3 — Schedule */}
      {step === 3 && (
        <StepSchedule
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onDateChange={setDate}
          onTimeChange={setTime}
          selectedVet={selectedVet}
          onBack={() => setStep(2)}
          onNext={() => setStep(4)}
        />
      )}

      {/* Step 4 — Details + Confirm */}
      {step === 4 && (
        <StepDetails
          form={details}
          onChange={setDetail}
          selectedPet={selectedPet}
          selectedVet={selectedVet}
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          onBack={() => setStep(3)}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          apiError={apiError}
        />
      )}
    </div>
  );
}
