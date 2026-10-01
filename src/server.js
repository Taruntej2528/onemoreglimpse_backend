import http from 'http';
import { WebSocketServer } from 'ws';
import app from './app.js';
import { ENV } from './config/env.js';
import { connectDB } from './config/db.js';
import { ChatService } from './controllers/chat/service.js';

const startServer = async () => {
  try {
    // 1. Connect to Database
    await connectDB();

    // 2. Create HTTP server
    const server = http.createServer(app);

    // 3. Attach WebSocket Server for real-time streaming chat
    const wss = new WebSocketServer({ server, path: '/ws/chat' });

    wss.on('connection', (ws, req) => {
      console.log(`[WebSocket] New client connected to /ws/chat from ${req.socket.remoteAddress}`);

      ws.on('message', async (data) => {
        try {
          const payload = JSON.parse(data.toString());

          if (payload.type === 'ping') {
            return ws.send(JSON.stringify({ type: 'pong' }));
          }

          if (payload.type === 'chat' || payload.message) {
            const message = payload.message || '';
            const history = Array.isArray(payload.history) ? payload.history : [];

            if (!message.trim()) {
              return ws.send(JSON.stringify({ type: 'error', error: 'Empty message' }));
            }

            await ChatService.streamChat({
              message,
              history,
              onToken: (token) => {
                if (ws.readyState === ws.OPEN) {
                  ws.send(JSON.stringify({ type: 'token', token }));
                }
              },
              onComplete: (fullText) => {
                if (ws.readyState === ws.OPEN) {
                  ws.send(JSON.stringify({ type: 'done', fullText }));
                }
              },
              onError: (err) => {
                if (ws.readyState === ws.OPEN) {
                  ws.send(JSON.stringify({ type: 'error', error: err.message || 'Streaming failed' }));
                }
              },
            });
          }
        } catch (parseError) {
          console.error('[WebSocket message parse error]', parseError);
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: 'error', error: 'Invalid message JSON' }));
          }
        }
      });

      ws.on('close', () => {
        console.log('[WebSocket] Client disconnected from /ws/chat');
      });

      ws.on('error', (err) => {
        console.error('[WebSocket error]', err);
      });
    });

    server.listen(ENV.PORT, () => {
      console.log('====================================================');
      console.log(`[Prazna Photography Backend] Server running on port ${ENV.PORT}`);
      console.log(`[Mode] ${ENV.NODE_ENV.toUpperCase()}`);
      console.log(`[Active Storage] ${ENV.ACTIVE_STORAGE_PROVIDER}`);
      console.log(`[API Base] http://localhost:${ENV.PORT}/api/v1`);
      console.log(`[Health] http://localhost:${ENV.PORT}/api/v1/health`);
      console.log(`[WebSocket Chat] ws://localhost:${ENV.PORT}/ws/chat`);
      console.log('====================================================');
    });

    // Graceful Shutdown
    const handleShutdown = (signal) => {
      console.log(`\n[Server] Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        console.log('[Server] HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', () => handleShutdown('SIGINT'));
    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  } catch (error) {
    console.error(`[Fatal Server Error] ${error.message}`);
    process.exit(1);
  }
};

startServer();
