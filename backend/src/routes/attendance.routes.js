import { Router } from 'express';
import verifyJWT from '../middlewares/auth.middleware.js';
import authorize from '../middlewares/rbac.middleware.js';
import validate from '../middlewares/validate.middleware.js';
import { punchSchema, verifyAttendanceSchema } from '../validators/attendance.validator.js';
import {
  punchIn,
  punchOut,
  getToday,
  getMy,
  getTeam,
  getAll,
  getById,
  verify,
  statsSummary,
} from '../controllers/attendance.controller.js';

const router = Router();

router.use(verifyJWT);

router.post('/punch-in', authorize('employee'), validate(punchSchema), punchIn);
router.post('/punch-out', authorize('employee'), validate(punchSchema), punchOut);
router.get('/today', getToday);
router.get('/my', getMy);
router.get('/team', authorize('manager', 'admin'), getTeam);
router.get('/all', authorize('admin'), getAll);
router.get('/stats/summary', statsSummary);
router.get('/:id', getById);
router.patch('/:id/verify', authorize('manager', 'admin'), validate(verifyAttendanceSchema), verify);

export default router;
