import { Router } from 'express';
import { EventHandler } from './handler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { checkPermission } from '../../middlewares/rbac.middleware.js';

const router = Router();

// Public routes for website pricing and booking calculators
router.get('/', EventHandler.getAll);
router.get('/packages/active', EventHandler.getActivePackages);
router.get('/:id', EventHandler.getById);

// Protected routes with RBAC module permission 'events'
router.post('/', authenticate, checkPermission('events', 'edit'), EventHandler.create);
router.put('/:id', authenticate, checkPermission('events', 'edit'), EventHandler.update);
router.delete('/:id', authenticate, checkPermission('events', 'delete'), EventHandler.delete);

export default router;
