import { Router } from 'express';
import verifyJWT from '../middlewares/auth.middleware.js';
import { getMyNotifications, markRead, markAllRead } from '../controllers/notification.controller.js';

const router = Router();

router.use(verifyJWT);

router.get('/', getMyNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markRead);

export default router;
