import { Router } from 'express';
import { CategoryHandler } from './handler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { checkPermission } from '../../middlewares/rbac.middleware.js';

const router = Router();

// Public routes for portfolio display
router.get('/', CategoryHandler.getAll);
router.get('/active', CategoryHandler.getActive);
router.get('/:id', CategoryHandler.getById);

// Protected routes with RBAC module permission 'categories'
router.post('/', authenticate, checkPermission('categories', 'edit'), CategoryHandler.create);
router.put('/:id', authenticate, checkPermission('categories', 'edit'), CategoryHandler.update);
router.delete('/:id', authenticate, checkPermission('categories', 'delete'), CategoryHandler.delete);

export default router;
