import { Router } from 'express';
import verifyJWT from '../middlewares/auth.middleware.js';
import { daily, range, exportExcel, exportPdf } from '../controllers/report.controller.js';

const router = Router();

router.use(verifyJWT);

router.get('/daily', daily);
router.get('/range', range);
router.get('/export/excel', exportExcel);
router.get('/export/pdf', exportPdf);

export default router;
