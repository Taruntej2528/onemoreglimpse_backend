import { Router } from 'express';
import { SettingsHandler } from './handler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { checkPermission } from '../../middlewares/rbac.middleware.js';

const router = Router();

// Publicly readable so frontend website can load live branding and hero configs
router.get('/', SettingsHandler.get);

// Protected mutation routes
router.put('/', authenticate, checkPermission('settings', 'edit'), SettingsHandler.update);
router.patch('/storage/switch', authenticate, checkPermission('settings', 'edit'), SettingsHandler.switchStorage);

export default router;
