import { Router } from 'express';
import { SeedHandler } from './handler.js';

const router = Router();

// Allow triggering via GET or POST: /api/v1/seed and /api/v1/seed/run
router.get('/', SeedHandler.run);
router.post('/', SeedHandler.run);
router.get('/run', SeedHandler.run);
router.post('/run', SeedHandler.run);

export default router;
