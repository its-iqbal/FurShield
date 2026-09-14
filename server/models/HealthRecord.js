import mongoose from 'mongoose';

const { Schema } = mongoose;

// ── Prescription line item ────────────────────────────────────────────────────
const prescriptionSchema = new Schema(
  {
    medication: { type: String, required: true, trim: true },
    dosage:     { type: String, trim: true },   // e.g. "5 mg twice daily"
    duration:   { type: String, trim: true },   // e.g. "7 days"
    notes:      { type: String, trim: true },
  },
  { _id: false }
);

// ── Lab result entry ──────────────────────────────────────────────────────────
const labResultSchema = new Schema(
  {
    testName:   { type: String, trim: true },
    result:     { type: String, trim: true },
    documentUrl:{ type: String },               // uploaded file URL
    testedOn:   { type: Date },
  },
  { _id: false }
);

// ── Vaccination record ────────────────────────────────────────────────────────
const vaccinationSchema = new Schema(
  {
    vaccineName: { type: String, required: true, trim: true },
    givenDate:   { type: Date, required: true },
    nextDueDate: { type: Date },
    batchNumber: { type: String, trim: true },
    documentUrl: { type: String },
  },
  { _id: false }
);

// ── Main HealthRecord schema ──────────────────────────────────────────────────
const healthRecordSchema = new Schema(
  {
    pet: {
      type:     Schema.Types.ObjectId,
      ref:      'Pet',
      required: [true, 'Pet reference is required'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref:  'User',
    },
    vet: {
      type: Schema.Types.ObjectId,
      ref:  'User',
      // Optional: owner can add records without a vet visit
    },

    // ── Visit metadata ────────────────────────────────────────────────────────
    visitDate: { type: Date, required: [true, 'Visit date is required'], default: Date.now },
    visitType: {
      type:    String,
      enum:    ['vaccination', 'checkup', 'treatment', 'surgery', 'emergency', 'grooming', 'other'],
      default: 'checkup',
    },

    // ── Clinical details (SRS §1.6 — structured view for vets) ───────────────
    symptoms:      { type: [String], default: [] },
    diagnosis:     { type: String, trim: true },
    treatment:     { type: String, trim: true },
    prescriptions: { type: [prescriptionSchema], default: [] },
    labResults:    { type: [labResultSchema],    default: [] },
    vaccinations:  { type: [vaccinationSchema],  default: [] },

    // ── Follow-up ─────────────────────────────────────────────────────────────
    followUpDate:  { type: Date },
    followUpNotes: { type: String, trim: true },

    // ── General notes & documents ─────────────────────────────────────────────
    notes:     { type: String, trim: true },
    documents: { type: [String], default: [] }, // uploaded file URLs (X-rays, certs, etc.)

    // ── Source flag ───────────────────────────────────────────────────────────
    addedBy: { type: String, enum: ['owner', 'veterinarian'], default: 'veterinarian' },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
healthRecordSchema.index({ pet: 1, visitDate: -1 });   // timeline queries
healthRecordSchema.index({ vet: 1 });
healthRecordSchema.index({ visitType: 1 });

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);
export default HealthRecord;
