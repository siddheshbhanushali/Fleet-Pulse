import { z } from 'zod';

export const vehicleSchema = z.object({
  registration_number: z.string().min(1, 'Registration number is required'),
  vehicle_name: z.string().min(1, 'Vehicle name is required'),
  model: z.string().optional(),
  manufacturer: z.string().optional(),
  manufacture_year: z.number().int().optional(),
  vehicle_type: z.string().min(1, 'Vehicle type is required'),
  max_load_capacity: z.number().positive('Max load capacity must be positive'),
  acquisition_cost: z.number().nonnegative().optional(),
  fuel_type: z.string().optional(),
  current_odometer: z.number().int().nonnegative().optional(),
  status: z.enum(['Available', 'On Trip', 'In Shop', 'Retired']),
  region: z.string().optional(),
  notes: z.string().optional(),
  purchase_date: z.string().datetime().optional().or(z.date().optional()),
});

export const updateVehicleSchema = vehicleSchema.partial();
