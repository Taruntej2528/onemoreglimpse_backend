import { sendError } from '../utiles/helpers/response.helper.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle CORS blocked origin
  if (err.message && err.message.startsWith('CORS blocked')) {
    statusCode = 403;
    message = err.message;
  }

  // Handle Malformed JSON Body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON body syntax in request.';
  }

  // Handle JWT Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired. Please refresh your session.';
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Handle Mongoose Duplicate Key Error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}. Please use another value.`;
  }

  // Handle CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource identifier: ${err.value}`;
  }

  // Handle Multer upload limits
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 413;
    message = 'File size exceeds maximum permitted limit (100MB).';
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = `Unexpected upload file field: ${err.field || 'unknown'}.`;
  }

  return sendError(res, {
    statusCode,
    message,
    errors,
    stack: err.stack,
  });
};
