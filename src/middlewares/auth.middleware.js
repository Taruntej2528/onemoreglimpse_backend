import { verifyToken } from '../utiles/helpers/jwt.helper.js';
import { User } from '../utiles/models/User.js';
import { sendError } from '../utiles/helpers/response.helper.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, {
        statusCode: 401,
        message: 'Authentication token missing or invalid format. Please log in.',
      });
    }

    const token = authHeader.split(' ')[1];
    let decoded;

    try {
      decoded = verifyToken(token);
    } catch (err) {
      return sendError(res, {
        statusCode: 401,
        message: err.name === 'TokenExpiredError' ? 'Token expired. Please log in again.' : 'Invalid token signature.',
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, {
        statusCode: 401,
        message: 'User belonging to this token no longer exists.',
      });
    }

    if (user.status !== 'ACTIVE') {
      return sendError(res, {
        statusCode: 403,
        message: 'Your account is deactivated. Please contact the administrator.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
