import { ChatService } from './service.js';

export const ChatHandler = {
  /**
   * Get public AI concierge configuration (bot name, active provider, quick questions, etc.)
   */
  async getConfig(req, res) {
    try {
      const config = await ChatService.getPublicConfig();
      return res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      console.error('[ChatHandler getConfig Error]', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch chat configuration.',
        error: error.message,
      });
    }
  },

  /**
   * Stream chat response using SSE (Server-Sent Events)
   */
  async streamChat(req, res) {
    const { message, history } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string.',
      });
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    if (typeof res.flushHeaders === 'function') {
      res.flushHeaders();
    }

    let isClosed = false;
    res.on('close', () => {
      isClosed = true;
    });

    try {
      await ChatService.streamChat({
        message,
        history: Array.isArray(history) ? history : [],
        onToken: (token) => {
          if (!isClosed && !res.writableEnded) {
            res.write(`data: ${JSON.stringify({ token })}\n\n`);
            if (typeof res.flush === 'function') res.flush();
          }
        },
        onComplete: (fullText) => {
          if (!isClosed && !res.writableEnded) {
            res.write(`data: ${JSON.stringify({ done: true, fullText })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
          }
        },
        onError: (err) => {
          if (!isClosed && !res.writableEnded) {
            res.write(`data: ${JSON.stringify({ error: err.message || 'Stream error' })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
          }
        },
      });
    } catch (err) {
      console.error('[ChatHandler streamChat Error]', err);
      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: 'Chat stream failed.',
          error: err.message,
        });
      }
      if (!isClosed && !res.writableEnded) {
        res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
      }
    }
  },
};
