import {
  createOrder as createOrderService,
  getMyOrders as getMyOrdersService,
  getOrderById as getOrderByIdService,
  acceptOrder as acceptOrderService,
  rejectOrder as rejectOrderService,
  deliverOrder as deliverOrderService,
  completeOrder as completeOrderService,
  cancelOrder as cancelOrderService,
} from '../services/order.service.js';

/**
 * POST /api/orders
 * Client places a new order for a service.
 */
export const createOrder = async (req, res) => {
  try {
    const clientId = req.user.id;
    const order = await createOrderService(clientId, req.body);

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to create order',
      error: error.message,
    });
  }
};

/**
 * GET /api/orders/my-orders
 * Returns all orders associated with the logged-in user (as client or freelancer).
 */
export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.user.role;
    const orders = await getMyOrdersService(userId, role);

    return res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      data: { count: orders.length, orders },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch orders',
      error: error.message,
    });
  }
};

/**
 * GET /api/orders/:orderId
 * Returns full details of a specific order if user is client or freelancer.
 */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await getOrderByIdService(orderId, userId);

    return res.status(200).json({
      success: true,
      message: 'Order fetched successfully',
      data: { order },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch order',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/orders/:orderId/accept
 * Freelancer accepts a pending order.
 */
export const acceptOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const freelancerId = req.user.id;

    const order = await acceptOrderService(orderId, freelancerId);

    return res.status(200).json({
      success: true,
      message: 'Order accepted successfully',
      data: { order },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to accept order',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/orders/:orderId/reject
 * Freelancer rejects a pending order.
 */
export const rejectOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const freelancerId = req.user.id;

    const order = await rejectOrderService(orderId, freelancerId);

    return res.status(200).json({
      success: true,
      message: 'Order rejected successfully',
      data: { order },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to reject order',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/orders/:orderId/deliver
 * Freelancer delivers an active order with a delivery note.
 */
export const deliverOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const freelancerId = req.user.id;
    const { deliveryNote } = req.body;

    const order = await deliverOrderService(orderId, freelancerId, deliveryNote);

    return res.status(200).json({
      success: true,
      message: 'Order marked as delivered successfully',
      data: { order },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to deliver order',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/orders/:orderId/complete
 * Client approves delivery and completes the order.
 */
export const completeOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const clientId = req.user.id;

    const order = await completeOrderService(orderId, clientId);

    return res.status(200).json({
      success: true,
      message: 'Order completed successfully',
      data: { order },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to complete order',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/orders/:orderId/cancel
 * Client or Freelancer cancels an uncompleted order.
 */
export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await cancelOrderService(orderId, userId);

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to cancel order',
      error: error.message,
    });
  }
};
