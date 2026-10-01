import { Router } from 'express';

// Import individual controller routers
import authRoutes from './auth/route.js';
import userRoutes from './user/route.js';
import settingsRoutes from './settings/route.js';
import categoryRoutes from './category/route.js';
import mediaRoutes from './media/route.js';
import eventRoutes from './event/route.js';
import requestRoutes from './request/route.js';
import notificationRoutes from './notification/route.js';
import logRoutes from './log/route.js';
import seedRoutes from './seed/route.js';
import chatRoutes from './chat/route.js';

const mainRouter = Router();

// Health check endpoint
mainRouter.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Prazna Photography API is healthy and operational.',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// Mount module routes
mainRouter.use('/auth', authRoutes);
mainRouter.use('/users', userRoutes);
mainRouter.use('/settings', settingsRoutes);
mainRouter.use('/categories', categoryRoutes);
mainRouter.use('/media', mediaRoutes);
mainRouter.use('/events', eventRoutes);
mainRouter.use('/requests', requestRoutes);
mainRouter.use('/notifications', notificationRoutes);
mainRouter.use('/logs', logRoutes);
mainRouter.use('/seed', seedRoutes);
mainRouter.use('/chat', chatRoutes);

export default mainRouter;
