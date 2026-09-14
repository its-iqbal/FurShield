import mongoose from 'mongoose';

const { Schema } = mongoose;

const appointmentSchema = new Schema(
  {
    // ── Participants ──────────────────────────────────────────────────────────
    pet: {
      type:     Schema.Types.ObjectId,
      ref:      'Pet',
      required: [true, 'Pet is required'],
    },
    owner: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Owner is required'],
    },
    vet: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Veterinarian is required'],
    },

    // ── Schedule ──────────────────────────────────────────────────────────────
    appointmentDate: { type: Date, required: [true, 'Appointment date is required'] },
    appointmentTime: { type: String, required: [true, 'Appointment time is required'] }, // "10:30"
    duration:        { type: Number, default: 30 }, // minutes

    // ── Request details ───────────────────────────────────────────────────────
    reason:       { type: String, trim: true, required: [true, 'Reason for visit is required'] },
    ownerNotes:   { type: String, trim: true },   // additional notes from owner

    // ── Status lifecycle ──────────────────────────────────────────────────────
    // pending → confirmed → completed  (or rescheduled / cancelled at any step)
    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'],
      default: 'pending',
    },

    // ── Vet response ──────────────────────────────────────────────────────────
    vetNotes:        { type: String, trim: true },  // vet's internal notes
    rescheduleDate:  { type: Date },
    rescheduleTime:  { type: String },
    cancellationReason: { type: String, trim: true },

    // ── Auto-suggest metadata (SRS §1.6 — auto-suggest vets by condition/location) ──
    suggestedBySystem: { type: Boolean, default: false },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
appointmentSchema.index({ owner: 1, appointmentDate: -1 });
appointmentSchema.index({ vet: 1, appointmentDate: 1, status: 1 });
appointmentSchema.index({ pet: 1 });
appointmentSchema.index({ status: 1 });

const Appointment = mongoose.model('Appointment', appointmentSchema);
export default Appointment;
