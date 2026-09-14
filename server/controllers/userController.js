import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import sendResponse from '../utils/sendResponse.js';
import { User } from '../models/index.js';

// ── Profile ───────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/users/profile
 * Returns the full profile of the currently authenticated user.
 */
export const getProfile = asyncHandler(async (req, res) => {
  sendResponse(res, 200, req.user, 'Profile retrieved');
});

/**
 * PATCH /api/v1/users/profile
 * Updates non-sensitive profile fields for the current user.
 * Shared by all roles; role-specific fields are simply ignored if not provided.
 */
export const updateProfile = asyncHandler(async (req, res, next) => {
  // Block attempts to change password or role through this route
  const forbidden = ['passwordHash', 'password', 'role', 'email'];
  for (const field of forbidden) {
    if (req.body[field] !== undefined) {
      return next(new AppError(`Cannot update '${field}' through this route.`, 400));
    }
  }

  const allowed = [
    // Core
    'name', 'phone', 'address', 'avatar',
    // Pet owner
    'familyMembers',
    // Vet
    'specialization', 'experience', 'clinicName', 'clinicAddress',
    'availableSlots', 'bio',
    // Shelter
    'shelterName', 'contactPerson', 'website',
  ];

  const updates = {};
  for (const key of allowed) {
    if (req.body[key] !== undefined) updates[key] = req.body[key];
  }

  const updated = await User.findByIdAndUpdate(
    req.user._id,
    { $set: updates },
    { new: true, runValidators: true }
  );

  sendResponse(res, 200, updated, 'Profile updated');
});

// ── Vet listing (for appointment booking + auto-suggest) ─────────────────────

/**
 * GET /api/v1/users/vets
 * Returns a paginated list of registered veterinarians.
 * Supports filtering by specialization, city, and text search.
 */
export const listVets = asyncHandler(async (req, res) => {
  const {
    specialization,
    city,
    search,
    page  = 1,
    limit = 12,
  } = req.query;

  const filter = { role: 'veterinarian', isActive: true };

  if (specialization) filter.specialization = new RegExp(specialization, 'i');
  if (city)           filter['address.city'] = new RegExp(city, 'i');
  if (search) {
    const re = new RegExp(search, 'i');
    filter.$or = [{ name: re }, { specialization: re }, { clinicName: re }];
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(filter);
  const vets  = await User.find(filter)
    .select('name email phone address specialization experience clinicName clinicAddress availableSlots bio avatar')
    .skip(skip)
    .limit(Number(limit))
    .sort({ experience: -1, name: 1 });

  sendResponse(res, 200, vets, 'Veterinarians retrieved', {
    total,
    page:       Number(page),
    limit:      Number(limit),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * GET /api/v1/users/vets/:id
 * Returns a single veterinarian's public profile.
 */
export const getVetById = asyncHandler(async (req, res, next) => {
  const vet = await User.findOne({ _id: req.params.id, role: 'veterinarian', isActive: true })
    .select('name email phone address specialization experience clinicName clinicAddress availableSlots bio avatar');

  if (!vet) return next(new AppError('Veterinarian not found.', 404));

  sendResponse(res, 200, vet, 'Veterinarian profile retrieved');
});

// ── Shelter listing (public browsing) ────────────────────────────────────────

/**
 * GET /api/v1/users/shelters
 * Returns all active animal shelters (name, contact, location).
 */
export const listShelters = asyncHandler(async (req, res) => {
  const { city, search, page = 1, limit = 12 } = req.query;

  const filter = { role: 'shelter', isActive: true };
  if (city)   filter['address.city'] = new RegExp(city, 'i');
  if (search) {
    const re = new RegExp(search, 'i');
    filter.$or = [{ shelterName: re }, { name: re }];
  }

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await User.countDocuments(filter);
  const shelters = await User.find(filter)
    .select('name shelterName contactPerson phone email address website avatar')
    .skip(skip)
    .limit(Number(limit))
    .sort({ shelterName: 1 });

  sendResponse(res, 200, shelters, 'Shelters retrieved', {
    total,
    page:       Number(page),
    totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * DELETE /api/v1/users/profile
 * Soft-deletes (deactivates) the current user's account.
 */
export const deactivateAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { isActive: false });
  sendResponse(res, 200, null, 'Account deactivated');
});
