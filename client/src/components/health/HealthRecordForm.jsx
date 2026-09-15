/**
 * components/health/HealthRecordForm.jsx
 * Add / Edit health record form.
 * Sections: Visit Info · Symptoms · Diagnosis & Treatment ·
 *           Prescriptions (dynamic) · Vaccinations (dynamic) ·
 *           Lab Results · Documents · Follow-up
 */
import { useState, useEffect } from 'react';
import { VISIT_TYPES } from './healthConfig.js';

// ── Atoms ─────────────────────────────────────────────────────────────────────
function Field({ label, required, hint, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-300">
        {label} {required && <span className="text-primary-400">*</span>}
      </label>
      {children}
      {hint  && <p className="text-xs text-gray-600">{hint}</p>}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

const inputCls = `w-full bg-gray-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-white
  placeholder-gray-600 text-sm focus:outline-none focus:border-primary-500/60
  focus:ring-2 focus:ring-primary-500/20 transition-all duration-200`;

function TextInput({ value, onChange, placeholder, type = 'text', ...rest }) {
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={inputCls} {...rest} />;
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows} className={`${inputCls} resize-none`} />;
}

function SectionDivider({ icon, label }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest whitespace-nowrap">
        {icon} {label}
      </span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}

// ── Tag input (symptoms) ──────────────────────────────────────────────────────
function TagInput({ tags, onChange, placeholder }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const val = input.trim();
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setInput('');
  };

  const removeTag = (tag) => onChange(tags.filter((t) => t !== tag));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[2rem]">
        {tags.map((tag) => (
          <span key={tag}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full
              bg-amber-500/15 border border-amber-500/25 text-amber-300">
            {tag}
            <button type="button" onClick={() => removeTag(tag)}
              className="hover:text-red-400 transition-colors leading-none">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
          placeholder={placeholder}
          className={`${inputCls} flex-1`}
        />
        <button type="button" onClick={addTag}
          className="px-3 py-2 rounded-xl border border-white/10 text-gray-400
            hover:border-amber-500/40 hover:text-amber-300 text-sm transition-all">
          + Add
        </button>
      </div>
      <p className="text-xs text-gray-600 mt-1">Press Enter or comma to add. Click tag × to remove.</p>
    </div>
  );
}

// ── Dynamic prescription rows ─────────────────────────────────────────────────
const EMPTY_RX = { medicationName: '', dosage: '', duration: '', notes: '' };

function PrescriptionRows({ rows, onChange }) {
  const update = (i, field, val) => {
    const updated = [...rows];
    updated[i] = { ...updated[i], [field]: val };
    onChange(updated);
  };
  const addRow    = () => onChange([...rows, { ...EMPTY_RX }]);
  const removeRow = (i) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-3">
      {rows.map((rx, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
          <div className="col-span-12 sm:col-span-4">
            <input value={rx.medicationName} onChange={(e) => update(i, 'medicationName', e.target.value)}
              placeholder="Medication name *" className={inputCls} />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <input value={rx.dosage} onChange={(e) => update(i, 'dosage', e.target.value)}
              placeholder="Dosage (e.g. 5mg)" className={inputCls} />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <input value={rx.duration} onChange={(e) => update(i, 'duration', e.target.value)}
              placeholder="Duration (e.g. 7 days)" className={inputCls} />
          </div>
          <div className="col-span-11 sm:col-span-1">
            <input value={rx.notes} onChange={(e) => update(i, 'notes', e.target.value)}
              placeholder="Notes" className={inputCls} />
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <button type="button" onClick={() => removeRow(i)}
              className="w-8 h-8 rounded-lg border border-white/10 text-gray-500
                hover:border-red-500/40 hover:text-red-400 text-sm transition-all flex items-center justify-center">
              ×
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addRow}
        className="text-sm text-primary-400 border border-dashed border-primary-500/30
          rounded-xl py-2.5 px-4 hover:bg-primary-500/5 hover:border-primary-500/50 transition-all">
        + Add Prescription
      </button>
    </div>
  );
}

// ── Dynamic vaccination rows ──────────────────────────────────────────────────
const EMPTY_VAX = { vaccineName: '', dateGiven: '', nextDueDate: '', batchNumber: '' };

function VaccinationRows({ rows, onChange }) {
  const update = (i, field, val) => {
    const updated = [...rows];
    updated[i] = { ...updated[i], [field]: val };
    onChange(updated);
  };
  const addRow    = () => onChange([...rows, { ...EMPTY_VAX }]);
  const removeRow = (i) => onChange(rows.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-3">
      {rows.map((vax, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 p-3 bg-green-500/5 rounded-xl border border-green-500/20">
          <div className="col-span-12 sm:col-span-4">
            <input value={vax.vaccineName} onChange={(e) => update(i, 'vaccineName', e.target.value)}
              placeholder="Vaccine name *" className={inputCls} />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <input type="date" value={vax.dateGiven} onChange={(e) => update(i, 'dateGiven', e.target.value)}
              className={inputCls} title="Date given" />
          </div>
          <div className="col-span-6 sm:col-span-3">
            <input type="date" value={vax.nextDueDate} onChange={(e) => update(i, 'nextDueDate', e.target.value)}
              className={inputCls} title="Next due date" />
          </div>
          <div className="col-span-11 sm:col-span-1">
            <input value={vax.batchNumber} onChange={(e) => update(i, 'batchNumber', e.target.value)}
              placeholder="Batch#" className={inputCls} />
          </div>
          <div className="col-span-1 flex items-center justify-center">
            <button type="button" onClick={() => removeRow(i)}
              className="w-8 h-8 rounded-lg border border-white/10 text-gray-500
                hover:border-red-500/40 hover:text-red-400 text-sm transition-all flex items-center justify-center">
              ×
            </button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addRow}
        className="text-sm text-green-400 border border-dashed border-green-500/30
          rounded-xl py-2.5 px-4 hover:bg-green-500/5 hover:border-green-500/50 transition-all">
        + Add Vaccination
      </button>
    </div>
  );
}

// ── Default form state factory ────────────────────────────────────────────────
const makeDefault = () => ({
  visitType:    'checkup',
  visitDate:    new Date().toISOString().slice(0, 10),
  symptoms:     [],
  diagnosis:    '',
  treatment:    '',
  prescriptions:[],
  vaccinations: [],
  labTestName:  '', labResult: '', labNormalRange: '', labLabName: '', labTestDate: '',
  followUpDate: '',
  notes:        '',
  documents:    '',
});

// ── Main HealthRecordForm ─────────────────────────────────────────────────────
export default function HealthRecordForm({ initialData = null, onSubmit, onCancel, isLoading }) {
  const isEditing = !!initialData;
  const [form, setForm] = useState(makeDefault());
  const [errors, setErrs] = useState({});

  useEffect(() => {
    if (initialData) {
      const lab = initialData.labResults ?? {};
      setForm({
        visitType:     initialData.visitType     ?? 'checkup',
        visitDate:     initialData.visitDate ? initialData.visitDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
        symptoms:      initialData.symptoms      ?? [],
        diagnosis:     initialData.diagnosis     ?? '',
        treatment:     initialData.treatment     ?? '',
        prescriptions: (initialData.prescriptions ?? []).map(p => ({
          medicationName: p.medicationName ?? '',
          dosage:         p.dosage         ?? '',
          duration:       p.duration       ?? '',
          notes:          p.notes          ?? '',
        })),
        vaccinations:  (initialData.vaccinations ?? []).map(v => ({
          vaccineName:  v.vaccineName  ?? '',
          dateGiven:    v.dateGiven    ? v.dateGiven.slice(0, 10) : '',
          nextDueDate:  v.nextDueDate  ? v.nextDueDate.slice(0, 10) : '',
          batchNumber:  v.batchNumber  ?? '',
        })),
        labTestName:    lab.testName    ?? '',
        labResult:      lab.result      ?? '',
        labNormalRange: lab.normalRange ?? '',
        labLabName:     lab.labName     ?? '',
        labTestDate:    lab.testDate    ? lab.testDate.slice(0, 10) : '',
        followUpDate:   initialData.followUpDate ? initialData.followUpDate.slice(0, 10) : '',
        notes:          initialData.notes ?? '',
        documents:      (initialData.documents ?? []).join('\n'),
      });
    } else {
      setForm(makeDefault());
    }
    setErrs({});
  }, [initialData]);

  const set = (field) => (val) =>
    setForm((p) => ({ ...p, [field]: val }));
  const setE = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.visitType) e.visitType = 'Select a visit type';
    if (!form.visitDate) e.visitDate = 'Visit date is required';
    form.prescriptions.forEach((p, i) => {
      if (!p.medicationName.trim()) e[`rx${i}`] = 'Medication name is required';
    });
    form.vaccinations.forEach((v, i) => {
      if (!v.vaccineName.trim()) e[`vax${i}`] = 'Vaccine name is required';
    });
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const hasLab = form.labTestName.trim();
    const payload = {
      visitType:     form.visitType,
      visitDate:     form.visitDate,
      symptoms:      form.symptoms,
      diagnosis:     form.diagnosis.trim()   || undefined,
      treatment:     form.treatment.trim()   || undefined,
      prescriptions: form.prescriptions.filter(p => p.medicationName.trim()),
      vaccinations:  form.vaccinations.filter(v => v.vaccineName.trim()),
      labResults:    hasLab ? {
        testName:    form.labTestName.trim(),
        result:      form.labResult.trim()      || undefined,
        normalRange: form.labNormalRange.trim() || undefined,
        labName:     form.labLabName.trim()     || undefined,
        testDate:    form.labTestDate            || undefined,
      } : undefined,
      followUpDate:  form.followUpDate || undefined,
      notes:         form.notes.trim() || undefined,
      documents:     form.documents.split('\n').map(s => s.trim()).filter(Boolean),
    };

    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* ── Visit Info ── */}
      <SectionDivider icon="📋" label="Visit Information" />

      {/* Type selector */}
      <Field label="Visit Type" required error={errors.visitType}>
        <div className="grid grid-cols-4 gap-2 mt-1">
          {VISIT_TYPES.map((t) => (
            <button key={t.value} type="button"
              onClick={() => set('visitType')(t.value)}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-center
                transition-all duration-200 hover:scale-105
                ${form.visitType === t.value
                  ? `${t.bg} ${t.border} text-white shadow-md`
                  : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20'
                }`}>
              <span className="text-xl">{t.emoji}</span>
              <span className="text-xs font-medium leading-tight">{t.label}</span>
            </button>
          ))}
        </div>
      </Field>

      <div className="mt-4">
        <Field label="Visit Date" required error={errors.visitDate}>
          <TextInput type="date" value={form.visitDate} onChange={setE('visitDate')} />
        </Field>
      </div>

      {/* ── Symptoms ── */}
      <SectionDivider icon="🤒" label="Symptoms" />
      <Field label="Add Symptoms">
        <TagInput
          tags={form.symptoms}
          onChange={set('symptoms')}
          placeholder="e.g. lethargy, vomiting, scratching…"
        />
      </Field>

      {/* ── Diagnosis & Treatment ── */}
      <SectionDivider icon="🩺" label="Diagnosis & Treatment" />

      <div className="flex flex-col gap-4">
        <Field label="Diagnosis / Condition">
          <TextInput
            value={form.diagnosis}
            onChange={setE('diagnosis')}
            placeholder="e.g. Tick fever, Dermatitis, Routine check — healthy"
          />
        </Field>
        <Field label="Treatment Plan">
          <Textarea
            value={form.treatment}
            onChange={setE('treatment')}
            placeholder="Describe the treatment administered or recommended…"
          />
        </Field>
      </div>

      {/* ── Prescriptions ── */}
      <SectionDivider icon="💊" label="Prescriptions" />
      <div className="text-xs text-gray-600 mb-3">
        Columns: Medication Name · Dosage · Duration · Notes
      </div>
      <PrescriptionRows
        rows={form.prescriptions}
        onChange={set('prescriptions')}
      />

      {/* ── Vaccinations ── */}
      <SectionDivider icon="💉" label="Vaccinations" />
      <div className="text-xs text-gray-600 mb-3">
        Columns: Vaccine Name · Date Given · Next Due · Batch #
      </div>
      <VaccinationRows
        rows={form.vaccinations}
        onChange={set('vaccinations')}
      />

      {/* ── Lab Results ── */}
      <SectionDivider icon="🧪" label="Lab Results (optional)" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Test Name">
          <TextInput value={form.labTestName} onChange={setE('labTestName')} placeholder="e.g. CBC, Blood Panel" />
        </Field>
        <Field label="Result">
          <TextInput value={form.labResult} onChange={setE('labResult')} placeholder="e.g. Positive, 12 mg/dL" />
        </Field>
        <Field label="Normal Range">
          <TextInput value={form.labNormalRange} onChange={setE('labNormalRange')} placeholder="e.g. 10–15 mg/dL" />
        </Field>
        <Field label="Lab Name">
          <TextInput value={form.labLabName} onChange={setE('labLabName')} placeholder="e.g. Metropolis Labs" />
        </Field>
        <Field label="Test Date">
          <TextInput type="date" value={form.labTestDate} onChange={setE('labTestDate')} />
        </Field>
      </div>

      {/* ── Documents ── */}
      <SectionDivider icon="📄" label="Documents" />
      <Field label="Document URLs" hint="One URL per line — X-rays, lab reports, certificates">
        <Textarea
          value={form.documents}
          onChange={setE('documents')}
          placeholder={"https://storage.example.com/xray.pdf\nhttps://storage.example.com/report.pdf"}
          rows={3}
        />
      </Field>

      {/* ── Follow-up ── */}
      <SectionDivider icon="📅" label="Follow-up & Notes" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Follow-up Date">
          <TextInput type="date" value={form.followUpDate} onChange={setE('followUpDate')} />
        </Field>
        <div /> {/* spacer */}
      </div>
      <div className="mt-4">
        <Field label="Additional Notes">
          <Textarea
            value={form.notes}
            onChange={setE('notes')}
            placeholder="Any additional observations, owner notes, or instructions…"
          />
        </Field>
      </div>

      {/* ── Actions ── */}
      <div className="flex gap-3 pt-6 mt-4 border-t border-white/10">
        <button type="button" onClick={onCancel} className="btn-outline flex-shrink-0 px-5 py-2.5 text-sm">
          Cancel
        </button>
        <button type="submit" disabled={isLoading}
          className="btn-primary flex-1 justify-center text-sm disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0">
          {isLoading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
            : isEditing ? '✓ Save Changes' : '📋 Add Record'
          }
        </button>
      </div>
    </form>
  );
}
