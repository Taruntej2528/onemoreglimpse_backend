import { Router } from 'express';
import { MediaHandler } from './handler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { checkPermission } from '../../middlewares/rbac.middleware.js';
import { upload } from '../../middlewares/upload.middleware.js';

const router = Router();

// Public routes for portfolio & hero display
router.get('/', MediaHandler.getAll);
router.get('/:id', MediaHandler.getById);

// Public upload route for website client inquiries & moodboard attachments (images and videos)
router.post('/upload-public', upload.single('file'), MediaHandler.uploadPublic);

// Protected routes with RBAC module permission 'media'
router.post(
  '/upload',
  authenticate,
  checkPermission('media', 'edit'),
  upload.single('file'),
  MediaHandler.upload
);

router.patch(
  '/:id/hero-active',
  authenticate,
  checkPermission('media', 'edit'),
  MediaHandler.setHeroActive
);

router.put('/:id', authenticate, checkPermission('media', 'edit'), MediaHandler.update);
router.delete('/:id', authenticate, checkPermission('media', 'delete'), MediaHandler.delete);

export default router;
