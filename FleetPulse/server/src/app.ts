import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import healthRoutes from './routes/health.route';
import { errorHandler } from './middlewares/errorHandler';

const app: Application = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
import authRoutes from './routes/auth.route';
import vehicleRoutes from './routes/vehicle.route';
import driverRoutes from './routes/driver.route';
import tripRoutes from './routes/trip.route';
import maintenanceRoutes from './routes/maintenance.route';
import expenseRoutes from './routes/expense.route';
import dashboardRoutes from './routes/dashboard.route';
import userRoutes from './routes/user.route';
import routeRoutes from './routes/route.route';
import analyticsRoutes from './routes/analytics.route';

app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Global Error Handler
app.use(errorHandler);

export default app;
module.exports = app;
