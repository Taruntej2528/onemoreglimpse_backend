import { Router } from 'express';
import { NotificationHandler } from './handler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { checkPermission } from '../../middlewares/rbac.middleware.js';

const router = Router();

// All notification routes are protected
router.use(authenticate);

// View notifications
router.get('/', checkPermission('notifications', 'view'), NotificationHandler.getAll);
router.get('/unread-count', checkPermission('notifications', 'view'), NotificationHandler.getUnreadCount);

// Manage notifications
router.patch('/:id/read', checkPermission('notifications', 'edit'), NotificationHandler.markAsRead);
router.patch('/read-all', checkPermission('notifications', 'edit'), NotificationHandler.markAllAsRead);
router.delete('/:id', checkPermission('notifications', 'delete'), NotificationHandler.delete);

export default router;
