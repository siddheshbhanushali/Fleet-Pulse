import { Router } from 'express';
import { createDriver, getDrivers, getDriverById, updateDriver, deleteDriver } from '../controllers/driver.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createDriver);
router.get('/', getDrivers);
router.get('/:id', getDriverById);
router.put('/:id', updateDriver);
router.delete('/:id', deleteDriver);

export default router;
