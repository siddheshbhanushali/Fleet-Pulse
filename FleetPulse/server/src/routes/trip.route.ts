import { Router } from 'express';
import { createTrip, dispatchTrip, completeTrip, cancelTrip, getTrips } from '../controllers/trip.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', createTrip);
router.get('/', getTrips);
router.post('/:id/dispatch', dispatchTrip);
router.post('/:id/complete', completeTrip);
router.post('/:id/cancel', cancelTrip);

export default router;
