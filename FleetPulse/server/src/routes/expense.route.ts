import { Router } from 'express';
import { createFuelLog, createExpense, getFuelLogs, getExpenses } from '../controllers/expense.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/fuel', createFuelLog);
router.get('/fuel', getFuelLogs);

router.post('/', createExpense);
router.get('/', getExpenses);

export default router;
