import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import sendResponse from '../utils/sendResponse.js';
import { Product } from '../models/index.js';

/**
 * GET /api/v1/products
 * Public endpoint. Browse products with filters, search, and pagination.
 * Supports: category, petType, minPrice, maxPrice, search, sort, page, limit
 */
export const getProducts = asyncHandler(async (req, res) => {
  const {
    category, petType, minPrice, maxPrice,
    search, sort = '-createdAt',
    page = 1, limit = 12,
  } = req.query;

  const filter = { isActive: true };

  if (category) filter.category = category;
  if (petType)  filter.petTypes = petType;

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  if (search) {
    filter.$text = { $search: search }; // uses the text index on Product
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(filter);

  const products = await Product.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .sort(sort);

  sendResponse(res, 200, products, 'Products retrieved', {
    total,
    page:       Number(page),
    limit:      Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * GET /api/v1/products/:id
 * Public endpoint. Returns a single product.
 */
export const getProductById = asyncHandler(async (req, res, next) => {
  const product = await Product.findOne({ _id: req.params.id, isActive: true });
  if (!product) return next(new AppError('Product not found.', 404));
  sendResponse(res, 200, product, 'Product retrieved');
});

/**
 * POST /api/v1/products
 * Create a product. (Admin / seed use — no admin role in SRS scope, kept open for seeding)
 */
export const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  sendResponse(res, 201, product, 'Product created');
});

/**
 * PATCH /api/v1/products/:id
 * Update a product.
 */
export const updateProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!product) return next(new AppError('Product not found.', 404));
  sendResponse(res, 200, product, 'Product updated');
});

/**
 * DELETE /api/v1/products/:id
 * Soft-deletes a product (sets isActive = false).
 */
export const deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) return next(new AppError('Product not found.', 404));
  product.isActive = false;
  await product.save();
  sendResponse(res, 200, null, 'Product removed');
});
