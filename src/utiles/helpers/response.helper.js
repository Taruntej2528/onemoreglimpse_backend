/**
 * Global standardized response format for Prazna Photography API
 */

export const sendSuccess = (
  res,
  {
    statusCode = 200,
    message = 'Request completed successfully',
    data = null,
    meta = null,
  } = {}
) => {
  const response = {
    success: true,
    statusCode,
    message,
    data,
    ...(meta && { meta }),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};

export const sendError = (
  res,
  {
    statusCode = 500,
    message = 'An unexpected error occurred',
    errors = null,
    stack = null,
  } = {}
) => {
  const response = {
    success: false,
    statusCode,
    message,
    ...(errors && { errors }),
    ...(stack && process.env.NODE_ENV !== 'production' && { stack }),
    timestamp: new Date().toISOString(),
  };

  return res.status(statusCode).json(response);
};
