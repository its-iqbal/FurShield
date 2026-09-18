import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import sendResponse from '../utils/sendResponse.js';
import { Pet } from '../models/index.js';

// ── Ownership guard helper ────────────────────────────────────────────────────
const ownPet = async (petId, ownerId, next) => {
  const pet = await Pet.findOne({ _id: petId, owner: ownerId });
  if (!pet) {
    next(new AppError('Pet not found or access denied.', 404));
    return null;
  }
  return pet;
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/v1/pets
 * Add a new pet. Only petOwners can call this.
 */
export const addPet = asyncHandler(async (req, res) => {
  let images = Array.isArray(req.body.images) ? [...req.body.images] : [];
  if (req.body.image && !images.includes(req.body.image)) {
    images = [req.body.image, ...images];
  }
  const pet = await Pet.create({ ...req.body, images, owner: req.user._id });
  sendResponse(res, 201, pet, 'Pet added successfully');
});

/**
 * GET /api/v1/pets
 * Returns all pets belonging to the authenticated owner.
 */
export const getMyPets = asyncHandler(async (req, res) => {
  const pets = await Pet.find({ owner: req.user._id, isActive: true }).sort({ createdAt: -1 });
  sendResponse(res, 200, pets, 'Pets retrieved');
});

/**
 * GET /api/v1/pets/:id
 * Returns a single pet.
 * - Owners: must own the pet
 * - Vets: can view pets belonging to their booked appointments
 */
export const getPetById = asyncHandler(async (req, res, next) => {
  let pet;

  if (req.user.role === 'petOwner') {
    pet = await Pet.findOne({ _id: req.params.id, owner: req.user._id });
  } else if (req.user.role === 'veterinarian') {
    // Vets may only view pets that have an appointment with them
    const { Appointment } = await import('../models/index.js');
    const appt = await Appointment.findOne({ vet: req.user._id, pet: req.params.id });
    if (appt) pet = await Pet.findById(req.params.id);
  }

  if (!pet) return next(new AppError('Pet not found or access denied.', 404));

  sendResponse(res, 200, pet, 'Pet retrieved');
});

/**
 * PATCH /api/v1/pets/:id
 * Update a pet profile. Owner only.
 */
export const updatePet = asyncHandler(async (req, res, next) => {
  const pet = await ownPet(req.params.id, req.user._id, next);
  if (!pet) return;

  const forbidden = ['owner', '_id'];
  for (const key of forbidden) delete req.body[key];

  if (req.body.image) {
    req.body.images = [req.body.image];
    delete req.body.image;
  }

  Object.assign(pet, req.body);
  await pet.save({ runValidators: true });

  sendResponse(res, 200, pet, 'Pet updated');
});

/**
 * DELETE /api/v1/pets/:id
 * Soft-deletes a pet. Owner only.
 */
export const deletePet = asyncHandler(async (req, res, next) => {
  const pet = await ownPet(req.params.id, req.user._id, next);
  if (!pet) return;

  pet.isActive = false;
  await pet.save();

  sendResponse(res, 200, null, 'Pet removed');
});

/**
 * POST /api/v1/pets/:id/documents
 * Append document URLs (X-rays, lab reports, vet certs) to a pet's record.
 * Body: { urls: ['https://...', ...] }
 */
export const addDocuments = asyncHandler(async (req, res, next) => {
  const { urls } = req.body;
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return next(new AppError('Provide an array of document URLs.', 400));
  }

  const pet = await ownPet(req.params.id, req.user._id, next);
  if (!pet) return;

  pet.documents.push(...urls);
  await pet.save();

  sendResponse(res, 200, pet, 'Documents added');
});

/**
 * POST /api/v1/pets/:id/images
 * Append image URLs to a pet's gallery.
 * Body: { urls: ['https://...', ...] }
 */
export const addImages = asyncHandler(async (req, res, next) => {
  const { urls } = req.body;
  if (!urls || !Array.isArray(urls) || urls.length === 0) {
    return next(new AppError('Provide an array of image URLs.', 400));
  }

  const pet = await ownPet(req.params.id, req.user._id, next);
  if (!pet) return;

  pet.images.push(...urls);
  await pet.save();

  sendResponse(res, 200, pet, 'Images added');
});
