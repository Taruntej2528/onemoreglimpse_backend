import { Router } from 'express';
import { UserHandler } from './handler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { checkPermission, requireAdmin } from '../../middlewares/rbac.middleware.js';

const router = Router();

// All user management routes require authentication
router.use(authenticate);

// View users (accessible by Admin or Sub-admins with 'users' view permission)
router.get('/', checkPermission('users', 'view'), UserHandler.getAll);
router.get('/:id', checkPermission('users', 'view'), UserHandler.getById);

// Manage users (requires edit/delete permission or Master Admin)
router.post('/', checkPermission('users', 'edit'), UserHandler.create);
router.put('/:id', checkPermission('users', 'edit'), UserHandler.update);
router.put('/:id/permissions', checkPermission('users', 'edit'), UserHandler.updatePermissions);
router.patch('/:id/status', checkPermission('users', 'edit'), UserHandler.toggleStatus);
router.delete('/:id', checkPermission('users', 'delete'), UserHandler.delete);

export default router;
