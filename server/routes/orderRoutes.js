import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import * as order from '../controllers/orderController.js';

const router = Router();

// All order routes require auth. Only petOwners have a cart.
router.use(protect, restrictTo('petOwner'));

router.get ('/cart',              order.getCart);
router.post ('/cart/items',       order.addToCart);
router.patch('/cart/items/:itemId', order.updateCartItem);
router.delete('/cart/items/:itemId', order.removeFromCart);

router.post('/',     order.placeOrder);   // place the cart as an order
router.get ('/',     order.getMyOrders);
router.get ('/:id',  order.getOrderById);

export default router;
