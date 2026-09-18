import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import sendResponse from '../utils/sendResponse.js';
import { Order, Product } from '../models/index.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Get the owner's active cart, or create one if it doesn't exist */
const getOrCreateCart = async (ownerId) => {
  let cart = await Order.findOne({ owner: ownerId, status: 'cart' }).populate('items.product', 'name price images isActive');
  if (!cart) cart = await Order.create({ owner: ownerId, status: 'cart', items: [] });
  return cart;
};

// ── Controllers ───────────────────────────────────────────────────────────────
// NOTE (SRS §1.5 / §1.6): No payment gateway. Cart status stops at 'placed'.

/**
 * GET /api/v1/orders/cart
 * Returns the current owner's active cart (or creates an empty one).
 */
export const getCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  sendResponse(res, 200, cart, 'Cart retrieved');
});

/**
 * POST /api/v1/orders/cart/items
 * Add a product to the cart, or increment quantity if it's already there.
 * Body: { productId, quantity }
 */
export const addToCart = asyncHandler(async (req, res, next) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return next(new AppError('productId is required.', 400));

  const product = await Product.findOne({ _id: productId, isActive: true });
  if (!product) return next(new AppError('Product not found.', 404));

  if (product.stockQuantity < quantity) {
    return next(new AppError(`Only ${product.stockQuantity} units in stock.`, 400));
  }

  const cart = await getOrCreateCart(req.user._id);

  const existingIdx = cart.items.findIndex(
    (i) => String(i.product._id ?? i.product) === String(productId)
  );

  if (existingIdx > -1) {
    cart.items[existingIdx].quantity += Number(quantity);
  } else {
    cart.items.push({
      product:   productId,
      name:      product.name,
      image:     product.images[0] ?? '',
      priceEach: product.discountPrice ?? product.price,
      quantity:  Number(quantity),
    });
  }

  await cart.save();
  sendResponse(res, 200, cart, 'Item added to cart');
});

/**
 * PATCH /api/v1/orders/cart/items/:itemId
 * Update the quantity of a specific cart item.
 * Body: { quantity } — set to 0 to remove
 */
export const updateCartItem = asyncHandler(async (req, res, next) => {
  const { quantity } = req.body;
  if (quantity === undefined) return next(new AppError('quantity is required.', 400));

  const cart = await Order.findOne({ owner: req.user._id, status: 'cart' });
  if (!cart) return next(new AppError('No active cart found.', 404));

  const targetId = req.params.itemId || req.params.id;
  const item = cart.items.id(targetId);
  if (!item) return next(new AppError('Cart item not found.', 404));

  if (Number(quantity) <= 0) {
    item.deleteOne();
  } else {
    item.quantity = Number(quantity);
  }

  await cart.save();
  sendResponse(res, 200, cart, 'Cart updated');
});

/**
 * DELETE /api/v1/orders/cart/items/:itemId (or /api/v1/orders/cart/:id)
 * Remove a specific item from the cart.
 */
export const removeFromCart = asyncHandler(async (req, res, next) => {
  const cart = await Order.findOne({ owner: req.user._id, status: 'cart' });
  if (!cart) return next(new AppError('No active cart found.', 404));

  const targetId = req.params.itemId || req.params.id;
  const item = cart.items.id(targetId);
  if (!item) return next(new AppError('Cart item not found.', 404));

  item.deleteOne();
  await cart.save();
  sendResponse(res, 200, cart, 'Item removed from cart');
});

/**
 * DELETE /api/v1/orders/cart
 * Clears all items from the current user's active cart.
 */
export const clearCart = asyncHandler(async (req, res) => {
  const cart = await Order.findOne({ owner: req.user._id, status: 'cart' });
  if (cart) {
    cart.items = [];
    await cart.save();
  }
  sendResponse(res, 200, cart, 'Cart cleared');
});

/**
 * POST /api/v1/orders/place
 * Places the order (changes status from 'cart' to 'placed').
 * No payment processing — as per SRS §1.5.
 */
export const placeOrder = asyncHandler(async (req, res, next) => {
  const cart = await Order.findOne({ owner: req.user._id, status: 'cart' });
  if (!cart || cart.items.length === 0) {
    return next(new AppError('Your cart is empty.', 400));
  }

  cart.status = 'placed';
  if (req.body.notes) cart.notes = req.body.notes;
  await cart.save();

  sendResponse(res, 200, cart, 'Order placed successfully');
});

/**
 * GET /api/v1/orders
 * Returns all past orders for the current owner.
 */
export const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const filter = { owner: req.user._id, status: { $ne: 'cart' } };

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Order.countDocuments(filter);

  const orders = await Order.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  sendResponse(res, 200, orders, 'Orders retrieved', {
    total, page: Number(page), totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * GET /api/v1/orders/:id
 * Returns a single order. Owner only.
 */
export const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findOne({ _id: req.params.id, owner: req.user._id });
  if (!order) return next(new AppError('Order not found.', 404));
  sendResponse(res, 200, order, 'Order retrieved');
});
