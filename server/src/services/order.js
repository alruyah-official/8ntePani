const prisma = require('../config/database');

const createOrder = async (data) => {
  return await prisma.order.create({ data });
};

const updateOrder = async (id, data) => {
  return await prisma.order.update({ where: { id }, data });
};

const findOrderById = async (id) => {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      gig: { select: { title: true, images: true } },
      buyer: { select: { name: true, avatar: true } },
      seller: { select: { name: true, avatar: true } },
      reviews: true
    }
  });
};

const findOrders = async (userId, page = 1, limit = 10) => {
  const where = {
    OR: [
      { buyerId: userId },
      { sellerId: userId }
    ]
  };
  const total = await prisma.order.count({ where });
  const orders = await prisma.order.findMany({
    where,
    include: {
      gig: { select: { title: true, images: true } },
      buyer: { select: { name: true } },
      seller: { select: { name: true } }
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });
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