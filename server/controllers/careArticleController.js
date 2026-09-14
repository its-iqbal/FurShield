import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import sendResponse from '../utils/sendResponse.js';
import { CareArticle } from '../models/index.js';

/**
 * GET /api/v1/care-articles
 * Public. Browse care articles with filters.
 * Query: category, petType, mediaType, search, page, limit
 */
export const getArticles = asyncHandler(async (req, res) => {
  const {
    category, petType, mediaType,
    search, page = 1, limit = 12,
  } = req.query;

  const filter = { isPublished: true };
  if (category)  filter.category  = category;
  if (petType)   filter.petTypes  = petType;
  if (mediaType) filter.mediaType = mediaType;
  if (search)    filter.$text     = { $search: search };

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await CareArticle.countDocuments(filter);

  const articles = await CareArticle.find(filter)
    .select('-content -faqItems')    // omit heavy fields from list view
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  sendResponse(res, 200, articles, 'Care articles retrieved', {
    total, page: Number(page), totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * GET /api/v1/care-articles/:slug
 * Public. Returns a full article by its URL slug (including content & FAQs).
 * Also increments the view counter.
 */
export const getArticleBySlug = asyncHandler(async (req, res, next) => {
  const article = await CareArticle.findOneAndUpdate(
    { slug: req.params.slug, isPublished: true },
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!article) return next(new AppError('Article not found.', 404));
  sendResponse(res, 200, article, 'Article retrieved');
});

/**
 * GET /api/v1/care-articles/id/:id
 * Public. Returns a full article by MongoDB id.
 */
export const getArticleById = asyncHandler(async (req, res, next) => {
  const article = await CareArticle.findOneAndUpdate(
    { _id: req.params.id, isPublished: true },
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!article) return next(new AppError('Article not found.', 404));
  sendResponse(res, 200, article, 'Article retrieved');
});

/**
 * POST /api/v1/care-articles
 * Create a care article (admin/seeding use).
 */
export const createArticle = asyncHandler(async (req, res) => {
  const article = await CareArticle.create(req.body);
  sendResponse(res, 201, article, 'Care article created');
});

/**
 * PATCH /api/v1/care-articles/:id
 * Update a care article.
 */
export const updateArticle = asyncHandler(async (req, res, next) => {
  const article = await CareArticle.findByIdAndUpdate(
    req.params.id,
    { $set: req.body },
    { new: true, runValidators: true }
  );
  if (!article) return next(new AppError('Article not found.', 404));
  sendResponse(res, 200, article, 'Article updated');
});
