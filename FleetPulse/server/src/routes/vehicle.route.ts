import { Router } from 'express';
import { createVehicle, getVehicles, getVehicleById, updateVehicle, deleteVehicle } from '../controllers/vehicle.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate); // Protect all vehicle routes

router.post('/', createVehicle);
router.get('/', getVehicles);
router.get('/:id', getVehicleById);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
