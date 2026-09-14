import mongoose from 'mongoose';

const { Schema } = mongoose;

// ── Insurance sub-schema ──────────────────────────────────────────────────────
// SRS §1.6: upload/store/view only — no payment features
const insuranceSchema = new Schema(
  {
    provider:     { type: String, trim: true },
    policyNumber: { type: String, trim: true },
    expiryDate:   { type: Date },
    coverageType: { type: String, trim: true },
    documents:    { type: [String], default: [] }, // file URLs / S3 keys
  },
  { _id: false }
);

// ── Main Pet schema ───────────────────────────────────────────────────────────
const petSchema = new Schema(
  {
    owner: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Pet must have an owner'],
    },

    // ── Basic info ────────────────────────────────────────────────────────────
    name:    { type: String, required: [true, 'Pet name is required'], trim: true },
    species: {
      type:     String,
      required: [true, 'Species is required'],
      enum:     ['dog', 'cat', 'bird', 'rabbit', 'reptile', 'fish', 'other'],
    },
    breed:   { type: String, trim: true },
    age:     { type: Number, min: 0 },         // in years (decimals allowed e.g. 0.5)
    gender:  { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    weight:  { type: Number, min: 0 },         // in kg
    color:   { type: String, trim: true },
    dob:     { type: Date },

    // ── Physical / identity ───────────────────────────────────────────────────
    microchipId: { type: String, trim: true },
    isNeutered:  { type: Boolean, default: false },

    // ── Media ─────────────────────────────────────────────────────────────────
    images: { type: [String], default: [] }, // gallery URLs

    // ── Health summary (owner-managed) ────────────────────────────────────────
    allergies:      { type: [String], default: [] },
    medicalHistory: { type: String, trim: true },     // free-text overview

    // ── Insurance (SRS §1.6 — store & view only) ──────────────────────────────
    insurance: { type: insuranceSchema, default: () => ({}) },

    // ── Uploaded documents (vet certs, X-rays, lab reports) ──────────────────
    documents: { type: [String], default: [] }, // file URLs

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
petSchema.index({ owner: 1 });
petSchema.index({ species: 1, breed: 1 });

const Pet = mongoose.model('Pet', petSchema);
export default Pet;
