import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller.js';

const router = express.Router();

// Fetch all notifications for logged-in user
router.get('/', protect, getMyNotifications);

// Fetch unread notification count
router.get('/unread-count', protect, getUnreadCount);

// Mark all notifications as read (registered BEFORE /:id/read to prevent route conflict)
router.patch('/read-all', protect, markAllAsRead);

// Mark single notification as read
router.patch('/:id/read', protect, markAsRead);

export default router;
