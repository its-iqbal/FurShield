import mongoose from 'mongoose';

const { Schema } = mongoose;

// ── Embedded order line item ──────────────────────────────────────────────────
const orderItemSchema = new Schema(
  {
    product:    { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name:       { type: String, required: true },   // snapshot at time of order
    image:      { type: String },                   // snapshot
    priceEach:  { type: Number, required: true, min: 0 },
    quantity:   { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

// ── Virtual: line total ───────────────────────────────────────────────────────
orderItemSchema.virtual('lineTotal').get(function () {
  return parseFloat((this.priceEach * this.quantity).toFixed(2));
});

// ── Main Order schema ─────────────────────────────────────────────────────────
// NOTE (SRS §1.5 + §1.6): NO payment gateway. Status stops at 'placed'.
// Physical delivery is also out of scope per SRS §1.6.
const orderSchema = new Schema(
  {
    owner: {
      type:     Schema.Types.ObjectId,
      ref:      'User',
      required: [true, 'Order must belong to an owner'],
    },

    items:       { type: [orderItemSchema], default: [] },
    totalAmount: { type: Number, default: 0, min: 0 },

    // Status: cart = items still being modified, placed = submitted (no payment step)
    status: {
      type:    String,
      enum:    ['cart', 'placed', 'cancelled'],
      default: 'cart',
    },

    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Pre-save: recalculate totalAmount ─────────────────────────────────────────
orderSchema.pre('save', function (next) {
  this.totalAmount = parseFloat(
    this.items.reduce((sum, item) => sum + item.priceEach * item.quantity, 0).toFixed(2)
  );
  next();
});

// ── Indexes ───────────────────────────────────────────────────────────────────
orderSchema.index({ owner: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
