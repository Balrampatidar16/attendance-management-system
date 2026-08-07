import { Router } from 'express';
import verifyJWT from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { requestOvertimeSchema, reviewOvertimeSchema } from '../validators/overtime.validator.js';
import { create, getMy, getPending, getAll, review } from '../controllers/overtime.controller.js';

const router = Router();

router.use(verifyJWT);

router.post('/', authorize('employee'), validate(requestOvertimeSchema), create);
router.get('/my', authorize('employee'), getMy);
router.get('/pending', authorize('manager', 'admin'), getPending);
router.get('/all', authorize('admin'), getAll);
router.patch('/:id/review', authorize('manager', 'admin'), validate(reviewOvertimeSchema), review);

export default router;
