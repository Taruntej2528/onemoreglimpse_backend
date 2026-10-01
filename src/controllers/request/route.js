import { Router } from 'express';
import { ClientRequestHandler } from './handler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { checkPermission } from '../../middlewares/rbac.middleware.js';

const router = Router();

// Public route for couples submitting quotes and date inquiries
router.post('/submit', ClientRequestHandler.submit);

// Protected routes with RBAC module permission 'client_requests'
router.get('/', authenticate, checkPermission('client_requests', 'view'), ClientRequestHandler.getAll);
router.get('/:id', authenticate, checkPermission('client_requests', 'view'), ClientRequestHandler.getById);
router.patch('/:id/status', authenticate, checkPermission('client_requests', 'edit'), ClientRequestHandler.updateStatus);
router.delete('/:id', authenticate, checkPermission('client_requests', 'delete'), ClientRequestHandler.delete);

export default router;
