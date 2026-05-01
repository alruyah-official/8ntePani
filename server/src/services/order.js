const Order = require('../models/order');

const createOrder = async (data) => {
  return await Order.create(data);
};

const updateOrder = async (id, data) => {
  return await Order.findByIdAndUpdate(id, data, { new: true });
};

const findOrderById = async (id) => {
  return await Order.findById(id)
    .populate('gig', 'title images')
    .populate('buyer', 'name avatar')
    .populate('seller', 'name avatar')
    .populate('reviews')
    .exec();
};

const findOrders = async (userId, page = 1, limit = 10) => {
  const query = {
    $or: [
      { buyerId: userId },
      { sellerId: userId }
    ]
  };
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('gig', 'title images')
    .populate('buyer', 'name')
    .populate('seller', 'name')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .exec();
  return { orders, total, page, limit };
};

const canTransition = (currentStatus, newStatus) => {
  const transitions = {
    pending: ['in_progress', 'cancelled'],
    in_progress: ['delivered', 'cancelled'],
    delivered: ['revision', 'completed'],
    revision: ['delivered'],
    completed: [],
    cancelled: []
  };
  return transitions[currentStatus]?.includes(newStatus) || false;
};

module.exports = {
  createOrder,
  updateOrder,
  findOrderById,
  findOrders,
  canTransition,
};