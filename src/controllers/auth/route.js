import { Router } from 'express';
import { AuthHandler } from './handler.js';
import { authenticate } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.post('/login', AuthHandler.login);

// Protected routes
router.get('/me', authenticate, AuthHandler.getMe);
router.post('/change-password', authenticate, AuthHandler.changePassword);

export default router;
