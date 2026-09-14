import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import * as appt from '../controllers/appointmentController.js';

const router = Router();

router.use(protect);

// Auto-suggest vets (public after login)
router.get('/suggest-vets', appt.suggestVets);

// Book appointment — owner only
router.post('/', restrictTo('petOwner'), appt.createAppointment);

// View own appointments (owner sees theirs, vet sees theirs)
router.get('/my', appt.getMyAppointments);

// Single appointment
router.get('/:id', appt.getAppointmentById);

// Status update — owner can cancel, vet can confirm/reschedule/complete
router.patch('/:id/status', appt.updateStatus);

export default router;
