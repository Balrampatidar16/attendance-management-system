import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new ApiError(429, 'Too many login attempts. Please try again in a few minutes.'));
  },
});
