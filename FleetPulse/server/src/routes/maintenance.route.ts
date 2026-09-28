import { Router } from 'express';
import { createMaintenanceLog, completeMaintenanceLog, getMaintenanceLogs } from '../controllers/maintenance.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createMaintenanceLog);
router.get('/', getMaintenanceLogs);
router.post('/:id/complete', completeMaintenanceLog);

export default router;
