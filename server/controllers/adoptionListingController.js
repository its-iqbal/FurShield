import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import sendResponse from '../utils/sendResponse.js';
import { AdoptionListing } from '../models/index.js';

// ── Ownership guard ───────────────────────────────────────────────────────────
const ownListing = async (listingId, shelterId, next) => {
  const listing = await AdoptionListing.findOne({ _id: listingId, shelter: shelterId });
  if (!listing) { next(new AppError('Listing not found or access denied.', 404)); return null; }
  return listing;
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/v1/adoptions
 * Shelter creates a new adoption listing.
 */
export const createListing = asyncHandler(async (req, res) => {
  const petName = req.body.petName || req.body.name;
  let images = Array.isArray(req.body.images) ? [...req.body.images] : [];
  if (req.body.image && !images.includes(req.body.image)) {
    images = [req.body.image, ...images];
  }
  const listing = await AdoptionListing.create({ ...req.body, petName, images, shelter: req.user._id });
  sendResponse(res, 201, listing, 'Adoption listing created');
});

/**
 * GET /api/v1/adoptions
 * Public. Browse all available listings with filters.
 * Supports: species, breed, status, city, search, page, limit
 */
export const getListings = asyncHandler(async (req, res) => {
  const {
    species, breed, status = 'available',
    search, page = 1, limit = 12,
  } = req.query;

  const filter = {};
  if (species) filter.species = species;
  if (breed)   filter.breed   = new RegExp(breed, 'i');
  if (status)  filter.status  = status;
  if (search)  filter.$text   = { $search: search };

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await AdoptionListing.countDocuments(filter);

  const listings = await AdoptionListing.find(filter)
    .select('-careLogs')         // omit internal logs from public view
    .populate('shelter', 'shelterName name address phone email')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  sendResponse(res, 200, listings, 'Adoption listings retrieved', {
    total, page: Number(page), totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * GET /api/v1/adoptions/:id
 * Public. Returns a single listing with shelter info.
 */
export const getListingById = asyncHandler(async (req, res, next) => {
  const listing = await AdoptionListing.findById(req.params.id)
    .populate('shelter', 'shelterName name address phone email website');
  if (!listing) return next(new AppError('Listing not found.', 404));
  sendResponse(res, 200, listing, 'Listing retrieved');
});

/**
 * GET /api/v1/adoptions/shelter/my
 * Returns all listings created by the authenticated shelter (includes care logs).
 */
export const getMyListings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 12 } = req.query;
  const filter = { shelter: req.user._id };
  if (status) filter.status = status;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await AdoptionListing.countDocuments(filter);

  const listings = await AdoptionListing.find(filter)
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  sendResponse(res, 200, listings, 'My listings retrieved', {
    total, page: Number(page), totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * PATCH /api/v1/adoptions/:id
 * Shelter updates listing info or adoption status.
 */
export const updateListing = asyncHandler(async (req, res, next) => {
  const listing = await ownListing(req.params.id, req.user._id, next);
  if (!listing) return;

  const forbidden = ['shelter', '_id', 'careLogs'];
  for (const key of forbidden) delete req.body[key];

  if (req.body.name && !req.body.petName) req.body.petName = req.body.name;
  if (req.body.image) {
    req.body.images = [req.body.image];
    delete req.body.image;
  }

  Object.assign(listing, req.body);
  await listing.save({ runValidators: true });

  sendResponse(res, 200, listing, 'Listing updated');
});

/**
 * DELETE /api/v1/adoptions/:id
 * Shelter deletes a listing.
 */
export const deleteListing = asyncHandler(async (req, res, next) => {
  const listing = await ownListing(req.params.id, req.user._id, next);
  if (!listing) return;
  await listing.deleteOne();
  sendResponse(res, 200, null, 'Listing deleted');
});

/**
 * POST /api/v1/adoptions/:id/care-logs
 * Shelter appends a care log entry (feeding / grooming / medical / exercise).
 * Body: { logType, notes, performedBy, date }
 */
export const addCareLog = asyncHandler(async (req, res, next) => {
  const listing = await ownListing(req.params.id, req.user._id, next);
  if (!listing) return;

  const { logType, notes, performedBy, date } = req.body;
  if (!logType) return next(new AppError('logType is required.', 400));

  listing.careLogs.push({ logType, notes, performedBy, date });
  await listing.save();

  sendResponse(res, 201, listing.careLogs, 'Care log added');
});

/**
 * GET /api/v1/adoptions/:id/care-logs
 * Shelter views all care logs for one of their listings.
 */
export const getCareLogs = asyncHandler(async (req, res, next) => {
  const listing = await ownListing(req.params.id, req.user._id, next);
  if (!listing) return;
  sendResponse(res, 200, listing.careLogs, 'Care logs retrieved');
});
