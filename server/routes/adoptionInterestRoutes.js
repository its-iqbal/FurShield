import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import * as interest from '../controllers/adoptionInterestController.js';

const router = Router();

router.use(protect);

// Applicant submits interest
router.post('/:listingId', interest.submitInterest);

// Applicant views their own forms
router.get('/my', interest.getMyInterests);

// Shelter views forms for a specific listing
router.get('/listing/:listingId', restrictTo('shelter'), interest.getInterestsByListing);

// Shelter responds (approve/reject)
router.patch('/:id/respond', restrictTo('shelter'), interest.respondToInterest);

export default router;
