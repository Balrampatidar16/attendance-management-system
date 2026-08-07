import { Router } from 'express';
import verifyJWT from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { updateUserSchema } from '../validators/user.validator.js';
import {
  getAllUsers,
  getMyTeam,
  getUserById,
  updateUser,
  deleteUser,
} from '../controllers/user.controller.js';

const router = Router();

router.use(verifyJWT);

router.get('/', authorize('admin'), getAllUsers);
router.get('/team', authorize('manager', 'admin'), getMyTeam);
router.get('/:id', authorize('admin', 'manager'), getUserById);
router.patch('/:id', authorize('admin'), validate(updateUserSchema), updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

export default router;
