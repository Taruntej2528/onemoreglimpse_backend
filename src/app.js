import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { ENV } from './config/env.js';
import { requestLogger } from './middlewares/requestLog.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';
import mainRouter from './controllers/main.route.js';

const app = express();

// 1. Security Headers (configured to allow cross-origin media rendering)
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

// 2. Comprehensive CORS configuration
const allowedOrigins = [
  ENV.CLIENT_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:4173',
  'http://127.0.0.1:4173',
].filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (Postman, curl, server-to-server, mobile native)
    if (!origin) {
      return callback(null, true);
    }

    // Allow any localhost / 127.0.0.1 or local network IPv4 address during development
    const isLocalOrLan = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)(:\d+)?$/.test(
      origin
    );
    if (isLocalOrLan) {
      return callback(null, true);
    }

    // Check explicit allowed origins list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In development or staging, dynamically reflect origin
    if (ENV.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    // Reject unapproved origin in production
    return callback(new Error(`CORS blocked request from unapproved origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Cache-Control',
    'Range',
    'X-File-Name',
  ],
  exposedHeaders: [
    'Content-Range',
    'X-Content-Range',
    'Content-Length',
    'ETag',
    'Authorization',
  ],
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 hour preflight caching
};

app.use(cors(corsOptions));
// Handle preflight OPTIONS for all routes
app.options('*', cors(corsOptions));

// 3. Body Parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 4. Static directory for local media uploads with Cross-Origin headers
const uploadsDir = path.resolve(process.cwd(), ENV.LOCAL.UPLOAD_DIR);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use(
  '/uploads',
  (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    next();
  },
  express.static(uploadsDir)
);

// Request logging to Console and MongoDB AuditLog collection
app.use(requestLogger);

// Mount main controller route
app.use('/api/v1', mainRouter);

// Root Welcome Route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Prazna Photography API Portal',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    statusCode: 404,
    message: `Resource not found on endpoint: ${req.method} ${req.originalUrl}`,
    timestamp: new Date().toISOString(),
  });
});

// Global Error Handler
app.use(errorHandler);

export default app;
