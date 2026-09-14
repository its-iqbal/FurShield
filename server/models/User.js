import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const { Schema } = mongoose;

// ── Shared sub-schemas ────────────────────────────────────────────────────────

const addressSchema = new Schema(
  {
    street:  { type: String, trim: true },
    city:    { type: String, trim: true },
    state:   { type: String, trim: true },
    country: { type: String, trim: true, default: 'India' },
    zip:     { type: String, trim: true },
  },
  { _id: false }
);

// Vet-only: a single bookable time slot (e.g. Monday 09:00–12:00)
const timeSlotSchema = new Schema(
  {
    day:       { type: String, enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'], required: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime:   { type: String, required: true }, // "12:00"
  },
  { _id: false }
);

// Shelter-only: a single family member who shares the account
const familyMemberSchema = new Schema(
  {
    name:  { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true },
  },
  { _id: false }
);

// ── Main User schema ──────────────────────────────────────────────────────────

const userSchema = new Schema(
  {
    // ── Core (all roles) ──────────────────────────────────────────────────────
    name:         { type: String, required: [true, 'Name is required'], trim: true },
    email:        { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: [true, 'Password is required'], select: false },
    role:         { type: String, enum: ['petOwner', 'veterinarian', 'shelter'], required: true },
    phone:        { type: String, trim: true },
    address:      { type: addressSchema, default: () => ({}) },
    avatar:       { type: String, default: '' }, // URL to profile picture
    isActive:     { type: Boolean, default: true },

    // ── Pet Owner only ────────────────────────────────────────────────────────
    familyMembers: { type: [familyMemberSchema], default: undefined },

    // ── Veterinarian only ─────────────────────────────────────────────────────
    // NOTE (SRS §1.5): credential authenticity is NOT verified by the system
    specialization: { type: String, trim: true },
    experience:     { type: Number, min: 0 },           // years
    clinicName:     { type: String, trim: true },
    clinicAddress:  { type: addressSchema, default: undefined },
    availableSlots: { type: [timeSlotSchema], default: undefined },
    bio:            { type: String, maxlength: 1000 },

    // ── Animal Shelter only ───────────────────────────────────────────────────
    shelterName:   { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    website:       { type: String, trim: true },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
userSchema.index({ role: 1 });
userSchema.index({ 'address.city': 1 });
userSchema.index({ specialization: 1 }); // vet search by specialization

// ── Instance methods ──────────────────────────────────────────────────────────

/** Hash plain-text password and store it */
userSchema.methods.setPassword = async function (plainText) {
  const salt = await bcrypt.genSalt(12);
  this.passwordHash = await bcrypt.hash(plainText, salt);
};

/** Compare a candidate password against the stored hash */
userSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Virtual: aggregate rating (populated separately from Review collection)
userSchema.virtual('averageRating').get(function () {
  return this._averageRating ?? null;
});

const User = mongoose.model('User', userSchema);
export default User;
