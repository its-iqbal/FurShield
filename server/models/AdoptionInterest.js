import mongoose from 'mongoose';

const { Schema } = mongoose;

// SRS §1.6: Shelters "view adopter interest forms, respond to queries,
// and finalize adoption status via email/push notifications"
const adoptionInterestSchema = new Schema(
  {
    listing: {
      type:     Schema.Types.ObjectId,
      ref:      'AdoptionListing',
      required: [true, 'Listing reference is required'],
    },
    shelter: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: true,
    },
    applicant: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Applicant reference is required'],
    },

    // ── Adoption form ─────────────────────────────────────────────────────────
    message:       { type: String, trim: true },         // why they want to adopt
    livingSpace:   { type: String, trim: true },         // apartment, house, etc.
    hasPets:       { type: Boolean },
    hasChildren:   { type: Boolean },
    experienceNote:{ type: String, trim: true },         // prior pet experience

    // ── Shelter response ──────────────────────────────────────────────────────
    status: {
      type:    String,
      enum:    ['pending', 'reviewed', 'approved', 'rejected'],
      default: 'pending',
    },
    shelterResponse: { type: String, trim: true },
    respondedAt:     { type: Date },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Compound index: one active application per user per listing ───────────────
adoptionInterestSchema.index({ listing: 1, applicant: 1 }, { unique: true });
adoptionInterestSchema.index({ shelter: 1, status: 1 });
adoptionInterestSchema.index({ applicant: 1 });

const AdoptionInterest = mongoose.model('AdoptionInterest', adoptionInterestSchema);
export default AdoptionInterest;
