import mongoose from 'mongoose';

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    // ── Identity ──────────────────────────────────────────────────────────────
    name:        { type: String, required: [true, 'Product name is required'], trim: true },
    brand:       { type: String, trim: true },
    sku:         { type: String, trim: true, unique: true, sparse: true },

    // ── Classification ────────────────────────────────────────────────────────
    category: {
      type:     String,
      required: [true, 'Category is required'],
      enum:     ['food', 'grooming', 'toys', 'accessories', 'health', 'training', 'other'],
    },
    petTypes: {
      type:    [String],
      enum:    ['dog', 'cat', 'bird', 'rabbit', 'reptile', 'fish', 'all'],
      default: ['all'],
    },
    tags: { type: [String], default: [] }, // e.g. ['organic', 'vet-approved']

    // ── Pricing & stock ───────────────────────────────────────────────────────
    // NOTE (SRS §1.5 + §1.6): No payment gateway. Cart/browse only.
    price:         { type: Number, required: [true, 'Price is required'], min: 0 },
    discountPrice: { type: Number, min: 0 },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },

    // ── Content ───────────────────────────────────────────────────────────────
    description: { type: String, trim: true },
    images:      { type: [String], default: [] },

    // ── Aggregate rating (denormalized for fast reads) ────────────────────────
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews:    { type: Number, default: 0, min: 0 },

    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Indexes ───────────────────────────────────────────────────────────────────
productSchema.index({ category: 1 });
productSchema.index({ petTypes: 1 });
productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' }); // full-text search
productSchema.index({ price: 1 });
productSchema.index({ averageRating: -1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
