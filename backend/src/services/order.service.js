import prisma from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';
import { createNotification } from './notification.service.js';
import { sendNewOrderEmail, sendOrderStatusEmail } from '../utils/email.utils.js';

const USER_SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  avatar: true,
};

const SERVICE_SAFE_SELECT = {
  id: true,
  title: true,
  price: true,
  images: true,
};

/**
 * Creates a new Order, sends notification & email to freelancer,
 * and automatically starts a conversation thread with a initial requirement message.
 *
 * @param {string} clientId
 * @param {object} data - { serviceId, requirements }
 * @returns {Promise<object>} Created order
 */
export const createOrder = async (clientId, data) => {
  const { serviceId, requirements } = data;

  // 1. Find target service along with freelancer details
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      freelancer: {
        select: USER_SAFE_SELECT,
      },
    },
  });

  if (!service) {
    throw new AppError('Service not found', 404);
  }

  // 2. Client cannot order their own service
  if (service.freelancerId === clientId) {
    throw new AppError('You cannot order your own service', 400);
  }

  // 3. Fetch client details for notification and email content
  const client = await prisma.user.findUnique({
    where: { id: clientId },
    select: USER_SAFE_SELECT,
  });

  if (!client) {
    throw new AppError('Client user not found', 404);
  }

  // 4. Create Order in database
  const order = await prisma.order.create({
    data: {
      clientId,
      freelancerId: service.freelancerId,
      serviceId,
      requirements,
      price: service.price,
      status: 'PENDING',
    },
    include: {
      client: { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      service: { select: SERVICE_SAFE_SELECT },
    },
  });

  // 5. Create notification for freelancer (fire and forget / robust)
  createNotification(
    service.freelancerId,
    'NEW_ORDER',
    'New Order Received',
    `${client.name} placed an order for ${service.title}`,
    order.id
  ).catch(console.error);

  // 6. Send email to freelancer (async, non-blocking)
  sendNewOrderEmail(service.freelancer.email, {
    freelancerName: service.freelancer.name,
    clientName: client.name,
    serviceTitle: service.title,
    requirements,
    price: service.price,
    orderId: order.id,
  }).catch(console.error);

  // 7. Start/find conversation automatically and post first message
  try {
    let conversation = await prisma.conversation.findFirst({
      where: {
        clientId,
        freelancerId: service.freelancerId,
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          clientId,
          freelancerId: service.freelancerId,
        },
      });
    }

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: clientId,
        content: `Hi! I have placed an order for '${service.title}'. Here are my requirements: ${requirements}`,
      },
    });
  } catch (convErr) {
    console.error('Failed to auto-create conversation or message:', convErr.message);
  }

  return order;
};

/**
 * Returns all orders where the user is either the client or freelancer.
 *
 * @param {string} userId
 * @param {string} role - 'CLIENT' | 'FREELANCER'
 * @returns {Promise<object[]>} Array of orders
 */
export const getMyOrders = async (userId, role) => {
  const whereClause =
    role === 'CLIENT' ? { clientId: userId } : { freelancerId: userId };

  return prisma.order.findMany({
    where: whereClause,
    include: {
      client: { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      service: { select: SERVICE_SAFE_SELECT },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Returns a specific order by ID if the requesting user is client or freelancer.
 *
 * @param {string} orderId
 * @param {string} userId
 * @returns {Promise<object>} Order details
 */
export const getOrderById = async (orderId, userId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      client: { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      service: { select: SERVICE_SAFE_SELECT },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.clientId !== userId && order.freelancerId !== userId) {
    throw new AppError('You are not authorized to view this order', 403);
  }

  return order;
};

/**
 * Freelancer accepts a pending order.
 *
 * @param {string} orderId
 * @param {string} freelancerId
 * @returns {Promise<object>} Updated order
 */
export const acceptOrder = async (orderId, freelancerId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      client: { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      service: { select: SERVICE_SAFE_SELECT },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.freelancerId !== freelancerId) {
    throw new AppError('You are not authorized to accept this order', 403);
  }

  if (order.status !== 'PENDING') {
    throw new AppError('This order cannot be accepted', 400);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'ACTIVE' },
    include: {
      client: { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      service: { select: SERVICE_SAFE_SELECT },
    },
  });

  // Create notification for client
  createNotification(
    order.clientId,
    'ORDER_ACCEPTED',
    'Order Accepted',
    `Your order for '${order.service.title}' has been accepted`,
    orderId
  ).catch(console.error);

  // Send status email to client
  sendOrderStatusEmail(order.client.email, {
    recipientName: order.client.name,
    status: 'ACTIVE',
    serviceTitle: order.service.title,
    orderId,
  }).catch(console.error);

  return updatedOrder;
};

/**
 * Freelancer rejects a pending order.
 *
 * @param {string} orderId
 * @param {string} freelancerId
 * @returns {Promise<object>} Updated order
 */
export const rejectOrder = async (orderId, freelancerId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      client: { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      service: { select: SERVICE_SAFE_SELECT },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.freelancerId !== freelancerId) {
    throw new AppError('You are not authorized to reject this order', 403);
  }

  if (order.status !== 'PENDING') {
    throw new AppError('This order cannot be rejected', 400);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'REJECTED' },
    include: {
      client: { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      service: { select: SERVICE_SAFE_SELECT },
    },
  });

  // Create notification for client
  createNotification(
    order.clientId,
    'ORDER_REJECTED',
    'Order Rejected',
    `Your order for '${order.service.title}' has been rejected by the freelancer`,
    orderId
  ).catch(console.error);

  // Send status email to client
  sendOrderStatusEmail(order.client.email, {
    recipientName: order.client.name,
    status: 'REJECTED',
    serviceTitle: order.service.title,
    orderId,
  }).catch(console.error);

  return updatedOrder;
};

/**
 * Freelancer delivers an active order with a delivery note.
 *
 * @param {string} orderId
 * @param {string} freelancerId
 * @param {string} deliveryNote
 * @returns {Promise<object>} Updated order
 */
export const deliverOrder = async (orderId, freelancerId, deliveryNote) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      client: { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      service: { select: SERVICE_SAFE_SELECT },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.freelancerId !== freelancerId) {
    throw new AppError('You are not authorized to deliver this order', 403);
  }

  if (order.status !== 'ACTIVE') {
    throw new AppError('Only active orders can be marked as delivered', 400);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      status: 'DELIVERED',
      deliveryNote,
    },
    include: {
      client: { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      service: { select: SERVICE_SAFE_SELECT },
    },
  });

  // Create notification for client
  createNotification(
    order.clientId,
    'ORDER_DELIVERED',
    'Order Delivered',
    `Your order for '${order.service.title}' has been delivered. Please review and approve.`,
    orderId
  ).catch(console.error);

  // Send status email to client
  sendOrderStatusEmail(order.client.email, {
    recipientName: order.client.name,
    status: 'DELIVERED',
    serviceTitle: order.service.title,
    orderId,
  }).catch(console.error);

  return updatedOrder;
};

/**
 * Client approves delivery and completes order.
 *
 * @param {string} orderId
 * @param {string} clientId
 * @returns {Promise<object>} Updated order
 */
export const completeOrder = async (orderId, clientId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      client: { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      service: { select: SERVICE_SAFE_SELECT },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.clientId !== clientId) {
    throw new AppError('You are not authorized to complete this order', 403);
  }

  if (order.status !== 'DELIVERED') {
    throw new AppError('Only delivered orders can be marked as complete', 400);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'COMPLETED' },
    include: {
      client: { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      service: { select: SERVICE_SAFE_SELECT },
    },
  });

  // Create notification for freelancer
  createNotification(
    order.freelancerId,
    'ORDER_COMPLETED',
    'Order Completed',
    `Your delivery for '${order.service.title}' has been approved`,
    orderId
  ).catch(console.error);

  // Send status email to freelancer
  sendOrderStatusEmail(order.freelancer.email, {
    recipientName: order.freelancer.name,
    status: 'COMPLETED',
    serviceTitle: order.service.title,
    orderId,
  }).catch(console.error);

  return updatedOrder;
};

/**
 * Client or Freelancer cancels an order (if not completed or delivered).
 *
 * @param {string} orderId
 * @param {string} userId
 * @returns {Promise<object>} Updated order
 */
export const cancelOrder = async (orderId, userId) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      client: { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      service: { select: SERVICE_SAFE_SELECT },
    },
  });

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.clientId !== userId && order.freelancerId !== userId) {
    throw new AppError('You are not authorized to cancel this order', 403);
  }

  if (order.status === 'COMPLETED') {
    throw new AppError('Completed orders cannot be cancelled', 400);
  }

  if (order.status === 'DELIVERED') {
    throw new AppError('Please approve or dispute the delivery before cancelling', 400);
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: 'CANCELLED' },
    include: {
      client: { select: USER_SAFE_SELECT },
      freelancer: { select: USER_SAFE_SELECT },
      service: { select: SERVICE_SAFE_SELECT },
    },
  });

  // Determine recipient to notify
  const isClient = userId === order.clientId;
  const notifyUserId = isClient ? order.freelancerId : order.clientId;
  const recipientEmail = isClient ? order.freelancer.email : order.client.email;
  const recipientName = isClient ? order.freelancer.name : order.client.name;

  createNotification(
    notifyUserId,
    'ORDER_CANCELLED',
    'Order Cancelled',
    `Order for '${order.service.title}' has been cancelled`,
    orderId
  ).catch(console.error);

  sendOrderStatusEmail(recipientEmail, {
    recipientName,
    status: 'CANCELLED',
    serviceTitle: order.service.title,
    orderId,
  }).catch(console.error);

  return updatedOrder;
};
