import { Router } from 'express';
import { getDashboardKPIs } from '../controllers/dashboard.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getDashboardKPIs);

export default router;
