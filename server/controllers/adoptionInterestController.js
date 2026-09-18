import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import sendResponse from '../utils/sendResponse.js';
import { AdoptionInterest, AdoptionListing, Notification } from '../models/index.js';

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/v1/adoption-interests/:listingId
 * Any authenticated user (typically petOwner) submits an adoption interest form.
 */
export const submitInterest = asyncHandler(async (req, res, next) => {
  const listing = await AdoptionListing.findById(req.params.listingId);
  if (!listing) return next(new AppError('Listing not found.', 404));
  if (listing.status !== 'available') {
    return next(new AppError('This pet is no longer available for adoption.', 400));
  }

  const interest = await AdoptionInterest.create({
    listing:       listing._id,
    shelter:       listing.shelter,
    applicant:     req.user._id,
    message:       req.body.message,
    livingSpace:   req.body.livingSpace,
    hasPets:       req.body.hasPets,
    hasChildren:   req.body.hasChildren,
    experienceNote:req.body.experienceNote || req.body.experience,
  });

  // Notify shelter
  await Notification.create({
    recipient:    listing.shelter,
    type:         'adoption_interest',
    title:        'New Adoption Interest',
    message:      `${req.user.name} has submitted an adoption form for ${listing.petName}.`,
    relatedModel: 'AdoptionInterest',
    relatedId:    interest._id,
  });

  sendResponse(res, 201, interest, 'Adoption interest submitted');
});

/**
 * GET /api/v1/adoption-interests/listing/:listingId
 * Shelter views all interest forms submitted for one of their listings.
 */
export const getInterestsByListing = asyncHandler(async (req, res, next) => {
  const listing = await AdoptionListing.findOne({
    _id: req.params.listingId,
    shelter: req.user._id,
  });
  if (!listing) return next(new AppError('Listing not found or access denied.', 404));

  const interests = await AdoptionInterest.find({ listing: listing._id })
    .populate('applicant', 'name email phone address')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, interests, 'Interest forms retrieved');
});

/**
 * GET /api/v1/adoption-interests/my
 * Applicant views all their submitted interest forms.
 */
export const getMyInterests = asyncHandler(async (req, res) => {
  const interests = await AdoptionInterest.find({ applicant: req.user._id })
    .populate('listing', 'petName species breed images status')
    .populate('shelter', 'shelterName name')
    .sort({ createdAt: -1 });

  sendResponse(res, 200, interests, 'My adoption interests retrieved');
});

/**
 * GET /api/v1/adoption-interests/shelter
 * Shelter views all interest forms submitted for any of their listings.
 */
export const getShelterInterests = asyncHandler(async (req, res) => {
  const interests = await AdoptionInterest.find({ shelter: req.user._id })
    .populate('applicant', 'name email phone address')
    .populate('listing', 'petName species breed images status')
    .sort({ createdAt: -1 });

  const mapped = interests.map((i) => {
    const obj = i.toObject({ virtuals: true });
    obj.user = obj.applicant || null;
    obj.owner = obj.applicant || null;
    obj.pet = obj.listing || null;
    if (obj.listing && !obj.listing.name && obj.listing.petName) {
      obj.listing.name = obj.listing.petName;
    }
    return obj;
  });

  sendResponse(res, 200, mapped, 'Shelter adoption interests retrieved');
});

/**
 * PATCH /api/v1/adoption-interests/:id/respond
 * Shelter responds to a specific interest form: approve or reject.
 * Body: { status: 'approved' | 'rejected', shelterResponse }
 */
export const respondToInterest = asyncHandler(async (req, res, next) => {
  const { status, shelterResponse } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return next(new AppError("Status must be 'approved' or 'rejected'.", 400));
  }

  const interest = await AdoptionInterest.findOne({
    _id:     req.params.id,
    shelter: req.user._id,
  });
  if (!interest) return next(new AppError('Interest form not found or access denied.', 404));

  interest.status          = status;
  interest.shelterResponse = shelterResponse;
  interest.respondedAt     = new Date();
  await interest.save();

  // If approved, mark the listing as pending (to prevent new applications)
  if (status === 'approved') {
    await AdoptionListing.findByIdAndUpdate(interest.listing, { status: 'pending' });
  }

  // Notify applicant
  await Notification.create({
    recipient:    interest.applicant,
    type:         status === 'approved' ? 'adoption_approved' : 'adoption_rejected',
    title:        `Adoption Application ${status === 'approved' ? 'Approved! 🎉' : 'Update'}`,
    message:      shelterResponse || `Your adoption application has been ${status}.`,
    relatedModel: 'AdoptionInterest',
    relatedId:    interest._id,
  });

  sendResponse(res, 200, interest, `Interest ${status}`);
});
