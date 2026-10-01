import { Router } from 'express';
import { LogHandler } from './handler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { checkPermission, requireAdmin } from '../../middlewares/rbac.middleware.js';

const router = Router();

// All log inspection routes are protected
router.use(authenticate);

// View logs
router.get('/', checkPermission('logs', 'view'), LogHandler.getAll);
router.get('/stats', checkPermission('logs', 'view'), LogHandler.getStats);

// Delete / clear logs (strictly master admin)
router.delete('/clear', requireAdmin, LogHandler.clearOld);

export default router;
