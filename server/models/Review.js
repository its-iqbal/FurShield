import mongoose from 'mongoose';

const { Schema } = mongoose;

// SRS §1.6 — Common feature: "Users can rate veterinarians, shelters, or products
// and leave comments"
const reviewSchema = new Schema(
  {
    reviewer: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Reviewer is required'],
    },

    // ── Polymorphic target ────────────────────────────────────────────────────
    targetType: {
      type:     String,
      required: true,
      enum:     ['veterinarian', 'shelter', 'product'],
    },
    targetId: {
      type:     Schema.Types.ObjectId,
      required: true,
      // refPath is used by Mongoose to resolve the correct model dynamically
      refPath:  'targetModel',
    },
    // Resolved model name for populate()
    targetModel: {
      type: String,
      enum: ['User', 'Product'],  // User covers both vets and shelters
    },

    // ── Review content ────────────────────────────────────────────────────────
    rating:  { type: Number, required: [true, 'Rating is required'], min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Compound index: one review per reviewer per target ────────────────────────
reviewSchema.index({ reviewer: 1, targetType: 1, targetId: 1 }, { unique: true });
reviewSchema.index({ targetType: 1, targetId: 1 });

// ── Post-save hook: update denormalized rating on Product ─────────────────────
reviewSchema.post('save', async function () {
  if (this.targetType !== 'product') return;
  const Product = mongoose.model('Product');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { targetType: 'product', targetId: this.targetId } },
    { $group: { _id: '$targetId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length) {
    await Product.findByIdAndUpdate(this.targetId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews:    stats[0].count,
    });
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;
