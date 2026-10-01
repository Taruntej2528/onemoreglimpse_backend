import { AuditLog } from '../utiles/models/AuditLog.js';

export const requestLogger = (req, res, next) => {
  const startTime = Date.now();

  // Capture original res.end to measure duration and log when complete
  const originalEnd = res.end;

  res.end = function (...args) {
    originalEnd.apply(res, args);

    const durationMs = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Detect module from URL path
    const urlParts = req.originalUrl.split('?')[0].split('/').filter(Boolean);
    const moduleName = urlParts[2] || urlParts[1] || 'general';

    // Mask sensitive body fields
    let sanitizedBody = null;
    if (req.body && typeof req.body === 'object') {
      sanitizedBody = { ...req.body };
      if (sanitizedBody.password) sanitizedBody.password = '***[REDACTED]***';
      if (sanitizedBody.newPassword) sanitizedBody.newPassword = '***[REDACTED]***';
      if (sanitizedBody.token) sanitizedBody.token = '***[REDACTED]***';
    }

    // Determine action name
    const action = `${req.method}_${moduleName.toUpperCase()}`;

    // Color code console log
    const statusColor =
      statusCode >= 500
        ? '\x1b[31m' // Red
        : statusCode >= 400
        ? '\x1b[33m' // Yellow
        : statusCode >= 300
        ? '\x1b[36m' // Cyan
        : '\x1b[32m'; // Green
    const resetColor = '\x1b[0m';

    console.log(
      `[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl} ${statusColor}${statusCode}${resetColor} - ${durationMs}ms`
    );

    // Save asynchronously to AuditLog collection in MongoDB
    // Skip GET, HEAD, OPTIONS and static assets - only audit state-changing mutations
    const isMutationMethod = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
    const isExcludedPath =
      req.originalUrl.startsWith('/uploads') ||
      req.originalUrl.startsWith('/favicon') ||
      req.originalUrl.startsWith('/api/v1/health');

    if (isMutationMethod && !isExcludedPath) {
      AuditLog.create({
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '',
        userAgent: req.headers['user-agent'] || '',
        user: req.user?._id || null,
        userEmail: req.user?.email || 'Anonymous',
        userRole: req.user?.role || 'ANONYMOUS',
        action,
        module: moduleName,
        statusCode,
        durationMs,
        requestBody: sanitizedBody,
        responseSummary: res.statusMessage || `HTTP ${statusCode}`,
      }).catch((err) => {
        // Silently catch logging error so it never affects client responses
        if (process.env.NODE_ENV !== 'production') {
          console.debug(`[AuditLog write error] ${err.message}`);
        }
      });
    }
  };

  next();
};
