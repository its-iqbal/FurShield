import { Router } from 'express';
import { protect, restrictTo } from '../middleware/auth.js';
import * as order from '../controllers/orderController.js';

const router = Router();

// All order routes require auth. Only petOwners have a cart.
router.use(protect, restrictTo('petOwner'));

router.get ('/cart',                 order.getCart);
router.post('/cart',                 order.addToCart);
router.post('/cart/items',           order.addToCart);
router.patch('/cart/:itemId',        order.updateCartItem);
router.patch('/cart/items/:itemId',  order.updateCartItem);
router.delete('/cart/:itemId',       order.removeFromCart);
router.delete('/cart/items/:itemId', order.removeFromCart);
router.delete('/cart',               order.clearCart);

router.post('/place', order.placeOrder);
router.post('/',      order.placeOrder);
router.get('/my',     order.getMyOrders);
router.get('/',       order.getMyOrders);
router.get('/:id',    order.getOrderById);

export default router;
