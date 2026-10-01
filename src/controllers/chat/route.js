import { Router } from 'express';
import { ChatHandler } from './handler.js';

const chatRouter = Router();

// Public route to get chat widget configuration (bot name, active provider, quick prompts)
chatRouter.get('/config', ChatHandler.getConfig);

// Public route to stream AI chat responses via Server-Sent Events
chatRouter.post('/stream', ChatHandler.streamChat);

export default chatRouter;
