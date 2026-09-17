import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import * as notif from '../controllers/notificationController.js';

const router = Router();

router.use(protect); // all notification routes require auth

router.get ('/',              notif.getNotifications);
router.get ('/unread-count',  notif.getUnreadCount);
router.patch('/read-all',     notif.markAllRead);
router.patch('/:id/read',     notif.markRead);
router.delete('/:id',         notif.deleteNotification);

export default router;
