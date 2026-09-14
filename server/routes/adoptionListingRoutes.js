import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import * as listing from '../controllers/adoptionListingController.js';

const router = Router();

// Public routes
router.get ('/',    listing.getListings);
router.get ('/:id', listing.getListingById);

// Shelter-only management
router.use(protect);

router.get ('/shelter/my',            restrictTo('shelter'), listing.getMyListings);
router.post('/',                       restrictTo('shelter'), listing.createListing);

router.route('/:id')
  .patch (restrictTo('shelter'), listing.updateListing)
  .delete(restrictTo('shelter'), listing.deleteListing);

router.post('/:id/care-logs', restrictTo('shelter'), listing.addCareLog);
router.get ('/:id/care-logs', restrictTo('shelter'), listing.getCareLogs);

export default router;
