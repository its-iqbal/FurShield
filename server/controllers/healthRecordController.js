import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import sendResponse from '../utils/sendResponse.js';
import { HealthRecord, Pet, Appointment } from '../models/index.js';

// ── Access guard ──────────────────────────────────────────────────────────────
/**
 * Ensures a vet can only access health records for pets booked with them.
 */
const vetCanAccessPet = async (vetId, petId) => {
  const appt = await Appointment.findOne({ vet: vetId, pet: petId });
  return !!appt;
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/v1/health-records
 * Create a health record.
 * - Vets: for a pet with an appointment linked to them
 * - Owners: for their own pets (e.g. manually logging a past visit)
 */
export const createRecord = asyncHandler(async (req, res, next) => {
  const petId = req.body.petId || req.body.pet;
  if (!petId) return next(new AppError('petId is required.', 400));

  const { petId: _p, pet: _pet, ...rest } = req.body;

  const pet = await Pet.findById(petId);
  if (!pet) return next(new AppError('Pet not found.', 404));

  if (req.user.role === 'veterinarian') {
    const hasAccess = await vetCanAccessPet(req.user._id, petId);
    if (!hasAccess) return next(new AppError('No appointment found with this pet.', 403));

    const record = await HealthRecord.create({
      ...rest,
      pet:     petId,
      owner:   pet.owner,
      vet:     req.user._id,
      addedBy: 'veterinarian',
    });
    return sendResponse(res, 201, record, 'Health record created');
  }

  // Pet owner adding their own record
  if (String(pet.owner) !== String(req.user._id)) {
    return next(new AppError('Access denied. This is not your pet.', 403));
  }

  const record = await HealthRecord.create({
    ...rest,
    pet:     petId,
    owner:   req.user._id,
    addedBy: 'owner',
  });

  sendResponse(res, 201, record, 'Health record created');
});

/**
 * GET /api/v1/health-records
 * Returns records filtered by pet query (?pet=... or ?petId=...) or all records for user's pets.
 */
export const getAllRecords = asyncHandler(async (req, res, next) => {
  const petId = req.query.pet || req.query.petId;
  if (petId) {
    req.params.petId = petId;
    return getRecordsByPet(req, res, next);
  }

  if (req.user.role === 'petOwner') {
    const myPets = await Pet.find({ owner: req.user._id }).select('_id');
    const petIds = myPets.map(p => p._id);
    const records = await HealthRecord.find({ pet: { $in: petIds } })
      .populate('vet', 'name specialization clinicName')
      .populate('pet', 'name species breed')
      .sort({ visitDate: -1 });
    return sendResponse(res, 200, records, 'Health records retrieved');
  }

  if (req.user.role === 'veterinarian') {
    const records = await HealthRecord.find({ vet: req.user._id })
      .populate('pet', 'name species breed')
      .populate('owner', 'name email')
      .sort({ visitDate: -1 });
    return sendResponse(res, 200, records, 'Health records retrieved');
  }

  sendResponse(res, 200, [], 'Health records retrieved');
});

/**
 * GET /api/v1/health-records/pet/:petId
 * Returns all health records for a pet, newest first.
 * - Owner: must own the pet
 * - Vet: must have an appointment with the pet
 */
export const getRecordsByPet = asyncHandler(async (req, res, next) => {
  const { petId } = req.params;
  const pet = await Pet.findById(petId);
  if (!pet) return next(new AppError('Pet not found.', 404));

  if (req.user.role === 'petOwner' && String(pet.owner) !== String(req.user._id)) {
    return next(new AppError('Access denied.', 403));
  }
  if (req.user.role === 'veterinarian') {
    const hasAccess = await vetCanAccessPet(req.user._id, petId);
    if (!hasAccess) return next(new AppError('Access denied.', 403));
  }

  const records = await HealthRecord.find({ pet: petId })
    .populate('vet', 'name specialization clinicName')
    .sort({ visitDate: -1 });

  sendResponse(res, 200, records, 'Health records retrieved');
});

/**
 * GET /api/v1/health-records/:id
 * Returns a single health record.
 */
export const getRecordById = asyncHandler(async (req, res, next) => {
  const record = await HealthRecord.findById(req.params.id)
    .populate('vet',   'name specialization')
    .populate('owner', 'name email')
    .populate('pet',   'name species breed');

  if (!record) return next(new AppError('Record not found.', 404));

  // Access check
  if (req.user.role === 'petOwner' && String(record.owner) !== String(req.user._id)) {
    return next(new AppError('Access denied.', 403));
  }
  if (req.user.role === 'veterinarian' && String(record.vet?._id) !== String(req.user._id)) {
    const hasAccess = await vetCanAccessPet(req.user._id, record.pet._id);
    if (!hasAccess) return next(new AppError('Access denied.', 403));
  }

  sendResponse(res, 200, record, 'Health record retrieved');
});

/**
 * PATCH /api/v1/health-records/:id
 * Update a health record. Treating vet or creator owner can update it.
 */
export const updateRecord = asyncHandler(async (req, res, next) => {
  const record = await HealthRecord.findById(req.params.id);
  if (!record) return next(new AppError('Record not found.', 404));

  const isOwner = req.user.role === 'petOwner' && String(record.owner) === String(req.user._id) && record.addedBy === 'owner';
  const isVet   = req.user.role === 'veterinarian' && String(record.vet) === String(req.user._id);

  if (!isOwner && !isVet) {
    return next(new AppError('Only the creator or treating veterinarian can update this record.', 403));
  }

  const forbidden = ['pet', 'owner', 'vet', 'addedBy'];
  for (const key of forbidden) delete req.body[key];

  Object.assign(record, req.body);
  await record.save({ runValidators: true });

  sendResponse(res, 200, record, 'Health record updated');
});

/**
 * DELETE /api/v1/health-records/:id
 * Deletes a record. Owner or the creating vet may delete.
 */
export const deleteRecord = asyncHandler(async (req, res, next) => {
  const record = await HealthRecord.findById(req.params.id);
  if (!record) return next(new AppError('Record not found.', 404));

  const isOwner = req.user.role === 'petOwner' && String(record.owner) === String(req.user._id);
  const isVet   = req.user.role === 'veterinarian' && String(record.vet) === String(req.user._id);

  if (!isOwner && !isVet) return next(new AppError('Access denied.', 403));

  await record.deleteOne();
  sendResponse(res, 200, null, 'Health record deleted');
});
