import { Router } from 'express';
import verifyJWT from '../middlewares/auth.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { loginRateLimiter } from '../middlewares/rateLimit.middleware.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
} from '../validators/auth.validator.js';
import {
  register,
  login,
  logout,
  refreshTokenHandler,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', loginRateLimiter, validate(loginSchema), login);
router.post('/logout', verifyJWT, logout);
router.post('/refresh-token', refreshTokenHandler);
router.get('/me', verifyJWT, getMe);
router.patch('/update-profile', verifyJWT, validate(updateProfileSchema), updateProfile);
router.patch('/change-password', verifyJWT, validate(changePasswordSchema), changePassword);

export default router;
