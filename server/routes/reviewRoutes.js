import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as review from '../controllers/reviewController.js';

const router = Router();

router.get ('/',        review.getReviews);      // public
router.post('/',        protect, review.createReview);
router.delete('/:id',   protect, review.deleteReview);

export default router;
