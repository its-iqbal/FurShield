import mongoose from 'mongoose';

const { Schema } = mongoose;

// SRS §1.6 — Common feature: "Email or in-app alerts for vaccination due dates,
// appointment confirmations, new product arrivals, and so on"
const notificationSchema = new Schema(
  {
    recipient: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Recipient is required'],
    },

    type: {
      type:     String,
      required: true,
      enum: [
        'vaccination_due',          // pet owner
        'appointment_confirmed',    // pet owner + vet
        'appointment_reminder',     // pet owner + vet
        'appointment_cancelled',    // pet owner + vet
        'appointment_rescheduled',  // pet owner
        'new_product',              // pet owner
        'adoption_interest',        // shelter
        'adoption_approved',        // pet owner / applicant
        'adoption_rejected',        // pet owner / applicant
        'treatment_logged',         // pet owner (vet logged treatment)
        'general',                  // system-wide
      ],
    },

    title:   { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    isRead:  { type: Boolean, default: false },

    // ── Optional deep-link to the related document ────────────────────────────
    relatedModel: {
      type: String,
      enum: ['Appointment', 'Pet', 'Product', 'AdoptionListing', 'AdoptionInterest', 'HealthRecord'],
    },
    relatedId: { type: Schema.Types.ObjectId },

    // ── Delivery channels ─────────────────────────────────────────────────────
    channels: {
      inApp: { type: Boolean, default: true },
      email: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 }); // unread badge count
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 }); // auto-delete after 90 days

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
