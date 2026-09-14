import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import sendResponse from '../utils/sendResponse.js';
import { Appointment, Pet, User, Notification } from '../models/index.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

const notifyUser = async (recipientId, type, title, message, relatedModel, relatedId) => {
  try {
    await Notification.create({ recipient: recipientId, type, title, message, relatedModel, relatedId });
  } catch {
    // Non-fatal: notification failure should not break the main flow
  }
};

// ── Controllers ───────────────────────────────────────────────────────────────

/**
 * POST /api/v1/appointments
 * Owner books an appointment with a vet for one of their pets.
 */
export const createAppointment = asyncHandler(async (req, res, next) => {
  const { petId, vetId, appointmentDate, appointmentTime, reason, ownerNotes } = req.body;

  // Validate pet ownership
  const pet = await Pet.findOne({ _id: petId, owner: req.user._id, isActive: true });
  if (!pet) return next(new AppError('Pet not found or does not belong to you.', 404));

  // Validate vet exists
  const vet = await User.findOne({ _id: vetId, role: 'veterinarian', isActive: true });
  if (!vet) return next(new AppError('Veterinarian not found.', 404));

  // Slot collision check (same vet, same date + time, not cancelled)
  const conflict = await Appointment.findOne({
    vet: vetId,
    appointmentDate: new Date(appointmentDate),
    appointmentTime,
    status: { $in: ['pending', 'confirmed'] },
  });
  if (conflict) {
    return next(new AppError('This time slot is already booked. Please choose another.', 409));
  }

  const appt = await Appointment.create({
    pet: petId,
    owner: req.user._id,
    vet: vetId,
    appointmentDate,
    appointmentTime,
    reason,
    ownerNotes,
  });

  // Notify vet
  await notifyUser(
    vetId,
    'appointment_confirmed',
    'New Appointment Request',
    `${req.user.name} has booked an appointment for ${pet.name} on ${appointmentDate} at ${appointmentTime}.`,
    'Appointment',
    appt._id
  );

  sendResponse(res, 201, appt, 'Appointment booked successfully');
});

/**
 * GET /api/v1/appointments/my
 * Owner: all their appointments. Vet: all their bookings.
 */
export const getMyAppointments = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const filter = req.user.role === 'petOwner'
    ? { owner: req.user._id }
    : { vet: req.user._id };

  if (status) filter.status = status;

  const skip  = (Number(page) - 1) * Number(limit);
  const total = await Appointment.countDocuments(filter);

  const appts = await Appointment.find(filter)
    .populate('pet',   'name species breed images')
    .populate('owner', 'name phone email')
    .populate('vet',   'name specialization clinicName phone')
    .skip(skip)
    .limit(Number(limit))
    .sort({ appointmentDate: -1 });

  sendResponse(res, 200, appts, 'Appointments retrieved', {
    total, page: Number(page), totalPages: Math.ceil(total / Number(limit)),
  });
});

/**
 * GET /api/v1/appointments/:id
 * Returns one appointment. Must be a participant (owner or vet).
 */
export const getAppointmentById = asyncHandler(async (req, res, next) => {
  const appt = await Appointment.findById(req.params.id)
    .populate('pet',   'name species breed images allergies')
    .populate('owner', 'name phone email address')
    .populate('vet',   'name specialization clinicName phone address');

  if (!appt) return next(new AppError('Appointment not found.', 404));

  const isOwner = String(appt.owner._id) === String(req.user._id);
  const isVet   = String(appt.vet._id)   === String(req.user._id);
  if (!isOwner && !isVet) return next(new AppError('Access denied.', 403));

  sendResponse(res, 200, appt, 'Appointment retrieved');
});

/**
 * PATCH /api/v1/appointments/:id/status
 * Vet can: confirm, reschedule, or complete.
 * Owner can: cancel.
 */
export const updateStatus = asyncHandler(async (req, res, next) => {
  const { status, rescheduleDate, rescheduleTime, vetNotes, cancellationReason } = req.body;
  const appt = await Appointment.findById(req.params.id);
  if (!appt) return next(new AppError('Appointment not found.', 404));

  const isOwner = String(appt.owner) === String(req.user._id);
  const isVet   = String(appt.vet)   === String(req.user._id);

  if (!isOwner && !isVet) return next(new AppError('Access denied.', 403));

  // Role-based status transitions
  const vetAllowed   = ['confirmed', 'rescheduled', 'completed', 'cancelled'];
  const ownerAllowed = ['cancelled'];

  if (isVet   && !vetAllowed.includes(status))
    return next(new AppError(`Vets can set status to: ${vetAllowed.join(', ')}.`, 400));
  if (isOwner && !ownerAllowed.includes(status))
    return next(new AppError('Owners can only cancel appointments.', 400));

  appt.status = status;
  if (vetNotes)           appt.vetNotes = vetNotes;
  if (cancellationReason) appt.cancellationReason = cancellationReason;
  if (status === 'rescheduled') {
    if (!rescheduleDate || !rescheduleTime)
      return next(new AppError('Provide rescheduleDate and rescheduleTime.', 400));
    appt.rescheduleDate = rescheduleDate;
    appt.rescheduleTime = rescheduleTime;
  }

  await appt.save();

  // Notify the other party
  const notifyId  = isVet ? appt.owner : appt.vet;
  const notifType = status === 'confirmed'    ? 'appointment_confirmed'
                  : status === 'cancelled'    ? 'appointment_cancelled'
                  : status === 'rescheduled'  ? 'appointment_rescheduled'
                  : 'general';

  await notifyUser(
    notifyId,
    notifType,
    `Appointment ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    `Your appointment has been marked as '${status}'.`,
    'Appointment',
    appt._id
  );

  sendResponse(res, 200, appt, `Appointment ${status}`);
});

/**
 * GET /api/v1/appointments/suggest-vets
 * Auto-suggest vets based on pet condition keyword or owner's city (SRS §1.6).
 */
export const suggestVets = asyncHandler(async (req, res) => {
  const { condition, city } = req.query;
  const filter = { role: 'veterinarian', isActive: true };

  if (condition) {
    const re = new RegExp(condition, 'i');
    filter.$or = [{ specialization: re }, { bio: re }];
  }
  if (city) filter['address.city'] = new RegExp(city, 'i');

  const vets = await User.find(filter)
    .select('name specialization clinicName address availableSlots avatar phone')
    .limit(8)
    .sort({ experience: -1 });

  sendResponse(res, 200, vets, 'Suggested veterinarians');
});
