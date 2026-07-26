import {
  getMyNotifications as getMyNotificationsService,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService,
  getUnreadCount as getUnreadCountService,
} from '../services/notification.service.js';

/**
 * GET /api/notifications
 * Returns all notifications for the authenticated user.
 */
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await getMyNotificationsService(userId);

    return res.status(200).json({
      success: true,
      message: 'Notifications fetched successfully',
      data: { count: notifications.length, notifications },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch notifications',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Marks a specific notification as read.
 */
export const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const notification = await markAsReadService(notificationId, userId);

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: { notification },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to mark notification as read',
      error: error.message,
    });
  }
};

/**
 * PATCH /api/notifications/read-all
 * Marks all unread notifications for the user as read.
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await markAllAsReadService(userId);

    return res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      data: { count },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to mark all notifications as read',
      error: error.message,
    });
  }
};

/**
 * GET /api/notifications/unread-count
 * Returns the unread notification count for the user.
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const count = await getUnreadCountService(userId);

    return res.status(200).json({
      success: true,
      message: 'Unread notification count fetched successfully',
      data: { count },
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Failed to fetch unread count',
      error: error.message,
    });
  }
};
