import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import attendanceRoutes from './attendance.routes.js';
import overtimeRoutes from './overtime.routes.js';
import reportRoutes from './report.routes.js';
import notificationRoutes from './notification.routes.js';

const router = Router();

router.get(
  '/health',
  asyncHandler(async (req, res) => {
    return res.status(200).json(
      new ApiResponse(200, 'Server is healthy', {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      })
    );
  })
);

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/overtime', overtimeRoutes);
router.use('/reports', reportRoutes);
router.use('/notifications', notificationRoutes);

export default router;
