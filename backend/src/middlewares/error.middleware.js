import { ZodError } from 'zod';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';
import { env } from '../config/env.js';

const errorMiddleware = (err, req, res, next) => {
  let error = err;

  if (!(error instanceof ApiError)) {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Internal Server Error';
    let errors = [];

    if (error.name === 'CastError') {
      statusCode = 400;
      message = `Invalid value for field "${error.path}"`;
    } else if (error.code === 11000) {
      statusCode = 409;
      const field = Object.keys(error.keyValue || {})[0];
      message = `Duplicate value for field "${field}"`;
      errors = [{ field, message: `${field} already exists` }];
    } else if (error.name === 'ValidationError' && error.errors) {
      statusCode = 400;
      message = 'Validation failed';
      errors = Object.values(error.errors).map((e) => ({ field: e.path, message: e.message }));
    } else if (error instanceof ZodError) {
      statusCode = 400;
      message = 'Validation failed';
      errors = error.issues.map((issue) => ({ field: issue.path.join('.'), message: issue.message }));
    } else if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      statusCode = 401;
      message = 'Invalid or expired token';
    }

    error = new ApiError(statusCode, message, errors, err.stack);
  }

  logger.error(`${req.method} ${req.originalUrl} - ${error.statusCode} - ${error.message}`);

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
    ...(env.NODE_ENV === 'development' ? { stack: error.stack } : {}),
  });
};

export default errorMiddleware;
