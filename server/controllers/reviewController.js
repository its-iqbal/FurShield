import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import sendResponse from '../utils/sendResponse.js';
import { Review } from '../models/index.js';

/**
 * POST /api/v1/reviews
 * Authenticated user submits a review for a vet, shelter, or product.
 * Body: { targetType, targetId, rating, comment }
 */
export const createReview = asyncHandler(async (req, res, next) => {
  const { targetType, targetId, rating, comment } = req.body;

  if (!targetType || !targetId || !rating) {
    return next(new AppError('targetType, targetId, and rating are required.', 400));
  }

  // Map targetType to the correct Mongoose model name for refPath
  const modelMap = { veterinarian: 'User', shelter: 'User', product: 'Product' };
  const targetModel = modelMap[targetType];
  if (!targetModel) {
    return next(new AppError('targetType must be veterinarian, shelter, or product.', 400));
  }

  const review = await Review.create({
    reviewer: req.user._id,
    targetType,
    targetId,
    targetModel,
    rating,
    comment,
  });

  sendResponse(res, 201, review, 'Review submitted');
});

/**
 * GET /api/v1/reviews
 * Returns reviews for a specific target.
 * Query: targetType, targetId, page, limit
 */
export const getReviews = asyncHandler(async (req, res, next) => {
  const { targetType, targetId, page = 1, limit = 10 } = req.query;
  if (!targetType || !targetId) {
    return next(new AppError('targetType and targetId are required.', 400));
  }

  const filter = { targetType, targetId };
  const skip   = (Number(page) - 1) * Number(limit);
  const total  = await Review.countDocuments(filter);

  const reviews = await Review.find(filter)
    .populate('reviewer', 'name avatar')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  // Compute aggregate rating on-the-fly for the response
  const agg = await Review.aggregate([
    { $match: { targetType, targetId: reviews[0]?.targetId } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  const avgRating = agg[0]?.avg ? Math.round(agg[0].avg * 10) / 10 : 0;

  sendResponse(res, 200, reviews, 'Reviews retrieved', {
    total, page: Number(page), totalPages: Math.ceil(total / Number(limit)), avgRating,
  });
});

/**
 * DELETE /api/v1/reviews/:id
 * User deletes their own review.
 */
export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findOne({ _id: req.params.id, reviewer: req.user._id });
  if (!review) return next(new AppError('Review not found or access denied.', 404));
  await review.deleteOne();
  sendResponse(res, 200, null, 'Review deleted');
});
