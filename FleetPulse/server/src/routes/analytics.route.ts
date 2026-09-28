import { Router } from 'express';
import { getDashboardAnalytics, getOverview } from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Allow authenticated users to view analytics
router.get('/dashboard', authenticate, getDashboardAnalytics);
router.get('/overview', authenticate, getOverview);

export default router;
