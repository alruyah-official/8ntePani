const orderService = require('../services/order');
const Gig = require('../models/gig');

const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await orderService.findOrders(req.user.id, parseInt(page), parseInt(limit));
    res.json({ data: result.orders, total: result.total, page: result.page, limit: result.limit, message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getOrderById = async (req, res) => {
  try {
    const order = await orderService.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.buyerId.toString() !== req.user.id && order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    res.json({ data: order, message: 'Success' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const createOrder = async (req, res) => {
  try {
    const { gigId, packageType, requirements } = req.body;
    const gig = await Gig.findById(gigId).exec();
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }
    const packages = gig.packages;
    const selectedPackage = packages[packageType];
    if (!selectedPackage) {
      return res.status(400).json({ message: 'Invalid package type' });
    }
    const data = {
      gigId,
      buyerId: req.user.id,
      sellerId: gig.sellerId,
      packageType,
      requirements,
      price: selectedPackage.price,
      deliveryDays: selectedPackage.deliveryDays,
    };
    const order = await orderService.createOrder(data);
    res.status(201).json({ data: order, message: 'Order created successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await orderService.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Only seller can update status' });
    }
    if (!orderService.canTransition(order.status, status)) {
      return res.status(400).json({ message: 'Invalid status transition' });
    }
    const updatedOrder = await orderService.updateOrder(req.params.id, { status });
    if (status === 'completed') {
      await Gig.findByIdAndUpdate(order.gigId, { $inc: { orderCount: 1 } });
    }
    res.json({ data: updatedOrder, message: 'Order status updated' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const deliverOrder = async (req, res) => {
  try {
    const { deliveryNote, attachments } = req.body;
    const order = await orderService.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.sellerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (order.status !== 'in_progress') {
      return res.status(400).json({ message: 'Order must be in progress' });
    }
    const updatedOrder = await orderService.updateOrder(req.params.id, {
      status: 'delivered',
      deliveryNote,
      attachments
    });
    res.json({ data: updatedOrder, message: 'Order delivered' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const requestRevision = async (req, res) => {
  try {
    const order = await orderService.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Order must be delivered' });
    }
    const updatedOrder = await orderService.updateOrder(req.params.id, { status: 'revision' });
    res.json({ data: updatedOrder, message: 'Revision requested' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const completeOrder = async (req, res) => {
  try {
    const order = await orderService.findOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    if (order.buyerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    if (order.status !== 'delivered') {
      return res.status(400).json({ message: 'Order must be delivered' });
    }
    const updatedOrder = await orderService.updateOrder(req.params.id, {
      status: 'completed',
      completedAt: new Date()
    });
    await Gig.findByIdAndUpdate(order.gigId, { $inc: { orderCount: 1 } });
    res.json({ data: updatedOrder, message: 'Order completed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deliverOrder,
  requestRevision,
  completeOrder,
};