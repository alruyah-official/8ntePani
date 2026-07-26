import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { restrictTo } from '../middlewares/role.middleware.js';
import { validate } from '../middlewares/validate.middleware.js';
import {
  createOrderSchema,
  deliverOrderSchema,
} from '../validators/order.validator.js';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  acceptOrder,
  rejectOrder,
  deliverOrder,
  completeOrder,
  cancelOrder,
} from '../controllers/order.controller.js';

const router = express.Router();

// Create new order (Client only)
router.post('/', protect, restrictTo('CLIENT'), validate(createOrderSchema), createOrder);

// Get user's orders (Registered BEFORE /:orderId to prevent route conflict)
router.get('/my-orders', protect, getMyOrders);

// Get single order by ID
router.get('/:orderId', protect, getOrderById);

// Accept pending order (Freelancer only)
router.patch('/:orderId/accept', protect, restrictTo('FREELANCER'), acceptOrder);

// Reject pending order (Freelancer only)
router.patch('/:orderId/reject', protect, restrictTo('FREELANCER'), rejectOrder);

// Deliver active order (Freelancer only)
router.patch('/:orderId/deliver', protect, restrictTo('FREELANCER'), validate(deliverOrderSchema), deliverOrder);

// Complete delivered order (Client only)
router.patch('/:orderId/complete', protect, restrictTo('CLIENT'), completeOrder);

// Cancel order (Client or Freelancer)
router.patch('/:orderId/cancel', protect, cancelOrder);

export default router;
