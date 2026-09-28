import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  vehicle_id: z.number().int(),
  maintenance_type: z.string().min(1, 'Maintenance type is required'),
  service_center: z.string().optional(),
  maintenance_date: z.string().datetime().or(z.date()),
  cost: z.number().nonnegative(),
  status: z.enum(['Scheduled', 'In Progress', 'Completed']),
  description: z.string().optional(),
  remarks: z.string().optional(),
});

export const completeMaintenanceSchema = z.object({
  completion_date: z.string().datetime().or(z.date()),
  cost: z.number().nonnegative().optional(),
  remarks: z.string().optional(),
});
