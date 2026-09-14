import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as product from '../controllers/productController.js';

const router = Router();

// Public browsing (SRS §1.6)
router.get ('/',    product.getProducts);
router.get ('/:id', product.getProductById);

// Admin/seeding routes (protected)
router.post  ('/',    protect, product.createProduct);
router.patch ('/:id', protect, product.updateProduct);
router.delete('/:id', protect, product.deleteProduct);

export default router;
