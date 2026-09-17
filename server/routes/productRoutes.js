import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as product from '../controllers/productController.js';

const router = Router();

import * as review from '../controllers/reviewController.js';

// Public browsing (SRS §1.6)
router.get ('/',    product.getProducts);
router.get ('/:id', product.getProductById);

// Reviews for a product
router.get('/:id/reviews', (req, res, next) => {
  req.query.targetType = 'product';
  req.query.targetId = req.params.id;
  review.getReviews(req, res, next);
});
router.post('/:id/reviews', protect, (req, res, next) => {
  req.body.targetType = 'product';
  req.body.targetId = req.params.id;
  review.createReview(req, res, next);
});

// Admin/seeding routes (protected)
router.post  ('/',    protect, product.createProduct);
router.patch ('/:id', protect, product.updateProduct);
router.delete('/:id', protect, product.deleteProduct);

export default router;
