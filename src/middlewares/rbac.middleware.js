import { sendError } from '../utiles/helpers/response.helper.js';

/**
 * Restrict route strictly to ADMIN role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'ADMIN') {
    return sendError(res, {
      statusCode: 403,
      message: 'Access denied. Administrator privileges required.',
    });
  }
  next();
};

/**
 * Access management middleware: verifies permission for a specific module and action
 * @param {string} moduleName - Module name (e.g. 'media', 'events', 'client_requests', 'settings', 'categories')
 * @param {'view' | 'edit' | 'delete'} action - Action to perform
 */
export const checkPermission = (moduleName, action = 'view') => {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, {
        statusCode: 401,
        message: 'Unauthenticated user.',
      });
    }

    // Master Admin has universal access to all modules and actions
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // Sub-admin permission verification
    const hasAccess = req.user.hasPermission(moduleName, action);

    if (!hasAccess) {
      return sendError(res, {
        statusCode: 403,
        message: `Access denied. You do not have permission to ${action} the '${moduleName}' module.`,
      });
    }

    next();
  };
};
