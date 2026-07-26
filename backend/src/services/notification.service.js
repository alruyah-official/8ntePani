import prisma from '../config/prisma.js';
import { AppError } from '../utils/AppError.js';

/**
 * Creates a new notification record in the database.
 * Never throws — wraps DB operations in try/catch and logs silently on error.
 *
 * @param {string} userId
 * @param {string} type
 * @param {string} title
 * @param {string} message
 * @param {string} [relatedId]
 * @returns {Promise<object|null>} Created notification or null on failure
 */
export const createNotification = async (userId, type, title, message, relatedId = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        relatedId,
      },
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
    return null;
  }
};

/**
 * Fetches all notifications for a specific user, newest first.
 *
 * @param {string} userId
 * @returns {Promise<object[]>} Array of notifications
 */
export const getMyNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Marks a single notification as read if it belongs to the specified user.
 *
 * @param {string} notificationId
 * @param {string} userId
 * @returns {Promise<object>} Updated notification
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification) {
    throw new AppError('Notification not found', 404);
  }

  if (notification.userId !== userId) {
    throw new AppError('You are not authorized to access this notification', 403);
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });

  return updated;
};

/**
 * Marks all unread notifications for a specific user as read.
 *
 * @param {string} userId
 * @returns {Promise<{ count: number }>} Object containing count of updated records
 */
export const markAllAsRead = async (userId) => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  return result.count;
};

/**
 * Gets count of unread notifications for a specific user.
 *
 * @param {string} userId
 * @returns {Promise<number>} Unread count number
 */
export const getUnreadCount = async (userId) => {
  return prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });
};
