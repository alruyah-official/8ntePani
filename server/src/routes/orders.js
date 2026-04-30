const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/auth');
const orderController = require('../controllers/order');

router.get('/', authenticate, orderController.getOrders);
router.get('/:id', authenticate, orderController.getOrderById);
router.post('/', authenticate, orderController.createOrder);
router.patch('/:id/status', authenticate, orderController.updateOrderStatus);
router.post('/:id/deliver', authenticate, orderController.deliverOrder);
router.post('/:id/revision', authenticate, orderController.requestRevision);
router.post('/:id/complete', authenticate, orderController.completeOrder);

module.exports = router;