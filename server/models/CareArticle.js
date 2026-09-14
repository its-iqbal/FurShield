import mongoose from 'mongoose';

const { Schema } = mongoose;

// SRS §1.6 — "Owners can view categorized care information (feeding, hygiene,
// exercise, and so on) through articles, videos, and FAQs"
const careArticleSchema = new Schema(
  {
    title:   { type: String, required: [true, 'Title is required'], trim: true },
    slug:    { type: String, unique: true, lowercase: true, trim: true },

    // ── Classification ────────────────────────────────────────────────────────
    category: {
      type:     String,
      required: true,
      enum:     ['feeding', 'hygiene', 'exercise', 'health', 'grooming', 'training', 'general'],
    },
    mediaType: {
      type:    String,
      enum:    ['article', 'video', 'faq'],
      default: 'article',
    },
    petTypes: {
      type:    [String],
      enum:    ['dog', 'cat', 'bird', 'rabbit', 'reptile', 'all'],
      default: ['all'],
    },
    tags: { type: [String], default: [] },

    // ── Content ───────────────────────────────────────────────────────────────
    summary:   { type: String, trim: true, maxlength: 500 },
    content:   { type: String, trim: true },    // rich text / markdown body
    mediaUrl:  { type: String },                // YouTube URL or hosted video
    thumbnail: { type: String },                // cover image URL

    // ── FAQ specific ──────────────────────────────────────────────────────────
    faqItems: [
      {
        question: { type: String, trim: true },
        answer:   { type: String, trim: true },
        _id:      false,
      },
    ],

    // ── Meta ──────────────────────────────────────────────────────────────────
    author:      { type: String, trim: true, default: 'FurShield Team' },
    isPublished: { type: Boolean, default: true },
    views:       { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
careArticleSchema.index({ category: 1, mediaType: 1 });
careArticleSchema.index({ petTypes: 1 });
careArticleSchema.index({ title: 'text', summary: 'text', tags: 'text' });
careArticleSchema.index({ isPublished: 1 });

// ── Pre-save: auto-generate slug from title ───────────────────────────────────
careArticleSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
  next();
});

const CareArticle = mongoose.model('CareArticle', careArticleSchema);
export default CareArticle;
