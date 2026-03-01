import express from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authorizedMiddleware } from '../middleware/authorization.middleware';

const router = express.Router();

router.get('/', authorizedMiddleware, NotificationController.getNotifications);
router.get('/unread-count', authorizedMiddleware, NotificationController.getUnreadCount);
router.patch('/:notificationId/read', authorizedMiddleware, NotificationController.markAsRead);
router.patch('/mark-all-read', authorizedMiddleware, NotificationController.markAllRead);
// Mobile app compatibility alias
router.patch('/read-all', authorizedMiddleware, NotificationController.markAllRead);
router.delete('/:notificationId', authorizedMiddleware, NotificationController.deleteNotification);

export default router;
