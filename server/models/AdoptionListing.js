import mongoose from 'mongoose';

const { Schema } = mongoose;

// ── Per-animal care log entry (SRS §1.6 — shelter updates feeding/grooming/medical) ──
const careLogEntrySchema = new Schema(
  {
    logType:     { type: String, enum: ['feeding', 'grooming', 'medical', 'exercise', 'other'], required: true },
    notes:       { type: String, trim: true },
    performedBy: { type: String, trim: true }, // staff name
    date:        { type: Date, default: Date.now },
  },
  { _id: true, timestamps: false }
);

// ── Main AdoptionListing schema ───────────────────────────────────────────────
const adoptionListingSchema = new Schema(
  {
    shelter: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Shelter reference is required'],
    },

    // ── Pet profile ───────────────────────────────────────────────────────────
    petName:      { type: String, required: [true, 'Pet name is required'], trim: true },
    species:      { type: String, required: true, enum: ['dog', 'cat', 'bird', 'rabbit', 'reptile', 'other'] },
    breed:        { type: String, trim: true },
    age:          { type: Number, min: 0 },          // years
    gender:       { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    weight:       { type: Number, min: 0 },
    color:        { type: String, trim: true },

    // ── Health info ───────────────────────────────────────────────────────────
    healthStatus: { type: String, trim: true },      // e.g. "Healthy, vaccinated"
    isVaccinated: { type: Boolean, default: false },
    isNeutered:   { type: Boolean, default: false },
    specialNeeds: { type: String, trim: true },

    // ── Media & description ───────────────────────────────────────────────────
    images:      { type: [String], default: [] },
    description: { type: String, trim: true },

    // ── Adoption status ───────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ['available', 'pending', 'adopted'],
      default: 'available',
    },

    // ── Care logs (SRS §1.6 — shelter maintains feeding/grooming/medical logs) ─
    careLogs: { type: [careLogEntrySchema], default: [] },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

adoptionListingSchema.virtual('name')
  .get(function () { return this.petName; })
  .set(function (v) { this.petName = v; });


// ── Indexes ───────────────────────────────────────────────────────────────────
adoptionListingSchema.index({ shelter: 1 });
adoptionListingSchema.index({ status: 1 });
adoptionListingSchema.index({ species: 1, breed: 1 });
adoptionListingSchema.index({ petName: 'text', description: 'text' }); // search

const AdoptionListing = mongoose.model('AdoptionListing', adoptionListingSchema);
export default AdoptionListing;
